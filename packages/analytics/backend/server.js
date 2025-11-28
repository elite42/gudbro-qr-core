const express = require('express');
const cors = require('cors');
const analyticsRoutes = require('./routes/analytics');
const campaignsRoutes = require('./routes/campaigns');
const enhancedRoutes = require('./routes/enhanced');
const conversionsRoutes = require('./routes/conversions');
const visualizationsRoutes = require('./routes/visualizations');
const dashboardsRoutes = require('./routes/dashboards');
const organizationsRoutes = require('./routes/organizations');
const enterpriseRoutes = require('./routes/enterprise');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/analytics', analyticsRoutes);
app.use('/campaigns', campaignsRoutes);
app.use('/enhanced', enhancedRoutes);
app.use('/conversions', conversionsRoutes);
app.use('/visualizations', visualizationsRoutes);
app.use('/dashboards', dashboardsRoutes);
app.use('/organizations', organizationsRoutes);
app.use('/enterprise', enterpriseRoutes);

// Health check
app.get('/health', (req, res) => res.json({
  status: 'ok',
  module: 'analytics',
  features: [
    'basic', 'campaigns', 'enhanced', 'conversions',
    'visualizations', 'dashboards', 'organizations', 'enterprise'
  ]
}));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`📊 Module 2: Analytics Backend running on port ${PORT}`);
  console.log(`  - Basic Analytics: /analytics/*`);
  console.log(`  - Campaigns: /campaigns/*`);
  console.log(`  - Enhanced Analytics: /enhanced/*`);
  console.log(`  - Conversions & Goals: /conversions/*`);
  console.log(`  - Visualizations & Heatmaps: /visualizations/*`);
  console.log(`  - Dashboards & Filters: /dashboards/*`);
  console.log(`  - Organizations (Multi-Tenant): /organizations/*`);
  console.log(`  - Enterprise (RBAC, White-Label, Rate Limiting): /enterprise/*`);
});
