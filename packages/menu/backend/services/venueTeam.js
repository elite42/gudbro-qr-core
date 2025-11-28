// Venue Team Management Service
// Handles team invitations, role management, and access control
// Part of Multi-Venue Management feature (QRMENU-REQUIREMENTS.md [1])

const { Pool } = require('pg');
const crypto = require('crypto');

class VenueTeamService {
  constructor(pool, emailService = null) {
    this.pool = pool || new Pool({
      connectionString: process.env.DATABASE_URL
    });
    this.emailService = emailService; // Optional email service for sending invites
  }

  /**
   * Invite team member to venue
   * @param {string} venueId - Venue ID
   * @param {string} inviterUserId - User sending invite (must be owner)
   * @param {string} inviteeEmail - Email of person to invite
   * @param {string} role - Role to assign ('manager', 'editor', 'viewer')
   * @returns {object} Invitation details
   */
  async inviteTeamMember(venueId, inviterUserId, inviteeEmail, role) {
    // Validate role
    const validRoles = ['manager', 'editor', 'viewer'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if inviter has owner permission
    const hasPermission = await this._checkPermission(inviterUserId, venueId, 'owner');
    if (!hasPermission) {
      throw new Error('Only venue owners can invite team members');
    }

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Check if invitee user exists
      const userQuery = `SELECT id, name, email FROM users WHERE email = $1`;
      const userResult = await client.query(userQuery, [inviteeEmail]);

      let inviteeUserId;
      let isNewUser = false;

      if (userResult.rows.length === 0) {
        // User doesn't exist yet - they'll need to create account
        // For now, we'll create a pending invite record without user_id
        // When they sign up with this email, we'll link the invite
        inviteeUserId = null;
        isNewUser = true;
      } else {
        inviteeUserId = userResult.rows[0].id;

        // Check if already has access (active or pending)
        const existingQuery = `
          SELECT role, accepted_at
          FROM venue_users
          WHERE user_id = $1 AND venue_id = $2
        `;
        const existingResult = await client.query(existingQuery, [inviteeUserId, venueId]);

        if (existingResult.rows.length > 0) {
          const existing = existingResult.rows[0];
          if (existing.accepted_at) {
            throw new Error(`User already has ${existing.role} access to this venue`);
          } else {
            throw new Error('User already has a pending invitation to this venue');
          }
        }
      }

      // Get venue info
      const venueQuery = `SELECT name FROM restaurants WHERE id = $1`;
      const venueResult = await client.query(venueQuery, [venueId]);
      const venueName = venueResult.rows[0]?.name || 'Unknown Venue';

      // Create invitation
      const inviteQuery = `
        INSERT INTO venue_users (user_id, venue_id, role, invited_by, invited_at, accepted_at)
        VALUES ($1, $2, $3, $4, NOW(), NULL)
        RETURNING *
      `;

      const inviteResult = await client.query(inviteQuery, [
        inviteeUserId, // Will be NULL if user doesn't exist yet
        venueId,
        role,
        inviterUserId
      ]);

      const invitation = inviteResult.rows[0];

      // Get inviter info for email
      const inviterQuery = `SELECT name, email FROM users WHERE id = $1`;
      const inviterResult = await client.query(inviterQuery, [inviterUserId]);
      const inviter = inviterResult.rows[0];

      await client.query('COMMIT');

      // Send invitation email (if email service configured)
      if (this.emailService) {
        const inviteLink = isNewUser
          ? `${process.env.FRONTEND_URL}/signup?invite=${invitation.id}`
          : `${process.env.FRONTEND_URL}/invites/${invitation.id}`;

        await this.emailService.sendTeamInvite({
          to: inviteeEmail,
          inviterName: inviter.name,
          venueName,
          role,
          inviteLink,
          isNewUser
        });
      }

      return {
        success: true,
        message: `Invitation sent to ${inviteeEmail}`,
        invitation: {
          id: invitation.id,
          email: inviteeEmail,
          role: invitation.role,
          status: 'pending',
          invited_by: inviter.name,
          invited_at: invitation.invited_at,
          is_new_user: isNewUser
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get team members for venue
   * @param {string} venueId - Venue ID
   * @param {string} userId - User requesting list (must have access)
   * @returns {array} List of team members
   */
  async getTeamMembers(venueId, userId) {
    // Check if user has access to venue
    const hasAccess = await this._checkPermission(userId, venueId, 'viewer');
    if (!hasAccess) {
      throw new Error('You do not have access to this venue');
    }

    const query = `
      SELECT
        vu.id,
        vu.user_id,
        u.name,
        u.email,
        vu.role,
        vu.invited_at,
        vu.accepted_at,
        inviter.name as invited_by_name
      FROM venue_users vu
      LEFT JOIN users u ON u.id = vu.user_id
      LEFT JOIN users inviter ON inviter.id = vu.invited_by
      WHERE vu.venue_id = $1
      ORDER BY
        CASE vu.role
          WHEN 'owner' THEN 1
          WHEN 'manager' THEN 2
          WHEN 'editor' THEN 3
          WHEN 'viewer' THEN 4
        END,
        vu.accepted_at DESC NULLS LAST
    `;

    const result = await this.pool.query(query, [venueId]);

    return result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      status: row.accepted_at ? 'active' : 'pending',
      invited_by: row.invited_by_name,
      invited_at: row.invited_at,
      accepted_at: row.accepted_at
    }));
  }

  /**
   * Update team member role
   * @param {string} venueId - Venue ID
   * @param {string} requestingUserId - User making the change (must be owner)
   * @param {string} targetUserId - User whose role is being changed
   * @param {string} newRole - New role to assign
   * @returns {object} Success message
   */
  async updateMemberRole(venueId, requestingUserId, targetUserId, newRole) {
    // Validate role
    const validRoles = ['manager', 'editor', 'viewer'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if requesting user is owner
    const hasPermission = await this._checkPermission(requestingUserId, venueId, 'owner');
    if (!hasPermission) {
      throw new Error('Only venue owners can change team member roles');
    }

    // Cannot change owner role
    const targetRoleQuery = `
      SELECT role FROM venue_users
      WHERE user_id = $1 AND venue_id = $2 AND accepted_at IS NOT NULL
    `;
    const targetRoleResult = await this.pool.query(targetRoleQuery, [targetUserId, venueId]);

    if (targetRoleResult.rows.length === 0) {
      throw new Error('Team member not found');
    }

    if (targetRoleResult.rows[0].role === 'owner') {
      throw new Error('Cannot change owner role. Transfer ownership instead.');
    }

    // Update role
    const updateQuery = `
      UPDATE venue_users
      SET role = $1
      WHERE user_id = $2 AND venue_id = $3
      RETURNING *
    `;

    const result = await this.pool.query(updateQuery, [newRole, targetUserId, venueId]);

    return {
      success: true,
      message: `Role updated to ${newRole}`,
      member: {
        user_id: result.rows[0].user_id,
        role: result.rows[0].role
      }
    };
  }

  /**
   * Remove team member from venue
   * @param {string} venueId - Venue ID
   * @param {string} requestingUserId - User making the change (must be owner)
   * @param {string} targetUserId - User to remove
   * @returns {object} Success message
   */
  async removeTeamMember(venueId, requestingUserId, targetUserId) {
    // Check if requesting user is owner
    const hasPermission = await this._checkPermission(requestingUserId, venueId, 'owner');
    if (!hasPermission) {
      throw new Error('Only venue owners can remove team members');
    }

    // Cannot remove owner
    const targetRoleQuery = `
      SELECT role FROM venue_users
      WHERE user_id = $1 AND venue_id = $2
    `;
    const targetRoleResult = await this.pool.query(targetRoleQuery, [targetUserId, venueId]);

    if (targetRoleResult.rows.length === 0) {
      throw new Error('Team member not found');
    }

    if (targetRoleResult.rows[0].role === 'owner') {
      throw new Error('Cannot remove venue owner');
    }

    // Delete venue_users entry
    const deleteQuery = `
      DELETE FROM venue_users
      WHERE user_id = $1 AND venue_id = $2
      RETURNING *
    `;

    await this.pool.query(deleteQuery, [targetUserId, venueId]);

    return {
      success: true,
      message: 'Team member removed successfully'
    };
  }

  /**
   * Accept team invitation
   * @param {string} userId - User accepting invite
   * @param {string} invitationId - Invitation ID
   * @returns {object} Success message with venue info
   */
  async acceptInvitation(userId, invitationId) {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Get invitation
      const inviteQuery = `
        SELECT vu.*, r.name as venue_name
        FROM venue_users vu
        JOIN restaurants r ON r.id = vu.venue_id
        WHERE vu.id = $1
      `;

      const inviteResult = await client.query(inviteQuery, [invitationId]);

      if (inviteResult.rows.length === 0) {
        throw new Error('Invitation not found');
      }

      const invite = inviteResult.rows[0];

      // Check if already accepted
      if (invite.accepted_at) {
        throw new Error('Invitation already accepted');
      }

      // If invite has no user_id (was sent to email before account created),
      // update it with the user who signed up with that email
      const updateQuery = invite.user_id
        ? `UPDATE venue_users SET accepted_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`
        : `UPDATE venue_users SET user_id = $2, accepted_at = NOW() WHERE id = $1 RETURNING *`;

      const result = await client.query(updateQuery, [invitationId, userId]);

      if (result.rows.length === 0) {
        throw new Error('Invitation does not belong to this user');
      }

      await client.query('COMMIT');

      return {
        success: true,
        message: `You now have ${invite.role} access to ${invite.venue_name}`,
        venue: {
          id: invite.venue_id,
          name: invite.venue_name,
          role: invite.role
        }
      };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get pending invitations for user
   * @param {string} userId - User ID
   * @returns {array} List of pending invites
   */
  async getPendingInvitations(userId) {
    const query = `
      SELECT
        vu.id,
        vu.venue_id,
        r.name as venue_name,
        vu.role,
        vu.invited_at,
        inviter.name as invited_by_name
      FROM venue_users vu
      JOIN restaurants r ON r.id = vu.venue_id
      JOIN users inviter ON inviter.id = vu.invited_by
      WHERE vu.user_id = $1 AND vu.accepted_at IS NULL
      ORDER BY vu.invited_at DESC
    `;

    const result = await this.pool.query(query, [userId]);

    return result.rows.map(row => ({
      id: row.id,
      venue_id: row.venue_id,
      venue_name: row.venue_name,
      role: row.role,
      invited_by: row.invited_by_name,
      invited_at: row.invited_at
    }));
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
}

module.exports = VenueTeamService;
