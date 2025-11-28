// Tests for Health Filters
const { 
  filterItemsByAllergens, 
  filterItemsByDietary, 
  filterItems 
} = require('../backend/utils/healthFilters');

describe('Health Filters', () => {
  const mockItems = [
    {
      id: 1,
      name: 'Espresso',
      allergens: [],
      dietary_flags: ['vegan']
    },
    {
      id: 2,
      name: 'Cappuccino',
      allergens: ['dairy'],
      dietary_flags: ['vegetarian']
    },
    {
      id: 3,
      name: 'Pho',
      allergens: [],
      dietary_flags: []
    },
    {
      id: 4,
      name: 'Pizza',
      allergens: ['gluten', 'dairy'],
      dietary_flags: ['vegetarian']
    },
    {
      id: 5,
      name: 'Goi Cuon',
      allergens: ['shellfish', 'peanuts'],
      dietary_flags: []
    }
  ];

  describe('filterItemsByAllergens', () => {
    test('excludes items with selected allergens', () => {
      const result = filterItemsByAllergens(mockItems, ['dairy']);
      expect(result).toHaveLength(3);
      expect(result.find(i => i.id === 2)).toBeUndefined();
      expect(result.find(i => i.id === 4)).toBeUndefined();
    });

    test('excludes items with any of multiple allergens', () => {
      const result = filterItemsByAllergens(mockItems, ['dairy', 'shellfish']);
      expect(result).toHaveLength(2);
      expect(result.map(i => i.id)).toEqual([1, 3]);
    });

    test('returns all items when no allergens selected', () => {
      const result = filterItemsByAllergens(mockItems, []);
      expect(result).toHaveLength(5);
    });
  });

  describe('filterItemsByDietary', () => {
    test('includes only items matching dietary preference', () => {
      const result = filterItemsByDietary(mockItems, ['vegan']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    test('includes items matching all selected preferences', () => {
      const result = filterItemsByDietary(mockItems, ['vegetarian']);
      expect(result).toHaveLength(2);
      expect(result.map(i => i.id)).toEqual([2, 4]);
    });

    test('returns all items when no dietary preference selected', () => {
      const result = filterItemsByDietary(mockItems, []);
      expect(result).toHaveLength(5);
    });
  });

  describe('filterItems (combined)', () => {
    test('applies both allergen and dietary filters', () => {
      const result = filterItems(mockItems, ['dairy'], ['vegetarian']);
      expect(result).toHaveLength(0); // Pizza has dairy, excluded
    });

    test('allergen filter takes precedence', () => {
      const result = filterItems(mockItems, ['gluten'], []);
      expect(result).toHaveLength(4);
      expect(result.find(i => i.id === 4)).toBeUndefined();
    });

    test('returns all items when no filters', () => {
      const result = filterItems(mockItems, [], []);
      expect(result).toHaveLength(5);
    });

    test('complex filtering scenario', () => {
      // Find vegan items without peanuts
      const result = filterItems(mockItems, ['peanuts'], ['vegan']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1); // Espresso
    });
  });
});
