# Module 2: Analytics Dashboard

> **Version:** 1.0.0  
> **Status:** Production Ready  
> **Dependencies:** Module 1 (QR Engine Core)  
> **Last Updated:** 2025-10-25

Complete analytics dashboard with real-time visualizations, device tracking, geographic insights, and data export.

---

## 🎯 Features

✅ **Real-time Analytics**
- Total scans counter
- Unique visitors tracking
- Today's scans highlight
- Peak hour detection
- Average scans per day

✅ **Visualizations**
- Line chart (scans over time)
- Pie charts (devices, OS, browsers)
- Geographic table with percentages
- Responsive charts

✅ **Data Filtering**
- Custom date ranges
- Daily/hourly/weekly/monthly granularity
- Real-time updates (60s refresh)

✅ **Export Functionality**
- CSV export
- JSON export
- Full scan history
- UTM parameters included

✅ **Responsive Design**
- Mobile-friendly
- Tablet optimized
- Desktop full-screen

---

## 🏗️ Architecture

```
Module 2
├── Backend (Express routes)
│   └── 5 Analytics API endpoints
│       ├── GET /qr/:id/analytics        (Overview)
│       ├── GET /qr/:id/analytics/timeline (Time-series)
│       ├── GET /qr/:id/analytics/geo   (Geographic)
│       ├── GET /qr/:id/analytics/devices (Device stats)
│       └── GET /qr/:id/analytics/export (CSV/JSON)
│
└── Frontend (React + Vite)
    ├── Components
    │   ├── MetricCard   (KPI display)
    │   ├── LineChart    (Scans over time)
    │   ├── PieChart     (Device/OS/Browser)
    │   └── GeoTable     (Geographic data)
    ├── Pages
    │   └── Dashboard    (Main analytics view)
    └── Utils
        └── API client   (Axios integration)
```

---

## 🚀 Quick Start

### Option A: Integrated with Module 1 (Recommended)

```bash
# 1. Copy analytics routes to Module 1
cp module-2-analytics/backend/routes/analytics.js \
   module-1-qr-engine/routes/

# 2. Add routes to Module 1 server.js
# (See INTEGRATION.md for details)

# 3. Restart Module 1
cd module-1-qr-engine
docker-compose restart api

# 4. Start frontend
cd ../module-2-analytics/frontend
npm install
cp .env.example .env
npm run dev

# 5. Open dashboard
# http://localhost:5173/analytics/<QR_CODE_ID>
```

### Option B: Standalone Backend

See [INTEGRATION.md](./INTEGRATION.md) for standalone setup.

---

## 📡 API Endpoints

### 1. Analytics Overview
```http
GET /qr/:id/analytics?start_date=2025-01-01&end_date=2025-10-25

Response 200:
{
  "success": true,
  "qr_code": {
    "id": "uuid",
    "short_code": "abc123",
    "destination_url": "https://example.com",
    "title": "My QR"
  },
  "overview": {
    "total_scans": 1247,
    "unique_visitors": 892,
    "today_scans": 89,
    "avg_scans_per_day": 41.57,
    "peak_hour": 14
  },
  "devices": [
    {
      "device_type": "mobile",
      "count": 987,
      "percentage": 79.15
    }
  ],
  "operating_systems": [...],
  "browsers": [...],
  "top_countries": [...]
}
```

### 2. Timeline Data
```http
GET /qr/:id/analytics/timeline?granularity=day&start_date=2025-10-01

Response 200:
{
  "success": true,
  "granularity": "day",
  "data": [
    {
      "timestamp": "2025-10-24",
      "scans": 67,
      "unique_visitors": 45
    },
    {
      "timestamp": "2025-10-25",
      "scans": 89,
      "unique_visitors": 62
    }
  ]
}
```

**Granularity options:** `hour`, `day`, `week`, `month`

### 3. Geographic Data
```http
GET /qr/:id/analytics/geo

Response 200:
{
  "success": true,
  "countries": [
    {
      "country": "US",
      "scans": 456,
      "unique_visitors": 321,
      "percentage": 36.57
    }
  ],
  "cities": [
    {
      "country": "US",
      "city": "New York",
      "scans": 123,
      "percentage": 9.86
    }
  ]
}
```

### 4. Device Statistics
```http
GET /qr/:id/analytics/devices

Response 200:
{
  "success": true,
  "devices": [...],
  "operating_systems": [...],
  "browsers": [...],
  "top_combinations": [
    {
      "device": "mobile",
      "os": "iOS",
      "scans": 456
    }
  ]
}
```

### 5. Export Data
```http
GET /qr/:id/analytics/export?format=csv&start_date=2025-10-01

Response 200: (CSV file download)
Timestamp,IP Address,Device,OS,Browser,Country,City,...
2025-10-25T10:30:00Z,192.168.1.1,mobile,iOS,Safari,US,New York,...
```

**Format options:** `csv`, `json`

---

## 🎨 Tech Stack

**Backend:**
- Express.js routes (integrated with Module 1)
- PostgreSQL queries (aggregate functions)
- Date filtering & pagination

**Frontend:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- Chart.js + react-chartjs-2 (charts)
- React Query (data fetching)
- React Router (navigation)
- date-fns (date handling)
- Lucide React (icons)
- Axios (HTTP client)

---

## 📊 Dashboard Features

### Metrics Cards (Top Row)
- **Total Scans:** Total count + avg/day
- **Unique Visitors:** Distinct IP addresses
- **Today's Scans:** Current day count
- **Peak Hour:** Most active hour (0-23)

### Line Chart (Scans Over Time)
- X-axis: Date/time
- Y-axis: Scan count
- 2 lines: Total scans + Unique visitors
- Hover tooltips
- Smooth curves
- Gradient fill

### Pie Charts
1. **Device Breakdown:** Mobile/Desktop/Tablet
2. **Operating Systems:** iOS/Android/Windows/macOS/Linux
3. **Browsers:** Chrome/Safari/Firefox/Edge

- Legend with percentages
- Hover tooltips
- Color-coded segments

### Geographic Table
- Country/City columns
- Scan counts
- Visual percentage bars
- Sortable

### Controls
- **Date Range Picker:** Custom start/end dates
- **Refresh Button:** Manual reload
- **Export Button:** Download CSV
- **Auto-refresh:** Every 60 seconds

---

## 🔧 Configuration

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### Backend Configuration

Uses Module 1 database connection (PostgreSQL).

No additional config needed if integrated with Module 1.

---

## 📈 Performance

**Target Metrics:**

| Metric | Target | Notes |
|--------|--------|-------|
| API Response (p95) | <200ms | Aggregate queries optimized |
| Dashboard Load | <2s | Initial load with data |
| Chart Rendering | <500ms | Client-side rendering |
| Export Time (10k rows) | <3s | CSV generation |

**Optimizations:**
- SQL aggregate functions
- Database indexes on `scanned_at`, `qr_code_id`
- React Query caching (30s stale time)
- Auto-refresh (60s intervals)
- Memoized chart components

---

## 🧪 Testing

### Backend API Tests

```bash
# Test analytics overview
curl http://localhost:3000/qr/<QR_ID>/analytics | jq

# Test timeline
curl "http://localhost:3000/qr/<QR_ID>/analytics/timeline?granularity=day" | jq

# Test export
curl "http://localhost:3000/qr/<QR_ID>/analytics/export?format=json" | jq
```

### Frontend Development

```bash
cd frontend
npm run dev

# Open browser
# http://localhost:5173/analytics/<QR_ID>
```

### Generate Test Data

Run this script to generate sample scans for testing:

```bash
# In Module 1 directory
node scripts/generate-test-scans.js <QR_CODE_ID> 100
```

---

## 🐛 Troubleshooting

### No data showing

**Check:**
1. QR code has scans in `qr_scans` table
2. API endpoint returns data: `curl http://localhost:3000/qr/<ID>/analytics`
3. CORS enabled in Module 1
4. Frontend .env has correct API URL

### Charts not rendering

**Check:**
1. Chart.js registered: Check browser console
2. Data format correct: Array of objects
3. No React errors: Check console

### API errors

**Check:**
1. Module 1 running: `curl http://localhost:3000/health`
2. Analytics routes added to Module 1
3. PostgreSQL connection working
4. QR code ID valid (UUID format)

---

## 📂 Project Structure

```
module-2-analytics/
├── backend/
│   └── routes/
│       └── analytics.js         # 5 API endpoints (570 lines)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Metrics/
│   │   │   │   └── MetricCard.jsx    # KPI cards
│   │   │   └── Charts/
│   │   │       ├── LineChart.jsx     # Time-series chart
│   │   │       ├── PieChart.jsx      # Breakdown charts
│   │   │       └── GeoTable.jsx      # Geographic table
│   │   ├── pages/
│   │   │   └── Dashboard.jsx         # Main dashboard
│   │   ├── utils/
│   │   │   └── api.js                # API client
│   │   ├── App.jsx                   # Root component
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── INTEGRATION.md            # Integration guide
└── README.md                 # This file
```

---

## 🔄 Next Steps

**Module 3: Customization System**
- Visual QR editor
- Color picker
- Logo upload
- Pattern selection
- Template library

**Module 4: Bulk Operations**
- CSV upload
- Batch processing
- Progress tracking

---

## 💡 Tips

### Custom Date Ranges
Use the date picker in the dashboard header to filter data.

### Real-time Updates
Dashboard auto-refreshes every 60 seconds. Click "Refresh" for immediate update.

### Export Large Datasets
For >10k scans, export may take a few seconds. CSV format recommended for Excel.

### Mobile View
Dashboard is fully responsive. Charts adapt to screen size.

---

## 📝 License

MIT License

---

## 👥 Authors

- **Jeff D'Agostino** - Product Owner
- **Claude AI** - Development Assistant

---

**Module Status:** ✅ Production Ready  
**Last Updated:** 2025-10-25  
**Version:** 1.0.0
