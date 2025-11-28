# Customer Engagement Platform - QR Menu Evolution

**Version:** 2.0 | **Status:** Planning Phase

---

## VISION

Transform QR Menu from "digital menu" to **complete customer engagement platform** for F&B businesses.

**Key Insight:** End-users (diners) want personalized experiences. Restaurants want loyalty & repeat customers.

---

## NEW FEATURES ROADMAP

### **Feature 1: End-User Accounts (Gudbro Customer Profile)**

**Problem:** Customers select dietary preferences every single visit → friction

**Solution:** Let customers create Gudbro account to save preferences

**User Flow:**
```
Scan QR → See Menu → "Create Account to Remember Preferences"
                    ↓
              Sign Up (email/phone/social)
                    ↓
              Select Preferences Once
                    ↓
         Future visits: Auto-filtered menu!
```

**Value Proposition:**
- **For customers:** Never select filters again, personalized recommendations
- **For restaurants:** Customer data, marketing channel, loyalty program access
- **For Gudbro:** User base across all restaurants (network effects!)

---

### **Feature 2: Preference System**

**Customer Preferences:**
```javascript
{
  user_id: "uuid",
  dietary_preferences: {
    // From Module 12 filters
    allergens_to_avoid: ["peanuts", "shellfish", "dairy"],
    dietary_flags: ["vegan"],
    intolerances: ["lactose", "gluten-celiac"],
    spice_preference: "mild",  // none, mild, medium, hot, extra-hot

    // Additional preferences
    favorite_cuisines: ["vietnamese", "italian"],
    disliked_ingredients: ["cilantro", "olives"],
    calorie_goal: "1500-2000",  // Optional
    budget_range: "medium"      // low, medium, high
  },

  // Behavioral data (analytics gold!)
  history: {
    total_scans: 45,
    favorite_restaurants: ["rest_id_1", "rest_id_2"],
    favorite_items: ["pho_bo", "banh_mi"],
    avg_order_value: 150000,  // VND
    last_visit: "2025-11-01"
  }
}
```

**Menu Auto-Filtering:**
```javascript
// When logged-in user scans menu:
1. Fetch user preferences
2. Filter menu items:
   - ❌ Hide items with user's allergens
   - ⚠️  Warn items with intolerances
   - ✅ Highlight items matching dietary flags
   - 🔥 Show spice level indicator
3. Sort by:
   - Recommended (ML-based)
   - Previously ordered
   - Popular with similar users
```

---

### **Feature 3: Loyalty System**

**Restaurant Owner Settings (Backoffice):**
```javascript
{
  restaurant_id: "uuid",
  loyalty_config: {
    enabled: true,
    program_type: "points" | "visits" | "spend",

    // Points-based
    points_per_vnd: 1,  // 1 point per 1,000 VND spent
    redemption_rate: 100,  // 100 points = 1,000 VND discount

    // Visit-based (stamp card)
    visits_required: 10,
    reward: {
      type: "free_item" | "discount",
      value: "Free Coffee" | "20% off"
    },

    // Spend-based tiers
    tiers: [
      { name: "Silver", min_spend: 500000, perks: ["5% discount"] },
      { name: "Gold", min_spend: 2000000, perks: ["10% discount", "free_delivery"] },
      { name: "Platinum", min_spend: 5000000, perks: ["15% discount", "priority_seating"] }
    ]
  },

  // Promotions for repeat customers
  promotions: [
    {
      id: "uuid",
      name: "Welcome Back - 20% Off",
      type: "returning_customer",
      conditions: {
        min_days_since_last_visit: 30,
        max_usage_per_user: 1
      },
      discount: {
        type: "percentage",
        value: 20,
        max_amount: 50000  // VND
      },
      valid_from: "2025-11-01",
      valid_until: "2025-12-31",
      active: true
    },
    {
      id: "uuid",
      name: "Birthday Special",
      type: "birthday",
      conditions: {
        days_before_birthday: 7,
        days_after_birthday: 7
      },
      reward: {
        type: "free_item",
        items: ["dessert_any"]
      }
    }
  ]
}
```

**Customer View:**
```javascript
// In menu, show loyalty status
{
  current_points: 450,
  points_to_next_reward: 50,
  current_tier: "Silver",
  available_rewards: [
    { name: "Free Coffee", cost: 500, available: false },
    { name: "10% Off", cost: 1000, available: false }
  ],
  active_promotions: [
    {
      title: "Welcome Back!",
      description: "20% off your order today",
      code: "WB20",
      expires: "2025-11-30"
    }
  ]
}
```

---

### **Feature 4: Multiple Menu Types (Time-Based)**

**Restaurant Settings:**
```javascript
{
  restaurant_id: "uuid",
  menu_schedules: [
    {
      id: "uuid",
      name: "Breakfast",
      active_days: [1, 2, 3, 4, 5],  // Mon-Fri
      start_time: "06:00",
      end_time: "11:00",
      menu_items: ["item_id_1", "item_id_2"],  // Subset of items
      menu_section_override: {
        "section_1": { display_order: 1, visible: true }
      }
    },
    {
      id: "uuid",
      name: "Lunch",
      active_days: [1, 2, 3, 4, 5, 6, 7],
      start_time: "11:00",
      end_time: "15:00",
      menu_items: ["item_id_3", "item_id_4"]
    },
    {
      id: "uuid",
      name: "Dinner",
      active_days: [1, 2, 3, 4, 5, 6, 7],
      start_time: "17:00",
      end_time: "22:00",
      menu_items: ["item_id_5", "item_id_6"],
      special_pricing: {
        "item_id_5": 120000  // Override price for dinner
      }
    },
    {
      id: "uuid",
      name: "Late Night",
      active_days: [5, 6],  // Fri-Sat only
      start_time: "22:00",
      end_time: "02:00",
      menu_items: ["item_id_7", "item_id_8"]
    }
  ]
}
```

**Dynamic Menu Display:**
```javascript
// When customer scans QR
const currentTime = new Date();
const currentDay = currentTime.getDay();
const currentHour = currentTime.getHours();

// Find active menu
const activeMenu = restaurant.menu_schedules.find(schedule => {
  return schedule.active_days.includes(currentDay) &&
         isTimeBetween(currentHour, schedule.start_time, schedule.end_time);
});

// Show only items from active menu
const visibleItems = menuItems.filter(item =>
  activeMenu.menu_items.includes(item.id)
);
```

---

### **Feature 5: PWA Offline + Cohort Analytics**

**PWA Benefits:**
- Install to home screen
- Offline menu access (30 days cache)
- Push notifications (promotions, loyalty rewards)
- Faster load times

**Offline Strategy:**
```javascript
// Service Worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/menu/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open('menu-cache-v1').then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
  }
});

// Cache invalidation after 30 days
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;
```

**Cohort Analytics (with User Accounts!):**
```javascript
{
  cohort_analysis: {
    cohort_definition: "First visit week",
    cohorts: [
      {
        cohort_name: "Week of 2025-10-01",
        initial_users: 150,

        // Retention by week
        retention: {
          week_0: 100%,   // 150 users
          week_1: 35%,    // 53 users returned
          week_2: 22%,    // 33 users returned
          week_3: 15%,    // 23 users returned
          week_4: 12%     // 18 users returned
        },

        // Revenue per cohort
        revenue: {
          week_0: 2250000,  // VND
          week_1: 850000,
          week_2: 550000,
          cumulative: 3650000
        },

        // LTV (Lifetime Value)
        avg_ltv_per_user: 24333  // VND
      }
    ],

    insights: [
      "Users who save preferences have 2.8x better retention",
      "Loyalty program members spend 45% more per visit",
      "Birthday promotion drives 18% visit increase"
    ]
  }
}
```

---

## DATABASE SCHEMA ADDITIONS

```sql
-- ============================================
-- END-USER ACCOUNTS
-- ============================================

CREATE TABLE customer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  name VARCHAR(100),
  date_of_birth DATE,
  profile_photo_url TEXT,

  -- Auth
  password_hash VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  facebook_id VARCHAR(255) UNIQUE,

  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,

  CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- ============================================
-- CUSTOMER PREFERENCES
-- ============================================

CREATE TABLE customer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_accounts(id) ON DELETE CASCADE UNIQUE,

  -- Dietary preferences (from Module 12)
  allergens_to_avoid TEXT[] DEFAULT ARRAY[]::TEXT[],
  dietary_flags TEXT[] DEFAULT ARRAY[]::TEXT[],
  intolerances TEXT[] DEFAULT ARRAY[]::TEXT[],
  spice_preference VARCHAR(20) DEFAULT 'medium',

  -- Additional preferences
  favorite_cuisines TEXT[] DEFAULT ARRAY[]::TEXT[],
  disliked_ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
  calorie_goal VARCHAR(20),  -- 'low', 'medium', 'high', '1500-2000'
  budget_range VARCHAR(20),  -- 'low', 'medium', 'high'

  -- UI preferences
  preferred_language VARCHAR(2) DEFAULT 'en',
  preferred_currency VARCHAR(3) DEFAULT 'VND',
  dark_mode BOOLEAN DEFAULT false,

  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CUSTOMER BEHAVIOR TRACKING
-- ============================================

CREATE TABLE customer_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_accounts(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL,
  qr_scan_id UUID REFERENCES qr_scans(id),

  -- Visit details
  visited_at TIMESTAMP DEFAULT NOW(),
  duration_seconds INTEGER,
  items_viewed UUID[],

  -- Optional: If ordering integrated
  order_id UUID,
  order_total_vnd INTEGER,

  -- Analytics
  device_type VARCHAR(20),
  is_repeat_customer BOOLEAN DEFAULT false,
  days_since_last_visit INTEGER
);

CREATE TABLE customer_item_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_accounts(id) ON DELETE CASCADE,
  item_id UUID REFERENCES shared_menu_items(id),
  restaurant_id UUID NOT NULL,

  interaction_type VARCHAR(20) NOT NULL,  -- 'view', 'favorite', 'order'
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- LOYALTY SYSTEM
-- ============================================

CREATE TABLE restaurant_loyalty_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID UNIQUE NOT NULL,

  enabled BOOLEAN DEFAULT false,
  program_type VARCHAR(20) DEFAULT 'points',  -- 'points', 'visits', 'spend'

  -- Points-based config
  points_per_vnd DECIMAL(10, 2),
  redemption_rate INTEGER,  -- points needed for 1,000 VND

  -- Visit-based config
  visits_required INTEGER,
  visit_reward_type VARCHAR(20),  -- 'free_item', 'discount'
  visit_reward_value TEXT,

  -- Tier system
  tiers JSONB,  -- [{ name, min_spend, perks }]

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE customer_loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_accounts(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL,

  total_points INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  total_spend_vnd INTEGER DEFAULT 0,
  current_tier VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(customer_id, restaurant_id)
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_loyalty_id UUID REFERENCES customer_loyalty_points(id) ON DELETE CASCADE,

  transaction_type VARCHAR(20) NOT NULL,  -- 'earn', 'redeem', 'expire'
  points_change INTEGER NOT NULL,
  spend_vnd INTEGER,

  description TEXT,
  order_id UUID,

  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- PROMOTIONS & REWARDS
-- ============================================

CREATE TABLE restaurant_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  promotion_type VARCHAR(50) NOT NULL,  -- 'returning_customer', 'birthday', 'first_visit', 'referral'

  -- Conditions
  conditions JSONB,  -- { min_days_since_last_visit, max_usage_per_user, etc }

  -- Reward
  reward_type VARCHAR(20) NOT NULL,  -- 'percentage', 'fixed_amount', 'free_item', 'points'
  reward_value JSONB,

  -- Validity
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE promotion_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID REFERENCES restaurant_promotions(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customer_accounts(id) ON DELETE CASCADE,

  redeemed_at TIMESTAMP DEFAULT NOW(),
  order_id UUID,
  discount_amount_vnd INTEGER
);

-- ============================================
-- TIME-BASED MENUS
-- ============================================

CREATE TABLE menu_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,

  name VARCHAR(100) NOT NULL,  -- 'Breakfast', 'Lunch', 'Dinner', 'Late Night'
  active_days INTEGER[],  -- [1,2,3,4,5] = Mon-Fri
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Optional: Season/date range
  valid_from DATE,
  valid_until DATE,

  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE menu_schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES menu_schedules(id) ON DELETE CASCADE,
  restaurant_item_id UUID NOT NULL,  -- References restaurant_menu_items

  -- Optional: Override price for this schedule
  schedule_price_vnd INTEGER,

  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,

  UNIQUE(schedule_id, restaurant_item_id)
);

-- ============================================
-- CUSTOMER FAVORITES
-- ============================================

CREATE TABLE customer_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_accounts(id) ON DELETE CASCADE,

  favorite_type VARCHAR(20) NOT NULL,  -- 'restaurant', 'item'
  restaurant_id UUID,
  item_id UUID REFERENCES shared_menu_items(id),

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(customer_id, favorite_type, restaurant_id, item_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_customer_accounts_email ON customer_accounts(email);
CREATE INDEX idx_customer_accounts_phone ON customer_accounts(phone);
CREATE INDEX idx_customer_accounts_created_at ON customer_accounts(created_at);

CREATE INDEX idx_customer_preferences_customer ON customer_preferences(customer_id);
CREATE INDEX idx_customer_preferences_allergens ON customer_preferences USING GIN(allergens_to_avoid);
CREATE INDEX idx_customer_preferences_dietary ON customer_preferences USING GIN(dietary_flags);

CREATE INDEX idx_customer_visits_customer ON customer_visits(customer_id);
CREATE INDEX idx_customer_visits_restaurant ON customer_visits(restaurant_id);
CREATE INDEX idx_customer_visits_date ON customer_visits(visited_at);

CREATE INDEX idx_customer_loyalty_customer_restaurant ON customer_loyalty_points(customer_id, restaurant_id);
CREATE INDEX idx_loyalty_transactions_customer_loyalty ON loyalty_transactions(customer_loyalty_id);

CREATE INDEX idx_promotions_restaurant ON restaurant_promotions(restaurant_id);
CREATE INDEX idx_promotions_active ON restaurant_promotions(is_active, valid_from, valid_until);
CREATE INDEX idx_promotion_redemptions_customer ON promotion_redemptions(customer_id);

CREATE INDEX idx_menu_schedules_restaurant ON menu_schedules(restaurant_id);
CREATE INDEX idx_menu_schedule_items_schedule ON menu_schedule_items(schedule_id);

CREATE INDEX idx_customer_favorites_customer ON customer_favorites(customer_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_customer_accounts_updated_at BEFORE UPDATE ON customer_accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_preferences_updated_at BEFORE UPDATE ON customer_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_config_updated_at BEFORE UPDATE ON restaurant_loyalty_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## BUSINESS IMPACT ANALYSIS

### **Customer Retention (Cohort Data)**

**Without User Accounts:**
- Week 0: 100% (first visit)
- Week 4: 8-12% (industry avg for casual dining)

**With User Accounts + Loyalty:**
- Week 0: 100%
- Week 4: 25-35% (projected based on loyalty app benchmarks)

**Revenue Impact:**
```
Scenario: Restaurant with 500 first-time visitors/month

WITHOUT platform:
- Retention week 4: 10% = 50 repeat customers
- Avg spend: 100,000 VND
- Monthly repeat revenue: 5,000,000 VND

WITH platform:
- Retention week 4: 30% = 150 repeat customers
- Avg spend: 120,000 VND (loyalty members spend more)
- Monthly repeat revenue: 18,000,000 VND

INCREASE: +13,000,000 VND/month = +156M VND/year ($6,500)
```

### **Customer Lifetime Value (LTV)**

**Without Accounts:**
```
Avg visits: 1.5
Avg spend per visit: 100,000 VND
LTV = 150,000 VND ($6.25)
```

**With Accounts + Loyalty:**
```
Avg visits: 4.2 (first year)
Avg spend per visit: 120,000 VND
LTV = 504,000 VND ($21)

LTV INCREASE: +236% 🚀
```

### **Marketing Channel Value**

**Email/SMS Database:**
- 1,000 customers with accounts = 1,000 reachable customers
- Promo campaign conversion: 15-25%
- Value: $5-10 per email contact (industry standard)
- **Total value: $5,000-10,000 in marketing assets**

---

## COMPETITIVE ANALYSIS

### **vs. Toast (USA POS + Loyalty)**
- ✅ They have: POS integration, loyalty, marketing
- ❌ Expensive: $69-165/mo + hardware
- 🎯 **Your advantage:** QR-first, no hardware, $29/mo, health filters

### **vs. SevenRooms (Reservation + CRM)**
- ✅ They have: Customer profiles, automated marketing
- ❌ Complex, expensive ($200-500/mo)
- 🎯 **Your advantage:** Simpler, cheaper, better for casual dining

### **vs. Olo (Online Ordering)**
- ✅ They have: Ordering, loyalty
- ❌ Commission-based pricing (10-20% per order)
- 🎯 **Your advantage:** Flat fee, no commission

**NONE of them have:**
- Health filter personalization (51 filters!)
- Cross-restaurant customer profiles
- Vietnam market focus

---

## PRICING STRATEGY

```
QR MENU BASIC ($29/mo):
- Digital menu with QR codes
- 4 languages, health filters
- Basic analytics
- Time-based menus

QR MENU PRO ($79/mo):
- Everything in Basic
- Customer accounts + preferences
- Loyalty program (points OR visits)
- 3 promotions active
- Email marketing (500/mo)
- Advanced analytics

QR MENU ENTERPRISE ($199/mo):
- Everything in Pro
- Unlimited promotions
- Tiered loyalty system
- Email/SMS unlimited
- API access
- White-label
- Multi-location support
```

**Upsell Path:**
```
Restaurant starts: Basic ($29) → See customer value
After 2 months: Upgrade to Pro ($79) → Enable loyalty
After 6 months: Upgrade to Enterprise ($199) → Multiple locations
```

---

## IMPLEMENTATION ROADMAP

### **Phase 1: Foundation (Week 1-4, 60h)**

**Week 1: Customer Accounts (20h)**
- ✅ Sign up / Login (email + social auth)
- ✅ Email verification
- ✅ Password reset
- ✅ Profile management
- ✅ Database schema + migrations

**Week 2: Preference System (15h)**
- ✅ Preference selection UI
- ✅ Save preferences
- ✅ Auto-filter menu based on preferences
- ✅ Preference analytics tracking

**Week 3: Customer Dashboard (15h)**
- ✅ My Profile page
- ✅ Visit history
- ✅ Favorite restaurants
- ✅ Favorite items
- ✅ Preferences editor

**Week 4: Analytics Integration (10h)**
- ✅ Customer visit tracking
- ✅ Item interaction tracking
- ✅ Cohort analysis queries
- ✅ Dashboard for restaurant owners

### **Phase 2: Loyalty System (Week 5-7, 50h)**

**Week 5: Loyalty Backend (20h)**
- ✅ Restaurant loyalty config
- ✅ Points earning system
- ✅ Points redemption
- ✅ Visit tracking
- ✅ Tier calculation

**Week 6: Loyalty Frontend (Customer) (15h)**
- ✅ Points balance display in menu
- ✅ Rewards catalog
- ✅ Redemption flow
- ✅ Progress indicators

**Week 7: Loyalty Backoffice (Restaurant) (15h)**
- ✅ Configure loyalty program
- ✅ View customer loyalty stats
- ✅ Manual point adjustments
- ✅ Loyalty analytics

### **Phase 3: Promotions (Week 8-9, 30h)**

**Week 8: Promotion Engine (15h)**
- ✅ Create promotions (returning customer, birthday, etc.)
- ✅ Promotion eligibility check
- ✅ Auto-apply promotions
- ✅ Redemption tracking

**Week 9: Promotion Management (15h)**
- ✅ Backoffice: Create/edit promotions
- ✅ Frontend: Show available promotions
- ✅ Promo code system
- ✅ Promotion analytics

### **Phase 4: Time-Based Menus (Week 10-11, 25h)**

**Week 10: Menu Scheduling (15h)**
- ✅ Create menu schedules
- ✅ Assign items to schedules
- ✅ Time-based menu display logic
- ✅ Schedule conflict detection

**Week 11: Schedule Management UI (10h)**
- ✅ Backoffice: Manage schedules
- ✅ Frontend: Show active menu
- ✅ Schedule preview
- ✅ Analytics by time period

### **Phase 5: PWA Enhancement (Week 12-13, 35h)**

**Week 12: PWA Features (20h)**
- ✅ Service worker implementation
- ✅ Offline menu caching (30 days)
- ✅ Install to home screen
- ✅ Push notification setup

**Week 13: Push Notifications (15h)**
- ✅ Notification permissions
- ✅ Send promotions via push
- ✅ Loyalty reward notifications
- ✅ Restaurant owner notification dashboard

### **Phase 6: Advanced Features (Week 14-16, 40h)**

**Week 14: Recommendations Engine (15h)**
- ✅ ML-based item recommendations
- ✅ "Similar users liked..." feature
- ✅ Personalized menu sorting

**Week 15: Marketing Automation (15h)**
- ✅ Email campaigns
- ✅ SMS campaigns (Twilio)
- ✅ Automated birthday emails
- ✅ Re-engagement campaigns

**Week 16: Cross-Product Analytics (10h)**
- ✅ Unified customer journey view
- ✅ Correlation insights
- ✅ LTV prediction
- ✅ Churn prediction

---

## TOTAL TIMELINE

**6 phases = 16 weeks = 4 months**

**Total effort: 240 hours**

**Deliverables:**
- Customer accounts + preferences
- Loyalty system (points/visits/tiers)
- Promotion engine
- Time-based menus
- PWA with offline + push
- Recommendation engine
- Marketing automation
- Advanced analytics

---

## SUCCESS METRICS

**Customer Adoption:**
- 30% of diners create account (first 3 months)
- 60% of account holders set preferences

**Retention:**
- 4-week retention: 25%+ (vs 10% baseline)
- Loyalty members: 40%+ retention

**Revenue:**
- Restaurant ARPU: $79 (vs $29 basic)
- Customer LTV: +236%
- Loyalty program ROI: 3-5x

**Engagement:**
- Push notification open rate: 15-25%
- Promotion redemption rate: 20-30%
- Email open rate: 25-35%

---

## RISKS & MITIGATION

**Risk 1: Users don't create accounts**
- **Mitigation:**
  - Incentivize with "10% off first order"
  - Social login (Google, Facebook) for friction-free signup
  - Show clear value: "Never select filters again"

**Risk 2: Restaurants don't enable loyalty**
- **Mitigation:**
  - Pre-configured templates (easy setup)
  - Show ROI data: "Loyalty members visit 2.5x more"
  - Free tier with basic loyalty

**Risk 3: Privacy concerns**
- **Mitigation:**
  - GDPR/PDPA compliant
  - Clear privacy policy
  - Data deletion on request
  - Anonymous mode option

**Risk 4: Complexity**
- **Mitigation:**
  - Phased rollout (accounts → loyalty → promotions)
  - Optional features (restaurants can disable)
  - Excellent onboarding

---

## NEXT STEPS

1. **Review & approve** this roadmap
2. **Prioritize phases** (what to build first?)
3. **Create detailed specs** for Phase 1
4. **Start development** on customer accounts

**Questions to answer:**
- Start with Phase 1 (Customer Accounts)?
- Or prioritize Loyalty System first?
- Should we build MVP (Phases 1-2) then test?

---

**END OF DOCUMENT**
