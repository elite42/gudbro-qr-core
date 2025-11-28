// Venue Team Management API Routes
// REST endpoints for team invitations and role management
// Part of Multi-Venue Management feature (QRMENU-REQUIREMENTS.md [1])

const express = require('express');
const router = express.Router();
const VenueTeamService = require('../services/venueTeam');
const { requireVenueOwner, requireVenueViewer } = require('../middleware/permissions');

// Initialize service (email service can be injected later)
const teamService = new VenueTeamService();

/**
 * @route   POST /api/venues/:venueId/team/invite
 * @desc    Invite team member to venue
 * @access  Venue owners only
 * @params  venueId - Venue ID
 * @body    { email, role } - Invitee email and role (manager/editor/viewer)
 */
router.post('/:venueId/team/invite', requireVenueOwner, async (req, res) => {
  try {
    const venueId = req.params.venueId;
    const inviterUserId = req.user?.id;
    const { email, role } = req.body;

    // Validation
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email and role are required'
      });
    }

    if (!['manager', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be manager, editor, or viewer'
      });
    }

    const result = await teamService.inviteTeamMember(venueId, inviterUserId, email, role);

    return res.status(201).json(result);

  } catch (error) {
    console.error('Invite team member error:', error);

    if (error.message.includes('already has')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('permission') || error.message.includes('owner')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to send invitation'
    });
  }
});

/**
 * @route   GET /api/venues/:venueId/team
 * @desc    Get team members for venue
 * @access  Authenticated users with venue access (viewer+)
 * @params  venueId - Venue ID
 */
router.get('/:venueId/team', requireVenueViewer, async (req, res) => {
  try {
    const venueId = req.params.venueId;
    const userId = req.user?.id;

    const members = await teamService.getTeamMembers(venueId, userId);

    return res.json({
      success: true,
      count: members.length,
      members
    });

  } catch (error) {
    console.error('Get team members error:', error);

    if (error.message.includes('no access')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch team members'
    });
  }
});

/**
 * @route   PATCH /api/venues/:venueId/team/:userId
 * @desc    Update team member role
 * @access  Venue owners only
 * @params  venueId - Venue ID, userId - Team member user ID
 * @body    { role } - New role
 */
router.patch('/:venueId/team/:userId', requireVenueOwner, async (req, res) => {
  try {
    const venueId = req.params.venueId;
    const requestingUserId = req.user?.id;
    const targetUserId = req.params.userId;
    const { role } = req.body;

    // Validation
    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    if (!['manager', 'editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be manager, editor, or viewer'
      });
    }

    const result = await teamService.updateMemberRole(venueId, requestingUserId, targetUserId, role);

    return res.json(result);

  } catch (error) {
    console.error('Update member role error:', error);

    if (error.message.includes('permission') || error.message.includes('owner')) {
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
      error: 'Failed to update member role'
    });
  }
});

/**
 * @route   DELETE /api/venues/:venueId/team/:userId
 * @desc    Remove team member from venue
 * @access  Venue owners only
 * @params  venueId - Venue ID, userId - Team member user ID
 */
router.delete('/:venueId/team/:userId', requireVenueOwner, async (req, res) => {
  try {
    const venueId = req.params.venueId;
    const requestingUserId = req.user?.id;
    const targetUserId = req.params.userId;

    const result = await teamService.removeTeamMember(venueId, requestingUserId, targetUserId);

    return res.json(result);

  } catch (error) {
    console.error('Remove team member error:', error);

    if (error.message.includes('permission') || error.message.includes('owner')) {
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
      error: 'Failed to remove team member'
    });
  }
});

/**
 * @route   POST /api/invites/:invitationId/accept
 * @desc    Accept team invitation
 * @access  Authenticated users
 * @params  invitationId - Invitation ID
 */
router.post('/invites/:invitationId/accept', async (req, res) => {
  try {
    const userId = req.user?.id;
    const invitationId = req.params.invitationId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const result = await teamService.acceptInvitation(userId, invitationId);

    return res.json(result);

  } catch (error) {
    console.error('Accept invitation error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('already accepted')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('does not belong')) {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to accept invitation'
    });
  }
});

/**
 * @route   GET /api/invites/pending
 * @desc    Get pending invitations for authenticated user
 * @access  Authenticated users
 */
router.get('/invites/pending', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const invitations = await teamService.getPendingInvitations(userId);

    return res.json({
      success: true,
      count: invitations.length,
      invitations
    });

  } catch (error) {
    console.error('Get pending invitations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch invitations'
    });
  }
});

module.exports = router;
