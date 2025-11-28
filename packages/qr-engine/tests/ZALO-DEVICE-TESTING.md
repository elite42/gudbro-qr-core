# Zalo Real Device Testing Checklist

## Overview
This document provides a comprehensive checklist for testing Zalo social QR codes with the actual Zalo mobile application.

## Prerequisites
- [ ] Zalo API endpoints deployed and accessible
- [ ] Zalo app installed on test devices (iOS and Android)
- [ ] Test Zalo accounts created
- [ ] Test devices with QR code scanning capability

## Testing Strategy

### 1. Basic QR Code Scanning

#### Test with Phone Number (Local Format)
- [ ] Generate Zalo QR with phone: `0912345678`
- [ ] Display name: `Gudbro Restaurant`
- [ ] Scan with Zalo app on iOS
- [ ] Verify: Zalo app opens
- [ ] Verify: Add friend screen appears
- [ ] Verify: Phone number shows correctly
- [ ] Verify: Can add friend successfully
- [ ] Scan with Zalo app on Android
- [ ] Verify: Same behavior on Android

#### Test with Phone Number (International Format)
- [ ] Generate Zalo QR with phone: `84912345678`
- [ ] Scan with Zalo app
- [ ] Verify: Opens correctly
- [ ] Verify: Same user as local format

#### Test with Zalo ID
- [ ] Generate Zalo QR with Zalo ID: `gudbrovietnam`
- [ ] Scan with Zalo app
- [ ] Verify: Opens user profile
- [ ] Verify: Can add friend or follow

### 2. Message Pre-fill Testing

#### Test with Vietnamese Message
- [ ] Generate Zalo QR with message: `Xin chào, tôi muốn đặt bàn`
- [ ] Scan with Zalo app
- [ ] Verify: Message appears in chat input field
- [ ] Verify: Vietnamese diacritics display correctly
- [ ] Verify: User can edit message before sending
- [ ] Verify: Can send message successfully

#### Test with English Message
- [ ] Generate Zalo QR with message: `Hello, I want to book a table`
- [ ] Scan with Zalo app
- [ ] Verify: English text appears correctly
- [ ] Verify: Message is pre-filled

#### Test with Long Message
- [ ] Generate Zalo QR with 500-character message
- [ ] Scan with Zalo app
- [ ] Verify: Full message appears
- [ ] Verify: No truncation

#### Test with Special Characters
- [ ] Generate Zalo QR with message: `Booking #123 @ 7pm - $50 deposit`
- [ ] Scan with Zalo app
- [ ] Verify: Special characters (#, @, $, -) display correctly
- [ ] Verify: No encoding issues visible to user

#### Test with Emojis
- [ ] Generate Zalo QR with message: `Hello 👋 Welcome to Gudbro 🍽️`
- [ ] Scan with Zalo app
- [ ] Verify: Emojis display correctly
- [ ] Verify: Can send message with emojis

#### Test Without Message
- [ ] Generate Zalo QR without message parameter
- [ ] Scan with Zalo app
- [ ] Verify: Chat opens with empty input field
- [ ] Verify: User can type custom message

### 3. Display Name Testing

#### Test with Display Name
- [ ] Generate Zalo QR with displayName: `Gudbro Restaurant Da Nang`
- [ ] Scan with Zalo app
- [ ] Note: Display name is metadata (may not show in Zalo app)
- [ ] Verify: QR scan still works correctly

#### Test with Vietnamese Display Name
- [ ] Generate Zalo QR with displayName: `Nhà hàng Gudbro`
- [ ] Verify: No errors generated
- [ ] Verify: QR works correctly

### 4. Cross-Platform Testing

#### iOS Testing
Device: iPhone (iOS 14+)
- [ ] Install latest Zalo version from App Store
- [ ] Scan QR with phone number
- [ ] Scan QR with Zalo ID
- [ ] Scan QR with message
- [ ] Verify all scenarios work
- [ ] Test QR scanning from:
  - [ ] Zalo built-in scanner
  - [ ] iPhone camera app (should redirect to Zalo)
  - [ ] Safari browser (display QR, scan with Zalo)

#### Android Testing
Device: Android phone (Android 8+)
- [ ] Install latest Zalo version from Play Store
- [ ] Scan QR with phone number
- [ ] Scan QR with Zalo ID
- [ ] Scan QR with message
- [ ] Verify all scenarios work
- [ ] Test QR scanning from:
  - [ ] Zalo built-in scanner
  - [ ] Camera app (should redirect to Zalo)
  - [ ] Chrome browser (display QR, scan with Zalo)

### 5. Phone Format Testing

#### Local Format (0xxxxxxxxx)
Test all valid prefixes:
- [ ] 03x: `0312345678`
- [ ] 05x: `0512345678`
- [ ] 07x: `0712345678`
- [ ] 08x: `0812345678`
- [ ] 09x: `0912345678`

Verify each:
- [ ] Converts to 84xxxxxxxxx correctly
- [ ] Opens same Zalo profile
- [ ] Can add friend/start chat

#### International Format (84xxxxxxxxx)
- [ ] Test: `84912345678`
- [ ] Verify: Opens correctly
- [ ] Verify: Same as local format

#### Format with Spaces
- [ ] Test: `091 234 5678`
- [ ] Verify: Spaces removed, QR works
- [ ] Verify: Converts to `84912345678`

#### Format with Dashes
- [ ] Test: `091-234-5678`
- [ ] Verify: Dashes removed, QR works

#### Format with Parentheses
- [ ] Test: `(091) 234-5678`
- [ ] Verify: Parentheses removed, QR works

### 6. Real-World Scenarios

#### Restaurant Reservation Scenario
- [ ] Generate QR with:
  - Phone: `0912345678`
  - Display: `Gudbro Restaurant`
  - Message: `Tôi muốn đặt bàn cho 4 người lúc 19h ngày mai`
- [ ] Print QR on table tent
- [ ] Scan with customer's phone
- [ ] Verify: Opens Zalo
- [ ] Verify: Message pre-filled
- [ ] Verify: Customer can send reservation

#### Customer Support Scenario
- [ ] Generate QR with:
  - Zalo ID: `gudbro_support`
  - Display: `Gudbro Support Team`
  - Message: `Tôi cần hỗ trợ`
- [ ] Display QR on website/packaging
- [ ] Scan with customer's phone
- [ ] Verify: Opens support chat
- [ ] Verify: Message ready to send

#### Marketing Campaign Scenario
- [ ] Generate QR with:
  - Phone: `0912345678`
  - Display: `Gudbro Promotions`
  - Message: `Tôi muốn nhận ưu đãi đặc biệt`
- [ ] Print QR on flyer
- [ ] Scan from printed material
- [ ] Verify: Works from paper
- [ ] Verify: Message about promotion pre-filled

#### Business Card Scenario
- [ ] Generate QR with:
  - Phone: `0912345678`
  - Display: `Chef Nguyen - Gudbro`
  - No message (let customers type freely)
- [ ] Print QR on business card
- [ ] Scan from business card
- [ ] Verify: Opens chat
- [ ] Verify: Empty message (customer can type)

### 7. QR Code Quality Testing

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
- [ ] Scan with phone flashlight
- [ ] Verify successful scan in all conditions

#### Screen vs Print Testing
- [ ] Display QR on computer monitor → Scan
- [ ] Display QR on tablet → Scan
- [ ] Display QR on phone screen → Scan with another phone
- [ ] Print QR on paper (color) → Scan
- [ ] Print QR on paper (black & white) → Scan
- [ ] Verify all mediums work

### 8. Error Handling

#### Invalid Phone Number
- [ ] Generate QR with phone: `0123456789` (invalid prefix)
- [ ] Verify: API returns error
- [ ] Verify: Helpful error message

#### Phone Number Too Short
- [ ] Generate QR with phone: `091234567` (9 digits)
- [ ] Verify: API returns error

#### Zalo ID Too Short
- [ ] Generate QR with ID: `short` (5 chars)
- [ ] Verify: API returns error
- [ ] Verify: Error mentions 6-30 characters

#### Missing Both Phone and ID
- [ ] Generate QR with neither phone nor ID
- [ ] Verify: API returns error
- [ ] Verify: Error mentions requirement

### 9. Performance Testing

#### Generation Speed
- [ ] Generate 10 Zalo QR codes consecutively
- [ ] Measure average generation time
- [ ] Target: < 500ms per QR code

#### Scanning Speed
- [ ] Scan 10 different Zalo QR codes
- [ ] Measure average scan time
- [ ] Target: < 1 second per scan
- [ ] Verify Zalo app opens quickly

### 10. Network Conditions

#### Offline QR Generation
- [ ] Turn off internet on server
- [ ] Try to generate QR
- [ ] Verify: Error or cached response

#### Offline QR Scanning
- [ ] Generate QR code
- [ ] Turn off internet on mobile
- [ ] Scan QR code
- [ ] Verify: QR data parsed (URL extracted)
- [ ] Turn on internet
- [ ] Verify: Zalo opens correctly

### 11. Vietnamese Language Testing

#### Vietnamese Phone Format
- [ ] Test Vietnamese operators:
  - [ ] Viettel (08x, 09x, 03x)
  - [ ] Vinaphone (08x, 09x)
  - [ ] MobiFone (07x, 09x)
- [ ] Verify all operators work

#### Vietnamese Character Encoding
Messages to test:
- [ ] `Xin chào` (Basic greeting)
- [ ] `Tôi muốn đặt bàn` (Reservation)
- [ ] `Cảm ơn bạn` (Thank you)
- [ ] `Nguyễn Văn Ánh` (Name with tones)
- [ ] `Đà Nẵng` (City name)
- [ ] `Phở, bánh mì, cà phê` (Food items)

For each:
- [ ] Generate QR
- [ ] Scan with Zalo
- [ ] Verify: Vietnamese text displays correctly
- [ ] Verify: Tones (diacritics) are preserved

## Test Matrix

| Phone Format | iOS | Android | Message | Result |
|--------------|-----|---------|---------|--------|
| 0912345678 | ☐ | ☐ | ☐ | |
| 84912345678 | ☐ | ☐ | ☐ | |
| 091-234-5678 | ☐ | ☐ | ☐ | |
| 091 234 5678 | ☐ | ☐ | ☐ | |

| Zalo ID | iOS | Android | Message | Result |
|---------|-----|---------|---------|--------|
| gudbrovietnam | ☐ | ☐ | ☐ | |
| support_team | ☐ | ☐ | ☐ | |
| restaurant123 | ☐ | ☐ | ☐ | |

## Success Criteria

### Must Pass (Critical)
- [ ] QR codes open Zalo app on both iOS and Android
- [ ] Phone numbers (local and international format) work
- [ ] Zalo IDs work correctly
- [ ] Messages pre-fill correctly when provided
- [ ] Vietnamese characters display without issues
- [ ] Can add friend/start chat after scan

### Should Pass (Important)
- [ ] All phone formats (with spaces, dashes) work
- [ ] Long messages (up to 500 chars) work
- [ ] Special characters and emojis work
- [ ] QR works from both screen and print
- [ ] Works in various lighting conditions

### Nice to Have (Optional)
- [ ] Generation time under 300ms
- [ ] Scan time under 500ms
- [ ] Works with older Zalo app versions
- [ ] Works offline (scan only, not send)

## Reporting

### For Each Test
Record:
1. Device model and OS version
2. Zalo app version
3. Test result (Pass/Fail)
4. Screenshots of successful scans
5. Screenshots of chat with pre-filled message
6. Any error messages or issues
7. Notes on user experience

### Issue Template
```
**Issue:** [Brief description]
**Device:** [Model and OS version]
**Zalo Version:** [App version]
**Test Case:** [Which test case]
**Steps to Reproduce:**
1. Generate QR with params: [...]
2. Scan with Zalo app
3. Observe: [what happens]

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [Attach if available]
**Priority:** [Critical/High/Medium/Low]
```

## Notes

- Zalo is Vietnam's #1 messaging app with 74M+ users
- Zalo QR uses deep link format: `https://zalo.me/[IDENTIFIER]`
- Phone numbers are converted to international format (84xxx)
- Messages are URL-encoded but should display normally in Zalo
- Zalo app must be installed for QR to work (otherwise opens browser)
- Test with multiple Zalo account types: personal, OA (Official Account)

## Known Limitations

- Display name is metadata only (not used by Zalo deep links)
- Message pre-fill may not work in all Zalo versions
- Some phones may not have Zalo installed (fallback to browser)
- International users may see phone in +84 format instead of 84

## Next Steps After Testing

Once all tests pass:
- [ ] Document any device-specific quirks
- [ ] Update API documentation with tested scenarios
- [ ] Add example QR codes to documentation
- [ ] Consider adding Zalo logo/branding options
- [ ] Mark Zalo implementation as **Production Ready**
- [ ] Create user guide for Vietnamese businesses
