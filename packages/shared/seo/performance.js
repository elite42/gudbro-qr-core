/**
 * Performance Optimization Utilities for SEO
 * Image optimization, lazy loading, critical CSS, prefetch strategies
 *
 * Google Core Web Vitals:
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms
 * - CLS (Cumulative Layout Shift): < 0.1
 */

/**
 * Generate optimized image srcset for responsive images
 * @param {string} imageUrl - Base image URL
 * @param {Array} widths - Array of widths to generate (e.g., [320, 640, 1024, 1920])
 * @returns {Object} {srcset, sizes, src}
 */
export function generateImageSrcSet(imageUrl, widths = [320, 640, 1024, 1920]) {
  // Detect if using Vercel Image Optimization or Cloudflare Images
  const isVercel = imageUrl.includes('/_next/image');
  const isCloudflare = imageUrl.includes('imagedelivery.net');

  if (isVercel) {
    // Vercel Image Optimization
    const srcset = widths.map(width =>
      `/_next/image?url=${encodeURIComponent(imageUrl)}&w=${width}&q=75 ${width}w`
    ).join(', ');

    return {
      srcset,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      src: `/_next/image?url=${encodeURIComponent(imageUrl)}&w=1024&q=75`
    };
  } else if (isCloudflare) {
    // Cloudflare Images
    const srcset = widths.map(width =>
      `${imageUrl}/w=${width},q=85 ${width}w`
    ).join(', ');

    return {
      srcset,
      sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
      src: `${imageUrl}/w=1024,q=85`
    };
  } else {
    // Fallback (no optimization)
    return {
      srcset: '',
      sizes: '',
      src: imageUrl
    };
  }
}

/**
 * Generate WebP/AVIF image fallback HTML
 * @param {string} imageUrl - Image URL
 * @param {string} alt - Alt text for accessibility
 * @param {Object} options - Additional options
 * @returns {string} HTML picture element
 */
export function generatePictureElement(imageUrl, alt, options = {}) {
  const {
    width,
    height,
    loading = 'lazy',
    fetchpriority = 'auto',
    className = ''
  } = options;

  const baseUrl = imageUrl.replace(/\.(jpg|jpeg|png)$/i, '');
  const ext = imageUrl.match(/\.(jpg|jpeg|png)$/i)?.[1] || 'jpg';

  return `<picture>
  <source srcset="${baseUrl}.avif" type="image/avif">
  <source srcset="${baseUrl}.webp" type="image/webp">
  <img
    src="${imageUrl}"
    alt="${alt}"
    ${width ? `width="${width}"` : ''}
    ${height ? `height="${height}"` : ''}
    loading="${loading}"
    fetchpriority="${fetchpriority}"
    ${className ? `class="${className}"` : ''}
    decoding="async"
  >
</picture>`;
}

/**
 * Generate preload links for critical resources
 * @param {Array} resources - Array of {href, as, type} objects
 * @returns {string} HTML link tags
 */
export function generatePreloadLinks(resources) {
  return resources.map(resource => {
    const { href, as, type, crossorigin } = resource;

    return `<link rel="preload" href="${href}" as="${as}"${type ? ` type="${type}"` : ''}${crossorigin ? ' crossorigin' : ''}>`;
  }).join('\n');
}

/**
 * Generate prefetch links for next pages (for better navigation)
 * @param {Array} urls - Array of URLs to prefetch
 * @returns {string} HTML link tags
 */
export function generatePrefetchLinks(urls) {
  return urls.map(url =>
    `<link rel="prefetch" href="${url}">`
  ).join('\n');
}

/**
 * Generate DNS prefetch for external domains
 * @param {Array} domains - Array of domains (e.g., ['fonts.googleapis.com'])
 * @returns {string} HTML link tags
 */
export function generateDnsPrefetch(domains) {
  return domains.map(domain =>
    `<link rel="dns-prefetch" href="//${domain}">`
  ).join('\n');
}

/**
 * Extract critical CSS for above-the-fold content
 * This is a simplified version - in production, use tools like critical or critters
 * @param {string} html - HTML content
 * @param {string} css - Full CSS
 * @returns {string} Critical CSS
 */
export function extractCriticalCSS(html, css) {
  // Simplified extraction - just get styles for elements in HTML
  // In production, use proper critical CSS extraction tools

  const selectors = new Set();

  // Extract class names from HTML
  const classMatches = html.matchAll(/class="([^"]*)"/g);
  for (const match of classMatches) {
    const classes = match[1].split(' ');
    classes.forEach(cls => {
      if (cls) selectors.add(`.${cls}`);
    });
  }

  // Extract IDs from HTML
  const idMatches = html.matchAll(/id="([^"]*)"/g);
  for (const match of idMatches) {
    if (match[1]) selectors.add(`#${match[1]}`);
  }

  // Extract tag names
  const tagMatches = html.matchAll(/<(\w+)[\s>]/g);
  for (const match of tagMatches) {
    if (match[1] && !['html', 'head', 'body', 'script', 'link'].includes(match[1])) {
      selectors.add(match[1]);
    }
  }

  // Filter CSS rules that match selectors
  const criticalCSS = [];
  const cssRules = css.split('}').filter(rule => rule.trim());

  for (const rule of cssRules) {
    const selector = rule.split('{')[0]?.trim();
    if (selector && Array.from(selectors).some(sel => rule.includes(sel))) {
      criticalCSS.push(rule + '}');
    }
  }

  return criticalCSS.join('\n');
}

/**
 * Generate font preload links with optimal attributes
 * @param {Array} fonts - Array of {url, format} objects
 * @returns {string} HTML link tags
 */
export function generateFontPreloads(fonts) {
  return fonts.map(font => {
    const { url, format = 'woff2' } = font;
    return `<link rel="preload" href="${url}" as="font" type="font/${format}" crossorigin>`;
  }).join('\n');
}

/**
 * Generate lazy loading intersection observer script
 * @returns {string} JavaScript code for lazy loading images
 */
export function generateLazyLoadScript() {
  return `
<script>
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll('img.lazy').forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
    });
  }
</script>`;
}

/**
 * Generate performance hints meta tags
 * @returns {string} HTML meta tags
 */
export function generatePerformanceHints() {
  return `
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
`.trim();
}

/**
 * Calculate estimated image size based on dimensions
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @param {string} format - Image format (jpeg, png, webp, avif)
 * @returns {Object} {sizeKB, recommendation}
 */
export function estimateImageSize(width, height, format = 'jpeg') {
  const pixels = width * height;

  // Rough estimates (KB)
  const estimates = {
    jpeg: pixels / 1000, // ~1 byte per pixel for JPEG
    png: pixels / 500,   // ~2 bytes per pixel for PNG
    webp: pixels / 1500, // ~0.67 bytes per pixel for WebP
    avif: pixels / 2000  // ~0.5 bytes per pixel for AVIF
  };

  const sizeKB = Math.round(estimates[format] || estimates.jpeg);

  let recommendation = '';
  if (sizeKB > 500) {
    recommendation = 'Image too large! Reduce dimensions or use WebP/AVIF format.';
  } else if (sizeKB > 200) {
    recommendation = 'Consider using WebP or AVIF format for better compression.';
  } else if (sizeKB > 100) {
    recommendation = 'Good size. Consider lazy loading if below the fold.';
  } else {
    recommendation = 'Optimal size for web.';
  }

  return { sizeKB, recommendation };
}

/**
 * Generate Next.js Image component props
 * @param {string} src - Image source
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {Object} options - Additional options
 * @returns {Object} Props for Next.js Image component
 */
export function generateNextImageProps(src, width, height, options = {}) {
  const {
    alt = '',
    priority = false,
    quality = 75,
    placeholder = 'blur',
    blurDataURL,
    sizes
  } = options;

  return {
    src,
    width,
    height,
    alt,
    quality,
    priority,
    placeholder,
    ...(blurDataURL && { blurDataURL }),
    ...(sizes && { sizes }),
    style: { width: '100%', height: 'auto' }
  };
}

/**
 * Generate low-quality image placeholder (LQIP) data URL
 * @param {number} width - Placeholder width
 * @param {number} height - Placeholder height
 * @param {string} color - Dominant color (hex)
 * @returns {string} Data URL for placeholder
 */
export function generateImagePlaceholder(width = 10, height = 10, color = '#cccccc') {
  // Generate tiny SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Performance budget checker
 * @param {Object} metrics - Performance metrics
 * @returns {Object} {passed: boolean, violations: Array}
 */
export function checkPerformanceBudget(metrics) {
  const budget = {
    // Core Web Vitals
    LCP: 2500,        // Largest Contentful Paint (ms)
    FID: 100,         // First Input Delay (ms)
    CLS: 0.1,         // Cumulative Layout Shift (score)

    // Additional metrics
    FCP: 1800,        // First Contentful Paint (ms)
    TTI: 3800,        // Time to Interactive (ms)
    TBT: 300,         // Total Blocking Time (ms)

    // Resource budgets
    totalSize: 1024,  // Total page size (KB)
    imageSize: 512,   // Total image size (KB)
    jsSize: 256,      // Total JavaScript size (KB)
    cssSize: 128,     // Total CSS size (KB)
  };

  const violations = [];

  Object.entries(budget).forEach(([metric, limit]) => {
    if (metrics[metric] !== undefined && metrics[metric] > limit) {
      violations.push({
        metric,
        value: metrics[metric],
        limit,
        percentage: Math.round((metrics[metric] / limit) * 100)
      });
    }
  });

  return {
    passed: violations.length === 0,
    violations,
    score: Math.max(0, 100 - (violations.length * 10))
  };
}

/**
 * Generate Content Security Policy (CSP) header
 * @param {Object} options - CSP options
 * @returns {string} CSP header value
 */
export function generateCSP(options = {}) {
  const {
    allowInlineStyles = false,
    allowInlineScripts = false,
    allowedDomains = []
  } = options;

  const directives = [
    "default-src 'self'",
    `script-src 'self'${allowInlineScripts ? " 'unsafe-inline'" : ''}`,
    `style-src 'self'${allowInlineStyles ? " 'unsafe-inline'" : ''} https://fonts.googleapis.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.gudbro.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ];

  if (allowedDomains.length > 0) {
    allowedDomains.forEach(domain => {
      directives.push(`connect-src 'self' ${domain}`);
    });
  }

  return directives.join('; ');
}
