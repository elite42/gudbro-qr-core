// Module 9: Hub Routes - CRUD Operations

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { authenticateUser } from '../../middleware/auth.js';
import * as HubService from '../services/hub-service.js';
// import * as QRService from '../../module-1-qr-engine/services/qr-service.js';

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// PUBLIC: View hub page (no auth required)
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Get hub with links
    const hub = await HubService.getHubByShortCode(shortCode);
    
    if (!hub || !hub.is_active) {
      return res.status(404).json({ error: 'Hub not found' });
    }
    
    // Check password protection
    if (hub.password_hash) {
      const password = req.query.password || req.headers['x-hub-password'];
      if (!password || !(await HubService.verifyPassword(password, hub.password_hash))) {
        return res.status(401).json({ 
          error: 'Password required',
          passwordProtected: true 
        });
      }
    }
    
    // Track view (async, don't wait)
    HubService.trackView(hub.id, req).catch(console.error);
    
    res.json({
      hub: {
        id: hub.id,
        short_code: hub.short_code,
        title: hub.title,
        subtitle: hub.subtitle,
        description: hub.description,
        logo_url: hub.logo_url,
        cover_image_url: hub.cover_image_url,
        template: hub.template,
        theme: hub.theme_json,
        meta_title: hub.meta_title,
        meta_description: hub.meta_description
      },
      links: hub.links.map(link => ({
        id: link.id,
        type: link.type,
        icon: link.icon,
        label: link.label,
        url: link.url,
        color: link.color,
        background_color: link.background_color,
        button_style: link.button_style,
        is_featured: link.is_featured
      }))
    });
  } catch (error) {
    console.error('Get hub error:', error);
    res.status(500).json({ error: 'Failed to load hub' });
  }
});

// AUTH REQUIRED ROUTES
router.use('/api/hub', authenticateUser);

// CREATE: New hub page
router.post('/api/hub', [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('template').isIn([
    'restaurant', 'hotel', 'event', 'personal', 'retail', 'realestate',
    'healthcare', 'education', 'business', 'blank', 'fitness', 'salon',
    'automotive', 'nonprofit', 'artist', 'podcast', 'realestateagent',
    'doctor', 'lawyer', 'wedding', 'coffeeshop'
  ]),
  body('subtitle').optional().trim().isLength({ max: 500 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('logo_url').optional().isURL(),
  body('cover_image_url').optional().isURL(),
  body('theme').optional().isObject(),
  body('password').optional().isLength({ min: 4 }),
  body('custom_domain').optional().matches(/^[a-z0-9-]+\.[a-z]{2,}$/i),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const hubData = req.body;
    
    // Create hub page
    const hub = await HubService.createHub(userId, hubData);
    
    // Generate QR code for hub
//     const qrCode = await QRService.createQR({
//       user_id: userId,
//       destination_url: `${process.env.BASE_URL}/${hub.short_code}`,
//       title: `Hub: ${hub.title}`,
//       type: 'dynamic'
//     });
//     
//     // Link QR to hub
//     await HubService.linkQRToHub(hub.id, qrCode.id);
    
    res.status(201).json({
      hub
    });
  } catch (error) {
    console.error('Create hub error:', error);
    res.status(500).json({ error: 'Failed to create hub' });
  }
});

// READ: Get user's hubs
router.get('/api/hub', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('template').optional().isString(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const template = req.query.template;
    
    const result = await HubService.getUserHubs(userId, { page, limit, template });
    
    res.json(result);
  } catch (error) {
    console.error('Get hubs error:', error);
    res.status(500).json({ error: 'Failed to fetch hubs' });
  }
});

// READ: Get single hub (auth)
router.get('/api/hub/:id', [
  param('id').isUUID(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const hubId = req.params.id;
    
    const hub = await HubService.getHub(hubId, userId);
    
    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    }
    
    res.json(hub);
  } catch (error) {
    console.error('Get hub error:', error);
    res.status(500).json({ error: 'Failed to load hub' });
  }
});

// UPDATE: Hub page
router.patch('/api/hub/:id', [
  param('id').isUUID(),
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('subtitle').optional().trim().isLength({ max: 500 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('logo_url').optional().isURL(),
  body('cover_image_url').optional().isURL(),
  body('theme').optional().isObject(),
  body('is_active').optional().isBoolean(),
  body('is_public').optional().isBoolean(),
  body('password').optional().isLength({ min: 4 }),
  body('custom_domain').optional().matches(/^[a-z0-9-]+\.[a-z]{2,}$/i),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const hubId = req.params.id;
    const updates = req.body;
    
    const hub = await HubService.updateHub(hubId, userId, updates);
    
    if (!hub) {
      return res.status(404).json({ error: 'Hub not found' });
    }
    
    res.json(hub);
  } catch (error) {
    console.error('Update hub error:', error);
    res.status(500).json({ error: 'Failed to update hub' });
  }
});

// DELETE: Hub page
router.delete('/api/hub/:id', [
  param('id').isUUID(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const hubId = req.params.id;
    
    await HubService.deleteHub(hubId, userId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Delete hub error:', error);
    res.status(500).json({ error: 'Failed to delete hub' });
  }
});

// DUPLICATE: Clone hub
router.post('/api/hub/:id/duplicate', [
  param('id').isUUID(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const hubId = req.params.id;
    
    const newHub = await HubService.duplicateHub(hubId, userId);
    
    res.status(201).json(newHub);
  } catch (error) {
    console.error('Duplicate hub error:', error);
    res.status(500).json({ error: 'Failed to duplicate hub' });
  }
});

// ANALYTICS: Hub stats
router.get('/api/hub/:id/analytics', [
  param('id').isUUID(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const hubId = req.params.id;
    const { start_date, end_date } = req.query;
    
    const stats = await HubService.getHubAnalytics(hubId, userId, {
      startDate: start_date,
      endDate: end_date
    });
    
    res.json(stats);
  } catch (error) {
    console.error('Hub analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
