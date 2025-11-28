// Menu Items Routes
const express = require('express');
const MenuItemsService = require('../services/menuItems');

const router = express.Router();
const menuItemsService = new MenuItemsService();

// GET /api/menu/items - Search/filter items
router.get('/items', async (req, res) => {
  try {
    const { category, subcategory, language = 'en', search, allergens, diet, intolerances, spice_level, limit = 50, offset = 0 } = req.query;

    const items = await menuItemsService.getItems({
      category, subcategory, language, search,
      allergens, diet, intolerances, spice_level,
      limit: parseInt(limit), offset: parseInt(offset)
    });

    res.json({ items, count: items.length });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/menu/items/:id - Get single item with modifiers
router.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const item = await menuItemsService.getItemById(id, language);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// POST /api/menu/items - Create item (admin only)
router.post('/items', async (req, res) => {
  try {
    // TODO: Add admin auth middleware
    const item = await menuItemsService.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// PUT /api/menu/items/:id - Update item (admin only)
router.put('/items/:id', async (req, res) => {
  try {
    // TODO: Add admin auth middleware
    const { id } = req.params;
    const item = await menuItemsService.updateItem(id, req.body);
    res.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/menu/items/:id - Delete item (admin only)
router.delete('/items/:id', async (req, res) => {
  try {
    // TODO: Add admin auth middleware
    const { id } = req.params;
    await menuItemsService.deleteItem(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// GET /api/menu/items/:id/modifiers - Get item modifiers
router.get('/items/:id/modifiers', async (req, res) => {
  try {
    const { id } = req.params;
    const modifiers = await menuItemsService.getModifiers(id);
    res.json(modifiers);
  } catch (error) {
    console.error('Error fetching modifiers:', error);
    res.status(500).json({ error: 'Failed to fetch modifiers' });
  }
});

// POST /api/menu/items/:id/modifiers - Add modifier (admin only)
router.post('/items/:id/modifiers', async (req, res) => {
  try {
    // TODO: Add admin auth middleware
    const { id } = req.params;
    const modifier = await menuItemsService.createModifier(id, req.body);
    res.status(201).json(modifier);
  } catch (error) {
    console.error('Error creating modifier:', error);
    res.status(500).json({ error: 'Failed to create modifier' });
  }
});

// GET /api/menu/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await menuItemsService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/menu/categories/:category/subcategories - Get subcategories
router.get('/categories/:category/subcategories', async (req, res) => {
  try {
    const { category } = req.params;
    const subcategories = await menuItemsService.getSubcategories(category);
    res.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ error: 'Failed to fetch subcategories' });
  }
});

// POST /api/menu/calculate-price - Calculate price with modifiers
router.post('/calculate-price', async (req, res) => {
  try {
    const { basePrice, modifiers } = req.body;
    const totalPrice = menuItemsService.calculatePrice(basePrice, modifiers);
    res.json({ totalPrice });
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json({ error: 'Failed to calculate price' });
  }
});

module.exports = router;
