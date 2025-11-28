# Module 3: Integration with Module 1

> **How to integrate Customization System with QR Engine Core**

This guide explains how to integrate Module 3 (Customization) with Module 1 (QR Engine).

---

## 🎯 Integration Strategy

There are **2 approaches**:

1. **Standalone** - Run Module 3 as separate service (recommended for development)
2. **Integrated** - Merge into Module 1 (recommended for production)

---

## 🔧 Approach 1: Standalone Services (Development)

Run both modules independently and connect via API.

### Architecture

```
┌─────────────────┐       ┌─────────────────┐
│   Module 1      │       │   Module 3      │
│  QR Engine      │       │ Customization   │
│  Port: 3000     │       │  Port: 3002     │
│                 │       │                 │
│ - Create QR     │       │ - Apply Design  │
│ - Redirect      │       │ - Templates     │
│ - Tracking      │       │ - Logo Upload   │
└─────────────────┘       └─────────────────┘
        ↑                          ↑
        └─────────┬────────────────┘
                  │
           ┌──────▼──────┐
           │   Frontend  │
           │  Dashboard  │
           └─────────────┘
```

### Setup Steps

**1. Start both services:**

```bash
# Terminal 1: Module 1
cd module-1-qr-engine
docker-compose up -d

# Terminal 2: Module 3 Backend
cd module-3-customization/backend
npm run dev

# Terminal 3: Module 3 Frontend
cd module-3-customization/frontend
npm run dev
```

**2. Connect frontend to both:**

Edit `frontend/.env`:
```env
VITE_QR_ENGINE_URL=http://localhost:3000/api
VITE_CUSTOMIZATION_URL=http://localhost:3002/api
```

**3. Create QR with design:**

```javascript
// In your frontend app

// Step 1: Generate QR in Module 1
const qrResponse = await fetch('http://localhost:3000/qr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destination_url: 'https://example.com',
    title: 'My QR'
  })
});
const qr = await qrResponse.json();

// Step 2: Apply custom design from Module 3
const designResponse = await fetch('http://localhost:3002/api/design/apply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: qr.destination_url,
    design: {
      foreground: '#1E3A8A',
      background: '#FFFFFF',
      pattern: 'dots'
    },
    format: 'png'
  })
});
const customQR = await designResponse.blob();

// Step 3: Upload customized QR back to Module 1
// (Optional: store custom design in Module 1 database)
```

---

## 🚀 Approach 2: Integrated System (Production)

Merge Module 3 into Module 1 for a unified service.

### Architecture

```
┌────────────────────────────────────┐
│      Integrated QR Platform        │
│           Port: 3000               │
│                                    │
│  ┌─────────────────────────────┐  │
│  │ Routes from Module 1:       │  │
│  │ - POST /qr                  │  │
│  │ - GET /:shortCode           │  │
│  │ - GET /qr/:id/analytics     │  │
│  └─────────────────────────────┘  │
│                                    │
│  ┌─────────────────────────────┐  │
│  │ Routes from Module 3:       │  │
│  │ - POST /qr/:id/design       │  │
│  │ - POST /design/upload-logo  │  │
│  │ - GET /templates            │  │
│  └─────────────────────────────┘  │
└────────────────────────────────────┘
```

### Integration Steps

**1. Copy files from Module 3 to Module 1:**

```bash
# From Module 3 root
cp -r backend/routes/design.js ../module-1-qr-engine/routes/
cp -r backend/routes/templates.js ../module-1-qr-engine/routes/
cp -r backend/utils/qrCustomizer.js ../module-1-qr-engine/utils/
cp -r backend/utils/imageProcessor.js ../module-1-qr-engine/utils/
cp -r backend/utils/validators.js ../module-1-qr-engine/utils/
```

**2. Install additional dependencies in Module 1:**

```bash
cd module-1-qr-engine
npm install sharp multer uuid
```

**3. Update Module 1 server.js:**

```javascript
// module-1-qr-engine/server.js

const express = require('express');
const qrRoutes = require('./routes/qr');
const redirectRoutes = require('./routes/redirect');
const analyticsRoutes = require('./routes/analytics');

// NEW: Add Module 3 routes
const designRoutes = require('./routes/design');
const templateRoutes = require('./routes/templates');

const app = express();

// Existing middleware
app.use(express.json());
app.use(cors());

// Existing routes
app.use('/qr', qrRoutes);
app.use('/', redirectRoutes);
app.use('/qr', analyticsRoutes);

// NEW: Module 3 routes
app.use('/design', designRoutes);
app.use('/templates', templateRoutes);

// ... rest of server.js
```

**4. Update database schema:**

Add `design_json` column to `qr_codes` table if not present:

```sql
ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS design_json JSONB DEFAULT NULL;
```

**5. Update QR creation endpoint:**

Edit `module-1-qr-engine/routes/qr.js`:

```javascript
const { generateQRWithDesign } = require('../utils/qrCustomizer');

router.post('/', async (req, res) => {
  const { destination_url, title, design } = req.body;
  
  // ... existing validation ...

  // Generate QR with optional design
  const qrImage = design 
    ? await generateQRWithDesign(destination_url, design, 'png')
    : await QRCode.toBuffer(destination_url);

  // ... save to database with design_json ...
  
  const qrCode = await db.query(
    `INSERT INTO qr_codes (destination_url, title, design_json) 
     VALUES ($1, $2, $3) RETURNING *`,
    [destination_url, title, design ? JSON.stringify(design) : null]
  );

  res.json({
    ...qrCode.rows[0],
    qr_image: qrImage.toString('base64')
  });
});
```

**6. Test integrated system:**

```bash
# Start Module 1 (now includes Module 3)
cd module-1-qr-engine
docker-compose up -d

# Test endpoint
curl -X POST http://localhost:3000/qr \
  -H "Content-Type: application/json" \
  -d '{
    "destination_url": "https://example.com",
    "design": {
      "foreground": "#1E3A8A",
      "background": "#FFFFFF",
      "pattern": "dots"
    }
  }'
```

---

## 📊 Database Schema Updates

If integrating into Module 1, update the database:

```sql
-- Add design column to qr_codes table
ALTER TABLE qr_codes 
ADD COLUMN design_json JSONB DEFAULT NULL;

-- Create templates table
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    design_json JSONB NOT NULL,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_id (user_id)
);

-- Create index on design_json for faster queries
CREATE INDEX idx_qr_codes_design ON qr_codes USING GIN (design_json);
```

---

## 🔄 API Endpoints After Integration

### Combined Endpoints

**Create QR with Design (Integrated)**
```http
POST /qr
Content-Type: application/json

{
  "destination_url": "https://example.com",
  "title": "My QR",
  "design": {
    "foreground": "#000000",
    "background": "#FFFFFF",
    "pattern": "dots",
    "eyeStyle": "rounded",
    "logo": "data:image/png;base64,..."
  }
}

Response:
{
  "id": "uuid",
  "short_code": "abc123",
  "destination_url": "https://example.com",
  "design_json": { ... },
  "qr_image": "base64..."
}
```

**Update QR Design**
```http
PATCH /qr/:id/design
Content-Type: application/json

{
  "design": {
    "foreground": "#1E3A8A",
    "pattern": "rounded"
  }
}
```

**Get QR with Design**
```http
GET /qr/:id

Response:
{
  "id": "uuid",
  "design_json": {
    "foreground": "#000000",
    "background": "#FFFFFF",
    "pattern": "dots"
  },
  ...
}
```

---

## 🎨 Frontend Integration

### Update QR Creation Form

```javascript
// Example: React component for creating custom QR

import QREditor from './components/QREditor';

function CreateQRPage() {
  const handleCreate = async (data, design) => {
    // Create QR with design in one API call
    const response = await fetch('/qr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination_url: data,
        design: design
      })
    });
    
    const qr = await response.json();
    console.log('Created QR:', qr);
  };

  return (
    <QREditor 
      onSave={handleCreate}
    />
  );
}
```

---

## 🧪 Testing Integration

### Test Checklist

- [ ] Create QR without design (default black/white)
- [ ] Create QR with custom colors
- [ ] Create QR with pattern (dots/rounded)
- [ ] Create QR with logo
- [ ] Update existing QR design
- [ ] Save template
- [ ] Load template
- [ ] Export high-res PNG/SVG/PDF
- [ ] Verify QR codes still scan correctly

### Test Script

```bash
# Test 1: Basic QR (no design)
curl -X POST http://localhost:3000/qr \
  -H "Content-Type: application/json" \
  -d '{"destination_url": "https://example.com"}'

# Test 2: Custom design
curl -X POST http://localhost:3000/qr \
  -H "Content-Type: application/json" \
  -d '{
    "destination_url": "https://example.com",
    "design": {
      "foreground": "#1E3A8A",
      "background": "#FFFFFF",
      "pattern": "dots"
    }
  }'

# Test 3: With logo
curl -X POST http://localhost:3000/qr \
  -H "Content-Type: application/json" \
  -d '{
    "destination_url": "https://example.com",
    "design": {
      "foreground": "#000000",
      "background": "#FFFFFF",
      "logo": "data:image/png;base64,iVBORw0KG..."
    }
  }'
```

---

## 🐛 Common Integration Issues

### Issue 1: CORS Errors

**Solution:** Update CORS in Module 1:

```javascript
// module-1-qr-engine/server.js
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

---

### Issue 2: Logo Upload Fails

**Solution:** Increase body size limit:

```javascript
// module-1-qr-engine/server.js
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

### Issue 3: Design Not Saved in Database

**Solution:** Ensure `design_json` column exists:

```sql
-- Check if column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name='qr_codes' AND column_name='design_json';

-- If not, add it
ALTER TABLE qr_codes ADD COLUMN design_json JSONB;
```

---

## 📈 Performance Considerations

### Caching Designed QR Codes

Module 1's Redis cache should also cache designed QR codes:

```javascript
// Cache key includes design hash
const cacheKey = `qr:${shortCode}:${designHash}`;
await redis.set(cacheKey, qrImageBuffer, 'EX', 3600);
```

### Lazy Logo Loading

Don't process logos on every request:

```javascript
// Store processed logo separately
const logoKey = `logo:${logoHash}`;
const cached = await redis.get(logoKey);
if (cached) return cached;
```

---

## ✅ Production Checklist

Before deploying integrated system:

- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] File upload directory exists and is writable
- [ ] Redis configured for cache
- [ ] Nginx/reverse proxy configured
- [ ] SSL certificates installed
- [ ] Monitoring enabled
- [ ] Backup strategy in place
- [ ] Load testing completed

---

## 📚 Additional Resources

- [Module 1 Documentation](../module-1-qr-engine/README.md)
- [Module 3 API Reference](./README.md#api-endpoints)
- [QR Code Design Best Practices](https://www.qr-code-generator.com/qr-code-marketing/qr-codes-basics/)

---

**Integration Guide Version:** 1.0  
**Last Updated:** 2025-10-25  
**Questions?** Open a GitHub issue or contact support
