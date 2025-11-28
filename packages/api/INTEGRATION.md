# Module 6: Integration Guide

> **How to integrate API & Integrations with Module 1 (QR Engine)**

There are two approaches: **Standalone** (for development/testing) and **Integrated** (for production).

---

## 🔀 Integration Options

### Option 1: Standalone Mode ⚙️

**When to use:**
- Development and testing
- Independent deployment
- Microservices architecture

**Setup:**
- Module 1 runs on port 3000
- Module 6 runs on port 3005
- Share same PostgreSQL database
- Share same Redis instance
- Use Module 1's JWT for authentication

### Option 2: Integrated Mode 🚀 (RECOMMENDED)

**When to use:**
- Production deployment
- Single unified service
- Simpler architecture
- Better performance

**Setup:**
- Merge Module 6 routes into Module 1
- Single server on port 3000
- All features in one service

---

## 📋 Integrated Mode - Step by Step

### Step 1: Copy Files

```bash
# Navigate to Module 6
cd module-6-api-integrations/backend

# Copy routes
cp routes/api-keys.js ../../module-1-qr-engine/routes/
cp routes/webhooks.js ../../module-1-qr-engine/routes/
cp routes/usage.js ../../module-1-qr-engine/routes/

# Copy middleware
cp -r middleware ../../module-1-qr-engine/

# Copy utilities
cp utils/keyGenerator.js ../../module-1-qr-engine/utils/
cp utils/webhookSender.js ../../module-1-qr-engine/utils/
cp utils/validators.js ../../module-1-qr-engine/utils/

# Copy database schema
cp ../db/schema.sql ../../module-1-qr-engine/db/schema-module-6.sql
```

### Step 2: Install Dependencies

```bash
cd ../../module-1-qr-engine

# Add Module 6 dependencies to package.json
npm install bcrypt joi swagger-ui-express yamljs
```

### Step 3: Update Module 1 Server

Edit `module-1-qr-engine/server.js`:

```javascript
// Add at top
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

// Import Module 6 routes
const apiKeysRoutes = require('./routes/api-keys');
const webhooksRoutes = require('./routes/webhooks');
const usageRoutes = require('./routes/usage');

// Import Module 6 middleware
const { authenticateApiKey, logApiResponse } = require('./middleware/apiAuth');
const { apiKeyRateLimit } = require('./middleware/rateLimit');

// ... existing code ...

// Add Swagger documentation
try {
  const swaggerDocument = YAML.load('./docs/openapi.yaml');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('Swagger docs not available');
}

// Add Module 6 routes (protected with JWT)
app.use('/api/keys', jwtAuth, apiKeysRoutes);
app.use('/api/webhooks', jwtAuth, webhooksRoutes);
app.use('/api/usage', jwtAuth, usageRoutes);

// Add API key authentication to public QR endpoints
app.use('/api/qr', [
  optionalAuth, // Try JWT first
  authenticateApiKey, // Then try API key
  apiKeyRateLimit(), // Apply rate limits
  logApiResponse // Log usage
], qrRoutes);
```

### Step 4: Apply Database Schema

```bash
cd module-1-qr-engine

# Apply Module 6 schema additions
psql $DATABASE_URL -f db/schema-module-6.sql
```

### Step 5: Update Environment Variables

Edit `module-1-qr-engine/.env`:

```env
# ... existing vars ...

# Module 6 additions
API_KEY_ENVIRONMENT=live  # or 'test'
GLOBAL_RATE_LIMIT=1000
WEBHOOK_TIMEOUT_MS=5000
```

### Step 6: Restart Server

```bash
npm run dev
```

Module 1 now includes all Module 6 features! ✅

---

## 🔄 Webhook Integration

### Trigger Webhooks from Module 1

Edit `module-1-qr-engine/routes/qr.js`:

```javascript
const { broadcastWebhook } = require('../utils/webhookSender');

// After creating QR
router.post('/', async (req, res) => {
  // ... create QR code ...
  
  // Trigger webhook
  await broadcastWebhook(req.app.locals.db, 'qr.created', {
    qr_code_id: newQR.id,
    short_code: newQR.short_code,
    destination_url: newQR.destination_url,
    created_by: req.user.id
  });
  
  res.json(newQR);
});

// After tracking scan
router.post('/track', async (req, res) => {
  // ... track scan ...
  
  // Trigger webhook
  await broadcastWebhook(req.app.locals.db, 'scan', {
    qr_code_id: scan.qr_code_id,
    scan_id: scan.id,
    location: scan.location,
    device: scan.device
  });
  
  res.sendStatus(200);
});
```

---

## 🔐 Authentication Flow

### Option A: JWT Only (User Actions)

```
User → Login → JWT Token → API Endpoints
```

### Option B: API Key (External Apps)

```
External App → API Key → Public Endpoints
```

### Option C: Both (Flexible)

```javascript
// In routes, check both
const auth = optionalAuth || authenticateApiKey;

app.get('/api/qr', auth, (req, res) => {
  // req.user (from JWT) or req.apiKey (from API key)
  const userId = req.user?.id || req.apiKey?.user_id;
  
  // ... handle request ...
});
```

---

## 📊 Rate Limiting Strategy

### Per API Key

```javascript
app.use('/api/*', apiKeyRateLimit());
```

### Global (by IP)

```javascript
app.use('/api/*', globalRateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 1000
}));
```

### Custom (per endpoint)

```javascript
app.post('/api/qr', customRateLimit(10, 60000)); // 10 req/min
```

---

## 🧪 Testing Integration

### Test API Key Creation

```bash
# Using JWT from Module 1
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key","permissions":["read"]}'
```

### Test API Key Usage

```bash
# Using generated API key
curl http://localhost:3000/api/qr \
  -H "Authorization: Bearer $API_KEY"
```

### Test Webhook

```bash
# Create webhook
curl -X POST http://localhost:3000/api/webhooks \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"url":"https://webhook.site/...","events":["scan"]}'

# Trigger event (scan QR)
# Check webhook receiver
```

---

## 📁 File Structure (Integrated)

```
/module-1-qr-engine
├── server.js              # Updated with Module 6 routes
├── routes/
│   ├── qr.js             # Original + webhooks
│   ├── redirect.js       # Original
│   ├── api-keys.js       # From Module 6
│   ├── webhooks.js       # From Module 6
│   └── usage.js          # From Module 6
├── middleware/
│   ├── auth.js           # Original JWT auth
│   ├── apiAuth.js        # From Module 6
│   └── rateLimit.js      # From Module 6
├── utils/
│   ├── qrGenerator.js    # Original
│   ├── keyGenerator.js   # From Module 6
│   ├── webhookSender.js  # From Module 6
│   └── validators.js     # From Module 6
└── db/
    ├── schema.sql        # Original
    └── schema-module-6.sql # Module 6 additions
```

---

## 🔄 Migration Checklist

- [ ] Files copied to Module 1
- [ ] Dependencies installed
- [ ] Server.js updated
- [ ] Database schema applied
- [ ] Environment variables updated
- [ ] Server restarted
- [ ] API key creation works
- [ ] API key authentication works
- [ ] Webhook creation works
- [ ] Webhook delivery works
- [ ] Usage analytics works
- [ ] Swagger UI accessible

---

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
API_KEY_ENVIRONMENT=live
```

### Docker Compose (Integrated)

```yaml
services:
  qr-platform:
    build: ./module-1-qr-engine
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ...
      REDIS_URL: ...
    depends_on:
      - postgres
      - redis
```

---

## 💡 Best Practices

### 1. Use API Keys for External Access
```javascript
// Good: External app uses API key
app.get('/api/qr', authenticateApiKey, ...);

// Bad: Exposing JWT to external apps
```

### 2. Separate Rate Limits
```javascript
// User actions: higher limit
app.use('/user/*', jwtAuth, customRateLimit(500));

// Public API: lower limit
app.use('/api/*', apiKeyRateLimit()); // Default 100
```

### 3. Log Everything
```javascript
// Module 6 already logs API usage
app.use(logApiResponse);
```

### 4. Monitor Webhooks
```sql
-- Check failed deliveries
SELECT * FROM webhook_deliveries 
WHERE succeeded = false 
AND delivered_at > NOW() - INTERVAL '1 day';
```

---

## 🆘 Troubleshooting

### "Cannot find module 'bcrypt'"
```bash
npm install bcrypt
```

### "apiAuth is not a function"
Check import paths in server.js

### Webhooks not firing
1. Check webhook is active
2. Verify `broadcastWebhook` is called
3. Check delivery logs

### Rate limits not working
1. Verify Redis is running
2. Check Redis connection in logs
3. Test with multiple requests

---

## 📚 Related Documentation

- [Module 1 README](../../module-1-qr-engine/README.md)
- [Module 6 README](../README.md)
- [API Reference](./API-REFERENCE.md)
- [Swagger UI](http://localhost:3000/docs)

---

**Integration Complete!** 

You now have a unified QR Platform with full API capabilities! 🎉
