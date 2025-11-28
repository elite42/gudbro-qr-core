# Module 10: i18n System

Multi-language and multi-currency support for QR Platform.

## Features

- ✅ 4 languages: Vietnamese, Korean, Chinese, English
- ✅ Multi-currency display (VND, KRW, CNY, USD, EUR)
- ✅ Automatic language detection
- ✅ Real-time currency conversion
- ✅ Cookie-based persistence
- ✅ Fallback rates if API fails

## Installation

```bash
npm install
npm run migrate
npm start
```

## API Endpoints

### i18n

**GET /api/i18n/:lang**
```bash
curl http://localhost:3010/api/i18n/en
```

**POST /api/i18n/reload** (admin)
```bash
curl -X POST http://localhost:3010/api/i18n/reload
```

### Currency

**GET /api/currency/rates**
```bash
curl http://localhost:3010/api/currency/rates
```

**POST /api/currency/convert**
```bash
curl -X POST http://localhost:3010/api/currency/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "from": "VND", "to": "USD"}'
```

**POST /api/currency/update** (admin)
```bash
curl -X POST http://localhost:3010/api/currency/update
```

## Frontend Usage

### Language Selector

```jsx
import LanguageSelector from './frontend/LanguageSelector';

function App() {
  return <LanguageSelector />;
}
```

### Translation Hook

```jsx
import { useTranslation } from './frontend/useTranslation';

function Component() {
  const { t, language } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('menu.price')}</p>
    </div>
  );
}
```

### Currency Toggle

```jsx
import CurrencyToggle from './frontend/CurrencyToggle';

function App() {
  return <CurrencyToggle />;
}
```

## Language Detection Priority

1. Query param: `?lang=vn`
2. Cookie: `lang=vn`
3. Accept-Language header
4. Default: `en`

## Translation Format

```json
{
  "common": {
    "welcome": "Welcome",
    "loading": "Loading..."
  },
  "menu": {
    "title": "Menu",
    "price": "Price"
  }
}
```

With parameters:
```javascript
t('currency.convert', { currency: 'USD' })
// Output: "Convert to USD"
```

## Currency System

**Base currency:** VND (all prices stored in database)

**Supported currencies:**
- VND (₫) - Vietnamese Dong
- KRW (₩) - Korean Won
- CNY (¥) - Chinese Yuan
- USD ($) - US Dollar
- EUR (€) - Euro

**Exchange rates:**
- API: exchangerate-api.com (free tier: 1500 req/month)
- Cache: 24h in database
- Auto-update: Daily
- Fallback: Manual rates if API fails

## Testing

```bash
npm test
```

Tests include:
- Language detection
- Translation retrieval
- Currency conversion
- Error handling

## Integration with Other Modules

### Module 9 (Hub Aggregator)

```javascript
import LanguageSelector from '../i18n/frontend/LanguageSelector';
import { useTranslation } from '../i18n/frontend/useTranslation';

function HubPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <LanguageSelector />
      <h1>{t('hub.title')}</h1>
    </div>
  );
}
```

### Module 11 (Menu Database - Future)

```javascript
const menuItem = {
  name_vn: "Cà phê sữa đá",
  name_ko: "아이스 밀크커피",
  name_cn: "冰牛奶咖啡",
  name_en: "Iced Milk Coffee",
  price_vnd: 35000
};

const displayName = menuItem[`name_${language}`];
const displayPrice = currencyService.format(
  currencyService.convert(menuItem.price_vnd, currency),
  currency
);
```

## Database Schema

- `translation_keys` - Centralized translation keys
- `translations` - Multi-language values
- `currency_rates` - Exchange rates with 24h cache

## Performance

- Translation loading: <50ms
- Language switching: <200ms
- Currency conversion: <100ms
- API rate limit: 1500/month (free tier)

## Troubleshooting

**Translations not loading:**
- Check locales/*.json files exist
- Verify file permissions
- Check console for errors

**Currency API fails:**
- Fallback rates activated automatically
- Check CURRENCY_API_URL in .env
- Manual update: POST /api/currency/update

**Wrong language detected:**
- Clear cookies and try again
- Use ?lang=vn query parameter
- Check Accept-Language header

## Environment Variables

```env
DATABASE_URL=postgresql://localhost/qr_platform
PORT=3010
NODE_ENV=development
CURRENCY_API_URL=https://api.exchangerate-api.com/v4/latest/VND
```

## Next Steps

Module 11 will use this i18n system for:
- Menu item translations (350 items × 4 languages)
- Category translations
- Allergen/dietary labels
- Search in multiple languages

---

**Version:** 1.0  
**Status:** Production Ready ✅  
**Dependencies:** PostgreSQL, Express, React
