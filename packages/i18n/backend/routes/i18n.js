const express = require('express');
const router = express.Router();
const translationService = require('../services/translation');

/**
 * GET /api/i18n/:lang
 * Get all translations for a language
 */
router.get('/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const translations = translationService.getAll(lang);
    
    res.json(translations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/i18n/reload
 * Reload translations (admin only)
 */
router.post('/reload', (req, res) => {
  try {
    translationService.reload();
    res.json({ success: true, message: 'Translations reloaded' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
