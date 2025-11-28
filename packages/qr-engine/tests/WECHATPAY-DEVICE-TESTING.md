# WeChat Pay Real Device Testing Checklist

## Overview
This document provides a comprehensive checklist for testing WeChat Pay QR codes with the actual WeChat mobile application.

**Implementation Phase:** Phase 1 (Static Merchant QR)
- Customers scan QR and enter amount manually in WeChat app
- Does not require full WeChat Pay API integration
- Suitable for small/medium businesses accepting Chinese tourist payments

## Prerequisites
- [ ] WeChat Pay merchant account registered
- [ ] 10-digit merchant ID obtained
- [ ] WeChat API endpoints deployed and accessible
- [ ] WeChat app installed on test devices (iOS and Android)
- [ ] Test WeChat accounts created (Chinese phone number required)
- [ ] Test devices with QR code scanning capability

## Important Notes

### Phase 1 Limitations
⚠️ **This is Phase 1 implementation:**
- QR code is **static** (merchant-level, not dynamic per-transaction)
- Customer **manually enters amount** in WeChat app
- Amount in API is for **display/record only**, not enforced
- Full transaction tracking requires Phase 2 (WeChat Pay API integration)

### WeChat Requirements
- WeChat Pay merchant account needed (apply at pay.weixin.qq.com)
- Chinese business registration typically required
- Verification process takes 1-7 days
- Static QR can be generated after merchant approval

## Testing Strategy

### 1. Basic QR Code Scanning

#### Test with Merchant ID Only
- [ ] Generate WeChat Pay QR with merchant ID: `1234567890`
- [ ] Display QR code (screen or print)
- [ ] Open WeChat app on iOS
- [ ] Tap Scan icon → Scan QR code
- [ ] Verify: WeChat recognizes as payment QR
- [ ] Verify: Payment screen opens
- [ ] Verify: Merchant info displayed (if merchant registered)
- [ ] Verify: Amount field is empty (customer enters manually)
- [ ] Repeat on Android device

#### Test with Pre-Registered Merchant
- [ ] Use real merchant ID from WeChat Pay account
- [ ] Generate QR code
- [ ] Scan with WeChat
- [ ] Verify: Merchant name displays correctly
- [ ] Verify: Merchant logo appears (if uploaded)
- [ ] Verify: Payment page looks professional

### 2. Currency Testing

#### CNY (Chinese Yuan) - Default
- [ ] Generate QR with currency: `CNY`
- [ ] Amount: `100` (for reference only)
- [ ] Scan with WeChat
- [ ] Verify: Payment screen in CNY (¥)
- [ ] Enter amount: 100 CNY
- [ ] Verify: Amount displays as ¥100
- [ ] Verify: Can proceed to payment

#### VND (Vietnamese Dong)
- [ ] Generate QR with currency: `VND`
- [ ] Amount: `500000` (for reference only)
- [ ] Scan with WeChat
- [ ] Verify: Currency handling
- [ ] Note: WeChat may convert to CNY automatically
- [ ] Note: Exchange rate may apply

### 3. Amount Testing (Reference Only)

#### Various Amounts
Test with different amounts (note: customer enters manually):
- [ ] Small: ¥10
- [ ] Medium: ¥100
- [ ] Large: ¥1000
- [ ] Very large: ¥10,000

For each:
- [ ] Generate QR with amount specified
- [ ] Scan with WeChat
- [ ] Customer enters amount manually
- [ ] Verify: Payment processes correctly
- [ ] Note: Amount in QR is for merchant reference only

#### Decimal Amounts
- [ ] Test: ¥99.99
- [ ] Test: ¥100.50
- [ ] Verify: WeChat handles decimals correctly

### 4. Payment Flow Testing

#### Complete Payment (Test Mode)
⚠️ **Use small amounts for testing (¥0.01 - ¥1.00)**

- [ ] Generate WeChat Pay QR
- [ ] Scan with WeChat app
- [ ] Enter test amount (¥0.01)
- [ ] Proceed to payment
- [ ] Use test payment method (if available)
- [ ] Or use real payment with minimum amount
- [ ] Verify: Payment confirmation shown
- [ ] Verify: Transaction recorded in WeChat wallet
- [ ] Verify: Merchant receives payment notification

#### Payment Cancellation
- [ ] Generate QR, scan with WeChat
- [ ] Enter amount
- [ ] Tap "Cancel" or back button
- [ ] Verify: Returns to scan screen
- [ ] Verify: No payment processed

### 5. Description and Order ID Testing

#### With Description
- [ ] Generate QR with description: `Gudbro Restaurant - Table 5`
- [ ] Scan with WeChat
- [ ] Note: Description may not show in Phase 1 (static QR)
- [ ] Note: Full description support requires Phase 2

#### With Order ID
- [ ] Generate QR with orderId: `ORDER-2024-001`
- [ ] Scan with WeChat
- [ ] Note: Order ID for merchant tracking only
- [ ] Note: Not visible to customer in Phase 1

#### With Chinese Description
- [ ] Generate QR with description: `餐厅付款 - 晚餐`
- [ ] Verify: No errors in QR generation
- [ ] Scan with WeChat
- [ ] Verify: QR code works correctly

### 6. Cross-Platform Testing

#### iOS Testing
Device: iPhone (iOS 12+)
- [ ] Install WeChat from App Store
- [ ] Create/login to WeChat account
- [ ] Link payment method (Chinese bank card or test card)
- [ ] Scan merchant QR code
- [ ] Verify payment flow works
- [ ] Test scanning from:
  - [ ] WeChat built-in scanner
  - [ ] iPhone camera app (may or may not open WeChat)
  - [ ] Safari browser (display QR, scan manually)

#### Android Testing
Device: Android phone (Android 6+)
- [ ] Install WeChat from Play Store (or Chinese app store)
- [ ] Create/login to WeChat account
- [ ] Link payment method
- [ ] Scan merchant QR code
- [ ] Verify payment flow works
- [ ] Test scanning from:
  - [ ] WeChat built-in scanner
  - [ ] Camera app
  - [ ] Chrome browser

### 7. Merchant ID Format Testing

#### Standard Format
- [ ] Test: `1234567890` (10 digits)
- [ ] Verify: Accepted by API
- [ ] Verify: QR generates correctly

#### With Spaces (Should Clean)
- [ ] Test: `123 456 7890`
- [ ] Verify: API cleans to `1234567890`
- [ ] Verify: QR works correctly

#### With Dashes (Should Clean)
- [ ] Test: `123-456-7890`
- [ ] Verify: API cleans to `1234567890`
- [ ] Verify: QR works correctly

### 8. QR Code Quality Testing

#### Size Testing
- [ ] Display QR at 200x200px → Scan
- [ ] Display QR at 300x300px → Scan
- [ ] Display QR at 512x512px → Scan (default)
- [ ] Display QR at 1024x1024px → Scan
- [ ] Verify all sizes scan successfully

#### Distance Testing
- [ ] Scan from 10cm distance
- [ ] Scan from 20cm distance
- [ ] Scan from 30cm distance
- [ ] Scan from 50cm distance
- [ ] Verify successful scan at all distances

#### Lighting Testing
- [ ] Scan in bright sunlight
- [ ] Scan in office lighting
- [ ] Scan in low light (restaurant ambiance)
- [ ] Scan in very dark room with phone light
- [ ] Verify successful scan in all conditions

#### Screen vs Print Testing
- [ ] Display QR on computer monitor → Scan
- [ ] Display QR on tablet → Scan
- [ ] Display QR on phone screen → Scan with another phone
- [ ] Print QR on paper (color) → Scan
- [ ] Print QR on paper (black & white) → Scan
- [ ] Print QR on table tent/menu → Scan
- [ ] Verify all mediums work

### 9. Real-World Scenarios

#### Restaurant Payment Scenario
Setup:
- Merchant ID: [Your merchant ID]
- Amount: ¥198 (reference)
- Description: "Gudbro Restaurant - Dinner"
- Order ID: "TABLE-05-001"

Test:
- [ ] Generate QR, print on table tent
- [ ] Customer scans with WeChat
- [ ] Customer enters bill amount (¥198)
- [ ] Customer completes payment
- [ ] Verify: Merchant receives payment
- [ ] Verify: Transaction traceable by order ID

#### Tourist Attraction Payment
Setup:
- Merchant ID: [Your merchant ID]
- Amount: ¥50 (ticket price)
- Description: "Entrance ticket"

Test:
- [ ] Display QR at ticket counter
- [ ] Tourist scans with WeChat
- [ ] Tourist enters ¥50
- [ ] Payment completes
- [ ] Ticket issued

#### Retail Purchase Scenario
Setup:
- Merchant ID: [Your merchant ID]
- Currency: VND (if merchant supports)
- Amount: 500,000 VND

Test:
- [ ] Customer scans QR
- [ ] Enter amount in VND or CNY (converted)
- [ ] Complete payment
- [ ] Verify exchange rate applied correctly

### 10. Error Handling

#### Invalid Merchant ID
- [ ] Generate QR with fake merchant ID
- [ ] Scan with WeChat
- [ ] Verify: WeChat shows error or generic payment page
- [ ] Verify: Cannot complete payment without valid merchant

#### Expired QR (if applicable)
- [ ] Note: Static QR does not expire
- [ ] Phase 2 dynamic QR will have expiration

#### Network Issues
- [ ] Generate QR code
- [ ] Turn off internet on mobile
- [ ] Scan QR code
- [ ] Verify: WeChat recognizes QR format
- [ ] Turn on internet
- [ ] Verify: Can proceed to payment

### 11. Security Testing

#### QR Code Tampering
- [ ] Generate legitimate QR
- [ ] Attempt to modify QR image
- [ ] Scan modified QR
- [ ] Verify: Either fails or shows wrong merchant
- [ ] Educate merchants about QR security

#### Phishing Protection
- [ ] Verify merchant name/info displayed
- [ ] Check for WeChat official payment interface
- [ ] Ensure HTTPS/secure connection indicated
- [ ] Verify merchant ID matches expected

## Test Matrix

| Merchant ID | Device | OS | Currency | Amount | Result |
|-------------|--------|-----|----------|--------|--------|
| 1234567890 | iPhone 13 | iOS 16 | CNY | ¥100 | ☐ |
| 1234567890 | Samsung S21 | Android 12 | CNY | ¥100 | ☐ |
| 9876543210 | iPhone 12 | iOS 15 | VND | 500k | ☐ |
| 9876543210 | Xiaomi Mi 11 | Android 11 | VND | 500k | ☐ |

## Success Criteria

### Must Pass (Critical)
- [ ] QR codes open WeChat Pay on both iOS and Android
- [ ] Merchant ID validates correctly (10 digits)
- [ ] Payment screen appears after scan
- [ ] Customer can enter amount manually
- [ ] Payment can be completed successfully
- [ ] Merchant receives payment notification

### Should Pass (Important)
- [ ] Both CNY and VND currencies work
- [ ] QR works from both screen and print
- [ ] Various amounts (decimal, whole) work
- [ ] Works in various lighting conditions
- [ ] Chinese characters in description don't cause errors

### Nice to Have (Optional)
- [ ] Merchant name/logo displays
- [ ] Transaction tracking works
- [ ] QR generation under 500ms
- [ ] Scan success in under 1 second

## Reporting

### For Each Test
Record:
1. Device model and OS version
2. WeChat app version
3. Merchant ID used (real or test)
4. Test result (Pass/Fail)
5. Screenshots of payment screens
6. Any error messages
7. Payment confirmation (if test payment made)
8. Notes on user experience

### Issue Template
```
**Issue:** [Brief description]
**Device:** [Model and OS version]
**WeChat Version:** [App version]
**Merchant ID:** [ID used]
**Test Case:** [Which test case]
**Steps to Reproduce:**
1. Generate QR with params: [...]
2. Scan with WeChat app
3. Observe: [what happens]

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [Attach if available]
**Priority:** [Critical/High/Medium/Low]
```

## Notes

### WeChat Pay Ecosystem
- WeChat Pay has 1B+ users, primarily in China
- Requires Chinese phone number for full functionality
- International version may have limited payment features
- Test accounts may need real Chinese bank card for payments

### Phase 1 vs Phase 2
**Phase 1 (Current):**
- Static merchant QR code
- Customer enters amount manually
- Simple merchant ID validation
- No dynamic transaction creation
- Suitable for: Small businesses, cash register alternative

**Phase 2 (Future):**
- Dynamic QR per transaction
- Amount pre-filled and enforced
- Full API integration with WeChat Pay servers
- Transaction callbacks and webhooks
- Order tracking and refunds
- Suitable for: E-commerce, integrated POS systems

### Merchant Account Setup
To test with real merchant account:
1. Register at: https://pay.weixin.qq.com
2. Submit business documents
3. Wait for approval (1-7 days)
4. Obtain 10-digit merchant ID
5. Configure payment settings
6. Generate API credentials (Phase 2)

### Currency Exchange
- WeChat automatically handles CNY/VND conversion
- Exchange rates updated daily
- Customer may see amount in their default currency
- Merchant receives payment in registered currency

## Known Limitations

### Phase 1 Limitations
- Amount in QR is reference only, not enforced
- No transaction callback/webhook
- No automatic order tracking
- Customer must enter amount correctly
- No automated refund process
- Merchant must manually track orders

### WeChat Limitations
- Requires WeChat account (Chinese phone preferred)
- May not work with international WeChat accounts
- Some features region-locked to China
- Payment methods limited to registered options

## Next Steps After Testing

Once all tests pass:
- [ ] Document merchant setup process
- [ ] Create merchant onboarding guide
- [ ] Add WeChat Pay logo/branding guidelines
- [ ] Update API documentation with test results
- [ ] Consider Phase 2 implementation timeline
- [ ] Mark Phase 1 WeChat Pay as **Production Ready**
- [ ] Plan Phase 2: Dynamic QR with full API integration
