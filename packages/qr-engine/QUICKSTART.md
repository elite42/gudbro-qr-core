# Module 1: Quick Start ⚡

Get up and running in **2 minutes**.

---

## 🚀 Steps

### 1. Setup Environment

```bash
cd module-1-qr-engine
cp .env.example .env
```

### 2. Start Everything

```bash
docker-compose up -d
```

**Wait ~10 seconds** for services to start.

### 3. Initialize Database

```bash
docker-compose exec api npm run migrate
```

### 4. Test It

```bash
# Create your first QR code
curl -X POST http://localhost:3000/qr \
  -H "Content-Type: application/json" \
  -d '{"destination_url": "https://google.com", "title": "My First QR"}'
```

**You'll get:**
```json
{
  "success": true,
  "data": {
    "short_code": "abc123",
    "short_url": "http://localhost:3000/abc123",
    "qr_image": "data:image/png;base64,..."
  }
}
```

### 5. Test Redirect

```bash
# Open in browser or curl
curl -L http://localhost:3000/abc123
# → Redirects to https://google.com
```

---

## ✅ That's It!

Your QR platform is running:

- **API:** http://localhost:3000
- **Health:** http://localhost:3000/health
- **Cache Stats:** http://localhost:3000/cache/stats

---

## 📚 Full Docs

See [README.md](./README.md) for complete documentation.

---

## 🐛 Issues?

```bash
# Check logs
docker-compose logs api

# Restart everything
docker-compose restart

# Stop everything
docker-compose down
```

---

## 🎯 Next Steps

1. Create more QR codes via `POST /qr`
2. View all QR codes via `GET /qr`
3. Update QR via `PATCH /qr/:id`
4. Check analytics data in `qr_scans` table
5. Read full API docs in README.md

---

**Time to first QR:** < 2 minutes ⚡
