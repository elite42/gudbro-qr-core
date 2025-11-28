const fs = require('fs');
const path = require('path');

class TranslationService {
  constructor() {
    this.translations = {};
    this.loadTranslations();
  }

  /**
   * Load all locale files
   */
  loadTranslations() {
    const localesDir = path.join(__dirname, '../locales');
    const languages = ['vn', 'ko', 'cn', 'en'];

    languages.forEach(lang => {
      const filePath = path.join(localesDir, `${lang}.json`);
      if (fs.existsSync(filePath)) {
        this.translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    });

    console.log('[i18n] Loaded translations:', Object.keys(this.translations));
  }

  /**
   * Get translation for key
   * @param {string} key - Translation key (e.g., "common.welcome")
   * @param {string} lang - Language code
   * @param {object} params - Variables to replace in string
   */
  t(key, lang = 'en', params = {}) {
    const keys = key.split('.');
    let value = this.translations[lang];

    // Navigate nested keys
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }

    // Fallback to English
    if (!value && lang !== 'en') {
      return this.t(key, 'en', params);
    }

    // Return key if not found
    if (!value) {
      console.warn(`[i18n] Missing translation: ${key}`);
      return key;
    }

    // Replace params (e.g., "Hello {{name}}" with params.name)
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        value = value.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }

    return value;
  }

  /**
   * Get all translations for a language
   */
  getAll(lang = 'en') {
    return this.translations[lang] || this.translations['en'] || {};
  }

  /**
   * Reload translations (useful for hot reload)
   */
  reload() {
    this.loadTranslations();
  }
}

// Singleton instance
const translationService = new TranslationService();

module.exports = translationService;
