# Payment Strategy - Vertical Business Solutions

## Overview

This document outlines the payment integration strategy for Gudbro's vertical business templates (bike rental, massage/spa, restaurants, hotels, etc.).

**Core Principles:**
1. **Transparency:** Always show full cost breakdown before payment
2. **Choice:** Multiple payment methods for different customer segments
3. **Localization:** Support local payment methods (VietQR, Momo, ZaloPay)
4. **Compliance:** No custody of crypto, clear legal disclaimers
5. **Simplicity:** One-click payment flow when possible

---

## 1. Fee Transparency UI

### **Problem**
Customers often discover hidden fees at checkout, leading to:
- Cart abandonment
- Loss of trust
- Negative reviews
- Lower conversion rates

### **Solution: Upfront Cost Display**

**UI Design:**

```
┌─────────────────────────────────────────┐
│  SELECT PAYMENT METHOD                  │
├─────────────────────────────────────────┤
│                                         │
│  Base Price:          200,000 VND      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ○ VietQR (Bank Transfer)        │   │
│  │   Processing fee: FREE           │   │
│  │   Total: 200,000 VND             │   │
│  │   ⚡ Instant confirmation        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ○ Credit/Debit Card (Stripe)    │   │
│  │   Processing fee: +10,000 VND    │   │
│  │   Total: 210,000 VND (+5%)       │   │
│  │   🌍 International cards OK      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ○ Momo E-Wallet                 │   │
│  │   Processing fee: +5,000 VND     │   │
│  │   Total: 205,000 VND (+2.5%)     │   │
│  │   📱 Scan QR to pay              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ○ USDT (Crypto)                  │   │
│  │   Processing fee: FREE           │   │
│  │   Total: 200,000 VND (~8.5 USDT) │   │
│  │   ⚠️  Direct to merchant         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [CONTINUE WITH PAYMENT] ← disabled    │
│  until method selected                  │
└─────────────────────────────────────────┘
```

### **Implementation**

**Frontend Component:**
```jsx
<PaymentSelector
  basePrice={200000}
  currency="VND"
  methods={[
    {
      id: 'vietqr',
      name: 'VietQR',
      icon: <BankIcon />,
      feePercent: 0,
      feeFixed: 0,
      badge: 'Instant',
      enabled: merchant.vietqr_enabled
    },
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      icon: <CardIcon />,
      feePercent: 5,
      feeFixed: 0,
      badge: 'International',
      enabled: merchant.stripe_enabled
    },
    {
      id: 'momo',
      name: 'Momo E-Wallet',
      icon: <MomoIcon />,
      feePercent: 2.5,
      feeFixed: 0,
      badge: 'Local',
      enabled: merchant.momo_enabled
    },
    {
      id: 'usdt',
      name: 'USDT (Crypto)',
      icon: <USDTIcon />,
      feePercent: 0,
      feeFixed: 0,
      badge: 'Direct',
      warning: 'Payment goes directly to merchant wallet',
      enabled: merchant.crypto_enabled
    }
  ]}
  onSelect={(method, totalAmount) => handlePayment(method, totalAmount)}
/>
```

**Fee Calculation Logic:**
```javascript
function calculateTotal(basePrice, method) {
  const feeAmount = (basePrice * method.feePercent / 100) + method.feeFixed;
  const total = basePrice + feeAmount;

  return {
    basePrice,
    feeAmount,
    feePercent: method.feePercent,
    total,
    currency: 'VND'
  };
}
```

### **Merchant Configuration (Backoffice)**

```
┌─────────────────────────────────────────┐
│  PAYMENT SETTINGS                       │
├─────────────────────────────────────────┤
│                                         │
│  ☑ VietQR (Bank Transfer)               │
│    No fees, instant confirmation        │
│    → Configure: Bank account details    │
│                                         │
│  ☑ Stripe (Credit/Debit Cards)          │
│    5% fee (passed to customer)          │
│    → Configure: Stripe API keys         │
│                                         │
│  ☐ Momo E-Wallet                        │
│    2.5% fee (passed to customer)        │
│    → Configure: Momo merchant ID        │
│                                         │
│  ☑ USDT (Crypto - Direct)               │
│    No fees, direct to your wallet       │
│    → Configure: USDT wallet address     │
│    ⚠️  Compliance: You must comply with │
│        local crypto regulations         │
│                                         │
│  Fee Display Options:                   │
│  ○ Show fees separately (recommended)   │
│  ○ Include fees in base price           │
│                                         │
│  [SAVE SETTINGS]                        │
└─────────────────────────────────────────┘
```

### **Benefits**

**For Customers:**
- ✅ No surprise fees
- ✅ Choose cheapest method
- ✅ Trust and transparency

**For Merchants:**
- ✅ Higher conversion rates (+15-25%)
- ✅ Fewer disputes
- ✅ Customer satisfaction

**For Gudbro:**
- ✅ Competitive differentiator
- ✅ Legal compliance (clear fee disclosure)
- ✅ Better UX than competitors

---

## 2. Crypto Direct-to-Merchant

### **Problem**
- Crypto custody is complex (legal, security, compliance)
- International tourists want to pay with crypto
- Traditional payment methods have high fees for cross-border

### **Solution: Non-Custodial Routing**

**How it Works:**

```
1. Customer selects "Pay with USDT"
2. System generates payment request:
   - Amount: 8.5 USDT (real-time VND→USD conversion)
   - Merchant wallet address (from merchant settings)
   - Expiry: 15 minutes
3. Customer scans QR or copies address → sends USDT
4. Customer uploads transaction hash (TX ID)
5. System verifies on blockchain (Etherscan/BSCScan API)
6. Booking confirmed once verified (1-3 confirmations)
```

**Gudbro does NOT:**
- ❌ Hold private keys
- ❌ Custody crypto
- ❌ Act as exchange
- ❌ Convert crypto to fiat

**Gudbro DOES:**
- ✅ Display merchant's wallet address
- ✅ Calculate real-time conversion (VND → USD → USDT)
- ✅ Verify transaction on-chain
- ✅ Update booking status
- ✅ Provide UI/UX for payment flow

### **Supported Cryptocurrencies (MVP)**

| Crypto | Network | Why |
|--------|---------|-----|
| USDT | Ethereum (ERC-20) | Most popular stablecoin |
| USDT | BSC (BEP-20) | Lower gas fees |
| USDC | Ethereum (ERC-20) | Alternative stablecoin |

**Future (V2):**
- Bitcoin (BTC)
- Lightning Network (instant BTC)
- TON (Telegram Open Network)

### **UI Flow**

**Step 1: Select Crypto Payment**
```
┌─────────────────────────────────────────┐
│  Pay with Cryptocurrency                │
├─────────────────────────────────────────┤
│  Base Price: 200,000 VND (~8.5 USD)     │
│                                         │
│  Select Network:                        │
│  ○ USDT (Ethereum) - Gas: ~$2-5        │
│  ○ USDT (BSC) - Gas: ~$0.20 ✓ Cheaper │
│  ○ USDC (Ethereum)                      │
│                                         │
│  Amount to send: 8.5 USDT               │
│  (Rate: 1 USD = 23,500 VND)            │
│                                         │
│  [CONTINUE]                             │
└─────────────────────────────────────────┘
```

**Step 2: Payment Instructions**
```
┌─────────────────────────────────────────┐
│  Send 8.5 USDT (BEP-20) to:            │
├─────────────────────────────────────────┤
│                                         │
│  [QR CODE]                              │
│                                         │
│  Address:                               │
│  0x1234...5678 [COPY]                  │
│                                         │
│  Network: Binance Smart Chain (BSC)     │
│  Amount: 8.5 USDT                       │
│  Expires in: 14:32                      │
│                                         │
│  ⚠️  IMPORTANT:                         │
│  - Send ONLY USDT on BSC network        │
│  - Sending other tokens will be lost    │
│  - This address belongs to the merchant │
│  - Gudbro does NOT custody your funds   │
│                                         │
│  After sending, paste your TX hash:     │
│  [________________________________]     │
│                                         │
│  [VERIFY PAYMENT]                       │
│                                         │
│  Need help? [Watch tutorial video]      │
└─────────────────────────────────────────┘
```

**Step 3: Verification**
```
┌─────────────────────────────────────────┐
│  🔍 Verifying Transaction...            │
├─────────────────────────────────────────┤
│                                         │
│  TX Hash: 0xabcd...ef12                 │
│  Status: ⏳ Pending (0/3 confirmations) │
│                                         │
│  [Progress bar: ████░░░░░░ 33%]        │
│                                         │
│  This may take 1-5 minutes.             │
│  You can close this page safely.        │
│                                         │
│  We'll email you when confirmed.        │
└─────────────────────────────────────────┘
```

**Step 4: Confirmed**
```
┌─────────────────────────────────────────┐
│  ✅ Payment Confirmed!                  │
├─────────────────────────────────────────┤
│                                         │
│  Your booking is confirmed.             │
│  Booking ID: BOOK-12345                 │
│                                         │
│  Transaction: 0xabcd...ef12             │
│  Amount: 8.5 USDT                       │
│  Confirmations: 3/3 ✓                   │
│                                         │
│  [VIEW BOOKING DETAILS]                 │
│  [VIEW ON BLOCKCHAIN] → BSCScan         │
└─────────────────────────────────────────┘
```

### **Backend Implementation**

**Database Schema:**
```sql
CREATE TABLE crypto_payments (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  merchant_wallet_address VARCHAR(42),
  crypto_type VARCHAR(10), -- 'USDT', 'USDC', 'BTC'
  network VARCHAR(20), -- 'ethereum', 'bsc', 'bitcoin'
  amount_crypto NUMERIC(18,8),
  amount_vnd INTEGER,
  exchange_rate NUMERIC(10,2),
  tx_hash VARCHAR(66),
  confirmations INTEGER DEFAULT 0,
  status VARCHAR(20), -- 'pending', 'confirming', 'confirmed', 'failed', 'expired'
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE merchant_crypto_settings (
  merchant_id UUID REFERENCES merchants(id),
  usdt_ethereum_address VARCHAR(42),
  usdt_bsc_address VARCHAR(42),
  usdc_ethereum_address VARCHAR(42),
  btc_address VARCHAR(64),
  crypto_enabled BOOLEAN DEFAULT false,
  accepts_usdt BOOLEAN DEFAULT true,
  accepts_usdc BOOLEAN DEFAULT false,
  accepts_btc BOOLEAN DEFAULT false,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
```
POST /v1/payments/crypto/create
Body: {booking_id, crypto_type, network}
Response: {payment_id, wallet_address, amount_crypto, expires_at}

POST /v1/payments/crypto/{payment_id}/verify
Body: {tx_hash}
Response: {status, confirmations, verified_at}

GET /v1/payments/crypto/{payment_id}/status
Response: {status, confirmations, tx_hash, blockchain_url}
```

**Blockchain Verification Service:**
```javascript
// Example: Verify USDT on BSC
async function verifyBSCTransaction(txHash, expectedAddress, expectedAmount) {
  // 1. Query BSCScan API
  const tx = await bscscanAPI.getTransaction(txHash);

  // 2. Verify recipient address matches merchant
  if (tx.to.toLowerCase() !== expectedAddress.toLowerCase()) {
    throw new Error('Wrong recipient address');
  }

  // 3. Verify amount (convert from wei)
  const amountUSDT = parseFloat(tx.value) / 1e18;
  if (Math.abs(amountUSDT - expectedAmount) > 0.01) {
    throw new Error('Wrong amount');
  }

  // 4. Check confirmations
  const confirmations = await bscscanAPI.getConfirmations(txHash);

  return {
    verified: confirmations >= 3,
    confirmations,
    timestamp: tx.timestamp
  };
}
```

### **Legal & Compliance**

**Disclaimer (shown before crypto payment):**
```
⚠️  CRYPTOCURRENCY PAYMENT DISCLAIMER

By choosing to pay with cryptocurrency, you acknowledge:

1. Payment is sent directly to the merchant's wallet
2. Gudbro does NOT custody, hold, or control your funds
3. Cryptocurrency transactions are irreversible
4. You are responsible for:
   - Sending the correct amount
   - Using the correct network
   - Complying with local crypto regulations
5. Exchange rates are estimates and may vary
6. Gas/transaction fees are YOUR responsibility
7. Refunds (if applicable) will be in the merchant's
   preferred method (may not be crypto)

The merchant is responsible for declaring crypto income
and complying with local tax and regulatory requirements.

[✓] I understand and agree to the above terms

[CANCEL] [CONTINUE WITH CRYPTO PAYMENT]
```

**Merchant Onboarding Checklist:**
```
☐ Merchant confirms they own a crypto wallet
☐ Merchant provides wallet address (we verify via test transaction)
☐ Merchant acknowledges tax/legal responsibilities
☐ Merchant enables crypto payments in settings
☐ Gudbro verifies merchant identity (KYC for high-volume)
```

### **Benefits**

**For Customers:**
- ✅ No foreign transaction fees (vs credit cards)
- ✅ Fast settlement (minutes vs days)
- ✅ Privacy (no bank involved)
- ✅ Works globally (no geographic restrictions)

**For Merchants:**
- ✅ No chargebacks (crypto transactions are final)
- ✅ Lower fees (0% vs 3-5% card fees)
- ✅ Access to international customers
- ✅ Custody of own funds (no intermediary)

**For Gudbro:**
- ✅ Zero custody risk (not our crypto)
- ✅ Legal compliance (just a UI layer)
- ✅ Competitive differentiator
- ✅ No payment processing overhead

---

## 3. Booking Integration Bridge (MVP Strategy)

### **Problem**
Building a full booking engine is complex:
- Calendar management
- Availability sync
- Time zone handling
- Notification systems
- Cancellation policies
- Multi-language support
- **Estimated time:** 8-12 weeks

### **Solution: Integrate First, Build Later**

**Phase 1 (MVP - 2 weeks):** Embed existing tools
**Phase 2 (6-12 months later):** Build proprietary engine

### **Phase 1: Supported Integrations**

| Tool | Use Case | Setup Time | Cost |
|------|----------|------------|------|
| **Cal.com** | General scheduling | 5 min | Free (self-hosted) or $12/mo |
| **Calendly** | 1-on-1 bookings | 5 min | Free or $8-12/mo |
| **Google Calendar** | Simple availability | 10 min | Free |
| **Booking.com** (API) | Hotels only | 30 min | Commission-based |
| **Custom Form** | Lead generation | 15 min | Free (email only) |

### **Implementation: Bike Rental Example**

**Option A: Cal.com Embed**
```html
<!-- Merchant configures Cal.com event type: "Bike Rental" -->
<iframe
  src="https://cal.com/merchant-name/bike-rental?embed=true"
  width="100%"
  height="600px"
  frameborder="0"
></iframe>
```

**Option B: Custom Lead Form → WhatsApp/Zalo**
```jsx
<BookingLeadForm
  onSubmit={(data) => {
    // 1. Save lead to database
    await saveBookingLead({
      vehicle_id: data.vehicleId,
      customer_name: data.name,
      customer_phone: data.phone,
      pickup_date: data.pickupDate,
      return_date: data.returnDate,
      notes: data.notes
    });

    // 2. Send WhatsApp message to merchant
    await sendWhatsAppToMerchant({
      to: merchant.whatsapp,
      template: 'new_booking_lead',
      params: {
        customer: data.name,
        vehicle: data.vehicleName,
        dates: `${data.pickupDate} → ${data.returnDate}`,
        phone: data.phone
      }
    });

    // 3. Send confirmation to customer
    await sendWhatsAppToCustomer({
      to: data.phone,
      template: 'booking_lead_received',
      params: {
        merchant: merchant.name,
        booking_id: leadId
      }
    });

    // 4. Redirect to thank you page
    router.push('/booking/thank-you');
  }}
/>
```

### **Merchant Backoffice Configuration**

```
┌─────────────────────────────────────────┐
│  BOOKING SETTINGS                       │
├─────────────────────────────────────────┤
│                                         │
│  Booking Method:                        │
│                                         │
│  ○ Cal.com Integration                  │
│    → Paste your Cal.com embed URL:      │
│    [https://cal.com/your-name/event]    │
│    [TEST EMBED] [SAVE]                  │
│                                         │
│  ○ Calendly Integration                 │
│    → Paste your Calendly link:          │
│    [https://calendly.com/your-name]     │
│    [TEST EMBED] [SAVE]                  │
│                                         │
│  ○ Google Calendar (Reserve with Google)│
│    → Connect your Google account:       │
│    [CONNECT GOOGLE] (OAuth)             │
│                                         │
│  ○ Lead Form Only (No calendar)         │
│    ✓ Collect name, phone, dates, notes  │
│    ✓ Send to: WhatsApp / Zalo / Email   │
│    → WhatsApp number: [+84 123 456 789] │
│    → Zalo ID: [your-zalo-id]            │
│    [SAVE]                               │
│                                         │
│  ○ Custom Booking Engine (Coming Soon)  │
│    Our proprietary system with advanced │
│    features. Join waitlist: [NOTIFY ME] │
│                                         │
└─────────────────────────────────────────┘
```

### **Customer UX Flow**

**1. Customer browses bike catalog**
```
Honda Wave - 120k/day [BOOK NOW]
```

**2. Clicks "Book Now" → Modal or new page**

**Option A: Cal.com Embed**
```
┌─────────────────────────────────────────┐
│  Book: Honda Wave                       │
├─────────────────────────────────────────┤
│  [Cal.com embedded calendar]            │
│  - Select date/time                     │
│  - Fill form (auto-syncs to merchant)   │
│  - Confirm                              │
└─────────────────────────────────────────┘
```

**Option B: Lead Form**
```
┌─────────────────────────────────────────┐
│  Book: Honda Wave (120k/day)            │
├─────────────────────────────────────────┤
│  Your Name: [________________]          │
│  Phone: [________________]              │
│  Pickup Date: [📅 Calendar]             │
│  Return Date: [📅 Calendar]             │
│  Notes: [Optional message to merchant]  │
│                                         │
│  → We'll confirm via WhatsApp/Zalo      │
│                                         │
│  [SEND BOOKING REQUEST]                 │
└─────────────────────────────────────────┘
```

**3. Confirmation**
```
✅ Booking request sent!

We've notified the merchant via WhatsApp.
You'll receive confirmation within 1 hour.

Booking details sent to: +84 123 456 789

[CHAT ON WHATSAPP] [BACK TO CATALOG]
```

### **Phase 2: Proprietary Booking Engine**

**When to build (criteria):**
- ✅ 100+ merchants using embedded tools
- ✅ Merchants requesting advanced features
- ✅ Revenue justifies 8-12 weeks development
- ✅ QR Engine + Hub 100% complete

**Advanced features to add:**
- Real-time availability sync across channels
- Multi-location inventory management
- Dynamic pricing (peak hours, seasonality)
- Automated upsells (insurance, helmets, etc.)
- Cancellation/modification policies
- Recurring bookings (weekly rentals)
- Integration with our payment system
- SMS/Email/WhatsApp automation
- Customer database & CRM

### **Migration Path**

```
Phase 1 (Now):
Merchant uses Cal.com → Bookings work, revenue flows

Phase 2 (6-12 months):
We release Gudbro Booking Engine → Merchant migrated:
1. Export Cal.com bookings
2. Import to Gudbro system
3. Redirect customers to new system
4. Keep Cal.com as backup for 30 days
5. Full migration complete
```

### **Benefits of Bridge Strategy**

**Speed to Market:**
- ✅ Launch verticals in 2-4 weeks (vs 12+ weeks)
- ✅ Validate demand before building

**Lower Risk:**
- ✅ Use proven tools (Cal.com, Calendly)
- ✅ Avoid building wrong features

**Customer Feedback:**
- ✅ Learn what merchants actually need
- ✅ Build Phase 2 based on real usage

**Resource Efficiency:**
- ✅ Focus on core platform (QR Engine, Hub)
- ✅ Build booking engine when justified

---

## Summary: Payment Strategy Roadmap

### **MVP (Month 1-2)**
1. ✅ Fee Transparency UI (all payment methods)
2. ✅ VietQR integration (local, 0% fee)
3. ✅ Stripe integration (international, 5% fee)
4. ✅ Booking lead form (WhatsApp/Zalo routing)

### **V1.5 (Month 3-4)**
5. ✅ Momo/ZaloPay integration (local e-wallets)
6. ✅ Crypto direct-to-merchant (USDT on BSC)
7. ✅ Cal.com/Calendly embed support

### **V2 (Month 6-12)**
8. ✅ Proprietary booking engine
9. ✅ More crypto options (BTC, Lightning, TON)
10. ✅ Advanced payment features (split payments, deposits, installments)

---

## KPIs & Success Metrics

**Payment Adoption:**
- % of bookings paid online (target: 60%+)
- Payment method distribution (VietQR vs Stripe vs Crypto)
- Average fee per transaction

**Conversion:**
- Checkout abandonment rate (target: <20%)
- Time to complete payment (target: <60s)
- Payment success rate (target: >95%)

**Customer Satisfaction:**
- Payment experience rating (target: 4.5+/5)
- Complaints about fees (target: <2%)
- Repeat payment rate

**Merchant Satisfaction:**
- % merchants enabling multiple methods (target: 80%+)
- Time to receive funds (VietQR instant, Stripe 2-7 days, Crypto instant)
- Chargeback rate (target: <0.5%)

---

## References

- Parent Strategy: [verticals/README.md](../README.md)
- Bike Rental Vertical: [bike-rental.md](../bike-rental.md)
- Massage/Spa Vertical: [massage-spa.md](../massage-spa.md)
- PRD Source: ChatGPT brainstorm session (2025-11-05)

Last Updated: 2025-11-05
