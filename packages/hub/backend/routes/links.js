// Module 9: Links Routes - Manage Hub Links

import express from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateUser } from '../../middleware/auth.js';
import * as LinkService from '../services/link-service.js';
// import * as QRService from '../../module-1-qr-engine/services/qr-service.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.use(authenticateUser);

// CREATE: Add link to hub
router.post('/api/hub/:hubId/links', [
  param('hubId').isUUID(),
  body('type').isIn(['url', 'qr', 'email', 'phone', 'social', 'payment', 'file']),
  body('label').trim().isLength({ min: 1, max: 200 }),
  body('url').trim().notEmpty(),
  body('icon').optional().trim(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('background_color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('button_style').optional().isIn(['solid', 'outline', 'minimal']),
  body('display_order').optional().isInt(),
  body('is_featured').optional().isBoolean(),
  body('generate_qr').optional().isBoolean(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { hubId } = req.params;
    const linkData = req.body;
    
    // Verify hub ownership
    const hasAccess = await LinkService.verifyHubAccess(hubId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Generate QR if requested
    let qrCodeId = null;
    if (linkData.generate_qr) {
      const qr = await QRService.createQR({
        user_id: userId,
        destination_url: linkData.url,
        title: linkData.label,
        type: 'dynamic'
      });
      qrCodeId = qr.id;
    }
    
    // Create link
    const link = await LinkService.createLink(hubId, {
      ...linkData,
      qr_code_id: qrCodeId
    });
    
    res.status(201).json(link);
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// READ: Get hub links
router.get('/api/hub/:hubId/links', [
  param('hubId').isUUID(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { hubId } = req.params;
    
    const hasAccess = await LinkService.verifyHubAccess(hubId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const links = await LinkService.getHubLinks(hubId);
    
    res.json({ links });
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// UPDATE: Edit link
router.patch('/api/hub/:hubId/links/:linkId', [
  param('hubId').isUUID(),
  param('linkId').isUUID(),
  body('label').optional().trim().isLength({ min: 1, max: 200 }),
  body('url').optional().trim().notEmpty(),
  body('icon').optional().trim(),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('background_color').optional().matches(/^#[0-9A-F]{6}$/i),
  body('button_style').optional().isIn(['solid', 'outline', 'minimal']),
  body('display_order').optional().isInt(),
  body('is_active').optional().isBoolean(),
  body('is_featured').optional().isBoolean(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { hubId, linkId } = req.params;
    const updates = req.body;
    
    const hasAccess = await LinkService.verifyHubAccess(hubId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const link = await LinkService.updateLink(linkId, hubId, updates);
    
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    res.json(link);
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// DELETE: Remove link
router.delete('/api/hub/:hubId/links/:linkId', [
  param('hubId').isUUID(),
  param('linkId').isUUID(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { hubId, linkId } = req.params;
    
    const hasAccess = await LinkService.verifyHubAccess(hubId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await LinkService.deleteLink(linkId, hubId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

// REORDER: Update link order
router.post('/api/hub/:hubId/links/reorder', [
  param('hubId').isUUID(),
  body('link_ids').isArray(),
  body('link_ids.*').isUUID(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { hubId } = req.params;
    const { link_ids } = req.body;
    
    const hasAccess = await LinkService.verifyHubAccess(hubId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await LinkService.reorderLinks(hubId, link_ids);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Reorder links error:', error);
    res.status(500).json({ error: 'Failed to reorder links' });
  }
});

// TRACK: Link click (public endpoint)
router.post('/:shortCode/link/:linkId/click', [
  param('shortCode').isAlphanumeric(),
  param('linkId').isUUID(),
  validate
], async (req, res) => {
  try {
    const { shortCode, linkId } = req.params;
    
    // Track click (async)
    LinkService.trackLinkClick(linkId, shortCode, req).catch(console.error);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// ANALYTICS: Link stats
router.get('/api/hub/:hubId/links/:linkId/analytics', [
  param('hubId').isUUID(),
  param('linkId').isUUID(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { hubId, linkId } = req.params;
    
    const hasAccess = await LinkService.verifyHubAccess(hubId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const stats = await LinkService.getLinkAnalytics(linkId, hubId);
    
    res.json(stats);
  } catch (error) {
    console.error('Link analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// BULK CREATE: Add multiple links at once
router.post('/api/hub/:hubId/links/bulk', [
  param('hubId').isUUID(),
  body('links').isArray(),
  body('links.*.type').isIn(['url', 'qr', 'email', 'phone', 'social', 'payment', 'file']),
  body('links.*.label').trim().isLength({ min: 1, max: 200 }),
  body('links.*.url').trim().notEmpty(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { hubId } = req.params;
    const { links } = req.body;
    
    const hasAccess = await LinkService.verifyHubAccess(hubId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const createdLinks = await LinkService.createBulkLinks(hubId, links);
    
    res.status(201).json({ links: createdLinks });
  } catch (error) {
    console.error('Bulk create error:', error);
    res.status(500).json({ error: 'Failed to create links' });
  }
});

export default router;
