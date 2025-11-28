# QR MENU - FEATURE REQUIREMENTS

**Version:** 1.0  
**Date:** 2025-11-03  
**Project:** Gudbro QR Platform  
**Module:** QR Menu (Modules 10-12)  
**Status:** QR Menu at 90% → Expanding toward Customer Engagement Platform  
**Priority Context:** These requirements come AFTER QR Engine completion (8 weeks)

---

## 📋 CONTEXT

**Current State:**
- ✅ QR Menu basic features: 90% complete
- ✅ 4 languages (VN, EN, KO, CN) working
- ✅ 51 health filters operational
- ✅ JSONB translations implemented

**This Document Scope:**
These requirements expand QR Menu with features that bridge toward the **Customer Engagement Platform** (see Master Plan - Priority 2).

**Implementation Timeline:**
- Start: After QR Engine Phase 1-2 completion (~Week 9)
- Duration: 6-8 weeks
- Aligns with: Customer Engagement Platform roadmap (16 weeks total)

---

## 🎯 PRIORITY LEGEND

- **P0** = Blocker (MVP cannot ship without this)
- **P1** = Critical (needed for first 10 restaurant customers)
- **P2** = Important (needed to scale 10→100 customers)
- **P3** = Nice-to-have (quality of life, process improvement)

---

## 📑 TABLE OF CONTENTS

1. [MULTI_VENUE_MANAGEMENT](#1-multi_venue_management-p1) (P1) - 8-10 days
2. [FEEDBACK_SYSTEM](#2-feedback_system-p1) (P1) - 2-3 days
3. [INTEGRATION_HOOKS](#3-integration_hooks-p2) (P2) - 15-19 days
4. [REFERRAL_SYSTEM](#4-referral_system-p2) (P2) - 5-6 days
5. [REQUIREMENT_MANAGEMENT](#5-requirement_management-p3) (P3) - Continuous
6. [MASTERPLAN_UPDATE](#6-masterplan_update-p3) (P3) - Weekly

**Total Estimated Effort:** ~33-41 days (1 developer, 7-8 weeks)

---

## 1. MULTI_VENUE_MANAGEMENT (P1)

**Goal:** Enable agencies and multi-location restaurants to manage multiple venues from single account

**Why:** 
- Target market includes marketing agencies managing 10-20+ client restaurants
- Restaurant chains with 3-5 locations need consolidated view
- Reduces friction: no login/logout switching
- Higher ARPU: agencies pay for portfolio management

**User Stories:**

**US1: Marketing Agency**
> "As a marketing agency, I manage QR menus for 15 restaurants. I need a portfolio dashboard to see all clients at once, update menus quickly, and track analytics across my portfolio without switching accounts."

**US2: Restaurant Chain Owner**
> "I own 3 pho restaurants in Da Nang. I want to see total QR scans across all locations, identify my best-performing location, and duplicate successful menu items across all venues."

**US3: Delegated Access**
> "As a restaurant owner, I want to invite my manager to access analytics and edit menus, but NOT change pricing or delete the venue. I need role-based permissions."

### Technical Specification

**Database Schema:**
```sql
-- Already exists in V1 migration
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  type VARCHAR(50), -- 'restaurant', 'cafe', 'bar', 'hotel'
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- New: Junction table for multi-user access
CREATE TABLE venue_users (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  venue_id UUID REFERENCES restaurants(id),
  role VARCHAR(20) NOT NULL, -- 'owner', 'manager', 'editor', 'viewer'
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  UNIQUE(user_id, venue_id)
);

-- Add to existing menu_items table
ALTER TABLE menu_items 
  ADD COLUMN restaurant_id UUID REFERENCES restaurants(id);

-- Add to existing qr_codes table  
ALTER TABLE qr_codes 
  ADD COLUMN restaurant_id UUID REFERENCES restaurants(id);
```

**Permission Matrix:**
| Role | View Analytics | Edit Menu | Generate QR | Manage Users | Delete Venue |
|------|----------------|-----------|-------------|--------------|--------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ❌ | ❌ |
| Editor | ✅ | ✅ | ❌ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

**API Endpoints:**
```javascript
// Venue management
POST   /api/venues                    // Create new venue
GET    /api/venues                    // List user's venues (portfolio)
GET    /api/venues/:id                // Get single venue details
PATCH  /api/venues/:id                // Update venue
DELETE /api/venues/:id                // Soft delete (archive)
POST   /api/venues/:id/duplicate      // Duplicate venue + menu

// Team management
POST   /api/venues/:id/team/invite    // Invite team member (email)
GET    /api/venues/:id/team           // List team members
PATCH  /api/venues/:id/team/:userId   // Update role
DELETE /api/venues/:id/team/:userId   // Remove team member

// Analytics (aggregate)
GET    /api/analytics/portfolio       // Global KPIs across all venues
GET    /api/analytics/compare         // Compare venues
```

**Frontend Pages:**

1. **Portfolio Dashboard** (`/dashboard/portfolio`)
   - Grid/List view of all venues
   - Quick stats per venue (QR scans today, menu items count)
   - Actions: Create New, View, Edit, Archive
   - Search + Filter (by city, type, active status)

2. **Global Analytics** (`/dashboard/analytics/global`)
   - Total QR scans (all venues)
   - Top 5 performing venues (by scans)
   - Total menu items across portfolio
   - Revenue potential estimate
   - Map view (venues geolocation)

3. **Venue Switcher** (Component)
   - Dropdown in navbar
   - Quick switch between venues
   - Shows current venue context

4. **Team Management** (`/dashboard/venue/:id/team`)
   - Invite form (email + role selector)
   - Team members list with roles
   - Edit/Remove actions
   - Pending invitations status

**Tech Stack:**
- Backend: Extend `packages/menu/backend` (add routes)
- Database: Use existing `restaurants` table from V1 migration
- Frontend: `/frontend/app/dashboard/portfolio` (new Next.js pages)
- Auth: Extend middleware to check `venue_users` permissions

### Acceptance Criteria

- [ ] User can create multiple venues in <2 minutes
- [ ] Portfolio view loads in <500ms with 50 venues
- [ ] Permission system enforced at API level (not just UI)
- [ ] Team invite sends email with accept link
- [ ] Invited user can accept and gets correct role
- [ ] Global analytics aggregate correctly across venues
- [ ] Venue duplication copies: menu items, settings, NOT analytics history
- [ ] Mobile responsive (portfolio grid adapts to mobile)

### KPI Targets

- **Portfolio setup time:** -60% vs creating venues individually
- **Cross-venue sync errors:** <1%
- **Multi-venue customer adoption:** +25% MoM (agencies love this)

### NOT in Scope

- ❌ Multi-venue menu synchronization (Phase 2 feature)
- ❌ Franchise/template system (future)
- ❌ White-label per venue (Enterprise tier only)

**Estimated Effort:** 8-10 days (1 developer)

**Dependencies:**
- Requires: User authentication system ✅ (already implemented)
- Requires: `restaurants` table ✅ (V1 migration done)
- Blocks: Referral system (agencies need multi-venue first)

**Related Docs:** 
- See `GUDBRO-MASTER-PLAN.md` - Customer Engagement Platform
- See `shared/database/migration_v1_restaurants.sql`

---

## 2. FEEDBACK_SYSTEM (P1)

**Goal:** Collect categorized feedback (bugs, features, improvements) from restaurant backoffice

**Why:**
- Prioritize development based on customer pain points
- Distinguish urgent bugs from nice-to-have features
- Build transparent product roadmap
- Reduce support load (users see their feedback tracked)

**User Story:**
> "As a restaurant owner using QR Menu, I want to quickly report a bug or suggest a feature by selecting a category and typing a message, so the Gudbro team knows exactly what needs attention without me having to email or call."

### Technical Specification

**Database Schema:**
```sql
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  venue_id UUID REFERENCES restaurants(id), -- optional, can be general feedback
  message TEXT NOT NULL,
  
  -- Category-based system (NOT star rating)
  category VARCHAR(50) NOT NULL, -- 'bug', 'feature_request', 'improvement', 'question', 'other'
  severity VARCHAR(20), -- 'critical', 'high', 'medium', 'low' (only for bugs)
  
  -- Optional: satisfaction rating (separate from category)
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5), -- optional
  
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed', 'wont_fix'
  admin_notes TEXT,
  screenshot_url TEXT, -- optional attachment
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_feedbacks_user ON feedbacks(user_id);
CREATE INDEX idx_feedbacks_venue ON feedbacks(venue_id);
CREATE INDEX idx_feedbacks_category ON feedbacks(category);
CREATE INDEX idx_feedbacks_status ON feedbacks(status);
CREATE INDEX idx_feedbacks_created ON feedbacks(created_at DESC);
```

**API Endpoints:**
```javascript
// Customer-facing
POST   /api/feedback                  // Submit feedback
GET    /api/feedback/my               // User's own feedback history

// Admin-only (internal tool)
GET    /api/admin/feedback            // List all (paginated, filtered)
PATCH  /api/admin/feedback/:id/status // Update status
PATCH  /api/admin/feedback/:id/notes  // Add admin notes
```

**Frontend UI:**

1. **Feedback Tab** (`/dashboard/feedback`)
```
Category: [Dropdown - Required]
  🐛 Bug Report
  💡 Feature Request  
  🔧 Improvement
  ❓ Question
  📝 Other

[If "Bug Report" selected:]
  Severity: [Dropdown - Required]
    🔴 Critical (App is unusable)
    🟠 High (Major functionality broken)
    🟡 Medium (Annoying but workaround exists)
    🟢 Low (Minor issue)

Message: [Textarea - Required, 1000 chars]
{Clear description of the issue or suggestion}

[Optional] How satisfied are you overall? [1-5 stars]
(This helps us understand general sentiment)

Venue: [Dropdown if multiple venues]

[Optional] Screenshot: [Upload button]

[Submit Feedback]
```

2. **My Feedback History** (`/dashboard/feedback/history`)
   - List view: date, category badge, message preview, status badge
   - Filter by: status, category, venue
   - Click to expand: full message + admin response

3. **Admin Dashboard** (internal tool, separate app)
   - Table view: all feedback sorted by created_at DESC
   - Columns: Date, User, Venue, Category, Severity, Status, Actions
   - Filters: Status, Severity (Critical/High = urgent), Category, Date range
   - Quick actions: Mark as resolved, Add note

**Smart Notifications:**
```javascript
// Priority routing based on category + severity
if (category === 'bug' && severity === 'critical') {
  sendUrgentAlert({
    channels: ['email', 'slack', 'sms'],
    recipients: ['tech@gudbro.com', 'cto@gudbro.com'],
    priority: 'P0',
    subject: '🚨 CRITICAL BUG: {message_preview}',
    SLA: 'Respond within 1 hour'
  });
}

if (category === 'bug' && severity === 'high') {
  sendAlert({
    channels: ['email', 'slack'],
    priority: 'P1',
    SLA: 'Respond within 24 hours'
  });
}

if (category === 'feature_request') {
  sendToProductBoard({
    channel: 'slack-#product-ideas',
    auto_tag: 'customer-request',
    voting_enabled: true // other internal users can upvote
  });
}

if (category === 'question') {
  sendToSupport({
    channel: 'slack-#customer-support',
    auto_assign: true,
    SLA: 'Respond within 4 hours'
  });
}
```

**Email Templates:**

1. **Critical Bug Alert** (to admin)
```
Subject: 🚨 CRITICAL BUG - {venue_name}

Priority: P0
User: {user_name} ({user_email})
Venue: {venue_name}
Severity: CRITICAL

Message:
{feedback_message}

Screenshot: {url}

[View in Admin Dashboard]
[Contact User]
```

2. **Feature Request Notification** (to product team)
```
Subject: 💡 Feature Request: {message_preview}

From: {user_name} ({venue_name})
Category: Feature Request

Description:
{feedback_message}

Customer Tier: {subscription_tier}

[View in Product Board]
[Reply to Customer]
```

**Tech Stack:**
- Backend: New microservice `packages/feedback/backend` (lightweight)
- Database: New schema `feedback_service` in PostgreSQL
- Frontend: `/frontend/app/dashboard/feedback` (Next.js page)
- Notifications: Nodemailer (email) + Slack webhook

### Acceptance Criteria

- [ ] Restaurant owner can submit feedback in <30 seconds
- [ ] Bug reports require severity selection (enforced validation)
- [ ] Email notification sent within 1 minute for critical bugs
- [ ] Slack notification sent for all feedback within 2 minutes
- [ ] Feature requests appear in #product-ideas channel
- [ ] Questions routed to support team automatically
- [ ] Filters work correctly with 100+ feedback entries
- [ ] Admin can update status and add notes
- [ ] Mobile responsive (easy to submit from phone)
- [ ] Character limit enforced (1000 chars max)
- [ ] Screenshot upload works (max 5MB)

### KPI Targets

- **Response time:** <1h for critical, <24h for all feedback
- **Resolution time:** <72h for bugs, <7 days for features
- **Feedback volume:** 10+ submissions/month (sign of engagement)
- **Customer satisfaction:** 80%+ "resolved" feedback marked helpful

### NOT in Scope

- ❌ Public feedback voting system (future)
- ❌ Roadmap transparency page (future)
- ❌ Customer-to-customer feedback forum (future)
- ❌ AI-powered feedback categorization (future)

**Estimated Effort:** 2-3 days (1 developer)

**Dependencies:**
- Requires: User authentication ✅
- Requires: Multi-venue management (to associate feedback with venue)

**Related Docs:** N/A (self-contained feature)

---

## 3. INTEGRATION_HOOKS (P2)

**Goal:** Enable online ordering with payment processing + prepare webhook infrastructure for future integrations (POS, CRM)

**Why:**
- Unlock revenue stream: commission on online orders (5-10%)
- Competitive requirement: Toast, SevenRooms all have ordering
- Customer expectation: "QR menu" should allow ordering, not just viewing
- Enable delivery/pickup scenarios
- Prepare extensibility for POS/CRM integrations

This requirement is split into two parts:
- **Part A: Payment Processing** (IN SCOPE - P2) - Enable online orders
- **Part B: Webhook Infrastructure** (IN SCOPE - P2) - Prepare for future integrations

---

### PART A: PAYMENT PROCESSING (IN SCOPE)

**Goal:** Enable customers to order and pay from QR menu

**User Story:**
> "As a restaurant owner, I want customers to order and pay directly from the QR menu, so I don't need a separate online ordering system. I should be able to connect my Stripe account and start accepting payments immediately."

**Database Schema:**
```sql
-- Merchant payment accounts
CREATE TABLE merchant_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES restaurants(id) NOT NULL,
  provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'momo', 'zalopay'
  account_id VARCHAR(255), -- Stripe Connect account ID
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  capabilities JSONB, -- { card_payments: true, apple_pay: true, ... }
  onboarded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES restaurants(id) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  items JSONB NOT NULL, -- [{ menu_item_id, quantity, price, modifications }]
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  
  -- Payment
  payment_provider VARCHAR(50), -- 'stripe', 'paypal', etc.
  payment_intent_id VARCHAR(255), -- Stripe PaymentIntent ID
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded'
  
  -- Order status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
  order_type VARCHAR(20), -- 'dine_in', 'takeout', 'delivery'
  table_number VARCHAR(20), -- if dine_in
  special_instructions TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- Transaction logs
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  provider VARCHAR(50),
  transaction_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3),
  status VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_venue ON orders(venue_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_merchant_accounts_venue ON merchant_accounts(venue_id);
```

**Merchant Onboarding Flow:**
```javascript
// Step 1: Connect Stripe Account (OAuth)
POST /api/payment/connect/stripe
→ Redirect to Stripe Connect OAuth
→ Callback: /api/payment/connect/stripe/callback
→ Store account_id, capabilities

// Step 2: Configure Payment Settings
PATCH /api/venues/:id/payment-settings
{
  enabled: true,
  providers: ['stripe'],
  accepted_methods: ['card', 'apple_pay', 'google_pay'],
  minimum_order: 50000, // VND
  commission_model: 'platform_fee', // 'platform_fee' or 'pass_through'
  platform_fee_percent: 5.0 // Gudbro takes 5%
}

// Step 3: Customer Places Order
POST /api/orders
{
  venue_id: 'uuid',
  items: [...],
  customer: { name, phone, email },
  payment_method: 'card' // or 'apple_pay', 'google_pay', 'paypal'
}
→ Create Stripe PaymentIntent
→ Return client_secret
→ Customer completes payment in app
→ Webhook confirms payment
→ Notify restaurant

// Step 4: Restaurant Receives Order
Notification channels:
- Email (immediate)
- SMS (optional, paid)
- Webhook (to POS system)
- Push notification (PWA)
```

**Payment Providers:**

1. **Stripe** (Primary - International)
   - Credit cards (Visa, Mastercard, Amex)
   - Apple Pay, Google Pay
   - Commission: 2.9% + 30¢ per transaction
   - Payout: T+2 days

2. **PayPal** (Alternative)
   - PayPal accounts, cards
   - Commission: 3.49% + fixed fee
   - Payout: Instant (to PayPal balance)

3. **MoMo** (Vietnam Local - Phase 2)
   - E-wallet popular in Vietnam
   - Commission: ~1.5%
   - Payout: T+1 day

4. **ZaloPay** (Vietnam Local - Phase 2)
   - E-wallet (Zalo ecosystem)
   - Commission: ~1.5%
   - Payout: T+1 day

**API Endpoints:**
```javascript
// Payment setup
POST   /api/payment/connect/stripe      // Initiate Stripe Connect OAuth
GET    /api/payment/connect/callback    // OAuth callback
POST   /api/payment/disconnect          // Disconnect payment provider

// Orders
POST   /api/orders                      // Create order + payment intent
GET    /api/orders/:venue_id            // List venue's orders
GET    /api/orders/:id                  // Get order details
PATCH  /api/orders/:id/status           // Update order status
POST   /api/orders/:id/refund           // Process refund

// Settings
GET    /api/venues/:id/payment-settings // Get payment config
PATCH  /api/venues/:id/payment-settings // Update payment config
```

**Frontend UI:**

1. **Merchant Backoffice** (`/dashboard/venue/:id/payments`)
```
┌─────────────────────────────────────────┐
│ 💳 Online Ordering & Payments           │
├─────────────────────────────────────────┤
│                                         │
│ Online Ordering: [Toggle ON/OFF]       │
│                                         │
│ [If ON:]                                │
│                                         │
│ Payment Provider:                       │
│ ✅ Connected: Stripe                    │
│ Account: acct_xxx...xxx                 │
│ [Reconnect] [Disconnect]                │
│                                         │
├─────────────────────────────────────────┤
│ Accepted Payment Methods                │
├─────────────────────────────────────────┤
│ ☑ Credit/Debit Cards                    │
│ ☑ Apple Pay                             │
│ ☑ Google Pay                            │
│ ☐ PayPal (coming soon)                  │
│ ☐ MoMo (coming soon)                    │
│ ☐ ZaloPay (coming soon)                 │
│                                         │
├─────────────────────────────────────────┤
│ Order Settings                          │
├─────────────────────────────────────────┤
│ Minimum Order: [50,000] VND             │
│                                         │
│ Commission Model:                       │
│ ● Platform Fee (Gudbro 5%, You 95%)    │
│ ○ Pass Through (You absorb all fees)   │
│                                         │
│ Order Types Enabled:                    │
│ ☑ Dine In                               │
│ ☑ Takeout                               │
│ ☐ Delivery (coming soon)                │
│                                         │
├─────────────────────────────────────────┤
│ Notifications                           │
├─────────────────────────────────────────┤
│ ☑ Email (free)                          │
│ ☑ SMS ($0.05/notification)              │
│ ☐ Webhook (configure below)             │
│                                         │
│ [Save Settings]                         │
└─────────────────────────────────────────┘
```

2. **Customer Ordering Flow** (`/menu/:slug`)
```
[Menu Page]
├─ Menu Items (with "Add to Cart" buttons)
├─ Cart Icon (floating, shows count)
└─ Click Cart → Modal

[Cart Modal]
├─ Items list (quantity, price)
├─ Subtotal
├─ [Checkout Button]
└─ Click → Redirect to Checkout

[Checkout Page]
┌─────────────────────────────────────────┐
│ 📋 Order Summary                        │
├─────────────────────────────────────────┤
│ 2x Pho Bo              120,000 VND      │
│ 1x Ca Phe Sua Da        25,000 VND      │
│                                         │
│ Subtotal:              145,000 VND      │
│ Tax (8%):               11,600 VND      │
│ Total:                 156,600 VND      │
│                                         │
├─────────────────────────────────────────┤
│ 👤 Your Information                     │
├─────────────────────────────────────────┤
│ Name: [_________________]               │
│ Phone: [_________________]              │
│ Email: [_________________] (optional)   │
│                                         │
├─────────────────────────────────────────┤
│ 🍽️ Order Type                           │
├─────────────────────────────────────────┤
│ ● Dine In  ○ Takeout  ○ Delivery       │
│                                         │
│ [If Dine In:] Table Number: [___]      │
│                                         │
│ Special Instructions:                   │
│ [____________________________________]  │
│                                         │
├─────────────────────────────────────────┤
│ 💳 Payment Method                       │
├─────────────────────────────────────────┤
│ ● Credit/Debit Card                     │
│ ○ Apple Pay                             │
│ ○ Google Pay                            │
│                                         │
│ [Stripe Payment Element]                │
│ (Card number, expiry, CVC)              │
│                                         │
│ [Place Order & Pay - 156,600 VND]      │
└─────────────────────────────────────────┘

[Success Page]
✅ Order Confirmed!
Order #12345
We've sent a confirmation to your email.
The restaurant has been notified.

[View Order Status]
```

3. **Restaurant Order Management** (`/dashboard/venue/:id/orders`)
```
[Today's Orders] [All Orders]

┌─────────────────────────────────────────┐
│ 🔔 NEW ORDER #12345                     │
│ 2 minutes ago                           │
├─────────────────────────────────────────┤
│ Table 5 | Dine In                       │
│ Customer: Nguyen Van A                  │
│ Phone: 0912345678                       │
│                                         │
│ Items:                                  │
│ • 2x Pho Bo                             │
│ • 1x Ca Phe Sua Da                      │
│                                         │
│ Total: 156,600 VND ✅ PAID              │
│                                         │
│ [Confirm Order] [Reject]                │
└─────────────────────────────────────────┘

[Order status workflow]
Pending → Confirmed → Preparing → Ready → Completed
```

**Revenue Model:**
```javascript
// Example order
order_total = 150,000 VND // ~$6 USD

// Option A: Platform Fee (default, recommended)
stripe_fee = 150000 * 0.029 + 700 = 5,050 VND
gudbro_fee = 150000 * 0.05 = 7,500 VND
restaurant_receives = 150000 - 5050 - 7500 = 137,450 VND

// Option B: Pass Through (restaurant absorbs fees)
stripe_fee = 5,050 VND
gudbro_fee = 0 VND (Gudbro makes money from SaaS only)
restaurant_receives = 150000 - 5050 = 144,950 VND
```

**Acceptance Criteria:**
- [ ] Merchant can connect Stripe account via OAuth
- [ ] Customer can add items to cart and checkout
- [ ] Payment processed successfully via Stripe
- [ ] Apple Pay / Google Pay work on mobile Safari/Chrome
- [ ] Restaurant receives email notification within 1 min of order
- [ ] Order status updates in real-time (merchant dashboard)
- [ ] Refund flow works (merchant can refund from dashboard)
- [ ] Commission calculated correctly (5% platform fee)
- [ ] Mobile-first design (ordering from phone is primary use case)
- [ ] Works offline → queues order when connection restored

**NOT in Scope:**
- ❌ Cash on delivery
- ❌ Cryptocurrency payments
- ❌ Installment payments (buy now, pay later)
- ❌ Kitchen display system (KDS) integration (Part B - webhooks)
- ❌ Delivery routing/driver management
- ❌ Loyalty points/rewards (future)

**Estimated Effort:** 12-15 days (complex, payment compliance)

**Dependencies:**
- Requires: Multi-venue management (associate orders with venue)
- Requires: Stripe business account (Gudbro platform account)
- Requires: Legal review (terms of service, refund policy)
- Requires: PCI-DSS compliance (Stripe handles this)

---

### PART B: WEBHOOK INFRASTRUCTURE (IN SCOPE)

**Goal:** Prepare webhook infrastructure for future integrations (POS, CRM) without implementing full connectors

**Why:**
- Enable restaurants to connect their existing systems
- Build extensible architecture early (avoid refactor later)
- Competitive advantage: "Integrates with your POS"
- Unlock Enterprise tier pricing

**User Story:**
> "As a restaurant owner, I want to receive a webhook notification every time an order is placed, so I can trigger actions in my POS system (e.g., print kitchen ticket, update inventory) without building a custom integration."

**Database Schema:**
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES restaurants(id) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'qr.scanned', 'order.created', 'order.completed', 'feedback.submitted'
  endpoint_url TEXT NOT NULL, -- customer's webhook URL
  secret VARCHAR(255) NOT NULL, -- for HMAC signature validation
  active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_ms INTEGER DEFAULT 5000,
  created_at TIMESTAMP DEFAULT NOW(),
  last_triggered_at TIMESTAMP
);

CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
  event_data JSONB NOT NULL,
  response_status INTEGER, -- HTTP status code
  response_body TEXT,
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  retry_attempt INTEGER DEFAULT 0
);

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- 'Square POS', 'Toast', 'HubSpot'
  type VARCHAR(50), -- 'pos', 'payment', 'crm', 'marketing'
  config_schema JSONB, -- JSON Schema for configuration
  status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'beta', 'active'
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_webhooks_venue ON webhooks(venue_id);
CREATE INDEX idx_webhooks_active ON webhooks(active) WHERE active = true;
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_sent ON webhook_logs(sent_at DESC);
```

**Event Types (Emit Only - No Handler Implementation):**
```javascript
// Event 1: QR Code Scanned
{
  event: 'qr.scanned',
  timestamp: '2025-11-03T10:30:00Z',
  venue_id: 'uuid',
  data: {
    qr_id: 'uuid',
    location: { lat: 16.0544, lng: 108.2022 },
    device: 'mobile',
    user_agent: 'Mozilla/5.0...'
  }
}

// Event 2: Order Created
{
  event: 'order.created',
  timestamp: '2025-11-03T10:30:00Z',
  venue_id: 'uuid',
  data: {
    order_id: 'uuid',
    customer: { name, phone, email },
    items: [
      { menu_item_id: 'uuid', name: 'Pho Bo', quantity: 2, price: 60000 }
    ],
    total: 156600,
    currency: 'VND',
    order_type: 'dine_in',
    table_number: '5',
    payment_status: 'paid'
  }
}

// Event 3: Order Status Changed
{
  event: 'order.status_changed',
  timestamp: '2025-11-03T10:35:00Z',
  venue_id: 'uuid',
  data: {
    order_id: 'uuid',
    old_status: 'confirmed',
    new_status: 'preparing'
  }
}

// Event 4: Feedback Submitted
{
  event: 'feedback.submitted',
  timestamp: '2025-11-03T10:30:00Z',
  venue_id: 'uuid',
  data: {
    feedback_id: 'uuid',
    category: 'bug',
    severity: 'high',
    message: 'Menu images not loading'
  }
}
```

**API Endpoints:**
```javascript
POST   /api/webhooks                  // Register webhook
GET    /api/webhooks/:venue_id        // List venue's webhooks
PATCH  /api/webhooks/:id              // Update webhook (URL, events)
DELETE /api/webhooks/:id              // Delete webhook
POST   /api/webhooks/:id/test         // Send test payload
GET    /api/webhooks/:id/logs         // View delivery logs (debugging)

GET    /api/integrations              // List available integrations (catalog)
```

**Webhook Delivery Implementation:**
```javascript
// Webhook service (Redis Bull queue)
const Queue = require('bull');
const crypto = require('crypto');
const axios = require('axios');

const webhookQueue = new Queue('webhooks', process.env.REDIS_URL);

// Function to emit event
async function emitWebhookEvent(eventType, data) {
  const webhooks = await getActiveWebhooks(data.venue_id, eventType);
  
  for (const webhook of webhooks) {
    await webhookQueue.add({
      webhook_id: webhook.id,
      endpoint_url: webhook.endpoint_url,
      secret: webhook.secret,
      payload: { 
        event: eventType, 
        timestamp: new Date().toISOString(), 
        venue_id: data.venue_id,
        data 
      }
    });
  }
}

// Worker to process queue
webhookQueue.process(async (job) => {
  const { webhook_id, endpoint_url, secret, payload } = job.data;
  
  // Generate HMAC signature
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  try {
    const response = await axios.post(endpoint_url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Gudbro-Signature': signature,
        'X-Gudbro-Event': payload.event,
        'User-Agent': 'Gudbro-Webhooks/1.0'
      },
      timeout: 5000
    });
    
    // Log success
    await logWebhookDelivery(webhook_id, payload, response.status, null);
    
  } catch (error) {
    // Log failure
    await logWebhookDelivery(
      webhook_id, 
      payload, 
      error.response?.status, 
      error.message
    );
    
    // Retry logic (up to 3 attempts with exponential backoff)
    if (job.attemptsMade < 3) {
      throw error; // Bull will retry automatically
    }
  }
});

// Example: Emit webhook when order created
app.post('/api/orders', async (req, res) => {
  // ... create order logic ...
  
  // Emit webhook event
  await emitWebhookEvent('order.created', {
    venue_id: order.venue_id,
    order_id: order.id,
    customer: order.customer,
    items: order.items,
    total: order.total,
    // ... other data
  });
  
  res.json({ order });
});
```

**Frontend UI:**

1. **Webhooks Page** (`/dashboard/venue/:id/integrations/webhooks`)
```
┌─────────────────────────────────────────┐
│ 🔗 Webhooks                             │
├─────────────────────────────────────────┤
│ Webhooks allow you to receive real-time│
│ notifications when events happen.       │
│                                         │
│ [+ Add Webhook]                         │
│                                         │
├─────────────────────────────────────────┤
│ Active Webhooks                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ POS Integration                     │ │
│ │ https://mypos.com/webhook           │ │
│ │ Events: order.created, order.status │ │
│ │ Last triggered: 2 min ago ✅        │ │
│ │ [Test] [Edit] [Delete]              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Add Webhook Modal]                     │
│ ┌─────────────────────────────────────┐ │
│ │ Name: [___________________]         │ │
│ │                                     │ │
│ │ Endpoint URL:                       │ │
│ │ [___________________]               │ │
│ │                                     │ │
│ │ Secret: [__________] [Generate]     │ │
│ │                                     │ │
│ │ Events:                             │ │
│ │ ☑ order.created                     │ │
│ │ ☑ order.status_changed              │ │
│ │ ☐ qr.scanned                        │ │
│ │ ☐ feedback.submitted                │ │
│ │                                     │ │
│ │ [Cancel] [Create Webhook]           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

2. **Integration Catalog** (`/dashboard/integrations`)
```
┌─────────────────────────────────────────┐
│ 🔌 Integrations                         │
├─────────────────────────────────────────┤
│ Connect Gudbro with your favorite tools │
│                                         │
│ [Categories: All | POS | CRM | Payment] │
│                                         │
├─────────────────────────────────────────┤
│ Popular Integrations                    │
├─────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐            │
│ │  [Logo]   │ │  [Logo]   │            │
│ │  Square   │ │   Toast   │            │
│ │    POS    │ │    POS    │            │
│ │           │ │           │            │
│ │ 🔵 Coming │ │ 🔵 Coming │            │
│ │   Soon    │ │   Soon    │            │
│ │           │ │           │            │
│ │ [Request] │ │ [Request] │            │
│ └───────────┘ └───────────┘            │
│                                         │
│ ┌───────────┐ ┌───────────┐            │
│ │  [Logo]   │ │  [Logo]   │            │
│ │  HubSpot  │ │Mailchimp  │            │
│ │    CRM    │ │ Marketing │            │
│ │           │ │           │            │
│ │ 🟡 Planned│ │ 🟡 Planned│            │
│ │           │ │           │            │
│ │ [Request] │ │ [Request] │            │
│ └───────────┘ └───────────┘            │
│                                         │
│ Don't see what you need?                │
│ [Request Integration]                   │
└─────────────────────────────────────────┘
```

3. **Webhook Logs** (`/dashboard/venue/:id/integrations/webhooks/:id/logs`)
```
[Last 100 Deliveries]

Date         Event           Status  Latency
2025-11-03   order.created   200 ✅  342ms
2025-11-03   order.status    200 ✅  289ms
2025-11-03   order.created   500 ❌  5012ms (timeout)
  └─ Retry 1: 200 ✅ 401ms
2025-11-02   qr.scanned      200 ✅  156ms

[Click row to see full payload + response]
```

**Tech Stack:**
- Backend: New service `packages/webhooks/backend`
- Queue: Redis Bull for async delivery
- Database: PostgreSQL
- Frontend: `/frontend/app/dashboard/integrations`

**Acceptance Criteria:**
- [ ] Venue can register webhook with custom endpoint URL
- [ ] System emits events when: order created, order status changed, QR scanned, feedback submitted
- [ ] Webhook delivery includes HMAC signature (sha256)
- [ ] Retry logic: 3 attempts with exponential backoff (1s, 2s, 4s)
- [ ] Webhook logs saved for 30 days (debugging)
- [ ] Test webhook sends sample payload successfully
- [ ] Webhook signature validation works (customer can verify)
- [ ] Integration catalog shows planned integrations with status
- [ ] Mobile responsive webhook management UI

**KPI Targets:**
- **Webhook delivery success rate:** >99%
- **Average delivery latency:** <500ms
- **Failed deliveries (after retries):** <0.1%

**NOT in Scope:**
- ❌ POS integration implementation (Square, Toast, etc.)
- ❌ Payment gateway connectors (Stripe already in Part A)
- ❌ CRM sync logic (HubSpot, Salesforce)
- ❌ OAuth flows for third-party services
- ✅ **ONLY** webhook infrastructure + event emission

**Estimated Effort (Part B):** 3-4 days (1 developer)

**Total Estimated Effort (Part A + B):** 15-19 days

**Dependencies:**
- Requires: Multi-venue management (associate webhooks with venue)
- Requires: Redis (for Bull queue)
- Requires: Part A (orders need to exist to emit order.created events)

**Related Docs:** 
- Webhook security best practices (create docs/WEBHOOK-SECURITY.md)
- Integration partner onboarding guide (future)

---

## 4. REFERRAL_SYSTEM (P2)

**Goal:** Create viral growth loop with unified credits system and RECURRING commissions

**Why:**
- Lower CAC: Referrals convert at 30% vs 2% paid ads
- Retention: Credits create lock-in (gamification)
- Upsell: Credits enable merchandise store (new revenue stream)
- Network effects: More users = more referrals = exponential growth
- **Recurring revenue share:** Agencies/power users earn passive income

**User Stories:**

**US1: Restaurant Owner Referral**
> "I love Gudbro QR Menu and referred 3 friends. I earn credits every month as long as they stay subscribed. After 6 months, I've earned $180 in credits which I used for my subscription and bought QR stands. It's like passive income!"

**US2: Agency Portfolio**
> "As an agency, I brought 12 restaurant clients to Gudbro. I earn 20% recurring commission on all their subscriptions. That's $70/month passive income that keeps growing as I add more clients. I use the credits for my own venues and merchandise."

**US3: Milestone Motivation**
> "I just hit 10 referrals and unlocked a $150 bonus! Now I'm motivated to reach 25 referrals for the $500 bonus. It's like a game, and my friends benefit too with discounts."

### Technical Specification

**Database Schema:**
```sql
-- User credit balances
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00, -- current available credits (USD)
  lifetime_earned DECIMAL(10,2) DEFAULT 0.00,
  lifetime_spent DECIMAL(10,2) DEFAULT 0.00,
  recurring_monthly DECIMAL(10,2) DEFAULT 0.00, -- recurring credits per month
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Credit transaction ledger
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL, -- positive = earned, negative = spent
  type VARCHAR(50) NOT NULL, -- 'referral_signup', 'referral_recurring', 'billing', 'merchandise', 'promo', 'milestone'
  description TEXT NOT NULL,
  reference_id UUID, -- referral_id, order_id, etc.
  metadata JSONB, -- additional context
  balance_before DECIMAL(10,2),
  balance_after DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID REFERENCES users(id) NOT NULL,
  invitee_email VARCHAR(255) NOT NULL,
  invitee_id UUID REFERENCES users(id), -- filled after signup
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'signed_up', 'active', 'churned'
  
  -- Credits tracking
  signup_credits_earned DECIMAL(10,2) DEFAULT 0.00,
  conversion_credits_earned DECIMAL(10,2) DEFAULT 0.00,
  recurring_credits_earned DECIMAL(10,2) DEFAULT 0.00, -- total earned from recurring
  last_recurring_payment_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  signed_up_at TIMESTAMP,
  converted_at TIMESTAMP, -- first payment
  churned_at TIMESTAMP -- when invitee cancels subscription
);

-- Milestone tracking
CREATE TABLE milestone_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  milestone_type VARCHAR(50), -- 'referral_count', 'anniversary', 'spending'
  threshold INTEGER, -- e.g., 5 referrals, 12 months
  reward_credits DECIMAL(10,2),
  achieved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, milestone_type, threshold)
);

CREATE INDEX idx_referrals_inviter ON referrals(inviter_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_credits_user ON user_credits(user_id);
CREATE INDEX idx_credit_txns_user ON credit_transactions(user_id);
CREATE INDEX idx_credit_txns_created ON credit_transactions(created_at DESC);
```

**Credit Earning Rules (UPDATED - RECURRING MODEL):**
```javascript
const CREDIT_RULES = {
  // One-time referral rewards
  referral_signup: {
    credits: 10.00,
    trigger: 'invitee creates account',
    description: '{invitee_name} signed up via your link'
  },
  
  referral_first_payment: {
    credits: 29.00,
    trigger: 'invitee makes first payment',
    description: 'Referral bonus: {invitee_name} became paying customer'
  },
  
  // 🔥 NEW: Recurring commission (LIFETIME, not just 3 months)
  referral_recurring: {
    percentage: 0.20, // 20% of invitee's subscription
    trigger: 'invitee monthly payment',
    duration: 'lifetime', // ⚡ AS LONG AS SUBSCRIPTION ACTIVE
    description: 'Recurring commission: {invitee_name} (month {X})',
    stops_when: 'invitee cancels subscription OR invitee changes referrer (not implemented)'
  },
  
  // Invitee discount (one-time)
  invitee_discount: {
    credits: 10.00,
    trigger: 'signup via referral link',
    description: 'Welcome discount: Referred by {inviter_name}',
    applied_to: 'invitee (not inviter)'
  },
  
  // Milestone bonuses (one-time, but multiple thresholds)
  milestones: [
    { 
      referrals: 5, 
      credits: 50, 
      description: '🎉 5 Referrals Milestone!',
      trigger: 'when 5th invitee converts (first payment)'
    },
    { 
      referrals: 10, 
      credits: 150, 
      description: '🚀 10 Referrals Milestone!',
      trigger: 'when 10th invitee converts'
    },
    { 
      referrals: 25, 
      credits: 500, 
      description: '💎 25 Referrals Milestone!',
      trigger: 'when 25th invitee converts'
    },
    { 
      referrals: 50, 
      credits: 1200, 
      description: '👑 50 Referrals Milestone! (VIP Status)',
      trigger: 'when 50th invitee converts'
    },
    {
      referrals: 100,
      credits: 3000,
      description: '🏆 100 Referrals Milestone! (Legend Status)',
      trigger: 'when 100th invitee converts'
    }
  ],
  
  // Loyalty rewards (recurring, annual)
  anniversary: {
    credits: 5.00,
    trigger: 'every 12 months of active subscription',
    description: 'Thank you for {years} year(s) with Gudbro! 🎂'
  },
  
  // Promotional (one-time)
  promo_code: {
    credits: 'variable',
    trigger: 'manual or campaign-based',
    description: 'Promo: {campaign_name}'
  }
};
```

**Recurring Commission Logic:**
```javascript
// When invitee pays monthly subscription
async function processMonthlyPayment(userId, amount) {
  // ... payment processing ...
  
  // Find referral
  const referral = await Referral.findOne({
    invitee_id: userId,
    status: 'active'
  });
  
  if (referral) {
    const commissionAmount = amount * 0.20; // 20% commission
    
    // Award credits to inviter
    await addCredits({
      user_id: referral.inviter_id,
      amount: commissionAmount,
      type: 'referral_recurring',
      description: `Recurring commission: ${invitee.name} (subscription month)`,
      reference_id: referral.id,
      metadata: {
        invitee_id: userId,
        subscription_amount: amount,
        commission_rate: 0.20
      }
    });
    
    // Update referral record
    await Referral.update(referral.id, {
      recurring_credits_earned: referral.recurring_credits_earned + commissionAmount,
      last_recurring_payment_at: new Date()
    });
    
    // Update inviter's recurring monthly estimate
    await updateRecurringMonthly(referral.inviter_id);
  }
}

// Calculate estimated recurring monthly income
async function updateRecurringMonthly(userId) {
  const activeReferrals = await Referral.findAll({
    inviter_id: userId,
    status: 'active'
  });
  
  const monthlyEstimate = activeReferrals.reduce((sum, ref) => {
    // Get invitee's current subscription amount
    const inviteeSubscription = getSubscriptionAmount(ref.invitee_id);
    return sum + (inviteeSubscription * 0.20);
  }, 0);
  
  await UserCredits.update(userId, {
    recurring_monthly: monthlyEstimate
  });
}

// When invitee cancels subscription
async function handleSubscriptionCancellation(userId) {
  const referral = await Referral.findOne({
    invitee_id: userId,
    status: 'active'
  });
  
  if (referral) {
    await Referral.update(referral.id, {
      status: 'churned',
      churned_at: new Date()
    });
    
    // Recalculate inviter's recurring monthly
    await updateRecurringMonthly(referral.inviter_id);
    
    // Send notification to inviter
    await sendNotification({
      user_id: referral.inviter_id,
      type: 'referral_churned',
      message: `${invitee.name} cancelled their subscription. Your recurring credits will decrease by $${amount}/month.`
    });
  }
}
```

**Credit Spending Options:**
```javascript
const SPENDING_OPTIONS = {
  // Auto-apply to subscription (priority 1)
  subscription_billing: {
    enabled: true,
    priority: 1,
    description: 'Auto-deduct from monthly bill',
    example: 'Bill $29 → Credits -$29 → Pay $0',
    rule: 'credits applied up to full bill amount'
  },
  
  // Merchandise store (PHASE 3 - Q2 2026)
  merchandise: {
    enabled: false, // coming soon
    categories: [
      {
        name: 'QR Physical Products',
        items: [
          { sku: 'nfc-card-10pk', name: 'NFC Cards (10 pack)', credits: 15, cost_usd: 8, margin: 0.47 },
          { sku: 'acrylic-stand', name: 'Acrylic QR Stand', credits: 25, cost_usd: 12, margin: 0.52 },
          { sku: 'table-tent', name: 'Table Tent with QR', credits: 20, cost_usd: 10, margin: 0.50 },
          { sku: 'stickers-sheet', name: 'QR Stickers (50 pack)', credits: 10, cost_usd: 5, margin: 0.50 },
          { sku: 'poster-a3', name: 'A3 Poster with QR', credits: 30, cost_usd: 15, margin: 0.50 }
        ]
      },
      {
        name: 'Marketing Materials',
        items: [
          { sku: 'business-cards', name: 'Business Cards (500)', credits: 50, cost_usd: 25, margin: 0.50 },
          { sku: 'flyers-1000', name: 'Flyers (1000)', credits: 80, cost_usd: 40, margin: 0.50 },
          { sku: 'banner', name: 'Roll-up Banner', credits: 150, cost_usd: 75, margin: 0.50 }
        ]
      },
      {
        name: 'Premium Services',
        items: [
          { sku: 'ai-qr-custom', name: 'Custom AI Artistic QR', credits: 100, cost_usd: 50, margin: 0.50 },
          { sku: 'menu-photos', name: 'Menu Photography Session', credits: 300, cost_usd: 150, margin: 0.50 },
          { sku: 'menu-copywriting', name: 'Professional Menu Copywriting', credits: 200, cost_usd: 100, margin: 0.50 }
        ]
      }
    ],
    margin_strategy: 'credits_at_par', // 1 credit = $1 earned, merchandise prices set to maintain 50% margin
    fulfillment: 'print_on_demand' // Printful, Printify, or similar
  },
  
  // Premium features
  premium_upgrades: {
    enabled: true,
    items: [
      { feature: 'extra_qr_designs', credits: 10, description: 'Unlock 20 premium QR templates', duration: 'lifetime' },
      { feature: 'priority_support', credits: 20, duration: '1 month', description: '24/7 priority support for 30 days' },
      { feature: 'custom_domain', credits: 15, duration: '1 year', description: 'menu.yourdomain.com for 1 year' },
      { feature: 'white_label', credits: 50, duration: '1 month', description: 'Remove Gudbro branding for 30 days' },
      { feature: 'advanced_analytics', credits: 30, duration: '1 month', description: 'Heatmaps, funnel analysis, cohort reports' }
    ]
  },
  
  // Transfer credits (FUTURE - marketplace)
  transfer: {
    enabled: false, // Phase 4
    description: 'Send credits to another Gudbro user',
    min_amount: 10,
    max_amount: 1000,
    fee_percent: 0.05 // 5% transfer fee
  }
};
```

**API Endpoints:**
```javascript
// Credits
GET    /api/credits/balance            // Get user's credit balance + recurring estimate
GET    /api/credits/transactions        // Credit transaction history (paginated)
GET    /api/credits/recurring           // Breakdown of recurring income by referral

// Referrals
POST   /api/referrals/generate          // Generate referral code + link
GET    /api/referrals/my                // My referral stats + earnings
POST   /api/referrals/invite            // Send invite email
GET    /api/referrals/:code/validate    // Validate code (signup flow)
POST   /api/referrals/track-signup      // Track when invitee signs up
GET    /api/referrals/active            // List active referrals (earning recurring)
GET    /api/referrals/churned           // List churned referrals

// Milestones
GET    /api/milestones/progress         // Show progress to next milestone
GET    /api/milestones/achievements     // List achieved milestones

// Merchandise (PHASE 3)
GET    /api/merchandise/catalog         // Browse items
POST   /api/merchandise/orders          // Place order with credits
GET    /api/merchandise/orders/my       // My orders
```

**Frontend UI:**

1. **Credits Dashboard** (`/dashboard/credits`)
```
┌─────────────────────────────────────────┐
│ 💰 Your Gudbro Credits                  │
├─────────────────────────────────────────┤
│                                         │
│  Current Balance                        │
│  $347.50                                │
│                                         │
│  📈 Recurring Monthly Income            │
│  $68.00/month                           │
│  (from 12 active referrals)             │
│  [View Breakdown]                       │
│                                         │
│  💵 Lifetime Stats                      │
│  Earned: $1,247.00                      │
│  Spent: $899.50                         │
│                                         │
├─────────────────────────────────────────┤
│ 🎯 Next Milestone                       │
├─────────────────────────────────────────┤
│  23/25 active referrals                 │
│  [███████████████████░░] 92%            │
│  → Unlock $500 bonus (2 more!)          │
│                                         │
│  Total Milestones Achieved: 3           │
│  Next: 25 referrals ($500)              │
│  After: 50 referrals ($1,200)           │
│                                         │
├─────────────────────────────────────────┤
│ 📈 How to Earn More                     │
├─────────────────────────────────────────┤
│  🔗 Refer a friend                      │
│     • Signup: +$10 immediately          │
│     • First payment: +$29 bonus         │
│     • Recurring: +$5.80/month forever   │
│       (20% of $29 subscription)         │
│                                         │
│  🎉 Reach milestones                    │
│     • 25 referrals: $500 bonus          │
│     • 50 referrals: $1,200 bonus        │
│     • 100 referrals: $3,000 bonus       │
│                                         │
│  [Copy Referral Link]                   │
│  [Invite via Email]                     │
│                                         │
├─────────────────────────────────────────┤
│ 💳 How to Spend                         │
├─────────────────────────────────────────┤
│  ✅ Monthly bill (Auto-applied)         │
│    Next bill: $29 → $0                  │
│    (using credits, remaining $318.50)   │
│                                         │
│  🛍️ Merchandise Store (Coming Q2 2026) │
│    QR stands, NFC cards, posters, etc.  │
│    [Notify Me When Available]           │
│                                         │
│  ⚡ Premium Features                    │
│    [Browse Upgrades]                    │
│                                         │
├─────────────────────────────────────────┤
│ 📊 Recent Activity                      │
├─────────────────────────────────────────┤
│  Nov 3  Recurring: John Doe   +$5.80   │
│  Nov 3  Recurring: Jane Smith +$5.80   │
│  Nov 3  Recurring: Mike Lee   +$5.80   │
│  Nov 1  Applied to bill       -$29.00  │
│  Oct 28 Referral: Sarah Ng    +$29.00  │
│  Oct 28 Referral signup       +$10.00  │
│  Oct 15 🎉 10 Referrals Bonus +$150.00 │
│                                         │
│  [View All Transactions]                │
└─────────────────────────────────────────┘
```

2. **Recurring Income Breakdown** (`/dashboard/credits/recurring`)
```
┌─────────────────────────────────────────┐
│ 📈 Recurring Monthly Income: $68.00     │
├─────────────────────────────────────────┤
│ You earn credits every month from 12    │
│ active customers you referred.          │
│                                         │
│ [Active Referrals (12)]                 │
│                                         │
│ Name           Plan    Monthly  Total   │
│ ────────────────────────────────────────│
│ John Doe       Pro     +$5.80   $34.80  │
│                        (6 months)       │
│ Jane Smith     Basic   +$5.80   $17.40  │
│                        (3 months)       │
│ Mike Lee       Pro     +$5.80   $69.60  │
│                        (12 months)      │
│ Sarah Nguyen   Basic   +$5.80   $5.80   │
│                        (1 month)        │
│ ...                                     │
│                                         │
│ Total Recurring: $68.00/month           │
│ Lifetime Recurring Earned: $847.50      │
│                                         │
├─────────────────────────────────────────┤
│ [Churned Referrals (2)]                 │
│                                         │
│ Bob Wilson     (Cancelled Oct 2025)     │
│   Earned $34.80 over 6 months           │
│                                         │
│ Lisa Chen      (Cancelled Sep 2025)     │
│   Earned $17.40 over 3 months           │
│                                         │
└─────────────────────────────────────────┘
```

3. **Referral Page** (`/dashboard/referrals`)
```
┌─────────────────────────────────────────┐
│ 🔗 Invite Friends, Earn Forever         │
├─────────────────────────────────────────┤
│                                         │
│ Your Referral Code: AGENCY-K7B2M9       │
│ [Copy Link]                             │
│                                         │
│ Your Link:                              │
│ https://gudbro.com/signup?ref=AGENCY... │
│                                         │
│ [Share via Email] [WhatsApp] [Facebook] │
│                                         │
├─────────────────────────────────────────┤
│ 💡 How It Works                         │
├─────────────────────────────────────────┤
│ 1. Share your link                      │
│ 2. Friend signs up → You get $10        │
│ 3. They pay first time → You get $29    │
│ 4. 🔥 EVERY MONTH they stay subscribed  │
│    → You earn 20% commission ($5.80)    │
│                                         │
│ Example: 10 active referrals =          │
│ $58/month passive income! 💰            │
│                                         │
├─────────────────────────────────────────┤
│ 📊 Your Stats                           │
├─────────────────────────────────────────┤
│ Invites Sent:        47                 │
│ Signups:             23 (49% conversion)│
│ Active Subscribers:  12 (52% retention) │
│ Churned:             2                  │
│ Pending:             9                  │
│                                         │
│ Total Earned:        $1,247.00          │
│  ├─ Signups:         $230.00            │
│  ├─ First Payment:   $667.00 (23×$29)   │
│  ├─ Recurring:       $200.00            │
│  └─ Milestones:      $150.00 (10 refs)  │
│                                         │
│ Monthly Recurring:   $68.00/month       │
│                                         │
├─────────────────────────────────────────┤
│ 📝 Referral List                        │
├─────────────────────────────────────────┤
│ [Tabs: All | Active | Churned | Pending]│
│                                         │
│ [Active (12)]                           │
│                                         │
│ Name           Status    Earned         │
│ ────────────────────────────────────────│
│ John Doe       Active    $69.60         │
│   📧 john@email.com                     │
│   Subscribed: 12 months                 │
│   Monthly: +$5.80                       │
│                                         │
│ Jane Smith     Active    $22.20         │
│   📧 jane@email.com                     │
│   Subscribed: 3 months                  │
│   Monthly: +$5.80                       │
│                                         │
│ ...                                     │
│                                         │
└─────────────────────────────────────────┘
```

4. **Signup Flow with Referral** (`/signup?ref=AGENCY-K7B2M9`)
```
┌─────────────────────────────────────────┐
│ 🎁 Welcome! You've been invited         │
├─────────────────────────────────────────┤
│ Marketing Agency XYZ thinks Gudbro      │
│ would be perfect for your restaurant.   │
│                                         │
│ Your benefit: $10 credit on signup! 💰  │
│                                         │
│ [Continue to Sign Up]                   │
└─────────────────────────────────────────┘
```

**Tech Stack:**
- Backend: Extend `packages/menu/backend` (referral routes)
- Database: PostgreSQL
- Frontend: `/frontend/app/dashboard/credits` and `/dashboard/referrals`
- Email: Nodemailer with templates
- Cron jobs: Monthly recurring credit processing (scheduled task)

### Acceptance Criteria

- [ ] User can generate unique referral code
- [ ] Referral link opens signup with code pre-filled
- [ ] Invitee gets $10 credits on signup
- [ ] Inviter gets $10 credits when invitee signs up
- [ ] Inviter gets $29 credits after invitee's first payment
- [ ] 🔥 Inviter gets 20% recurring credits EVERY month invitee pays
- [ ] Recurring credits stop when invitee cancels subscription
- [ ] Recurring monthly income displayed on dashboard (accurate estimate)
- [ ] Milestone bonus awarded automatically (5, 10, 25, 50, 100 referrals)
- [ ] Credits auto-apply to monthly bill (inviter pays $0 if enough credits)
- [ ] Credits dashboard shows real-time balance + recurring income
- [ ] Referral stats accurate (active, churned, pending, total earned)
- [ ] Transaction history paginated (>100 transactions)
- [ ] Mobile responsive (view credits, share referral link from phone)
- [ ] Email notifications for: new signup, first payment, recurring payment, milestone achieved, referral churned

### KPI Targets

- **Referral rate:** 15% of customers refer ≥1 person
- **Conversion rate:** 30% of invitees sign up
- **Retention rate:** 70% of referred customers stay subscribed >3 months (higher than non-referred)
- **Viral coefficient:** 0.3-0.5 (modest viral growth)
- **CAC reduction:** -40% for referred customers
- **Recurring referral income:** $50-100/month per power user (10+ active referrals)

### Business Model - Recurring Credits Economy
```javascript
// UPDATED: Recurring commission model
RECURRING_ECONOMICS = {
  // Scenario: Agency refers 12 restaurants
  monthly_subscription: 29, // per restaurant
  commission_rate: 0.20,
  
  // Inviter earnings
  per_referral_per_month: 29 * 0.20, // $5.80/month
  total_monthly_recurring: 5.80 * 12, // $69.60/month
  total_yearly_recurring: 69.60 * 12, // $835.20/year
  
  // Gudbro keeps
  gudbro_revenue_per_restaurant: 29 * 0.80, // $23.20/month
  total_gudbro_monthly: 23.20 * 12, // $278.40/month from these 12
  
  // 3-year value
  inviter_lifetime_value: 835.20 * 3, // $2,505.60 over 3 years (if all stay subscribed)
  gudbro_lifetime_value: 278.40 * 12 * 3, // $10,022.40 over 3 years
  
  // ROI for Gudbro
  cost_per_referral: 10 + 29, // signup + first payment bonus = $39
  total_cost: 39 * 12, // $468 upfront cost
  payback_period: 468 / 278.40, // ~1.7 months to break even
  
  // After payback, pure profit margin
  ltv_to_cac: 10022.40 / 468, // 21x LTV:CAC ratio (excellent!)
};

// Credit redemption forecast (Year 1, 500 customers, 15% refer)
CREDITS_REVENUE_MODEL_YEAR1 = {
  total_customers: 500,
  referrers: 500 * 0.15, // 75 people refer
  avg_referrals_per_person: 3, // conservative
  total_referrals: 75 * 3, // 225 new customers via referrals
  
  // Credits earned
  signup_credits: 225 * 10, // $2,250
  conversion_credits: 225 * 29, // $6,525 (assuming 100% convert)
  recurring_credits_monthly: 225 * 5.80, // $1,305/month
  recurring_credits_year: 1305 * 12, // $15,660/year
  milestone_credits: 75 * 50, // ~$3,750 (avg 1 milestone per referrer)
  
  total_credits_earned_year1: 2250 + 6525 + 15660 + 3750, // $28,185
  
  // Credits spent
  spent_on_subscription: 28185 * 0.70, // 70% used for bills = $19,729 (no margin for Gudbro, but retains customers)
  spent_on_merchandise: 28185 * 0.13, // 13% used in store = $3,664
    // Merchandise profit: $3,664 credits = $1,832 actual cost → $1,832 profit (50% margin)
  breakage: 28185 * 0.17, // 17% never redeemed = $4,791 (pure profit)
  
  total_profit_from_credits: 1832 + 4791, // $6,623
  
  // But the REAL value is customer acquisition
  cac_via_referrals: (2250 + 6525) / 225, // $39 per customer (vs $100+ paid ads)
  cac_savings: (100 - 39) * 225, // $13,725 saved vs paid ads
  
  // Net benefit to Gudbro
  revenue_from_referred_customers: 225 * 29 * 12 * 0.80, // $62,640/year (after paying 20% commission)
  cost_of_credits: 28185, // paid out in credits
  net_benefit: 62640 - 28185 + 13725, // $48,180 net gain in Year 1
};
```

**Why Recurring Model is Better:**
1. **Motivation:** Referrers stay engaged (passive income stream)
2. **Quality:** Referrers bring serious customers (want them to stay subscribed)
3. **Retention:** Both referrer and invitee incentivized to stay (mutual benefit)
4. **Viral Growth:** Snowball effect as active referrals compound
5. **Competitive Moat:** Hard to copy (requires strong unit economics)

### NOT in Scope

- ❌ Credit marketplace (users trading credits)
- ❌ Credit gifting (send credits to friends) - Phase 4
- ❌ Credit expiration (all credits permanent for now)
- ❌ Multi-currency credits (USD only)
- ❌ Tiered commission rates (20% flat for everyone)
- ❌ Referrer performance tiers (Bronze/Silver/Gold) - Phase 4

**Estimated Effort:**
- Referral + Credits system: 5-6 days (added recurring logic)
- Merchandise store (PHASE 3 - Q2 2026): 10-15 days (separate project)

**Dependencies:**
- Requires: User authentication ✅
- Requires: Multi-venue management (agencies earn more)
- Requires: Payment system (to track recurring payments)
- Requires: Subscription management (to detect cancellations)

**Related Docs:**
- QR Tiger templates inspiration: https://www.templates.qrcode-tiger.com/
- Merchandise supplier list (to create - Phase 3)
- Print-on-demand partner evaluation (Printful, Printify)
- Referral program terms & conditions (legal doc - create with lawyer)

---

## 5. REQUIREMENT_MANAGEMENT (P3)

**Goal:** Track every new requirement as a task with clear acceptance criteria and priority

**Why:**
- Avoid scope creep (new ideas documented, not forgotten)
- Maintain context (future devs understand why features exist)
- Prioritization transparency (stakeholders see what's next)

### Process

**For Each New Requirement:**

1. **Create Entry in TODO.md**
```markdown
## [REQ-XXX] Feature Name (Priority)

**Requested by:** {name/source}
**Date:** YYYY-MM-DD
**Priority:** P0/P1/P2/P3
**Status:** Backlog / In Progress / Done / Rejected

**Description:**
{What and why}

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Estimated Effort:** X days

**Dependencies:**
- Requires: {other features}
- Blocks: {what this blocks}

**Decision:** {Why accepted/rejected}
```

2. **Update Master Plan**
   - Add to `Strategic Priorities` (if P0/P1)
   - Add to `Decisions Log` (if significant)
   - Update `Immediate Next Steps` (if starting soon)

3. **Link to Detailed Brief** (if complex)
   - Create `docs/{FEATURE_NAME}-BRIEF.md`
   - Link from requirement entry

### File Structure
```
docs/
├── TODO.md                          # All requirements backlog
├── QRMENU-REQUIREMENTS.md           # This file (approved requirements)
├── GUDBRO-MASTER-PLAN.md            # High-level vision + priorities
└── briefs/                          # Detailed specs (if needed)
    ├── FEEDBACK_SYSTEM-BRIEF.md
    ├── WEBHOOKS-BRIEF.md
    └── ...
```

**Estimated Effort:** Continuous (5-10 min per requirement)

**Dependencies:** None

---

## 6. MASTERPLAN_UPDATE (P3)

**Goal:** Keep Master Plan document synchronized with project reality

**Why:**
- Single source of truth for project state
- Onboarding new team members (read Master Plan = get full context)
- Avoid documentation drift (code ≠ docs = confusion)

### Update Cycle

**Weekly Review** (Every Friday):
1. Read current Master Plan
2. Compare with actual progress
3. Update sections:
   - Current Phase
   - Strategic Priorities (if priorities changed)
   - Decisions Log (new decisions made)
   - Immediate Next Steps
   - Roadmap Overview (if timeline shifted)

**After Major Milestones:**
1. Update completion status (✅ marks)
2. Move completed items to "Recent Achievements"
3. Update metrics (if available)

**When Adding New Products/Features:**
1. Add to `Product Portfolio` section
2. Update `Business Model` (if monetization changes)
3. Update `Roadmap Overview`

### New Section to Add
```markdown
## 💡 FEEDBACK & FUTURE INTEGRATIONS

**Customer Requests:** (Tracked via Feedback System)
- {Top requested features from feedback}

**Planned Integrations:** (Tracked via Integration Hooks)
- Square POS (Q2 2026)
- Toast POS (Q3 2026)
- Stripe Payments (Q2 2026) ✅
- MoMo/ZaloPay (Q3 2026)
- HubSpot CRM (Q4 2026)

**Rejected Ideas:** (And why)
- {Ideas we decided NOT to build, with rationale}
```

**Estimated Effort:** 30-60 min/week

**Dependencies:** Requires Feedback System (to populate customer requests)

---

## 📅 IMPLEMENTATION SEQUENCE

Based on dependencies and priorities:

### **Phase 1: Foundation** (Weeks 1-2)
**Must happen first (blocks others)**

1. **MULTI_VENUE_MANAGEMENT** (P1) - 8-10 days
   - Critical blocker for agencies
   - Required for: Feedback, Integration Hooks, Referrals
   - Start immediately after QR Engine completion

### **Phase 2: Customer Feedback** (Week 3)
**Build feedback loop early**

2. **FEEDBACK_SYSTEM** (P1) - 2-3 days
   - Depends on: Multi-venue (to associate feedback with venue)
   - Quick win, immediate value
   - Informs prioritization of other features

### **Phase 3: Monetization & Extensibility** (Weeks 4-7)
**Revenue generation + prepare for scale**

3. **INTEGRATION_HOOKS - Part A: Payment Processing** (P2) - 12-15 days
   - Depends on: Multi-venue, Feedback
   - Unlocks online ordering revenue (5-10% commission)
   - Competitive requirement (customers expect ordering)
   - Complex: Stripe integration, order management, notifications

4. **INTEGRATION_HOOKS - Part B: Webhooks** (P2) - 3-4 days
   - Depends on: Part A (need orders to emit events)
   - Enables POS/CRM integrations (future)
   - Enterprise tier unlock

### **Phase 4: Viral Growth** (Weeks 8-9)
**Accelerate customer acquisition**

5. **REFERRAL_SYSTEM** (P2) - 5-6 days
   - Depends on: Multi-venue, Payment system (to track recurring payments)
   - Recurring commission model = powerful motivation
   - Lower CAC, higher retention
   - Snowball effect as referrals compound

### **Ongoing: Process & Documentation**
**Continuous throughout**

6. **REQUIREMENT_MANAGEMENT** (P3) - 5-10 min per requirement
7. **MASTERPLAN_UPDATE** (P3) - 30-60 min weekly

---

## 📊 ESTIMATED TIMELINE

**Total Effort:** 33-41 working days (1 developer)

**Calendar Time:** 7-9 weeks (accounting for testing, reviews, bug fixes, iterations)

**Start Date:** Week 9 (after QR Engine completion)

**End Date:** Week 16-18

**Aligns with:** Customer Engagement Platform roadmap (16 weeks total per Master Plan)

**Breakdown by Phase:**
- Phase 1 (Foundation): 8-10 days
- Phase 2 (Feedback): 2-3 days
- Phase 3 (Monetization): 15-19 days
- Phase 4 (Growth): 5-6 days
- Ongoing (Process): Continuous

**Buffer:** 3-7 days for unexpected issues, QA, refinements

---

## ✅ ACCEPTANCE CRITERIA (Overall)

**This requirements doc is complete when:**

- [ ] All 6 requirements are fully specified with acceptance criteria
- [ ] Technical designs are clear enough for implementation
- [ ] Database schemas are defined with SQL
- [ ] API endpoints are specified with methods and payloads
- [ ] Frontend mockups/wireframes exist (or detailed UI descriptions)
- [ ] Dependencies are mapped (requires/blocks relationships)
- [ ] Implementation sequence is logical and accounts for dependencies
- [ ] Estimated efforts are realistic based on complexity
- [ ] Claude Code can implement these requirements without significant clarification questions
- [ ] All 3 corrections applied: Categories-based feedback, Payment processing included, Recurring referral model

---

## 🔗 RELATED DOCUMENTS

- **GUDBRO-MASTER-PLAN.md** - High-level vision, priorities, roadmap
- **QR_ENGINE_DEV_BRIEF.md** - QR Engine implementation (Phase 1)
- **CUSTOMER-ENGAGEMENT-PLATFORM.md** - Full 16-week plan (these requirements are Phase 2)
- **shared/database/migration_v1_restaurants.sql** - Already has `restaurants` table
- **shared/database/migration_v2_analytics_library.sql** - Analytics tables
- **shared/database/migration_v3_multi_qr.sql** - Multi-QR support
- **Gudbro_BrandGuidelines.pdf** - Brand colors, fonts, tone

---

## 📝 CHANGELOG

**2025-11-03 - v1.0 FINAL**
- ✅ FEEDBACK_SYSTEM: Changed from star ratings (1-5) to category-based system (bug/feature/improvement/question)
- ✅ INTEGRATION_HOOKS: Split into Part A (Payment Processing - Stripe/PayPal for online orders) and Part B (Webhooks for POS/CRM)
- ✅ REFERRAL_SYSTEM: Updated to RECURRING commission model (20% lifetime, not just 3 months)
- Implementation sequence updated to reflect dependencies
- Timeline extended to 7-9 weeks (33-41 days effort)
- All acceptance criteria finalized
- Ready for copy-paste into Claude Code

---

**END OF QR MENU REQUIREMENTS**

---

## 🚀 HOW TO USE THIS DOCUMENT

**Step 1: Save this file**
```bash
cd ~/Desktop/qr-platform-complete
cat > docs/QRMENU-REQUIREMENTS.md
# (paste entire content above)
# Press Ctrl+D to save
```

**Step 2: Open Claude Code**
```bash
cd ~/Desktop/qr-platform-complete
claude code
```

**Step 3: Give Claude Code this prompt:**
```
Read docs/QRMENU-REQUIREMENTS.md carefully.

Context:
- These are QR Menu expansion features (NOT QR Engine)
- Implementation starts AFTER QR Engine completion (Week 9)
- Part of Customer Engagement Platform roadmap (see GUDBRO-MASTER-PLAN.md)

Task:
Start with [1] MULTI_VENUE_MANAGEMENT (P1).

Process:
1. Read the full requirement specification
2. Review database schema (check if restaurants table exists in V1 migration)
3. Create implementation plan (break into subtasks)
4. Ask me to confirm plan before starting implementation
5. Implement with tests and documentation
6. Update GUDBRO-MASTER-PLAN.md when complete

Ready to start?
```

---

**✅ DOCUMENT COMPLETE - READY FOR IMPLEMENTATION**
