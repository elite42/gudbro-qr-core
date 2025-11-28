# Module 4: Bulk Operations - Quick Start

Get up and running in 5 minutes! ⚡

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Redis server running

---

## Setup Steps

### 1. Install Redis (if not installed)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Ubuntu:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

**Windows:**
Download from: https://redis.io/download

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
```

### 4. Start the API Server

```bash
npm run dev
```

Server running on: http://localhost:3003

### 5. Start the Worker (in another terminal)

```bash
cd backend
npm run dev:worker
```

---

## Test It! 🧪

### 1. Download CSV Template

```bash
curl http://localhost:3003/api/bulk/template -o template.csv
```

### 2. Edit Template

Open `template.csv` and add your URLs:
```csv
destination_url,title,folder,description
https://example.com/1,Product 1,Marketing,First product
https://example.com/2,Product 2,Marketing,Second product
```

### 3. Upload CSV

```bash
curl -X POST http://localhost:3003/api/bulk/upload \
  -F "file=@template.csv"
```

Response:
```json
{
  "job_id": "abc-123-def",
  "status": "queued",
  "total_rows": 2
}
```

### 4. Check Status

```bash
curl http://localhost:3003/api/jobs/abc-123-def
```

### 5. Download Results (when completed)

**CSV:**
```bash
curl http://localhost:3003/api/jobs/abc-123-def/results?format=csv -o results.csv
```

**ZIP with images:**
```bash
curl http://localhost:3003/api/jobs/abc-123-def/results?format=zip -o qr-codes.zip
```

---

## Quick Commands Reference

```bash
# Start API
npm run dev

# Start Worker
npm run dev:worker

# Check Health
curl http://localhost:3003/health

# Get Template
curl http://localhost:3003/api/bulk/template -o template.csv

# Upload CSV
curl -X POST http://localhost:3003/api/bulk/upload -F "file=@data.csv"

# Check Job Status
curl http://localhost:3003/api/jobs/{JOB_ID}

# Download CSV Results
curl http://localhost:3003/api/jobs/{JOB_ID}/results?format=csv -o results.csv

# Download ZIP Results
curl http://localhost:3003/api/jobs/{JOB_ID}/results?format=zip -o qr-codes.zip

# Cancel Job
curl -X POST http://localhost:3003/api/jobs/{JOB_ID}/cancel

# List All Jobs
curl http://localhost:3003/api/jobs

# Get Stats
curl http://localhost:3003/api/bulk/stats
```

---

## Troubleshooting

**Redis not running:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
Solution:
```bash
redis-server
```

**Worker not processing:**
- Make sure worker is running: `npm run dev:worker`
- Check Redis connection
- View worker logs

**Job stuck:**
- Cancel job: `curl -X POST http://localhost:3003/api/jobs/{ID}/cancel`
- Restart worker

---

## Next Steps

✅ Integration with Module 1 (see [README.md](./README.md))  
✅ Add authentication  
✅ Deploy to production  
✅ Monitor with Bull Board  

---

**Ready to go!** 🚀

Check the full [README.md](./README.md) for API documentation and advanced features.
