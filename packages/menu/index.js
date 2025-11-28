// Module 11: Centralized Menu Database Server
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const menuItemsRoutes = require('./backend/routes/menuItems');
const restaurantMenuRoutes = require('./backend/routes/restaurantMenu');

const app = express();
const PORT = process.env.PORT || 3011;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/menu', menuItemsRoutes);
app.use('/api/menu', restaurantMenuRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', module: 'menu-database', version: '1.0.0' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Module 11 (Menu Database) running on port ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
