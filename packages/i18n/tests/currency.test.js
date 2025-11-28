const request = require('supertest');
const app = require('../index');

describe('Currency API', () => {
  test('GET /api/currency/rates - should return rates', async () => {
    const response = await request(app)
      .get('/api/currency/rates')
      .expect(200);

    expect(response.body).toHaveProperty('rates');
    expect(response.body.rates).toHaveProperty('VND', 1);
  });

  test('POST /api/currency/convert - should convert VND to USD', async () => {
    const response = await request(app)
      .post('/api/currency/convert')
      .send({ amount: 50000, from: 'VND', to: 'USD' })
      .expect(200);

    expect(response.body).toHaveProperty('from');
    expect(response.body).toHaveProperty('to');
    expect(response.body.to.amount).toBeGreaterThan(0);
  });

  test('POST /api/currency/convert - should handle invalid amount', async () => {
    const response = await request(app)
      .post('/api/currency/convert')
      .send({ amount: 'invalid', to: 'USD' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});
