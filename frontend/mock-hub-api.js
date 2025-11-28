/**
 * Mock Hub API Server
 * Simula il backend Hub per testing UI senza database
 * Porta: 3009
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3009;

app.use(cors());
app.use(express.json());

// In-memory data store
let hubs = [
  {
    id: '1',
    user_id: '1',
    qr_code_id: 'qr1',
    short_code: 'demo-hub',
    title: 'My Demo Hub',
    subtitle: 'Welcome to my links',
    description: 'This is a demo hub with some example links',
    template: 'personal',
    theme_json: {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontFamily: 'Inter',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
    logo_url: null,
    is_active: true,
    view_count: 42,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    links: [
      {
        id: 'l1',
        hub_id: '1',
        type: 'url',
        icon: 'Globe',
        label: 'My Website',
        url: 'https://example.com',
        is_active: true,
        display_order: 0,
        click_count: 12,
      },
      {
        id: 'l2',
        hub_id: '1',
        type: 'instagram',
        icon: 'Instagram',
        label: 'Follow on Instagram',
        url: 'https://instagram.com/demo',
        is_active: true,
        display_order: 1,
        click_count: 8,
      },
    ],
  },
];

let nextHubId = 2;
let nextLinkId = 3;

// Generate random short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'hub-aggregator-mock',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// GET /api/hub - Get user's hubs
app.get('/api/hub', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  res.json({
    hubs: hubs,
    pagination: {
      page,
      limit,
      total: hubs.length,
      totalPages: Math.ceil(hubs.length / limit),
    },
  });
});

// GET /api/hub/:id - Get hub by ID
app.get('/api/hub/:id', (req, res) => {
  const hub = hubs.find(h => h.id === req.params.id);

  if (!hub) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  res.json(hub);
});

// POST /api/hub - Create new hub
app.post('/api/hub', (req, res) => {
  const { title, subtitle, description, template, theme, logo_url } = req.body;

  if (!title || !template) {
    return res.status(400).json({ error: 'Title and template are required' });
  }

  const newHub = {
    id: String(nextHubId++),
    user_id: '1',
    qr_code_id: `qr${nextHubId}`,
    short_code: generateShortCode(),
    title,
    subtitle: subtitle || null,
    description: description || null,
    template,
    theme_json: theme || {
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Inter',
      borderRadius: '8px',
      buttonStyle: 'solid',
    },
    logo_url: logo_url || null,
    is_active: true,
    view_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    links: [],
  };

  hubs.push(newHub);

  res.status(201).json({
    hub: newHub,
    qr: {
      id: newHub.qr_code_id,
      url: `http://localhost:3000/${newHub.short_code}`,
      image_url: 'data:image/png;base64,mock-qr-code',
    },
  });
});

// PATCH /api/hub/:id - Update hub
app.patch('/api/hub/:id', (req, res) => {
  const hubIndex = hubs.findIndex(h => h.id === req.params.id);

  if (hubIndex === -1) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  const { title, subtitle, description, theme, logo_url } = req.body;

  hubs[hubIndex] = {
    ...hubs[hubIndex],
    ...(title && { title }),
    ...(subtitle !== undefined && { subtitle }),
    ...(description !== undefined && { description }),
    ...(theme && { theme_json: { ...hubs[hubIndex].theme_json, ...theme } }),
    ...(logo_url !== undefined && { logo_url }),
    updated_at: new Date().toISOString(),
  };

  res.json(hubs[hubIndex]);
});

// DELETE /api/hub/:id - Delete hub
app.delete('/api/hub/:id', (req, res) => {
  const hubIndex = hubs.findIndex(h => h.id === req.params.id);

  if (hubIndex === -1) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  hubs.splice(hubIndex, 1);
  res.status(204).send();
});

// POST /api/hub/:hubId/links - Add link
app.post('/api/hub/:hubId/links', (req, res) => {
  const hub = hubs.find(h => h.id === req.params.hubId);

  if (!hub) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  const { type, icon, label, url, is_active } = req.body;

  if (!type || !label || !url) {
    return res.status(400).json({ error: 'Type, label, and url are required' });
  }

  const newLink = {
    id: `l${nextLinkId++}`,
    hub_id: hub.id,
    type,
    icon: icon || 'Link',
    label,
    url,
    is_active: is_active !== false,
    display_order: hub.links?.length || 0,
    click_count: 0,
    created_at: new Date().toISOString(),
  };

  if (!hub.links) hub.links = [];
  hub.links.push(newLink);

  res.status(201).json(newLink);
});

// PATCH /api/hub/:hubId/links/:linkId - Update link
app.patch('/api/hub/:hubId/links/:linkId', (req, res) => {
  const hub = hubs.find(h => h.id === req.params.hubId);

  if (!hub) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  const linkIndex = hub.links?.findIndex(l => l.id === req.params.linkId);

  if (linkIndex === -1 || linkIndex === undefined) {
    return res.status(404).json({ error: 'Link not found' });
  }

  const { type, icon, label, url, is_active } = req.body;

  hub.links[linkIndex] = {
    ...hub.links[linkIndex],
    ...(type && { type }),
    ...(icon && { icon }),
    ...(label && { label }),
    ...(url && { url }),
    ...(is_active !== undefined && { is_active }),
  };

  res.json(hub.links[linkIndex]);
});

// DELETE /api/hub/:hubId/links/:linkId - Delete link
app.delete('/api/hub/:hubId/links/:linkId', (req, res) => {
  const hub = hubs.find(h => h.id === req.params.hubId);

  if (!hub) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  const linkIndex = hub.links?.findIndex(l => l.id === req.params.linkId);

  if (linkIndex === -1 || linkIndex === undefined) {
    return res.status(404).json({ error: 'Link not found' });
  }

  hub.links.splice(linkIndex, 1);
  res.status(204).send();
});

// PUT /api/hub/:hubId/links/reorder - Reorder links
app.put('/api/hub/:hubId/links/reorder', (req, res) => {
  const hub = hubs.find(h => h.id === req.params.hubId);

  if (!hub) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  const { link_ids } = req.body;

  if (!link_ids || !Array.isArray(link_ids)) {
    return res.status(400).json({ error: 'link_ids array is required' });
  }

  // Reorder links
  const reorderedLinks = link_ids
    .map(id => hub.links?.find(l => l.id === id))
    .filter(Boolean)
    .map((link, index) => ({ ...link, display_order: index }));

  hub.links = reorderedLinks;

  res.json({ success: true });
});

// GET /api/hub/:hubId/analytics - Get analytics
app.get('/api/hub/:hubId/analytics', (req, res) => {
  const hub = hubs.find(h => h.id === req.params.hubId);

  if (!hub) {
    return res.status(404).json({ error: 'Hub not found' });
  }

  res.json({
    total_views: hub.view_count,
    total_clicks: hub.links?.reduce((sum, l) => sum + (l.click_count || 0), 0) || 0,
    views_by_date: [],
    clicks_by_link: hub.links?.map(l => ({
      link_id: l.id,
      label: l.label,
      clicks: l.click_count || 0,
    })) || [],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🎭 Mock Hub API Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Running on: http://localhost:${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/hub`);
  console.log('');
  console.log('💡 This is a MOCK server for UI testing');
  console.log('   No database required!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
});

export default app;
