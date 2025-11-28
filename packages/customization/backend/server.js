const express = require('express');
const cors = require('cors');
require('dotenv').config();

const designRoutes = require('./routes/design');
const templateRoutes = require('./routes/templates');
const exportRoutes = require('./routes/export');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/design', designRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', module: 'customization' });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🎨 Module 3: Customization Backend running on port ${PORT}`);
});

module.exports = app;
