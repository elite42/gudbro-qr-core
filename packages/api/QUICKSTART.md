# Module 6: Quick Start Guide

> **Get Module 6 running in 5 minutes!**

---

## ⚡ Fast Track

### 1. Install & Setup (2 minutes)

```bash
# Clone or extract module
cd module-6-api-integrations/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/qr_platform
REDIS_URL=redis://localhost:6379
PORT=3005
```

### 2. Start Database (1 minute)

```bash
# If using Docker
docker-compose up -d postgres redis

# Wait for services
sleep 5

# Apply schema
psql $DATABASE_URL -f ../db/schema.sql
```

### 3. Start Server (1 minute)

```bash
npm run dev
```

Server running on `http://localhost:3005` ✅

### 4. Test It! (1 minute)

```bash
# Health check
curl http://localhost:3005/health

# View API docs
open http://localhost:3005/docs
```

---

## 🔑 Create Your First API Key

```bash
# Set your JWT token (from Module 1 login)
TOKEN="your_jwt_token_here"

# Create API key
curl -X POST http://localhost:3005/api/keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First API Key",
    "permissions": ["read", "write"],
    "rate_limit": 100
  }'
```

Response:
```json
{
  "id": "...",
  "key": "qrp_test_abc123def456...",
  "key_prefix": "qrp_test_abc",
  "name": "My First API Key",
  "rate_limit": 100
}
```

**⚠️ Save the `key` value! You'll need it.**

---

## 🔔 Create Your First Webhook

```bash
# Using your JWT token
curl -X POST http://localhost:3005/api/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/your-unique-url",
    "events": ["scan", "qr.created"]
  }'
```

**Tip:** Use [webhook.site](https://webhook.site) to test webhooks!

---

## 🧪 Test API Key Authentication

```bash
# Save your API key
API_KEY="qrp_test_abc123def456..."

# Make authenticated request
curl http://localhost:3005/api/qr \
  -H "Authorization: Bearer $API_KEY"
```

You should see a successful response! ✅

---

## 📊 Check Usage Analytics

```bash
curl http://localhost:3005/api/usage \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐳 Docker Quick Start

**Even Faster!** Everything in one command:

```bash
cd module-6-api-integrations

# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f api-integrations

# Access server
curl http://localhost:3005/health
```

Done! 🎉

---

## ✅ Verification Checklist

- [ ] Server running on port 3005
- [ ] Health check returns 200 OK
- [ ] Swagger UI accessible at /docs
- [ ] API key created successfully
- [ ] Webhook created successfully
- [ ] API key authentication works
- [ ] Usage analytics returns data

---

## 🆘 Quick Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env
PORT=3006
```

**Database connection failed:**
```bash
# Check PostgreSQL is running
pg_isready

# Or use Docker
docker-compose up -d postgres
```

**Redis connection failed:**
```bash
# Check Redis is running
redis-cli ping

# Or use Docker
docker-compose up -d redis
```

---

## 🎯 What's Next?

1. **Read [README.md](./README.md)** for full features
2. **Check [API-REFERENCE.md](./API-REFERENCE.md)** for endpoints
3. **See [INTEGRATION.md](./INTEGRATION.md)** to integrate with Module 1
4. **Explore [Swagger UI](http://localhost:3005/docs)** interactively

---

**You're all set!** Module 6 is ready to use! 🚀
