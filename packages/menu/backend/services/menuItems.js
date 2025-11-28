// Menu Items Service
// Handles CRUD operations for shared menu items with JSONB translations

const { Pool } = require('pg');
const { filterItems } = require('../utils/healthFilters');

class MenuItemsService {
  constructor(pool) {
    this.pool = pool || new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  // Get all items with filters
  async getItems({ category, subcategory, language = 'en', search, allergens, diet, intolerances, spice_level, limit = 50, offset = 0 }) {
    const conditions = ['is_active = true'];
    const params = [];
    let paramCount = 1;

    if (category) {
      conditions.push(`category = $${paramCount++}`);
      params.push(category);
    }

    if (subcategory) {
      conditions.push(`subcategory = $${paramCount++}`);
      params.push(subcategory);
    }

    if (search) {
      conditions.push(`name_translations @> $${paramCount++}::jsonb`);
      params.push(JSON.stringify({ [language]: search }));
    }

    const query = `
      SELECT 
        id, name_translations, description_translations, category, subcategory,
        ingredients, allergens, dietary_flags, photo_url, base_price_vnd,
        popularity_score, created_at
      FROM shared_menu_items
      WHERE ${conditions.join(' AND ')}
      ORDER BY popularity_score DESC, name_translations->>'${language}' ASC
    `;

    const result = await this.pool.query(query, params);
    let items = result.rows;

    // Apply health filters
    const hasFilters = allergens || diet || intolerances || spice_level;
    if (hasFilters) {
      const filters = {
        selectedAllergens: allergens ? allergens.split(',') : [],
        selectedDietary: diet ? diet.split(',') : [],
        selectedIntolerances: intolerances ? intolerances.split(',') : [],
        maxSpiceLevel: spice_level || null
      };
      items = filterItems(items, filters);
    }

    const paginatedItems = items.slice(offset, offset + limit);
    return paginatedItems;
  }
  // Get single item with modifiers
  async getItemById(id, language = 'en') {
    const itemQuery = `
      SELECT 
        id,
        name_translations,
        description_translations,
        category,
        subcategory,
        ingredients,
        allergens,
        dietary_flags,
        photo_url,
        base_price_vnd,
        popularity_score,
        created_at
      FROM shared_menu_items
      WHERE id = $1 AND is_active = true
    `;

    const modifiersQuery = `
      SELECT 
        id,
        modifier_type,
        modifier_value,
        name_translations,
        price_modifier,
        is_default,
        display_order
      FROM menu_item_modifiers
      WHERE item_id = $1
      ORDER BY modifier_type, display_order, name_translations->>'${language}'
    `;

    const [itemResult, modifiersResult] = await Promise.all([
      this.pool.query(itemQuery, [id]),
      this.pool.query(modifiersQuery, [id])
    ]);

    if (itemResult.rows.length === 0) {
      return null;
    }

    return {
      ...itemResult.rows[0],
      modifiers: modifiersResult.rows
    };
  }

  // Create new item (admin only)
  async createItem(data) {
    const {
      name_translations,
      description_translations,
      category,
      subcategory,
      ingredients,
      allergens,
      dietary_flags,
      photo_url,
      base_price_vnd
    } = data;

    const query = `
      INSERT INTO shared_menu_items (
        name_translations,
        description_translations,
        category,
        subcategory,
        ingredients,
        allergens,
        dietary_flags,
        photo_url,
        base_price_vnd
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const params = [
      JSON.stringify(name_translations),
      description_translations ? JSON.stringify(description_translations) : null,
      category,
      subcategory,
      ingredients,
      allergens,
      dietary_flags,
      photo_url,
      base_price_vnd
    ];

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  // Update item (admin only)
  async updateItem(id, data) {
    const updates = [];
    const params = [id];
    let paramCount = 2;

    const fields = [
      'name_translations',
      'description_translations',
      'category',
      'subcategory',
      'ingredients',
      'allergens',
      'dietary_flags',
      'photo_url',
      'base_price_vnd'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        const value = (field.includes('translations') && data[field]) 
          ? JSON.stringify(data[field]) 
          : data[field];
        updates.push(`${field} = $${paramCount++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return this.getItemById(id);
    }

    const query = `
      UPDATE shared_menu_items
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  // Delete item (admin only)
  async deleteItem(id) {
    const query = 'UPDATE shared_menu_items SET is_active = false WHERE id = $1';
    await this.pool.query(query, [id]);
    return { success: true };
  }

  // Get modifiers for an item
  async getModifiers(itemId) {
    const query = `
      SELECT 
        id,
        modifier_type,
        modifier_value,
        name_translations,
        price_modifier,
        is_default,
        display_order
      FROM menu_item_modifiers
      WHERE item_id = $1
      ORDER BY modifier_type, display_order
    `;

    const result = await this.pool.query(query, [itemId]);
    return result.rows;
  }

  // Add modifier to item (admin only)
  async createModifier(itemId, data) {
    const {
      modifier_type,
      modifier_value,
      name_translations,
      price_modifier = 0,
      is_default = false,
      display_order = 0
    } = data;

    const query = `
      INSERT INTO menu_item_modifiers (
        item_id,
        modifier_type,
        modifier_value,
        name_translations,
        price_modifier,
        is_default,
        display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const params = [
      itemId,
      modifier_type,
      modifier_value,
      JSON.stringify(name_translations),
      price_modifier,
      is_default,
      display_order
    ];

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  // Calculate price with modifiers
  calculatePrice(basePrice, modifiers = []) {
    return modifiers.reduce((total, mod) => {
      return total + (mod.price_modifier || 0);
    }, basePrice);
  }

  // Get categories
  async getCategories() {
    const query = `
      SELECT DISTINCT category, COUNT(*) as item_count
      FROM shared_menu_items
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  // Get subcategories by category
  async getSubcategories(category) {
    const query = `
      SELECT DISTINCT subcategory, COUNT(*) as item_count
      FROM shared_menu_items
      WHERE is_active = true AND category = $1 AND subcategory IS NOT NULL
      GROUP BY subcategory
      ORDER BY subcategory
    `;

    const result = await this.pool.query(query, [category]);
    return result.rows;
  }
}

module.exports = MenuItemsService;
