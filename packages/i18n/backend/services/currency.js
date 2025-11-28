const axios = require('axios');
const db = require('../db');

const BASE_CURRENCY = 'VND';
const SUPPORTED_CURRENCIES = ['VND', 'KRW', 'CNY', 'USD', 'EUR'];
const API_URL = 'https://api.exchangerate-api.com/v4/latest/VND';

class CurrencyService {
  constructor() {
    this.rates = {};
    this.lastUpdate = null;
    this.initRates();
  }

  /**
   * Initialize rates from DB or API
   */
  async initRates() {
    try {
      // Try to load from DB
      const result = await db.query(
        'SELECT target_currency, rate, updated_at FROM currency_rates WHERE base_currency = $1',
        [BASE_CURRENCY]
      );

      if (result.rows.length > 0) {
        result.rows.forEach(row => {
          this.rates[row.target_currency] = parseFloat(row.rate);
        });
        this.lastUpdate = result.rows[0].updated_at;
        console.log('[Currency] Loaded rates from DB');
      }

      // Update if older than 24h
      const age = Date.now() - new Date(this.lastUpdate).getTime();
      if (!this.lastUpdate || age > 24 * 60 * 60 * 1000) {
        await this.updateRates();
      }
    } catch (error) {
      console.error('[Currency] Init error:', error.message);
      // Use fallback rates
      this.setFallbackRates();
    }
  }

  /**
   * Update rates from API
   */
  async updateRates() {
    try {
      console.log('[Currency] Fetching rates from API...');
      const response = await axios.get(API_URL, { timeout: 5000 });
      const rates = response.data.rates;

      // Save to memory
      SUPPORTED_CURRENCIES.forEach(currency => {
        if (rates[currency]) {
          this.rates[currency] = rates[currency];
        }
      });

      // Save to DB
      for (const [currency, rate] of Object.entries(this.rates)) {
        await db.query(
          `INSERT INTO currency_rates (base_currency, target_currency, rate, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (base_currency, target_currency) 
           DO UPDATE SET rate = $3, updated_at = NOW()`,
          [BASE_CURRENCY, currency, rate]
        );
      }

      this.lastUpdate = new Date();
      console.log('[Currency] Rates updated:', this.rates);
    } catch (error) {
      console.error('[Currency] Update failed:', error.message);
      this.setFallbackRates();
    }
  }

  /**
   * Fallback rates (manual)
   */
  setFallbackRates() {
    this.rates = {
      VND: 1,
      KRW: 0.055,
      CNY: 0.00029,
      USD: 0.000040,
      EUR: 0.000037
    };
    console.log('[Currency] Using fallback rates');
  }

  /**
   * Convert amount
   */
  convert(amount, targetCurrency = 'VND') {
    if (!SUPPORTED_CURRENCIES.includes(targetCurrency)) {
      throw new Error(`Unsupported currency: ${targetCurrency}`);
    }

    if (targetCurrency === BASE_CURRENCY) {
      return amount;
    }

    const rate = this.rates[targetCurrency];
    if (!rate) {
      throw new Error(`Rate not available for ${targetCurrency}`);
    }

    return Math.round(amount * rate * 100) / 100;
  }

  /**
   * Format amount with currency symbol
   */
  format(amount, currency = 'VND', language = 'en') {
    const symbols = {
      VND: '₫',
      KRW: '₩',
      CNY: '¥',
      USD: '$',
      EUR: '€'
    };

    const formatted = new Intl.NumberFormat(language, {
      minimumFractionDigits: currency === 'VND' ? 0 : 2,
      maximumFractionDigits: currency === 'VND' ? 0 : 2
    }).format(amount);

    const symbol = symbols[currency] || currency;

    if (currency === 'USD' || currency === 'EUR') {
      return `${symbol}${formatted}`;
    } else {
      return `${formatted} ${symbol}`;
    }
  }

  /**
   * Get all rates
   */
  getRates() {
    return { ...this.rates, lastUpdate: this.lastUpdate };
  }
}

const currencyService = new CurrencyService();

module.exports = currencyService;
