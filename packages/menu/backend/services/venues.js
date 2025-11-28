// Venue Management Service
// Handles multi-venue operations: create, read, update, delete, duplicate
// Part of Multi-Venue Management feature (QRMENU-REQUIREMENTS.md [1])

const { Pool } = require('pg');
const crypto = require('crypto');

class VenueManagementService {
  constructor(pool) {
    this.pool = pool || new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  /**
   * Create a new venue
   * @param {string} userId - User creating the venue
   * @param {object} venueData - Venue information
   * @returns {object} Created venue with ID
   */
  async createVenue(userId, venueData) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const {
        name,
        slug,
        description,
        phone,
        email,
        website,
        address,
        city,
        country = 'VN',
        latitude,
        longitude,
        cuisine_type,
        business_hours,
        average_price_vnd,
        logo_url,
        cover_image_url
      } = venueData;

      // Generate slug if not provided
      const finalSlug = slug || this._generateSlug(name);

      // Insert restaurant
      const restaurantQuery = `
        INSERT INTO restaurants (
          user_id, name, slug, description, phone, email, website,
          address, city, country, latitude, longitude,
          cuisine_type, business_hours, average_price_vnd,
          logo_url, cover_image_url, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true)
        RETURNING *
      `;

      const restaurantResult = await client.query(restaurantQuery, [
        userId, name, finalSlug, description, phone, email, website,
        address, city, country, latitude, longitude,
        cuisine_type, business_hours ? JSON.stringify(business_hours) : null, average_price_vnd,
        logo_url, cover_image_url
      ]);

      const venue = restaurantResult.rows[0];

      // Create venue_users entry (owner role)
      const venueUserQuery = `
        INSERT INTO venue_users (user_id, venue_id, role, invited_by, accepted_at)
        VALUES ($1, $2, 'owner', $1, NOW())
        RETURNING *
      `;

      await client.query(venueUserQuery, [userId, venue.id]);

      await client.query('COMMIT');

      return {
        success: true,
        venue: this._formatVenue(venue)
      };

    } catch (error) {
      await client.query('ROLLBACK');

      // Handle duplicate slug
      if (error.code === '23505' && error.constraint === 'restaurants_slug_key') {
        throw new Error(`Slug "${venueData.slug}" is already taken. Please choose another.`);
      }

      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get all venues accessible by user (portfolio view)
   * @param {string} userId - User ID
   * @param {object} filters - Optional filters (city, type, active, search)
   * @returns {array} List of venues with user's role
   */
  async getVenuesByUser(userId, filters = {}) {
    const { city, cuisine_type, is_active, search, limit = 100, offset = 0 } = filters;

    const conditions = ['vu.user_id = $1', 'vu.accepted_at IS NOT NULL'];
    const params = [userId];
    let paramCount = 2;

    if (city) {
      conditions.push(`r.city ILIKE $${paramCount++}`);
      params.push(`%${city}%`);
    }

    if (cuisine_type) {
      conditions.push(`r.cuisine_type = $${paramCount++}`);
      params.push(cuisine_type);
    }

    if (typeof is_active === 'boolean') {
      conditions.push(`r.is_active = $${paramCount++}`);
      params.push(is_active);
    }

    if (search) {
      conditions.push(`(r.name ILIKE $${paramCount} OR r.description ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const query = `
      SELECT
        r.*,
        vu.role,
        vu.invited_by,
        vu.accepted_at,
        (SELECT COUNT(*) FROM qr_codes WHERE restaurant_id = r.id) as qr_count,
        (SELECT COALESCE(SUM(total_scans), 0) FROM qr_codes WHERE restaurant_id = r.id) as total_scans,
        (SELECT COUNT(*) FROM restaurant_menu_items WHERE restaurant_id = r.id AND is_available = true) as menu_items_count
      FROM restaurants r
      JOIN venue_users vu ON vu.venue_id = r.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY r.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    params.push(limit, offset);

    const result = await this.pool.query(query, params);

    return result.rows.map(row => this._formatVenueWithRole(row));
  }

  /**
   * Get single venue by ID (with permission check)
   * @param {string} venueId - Venue ID
   * @param {string} userId - User requesting access
   * @returns {object} Venue details
   */
  async getVenueById(venueId, userId) {
    const query = `
      SELECT
        r.*,
        vu.role,
        vu.invited_by,
        vu.accepted_at,
        (SELECT COUNT(*) FROM qr_codes WHERE restaurant_id = r.id) as qr_count,
        (SELECT COALESCE(SUM(total_scans), 0) FROM qr_codes WHERE restaurant_id = r.id) as total_scans,
        (SELECT COUNT(*) FROM restaurant_menu_items WHERE restaurant_id = r.id) as menu_items_count
      FROM restaurants r
      JOIN venue_users vu ON vu.venue_id = r.id
      WHERE r.id = $1 AND vu.user_id = $2 AND vu.accepted_at IS NOT NULL
    `;

    const result = await this.pool.query(query, [venueId, userId]);

    if (result.rows.length === 0) {
      throw new Error('Venue not found or you do not have access');
    }

    return this._formatVenueWithRole(result.rows[0]);
  }

  /**
   * Update venue (requires owner or manager role)
   * @param {string} venueId - Venue ID
   * @param {string} userId - User making update
   * @param {object} updates - Fields to update
   * @returns {object} Updated venue
   */
  async updateVenue(venueId, userId, updates) {
    // Check permission (manager or owner can edit)
    const hasPermission = await this._checkPermission(userId, venueId, 'manager');
    if (!hasPermission) {
      throw new Error('Insufficient permissions. Manager or Owner role required.');
    }

    const allowedFields = [
      'name', 'description', 'phone', 'email', 'website',
      'address', 'city', 'country', 'latitude', 'longitude',
      'cuisine_type', 'business_hours', 'average_price_vnd',
      'logo_url', 'cover_image_url', 'is_active'
    ];

    const updateFields = [];
    const params = [venueId];
    let paramCount = 2;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramCount++}`);

        // Handle JSONB fields
        if (key === 'business_hours' && typeof value === 'object') {
          params.push(JSON.stringify(value));
        } else {
          params.push(value);
        }
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push(`updated_at = NOW()`);

    const query = `
      UPDATE restaurants
      SET ${updateFields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, params);

    return {
      success: true,
      venue: this._formatVenue(result.rows[0])
    };
  }

  /**
   * Soft delete venue (archive) - requires owner role
   * @param {string} venueId - Venue ID
   * @param {string} userId - User requesting deletion
   * @returns {object} Success message
   */
  async deleteVenue(venueId, userId) {
    // Check permission (only owner can delete)
    const hasPermission = await this._checkPermission(userId, venueId, 'owner');
    if (!hasPermission) {
      throw new Error('Insufficient permissions. Owner role required to delete venue.');
    }

    const query = `
      UPDATE restaurants
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name
    `;

    const result = await this.pool.query(query, [venueId]);

    if (result.rows.length === 0) {
      throw new Error('Venue not found');
    }

    return {
      success: true,
      message: `Venue "${result.rows[0].name}" has been archived`,
      venueId: result.rows[0].id
    };
  }

  /**
   * Duplicate venue (clone venue + menu items, NOT analytics)
   * @param {string} venueId - Source venue ID
   * @param {string} userId - User requesting duplication
   * @param {object} overrides - Optional overrides for new venue
   * @returns {object} New venue
   */
  async duplicateVenue(venueId, userId, overrides = {}) {
    // Check permission (owner or manager can duplicate)
    const hasPermission = await this._checkPermission(userId, venueId, 'manager');
    if (!hasPermission) {
      throw new Error('Insufficient permissions. Manager or Owner role required.');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get source venue
      const sourceQuery = `SELECT * FROM restaurants WHERE id = $1`;
      const sourceResult = await client.query(sourceQuery, [venueId]);

      if (sourceResult.rows.length === 0) {
        throw new Error('Source venue not found');
      }

      const source = sourceResult.rows[0];

      // Create new venue (copy data, generate new slug)
      const newName = overrides.name || `${source.name} (Copy)`;
      const newSlug = this._generateSlug(newName);

      const newVenueQuery = `
        INSERT INTO restaurants (
          user_id, name, slug, description, phone, email, website,
          address, city, country, latitude, longitude,
          cuisine_type, business_hours, average_price_vnd,
          logo_url, cover_image_url, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true)
        RETURNING *
      `;

      const newVenueResult = await client.query(newVenueQuery, [
        userId, // New owner
        newName,
        newSlug,
        source.description,
        source.phone,
        source.email,
        source.website,
        source.address,
        source.city,
        source.country,
        source.latitude,
        source.longitude,
        source.cuisine_type,
        source.business_hours,
        source.average_price_vnd,
        source.logo_url,
        source.cover_image_url
      ]);

      const newVenue = newVenueResult.rows[0];

      // Create owner access
      await client.query(
        `INSERT INTO venue_users (user_id, venue_id, role, invited_by, accepted_at)
         VALUES ($1, $2, 'owner', $1, NOW())`,
        [userId, newVenue.id]
      );

      // Copy menu items
      const menuItemsQuery = `
        INSERT INTO restaurant_menu_items (
          restaurant_id, shared_item_id, custom_price_vnd, custom_ingredients,
          custom_description_translations, enabled_modifiers, is_available,
          display_order, menu_section
        )
        SELECT
          $1 as restaurant_id, shared_item_id, custom_price_vnd, custom_ingredients,
          custom_description_translations, enabled_modifiers, is_available,
          display_order, menu_section
        FROM restaurant_menu_items
        WHERE restaurant_id = $2
      `;

      await client.query(menuItemsQuery, [newVenue.id, venueId]);

      await client.query('COMMIT');

      return {
        success: true,
        message: 'Venue duplicated successfully',
        venue: this._formatVenue(newVenue)
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Check if user has required permission for venue
   * @private
   */
  async _checkPermission(userId, venueId, requiredRole) {
    const query = `
      SELECT check_venue_permission($1, $2, $3) as has_permission
    `;

    const result = await this.pool.query(query, [userId, venueId, requiredRole]);
    return result.rows[0].has_permission;
  }

  /**
   * Generate URL-friendly slug from name
   * @private
   */
  _generateSlug(name) {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/đ/g, 'd') // Vietnamese đ
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Add random suffix to ensure uniqueness
    const suffix = crypto.randomBytes(3).toString('hex');
    return `${baseSlug}-${suffix}`;
  }

  /**
   * Format venue object (remove sensitive fields)
   * @private
   */
  _formatVenue(venue) {
    return {
      id: venue.id,
      user_id: venue.user_id,
      name: venue.name,
      slug: venue.slug,
      description: venue.description,
      phone: venue.phone,
      email: venue.email,
      website: venue.website,
      address: venue.address,
      city: venue.city,
      country: venue.country,
      latitude: venue.latitude,
      longitude: venue.longitude,
      cuisine_type: venue.cuisine_type,
      business_hours: venue.business_hours,
      average_price_vnd: venue.average_price_vnd,
      logo_url: venue.logo_url,
      cover_image_url: venue.cover_image_url,
      is_active: venue.is_active,
      created_at: venue.created_at,
      updated_at: venue.updated_at
    };
  }

  /**
   * Format venue with user role
   * @private
   */
  _formatVenueWithRole(row) {
    return {
      ...this._formatVenue(row),
      user_role: row.role,
      qr_count: parseInt(row.qr_count) || 0,
      total_scans: parseInt(row.total_scans) || 0,
      menu_items_count: parseInt(row.menu_items_count) || 0
    };
  }
}

module.exports = VenueManagementService;
