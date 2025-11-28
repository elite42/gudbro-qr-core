# Test Examples - Artistic QR

## Test 1: Basic Generation (Preset Style)

```bash
curl -X POST http://localhost:3001/qr/artistic \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://gudbro.com",
    "style": "sunset"
  }'

# Expected Response:
{
  "status": "queued",
  "jobId": "abc123",
  "estimatedCost": "$0.03",
  "estimatedTime": "5-10 seconds",
  "checkStatusUrl": "/qr/artistic/abc123"
}
```

## Test 2: Check Job Status

```bash
# Immediately after (still processing)
curl http://localhost:3001/qr/artistic/abc123

Response:
{
  "status": "active",
  "progress": 0
}

# After 5-10 seconds (completed)
curl http://localhost:3001/qr/artistic/abc123

Response:
{
  "status": "completed",
  "result": {
    "gcsUrl": "https://storage.googleapis.com/qr-images-artistic/artistic/abc123.png",
    "replicateUrl": "https://replicate.delivery/pbxt/...",
    "prompt": "Beautiful sunset over mountains, golden hour...",
    "url": "https://gudbro.com",
    "style": "sunset",
    "timestamp": "2025-10-30T03:00:00.000Z"
  }
}
```

## Test 3: Cache Hit (Same Request)

```bash
# Same request again
curl -X POST http://localhost:3001/qr/artistic \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://gudbro.com",
    "style": "sunset"
  }'

# Instant response from cache:
{
  "status": "completed",
  "cached": true,
  "result": {
    "gcsUrl": "https://storage.googleapis.com/...",
    ...
  }
}
```

## Test 4: Custom Prompt

```bash
curl -X POST http://localhost:3001/qr/artistic \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://restaurant.com",
    "customPrompt": "Italian restaurant, pasta and wine, warm lighting, rustic wooden table, delicious food photography",
    "options": {
      "conditioningScale": 1.3,
      "steps": 35
    }
  }'
```

## Test 5: List Available Styles

```bash
curl http://localhost:3001/qr/artistic/styles

Response:
{
  "styles": {
    "sunset": {
      "name": "Golden Sunset",
      "icon": "🌅",
      "category": "nature",
      "prompt": "Beautiful sunset over mountains..."
    },
    "cyberpunk": {
      "name": "Cyberpunk City",
      "icon": "🌃",
      "category": "urban",
      "prompt": "Futuristic cyberpunk city..."
    },
    ...
  },
  "categories": ["nature", "urban", "artistic", "business", "food", "seasonal"]
}
```

## Test 6: Filter by Category

```bash
curl http://localhost:3001/qr/artistic/styles?category=food

Response:
{
  "category": "food",
  "styles": {
    "food": {
      "name": "Gourmet Food",
      "prompt": "Delicious gourmet food photography..."
    },
    "coffee": {
      "name": "Coffee Shop",
      "prompt": "Cozy coffee shop aesthetic..."
    }
  }
}
```

## Test 7: All Styles Quick Test

```bash
#!/bin/bash
# test-all-styles.sh

STYLES=("sunset" "cyberpunk" "watercolor" "anime" "minimalist" "food")

for style in "${STYLES[@]}"; do
  echo "Testing style: $style"
  curl -X POST http://localhost:3001/qr/artistic \
    -H "Content-Type: application/json" \
    -d "{\"url\":\"https://test.com\",\"style\":\"$style\"}"
  echo -e "\n---\n"
  sleep 1
done
```

## Test 8: Error Handling

### Invalid URL
```bash
curl -X POST http://localhost:3001/qr/artistic \
  -H "Content-Type: application/json" \
  -d '{"url": "not-a-url", "style": "sunset"}'

Response:
{
  "error": "Invalid URL"
}
```

### Missing URL
```bash
curl -X POST http://localhost:3001/qr/artistic \
  -H "Content-Type: application/json" \
  -d '{"style": "sunset"}'

Response:
{
  "error": "URL is required"
}
```

### Invalid Style
```bash
curl -X POST http://localhost:3001/qr/artistic \
  -H "Content-Type: application/json" \
  -d '{"url": "https://test.com", "style": "invalid"}'

Response:
{
  "error": "Style \"invalid\" not found"
}
```

## Test 9: Node.js Integration

```javascript
import axios from 'axios';

async function generateArtisticQR(url, style) {
  // 1. Start generation
  const { data } = await axios.post('http://localhost:3001/qr/artistic', {
    url,
    style
  });

  if (data.cached) {
    console.log('✅ Cache hit!');
    return data.result;
  }

  // 2. Poll for completion
  const jobId = data.jobId;
  console.log(`⏳ Job queued: ${jobId}`);

  while (true) {
    await new Promise(r => setTimeout(r, 2000)); // Wait 2s
    
    const status = await axios.get(`http://localhost:3001/qr/artistic/${jobId}`);
    
    if (status.data.status === 'completed') {
      console.log('✅ Completed!');
      return status.data.result;
    }
    
    if (status.data.status === 'failed') {
      throw new Error('Generation failed');
    }
    
    console.log(`⏳ Status: ${status.data.status}`);
  }
}

// Test
const result = await generateArtisticQR('https://gudbro.com', 'sunset');
console.log('Image URL:', result.gcsUrl);
```

## Test 10: React Integration

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

function useArtisticQR(url: string, style: string) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function generate() {
    setStatus('loading');
    
    try {
      const { data } = await axios.post('/qr/artistic', { url, style });
      
      if (data.cached) {
        setResult(data.result);
        setStatus('success');
        return;
      }

      // Poll
      const jobId = data.jobId;
      const interval = setInterval(async () => {
        const res = await axios.get(`/qr/artistic/${jobId}`);
        
        if (res.data.status === 'completed') {
          setResult(res.data.result);
          setStatus('success');
          clearInterval(interval);
        } else if (res.data.status === 'failed') {
          setError(res.data.error);
          setStatus('error');
          clearInterval(interval);
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return { generate, status, result, error };
}

// Usage
function ArtisticQRDemo() {
  const { generate, status, result } = useArtisticQR('https://gudbro.com', 'sunset');

  return (
    <div>
      <button onClick={generate} disabled={status === 'loading'}>
        {status === 'loading' ? 'Generating...' : 'Generate'}
      </button>
      
      {result && <img src={result.gcsUrl} alt="QR" />}
    </div>
  );
}
```

## Test 11: Load Test

```bash
# Apache Bench - 100 requests, 10 concurrent
ab -n 100 -c 10 -p payload.json -T application/json \
  http://localhost:3001/qr/artistic

# payload.json:
{"url":"https://test.com","style":"sunset"}
```

## Test 12: Monitor Queue

```javascript
import { artisticQRQueue } from './workers/queue-worker.js';

// Get queue stats
const waiting = await artisticQRQueue.getWaitingCount();
const active = await artisticQRQueue.getActiveCount();
const completed = await artisticQRQueue.getCompletedCount();
const failed = await artisticQRQueue.getFailedCount();

console.log({
  waiting,
  active,
  completed,
  failed
});
```

## Expected Results

| Test | Expected Time | Expected Cost | Cache Hit? |
|------|---------------|---------------|------------|
| First generation | 5-10s | $0.02-0.05 | No |
| Cache hit | <100ms | $0 | Yes |
| Custom prompt | 8-12s | $0.03-0.06 | No |
| List styles | <50ms | $0 | N/A |

## Troubleshooting

**Issue:** Job stays in "queued" forever  
**Fix:** Check worker is running: `npm run worker`

**Issue:** "REPLICATE_API_TOKEN not found"  
**Fix:** Set in .env file

**Issue:** GCS upload fails  
**Fix:** Check GOOGLE_APPLICATION_CREDENTIALS path

**Issue:** Redis connection error  
**Fix:** Ensure Redis running: `redis-cli ping`

---

**All tests should pass** ✅
