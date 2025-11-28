const SUPPORTED_LANGUAGES = ['vn', 'ko', 'cn', 'en'];
const DEFAULT_LANGUAGE = 'en';

/**
 * Detect user language from:
 * 1. Query param ?lang=vn
 * 2. Cookie
 * 3. Accept-Language header
 * 4. Default to EN
 */
function detectLanguage(req, res, next) {
  let lang = DEFAULT_LANGUAGE;

  // 1. Query param
  if (req.query.lang && SUPPORTED_LANGUAGES.includes(req.query.lang)) {
    lang = req.query.lang;
  }
  // 2. Cookie
  else if (req.cookies.lang && SUPPORTED_LANGUAGES.includes(req.cookies.lang)) {
    lang = req.cookies.lang;
  }
  // 3. Accept-Language header
  else if (req.headers['accept-language']) {
    const browserLang = req.headers['accept-language'].split(',')[0].split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang)) {
      lang = browserLang;
    }
  }

  // Set language in request
  req.language = lang;

  // Update cookie (expires in 1 year)
  res.cookie('lang', lang, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  next();
}

module.exports = { detectLanguage, SUPPORTED_LANGUAGES };
