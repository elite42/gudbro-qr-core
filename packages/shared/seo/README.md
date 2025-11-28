# SEO Infrastructure - Complete Package

**Purpose:** Reusable SEO utilities for all vertical templates (Rentals, Wellness, Coffee, etc.)

**Why SEO Matters:** Merchants want one complete website that can be found on Google. This positions Gudbro as "Complete Business Website SaaS" not just "QR Code Tool".

---

## 📦 What's Included

### 1. **schema-org.js** - Structured Data
Generate JSON-LD markup for rich search results:
- LocalBusiness schema (with ratings, hours, address)
- Service schema (for offerings)
- Person schema (for staff members)
- Product schema (for items)
- Breadcrumb schema (for navigation)

**Example:**
```javascript
import { generateLocalBusinessSchema } from '@shared/seo';

const schema = generateLocalBusinessSchema({
  name: 'Da Nang Bike Rentals',
  type: 'LocalBusiness',
  url: 'https://danangbikes.gudbro.com',
  address: {
    street: '123 Bach Dang',
    city: 'Da Nang',
    country: 'VN'
  },
  geo: { lat: 16.054, lng: 108.202 },
  rating: { value: 4.8, count: 127 },
  telephone: '+84905123456'
});

// Returns JSON-LD object ready for <script type="application/ld+json">
```

### 2. **meta-tags.js** - SEO & Social Media Tags
Generate complete meta tags for optimal visibility:
- Title, description, keywords
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Multi-language support (hreflang)
- Local SEO optimization

**Example:**
```javascript
import { generateLocalBusinessMeta } from '@shared/seo';

const meta = generateLocalBusinessMeta({
  name: 'Da Nang Bike Rentals',
  type: 'Bike Rental',
  city: 'Da Nang',
  country: 'Vietnam',
  description: 'Professional bike rentals in Da Nang...',
  url: 'https://danangbikes.gudbro.com',
  image: 'https://danangbikes.gudbro.com/og-image.jpg',
  phone: '+84905123456',
  rating: { value: 4.8, count: 127 }
});

// Returns: {title, description, openGraph, twitter, alternates}
// Use with Next.js metadata API
```

### 3. **sitemap.js** - Dynamic Sitemap Generation
Auto-generate XML sitemaps with multi-language support:
- Dynamic page discovery
- Priority & frequency settings
- Hreflang alternates
- Sitemap index for large sites

**Example:**
```javascript
import { generateRentalsSitemap } from '@shared/seo';

const sitemap = generateRentalsSitemap(
  business,  // {url, languages, defaultLanguage}
  fleet,     // Array of rental items
  locations  // Array of locations
);

// Returns XML sitemap string
// Save to /public/sitemap.xml or serve via API route
```

### 4. **robots.js** - Search Engine Configuration
Generate robots.txt with optimal crawling rules:
- Production vs development configs
- Bot-specific rules (block bad bots)
- Sitemap reference
- Path disallow rules

**Example:**
```javascript
import { generateProductionRobots } from '@shared/seo';

const robots = generateProductionRobots('https://danangbikes.gudbro.com');

// Returns:
// User-agent: *
// Allow: /
// Disallow: /api/
// Disallow: /admin/
// Sitemap: https://danangbikes.gudbro.com/sitemap.xml
```

### 5. **performance.js** - Core Web Vitals Optimization
Performance utilities for better SEO rankings:
- Image optimization (srcset, WebP/AVIF)
- Lazy loading helpers
- Critical CSS extraction
- Preload/prefetch strategies
- Performance budget checker

**Example:**
```javascript
import { generateImageSrcSet, checkPerformanceBudget } from '@shared/seo';

// Responsive images
const { srcset, sizes, src } = generateImageSrcSet(
  '/images/bike.jpg',
  [320, 640, 1024, 1920]
);

// Performance check
const result = checkPerformanceBudget({
  LCP: 2200,  // Largest Contentful Paint
  FID: 80,    // First Input Delay
  CLS: 0.08   // Cumulative Layout Shift
});

console.log(result.passed); // true
console.log(result.score);  // 100
```

---

## 🚀 Usage in Next.js

### Setup Sitemap Route

**File:** `app/sitemap.xml/route.js`

```javascript
import { createSitemapRoute, generateRentalsSitemap } from '@shared/seo';

async function getSitemapData() {
  // Fetch business, fleet, locations from API
  const business = await fetchBusiness();
  const fleet = await fetchFleet();
  const locations = await fetchLocations();

  return generateRentalsSitemap(business, fleet, locations);
}

export const GET = createSitemapRoute(getSitemapData);
```

### Setup Robots.txt Route

**File:** `app/robots.txt/route.js`

```javascript
import { createRobotsRoute } from '@shared/seo';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

export const GET = createRobotsRoute(baseUrl, isProduction);
```

### Add Meta Tags to Page

**File:** `app/page.js`

```javascript
import { generateLocalBusinessMeta } from '@shared/seo';

export async function generateMetadata() {
  const business = await fetchBusiness();

  return generateLocalBusinessMeta({
    name: business.name,
    type: business.type,
    city: business.city,
    country: business.country,
    url: business.url,
    description: business.description,
    image: business.image,
    phone: business.phone,
    rating: business.rating
  });
}

export default function Page() {
  return <main>...</main>;
}
```

### Add Schema.org to Layout

**File:** `app/layout.js`

```javascript
import { generateLocalBusinessSchema, schemaToScriptTag } from '@shared/seo';

export default function Layout({ children }) {
  const business = { /* business data */ };
  const schema = generateLocalBusinessSchema(business);

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 📊 SEO Checklist for Each Vertical

When implementing a new vertical (Wellness, Coffee, etc.), ensure:

### ✅ Required (Must Have)
- [ ] Generate LocalBusiness schema with accurate data
- [ ] Add meta tags (title, description, OG, Twitter)
- [ ] Create sitemap.xml with all pages
- [ ] Configure robots.txt (production only)
- [ ] Optimize images (WebP/AVIF, lazy loading)
- [ ] Add structured data for services/products
- [ ] Multi-language support (hreflang)
- [ ] Mobile responsive (viewport meta tag)

### 🎯 Recommended (Should Have)
- [ ] Add breadcrumb schema
- [ ] Preload critical resources (fonts, hero image)
- [ ] Generate rich snippets (ratings, price)
- [ ] Optimize Core Web Vitals (LCP < 2.5s, CLS < 0.1)
- [ ] Add canonical URLs
- [ ] Implement performance budget checks
- [ ] Add alt text to all images

### 🚀 Advanced (Nice to Have)
- [ ] Critical CSS extraction
- [ ] Image placeholders (LQIP)
- [ ] DNS prefetch for external domains
- [ ] Service Worker for offline support
- [ ] FAQ schema for common questions
- [ ] Video schema (if applicable)
- [ ] Review schema with rich snippets

---

## 🎯 Expected SEO Results

### Google Search Console Metrics (After 3 months)

**Target:**
- Impressions: 10,000+ per month
- Clicks: 500+ per month
- Average position: Top 10 for local searches
- CTR: 5%+

**Key Search Queries:**
- "bike rental da nang"
- "da nang motorcycle rental"
- "rent bicycle da nang"
- "best bike rental da nang"

### Lighthouse SEO Score

**Target:** 100/100

**Checklist:**
- ✅ Document has a meta description
- ✅ Page has successful HTTP status code
- ✅ Links have descriptive text
- ✅ Document has a valid hreflang
- ✅ Document uses legible font sizes
- ✅ Tap targets are sized appropriately
- ✅ robots.txt is valid

### Core Web Vitals

**Target (Mobile):**
- LCP (Largest Contentful Paint): < 2.5s ⚡
- FID (First Input Delay): < 100ms ⚡
- CLS (Cumulative Layout Shift): < 0.1 ⚡

---

## 🔧 Testing

### Local Testing

```bash
# 1. Start development server
npm run dev

# 2. Test sitemap
curl http://localhost:3000/sitemap.xml

# 3. Test robots.txt
curl http://localhost:3000/robots.txt

# 4. Test meta tags (view source)
curl http://localhost:3000 | grep '<meta'

# 5. Test structured data
curl http://localhost:3000 | grep 'application/ld+json'
```

### Production Testing

**Google Tools:**
1. [Rich Results Test](https://search.google.com/test/rich-results) - Validate structured data
2. [PageSpeed Insights](https://pagespeed.web.dev/) - Check Core Web Vitals
3. [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Mobile optimization
4. [Search Console](https://search.google.com/search-console) - Monitor performance

**Third-Party Tools:**
1. [Screaming Frog](https://www.screamingfrog.co.uk/) - Crawl your site like Google
2. [SEMrush](https://www.semrush.com/) - Keyword research & competitor analysis
3. [Ahrefs](https://ahrefs.com/) - Backlink analysis
4. [Schema Markup Validator](https://validator.schema.org/) - Validate JSON-LD

---

## 📈 Cost Impact on Pricing

**SEO adds minimal infrastructure cost:**
- Schema.org: $0 (JavaScript generation)
- Meta tags: $0 (Server-side rendering)
- Sitemap: $0 (Auto-generated, cached)
- Robots.txt: $0 (Static text file)
- Performance optimization: $0 (Build-time optimization)

**Total SEO cost per site:** $0/month

**Value to merchant:**
- Organic traffic (worth $500-2000/month if buying ads)
- Higher Google ranking vs competitors
- Professional appearance in search results
- Mobile-optimized experience

**Justifies $19/month pricing** ✅

---

## 🚀 Next Steps

1. ✅ SEO infrastructure created (DONE)
2. ⏳ Apply to Rentals module (NEXT)
3. ⏳ Create Wellness module with SEO
4. ⏳ Test with Google Search Console
5. ⏳ Deploy to production
6. ⏳ Monitor organic traffic growth

---

**Created:** 2025-11-06
**Status:** Complete & Ready to Use
**Reusable:** Yes (all verticals)
**Impact:** High (core feature for merchant value)
