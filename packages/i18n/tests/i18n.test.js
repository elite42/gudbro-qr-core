const request = require('supertest');
const app = require('../index');

describe('i18n API', () => {
  test('GET /api/i18n/en - should return English translations', async () => {
    const response = await request(app)
      .get('/api/i18n/en')
      .expect(200);

    expect(response.body).toHaveProperty('common');
    expect(response.body.common).toHaveProperty('welcome', 'Welcome');
  });

  test('GET /api/i18n/vn - should return Vietnamese translations', async () => {
    const response = await request(app)
      .get('/api/i18n/vn')
      .expect(200);

    expect(response.body.common.welcome).toBe('Chào mừng');
  });

  test('GET /api/i18n/ko - should return Korean translations', async () => {
    const response = await request(app)
      .get('/api/i18n/ko')
      .expect(200);

    expect(response.body.common.welcome).toBe('환영합니다');
  });

  test('GET /health - should detect language from cookie', async () => {
    const response = await request(app)
      .get('/health')
      .set('Cookie', ['lang=vn'])
      .expect(200);

    expect(response.body.language).toBe('vn');
  });
});
