/**
 * SEO Utilities - Complete Package
 * Centralized exports for all SEO functionality
 *
 * Usage:
 * import { generateLocalBusinessSchema, generateMetaTags, generateSitemap } from '@shared/seo';
 */

// Schema.org Structured Data
export {
  generateLocalBusinessSchema,
  generateServiceSchema,
  generatePersonSchema,
  generateBreadcrumbSchema,
  generateProductSchema,
  schemaToScriptTag,
  generateMultipleSchemas
} from './schema-org.js';

// Meta Tags (SEO + Social Media)
export {
  generateMetaTags,
  generateLocalBusinessMeta,
  generateServiceMeta,
  generateStaffMeta,
  formatPriceForMeta,
  generateCanonicalUrl
} from './meta-tags.js';

// Sitemap Generation
export {
  generateSitemap,
  generateRentalsSitemap,
  generateWellnessSitemap,
  generateSitemapIndex,
  generateSlug,
  validateSitemap,
  createSitemapRoute
} from './sitemap.js';

// Robots.txt
export {
  generateRobotsTxt,
  generateProductionRobots,
  generateDevelopmentRobots,
  generateAdvancedRobots,
  createRobotsRoute,
  validateRobotsTxt,
  extractSitemaps,
  isPathAllowed
} from './robots.js';

// Performance Optimization
export {
  generateImageSrcSet,
  generatePictureElement,
  generatePreloadLinks,
  generatePrefetchLinks,
  generateDnsPrefetch,
  extractCriticalCSS,
  generateFontPreloads,
  generateLazyLoadScript,
  generatePerformanceHints,
  estimateImageSize,
  generateNextImageProps,
  generateImagePlaceholder,
  checkPerformanceBudget,
  generateCSP
} from './performance.js';
