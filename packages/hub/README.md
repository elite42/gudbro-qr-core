# Module 9: Hub Aggregator (Link-in-Bio)

> Single QR → Multiple links landing page  
> Linktree competitor integrato nella QR Platform

## 🎯 Features

- **21 Template Presets** (restaurant, hotel, coffee shop, event, fitness, salon, etc.)
- **Unlimited Links** per hub
- **Custom Branding** (logo, colors, fonts, cover image)
- **Analytics** (views, unique visitors, link clicks)
- **Password Protection** (optional)
- **Custom Domains** (optional)
- **SEO Optimized** (meta tags, OG images)
- **Auto QR Generation** (integrazione con Module 1)
- **Mobile Responsive** (PWA-ready)

## 📋 Use Cases

| Industry | Template | Links |
|----------|----------|-------|
| Restaurant | `restaurant` | Menu, Booking, Reviews, WiFi, Instagram |
| Hotel | `hotel` | Check-in, Services, Location, Contact |
| Coffee Shop | `coffeeshop` | Menu, Order Online, WiFi, Loyalty, Instagram |
| Event | `event` | Schedule, Speakers, Location, Tickets |
| Fitness | `fitness` | Classes, Membership, Booking, Training |
| Salon | `salon` | Services, Booking, Gallery, Gift Cards |

## 🚀 Quick Start

### Installation

```bash
cd module-9-hub-aggregator
npm install
```

### Database Setup

```bash
# Run migration
psql -U postgres -d qr_platform -f db/schema.sql
```

### Configuration

```bash
cp .env.example .env
# Edit .env with your settings
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Public Endpoints (No Auth)

**View Hub:**
```http
GET /:shortCode
Response: Hub page data + links
```

**Track Link Click:**
```http
POST /:shortCode/link/:linkId/click
Response: { success: true }
```

### Authenticated Endpoints

**Create Hub:**
```http
POST /api/hub
Authorization: Bearer {token}

{
  "title": "My Restaurant",
  "template": "restaurant",
  "subtitle": "Best pizza in town",
  "theme": {
    "primaryColor": "#d32f2f",
    "backgroundColor": "#fafafa"
  }
}

Response 201:
{
  "hub": {
    "id": "uuid",
    "short_code": "abc123",
    "title": "My Restaurant"
  },
  "qr": {
    "id": "uuid",
    "qr_image": "base64_png",
    "short_url": "https://qr.me/abc123"
  }
}
```

**Get User's Hubs:**
```http
GET /api/hub?page=1&limit=20
Authorization: Bearer {token}

Response:
{
  "hubs": [
    {
      "id": "uuid",
      "short_code": "abc123",
      "title": "My Restaurant",
      "view_count": 1247,
      "active_links": 7,
      "total_clicks": 356
    }
  ],
  "pagination": { "total": 5, "page": 1, "pages": 1 }
}
```

**Update Hub:**
```http
PATCH /api/hub/:id
Authorization: Bearer {token}

{
  "title": "Updated Title",
  "subtitle": "New subtitle",
  "is_active": true
}
```

**Delete Hub:**
```http
DELETE /api/hub/:id
Authorization: Bearer {token}

Response: 204 No Content
```

**Add Link:**
```http
POST /api/hub/:hubId/links
Authorization: Bearer {token}

{
  "type": "url",
  "icon": "coffee",
  "label": "View Menu",
  "url": "https://example.com/menu",
  "is_featured": true
}

Response 201: { "id": "uuid", ... }
```

**Update Link:**
```http
PATCH /api/hub/:hubId/links/:linkId
Authorization: Bearer {token}

{
  "label": "Updated Label",
  "url": "https://new-url.com",
  "display_order": 0
}
```

**Delete Link:**
```http
DELETE /api/hub/:hubId/links/:linkId
Authorization: Bearer {token}

Response: 204 No Content
```

**Reorder Links:**
```http
POST /api/hub/:hubId/links/reorder
Authorization: Bearer {token}

{
  "link_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Hub Analytics:**
```http
GET /api/hub/:id/analytics?start_date=2025-10-01&end_date=2025-10-30
Authorization: Bearer {token}

Response:
{
  "total_views": 1247,
  "unique_visitors": 892,
  "total_clicks": 356,
  "views_by_date": [
    { "date": "2025-10-29", "views": 67 },
    { "date": "2025-10-30", "views": 89 }
  ],
  "top_links": [
    { "id": "uuid", "label": "Menu", "click_count": 123 },
    { "id": "uuid", "label": "Booking", "click_count": 89 }
  ]
}
```

## 🎨 Templates

### Available Templates (21)

**Hospitality:**
- `restaurant` - Restaurants, bistros, dining
- `hotel` - Hotels, resorts, accommodations
- `coffeeshop` - Coffee shops, cafes, tea houses

**Business:**
- `retail` - Shops, boutiques, stores
- `realestate` - Property listings
- `automotive` - Car dealerships, auto repair
- `business` - Generic business

**Professional:**
- `personal` - Personal brand, portfolio
- `education` - Schools, courses, institutions
- `healthcare` - Clinics, medical practices
- `realestateagent` - Real estate agents
- `doctor` - Doctors, dentists
- `lawyer` - Law firms, legal professionals

**Health & Wellness:**
- `fitness` - Gyms, fitness studios
- `salon` - Beauty salons, spas

**Creative:**
- `artist` - Musicians, artists, creators
- `podcast` - Podcasters, audio creators

**Events:**
- `event` - Conferences, concerts, gatherings
- `wedding` - Wedding information pages

**Organizations:**
- `nonprofit` - Charities, foundations, NGOs

**Other:**
- `blank` - Start from scratch

### Template Configuration

Each template includes:
- Default color scheme
- Font family
- Button style
- Pre-configured links
- Icon suggestions

Example:
```javascript
{
  name: 'Restaurant',
  theme: {
    primaryColor: '#d32f2f',
    backgroundColor: '#fafafa',
    fontFamily: 'Playfair Display',
    borderRadius: '12px'
  },
  defaultLinks: [
    { type: 'url', icon: 'book-open', label: 'View Menu', url: '...' },
    { type: 'url', icon: 'calendar', label: 'Reserve', url: '...' }
  ]
}
```

## 🎯 Link Types

- `url` - Standard web link
- `qr` - Link to another QR code
- `email` - mailto: link
- `phone` - tel: link
- `social` - Social media profile
- `payment` - Payment/donation link
- `file` - File download

## 🎨 Theming

```javascript
{
  "primaryColor": "#000000",      // Button background
  "secondaryColor": "#ffffff",    // Button text
  "backgroundColor": "#f5f5f5",   // Page background
  "textColor": "#333333",         // Text color
  "fontFamily": "Inter",          // Font
  "borderRadius": "8px",          // Button roundness
  "buttonStyle": "solid"          // solid | outline | minimal
}
```

## 📊 Analytics

Track:
- Total views
- Unique visitors
- Views by date
- Link clicks
- Click-through rate
- Device types
- Geographic data

## 🔒 Security

- Password protection (optional)
- Private/public toggle
- User ownership verification
- SQL injection prevention
- XSS protection
- Rate limiting

## 🔗 Integration

### Module 1 (QR Engine)
Auto-generates QR for each hub. QR redirects to hub landing page.

### Module 2 (Analytics)
Unified analytics dashboard combining hub views + QR scans.

### Module 3 (Customization)
Applies theme colors to auto-generated QR codes.

See [INTEGRATION.md](INTEGRATION.md) for details.

## 📁 File Structure

```
module-9-hub-aggregator/
├── backend/
│   ├── routes/
│   │   ├── hub.js          # Hub CRUD
│   │   └── links.js        # Link management
│   ├── services/
│   │   ├── hub-service.js  # Business logic
│   │   └── link-service.js
│   └── templates/
│       └── presets.js      # 21 templates
├── frontend/
│   └── HubRenderer.jsx     # Landing page
├── db/
│   └── schema.sql
├── INTEGRATION.md
├── package.json
└── README.md
```

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

```bash
# Build frontend
cd frontend
npm run build

# Copy to backend
cp -r dist/* ../backend/public/

# Start server
cd ../backend
npm start
```

## 💰 Cost

**Per hub:**
- Database: ~1KB
- Storage: ~5KB (with logo/cover)
- QR generation: $0.001 (one-time)

**Monthly (1000 hubs, 10k views/day):**
- Database: Included
- Bandwidth: ~$5-10
- QR storage: ~$1

## 🛣️ Roadmap

- [ ] A/B testing links
- [ ] Scheduled link activation
- [ ] Custom CSS
- [ ] Analytics export (CSV/PDF)
- [ ] Multi-language support
- [ ] Email capture form
- [ ] Social proof (visitor counter)
- [ ] Link thumbnails
- [ ] Template marketplace

## 📝 License

MIT

## 🤝 Support

Issues: GitHub Issues  
Docs: [docs.qrplatform.com](https://docs.qrplatform.com)

---

**Version:** 1.0  
**Status:** Production Ready  
**Last Updated:** 2025-10-30
