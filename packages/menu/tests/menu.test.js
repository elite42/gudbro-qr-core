// Tests for Menu Services
const MenuItemsService = require('../backend/services/menuItems');
const RestaurantMenuService = require('../backend/services/restaurantMenu');

describe('MenuItemsService', () => {
  let service;

  beforeAll(() => {
    service = new MenuItemsService();
  });

  describe('getItems', () => {
    test('should return items with filters', async () => {
      const items = await service.getItems({ category: 'beverage', limit: 10 });
      expect(Array.isArray(items)).toBe(true);
    });

    test('should filter by category', async () => {
      const items = await service.getItems({ category: 'food' });
      items.forEach(item => {
        expect(item.category).toBe('food');
      });
    });

    test('should filter by subcategory', async () => {
      const items = await service.getItems({ 
        category: 'beverage', 
        subcategory: 'beer' 
      });
      items.forEach(item => {
        expect(item.subcategory).toBe('beer');
      });
    });
  });

  describe('getItemById', () => {
    test('should return item with modifiers', async () => {
      const items = await service.getItems({ limit: 1 });
      if (items.length > 0) {
        const item = await service.getItemById(items[0].id);
        expect(item).toHaveProperty('name_translations');
        expect(item).toHaveProperty('modifiers');
      }
    });

    test('should return null for invalid ID', async () => {
      const item = await service.getItemById('00000000-0000-0000-0000-000000000000');
      expect(item).toBeNull();
    });
  });

  describe('calculatePrice', () => {
    test('should calculate base price with no modifiers', () => {
      const price = service.calculatePrice(50000, []);
      expect(price).toBe(50000);
    });

    test('should add positive modifiers', () => {
      const price = service.calculatePrice(50000, [
        { price_modifier: 10000 },
        { price_modifier: 5000 }
      ]);
      expect(price).toBe(65000);
    });

    test('should subtract negative modifiers', () => {
      const price = service.calculatePrice(50000, [
        { price_modifier: -5000 }
      ]);
      expect(price).toBe(45000);
    });
  });

  describe('getCategories', () => {
    test('should return all categories', async () => {
      const categories = await service.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      categories.forEach(cat => {
        expect(cat).toHaveProperty('category');
        expect(cat).toHaveProperty('item_count');
      });
    });
  });
});

describe('RestaurantMenuService', () => {
  let service;
  const testRestaurantId = '00000000-0000-0000-0000-000000000001';

  beforeAll(() => {
    service = new RestaurantMenuService();
  });

  describe('getRestaurantMenu', () => {
    test('should return restaurant menu', async () => {
      const menu = await service.getRestaurantMenu(testRestaurantId);
      expect(Array.isArray(menu)).toBe(true);
    });
  });

  describe('calculateTotalPrice', () => {
    test('should calculate total with modifiers', () => {
      const total = service.calculateTotalPrice(50000, [
        { price_modifier: 10000 },
        { price_modifier: -2000 }
      ]);
      expect(total).toBe(58000);
    });
  });
});

// Run: npm test
