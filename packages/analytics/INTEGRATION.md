# Module 2 - Integration with Module 1

## Adding Analytics Routes to Module 1

To integrate Module 2 analytics with Module 1, follow these steps:

### 1. Copy analytics routes to Module 1

```bash
cp module-2-analytics/backend/routes/analytics.js module-1-qr-engine/routes/
```

### 2. Update Module 1 server.js

Add this line after the existing routes in `module-1-qr-engine/server.js`:

```javascript
// Add this import at the top
const analyticsRoutes = require('./routes/analytics');

// Add this route after the existing routes (around line 70)
app.use('/qr', analyticsRoutes);
```

The complete routes section should look like:

```javascript
// QR management routes
app.use('/qr', qrRoutes);

// Analytics routes (MODULE 2)
app.use('/qr', analyticsRoutes);

// Redirect routes (short URLs)
app.use('/', redirectRoutes);
```

### 3. Restart Module 1 server

```bash
cd module-1-qr-engine
docker-compose restart api
```

### 4. Test analytics endpoint

```bash
# Get a QR code ID first
curl http://localhost:3000/qr | jq '.data[0].id'

# Then test analytics (replace <QR_ID> with actual ID)
curl http://localhost:3000/qr/<QR_ID>/analytics
```

You should see a JSON response with analytics data!

---

## Alternative: Run Module 2 Backend Standalone

If you prefer to keep Module 2 separate, you can run it on a different port:

### 1. Create Module 2 backend server

Create `module-2-analytics/backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/qr', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`Analytics API running on http://localhost:${PORT}`);
});
```

### 2. Update frontend API URL

In `module-2-analytics/frontend/.env`:

```
VITE_API_URL=http://localhost:3001
```

### 3. Run both servers

```bash
# Terminal 1: Module 1 (port 3000)
cd module-1-qr-engine
docker-compose up

# Terminal 2: Module 2 Backend (port 3001)
cd module-2-analytics/backend
npm install
node server.js

# Terminal 3: Module 2 Frontend (port 5173)
cd module-2-analytics/frontend
npm install
npm run dev
```

---

## Recommended Approach

**Option 1 (Recommended):** Integrate analytics routes into Module 1
- ✅ Single backend
- ✅ Simpler deployment
- ✅ Same database connection

**Option 2:** Keep Module 2 backend separate
- ✅ Complete modularity
- ✅ Independent scaling
- ⚠️ Need to manage 2 servers

Choose based on your deployment preferences!
