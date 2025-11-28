// Module 9: Hub Service - Business Logic

import { pool } from '../../config/database.js';
import bcrypt from 'bcrypt';
// import { generateShortCode } from '../../module-1-qr-engine/utils/shortcode.js';
import { getTemplate } from '../templates/presets.js';

// Generate short code
function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
// Create new hub
export async function createHub(userId, data) {
  const {
    title,
    subtitle,
    description,
    logo_url,
    cover_image_url,
    template,
    theme,
    password,
    custom_domain,
    meta_title,
    meta_description
  } = data;
  
  // Get template defaults
  const templateData = getTemplate(template);
  const finalTheme = theme || templateData.theme;
  
  // Generate unique short code
  let shortCode;
  let attempts = 0;
  while (attempts < 10) {
    shortCode = generateShortCode(6);
    const exists = await checkShortCodeExists(shortCode);
    if (!exists) break;
    attempts++;
  }
  
  if (attempts >= 10) {
    throw new Error('Failed to generate unique short code');
  }
  
  // Hash password if provided
  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }
  
  const result = await pool.query(
    `INSERT INTO hub_pages (
      user_id, short_code, title, subtitle, description,
      logo_url, cover_image_url, template, theme_json,
      password_hash, custom_domain, meta_title, meta_description
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      userId, shortCode, title, subtitle, description,
      logo_url, cover_image_url, template, JSON.stringify(finalTheme),
      passwordHash, custom_domain, meta_title, meta_description
    ]
  );
  
  const hub = result.rows[0];
  
  // Create default links from template
  if (templateData.defaultLinks && templateData.defaultLinks.length > 0) {
    await createDefaultLinks(hub.id, templateData.defaultLinks);
  }
  
  return {
    id: hub.id,
    short_code: hub.short_code,
    title: hub.title,
    subtitle: hub.subtitle,
    template: hub.template,
    theme: hub.theme_json,
    created_at: hub.created_at
  };
}

// Get hub by short code (public)
export async function getHubByShortCode(shortCode) {
  const result = await pool.query(
    `SELECT hp.*, 
     COALESCE(
       json_agg(
         json_build_object(
           'id', hl.id,
           'type', hl.type,
           'icon', hl.icon,
           'label', hl.label,
           'url', hl.url,
           'color', hl.color,
           'background_color', hl.background_color,
           'button_style', hl.button_style,
           'is_featured', hl.is_featured,
           'display_order', hl.display_order
         ) ORDER BY hl.display_order, hl.created_at
       ) FILTER (WHERE hl.is_active = true AND hl.id IS NOT NULL),
       '[]'
     ) as links
     FROM hub_pages hp
     LEFT JOIN hub_links hl ON hp.id = hl.hub_page_id
     WHERE hp.short_code = $1 AND hp.is_public = true
     GROUP BY hp.id`,
    [shortCode]
  );
  
  if (result.rows.length === 0) return null;
  
  const hub = result.rows[0];
  return {
    ...hub,
    theme_json: hub.theme_json,
    links: hub.links || []
  };
}

// Get hub by ID (auth)
export async function getHub(hubId, userId) {
  const result = await pool.query(
    `SELECT hp.*,
     COALESCE(
       json_agg(
         json_build_object(
           'id', hl.id,
           'type', hl.type,
           'icon', hl.icon,
           'label', hl.label,
           'url', hl.url,
           'qr_code_id', hl.qr_code_id,
           'color', hl.color,
           'background_color', hl.background_color,
           'button_style', hl.button_style,
           'is_active', hl.is_active,
           'is_featured', hl.is_featured,
           'display_order', hl.display_order,
           'click_count', hl.click_count
         ) ORDER BY hl.display_order, hl.created_at
       ) FILTER (WHERE hl.id IS NOT NULL),
       '[]'
     ) as links
     FROM hub_pages hp
     LEFT JOIN hub_links hl ON hp.id = hl.hub_page_id
     WHERE hp.id = $1 AND hp.user_id = $2
     GROUP BY hp.id`,
    [hubId, userId]
  );
  
  if (result.rows.length === 0) return null;
  
  return result.rows[0];
}

// Get user's hubs
export async function getUserHubs(userId, options = {}) {
  const { page = 1, limit = 20, template } = options;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT hp.*, 
      COUNT(hl.id) FILTER (WHERE hl.is_active = true) as active_links,
      COALESCE(SUM(hl.click_count), 0) as total_clicks
    FROM hub_pages hp
    LEFT JOIN hub_links hl ON hp.id = hl.hub_page_id
    WHERE hp.user_id = $1
  `;
  
  const params = [userId];
  
  if (template) {
    query += ` AND hp.template = $${params.length + 1}`;
    params.push(template);
  }
  
  query += `
    GROUP BY hp.id
    ORDER BY hp.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  params.push(limit, offset);
  
  const result = await pool.query(query, params);
  
  // Get total count
  const countQuery = template 
    ? 'SELECT COUNT(*) FROM hub_pages WHERE user_id = $1 AND template = $2'
    : 'SELECT COUNT(*) FROM hub_pages WHERE user_id = $1';
  const countParams = template ? [userId, template] : [userId];
  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);
  
  return {
    hubs: result.rows,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

// Update hub
export async function updateHub(hubId, userId, updates) {
  const allowedFields = [
    'title', 'subtitle', 'description', 'logo_url', 'cover_image_url',
    'theme_json', 'is_active', 'is_public', 'custom_domain',
    'meta_title', 'meta_description'
  ];
  
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      if (key === 'theme_json' && typeof value === 'object') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }
  }
  
  // Handle password update
  if (updates.password !== undefined) {
    if (updates.password === null || updates.password === '') {
      fields.push(`password_hash = NULL`);
    } else {
      const hash = await bcrypt.hash(updates.password, 10);
      fields.push(`password_hash = $${paramIndex}`);
      values.push(hash);
      paramIndex++;
    }
  }
  
  if (fields.length === 0) {
    return await getHub(hubId, userId);
  }
  
  values.push(hubId, userId);
  
  const result = await pool.query(
    `UPDATE hub_pages SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
     RETURNING *`,
    values
  );
  
  return result.rows[0] || null;
}

// Delete hub
export async function deleteHub(hubId, userId) {
  await pool.query(
    'DELETE FROM hub_pages WHERE id = $1 AND user_id = $2',
    [hubId, userId]
  );
}

// Duplicate hub
export async function duplicateHub(hubId, userId) {
  const original = await getHub(hubId, userId);
  if (!original) throw new Error('Hub not found');
  
  // Create new hub
  const newHub = await createHub(userId, {
    title: `${original.title} (Copy)`,
    subtitle: original.subtitle,
    description: original.description,
    logo_url: original.logo_url,
    cover_image_url: original.cover_image_url,
    template: original.template,
    theme: original.theme_json,
    custom_domain: null
  });
  
  // Copy links
  if (original.links && original.links.length > 0) {
    const linkValues = original.links
      .filter(link => link.id)
      .map((link, index) => 
        `($1, '${link.type}', '${link.icon}', '${link.label}', '${link.url}', ${index})`
      )
      .join(',');
    
    if (linkValues) {
      await pool.query(
        `INSERT INTO hub_links (hub_page_id, type, icon, label, url, display_order)
         VALUES ${linkValues}`,
        [newHub.id]
      );
    }
  }
  
  return newHub;
}

// Link QR to hub
export async function linkQRToHub(hubId, qrCodeId) {
  await pool.query(
    'UPDATE hub_pages SET qr_code_id = $1 WHERE id = $2',
    [qrCodeId, hubId]
  );
}

// Track hub view
export async function trackView(hubId, req) {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent');
  const referer = req.get('referer');
  
  // Increment view count
  await pool.query(
    `UPDATE hub_pages 
     SET view_count = view_count + 1, last_viewed_at = NOW()
     WHERE id = $1`,
    [hubId]
  );
  
  // Log analytics
  await pool.query(
    `INSERT INTO hub_analytics (hub_page_id, event_type, ip_address, user_agent, referer)
     VALUES ($1, 'view', $2, $3, $4)`,
    [hubId, ip, userAgent, referer]
  );
}

// Get hub analytics
export async function getHubAnalytics(hubId, userId, options = {}) {
  // Verify ownership
  const hub = await pool.query(
    'SELECT id FROM hub_pages WHERE id = $1 AND user_id = $2',
    [hubId, userId]
  );
  
  if (hub.rows.length === 0) throw new Error('Access denied');
  
  const { startDate, endDate } = options;
  let dateFilter = '';
  const params = [hubId];
  
  if (startDate) {
    params.push(startDate);
    dateFilter += ` AND created_at >= $${params.length}`;
  }
  if (endDate) {
    params.push(endDate);
    dateFilter += ` AND created_at <= $${params.length}`;
  }
  
  // Total stats
  const statsResult = await pool.query(
    `SELECT 
       (SELECT view_count FROM hub_pages WHERE id = $1) as total_views,
       (SELECT COUNT(*) FROM hub_analytics WHERE hub_page_id = $1 AND event_type = 'view' ${dateFilter}) as period_views,
       (SELECT COUNT(DISTINCT ip_address) FROM hub_analytics WHERE hub_page_id = $1 ${dateFilter}) as unique_visitors,
       (SELECT COALESCE(SUM(click_count), 0) FROM hub_links WHERE hub_page_id = $1) as total_clicks
    `,
    params
  );
  
  const stats = statsResult.rows[0];
  
  // Views by date
  const viewsByDateResult = await pool.query(
    `SELECT DATE(created_at) as date, COUNT(*) as views
     FROM hub_analytics
     WHERE hub_page_id = $1 AND event_type = 'view' ${dateFilter}
     GROUP BY DATE(created_at)
     ORDER BY date DESC
     LIMIT 30`,
    params
  );
  
  // Top links
  const topLinksResult = await pool.query(
    `SELECT id, label, click_count
     FROM hub_links
     WHERE hub_page_id = $1
     ORDER BY click_count DESC
     LIMIT 10`,
    [hubId]
  );
  
  return {
    ...stats,
    views_by_date: viewsByDateResult.rows,
    top_links: topLinksResult.rows
  };
}

// Verify password
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Helper: Check if short code exists
async function checkShortCodeExists(shortCode) {
  const result = await pool.query(
    'SELECT id FROM hub_pages WHERE short_code = $1',
    [shortCode]
  );
  return result.rows.length > 0;
}

// Helper: Create default links
async function createDefaultLinks(hubId, defaultLinks) {
  if (!defaultLinks || defaultLinks.length === 0) return;
  
  const values = defaultLinks.map((link, index) => 
    `('${hubId}', '${link.type}', '${link.icon}', '${link.label}', '${link.url}', ${index})`
  ).join(',');
  
  await pool.query(
    `INSERT INTO hub_links (hub_page_id, type, icon, label, url, display_order)
     VALUES ${values}`
  );
}
