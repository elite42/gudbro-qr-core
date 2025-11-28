// Restaurant Menu Service
// Handles restaurant-specific menu items and customization

const { Pool } = require('pg');

class RestaurantMenuService {
  constructor(pool) {
    this.pool = pool || new Pool({
      connectionString: process.env.DATABASE_URL
    });
  }

  // Get restaurant's menu
  async getRestaurantMenu(restaurantId, language = 'en') {
    const query = `
      SELECT 
        rmi.id as restaurant_item_id,
        rmi.custom_price_vnd,
        rmi.custom_ingredients,
        rmi.custom_description_translations,
        rmi.enabled_modifiers,
        rmi.is_available,
        rmi.display_order,
        rmi.menu_section,
        smi.id as item_id,
        smi.name_translations,
        smi.description_translations,
        smi.category,
        smi.subcategory,
        smi.ingredients,
        smi.allergens,
        smi.dietary_flags,
        smi.photo_url,
        smi.base_price_vnd
      FROM restaurant_menu_items rmi
      JOIN shared_menu_items smi ON rmi.shared_item_id = smi.id
      WHERE rmi.restaurant_id = $1 AND smi.is_active = true
      ORDER BY rmi.menu_section, rmi.display_order, smi.name_translations->>'${language}'
    `;

    const result = await this.pool.query(query, [restaurantId]);
    
    // Get modifiers for each item
    const items = await Promise.all(result.rows.map(async (item) => {
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
        ${item.enabled_modifiers ? `AND id = ANY($2)` : ''}
        ORDER BY modifier_type, display_order
      `;

      const params = item.enabled_modifiers 
        ? [item.item_id, item.enabled_modifiers]
        : [item.item_id];

      const modifiersResult = await this.pool.query(modifiersQuery, params);

      return {
        ...item,
        final_price_vnd: item.custom_price_vnd || item.base_price_vnd,
        final_ingredients: item.custom_ingredients || item.ingredients,
        final_description_translations: item.custom_description_translations || item.description_translations,
        modifiers: modifiersResult.rows
      };
    }));

    return items;
  }

  // Add item to restaurant menu
  async addItemToMenu(restaurantId, sharedItemId, data = {}) {
    const {
      custom_price_vnd,
      custom_ingredients,
      custom_description_translations,
      enabled_modifiers,
      menu_section,
      display_order
    } = data;

    const query = `
      INSERT INTO restaurant_menu_items (
        restaurant_id,
        shared_item_id,
        custom_price_vnd,
        custom_ingredients,
        custom_description_translations,
        enabled_modifiers,
        menu_section,
        display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (restaurant_id, shared_item_id) 
      DO UPDATE SET
        custom_price_vnd = EXCLUDED.custom_price_vnd,
        custom_ingredients = EXCLUDED.custom_ingredients,
        custom_description_translations = EXCLUDED.custom_description_translations,
        enabled_modifiers = EXCLUDED.enabled_modifiers,
        menu_section = EXCLUDED.menu_section,
        display_order = EXCLUDED.display_order,
        is_available = true
      RETURNING *
    `;

    const params = [
      restaurantId,
      sharedItemId,
      custom_price_vnd,
      custom_ingredients,
      custom_description_translations ? JSON.stringify(custom_description_translations) : null,
      enabled_modifiers,
      menu_section,
      display_order || 0
    ];

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  // Update restaurant menu item
  async updateMenuItem(restaurantItemId, data) {
    const updates = [];
    const params = [restaurantItemId];
    let paramCount = 2;

    const fields = [
      'custom_price_vnd',
      'custom_ingredients',
      'custom_description_translations',
      'enabled_modifiers',
      'is_available',
      'menu_section',
      'display_order'
    ];

    fields.forEach(field => {
      if (data[field] !== undefined) {
        const value = (field === 'custom_description_translations' && data[field])
          ? JSON.stringify(data[field])
          : data[field];
        updates.push(`${field} = $${paramCount++}`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return null;
    }

    const query = `
      UPDATE restaurant_menu_items
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, params);
    return result.rows[0];
  }

  // Remove item from restaurant menu
  async removeItemFromMenu(restaurantItemId) {
    const query = 'DELETE FROM restaurant_menu_items WHERE id = $1';
    await this.pool.query(query, [restaurantItemId]);
    return { success: true };
  }

  // Toggle item availability
  async toggleAvailability(restaurantItemId, isAvailable) {
    const query = `
      UPDATE restaurant_menu_items
      SET is_available = $2
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [restaurantItemId, isAvailable]);
    return result.rows[0];
  }

  // Reorder items in section
  async reorderSection(restaurantId, section, itemOrders) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      for (const { restaurantItemId, displayOrder } of itemOrders) {
        await client.query(
          `UPDATE restaurant_menu_items 
           SET display_order = $1 
           WHERE id = $2 AND restaurant_id = $3`,
          [displayOrder, restaurantItemId, restaurantId]
        );
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get menu sections for restaurant
  async getMenuSections(restaurantId) {
    const query = `
      SELECT DISTINCT menu_section, COUNT(*) as item_count
      FROM restaurant_menu_items
      WHERE restaurant_id = $1
      GROUP BY menu_section
      ORDER BY menu_section
    `;

    const result = await this.pool.query(query, [restaurantId]);
    return result.rows;
  }

  // Calculate price with modifiers
  calculateTotalPrice(basePrice, modifiers = []) {
    return modifiers.reduce((total, mod) => {
      return total + (mod.price_modifier || 0);
    }, basePrice);
  }
}

module.exports = RestaurantMenuService;
