# Artistic QR Generator

AI-powered artistic QR codes using Replicate Stable Diffusion.

## Features

- 18 preset styles (sunset, cyberpunk, watercolor, etc.)
- Custom prompts
- Async generation via Bull queue
- Redis caching (7 days)
- GCS storage
- Cost: ~$0.02-0.05 per QR

## Setup

```bash
# Install
npm install

# Configure
cp .env.example .env
# Edit: REPLICATE_API_TOKEN, REDIS_URL, GCS_BUCKET_IMAGES

# Start API server
npm start

# Start worker (separate terminal)
npm run worker
```

## API Endpoints

### Generate Artistic QR
```bash
POST /qr/artistic
{
  "url": "https://gudbro.com",
  "style": "sunset",
  "options": {
    "conditioningScale": 1.5,
    "steps": 30
  }
}

Response:
{
  "status": "queued",
  "jobId": "123",
  "estimatedCost": "$0.03",
  "checkStatusUrl": "/qr/artistic/123"
}
```

### Check Status
```bash
GET /qr/artistic/:jobId

Response (completed):
{
  "status": "completed",
  "result": {
    "gcsUrl": "https://storage.googleapis.com/...",
    "replicateUrl": "https://replicate.delivery/...",
    "prompt": "Beautiful sunset...",
    "style": "sunset"
  }
}
```

### List Styles
```bash
GET /qr/artistic/styles

Response:
{
  "styles": {
    "sunset": { "name": "Golden Sunset", "category": "nature" },
    "cyberpunk": { "name": "Cyberpunk City", "category": "urban" },
    ...
  },
  "categories": ["nature", "urban", "artistic", "business", "food", "seasonal"]
}
```

## Integration with Module 1

```javascript
// In module-1/routes/qr.js
import artisticRouter from '../artistic-extension/routes/artistic.js';
app.use('/qr', artisticRouter);
```

## Cost Optimization

- Cache hits = $0 (7 day TTL)
- Typical hit rate: 40-60% after week 1
- 1000 QR/month = $20-50 (depends on cache hits)

## Production Deployment

1. Set `REPLICATE_API_TOKEN` in secrets
2. Scale worker instances based on queue depth
3. Monitor costs via Replicate dashboard
4. Set budget alerts

## Test

```bash
npm test
```

## Architecture

```
Client → POST /qr/artistic → Redis cache check
                                    ↓ miss
                              Bull Queue → Worker
                                             ↓
                                    Replicate API (5-10s)
                                             ↓
                                       Upload GCS
                                             ↓
                                       Cache result
                                             ↓
                                    Return URL to client
```

---

**Version:** 1.0.0  
**License:** MIT
