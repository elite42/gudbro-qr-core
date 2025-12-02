# Integration Guide - Artistic QR → Existing Modules

## Step 1: Module 1 Integration (QR Engine)

**File:** `module-1-qr-engine/server.js`

```javascript
import express from 'express';
import artisticRouter from '../module-1-artistic-extension/routes/artistic.js';

const app = express();

// ... existing routes ...

// Add artistic QR routes
app.use('/qr', artisticRouter);

// ... rest of server setup ...
```

## Step 2: Module 7 Integration (Templates)

**Add artistic template to templates library:**

**File:** `module-7-content-templates/src/templates/artistic.js`

```javascript
export const artisticTemplate = {
  type: 'artistic',
  name: 'Artistic QR',
  icon: '🎨',
  description: 'AI-generated artistic QR code',
  
  fields: [
    {
      name: 'url',
      label: 'Destination URL',
      type: 'url',
      required: true,
      placeholder: 'https://example.com'
    },
    {
      name: 'style',
      label: 'Art Style',
      type: 'select',
      required: true,
      options: [
        { value: 'sunset', label: '🌅 Golden Sunset' },
        { value: 'cyberpunk', label: '🌃 Cyberpunk City' },
        { value: 'watercolor', label: '🎨 Watercolor' },
        { value: 'anime', label: '🎌 Anime' },
        { value: 'minimalist', label: '⚪ Minimalist' },
        { value: 'luxury', label: '✨ Luxury Gold' }
      ]
    },
    {
      name: 'customPrompt',
      label: 'Custom Prompt (optional)',
      type: 'textarea',
      required: false,
      placeholder: 'Your custom artistic description...',
      hint: 'Leave blank to use preset style'
    }
  ],

  generate: async (data) => {
    // This returns job info, not final URL
    // Frontend must poll /qr/artistic/:jobId
    return {
      type: 'artistic-async',
      data
    };
  },

  example: {
    url: 'https://gudbro.com',
    style: 'sunset'
  }
};
```

**File:** `module-7-content-templates/src/index.js`

```javascript
import { artisticTemplate } from './templates/artistic.js';

export const templates = {
  // ... existing templates ...
  artistic: artisticTemplate
};
```

## Step 3: Frontend Integration

**React component example:**

```typescript
import { useState } from 'react';
import axios from 'axios';

function ArtisticQRGenerator() {
  const [url, setUrl] = useState('');
  const [style, setStyle] = useState('sunset');
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle');

  // Generate QR
  const handleGenerate = async () => {
    setStatus('generating');
    
    const response = await axios.post('/qr/artistic', {
      url,
      style,
      options: { steps: 30 }
    });

    if (response.data.cached) {
      setResult(response.data.result);
      setStatus('completed');
    } else {
      setJobId(response.data.jobId);
      pollStatus(response.data.jobId);
    }
  };

  // Poll for completion
  const pollStatus = async (id) => {
    const interval = setInterval(async () => {
      const res = await axios.get(`/qr/artistic/${id}`);
      
      if (res.data.status === 'completed') {
        setResult(res.data.result);
        setStatus('completed');
        clearInterval(interval);
      } else if (res.data.status === 'failed') {
        setStatus('failed');
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds
  };

  return (
    <div>
      <input 
        value={url} 
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
      />
      
      <select value={style} onChange={(e) => setStyle(e.target.value)}>
        <option value="sunset">🌅 Sunset</option>
        <option value="cyberpunk">🌃 Cyberpunk</option>
        <option value="watercolor">🎨 Watercolor</option>
      </select>

      <button onClick={handleGenerate} disabled={status === 'generating'}>
        {status === 'generating' ? 'Generating...' : 'Generate Artistic QR'}
      </button>

      {status === 'generating' && (
        <p>⏳ Creating your artistic QR... (5-10 seconds)</p>
      )}

      {result && (
        <div>
          <img src={result.gcsUrl} alt="Artistic QR" width={400} />
          <a href={result.gcsUrl} download>Download</a>
        </div>
      )}
    </div>
  );
}
```

## Step 4: Database Schema Extension

**Add to PostgreSQL:**

```sql
-- Track artistic QR generations
CREATE TABLE artistic_qr_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Replicate data
  replicate_job_id VARCHAR(255),
  style VARCHAR(50),
  custom_prompt TEXT,
  
  -- URLs
  replicate_url TEXT,
  gcs_url TEXT,
  
  -- Costs
  estimated_cost DECIMAL(10, 4),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_qr_code_id (qr_code_id),
  INDEX idx_status (status)
);

-- Track costs
CREATE TABLE artistic_qr_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_generations INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 2) DEFAULT 0,
  
  INDEX idx_user_month (user_id, month)
);
```

## Step 5: Cost Tracking Service

**File:** `services/cost-tracker.js`

```javascript
import pool from './db.js';

export async function trackGeneration(userId, cost) {
  const month = new Date().toISOString().slice(0, 7) + '-01';
  
  await pool.query(`
    INSERT INTO artistic_qr_usage (user_id, month, total_generations, total_cost)
    VALUES ($1, $2, 1, $3)
    ON CONFLICT (user_id, month)
    DO UPDATE SET
      total_generations = artistic_qr_usage.total_generations + 1,
      total_cost = artistic_qr_usage.total_cost + $3
  `, [userId, month, cost]);
}

export async function getUserCosts(userId, month) {
  const result = await pool.query(
    'SELECT * FROM artistic_qr_usage WHERE user_id = $1 AND month = $2',
    [userId, month]
  );
  return result.rows[0];
}
```

## Step 6: Rate Limiting

**Prevent abuse:**

```javascript
import rateLimit from 'express-rate-limit';

const artisticQRLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req) => {
    // Free: 5/hour, Pro: 50/hour
    return req.user?.plan === 'pro' ? 50 : 5;
  },
  message: 'Too many artistic QR requests. Upgrade to Pro for higher limits.'
});

router.post('/artistic', artisticQRLimiter, async (req, res) => {
  // ... generation logic ...
});
```

## Step 7: Environment Setup

**Production .env:**

```bash
# Replicate
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Redis
REDIS_URL=redis://your-redis:6379

# GCS
GCS_BUCKET_IMAGES=qr-images-production
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Feature flags
ENABLE_ARTISTIC_QR=true
ARTISTIC_QR_FREE_LIMIT=5
ARTISTIC_QR_PRO_LIMIT=50
```

## Step 8: Docker Compose Update

**Add worker service:**

```yaml
version: '3.8'
services:
  # ... existing services ...
  
  artistic-worker:
    build: ./module-1-artistic-extension
    command: npm run worker
    environment:
      - REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}
      - REDIS_URL=redis://redis:6379
      - GCS_BUCKET_IMAGES=${GCS_BUCKET_IMAGES}
    depends_on:
      - redis
    restart: unless-stopped
```

## Testing Integration

```bash
# 1. Start all services
docker-compose up -d

# 2. Test endpoint
curl -X POST http://localhost:3000/qr/artistic \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://gudbro.com",
    "style": "sunset"
  }'

# 3. Check job status
curl http://localhost:3000/qr/artistic/{jobId}

# 4. Verify cache
redis-cli KEYS "artistic-qr:*"

# 5. Check GCS upload
gsutil ls gs://qr-images-production/artistic/
```

---

**Integration Complete** ✅

- Artistic QR accessible at `/qr/artistic`
- Async processing via Bull queue
- Cached results (7 days)
- GCS storage
- Cost tracking
- Rate limiting
