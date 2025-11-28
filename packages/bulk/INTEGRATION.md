# Module 4 Integration Guide

How to integrate Bulk Operations with Module 1 (QR Engine Core)

---

## Two Integration Approaches

### Approach 1: Standalone (Development)
- Run Module 4 as separate service
- Communicate via API calls
- Good for: Development, testing, microservices

### Approach 2: Integrated (Production)
- Merge Module 4 into Module 1
- Single unified service
- Good for: Production, simpler deployment

---

## Approach 1: Standalone Setup

### Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Module 1      │         │   Module 4      │
│  (QR Engine)    │◄────────┤  (Bulk Ops)     │
│  Port 3000      │  API    │  Port 3003      │
└─────────────────┘         └─────────────────┘
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │   Redis     │
              │   Port 6379 │
              └─────────────┘
```

### Setup

1. **Start Module 1:**
```bash
cd module-1-qr-engine
npm run dev  # Port 3000
```

2. **Start Module 4:**
```bash
cd module-4-bulk-operations/backend
npm run dev        # API on 3003
npm run dev:worker # Worker
```

### API Communication

Module 4 can call Module 1 APIs:

```javascript
// In Module 4, when generating QR codes:
const axios = require('axios');

async function saveToModule1(qrData) {
  const response = await axios.post('http://localhost:3000/qr', qrData);
  return response.data;
}
```

**Benefits:**
- ✅ Independent scaling
- ✅ Isolated failures
- ✅ Technology flexibility

**Drawbacks:**
- ❌ Network latency
- ❌ More complex deployment
- ❌ Duplicate dependencies

---

## Approach 2: Integrated Setup

### Architecture

```
┌──────────────────────────────────┐
│      Module 1 + Module 4         │
│      (Unified Service)           │
│      Port 3000                   │
│                                  │
│  ┌────────────┐  ┌────────────┐ │
│  │ QR Engine  │  │ Bulk Ops   │ │
│  │ Routes     │  │ Routes     │ │
│  └────────────┘  └────────────┘ │
└──────────────────────────────────┘
              │
       ┌──────▼──────┐
       │   Redis     │
       └─────────────┘
```

### Step 1: Copy Files

```bash
# From module-4-bulk-operations/backend

# Copy routes
cp routes/bulk.js ../module-1-qr-engine/routes/
cp routes/jobs.js ../module-1-qr-engine/routes/

# Copy workers
cp -r workers ../module-1-qr-engine/

# Copy utils (merge with existing)
cp utils/csvParser.js ../module-1-qr-engine/utils/
cp utils/jobManager.js ../module-1-qr-engine/utils/
cp utils/validators.js ../module-1-qr-engine/utils/
```

### Step 2: Update Module 1 Dependencies

```bash
cd module-1-qr-engine

# Add new dependencies
npm install bull csv-parser archiver joi
```

### Step 3: Update server.js

```javascript
// module-1-qr-engine/server.js

const bulkRoutes = require('./routes/bulk');
const jobsRoutes = require('./routes/jobs');

// ... existing code ...

// Add bulk routes
app.use('/api/bulk', bulkRoutes);
app.use('/api/jobs', jobsRoutes);

// ... rest of server code ...
```

### Step 4: Start Worker

Create `package.json` script in Module 1:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "worker": "node workers/bulkGenerator.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run worker\""
  }
}
```

Install concurrently:
```bash
npm install --save-dev concurrently
```

Start everything:
```bash
npm run dev:all
```

**Benefits:**
- ✅ Simpler deployment
- ✅ Shared dependencies
- ✅ No network overhead
- ✅ Single codebase

**Drawbacks:**
- ❌ Coupled scaling
- ❌ Single point of failure

---

## Shared Components

### Redis Connection

Both modules use the same Redis instance:

```javascript
// Shared Redis client
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = redis;
```

### Database Schema

Add to Module 1 schema:

```sql
-- Bulk jobs table (optional, for persistence)
CREATE TABLE bulk_jobs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    status VARCHAR(20) NOT NULL,
    total_rows INTEGER NOT NULL,
    processed INTEGER DEFAULT 0,
    successful INTEGER DEFAULT 0,
    failed INTEGER DEFAULT 0,
    options JSONB,
    results_path TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
```

---

## API Endpoints (Integrated)

After integration, all endpoints available under Module 1:

```
http://localhost:3000/qr              # Module 1
http://localhost:3000/api/bulk/upload # Module 4
http://localhost:3000/api/jobs/:id    # Module 4
```

---

## Production Deployment

### Docker Compose (Integrated)

```yaml
version: '3.8'

services:
  app:
    build: ./module-1-qr-engine
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://...
    depends_on:
      - postgres
      - redis

  worker:
    build: ./module-1-qr-engine
    command: node workers/bulkGenerator.js
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    deploy:
      replicas: 2  # Scale workers

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## Monitoring

### Bull Board (Job Queue Dashboard)

Add to integrated server:

```javascript
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { bulkQueue } = require('./utils/jobManager');

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(bulkQueue)],
  serverAdapter: serverAdapter
});

app.use('/admin/queues', serverAdapter.getRouter());
```

Install:
```bash
npm install @bull-board/api @bull-board/express
```

Access: http://localhost:3000/admin/queues

---

## Testing Integration

### Test Plan

1. **Standalone Test:**
```bash
# Start both modules
# Upload CSV to Module 4
# Verify QR codes generated
# Check Module 1 has QR records
```

2. **Integrated Test:**
```bash
# Start unified service + worker
# Upload CSV
# Verify results
# Check database consistency
```

---

## Migration Path

**Phase 1: Development**
- Run standalone during development
- Test features independently

**Phase 2: Testing**
- Integrate into single service
- Test thoroughly
- Performance benchmarks

**Phase 3: Production**
- Deploy integrated version
- Monitor performance
- Scale workers as needed

---

## Recommendations

**Use Standalone If:**
- Different scaling needs
- Microservices architecture
- Team working on different modules

**Use Integrated If:**
- Simpler deployment preferred
- Single team managing codebase
- Cost-conscious (fewer resources)

---

**Recommendation for Jeff:** Start with **Integrated** approach for simpler management. Can always split later if needed! 🚀
