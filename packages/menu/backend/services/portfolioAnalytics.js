// Portfolio Analytics Service
// Aggregates analytics across multiple venues for agencies and multi-location owners
// Part of Multi-Venue Management feature (QRMENU-REQUIREMENTS.md [1])

const { Pool } = require('pg');

class PortfolioAnalyticsService {
  constructor(pool) {
    this.pool = pool || new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  /**
   * Get global portfolio statistics (all venues user has access to)
   * @param {string} userId - User ID
   * @param {object} options - Date range, filters
   * @returns {object} Aggregated KPIs
   */
  async getPortfolioStats(userId, options = {}) {
    const { start_date, end_date } = options;

    // Get all venue IDs user has access to
    const venuesQuery = `
      SELECT venue_id
      FROM venue_users
      WHERE user_id = $1 AND accepted_at IS NOT NULL
    `;
    const venuesResult = await this.pool.query(venuesQuery, [userId]);
    const venueIds = venuesResult.rows.map(r => r.venue_id);

    if (venueIds.length === 0) {
      return this._getEmptyPortfolio();
    }

    // Build date filter
    let dateFilter = '';
    const params = [venueIds];
    let paramCount = 2;

    if (start_date) {
      dateFilter += ` AND qs.scanned_at >= $${paramCount++}`;
      params.push(start_date);
    }

    if (end_date) {
      dateFilter += ` AND qs.scanned_at <= $${paramCount++}`;
      params.push(end_date);
    }

    // Aggregate QR scans across all venues
    const scansQuery = `
      SELECT
        COUNT(DISTINCT qs.id) as total_scans,
        COUNT(DISTINCT qs.ip_address) as unique_visitors,
        COUNT(DISTINCT DATE(qs.scanned_at)) as active_days,
        COUNT(DISTINCT CASE WHEN qs.scanned_at >= CURRENT_DATE THEN qs.id END) as today_scans
      FROM qr_codes qc
      JOIN qr_scans qs ON qs.qr_code_id = qc.id
      WHERE qc.restaurant_id = ANY($1)
        ${dateFilter}
    `;

    const scansResult = await this.pool.query(scansQuery, params);
    const scans = scansResult.rows[0];

    // Get venue count
    const venueCountQuery = `
      SELECT
        COUNT(*) as total_venues,
        COUNT(*) FILTER (WHERE r.is_active = true) as active_venues
      FROM restaurants r
      WHERE r.id = ANY($1)
    `;

    const venueCountResult = await this.pool.query(venueCountQuery, [venueIds]);
    const venueCounts = venueCountResult.rows[0];

    // Get QR code count
    const qrCountQuery = `
      SELECT COUNT(*) as total_qr_codes
      FROM qr_codes
      WHERE restaurant_id = ANY($1)
    `;

    const qrCountResult = await this.pool.query(qrCountQuery, [venueIds]);
    const qrCount = qrCountResult.rows[0].total_qr_codes;

    // Get menu items count
    const menuItemsQuery = `
      SELECT COUNT(*) as total_menu_items
      FROM restaurant_menu_items
      WHERE restaurant_id = ANY($1) AND is_available = true
    `;

    const menuItemsResult = await this.pool.query(menuItemsQuery, [venueIds]);
    const menuItemsCount = menuItemsResult.rows[0].total_menu_items;

    // Calculate average scans per day
    const activeDays = parseInt(scans.active_days) || 1;
    const avgScansPerDay = parseInt(scans.total_scans) / activeDays;

    // Estimate revenue potential (rough calculation)
    const avgOrderValue = 100000; // VND (~$4 USD)
    const conversionRate = 0.15; // 15% of scans result in order
    const estimatedRevenue = parseInt(scans.total_scans) * conversionRate * avgOrderValue;

    return {
      success: true,
      portfolio: {
        overview: {
          total_venues: parseInt(venueCounts.total_venues),
          active_venues: parseInt(venueCounts.active_venues),
          total_qr_codes: parseInt(qrCount),
          total_menu_items: parseInt(menuItemsCount)
        },
        scans: {
          total_scans: parseInt(scans.total_scans) || 0,
          unique_visitors: parseInt(scans.unique_visitors) || 0,
          today_scans: parseInt(scans.today_scans) || 0,
          avg_scans_per_day: Math.round(avgScansPerDay),
          active_days: parseInt(scans.active_days) || 0
        },
        revenue_estimate: {
          total_estimated_vnd: Math.round(estimatedRevenue),
          avg_order_value_vnd: avgOrderValue,
          estimated_conversion_rate: conversionRate
        }
      }
    };
  }

  /**
   * Compare venues side-by-side
   * @param {string} userId - User ID
   * @param {array} venueIds - Specific venue IDs to compare (optional, defaults to all)
   * @param {object} options - Date range
   * @returns {array} Venue comparison data
   */
  async compareVenues(userId, venueIds = null, options = {}) {
    // Get user's accessible venues
    const accessQuery = `
      SELECT venue_id
      FROM venue_users
      WHERE user_id = $1 AND accepted_at IS NOT NULL
    `;

    const accessResult = await this.pool.query(accessQuery, [userId]);
    const accessibleVenueIds = accessResult.rows.map(r => r.venue_id);

    // Filter to specific venues if provided
    let targetVenueIds = venueIds
      ? venueIds.filter(id => accessibleVenueIds.includes(id))
      : accessibleVenueIds;

    if (targetVenueIds.length === 0) {
      return [];
    }

    // Build date filter
    const { start_date, end_date } = options;
    let dateFilter = '';
    const params = [targetVenueIds];
    let paramCount = 2;

    if (start_date) {
      dateFilter += ` AND qs.scanned_at >= $${paramCount++}`;
      params.push(start_date);
    }

    if (end_date) {
      dateFilter += ` AND qs.scanned_at <= $${paramCount++}`;
      params.push(end_date);
    }

    // Get comparison data
    const query = `
      SELECT
        r.id,
        r.name,
        r.slug,
        r.city,
        r.cuisine_type,
        r.is_active,
        vu.role,
        COUNT(DISTINCT qc.id) as qr_count,
        COUNT(DISTINCT qs.id) as total_scans,
        COUNT(DISTINCT qs.ip_address) as unique_visitors,
        COUNT(DISTINCT CASE WHEN qs.scanned_at >= CURRENT_DATE THEN qs.id END) as today_scans,
        COUNT(DISTINCT rmi.id) as menu_items_count,
        MAX(qs.scanned_at) as last_scan_at
      FROM restaurants r
      JOIN venue_users vu ON vu.venue_id = r.id AND vu.user_id = $1
      LEFT JOIN qr_codes qc ON qc.restaurant_id = r.id
      LEFT JOIN qr_scans qs ON qs.qr_code_id = qc.id ${dateFilter}
      LEFT JOIN restaurant_menu_items rmi ON rmi.restaurant_id = r.id AND rmi.is_available = true
      WHERE r.id = ANY($2)
      GROUP BY r.id, r.name, r.slug, r.city, r.cuisine_type, r.is_active, vu.role
      ORDER BY total_scans DESC, r.name ASC
    `;

    // Re-insert userId as first param
    const compareParams = [userId, ...params];
    const result = await this.pool.query(query, compareParams);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      city: row.city,
      cuisine_type: row.cuisine_type,
      is_active: row.is_active,
      user_role: row.role,
      metrics: {
        qr_count: parseInt(row.qr_count) || 0,
        total_scans: parseInt(row.total_scans) || 0,
        unique_visitors: parseInt(row.unique_visitors) || 0,
        today_scans: parseInt(row.today_scans) || 0,
        menu_items_count: parseInt(row.menu_items_count) || 0,
        last_scan_at: row.last_scan_at
      }
    }));
  }

  /**
   * Get top performing venues
   * @param {string} userId - User ID
   * @param {number} limit - Number of top venues to return
   * @param {object} options - Date range, metric to sort by
   * @returns {array} Top venues
   */
  async getTopVenues(userId, limit = 5, options = {}) {
    const { start_date, end_date, sort_by = 'scans' } = options;

    const comparison = await this.compareVenues(userId, null, { start_date, end_date });

    // Sort by specified metric
    let sortedVenues;
    switch (sort_by) {
      case 'scans':
        sortedVenues = comparison.sort((a, b) => b.metrics.total_scans - a.metrics.total_scans);
        break;
      case 'unique_visitors':
        sortedVenues = comparison.sort((a, b) => b.metrics.unique_visitors - a.metrics.unique_visitors);
        break;
      case 'menu_items':
        sortedVenues = comparison.sort((a, b) => b.metrics.menu_items_count - a.metrics.menu_items_count);
        break;
      default:
        sortedVenues = comparison.sort((a, b) => b.metrics.total_scans - a.metrics.total_scans);
    }

    return sortedVenues.slice(0, limit);
  }

  /**
   * Get geographic distribution of scans across portfolio
   * @param {string} userId - User ID
   * @param {object} options - Date range
   * @returns {object} Geographic breakdown
   */
  async getGeographicDistribution(userId, options = {}) {
    // Get accessible venues
    const venuesQuery = `
      SELECT venue_id
      FROM venue_users
      WHERE user_id = $1 AND accepted_at IS NOT NULL
    `;
    const venuesResult = await this.pool.query(venuesQuery, [userId]);
    const venueIds = venuesResult.rows.map(r => r.venue_id);

    if (venueIds.length === 0) {
      return { countries: [], cities: [] };
    }

    // Build date filter
    const { start_date, end_date } = options;
    let dateFilter = '';
    const params = [venueIds];
    let paramCount = 2;

    if (start_date) {
      dateFilter += ` AND qs.scanned_at >= $${paramCount++}`;
      params.push(start_date);
    }

    if (end_date) {
      dateFilter += ` AND qs.scanned_at <= $${paramCount++}`;
      params.push(end_date);
    }

    // Country distribution
    const countryQuery = `
      SELECT
        qs.country,
        COUNT(*) as scan_count,
        COUNT(DISTINCT qs.ip_address) as unique_visitors,
        ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage
      FROM qr_scans qs
      JOIN qr_codes qc ON qc.id = qs.qr_code_id
      WHERE qc.restaurant_id = ANY($1) ${dateFilter}
        AND qs.country IS NOT NULL
      GROUP BY qs.country
      ORDER BY scan_count DESC
      LIMIT 10
    `;

    const countryResult = await this.pool.query(countryQuery, params);

    // City distribution
    const cityQuery = `
      SELECT
        qs.city,
        qs.country,
        COUNT(*) as scan_count,
        ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage
      FROM qr_scans qs
      JOIN qr_codes qc ON qc.id = qs.qr_code_id
      WHERE qc.restaurant_id = ANY($1) ${dateFilter}
        AND qs.city IS NOT NULL
      GROUP BY qs.city, qs.country
      ORDER BY scan_count DESC
      LIMIT 10
    `;

    const cityResult = await this.pool.query(cityQuery, params);

    return {
      countries: countryResult.rows.map(row => ({
        country: row.country,
        scan_count: parseInt(row.scan_count),
        unique_visitors: parseInt(row.unique_visitors),
        percentage: parseFloat(row.percentage)
      })),
      cities: cityResult.rows.map(row => ({
        city: row.city,
        country: row.country,
        scan_count: parseInt(row.scan_count),
        percentage: parseFloat(row.percentage)
      }))
    };
  }

  /**
   * Get empty portfolio structure (for new users)
   * @private
   */
  _getEmptyPortfolio() {
    return {
      success: true,
      portfolio: {
        overview: {
          total_venues: 0,
          active_venues: 0,
          total_qr_codes: 0,
          total_menu_items: 0
        },
        scans: {
          total_scans: 0,
          unique_visitors: 0,
          today_scans: 0,
          avg_scans_per_day: 0,
          active_days: 0
        },
        revenue_estimate: {
          total_estimated_vnd: 0,
          avg_order_value_vnd: 100000,
          estimated_conversion_rate: 0.15
        }
      }
    };
  }
}

module.exports = PortfolioAnalyticsService;
