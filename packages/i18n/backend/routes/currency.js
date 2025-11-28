const express = require('express');
const router = express.Router();
const currencyService = require('../services/currency');

/**
 * GET /api/currency/rates
 */
router.get('/rates', (req, res) => {
  try {
    const rates = currencyService.getRates();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/currency/convert
 */
router.post('/convert', (req, res) => {
  try {
    const { amount, from = 'VND', to = 'USD' } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    let vndAmount = amount;
    if (from !== 'VND') {
      const fromRate = currencyService.rates[from];
      vndAmount = amount / fromRate;
    }

    const converted = currencyService.convert(vndAmount, to);
    const formatted = currencyService.format(converted, to);

    res.json({
      from: { amount, currency: from },
      to: { amount: converted, currency: to },
      formatted,
      rate: currencyService.rates[to]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/currency/update
 */
router.post('/update', async (req, res) => {
  try {
    await currencyService.updateRates();
    res.json({ 
      success: true, 
      rates: currencyService.getRates() 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
