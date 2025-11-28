/**
 * Sitemap.xml Generator for SEO
 * Auto-generates sitemaps for all vertical templates
 * Supports multi-language, dynamic pages, and priority/frequency settings
 */

/**
 * Generate XML sitemap for a business
 * @param {Object} config - Sitemap configuration
 * @returns {string} XML sitemap string
 */
export function generateSitemap(config) {
  const {
    baseUrl,
    pages = [],
    languages = ['vi', 'en', 'ko', 'zh'],
    defaultLanguage = 'vi',
    lastmod = new Date().toISOString().split('T')[0]
  } = config;

  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
  const urlsetClose = '</urlset>';

  const urls = pages.map(page => generateUrlEntry(page, baseUrl, languages, defaultLanguage, lastmod));

  return `${xmlHeader}\n${urlsetOpen}\n${urls.join('\n')}\n${urlsetClose}`;
}

/**
 * Generate a single URL entry with language alternates
 * @param {Object} page - Page configuration
 * @param {string} baseUrl - Base URL
 * @param {Array} languages - Supported languages
 * @param {string} defaultLanguage - Default language
 * @param {string} lastmod - Last modification date
 * @returns {string} XML URL entry
 */
function generateUrlEntry(page, baseUrl, languages, defaultLanguage, lastmod) {
  const {
    path,
    priority = 0.7,
    changefreq = 'weekly',
    lastModified,
    excludeFromSitemap = false
  } = page;

  if (excludeFromSitemap) {
    return '';
  }

  const cleanPath = path.replace(/^\//, ''); // Remove leading slash
  const loc = `${baseUrl}/${cleanPath}`;
  const modDate = lastModified || lastmod;

  // Generate language alternates (hreflang)
  const alternates = languages.map(lang => {
    const langPath = lang === defaultLanguage ? cleanPath : `${cleanPath}?lang=${lang}`;
    return `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${langPath}" />`;
  }).join('\n');

  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
  </url>`;
}

/**
 * Generate sitemap for Rentals vertical
 * @param {Object} business - Business data
 * @param {Array} fleet - Fleet items
 * @param {Array} locations - Business locations
 * @returns {string} XML sitemap
 */
export function generateRentalsSitemap(business, fleet, locations) {
  const baseUrl = business.url;

  const pages = [
    // Homepage (highest priority)
    {
      path: '',
      priority: 1.0,
      changefreq: 'daily'
    },

    // Fleet page
    {
      path: 'fleet',
      priority: 0.9,
      changefreq: 'daily'
    },

    // Individual fleet items
    ...fleet.map(item => ({
      path: `fleet/${item.slug || item.id}`,
      priority: 0.8,
      changefreq: 'weekly',
      lastModified: item.updatedAt
    })),

    // Locations (if multi-venue)
    ...locations.map(location => ({
      path: `locations/${location.slug || location.id}`,
      priority: 0.7,
      changefreq: 'monthly'
    })),

    // Static pages
    {
      path: 'about',
      priority: 0.6,
      changefreq: 'monthly'
    },
    {
      path: 'contact',
      priority: 0.7,
      changefreq: 'monthly'
    },
    {
      path: 'terms',
      priority: 0.3,
      changefreq: 'yearly'
    },
    {
      path: 'privacy',
      priority: 0.3,
      changefreq: 'yearly'
    }
  ];

  return generateSitemap({
    baseUrl,
    pages,
    languages: business.languages || ['vi', 'en', 'ko', 'zh'],
    defaultLanguage: business.defaultLanguage || 'vi'
  });
}

/**
 * Generate sitemap for Wellness/Spa vertical
 * @param {Object} business - Business data
 * @param {Array} services - Service offerings
 * @param {Array} staff - Staff members
 * @param {Array} locations - Business locations
 * @returns {string} XML sitemap
 */
export function generateWellnessSitemap(business, services, staff, locations) {
  const baseUrl = business.url;

  const pages = [
    // Homepage
    {
      path: '',
      priority: 1.0,
      changefreq: 'daily'
    },

    // Services page
    {
      path: 'services',
      priority: 0.9,
      changefreq: 'weekly'
    },

    // Individual services
    ...services.map(service => ({
      path: `services/${service.slug || service.id}`,
      priority: 0.8,
      changefreq: 'weekly',
      lastModified: service.updatedAt
    })),

    // Staff page (Our Team)
    {
      path: 'staff',
      priority: 0.8,
      changefreq: 'weekly'
    },

    // Individual staff profiles
    ...staff.map(member => ({
      path: `staff/${member.slug || member.id}`,
      priority: 0.7,
      changefreq: 'monthly',
      lastModified: member.updatedAt
    })),

    // Booking page
    {
      path: 'book',
      priority: 0.9,
      changefreq: 'daily'
    },

    // Locations (if multi-venue)
    ...locations.map(location => ({
      path: `locations/${location.slug || location.id}`,
      priority: 0.7,
      changefreq: 'monthly'
    })),

    // Static pages
    {
      path: 'about',
      priority: 0.6,
      changefreq: 'monthly'
    },
    {
      path: 'contact',
      priority: 0.7,
      changefreq: 'monthly'
    },
    {
      path: 'gallery',
      priority: 0.5,
      changefreq: 'weekly'
    },
    {
      path: 'terms',
      priority: 0.3,
      changefreq: 'yearly'
    },
    {
      path: 'privacy',
      priority: 0.3,
      changefreq: 'yearly'
    }
  ];

  return generateSitemap({
    baseUrl,
    pages,
    languages: business.languages || ['vi', 'en', 'ko', 'zh'],
    defaultLanguage: business.defaultLanguage || 'vi'
  });
}

/**
 * Generate sitemap index for businesses with multiple locations
 * Used when each location has its own subdomain
 * @param {Array} sitemaps - Array of {url, lastmod} for each location sitemap
 * @returns {string} XML sitemap index
 */
export function generateSitemapIndex(sitemaps) {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const indexOpen = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
  const indexClose = '</sitemapindex>';

  const entries = sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${sitemap.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`);

  return `${xmlHeader}\n${indexOpen}\n${entries.join('\n')}\n${indexClose}`;
}

/**
 * Generate slug from string (for URLs)
 * @param {string} text - Text to slugify
 * @returns {string} URL-safe slug
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate sitemap XML
 * @param {string} xml - Sitemap XML string
 * @returns {Object} {valid: boolean, errors: Array}
 */
export function validateSitemap(xml) {
  const errors = [];

  // Check for required XML header
  if (!xml.startsWith('<?xml version="1.0"')) {
    errors.push('Missing XML declaration');
  }

  // Check for urlset tag
  if (!xml.includes('<urlset')) {
    errors.push('Missing <urlset> tag');
  }

  // Check for at least one URL
  if (!xml.includes('<url>')) {
    errors.push('No URLs found in sitemap');
  }

  // Check for proper closing
  if (!xml.includes('</urlset>')) {
    errors.push('Missing </urlset> closing tag');
  }

  // Check URL limit (50,000 URLs per sitemap)
  const urlCount = (xml.match(/<url>/g) || []).length;
  if (urlCount > 50000) {
    errors.push(`Too many URLs (${urlCount}). Maximum is 50,000. Use sitemap index instead.`);
  }

  // Check file size (50MB limit)
  const sizeInMB = new Blob([xml]).size / 1024 / 1024;
  if (sizeInMB > 50) {
    errors.push(`Sitemap too large (${sizeInMB.toFixed(2)}MB). Maximum is 50MB.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      urlCount,
      sizeInMB: sizeInMB.toFixed(2)
    }
  };
}

/**
 * Generate Next.js sitemap route handler
 * @param {Function} getSitemapData - Async function that returns sitemap data
 * @returns {Function} Next.js route handler
 */
export function createSitemapRoute(getSitemapData) {
  return async function GET() {
    try {
      const data = await getSitemapData();
      const sitemap = generateSitemap(data);

      return new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
        },
      });
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return new Response('Error generating sitemap', { status: 500 });
    }
  };
}
