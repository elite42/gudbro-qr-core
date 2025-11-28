# VietQR Real Device Testing Checklist

## Overview
This document provides a comprehensive checklist for testing VietQR payment QR codes with actual Vietnamese banking applications.

## Prerequisites
- [ ] VietQR API endpoints deployed and accessible
- [ ] Test bank accounts available (or use demo accounts)
- [ ] Vietnamese banking apps installed on test devices
- [ ] Test devices with QR code scanning capability

## Testing Strategy

### 1. Basic QR Code Scanning

#### Test with Vietcombank (VCB)
- [ ] Generate VietQR with bank code: `VCB`
- [ ] Account: `1234567890`
- [ ] Account name: `NGUYEN VAN A`
- [ ] Scan with Vietcombank mobile app
- [ ] Verify: Account number displays correctly
- [ ] Verify: Account name displays correctly

#### Test with BIDV
- [ ] Generate VietQR with bank code: `BIDV`
- [ ] Account: `9876543210`
- [ ] Account name: `TRAN THI B`
- [ ] Scan with BIDV Smart Banking app
- [ ] Verify: Account details populate correctly

#### Test with VietinBank (VTB)
- [ ] Generate VietQR with bank code: `VTB`
- [ ] Account: `1111222233`
- [ ] Account name: `LE VAN C`
- [ ] Scan with VietinBank iPay app
- [ ] Verify: Ready to transfer screen appears

#### Test with Agribank (ARB)
- [ ] Generate VietQR with bank code: `ARB`
- [ ] Account: `4444555566`
- [ ] Account name: `PHAM VAN D`
- [ ] Scan with Agribank E-Mobile Banking
- [ ] Verify: Beneficiary details shown correctly

### 2. Amount Pre-filling

#### Test Fixed Amount (100,000 VND)
- [ ] Generate VietQR with amount: `100000`
- [ ] Bank: Any (VCB recommended)
- [ ] Scan with banking app
- [ ] Verify: Amount field pre-filled with 100,000 VND
- [ ] Verify: Amount field is locked/non-editable

#### Test Variable Amounts
Test with different amounts:
- [ ] 50,000 VND (minimum typical transaction)
- [ ] 500,000 VND (medium transaction)
- [ ] 5,000,000 VND (large transaction)
- [ ] 100,000,000 VND (very large transaction)

Verify for each:
- [ ] Amount displays with correct formatting (e.g., "100.000 đ")
- [ ] Amount is locked when scanning
- [ ] No decimal places appear (VND doesn't use decimals)

#### Test Without Amount
- [ ] Generate VietQR without amount parameter
- [ ] Scan with banking app
- [ ] Verify: Amount field is empty and editable
- [ ] Verify: User can enter custom amount

### 3. Description/Message Testing

#### Test with Vietnamese Description
- [ ] Generate VietQR with description: `Thanh toán đơn hàng #123`
- [ ] Scan with banking app
- [ ] Verify: Description appears in transfer message/notes field
- [ ] Verify: Vietnamese diacritics display correctly (đ, ơ, ư, etc.)

#### Test with English Description
- [ ] Generate VietQR with description: `Payment for order #456`
- [ ] Scan with banking app
- [ ] Verify: English text displays correctly

#### Test with Special Characters
- [ ] Generate VietQR with description: `Invoice #789 - Ngày 01/01/2024`
- [ ] Scan with banking app
- [ ] Verify: Special characters (#, -, /) display correctly

#### Test with Maximum Length Description
- [ ] Generate VietQR with 255-character description
- [ ] Scan with banking app
- [ ] Verify: Full description visible or truncated gracefully

#### Test Without Description
- [ ] Generate VietQR without description
- [ ] Scan with banking app
- [ ] Verify: Message field is empty and editable

### 4. E-Wallet Testing

#### Test with Momo
- [ ] Generate VietQR with bank code: `MOMO`
- [ ] Phone number as account: `0912345678`
- [ ] Account name: `NGUYEN VAN E`
- [ ] Scan with Momo app
- [ ] Verify: Transfer screen opens correctly
- [ ] Verify: Recipient phone number shows correctly

#### Test with ZaloPay
- [ ] Generate VietQR with bank code: `ZALOPAY`
- [ ] Phone number: `0987654321`
- [ ] Account name: `TRAN THI F`
- [ ] Scan with ZaloPay app
- [ ] Verify: Payment details populate correctly

### 5. Template Testing

#### Compact Template (Default)
- [ ] Generate VietQR with template: `compact`
- [ ] Download/display QR image
- [ ] Verify: QR code includes basic branding
- [ ] Verify: Account info visible on image
- [ ] Scan and verify functionality

#### Print Template
- [ ] Generate VietQR with template: `print`
- [ ] Download/display QR image
- [ ] Verify: Print-friendly format
- [ ] Verify: Higher quality/larger size
- [ ] Print on paper and scan
- [ ] Verify: Printed QR code scans successfully

#### QR Only Template
- [ ] Generate VietQR with template: `qr_only`
- [ ] Download/display QR image
- [ ] Verify: Pure QR code with no decorations
- [ ] Verify: Minimal size
- [ ] Scan and verify functionality

### 6. Cross-Bank Testing

Test if QR codes work across different banking apps:

#### VCB QR scanned by other apps
- [ ] Generate VCB VietQR
- [ ] Scan with BIDV app → Should work (NAPAS standard)
- [ ] Scan with VietinBank app → Should work
- [ ] Scan with Techcombank app → Should work
- [ ] Scan with MB Bank app → Should work

#### Private Bank QR scanned by state banks
- [ ] Generate Techcombank (TCB) VietQR
- [ ] Scan with VCB app → Should work
- [ ] Scan with BIDV app → Should work

### 7. Edge Cases

#### Special Account Numbers
- [ ] Test with 6-digit account number (minimum)
- [ ] Test with 20-digit account number (maximum)
- [ ] Test with account number containing leading zeros

#### Special Account Names
- [ ] Test with uppercase name: `NGUYEN VAN A`
- [ ] Test with lowercase name: `nguyen van a` (should normalize)
- [ ] Test with mixed case: `Nguyen Van A`
- [ ] Test with Vietnamese names: `TRẦN MINH ĐĂNG KHOA`
- [ ] Test with special characters in name

#### Network Conditions
- [ ] Generate QR code
- [ ] Turn off internet on mobile device
- [ ] Scan QR code
- [ ] Verify: Local QR parsing works
- [ ] Verify: Account details extracted without internet
- [ ] Turn on internet
- [ ] Verify: Can complete transaction online

### 8. QR Code Quality

#### Size Testing
- [ ] Display QR code at 200x200px → Scan
- [ ] Display QR code at 300x300px → Scan
- [ ] Display QR code at 512x512px → Scan (default)
- [ ] Display QR code at 1024x1024px → Scan
Verify all sizes scan successfully

#### Distance Testing
- [ ] Scan QR from 10cm distance
- [ ] Scan QR from 20cm distance
- [ ] Scan QR from 30cm distance
- [ ] Scan QR from 50cm distance
Verify successful scan at all reasonable distances

#### Lighting Testing
- [ ] Scan QR in bright sunlight
- [ ] Scan QR in office lighting
- [ ] Scan QR in low light
- [ ] Scan QR with phone flashlight
Verify successful scan in all conditions

#### Screen Testing
- [ ] Display QR on computer monitor → Scan with phone
- [ ] Display QR on tablet → Scan with phone
- [ ] Display QR on phone → Scan with another phone
- [ ] Display QR on printed paper → Scan

### 9. Error Handling

#### Invalid QR Codes
- [ ] Generate QR with corrupted data
- [ ] Scan with banking app
- [ ] Verify: Appropriate error message shown

#### Expired QR Codes (if applicable)
- [ ] Generate QR with expiration
- [ ] Wait for expiration
- [ ] Scan with banking app
- [ ] Verify: Expiration error shown

### 10. Performance Testing

#### Generation Speed
- [ ] Generate 10 VietQR codes consecutively
- [ ] Measure average generation time
- [ ] Target: < 1 second per QR code

#### Scanning Speed
- [ ] Scan 10 different VietQR codes
- [ ] Measure average scan time
- [ ] Target: < 2 seconds per scan

## Test Matrix

| Bank Code | App Name | Basic Scan | Amount | Description | Result |
|-----------|----------|------------|--------|-------------|--------|
| VCB | Vietcombank | ☐ | ☐ | ☐ | |
| BIDV | BIDV Smart | ☐ | ☐ | ☐ | |
| VTB | VietinBank iPay | ☐ | ☐ | ☐ | |
| ARB | Agribank E-Mobile | ☐ | ☐ | ☐ | |
| TCB | Techcombank | ☐ | ☐ | ☐ | |
| MB | MB Bank | ☐ | ☐ | ☐ | |
| ACB | ACB ONE | ☐ | ☐ | ☐ | |
| VPB | VPBank NEO | ☐ | ☐ | ☐ | |
| MOMO | Momo | ☐ | ☐ | ☐ | |
| ZALOPAY | ZaloPay | ☐ | ☐ | ☐ | |

## Success Criteria

### Must Pass (Critical)
- [ ] QR codes scan successfully in at least 3 major banking apps (VCB, BIDV, VTB)
- [ ] Account number and name populate correctly
- [ ] Amount pre-fills correctly when specified
- [ ] Vietnamese characters display correctly
- [ ] QR codes work cross-bank (NAPAS standard compliance)

### Should Pass (Important)
- [ ] All 10+ banking apps scan successfully
- [ ] All 3 templates work correctly
- [ ] E-wallets (Momo, ZaloPay) scan successfully
- [ ] Description field populates correctly
- [ ] QR codes work in various lighting conditions

### Nice to Have (Optional)
- [ ] Generation time under 500ms
- [ ] Scan time under 1 second
- [ ] Works with 100% of tested apps
- [ ] Print quality excellent

## Reporting

### For Each Test
Record:
1. Bank/App name and version
2. Device model and OS version
3. Test result (Pass/Fail)
4. Screenshots of successful scans
5. Any error messages or issues
6. Notes on user experience

### Issue Template
```
**Issue:** [Brief description]
**Bank/App:** [Name and version]
**Device:** [Model and OS]
**Steps to Reproduce:**
1. Generate QR with params: [...]
2. Scan with [app name]
3. Observe: [what happens]

**Expected:** [What should happen]
**Actual:** [What actually happened]
**Screenshot:** [Attach if available]
**Priority:** [Critical/High/Medium/Low]
```

## Notes

- VietQR is based on Vietnam's National Payment QR Standard (NAPAS)
- All Vietnamese banks must support NAPAS-compliant QR codes by law
- VietQR.io provides the QR generation service - verify their API is working
- Test with real money should be done with caution - use small amounts (1,000-10,000 VND)
- Some banks may require app updates to support latest VietQR features

## Next Steps After Testing

Once all tests pass:
- [ ] Document any bank-specific quirks or limitations
- [ ] Update API documentation with testing results
- [ ] Add tested bank logos to documentation
- [ ] Consider adding bank-specific optimizations
- [ ] Mark VietQR implementation as **Production Ready**
