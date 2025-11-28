/**
 * robots.txt Generator for SEO
 * Configures search engine crawling rules
 */

/**
 * Generate robots.txt content
 * @param {Object} config - Robots.txt configuration
 * @returns {string} robots.txt content
 */
export function generateRobotsTxt(config) {
  const {
    sitemapUrl,
    allowAll = true,
    disallowPaths = [],
    crawlDelay,
    specificBots = {}
  } = config;

  let content = '';

  if (allowAll) {
    // Allow all bots by default
    content += 'User-agent: *\n';
    content += 'Allow: /\n';

    // Disallow specific paths
    if (disallowPaths.length > 0) {
      disallowPaths.forEach(path => {
        content += `Disallow: ${path}\n`;
      });
    }

    // Crawl delay (optional)
    if (crawlDelay) {
      content += `Crawl-delay: ${crawlDelay}\n`;
    }

    content += '\n';
  }

  // Specific bot rules
  Object.entries(specificBots).forEach(([botName, rules]) => {
    content += `User-agent: ${botName}\n`;

    if (rules.allow) {
      rules.allow.forEach(path => {
        content += `Allow: ${path}\n`;
      });
    }

    if (rules.disallow) {
      rules.disallow.forEach(path => {
        content += `Disallow: ${path}\n`;
      });
    }

    if (rules.crawlDelay) {
      content += `Crawl-delay: ${rules.crawlDelay}\n`;
    }

    content += '\n';
  });

  // Sitemap location (most important!)
  if (sitemapUrl) {
    content += `Sitemap: ${sitemapUrl}\n`;
  }

  return content;
}

/**
 * Generate robots.txt for production business site
 * @param {string} baseUrl - Business website URL
 * @returns {string} robots.txt content
 */
export function generateProductionRobots(baseUrl) {
  return generateRobotsTxt({
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    allowAll: true,
    disallowPaths: [
      '/api/',           // API endpoints
      '/admin/',         // Admin panel (if any)
      '/_next/',         // Next.js build files
      '/checkout/',      // Prevent indexing checkout flow
      '/cart/',          // Prevent indexing cart
      '/thank-you/',     // Prevent indexing confirmation pages
      '/*?*utm_*',       // Prevent indexing URLs with UTM parameters
      '/*?*ref=*',       // Prevent indexing URLs with ref parameters
    ],
    crawlDelay: 1  // Be respectful to smaller servers
  });
}

/**
 * Generate robots.txt for development/staging
 * @returns {string} robots.txt content (blocks all crawlers)
 */
export function generateDevelopmentRobots() {
  return `# Development/Staging - Block all crawlers
User-agent: *
Disallow: /
`;
}

/**
 * Generate robots.txt with advanced bot-specific rules
 * @param {string} baseUrl - Business website URL
 * @returns {string} robots.txt content
 */
export function generateAdvancedRobots(baseUrl) {
  return generateRobotsTxt({
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    allowAll: true,
    disallowPaths: [
      '/api/',
      '/admin/',
      '/_next/',
      '/checkout/',
      '/cart/',
    ],
    specificBots: {
      // Google Images - allow image indexing
      'Googlebot-Image': {
        allow: ['/images/', '/gallery/'],
        disallow: ['/private-gallery/']
      },

      // Bing - same as Google
      'Bingbot': {
        allow: ['/'],
        crawlDelay: 2
      },

      // Block bad bots that scrape content
      'AhrefsBot': {
        disallow: ['/']
      },
      'SemrushBot': {
        disallow: ['/']
      },
      'MJ12bot': {
        disallow: ['/']
      },
      'DotBot': {
        disallow: ['/']
      }
    }
  });
}

/**
 * Generate Next.js robots.txt route handler
 * @param {string} baseUrl - Business website URL
 * @param {boolean} isProduction - Whether this is production environment
 * @returns {Function} Next.js route handler
 */
export function createRobotsRoute(baseUrl, isProduction = true) {
  return function GET() {
    const robots = isProduction
      ? generateProductionRobots(baseUrl)
      : generateDevelopmentRobots();

    return new Response(robots, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24 hours
      },
    });
  };
}

/**
 * Validate robots.txt content
 * @param {string} content - robots.txt content
 * @returns {Object} {valid: boolean, warnings: Array}
 */
export function validateRobotsTxt(content) {
  const warnings = [];

  // Check for sitemap
  if (!content.includes('Sitemap:')) {
    warnings.push('Missing Sitemap directive. Add Sitemap: URL to help search engines.');
  }

  // Check for User-agent
  if (!content.includes('User-agent:')) {
    warnings.push('Missing User-agent directive. At least one User-agent must be specified.');
  }

  // Check for common mistakes
  if (content.includes('Disallow: *')) {
    warnings.push('Invalid syntax: "Disallow: *" should be "Disallow: /" to block all');
  }

  // Check line length
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.length > 500) {
      warnings.push(`Line ${index + 1} is too long (${line.length} chars). Keep under 500.`);
    }
  });

  // Check for duplicate sitemaps
  const sitemapMatches = content.match(/Sitemap:/g);
  if (sitemapMatches && sitemapMatches.length > 5) {
    warnings.push(`Too many sitemap entries (${sitemapMatches.length}). Consider using sitemap index.`);
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

/**
 * Parse robots.txt to extract sitemap URLs
 * @param {string} content - robots.txt content
 * @returns {Array} Array of sitemap URLs
 */
export function extractSitemaps(content) {
  const sitemaps = [];
  const lines = content.split('\n');

  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith('sitemap:')) {
      const url = trimmed.substring(8).trim();
      if (url) {
        sitemaps.push(url);
      }
    }
  });

  return sitemaps;
}

/**
 * Check if a path is allowed by robots.txt rules
 * @param {string} path - Path to check
 * @param {string} robotsTxt - robots.txt content
 * @param {string} userAgent - User agent name (default: *)
 * @returns {boolean} True if allowed
 */
export function isPathAllowed(path, robotsTxt, userAgent = '*') {
  const lines = robotsTxt.split('\n');
  let currentAgent = null;
  let allowed = true;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.toLowerCase().startsWith('user-agent:')) {
      const agent = trimmed.substring(11).trim();
      currentAgent = (agent === userAgent || agent === '*') ? agent : null;
    } else if (currentAgent && trimmed.toLowerCase().startsWith('disallow:')) {
      const disallowPath = trimmed.substring(9).trim();
      if (disallowPath && path.startsWith(disallowPath)) {
        allowed = false;
      }
    } else if (currentAgent && trimmed.toLowerCase().startsWith('allow:')) {
      const allowPath = trimmed.substring(6).trim();
      if (allowPath && path.startsWith(allowPath)) {
        allowed = true;
      }
    }
  }

  return allowed;
}
