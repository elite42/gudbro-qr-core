// Portfolio Analytics API Routes
// REST endpoints for aggregated analytics across multiple venues
// Part of Multi-Venue Management feature (QRMENU-REQUIREMENTS.md [1])

const express = require('express');
const router = express.Router();
const PortfolioAnalyticsService = require('../services/portfolioAnalytics');

// Initialize service
const analyticsService = new PortfolioAnalyticsService();

/**
 * @route   GET /api/analytics/portfolio
 * @desc    Get global portfolio statistics (all venues)
 * @access  Authenticated users
 * @query   start_date?, end_date?
 */
router.get('/portfolio', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const options = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const stats = await analyticsService.getPortfolioStats(userId, options);

    return res.json(stats);

  } catch (error) {
    console.error('Get portfolio stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio statistics'
    });
  }
});

/**
 * @route   GET /api/analytics/compare
 * @desc    Compare venues side-by-side
 * @access  Authenticated users
 * @query   venue_ids? (comma-separated UUIDs), start_date?, end_date?
 */
router.get('/compare', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Parse venue IDs if provided
    const venueIds = req.query.venue_ids
      ? req.query.venue_ids.split(',').map(id => id.trim())
      : null;

    const options = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const comparison = await analyticsService.compareVenues(userId, venueIds, options);

    return res.json({
      success: true,
      count: comparison.length,
      venues: comparison
    });

  } catch (error) {
    console.error('Compare venues error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to compare venues'
    });
  }
});

/**
 * @route   GET /api/analytics/top-venues
 * @desc    Get top performing venues
 * @access  Authenticated users
 * @query   limit? (default 5), start_date?, end_date?, sort_by? (scans|unique_visitors|menu_items)
 */
router.get('/top-venues', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const limit = parseInt(req.query.limit) || 5;
    const options = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      sort_by: req.query.sort_by || 'scans'
    };

    // Validate sort_by
    if (!['scans', 'unique_visitors', 'menu_items'].includes(options.sort_by)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid sort_by parameter. Must be: scans, unique_visitors, or menu_items'
      });
    }

    const topVenues = await analyticsService.getTopVenues(userId, limit, options);

    return res.json({
      success: true,
      count: topVenues.length,
      sort_by: options.sort_by,
      venues: topVenues
    });

  } catch (error) {
    console.error('Get top venues error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch top venues'
    });
  }
});

/**
 * @route   GET /api/analytics/geographic
 * @desc    Get geographic distribution of scans across portfolio
 * @access  Authenticated users
 * @query   start_date?, end_date?
 */
router.get('/geographic', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const options = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const distribution = await analyticsService.getGeographicDistribution(userId, options);

    return res.json({
      success: true,
      ...distribution
    });

  } catch (error) {
    console.error('Get geographic distribution error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch geographic distribution'
    });
  }
});

module.exports = router;
