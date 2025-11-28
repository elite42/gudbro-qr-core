// Restaurant Menu Routes
const express = require('express');
const RestaurantMenuService = require('../services/restaurantMenu');

const router = express.Router();
const restaurantMenuService = new RestaurantMenuService();

// GET /api/menu/restaurant/:restaurantId/items - Get restaurant menu
router.get('/restaurant/:restaurantId/items', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { language = 'en' } = req.query;

    const items = await restaurantMenuService.getRestaurantMenu(restaurantId, language);
    res.json({ items, count: items.length });
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant menu' });
  }
});

// POST /api/menu/restaurant/:restaurantId/items - Add item to restaurant menu
router.post('/restaurant/:restaurantId/items', async (req, res) => {
  try {
    // TODO: Add restaurant auth middleware
    const { restaurantId } = req.params;
    const { sharedItemId, ...customizations } = req.body;

    const item = await restaurantMenuService.addItemToMenu(
      restaurantId,
      sharedItemId,
      customizations
    );

    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding item to menu:', error);
    res.status(500).json({ error: 'Failed to add item to menu' });
  }
});

// PUT /api/menu/restaurant/items/:restaurantItemId - Update restaurant menu item
router.put('/restaurant/items/:restaurantItemId', async (req, res) => {
  try {
    // TODO: Add restaurant auth middleware
    const { restaurantItemId } = req.params;
    const item = await restaurantMenuService.updateMenuItem(restaurantItemId, req.body);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error updating restaurant item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// DELETE /api/menu/restaurant/items/:restaurantItemId - Remove item from menu
router.delete('/restaurant/items/:restaurantItemId', async (req, res) => {
  try {
    // TODO: Add restaurant auth middleware
    const { restaurantItemId } = req.params;
    await restaurantMenuService.removeItemFromMenu(restaurantItemId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
});

// PATCH /api/menu/restaurant/items/:restaurantItemId/availability - Toggle availability
router.patch('/restaurant/items/:restaurantItemId/availability', async (req, res) => {
  try {
    // TODO: Add restaurant auth middleware
    const { restaurantItemId } = req.params;
    const { isAvailable } = req.body;

    const item = await restaurantMenuService.toggleAvailability(restaurantItemId, isAvailable);
    res.json(item);
  } catch (error) {
    console.error('Error toggling availability:', error);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
});

// POST /api/menu/restaurant/:restaurantId/reorder - Reorder items in section
router.post('/restaurant/:restaurantId/reorder', async (req, res) => {
  try {
    // TODO: Add restaurant auth middleware
    const { restaurantId } = req.params;
    const { section, itemOrders } = req.body;

    await restaurantMenuService.reorderSection(restaurantId, section, itemOrders);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reordering items:', error);
    res.status(500).json({ error: 'Failed to reorder items' });
  }
});

// GET /api/menu/restaurant/:restaurantId/sections - Get menu sections
router.get('/restaurant/:restaurantId/sections', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const sections = await restaurantMenuService.getMenuSections(restaurantId);
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

module.exports = router;
