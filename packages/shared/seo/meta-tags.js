/**
 * Meta Tags Generator for SEO & Social Media
 * Generates complete meta tags for optimal Google, Facebook, Twitter visibility
 */

/**
 * Generate complete meta tags for a page
 * @param {Object} page - Page metadata
 * @returns {Object} Meta tags object for Next.js metadata API
 */
export function generateMetaTags(page) {
  const {
    title,
    description,
    keywords,
    canonical,
    image,
    imageAlt,
    locale = 'vi_VN',
    alternateLocales = ['en_US', 'ko_KR', 'zh_CN'],
    type = 'website',
    siteName = 'Gudbro',
    author,
    publishedTime,
    modifiedTime,
    noindex = false,
    nofollow = false
  } = page;

  // Base meta tags
  const meta = {
    title,
    description,
    keywords: keywords ? keywords.join(', ') : undefined,

    // Robots
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Open Graph (Facebook, LinkedIn, etc.)
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale,
      alternateLocale: alternateLocales,
      type,
      ...(image && {
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: imageAlt || title,
          },
        ],
      }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && {
        images: [image],
      }),
      creator: author,
      site: '@gudbro',
    },

    // Alternate languages (hreflang)
    ...(alternateLocales.length > 0 && {
      alternates: {
        canonical,
        languages: alternateLocales.reduce((acc, loc) => {
          const langCode = loc.split('_')[0]; // vi_VN → vi
          acc[langCode] = `${canonical}?lang=${langCode}`;
          return acc;
        }, {}),
      },
    }),

    // Verification tags (add when needed)
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    },
  };

  return meta;
}

/**
 * Generate meta tags specifically for Local Business pages
 * @param {Object} business - Business data
 * @returns {Object} Meta tags optimized for local SEO
 */
export function generateLocalBusinessMeta(business) {
  const {
    name,
    description,
    type, // e.g., "Spa", "Massage", "Bike Rental"
    city,
    country = 'Vietnam',
    address,
    phone,
    image,
    url,
    rating,
    priceRange
  } = business;

  // Generate optimized title for local SEO
  const title = `${name} - ${type} in ${city}, ${country}`;

  // Generate rich description
  const desc = description ||
    `${name} offers professional ${type.toLowerCase()} services in ${city}. ` +
    `Located at ${address?.street || city}. ` +
    `${rating ? `Rated ${rating.value}/5 by ${rating.count} customers. ` : ''}` +
    `${priceRange ? `Price range: ${priceRange}. ` : ''}` +
    `Book online or call ${phone}.`;

  // Local SEO keywords
  const keywords = [
    type.toLowerCase(),
    `${type.toLowerCase()} ${city.toLowerCase()}`,
    `best ${type.toLowerCase()} ${city.toLowerCase()}`,
    name.toLowerCase(),
    `${type.toLowerCase()} near me`,
    `${type.toLowerCase()} ${country.toLowerCase()}`,
    address?.neighborhood?.toLowerCase(),
  ].filter(Boolean);

  return generateMetaTags({
    title,
    description: desc,
    keywords,
    canonical: url,
    image,
    imageAlt: `${name} - ${type} in ${city}`,
    type: 'website', // Next.js 14 only supports standard OG types (website, article, etc.)
  });
}

/**
 * Generate meta tags for Service/Product pages
 * @param {Object} item - Service or product data
 * @param {Object} business - Parent business
 * @returns {Object} Meta tags for service/product
 */
export function generateServiceMeta(item, business) {
  const {
    name,
    description,
    category,
    price,
    currency = 'VND',
    duration,
    image,
    rating
  } = item;

  const title = `${name} - ${business.name} | ${category}`;

  const desc = description ||
    `${name} at ${business.name}. ` +
    `${duration ? `Duration: ${duration} minutes. ` : ''}` +
    `Price: ${price?.toLocaleString()} ${currency}. ` +
    `${rating ? `Rated ${rating.value}/5. ` : ''}` +
    `Book now in ${business.city}.`;

  const keywords = [
    name.toLowerCase(),
    category.toLowerCase(),
    `${category.toLowerCase()} ${business.city.toLowerCase()}`,
    `${name.toLowerCase()} ${business.city.toLowerCase()}`,
    business.name.toLowerCase(),
  ];

  return generateMetaTags({
    title,
    description: desc,
    keywords,
    canonical: `${business.url}/services/${item.slug || item.id}`,
    image: image || business.image,
    imageAlt: `${name} - ${business.name}`,
    type: 'product',
  });
}

/**
 * Generate meta tags for Staff Member pages
 * @param {Object} staff - Staff member data
 * @param {Object} business - Business they work for
 * @returns {Object} Meta tags for staff profile
 */
export function generateStaffMeta(staff, business) {
  const {
    name,
    title,
    bio,
    specialties,
    image,
    languages
  } = staff;

  const pageTitle = `${name} - ${title} at ${business.name}`;

  const desc = bio ||
    `Meet ${name}, ${title} at ${business.name}. ` +
    `${specialties ? `Specializes in: ${specialties.join(', ')}. ` : ''}` +
    `${languages ? `Languages: ${languages.join(', ')}. ` : ''}` +
    `Book an appointment in ${business.city}.`;

  const keywords = [
    name.toLowerCase(),
    `${title.toLowerCase()} ${business.city.toLowerCase()}`,
    business.name.toLowerCase(),
    ...(specialties || []).map(s => s.toLowerCase()),
  ];

  return generateMetaTags({
    title: pageTitle,
    description: desc,
    keywords,
    canonical: `${business.url}/staff/${staff.slug || staff.id}`,
    image: image || business.image,
    imageAlt: `${name} - ${title}`,
    author: name,
  });
}

/**
 * Format price for meta description
 * @param {number} price - Price value
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted price string
 */
export function formatPriceForMeta(price, currency = 'VND', locale = 'vi-VN') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Generate canonical URL with proper trailing slash handling
 * @param {string} baseUrl - Base URL
 * @param {string} path - Path to append
 * @returns {string} Canonical URL
 */
export function generateCanonicalUrl(baseUrl, path = '') {
  const base = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.replace(/^\//, ''); // Remove leading slash
  return cleanPath ? `${base}/${cleanPath}` : base;
}
