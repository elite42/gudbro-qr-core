const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage (in production, use PostgreSQL)
const templates = new Map();

/**
 * POST /api/templates
 * Save a new template
 * 
 * Body:
 * {
 *   "name": "My Cool Design",
 *   "design": { ... },
 *   "isPublic": false
 * }
 */
router.post('/', (req, res) => {
  try {
    const { name, design, isPublic = false } = req.body;

    if (!name || !design) {
      return res.status(400).json({ error: 'Name and design are required' });
    }

    const template = {
      id: uuidv4(),
      name,
      design,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    templates.set(template.id, template);

    res.status(201).json(template);
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/templates
 * Get all templates (optionally filter by public/private)
 */
router.get('/', (req, res) => {
  try {
    const { publicOnly } = req.query;

    let templateList = Array.from(templates.values());

    if (publicOnly === 'true') {
      templateList = templateList.filter(t => t.isPublic);
    }

    // Sort by most recent first
    templateList.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      templates: templateList,
      total: templateList.length
    });
  } catch (error) {
    console.error('Template fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/templates/:id
 * Get a specific template by ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const template = templates.get(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Template fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/templates/:id
 * Update a template
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, design, isPublic } = req.body;

    const template = templates.get(id);

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Update fields
    if (name) template.name = name;
    if (design) template.design = design;
    if (isPublic !== undefined) template.isPublic = isPublic;
    template.updatedAt = new Date().toISOString();

    templates.set(id, template);

    res.json(template);
  } catch (error) {
    console.error('Template update error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/templates/:id
 * Delete a template
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!templates.has(id)) {
      return res.status(404).json({ error: 'Template not found' });
    }

    templates.delete(id);

    res.status(204).send();
  } catch (error) {
    console.error('Template deletion error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/templates/public/featured
 * Get featured public templates
 */
router.get('/public/featured', (req, res) => {
  try {
    const featuredTemplates = [
      {
        id: 'featured-1',
        name: 'Modern Blue',
        design: {
          foreground: '#1E3A8A',
          background: '#FFFFFF',
          pattern: 'rounded',
          eyeStyle: 'rounded',
          margin: 4
        },
        isPublic: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'featured-2',
        name: 'Neon Green',
        design: {
          foreground: '#10B981',
          background: '#000000',
          pattern: 'dots',
          eyeStyle: 'dot',
          margin: 4
        },
        isPublic: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'featured-3',
        name: 'Sunset Orange',
        design: {
          foreground: '#F97316',
          background: '#FEF3C7',
          pattern: 'squares',
          eyeStyle: 'rounded',
          margin: 4
        },
        isPublic: true,
        createdAt: new Date().toISOString()
      }
    ];

    res.json({ templates: featuredTemplates });
  } catch (error) {
    console.error('Featured templates error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
