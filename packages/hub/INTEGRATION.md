# Module 9 - Integration Guide

## Integration with Existing Modules

### Module 1 (QR Engine) Integration

**Auto-generate QR for new hubs:**

```javascript
// In hub.js route - POST /api/hub
import * as QRService from '../../module-1-qr-engine/services/qr-service.js';

// After creating hub
const qrCode = await QRService.createQR({
  user_id: userId,
  destination_url: `${process.env.BASE_URL}/${hub.short_code}`,
  title: `Hub: ${hub.title}`,
  type: 'dynamic'
});

await HubService.linkQRToHub(hub.id, qrCode.id);
```

**Redirect configuration:**

```javascript
// In module-1/routes/redirect.js
// Add hub redirect handling

router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  
  // Check if it's a hub
  const hub = await pool.query(
    'SELECT id FROM hub_pages WHERE short_code = $1 AND is_active = true',
    [shortCode]
  );
  
  if (hub.rows.length > 0) {
    // Redirect to hub renderer
    return res.redirect(`/hub/${shortCode}`);
  }
  
  // Otherwise, normal QR redirect logic
  // ...
});
```

### Module 2 (Analytics) Integration

**Track hub views:**

```javascript
// In hub-service.js - trackView()
import * as AnalyticsService from '../../module-2-analytics/services/analytics-service.js';

export async function trackView(hubId, req) {
  // Module 9 analytics
  await pool.query(
    `INSERT INTO hub_analytics (hub_page_id, event_type, ip_address, user_agent, referer)
     VALUES ($1, 'view', $2, $3, $4)`,
    [hubId, req.ip, req.get('user-agent'), req.get('referer')]
  );
  
  // Module 2 analytics (if hub has linked QR)
  const hub = await pool.query('SELECT qr_code_id FROM hub_pages WHERE id = $1', [hubId]);
  if (hub.rows[0].qr_code_id) {
    await AnalyticsService.trackScan(hub.rows[0].qr_code_id, req);
  }
}
```

**Unified analytics dashboard:**

```javascript
// New endpoint: GET /api/analytics/hub/:id
router.get('/api/analytics/hub/:id', async (req, res) => {
  const { id } = req.params;
  
  // Get hub analytics
  const hubStats = await HubService.getHubAnalytics(id, req.user.id);
  
  // Get QR analytics if linked
  const hub = await pool.query(
    'SELECT qr_code_id FROM hub_pages WHERE id = $1',
    [id]
  );
  
  let qrStats = null;
  if (hub.rows[0].qr_code_id) {
    qrStats = await AnalyticsService.getQRAnalytics(hub.rows[0].qr_code_id);
  }
  
  res.json({
    hub: hubStats,
    qr: qrStats
  });
});
```

### Module 3 (Customization) Integration

**Apply QR design to hub QR:**

```javascript
// In hub.js route - POST /api/hub
const qrCode = await QRService.createQR({
  user_id: userId,
  destination_url: `${process.env.BASE_URL}/${hub.short_code}`,
  title: `Hub: ${hub.title}`,
  type: 'dynamic',
  design: {
    color: hub.theme.primaryColor || '#000000',
    background: hub.theme.backgroundColor || '#ffffff',
    pattern: 'rounded'
  }
});
```

## Database Setup

```bash
# Run migration
psql -U your_user -d qr_platform -f db/schema.sql

# Verify tables
psql -U your_user -d qr_platform -c "\dt hub_*"
```

## Environment Variables

Add to `.env`:

```bash
# Module 9 specific
BASE_URL=https://yourdomain.com
HUB_CUSTOM_DOMAIN_ENABLED=true

# Existing
DATABASE_URL=postgresql://user:pass@localhost:5432/qr_platform
REDIS_URL=redis://localhost:6379
```

## Server Setup

```javascript
// In main server.js
import hubRoutes from './module-9-hub-aggregator/backend/routes/hub.js';
import linkRoutes from './module-9-hub-aggregator/backend/routes/links.js';

// Mount routes
app.use('/', hubRoutes);  // Public hub view
app.use('/', linkRoutes); // Link management

// Frontend rendering (if using SSR)
app.get('/hub/:shortCode', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});
```

## Frontend Build

```bash
cd frontend
npm install
npm run build

# Deploy to CDN or serve via Express
cp -r dist/* ../backend/public/
```

## Testing Integration

```bash
# 1. Create hub via API
curl -X POST http://localhost:3000/api/hub \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Restaurant",
    "template": "restaurant",
    "subtitle": "Best pizza in town"
  }'

# Response includes QR code and hub URL
# {
#   "hub": { "id": "...", "short_code": "abc123" },
#   "qr": { "id": "...", "qr_image": "base64..." }
# }

# 2. Visit hub
open http://localhost:3000/abc123

# 3. Check analytics
curl http://localhost:3000/api/hub/HUB_ID/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Flow Diagram

```
User creates hub
    ↓
POST /api/hub (Module 9)
    ↓
createHub() → generates short_code
    ↓
QRService.createQR() (Module 1) → generates QR
    ↓
linkQRToHub() → associates QR with hub
    ↓
Response: { hub, qr }

User scans QR
    ↓
GET /:shortCode (Module 1)
    ↓
Detects hub → redirect to /hub/:shortCode
    ↓
HubRenderer.jsx loads and displays
    ↓
trackView() → saves to hub_analytics + qr_scans (Module 1)

User clicks link
    ↓
POST /:shortCode/link/:linkId/click
    ↓
trackLinkClick() → saves to hub_analytics
    ↓
Opens link URL
```

## Common Issues

**Hub not loading:**
- Check `is_active` and `is_public` flags in `hub_pages`
- Verify short_code uniqueness
- Check database connection

**QR not generating:**
- Verify Module 1 is running
- Check `QRService` import path
- Ensure user has QR quota

**Analytics not tracking:**
- Verify `hub_analytics` table exists
- Check async tracking isn't throwing errors
- Look at server logs

## Next Steps

1. ✅ Run database migration
2. ✅ Test hub creation API
3. ✅ Test frontend rendering
4. ✅ Verify Module 1 integration
5. ✅ Test analytics tracking
6. Deploy to production

## Support

For issues: Check logs in `/logs/module-9.log`
