import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('QR Code Generator - Main Selector', () => {
  test('should display main QR selector page with all 19 types', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr`);

    // Check page title
    await expect(page.locator('h1')).toContainText('QR Code Generator');

    // Check Essential category (6 types)
    await expect(page.locator('text=Essential QR Types')).toBeVisible();
    await expect(page.locator('text=SMS')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=WiFi')).toBeVisible();
    await expect(page.locator('text=Social')).toBeVisible();
    await expect(page.locator('text=Event')).toBeVisible();
    await expect(page.locator('text=vCard')).toBeVisible();

    // Check Asia-Pacific category (5 types)
    await expect(page.locator('text=Asia-Pacific')).toBeVisible();
    await expect(page.locator('text=Zalo')).toBeVisible();
    await expect(page.locator('text=KakaoTalk')).toBeVisible();
    await expect(page.locator('text=LINE')).toBeVisible();
    await expect(page.locator('text=WeChat Pay')).toBeVisible();
    await expect(page.locator('text=VietQR')).toBeVisible();

    // Check Standard category (8 types)
    await expect(page.locator('text=Standard QR Types')).toBeVisible();
    await expect(page.locator('text=PDF')).toBeVisible();
    await expect(page.locator('text=App Store')).toBeVisible();
    await expect(page.locator('text=Video')).toBeVisible();
    await expect(page.locator('text=Audio')).toBeVisible();
    await expect(page.locator('text=Multi-URL')).toBeVisible();
    await expect(page.locator('text=Business Page')).toBeVisible();
    await expect(page.locator('text=Coupon')).toBeVisible();
    await expect(page.locator('text=Feedback Form')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/qr-selector.png', fullPage: true });
  });

  test('should navigate to SMS form when clicked', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr`);

    // Click on SMS card
    await page.click('text=SMS');

    // Check we're on SMS page
    await expect(page).toHaveURL(`${BASE_URL}/qr/create/sms`);
    await expect(page.locator('h1')).toContainText('SMS QR Code');
  });
});

test.describe('QR Forms - Simple Forms', () => {
  test('SMS QR - Complete flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/sms`);

    // Check form is visible
    await expect(page.locator('h1')).toContainText('SMS QR Code');

    // Fill form
    await page.fill('input[placeholder*="phone" i]', '+1234567890');
    await page.fill('textarea[placeholder*="message" i]', 'Test SMS message from automated test');

    // Take screenshot of filled form
    await page.screenshot({ path: 'test-results/sms-filled.png', fullPage: true });

    // Click generate button
    await page.click('button:has-text("Generate QR Code")');

    // Wait for QR code to appear
    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });

    // Check QR code is visible
    const qrImage = page.locator('img[alt*="QR" i]');
    await expect(qrImage).toBeVisible();

    // Check success message
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    // Check Download button is visible
    await expect(page.locator('button:has-text("Download")')).toBeVisible();

    // Check Create Another button is visible
    await expect(page.locator('button:has-text("Create Another")')).toBeVisible();

    // Take screenshot of result
    await page.screenshot({ path: 'test-results/sms-result.png', fullPage: true });
  });

  test('Email QR - Complete flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/email`);

    await expect(page.locator('h1')).toContainText('Email QR Code');

    // Fill form
    await page.fill('input[placeholder*="email" i]', 'test@example.com');
    await page.fill('input[placeholder*="subject" i]', 'Test Subject');
    await page.fill('textarea[placeholder*="body" i]', 'Test email body content');

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    // Wait for result
    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    await page.screenshot({ path: 'test-results/email-result.png', fullPage: true });
  });

  test('WiFi QR - Complete flow with encryption', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/wifi`);

    await expect(page.locator('h1')).toContainText('WiFi QR Code');

    // Fill form
    await page.fill('input[placeholder*="network" i], input[placeholder*="ssid" i]', 'TestNetwork');

    // Select WPA encryption
    await page.click('button:has-text("WPA")');

    // Password field should appear
    await page.fill('input[type="password"], input[placeholder*="password" i]', 'SecurePass123');

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    // Wait for result
    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    await page.screenshot({ path: 'test-results/wifi-result.png', fullPage: true });
  });
});

test.describe('QR Forms - Asia-Pacific', () => {
  test('VietQR - Load banks and create QR', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/vietqr`);

    await expect(page.locator('h1')).toContainText('VietQR');

    // Wait for banks to load
    await page.waitForTimeout(1000);

    // Select a bank
    const bankSelect = page.locator('select').first();
    await bankSelect.selectOption({ index: 1 }); // Select first bank

    // Fill account details
    await page.fill('input[placeholder*="account number" i]', '1234567890');
    await page.fill('input[placeholder*="account name" i]', 'Test User');
    await page.fill('input[placeholder*="amount" i], input[type="number"]', '100000');
    await page.fill('textarea[placeholder*="description" i], input[placeholder*="description" i]', 'Test payment');

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    // Wait for result
    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    await page.screenshot({ path: 'test-results/vietqr-result.png', fullPage: true });
  });

  test('Zalo QR - Complete flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/zalo`);

    await expect(page.locator('h1')).toContainText('Zalo');

    // Fill phone number
    await page.fill('input[placeholder*="phone" i]', '+84123456789');

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    await page.screenshot({ path: 'test-results/zalo-result.png', fullPage: true });
  });
});

test.describe('QR Forms - Complex Forms', () => {
  test('Multi-URL QR - Add multiple URLs and generate', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/multi-url`);

    await expect(page.locator('h1')).toContainText('Multi-URL QR Code');

    // Fill default URL
    await page.fill('input[placeholder*="https://example.com"]', 'https://default.example.com');

    // Fill first URL
    const firstUrlInput = page.locator('input[placeholder*="https://example.com/page"]').first();
    await firstUrlInput.fill('https://ios.example.com');

    // Add another URL
    await page.click('button:has-text("Add URL")');

    // Fill second URL
    await page.waitForTimeout(500);
    const urlInputs = page.locator('input[placeholder*="https://example.com/page"]');
    await urlInputs.nth(1).fill('https://android.example.com');

    // Select Android for second URL
    const deviceSelects = page.locator('select');
    await deviceSelects.nth(1).selectOption('android');

    // Take screenshot of filled form
    await page.screenshot({ path: 'test-results/multi-url-filled.png', fullPage: true });

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    // Wait for result
    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();
    await expect(page.locator('text=Smart routing is active')).toBeVisible();

    await page.screenshot({ path: 'test-results/multi-url-result.png', fullPage: true });
  });

  test('Feedback Form QR - Add questions and generate', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/feedback-form`);

    await expect(page.locator('h1')).toContainText('Feedback Form QR Code');

    // Fill title
    await page.fill('input[placeholder*="survey" i], input[placeholder*="title" i]', 'Customer Satisfaction Survey');

    // Fill first question
    const firstQuestionInput = page.locator('input[placeholder*="question" i]').first();
    await firstQuestionInput.fill('How satisfied are you with our service?');

    // Change question type to rating
    const typeSelects = page.locator('select').filter({ hasText: /text|rating|choice/i });
    if (await typeSelects.count() > 0) {
      await typeSelects.first().selectOption('rating');
    }

    // Add another question
    await page.click('button:has-text("Add Question")');
    await page.waitForTimeout(500);

    // Fill second question
    const questionInputs = page.locator('input[placeholder*="question" i]');
    if (await questionInputs.count() > 1) {
      await questionInputs.nth(1).fill('Would you recommend us to others?');

      // Change to yes/no type
      const yesNoSelects = page.locator('select').filter({ hasText: /text|rating|choice|yesno/i });
      if (await yesNoSelects.count() > 1) {
        await yesNoSelects.nth(1).selectOption('yesno');
      }
    }

    // Take screenshot of filled form
    await page.screenshot({ path: 'test-results/feedback-filled.png', fullPage: true });

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    // Wait for result
    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    await page.screenshot({ path: 'test-results/feedback-result.png', fullPage: true });
  });

  test('Business Page QR - Complete business info', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/business-page`);

    await expect(page.locator('h1')).toContainText('Business Page QR Code');

    // Fill business info
    await page.fill('input[placeholder*="Acme" i]', 'Test Company Ltd');
    await page.fill('input[placeholder*="tagline" i]', 'Your trusted partner');
    await page.fill('textarea[placeholder*="description" i]', 'We provide excellent services');

    // Fill contact info
    await page.fill('input[type="tel"], input[placeholder*="phone" i]', '+1234567890');
    await page.fill('input[type="email"], input[placeholder*="email" i]', 'info@testcompany.com');
    await page.fill('input[placeholder*="https://example.com"]', 'https://testcompany.com');
    await page.fill('input[placeholder*="address" i]', '123 Main St, City, Country');

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    // Wait for result
    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    await page.screenshot({ path: 'test-results/business-result.png', fullPage: true });
  });
});

test.describe('QR Forms - Standard Types', () => {
  test('Audio QR - Spotify link', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/audio`);

    await expect(page.locator('h1')).toContainText('Audio QR Code');

    // Platform should default to Spotify
    await page.fill('input[placeholder*="spotify" i], input[placeholder*="track" i]', 'https://open.spotify.com/track/test123');

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    await page.screenshot({ path: 'test-results/audio-result.png', fullPage: true });
  });

  test('Coupon QR - Percentage discount', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/coupon`);

    await expect(page.locator('h1')).toContainText('Coupon QR Code');

    // Fill coupon details
    await page.fill('input[placeholder*="code" i]', 'SAVE20');
    await page.fill('input[placeholder*="title" i], input[placeholder*="name" i]', '20% Off Summer Sale');
    await page.fill('textarea[placeholder*="description" i]', 'Save 20% on all items');

    // Select percentage discount
    await page.click('button:has-text("Percentage")');

    // Enter discount value
    await page.fill('input[type="number"]', '20');

    // Generate
    await page.click('button:has-text("Generate QR Code")');

    await page.waitForSelector('img[alt*="QR" i]', { timeout: 10000 });
    await expect(page.locator('text=QR Code Generated!')).toBeVisible();

    await page.screenshot({ path: 'test-results/coupon-result.png', fullPage: true });
  });
});

test.describe('QR Forms - Validation', () => {
  test('SMS QR - Should show error for invalid phone', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/sms`);

    // Fill invalid phone
    await page.fill('input[placeholder*="phone" i]', 'invalid');
    await page.fill('textarea', 'Test message');

    // Try to generate
    await page.click('button:has-text("Generate QR Code")');

    // Should show error
    await expect(page.locator('text=/valid phone/i')).toBeVisible();

    await page.screenshot({ path: 'test-results/sms-validation-error.png', fullPage: true });
  });

  test('Email QR - Should show error for invalid email', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/email`);

    // Fill invalid email
    await page.fill('input[placeholder*="email" i]', 'invalid-email');

    // Try to generate
    await page.click('button:has-text("Generate QR Code")');

    // Should show error
    await expect(page.locator('text=/valid.*email/i')).toBeVisible();

    await page.screenshot({ path: 'test-results/email-validation-error.png', fullPage: true });
  });
});

test.describe('QR Forms - Reset Functionality', () => {
  test('Should reset form after clicking Create Another', async ({ page }) => {
    await page.goto(`${BASE_URL}/qr/create/sms`);

    // Fill and generate
    await page.fill('input[placeholder*="phone" i]', '+1234567890');
    await page.fill('textarea', 'Test message');
    await page.click('button:has-text("Generate QR Code")');

    // Wait for result
    await page.waitForSelector('img[alt*="QR" i]');

    // Click Create Another
    await page.click('button:has-text("Create Another")');

    // Form should be reset
    await expect(page.locator('button:has-text("Generate QR Code")')).toBeVisible();
    await expect(page.locator('img[alt*="QR" i]')).not.toBeVisible();

    // Input should be cleared
    const phoneInput = page.locator('input[placeholder*="phone" i]');
    await expect(phoneInput).toHaveValue('');
  });
});
