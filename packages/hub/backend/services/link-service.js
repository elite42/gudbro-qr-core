// Module 9: Link Service - Link Management Logic

import { pool } from '../../config/database.js';

// Create link
export async function createLink(hubId, data) {
  const {
    type,
    icon,
    label,
    url,
    qr_code_id,
    color,
    background_color,
    button_style = 'solid',
    display_order,
    is_featured = false
  } = data;
  
  // Auto-assign display_order if not provided
  let finalOrder = display_order;
  if (finalOrder === undefined) {
    const maxOrder = await pool.query(
      'SELECT COALESCE(MAX(display_order), -1) as max FROM hub_links WHERE hub_page_id = $1',
      [hubId]
    );
    finalOrder = maxOrder.rows[0].max + 1;
  }
  
  const result = await pool.query(
    `INSERT INTO hub_links (
      hub_page_id, type, icon, label, url, qr_code_id,
      color, background_color, button_style, display_order, is_featured
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      hubId, type, icon, label, url, qr_code_id,
      color, background_color, button_style, finalOrder, is_featured
    ]
  );
  
  return result.rows[0];
}

// Get hub links
export async function getHubLinks(hubId) {
  const result = await pool.query(
    `SELECT * FROM hub_links
     WHERE hub_page_id = $1
     ORDER BY display_order, created_at`,
    [hubId]
  );
  
  return result.rows;
}

// Update link
export async function updateLink(linkId, hubId, updates) {
  const allowedFields = [
    'label', 'url', 'icon', 'color', 'background_color',
    'button_style', 'display_order', 'is_active', 'is_featured'
  ];
  
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }
  
  if (fields.length === 0) {
    const result = await pool.query(
      'SELECT * FROM hub_links WHERE id = $1 AND hub_page_id = $2',
      [linkId, hubId]
    );
    return result.rows[0] || null;
  }
  
  values.push(linkId, hubId);
  
  const result = await pool.query(
    `UPDATE hub_links SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex} AND hub_page_id = $${paramIndex + 1}
     RETURNING *`,
    values
  );
  
  return result.rows[0] || null;
}

// Delete link
export async function deleteLink(linkId, hubId) {
  await pool.query(
    'DELETE FROM hub_links WHERE id = $1 AND hub_page_id = $2',
    [linkId, hubId]
  );
}

// Reorder links
export async function reorderLinks(hubId, linkIds) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (let i = 0; i < linkIds.length; i++) {
      await client.query(
        `UPDATE hub_links SET display_order = $1
         WHERE id = $2 AND hub_page_id = $3`,
        [i, linkIds[i], hubId]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Create bulk links
export async function createBulkLinks(hubId, links) {
  const client = await pool.connect();
  const createdLinks = [];
  
  try {
    await client.query('BEGIN');
    
    // Get current max order
    const maxOrder = await client.query(
      'SELECT COALESCE(MAX(display_order), -1) as max FROM hub_links WHERE hub_page_id = $1',
      [hubId]
    );
    let currentOrder = maxOrder.rows[0].max + 1;
    
    for (const link of links) {
      const result = await client.query(
        `INSERT INTO hub_links (
          hub_page_id, type, icon, label, url, display_order,
          color, background_color, button_style
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          hubId,
          link.type,
          link.icon || null,
          link.label,
          link.url,
          currentOrder,
          link.color || null,
          link.background_color || null,
          link.button_style || 'solid'
        ]
      );
      
      createdLinks.push(result.rows[0]);
      currentOrder++;
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  
  return createdLinks;
}

// Track link click
export async function trackLinkClick(linkId, shortCode, req) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  const referer = req.get('referer');
  
  // Get hub_page_id from short_code
  const hubResult = await pool.query(
    'SELECT id FROM hub_pages WHERE short_code = $1',
    [shortCode]
  );
  
  if (hubResult.rows.length === 0) return;
  const hubPageId = hubResult.rows[0].id;
  
  // Increment click count
  await pool.query(
    `UPDATE hub_links 
     SET click_count = click_count + 1, last_clicked_at = NOW()
     WHERE id = $1`,
    [linkId]
  );
  
  // Log analytics
  await pool.query(
    `INSERT INTO hub_analytics (
      hub_page_id, hub_link_id, event_type, 
      ip_address, user_agent, referer
    ) VALUES ($1, $2, 'click', $3, $4, $5)`,
    [hubPageId, linkId, ip, userAgent, referer]
  );
}

// Get link analytics
export async function getLinkAnalytics(linkId, hubId) {
  const linkResult = await pool.query(
    `SELECT 
       l.label,
       l.url,
       l.click_count,
       l.last_clicked_at,
       COUNT(DISTINCT a.ip_address) as unique_clicks
     FROM hub_links l
     LEFT JOIN hub_analytics a ON l.id = a.hub_link_id
     WHERE l.id = $1 AND l.hub_page_id = $2
     GROUP BY l.id`,
    [linkId, hubId]
  );
  
  if (linkResult.rows.length === 0) return null;
  
  const link = linkResult.rows[0];
  
  // Clicks by date
  const clicksByDateResult = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*) as clicks
     FROM hub_analytics
     WHERE hub_link_id = $1 AND event_type = 'click'
     GROUP BY DATE(created_at)
     ORDER BY date DESC
     LIMIT 30`,
    [linkId]
  );
  
  return {
    ...link,
    clicks_by_date: clicksByDateResult.rows
  };
}

// Verify hub access
export async function verifyHubAccess(hubId, userId) {
  const result = await pool.query(
    'SELECT id FROM hub_pages WHERE id = $1 AND user_id = $2',
    [hubId, userId]
  );
  
  return result.rows.length > 0;
}
