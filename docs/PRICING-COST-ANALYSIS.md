# Gudbro - Cost Analysis & Pricing Strategy

**Date:** 2025-11-06
**Purpose:** Calculate actual cost per minisite to determine profitable pricing

---

## 💰 Infrastructure Costs per Minisite

### Backend (Railway - Free Tier → Paid)

**Free Tier (First 100 customers):**
- $5 credit/month per account
- 500 hours compute/month
- Auto-sleep after 5 min inactivity
- **Cost per minisite:** $0 (within free tier)

**Paid Tier (After free tier exhausted):**
- $0.000463/GB-hour for memory
- $0.000231/vCPU-hour for CPU
- Average minisite:
  - 512MB RAM = ~$0.23/month (running 24/7)
  - With auto-sleep (avg 2h/day active): **~$0.02/month**

**Bandwidth:**
- Egress: $0.10/GB
- Average traffic: 1000 visitors/month × 2MB/visit = 2GB
- **Cost:** $0.20/month per minisite

**Railway Total per Minisite:** ~$0.22/month (with auto-sleep optimization)

---

### Frontend (Vercel - Free Tier → Paid)

**Free Tier (Unlimited minisites!):**
- 100GB bandwidth/month (total, not per site)
- Unlimited deployments
- Unlimited team members
- **Cost per minisite:** $0

**If we exceed 100GB total:**
- Pro Plan: $20/month for team
- 1TB bandwidth included
- Supports ~500 minisites (2GB each)
- **Cost per minisite:** $0.04/month (when on paid plan)

**Vercel Total per Minisite:** $0 (free tier) or $0.04/month (paid tier)

---

### Database (PostgreSQL)

**Option A: Railway PostgreSQL (Shared)**
- Included in Railway free tier
- $5 credit covers ~100 minisites
- **Cost per minisite:** $0 (free tier)

**Option B: Railway PostgreSQL (Dedicated - Phase 2)**
- $10/month for shared cluster
- Supports 1000+ minisites
- **Cost per minisite:** $0.01/month

**Option C: Supabase (Current approach - mock data)**
- Free tier: 500MB database, 50,000 monthly active users
- Sufficient for 500+ minisites
- **Cost per minisite:** $0 (free tier)

**Database Total per Minisite:** $0 - $0.01/month

---

### CDN & Image Hosting

**Cloudflare Images:**
- $5/month for 100,000 images
- Average minisite: 20 images
- **Cost per minisite:** $0.001/month ($1 per 1000 sites)

**Alternative: Vercel Image Optimization (Included)**
- Free with Vercel
- Automatic WebP conversion
- **Cost per minisite:** $0

**CDN Total per Minisite:** $0 - $0.001/month

---

### Domain & SSL

**Subdomain (merchant.gudbro.com):**
- SSL included (Let's Encrypt via Vercel/Railway)
- **Cost per minisite:** $0

**Custom Domain (merchant.com - Optional upsell):**
- Domain registration: $12/year = $1/month
- SSL included
- **Cost per minisite:** $0 (subdomain) or $1/month (custom domain)

**Domain Total per Minisite:** $0 (base) or $1/month (custom domain upsell)

---

## 📊 Total Infrastructure Cost per Minisite

### Scenario 1: Free Tier (First 100-500 customers)
```
Backend (Railway):        $0.00
Frontend (Vercel):        $0.00
Database:                 $0.00
CDN/Images:               $0.00
Domain (subdomain):       $0.00
--------------------------------
TOTAL:                    $0.00 / month
```

### Scenario 2: Paid Tier (500-5000 customers)
```
Backend (Railway):        $0.22
Frontend (Vercel):        $0.04
Database (shared):        $0.01
CDN/Images:               $0.00
Domain (subdomain):       $0.00
--------------------------------
TOTAL:                    $0.27 / month
```

### Scenario 3: High-Traffic Site (10,000 visitors/month)
```
Backend (Railway):        $0.50  (more compute)
Frontend (Vercel):        $0.10  (more bandwidth)
Database:                 $0.02
CDN/Images:               $0.01
Domain (subdomain):       $0.00
--------------------------------
TOTAL:                    $0.63 / month
```

---

## 🔧 Operational Costs (Per Month)

### Support & Maintenance
- Customer support: $2000/month (1 person part-time)
- Server monitoring: $0 (Railway/Vercel included)
- Bug fixes/updates: $3000/month (dev time)
- **Total operational:** $5000/month

**Per minisite (at 500 customers):** $10/month
**Per minisite (at 5000 customers):** $1/month

### Development Costs (Amortized)
- Initial development: $20,000 (320 hours × $62.5/hour)
- Amortized over 12 months: $1,667/month
- **Per minisite (at 500 customers):** $3.33/month
- **Per minisite (at 5000 customers):** $0.33/month

---

## 💡 Total Cost per Minisite (All Included)

### At 100 Customers (Free Tier)
```
Infrastructure:           $0.00
Operations:              $50.00  ($5000 ÷ 100)
Development (amortized): $16.67  ($1667 ÷ 100)
--------------------------------
TOTAL COST:              $66.67 / month per customer
```

### At 500 Customers (Paid Tier)
```
Infrastructure:           $0.27
Operations:              $10.00  ($5000 ÷ 500)
Development (amortized):  $3.33  ($1667 ÷ 500)
--------------------------------
TOTAL COST:              $13.60 / month per customer
```

### At 5000 Customers (Scale)
```
Infrastructure:           $0.27
Operations:               $1.00  ($5000 ÷ 5000)
Development (amortized):  $0.33  ($1667 ÷ 5000)
--------------------------------
TOTAL COST:               $1.60 / month per customer
```

---

## 🎯 Pricing Strategy Recommendation

### Competitor Pricing (Vietnam Market)

**Local Web Agencies:**
- Setup: $500 - $2000 USD
- Monthly: $50 - $200 USD
- No multilingua, no SEO, slow delivery

**Wix/Squarespace:**
- $20 - $40/month
- Complex setup, no multilingua included
- Limited Vietnamese support

**No Website (80% of market):**
- Current cost: $0
- Lost revenue: Significant (no online presence)

### Gudbro Pricing Tiers

**Tier 1: Starter (Target: Small businesses)**
- **Price:** $19/month (or 450,000 VND/month)
- **Features:**
  - 1 location
  - Subdomain (merchant.gudbro.com)
  - Multilingua (EN/VN/KR/CN)
  - Multi-currency
  - SEO optimized
  - QR code included
  - Mobile responsive
  - Unlimited updates

**Profit Margin:**
- At 100 customers: **-$47.67/month** (loss leader, build base)
- At 500 customers: **+$5.40/month** (28% margin)
- At 5000 customers: **+$17.40/month** (91% margin)

---

**Tier 2: Professional (Target: Multi-location, high traffic)**
- **Price:** $39/month (or 950,000 VND/month)
- **Features:**
  - 2-5 locations
  - Custom domain (merchant.com)
  - Priority support
  - Advanced analytics
  - Google My Business integration
  - All Starter features

**Profit Margin:**
- At 100 customers: **-$28.67/month** (loss leader)
- At 500 customers: **+$25.40/month** (65% margin)
- At 5000 customers: **+$37.40/month** (96% margin)

---

**Tier 3: Enterprise (Target: Chains, franchises)**
- **Price:** $99/month (or 2,400,000 VND/month)
- **Features:**
  - Unlimited locations
  - White-label (remove Gudbro branding)
  - API access
  - Dedicated account manager
  - Custom integrations
  - All Professional features

**Profit Margin:**
- At 100 customers: **+$31.33/month** (47% margin)
- At 500 customers: **+$85.40/month** (86% margin)
- At 5000 customers: **+$97.40/month** (98% margin)

---

## 📈 Revenue Projections

### Year 1 Target: 500 Customers

**Mix:**
- 400 Starter ($19/month) = $7,600/month
- 80 Professional ($39/month) = $3,120/month
- 20 Enterprise ($99/month) = $1,980/month

**Total MRR:** $12,700/month
**Total ARR:** $152,400/year

**Costs:**
- Infrastructure: $0.27 × 500 = $135/month
- Operations: $5,000/month
- Development: $1,667/month (amortized)

**Total Cost:** $6,802/month

**Net Profit:** $5,898/month ($70,776/year)
**Profit Margin:** 46%

---

### Year 2 Target: 5000 Customers

**Mix:**
- 4000 Starter ($19/month) = $76,000/month
- 800 Professional ($39/month) = $31,200/month
- 200 Enterprise ($99/month) = $19,800/month

**Total MRR:** $127,000/month
**Total ARR:** $1,524,000/year

**Costs:**
- Infrastructure: $0.27 × 5000 = $1,350/month
- Operations: $15,000/month (3 support staff)
- Development: $5,000/month (ongoing)

**Total Cost:** $21,350/month

**Net Profit:** $105,650/month ($1,267,800/year)
**Profit Margin:** 83%

---

## 🎯 Market Entry Strategy

### Vietnam Pricing (More Competitive)

**Convert USD → VND:**
- Starter: $19 → **199,000 VND/month** (psychological pricing)
- Professional: $39 → **399,000 VND/month**
- Enterprise: $99 → **999,000 VND/month**

**Why this works:**
- Coffee in Vietnam: 30,000 - 50,000 VND
- 199k VND = 4-6 coffees
- Competitor websites: 10,000,000+ VND setup
- **Value perception: 50x cheaper than agency**

### Promotional Launch Pricing

**First 100 Customers (Pilot Program):**
- 3 months FREE
- Then 50% off for 6 months
- Effective price: **99,500 VND/month** (first year average)

**Goal:** Build case studies, testimonials, lock in early adopters

---

## 💰 Break-Even Analysis

**Fixed Costs:** $5,000/month (operations) + $1,667/month (dev) = $6,667/month

**Break-even at Starter tier ($19/month):**
- Need: $6,667 ÷ ($19 - $0.27) = **356 customers**

**Break-even timeline:**
- Month 1: 10 customers (pilot)
- Month 2: 30 customers
- Month 3: 80 customers
- Month 4: 150 customers
- Month 5: 250 customers
- **Month 6: 356 customers (BREAK-EVEN!)**

---

## 🚀 Recommendation

### Immediate Action: Launch with Tier 1 @ $19/month

**Why:**
1. ✅ 28% margin at 500 customers (sustainable)
2. ✅ 91% margin at scale (5000 customers)
3. ✅ 10x cheaper than agencies ($19 vs $500+ setup)
4. ✅ 2x cheaper than Wix ($19 vs $40/month with multilingua)
5. ✅ Break-even at 356 customers (achievable in 6 months)

### Vietnam Launch Price: **199,000 VND/month**

**Positioning:**
> "Complete professional website with multilingua, SEO, and QR code - cheaper than hiring a developer for 1 hour"

**Pilot Offer:**
> "First 100 customers: 3 months FREE + 50% off next 6 months"

---

## 📊 Cost Optimization Strategies

### Immediate (Month 1-6):
- ✅ Use free tiers (Railway + Vercel)
- ✅ Auto-sleep backends (reduce compute)
- ✅ Optimize images (reduce bandwidth)
- ✅ Mock data initially (delay database)

### Medium-term (Month 6-12):
- Move to shared PostgreSQL cluster
- Implement CDN caching
- Batch API calls
- Compress assets

### Long-term (Year 2+):
- Negotiate volume discounts with Railway/Vercel
- Self-hosted database (reduce cost to $0.01/customer)
- Build custom CDN (Cloudflare Workers)
- **Target: $0.10/customer/month infrastructure cost**

---

**Created:** 2025-11-06
**Status:** Ready for Market Entry
**Recommended Launch Price:** $19/month (199,000 VND/month)
**Break-Even:** 356 customers (~6 months)
**Year 1 Target Profit:** $70,776 (46% margin)
