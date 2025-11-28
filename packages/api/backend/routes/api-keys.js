// API Keys Management Routes
const express = require('express');
const router = express.Router();
const { 
  generateApiKey, 
  generateKeyPrefix, 
  hashApiKey,
  maskApiKey 
} = require('../utils/keyGenerator');
const {
  createApiKeySchema,
  updateApiKeySchema,
  validateBody,
  validateUUID
} = require('../utils/validators');

/**
 * POST /api/keys
 * Create new API key
 */
router.post('/', 
  validateBody(createApiKeySchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id; // From JWT auth middleware (Module 1)
    
    try {
      const { name, description, permissions, rate_limit, expires_at } = req.body;
      
      // Generate API key
      const environment = process.env.NODE_ENV === 'production' ? 'live' : 'test';
      const apiKey = generateApiKey(environment);
      const keyPrefix = generateKeyPrefix(apiKey);
      const keyHash = await hashApiKey(apiKey);
      
      // Insert into database
      const query = `
        INSERT INTO api_keys (
          user_id,
          key_hash,
          key_prefix,
          name,
          description,
          permissions,
          rate_limit,
          expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, key_prefix, name, permissions, rate_limit, expires_at, created_at
      `;
      
      const values = [
        userId,
        keyHash,
        keyPrefix,
        name,
        description || null,
        JSON.stringify(permissions),
        rate_limit,
        expires_at || null
      ];
      
      const result = await db.query(query, values);
      const newKey = result.rows[0];
      
      res.status(201).json({
        id: newKey.id,
        key: apiKey, // ⚠️ SHOW ONLY ONCE!
        key_prefix: newKey.key_prefix,
        name: newKey.name,
        description,
        permissions: newKey.permissions,
        rate_limit: newKey.rate_limit,
        expires_at: newKey.expires_at,
        created_at: newKey.created_at,
        warning: 'Save this key securely! It will not be shown again.'
      });
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({
        error: 'Failed to create API key',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/keys
 * List all API keys for user
 */
router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.user.id;
  
  try {
    const query = `
      SELECT 
        id,
        key_prefix,
        name,
        description,
        permissions,
        rate_limit,
        is_active,
        last_used_at,
        expires_at,
        created_at
      FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    
    res.json({
      keys: result.rows.map(key => ({
        ...key,
        is_expired: key.expires_at && new Date(key.expires_at) < new Date()
      }))
    });
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({
      error: 'Failed to list API keys',
      message: error.message
    });
  }
});

/**
 * GET /api/keys/:id
 * Get single API key details
 */
router.get('/:id', 
  validateUUID('id'),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const keyId = req.params.id;
    
    try {
      const query = `
        SELECT 
          id,
          key_prefix,
          name,
          description,
          permissions,
          rate_limit,
          is_active,
          last_used_at,
          expires_at,
          created_at,
          updated_at
        FROM api_keys
        WHERE id = $1 AND user_id = $2
      `;
      
      const result = await db.query(query, [keyId, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'API key not found'
        });
      }
      
      const key = result.rows[0];
      
      res.json({
        ...key,
        is_expired: key.expires_at && new Date(key.expires_at) < new Date()
      });
    } catch (error) {
      console.error('Get API key error:', error);
      res.status(500).json({
        error: 'Failed to get API key',
        message: error.message
      });
    }
  }
);

/**
 * PATCH /api/keys/:id
 * Update API key
 */
router.patch('/:id',
  validateUUID('id'),
  validateBody(updateApiKeySchema),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const keyId = req.params.id;
    
    try {
      // Check ownership
      const checkQuery = 'SELECT id FROM api_keys WHERE id = $1 AND user_id = $2';
      const checkResult = await db.query(checkQuery, [keyId, userId]);
      
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          error: 'API key not found'
        });
      }
      
      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (req.body.name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(req.body.name);
      }
      
      if (req.body.description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(req.body.description);
      }
      
      if (req.body.permissions !== undefined) {
        updates.push(`permissions = $${paramCount++}`);
        values.push(JSON.stringify(req.body.permissions));
      }
      
      if (req.body.rate_limit !== undefined) {
        updates.push(`rate_limit = $${paramCount++}`);
        values.push(req.body.rate_limit);
      }
      
      if (req.body.is_active !== undefined) {
        updates.push(`is_active = $${paramCount++}`);
        values.push(req.body.is_active);
      }
      
      if (req.body.expires_at !== undefined) {
        updates.push(`expires_at = $${paramCount++}`);
        values.push(req.body.expires_at);
      }
      
      updates.push(`updated_at = NOW()`);
      
      values.push(keyId, userId);
      
      const query = `
        UPDATE api_keys
        SET ${updates.join(', ')}
        WHERE id = $${paramCount++} AND user_id = $${paramCount++}
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      const updatedKey = result.rows[0];
      
      res.json({
        id: updatedKey.id,
        key_prefix: updatedKey.key_prefix,
        name: updatedKey.name,
        description: updatedKey.description,
        permissions: updatedKey.permissions,
        rate_limit: updatedKey.rate_limit,
        is_active: updatedKey.is_active,
        expires_at: updatedKey.expires_at,
        updated_at: updatedKey.updated_at
      });
    } catch (error) {
      console.error('Update API key error:', error);
      res.status(500).json({
        error: 'Failed to update API key',
        message: error.message
      });
    }
  }
);

/**
 * DELETE /api/keys/:id
 * Revoke (delete) API key
 */
router.delete('/:id',
  validateUUID('id'),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const keyId = req.params.id;
    
    try {
      const query = `
        DELETE FROM api_keys
        WHERE id = $1 AND user_id = $2
        RETURNING key_prefix, name
      `;
      
      const result = await db.query(query, [keyId, userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'API key not found'
        });
      }
      
      const deletedKey = result.rows[0];
      
      res.json({
        message: 'API key revoked successfully',
        key_prefix: deletedKey.key_prefix,
        name: deletedKey.name
      });
    } catch (error) {
      console.error('Delete API key error:', error);
      res.status(500).json({
        error: 'Failed to revoke API key',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/keys/:id/regenerate
 * Regenerate API key (creates new key, revokes old)
 */
router.post('/:id/regenerate',
  validateUUID('id'),
  async (req, res) => {
    const db = req.app.locals.db;
    const userId = req.user.id;
    const keyId = req.params.id;
    
    try {
      // Get existing key info
      const getQuery = `
        SELECT name, description, permissions, rate_limit, expires_at
        FROM api_keys
        WHERE id = $1 AND user_id = $2
      `;
      
      const getResult = await db.query(getQuery, [keyId, userId]);
      
      if (getResult.rows.length === 0) {
        return res.status(404).json({
          error: 'API key not found'
        });
      }
      
      const oldKey = getResult.rows[0];
      
      // Generate new key
      const environment = process.env.NODE_ENV === 'production' ? 'live' : 'test';
      const newApiKey = generateApiKey(environment);
      const keyPrefix = generateKeyPrefix(newApiKey);
      const keyHash = await hashApiKey(newApiKey);
      
      // Update database
      const updateQuery = `
        UPDATE api_keys
        SET 
          key_hash = $1,
          key_prefix = $2,
          updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING id, key_prefix, name, permissions, rate_limit, updated_at
      `;
      
      const updateResult = await db.query(updateQuery, [
        keyHash,
        keyPrefix,
        keyId,
        userId
      ]);
      
      const updatedKey = updateResult.rows[0];
      
      res.json({
        id: updatedKey.id,
        key: newApiKey, // ⚠️ SHOW ONLY ONCE!
        key_prefix: updatedKey.key_prefix,
        name: updatedKey.name,
        permissions: updatedKey.permissions,
        rate_limit: updatedKey.rate_limit,
        updated_at: updatedKey.updated_at,
        warning: 'Save this key securely! The old key is now invalid.'
      });
    } catch (error) {
      console.error('Regenerate API key error:', error);
      res.status(500).json({
        error: 'Failed to regenerate API key',
        message: error.message
      });
    }
  }
);

module.exports = router;
