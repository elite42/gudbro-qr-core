const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { detectLanguage } = require('./backend/middleware/i18n');
const i18nRoutes = require('./backend/routes/i18n');
const currencyRoutes = require('./backend/routes/currency');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(detectLanguage);

app.use('/api/i18n', i18nRoutes);
app.use('/api/currency', currencyRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    language: req.language,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3010;

app.listen(PORT, () => {
  console.log(`[i18n Module] Running on port ${PORT}`);
  console.log(`[i18n] Supported languages: vn, ko, cn, en`);
});

module.exports = app;
