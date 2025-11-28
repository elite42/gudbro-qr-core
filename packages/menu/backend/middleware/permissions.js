// Permission Middleware
// Enforces role-based access control for multi-venue management
// Part of Multi-Venue Management feature (QRMENU-REQUIREMENTS.md [1])

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Middleware to check if user has access to venue with required role
 * Usage: checkVenueAccess('manager') - requires manager or owner
 *        checkVenueAccess('viewer') - requires any role
 */
function checkVenueAccess(requiredRole = 'viewer') {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id; // Assumes auth middleware sets req.user
      const venueId = req.params.venueId || req.params.id || req.body.venue_id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!venueId) {
        return res.status(400).json({
          success: false,
          error: 'Venue ID required'
        });
      }

      // Check permission using database function
      const query = `
        SELECT check_venue_permission($1, $2, $3) as has_permission
      `;

      const result = await pool.query(query, [userId, venueId, requiredRole]);
      const hasPermission = result.rows[0].has_permission;

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: `Insufficient permissions. ${capitalizeRole(requiredRole)} role or higher required.`,
          required_role: requiredRole
        });
      }

      // Permission granted - continue to route handler
      next();

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware to get user's role for venue and attach to req object
 * Useful for routes that need to know the user's role
 */
async function attachVenueRole(req, res, next) {
  try {
    const userId = req.user?.id;
    const venueId = req.params.venueId || req.params.id || req.body.venue_id;

    if (!userId || !venueId) {
      return next(); // Skip if missing data
    }

    const query = `
      SELECT role, accepted_at
      FROM venue_users
      WHERE user_id = $1 AND venue_id = $2 AND accepted_at IS NOT NULL
    `;

    const result = await pool.query(query, [userId, venueId]);

    if (result.rows.length > 0) {
      req.venueRole = result.rows[0].role;
      req.hasVenueAccess = true;
    } else {
      req.venueRole = null;
      req.hasVenueAccess = false;
    }

    next();

  } catch (error) {
    console.error('Attach venue role error:', error);
    next(); // Don't block request on error
  }
}

/**
 * Middleware to check if user is venue owner specifically
 * More restrictive than checkVenueAccess('owner')
 */
function requireVenueOwner(req, res, next) {
  return checkVenueAccess('owner')(req, res, next);
}

/**
 * Middleware to check if user can edit venue (manager or owner)
 */
function requireVenueEditor(req, res, next) {
  return checkVenueAccess('manager')(req, res, next);
}

/**
 * Middleware to check if user can view venue (any role)
 */
function requireVenueViewer(req, res, next) {
  return checkVenueAccess('viewer')(req, res, next);
}

/**
 * Helper function to capitalize role name for error messages
 */
function capitalizeRole(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/**
 * Get user's venues (for populating venue switcher, etc.)
 * This is a helper function, not middleware
 */
async function getUserVenues(userId) {
  const query = `
    SELECT
      r.id,
      r.name,
      r.slug,
      vu.role
    FROM restaurants r
    JOIN venue_users vu ON vu.venue_id = r.id
    WHERE vu.user_id = $1
      AND vu.accepted_at IS NOT NULL
      AND r.is_active = true
    ORDER BY r.name ASC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * Permission matrix reference
 * Used in frontend to show/hide features based on role
 */
const PERMISSION_MATRIX = {
  owner: {
    view_analytics: true,
    edit_menu: true,
    generate_qr: true,
    manage_team: true,
    delete_venue: true,
    edit_settings: true
  },
  manager: {
    view_analytics: true,
    edit_menu: true,
    generate_qr: true,
    manage_team: false,
    delete_venue: false,
    edit_settings: true
  },
  editor: {
    view_analytics: true,
    edit_menu: true,
    generate_qr: false,
    manage_team: false,
    delete_venue: false,
    edit_settings: false
  },
  viewer: {
    view_analytics: true,
    edit_menu: false,
    generate_qr: false,
    manage_team: false,
    delete_venue: false,
    edit_settings: false
  }
};

/**
 * Check if role has specific permission
 * @param {string} role - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
function hasPermission(role, permission) {
  return PERMISSION_MATRIX[role]?.[permission] || false;
}

/**
 * API endpoint to get permission matrix (for frontend)
 */
async function getPermissionMatrix(req, res) {
  return res.json({
    success: true,
    matrix: PERMISSION_MATRIX
  });
}

module.exports = {
  // Middleware functions
  checkVenueAccess,
  attachVenueRole,
  requireVenueOwner,
  requireVenueEditor,
  requireVenueViewer,

  // Helper functions
  getUserVenues,
  hasPermission,
  getPermissionMatrix,

  // Constants
  PERMISSION_MATRIX
};
