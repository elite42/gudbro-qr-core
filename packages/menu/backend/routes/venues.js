// Venue Management API Routes
// REST endpoints for multi-venue operations
// Part of Multi-Venue Management feature (QRMENU-REQUIREMENTS.md [1])

const express = require('express');
const router = express.Router();
const VenueManagementService = require('../services/venues');
const { requireVenueOwner, requireVenueEditor, requireVenueViewer } = require('../middleware/permissions');

// Initialize service
const venueService = new VenueManagementService();

/**
 * @route   POST /api/venues
 * @desc    Create new venue
 * @access  Authenticated users
 * @body    { name, slug?, description?, phone?, email?, address?, city?, country?, cuisine_type?, ... }
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await venueService.createVenue(userId, req.body);

    return res.status(201).json(result);

  } catch (error) {
    console.error('Create venue error:', error);

    if (error.message.includes('Slug')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create venue'
    });
  }
});

/**
 * @route   GET /api/venues
 * @desc    Get user's portfolio (all accessible venues)
 * @access  Authenticated users
 * @query   city?, cuisine_type?, is_active?, search?, limit?, offset?
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const filters = {
      city: req.query.city,
      cuisine_type: req.query.cuisine_type,
      is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
      search: req.query.search,
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0
    };

    const venues = await venueService.getVenuesByUser(userId, filters);

    return res.json({
      success: true,
      count: venues.length,
      venues
    });

  } catch (error) {
    console.error('Get venues error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch venues'
    });
  }
});

/**
 * @route   GET /api/venues/:id
 * @desc    Get single venue details
 * @access  Authenticated users with venue access (viewer+)
 * @params  id - Venue ID
 */
router.get('/:id', requireVenueViewer, async (req, res) => {
  try {
    const userId = req.user?.id;
    const venueId = req.params.id;

    const venue = await venueService.getVenueById(venueId, userId);

    return res.json({
      success: true,
      venue
    });

  } catch (error) {
    console.error('Get venue error:', error);

    if (error.message.includes('not found') || error.message.includes('no access')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch venue'
    });
  }
});

/**
 * @route   PATCH /api/venues/:id
 * @desc    Update venue
 * @access  Authenticated users with manager+ role
 * @params  id - Venue ID
 * @body    Fields to update
 */
router.patch('/:id', requireVenueEditor, async (req, res) => {
  try {
    const userId = req.user?.id;
    const venueId = req.params.id;

    const result = await venueService.updateVenue(venueId, userId, req.body);

    return res.json(result);

  } catch (error) {
    console.error('Update venue error:', error);

    if (error.message.includes('permission')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('No valid fields')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to update venue'
    });
  }
});

/**
 * @route   DELETE /api/venues/:id
 * @desc    Soft delete (archive) venue
 * @access  Authenticated users with owner role only
 * @params  id - Venue ID
 */
router.delete('/:id', requireVenueOwner, async (req, res) => {
  try {
    const userId = req.user?.id;
    const venueId = req.params.id;

    const result = await venueService.deleteVenue(venueId, userId);

    return res.json(result);

  } catch (error) {
    console.error('Delete venue error:', error);

    if (error.message.includes('permission')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to delete venue'
    });
  }
});

/**
 * @route   POST /api/venues/:id/duplicate
 * @desc    Duplicate venue (clone venue + menu items)
 * @access  Authenticated users with manager+ role
 * @params  id - Source venue ID
 * @body    { name?, ... } - Optional overrides for new venue
 */
router.post('/:id/duplicate', requireVenueEditor, async (req, res) => {
  try {
    const userId = req.user?.id;
    const venueId = req.params.id;

    const result = await venueService.duplicateVenue(venueId, userId, req.body);

    return res.status(201).json(result);

  } catch (error) {
    console.error('Duplicate venue error:', error);

    if (error.message.includes('permission')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to duplicate venue'
    });
  }
});

module.exports = router;
