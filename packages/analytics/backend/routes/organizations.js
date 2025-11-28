const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Organization Management Routes
 * Week 7: Enterprise Features
 */

// ================================================================
// ORGANIZATIONS CRUD
// ================================================================

/**
 * POST /organizations
 * Create organization
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      subscription_tier = 'free',
      contact_email,
      contact_phone,
      max_qr_codes,
      max_team_members
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    // Set limits based on tier
    const tierLimits = {
      free: { qr_codes: 100, team_members: 5, api_calls: 10000 },
      pro: { qr_codes: 1000, team_members: 20, api_calls: 100000 },
      enterprise: { qr_codes: -1, team_members: -1, api_calls: -1 } // unlimited
    };

    const limits = tierLimits[subscription_tier] || tierLimits.free;

    const result = await pool.query(
      `INSERT INTO organizations (
        name, slug, description, subscription_tier,
        contact_email, contact_phone,
        max_qr_codes, max_team_members, max_api_calls_per_month
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        name,
        slug,
        description,
        subscription_tier,
        contact_email,
        contact_phone,
        max_qr_codes || limits.qr_codes,
        max_team_members || limits.team_members,
        limits.api_calls
      ]
    );

    res.status(201).json({
      success: true,
      organization: result.rows[0]
    });
  } catch (error) {
    console.error('Create organization error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Organization slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /organizations
 * List organizations
 */
router.get('/', async (req, res) => {
  try {
    const { subscription_tier, status, limit = 50 } = req.query;

    let query = 'SELECT * FROM organizations WHERE deleted_at IS NULL';
    const params = [];
    let paramIndex = 1;

    if (subscription_tier) {
      query += ` AND subscription_tier = $${paramIndex++}`;
      params.push(subscription_tier);
    }
    if (status) {
      query += ` AND subscription_status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      organizations: result.rows
    });
  } catch (error) {
    console.error('List organizations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /organizations/:id
 * Get organization details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const orgResult = await pool.query(
      'SELECT * FROM organizations WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get usage statistics
    const usageResult = await pool.query(
      'SELECT * FROM v_organization_usage WHERE organization_id = $1',
      [id]
    );

    res.json({
      success: true,
      organization: orgResult.rows[0],
      usage: usageResult.rows[0] || null
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /organizations/:id
 * Update organization
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = [];
    const params = [id];
    let paramIndex = 2;

    const allowedFields = [
      'name', 'description', 'subscription_tier', 'subscription_status',
      'contact_email', 'contact_phone', 'billing_email',
      'address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code',
      'max_qr_codes', 'max_team_members', 'max_api_calls_per_month',
      'settings'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        if (field === 'settings' && typeof value === 'object') {
          value = JSON.stringify(value);
        }

        updates.push(`${field} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const result = await pool.query(
      `UPDATE organizations SET ${updates.join(', ')} WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ success: true, organization: result.rows[0] });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /organizations/:id
 * Soft delete organization
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE organizations SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ success: true, message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// ORGANIZATION MEMBERS
// ================================================================

/**
 * POST /organizations/:id/members
 * Add member to organization
 */
router.post('/:id/members', async (req, res) => {
  try {
    const { id: organization_id } = req.params;
    const {
      user_id,
      role_id,
      invited_by,
      custom_permissions = {}
    } = req.body;

    if (!user_id || !role_id) {
      return res.status(400).json({ error: 'user_id and role_id are required' });
    }

    const result = await pool.query(
      `INSERT INTO organization_members (
        organization_id, user_id, role_id, invited_by,
        custom_permissions, status, joined_at
      ) VALUES ($1, $2, $3, $4, $5, 'active', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        organization_id,
        user_id,
        role_id,
        invited_by,
        JSON.stringify(custom_permissions)
      ]
    );

    res.status(201).json({
      success: true,
      member: result.rows[0]
    });
  } catch (error) {
    console.error('Add member error:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'User is already a member' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /organizations/:id/members
 * List organization members
 */
router.get('/:id/members', async (req, res) => {
  try {
    const { id: organization_id } = req.params;
    const { status } = req.query;

    let query = 'SELECT * FROM v_organization_members WHERE organization_id = $1';
    const params = [organization_id];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY joined_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      members: result.rows
    });
  } catch (error) {
    console.error('List members error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /organizations/:id/members/:user_id
 * Update member
 */
router.put('/:id/members/:user_id', async (req, res) => {
  try {
    const { id: organization_id, user_id } = req.params;
    const updates = [];
    const params = [organization_id, user_id];
    let paramIndex = 3;

    const allowedFields = ['role_id', 'status', 'custom_permissions'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        let value = req.body[field];

        if (field === 'custom_permissions' && typeof value === 'object') {
          value = JSON.stringify(value);
        }

        updates.push(`${field} = $${paramIndex++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const result = await pool.query(
      `UPDATE organization_members SET ${updates.join(', ')}
       WHERE organization_id = $1 AND user_id = $2
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ success: true, member: result.rows[0] });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /organizations/:id/members/:user_id
 * Remove member from organization
 */
router.delete('/:id/members/:user_id', async (req, res) => {
  try {
    const { id: organization_id, user_id } = req.params;

    const result = await pool.query(
      'DELETE FROM organization_members WHERE organization_id = $1 AND user_id = $2 RETURNING id',
      [organization_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================================================================
// ROLES & PERMISSIONS
// ================================================================

/**
 * POST /organizations/:id/roles
 * Create custom role
 */
router.post('/:id/roles', async (req, res) => {
  try {
    const { id: organization_id } = req.params;
    const {
      name,
      slug,
      description,
      permissions = {},
      hierarchy_level = 100
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }

    const result = await pool.query(
      `INSERT INTO roles (
        organization_id, name, slug, description, permissions, hierarchy_level
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        organization_id,
        name,
        slug,
        description,
        JSON.stringify(permissions),
        hierarchy_level
      ]
    );

    res.status(201).json({
      success: true,
      role: result.rows[0]
    });
  } catch (error) {
    console.error('Create role error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Role slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /organizations/:id/roles
 * List organization roles
 */
router.get('/:id/roles', async (req, res) => {
  try {
    const { id: organization_id } = req.params;

    // Include both org-specific and system roles
    const result = await pool.query(
      `SELECT * FROM roles
       WHERE organization_id = $1 OR is_system_role = TRUE
       ORDER BY hierarchy_level ASC`,
      [organization_id]
    );

    res.json({
      success: true,
      roles: result.rows
    });
  } catch (error) {
    console.error('List roles error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /organizations/:id/check-permission
 * Check if user has permission
 */
router.post('/:id/check-permission', async (req, res) => {
  try {
    const { id: organization_id } = req.params;
    const { user_id, resource, action } = req.body;

    if (!user_id || !resource || !action) {
      return res.status(400).json({
        error: 'user_id, resource, and action are required'
      });
    }

    const result = await pool.query(
      'SELECT has_permission($1, $2, $3, $4) as has_permission',
      [user_id, organization_id, resource, action]
    );

    const hasPermission = result.rows[0].has_permission;

    res.json({
      success: true,
      has_permission: hasPermission,
      user_id,
      organization_id,
      resource,
      action
    });
  } catch (error) {
    console.error('Check permission error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
