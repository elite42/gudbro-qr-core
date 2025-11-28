/**
 * Schema.org Structured Data Generators
 * Used across all vertical templates for SEO
 *
 * Reference: https://schema.org/LocalBusiness
 */

/**
 * Generate LocalBusiness Schema (Base for all verticals)
 * @param {Object} business - Business data
 * @returns {Object} JSON-LD structured data
 */
export function generateLocalBusinessSchema(business) {
  const {
    name,
    description,
    type = 'LocalBusiness', // Can be: 'HealthAndBeautyBusiness', 'Store', etc.
    image,
    url,
    telephone,
    email,
    address,
    geo,
    openingHours,
    priceRange = '$$',
    rating,
    review
  } = business;

  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    'name': name,
    'image': image || [],
    'url': url,
    '@id': url,
  };

  // Add description
  if (description) {
    schema.description = description;
  }

  // Add contact info
  if (telephone) {
    schema.telephone = telephone;
  }
  if (email) {
    schema.email = email;
  }

  // Add address
  if (address) {
    schema.address = {
      '@type': 'PostalAddress',
      'streetAddress': address.street,
      'addressLocality': address.city,
      'addressRegion': address.region || address.city,
      'postalCode': address.postalCode || '',
      'addressCountry': address.country || 'VN'
    };
  }

  // Add geo coordinates
  if (geo && geo.lat && geo.lng) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      'latitude': geo.lat,
      'longitude': geo.lng
    };
  }

  // Add opening hours
  if (openingHours && Array.isArray(openingHours)) {
    schema.openingHoursSpecification = openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': hours.days, // e.g., ["Monday", "Tuesday"]
      'opens': hours.open,     // e.g., "09:00"
      'closes': hours.close    // e.g., "18:00"
    }));
  }

  // Add price range
  schema.priceRange = priceRange;

  // Add aggregate rating
  if (rating && rating.value && rating.count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': rating.value,
      'reviewCount': rating.count,
      'bestRating': '5',
      'worstRating': '1'
    };
  }

  // Add reviews
  if (review && Array.isArray(review) && review.length > 0) {
    schema.review = review.map(r => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': r.authorName
      },
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': r.rating,
        'bestRating': '5',
        'worstRating': '1'
      },
      'reviewBody': r.text,
      'datePublished': r.date
    }));
  }

  return schema;
}

/**
 * Generate Service Schema (for services offered)
 * @param {Object} service - Service data
 * @param {Object} provider - Business providing the service
 * @returns {Object} JSON-LD structured data
 */
export function generateServiceSchema(service, provider) {
  const {
    name,
    description,
    category,
    duration,
    price,
    currency = 'VND',
    image
  } = service;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': name,
    'description': description,
    'category': category,
    'image': image,
    'provider': {
      '@type': 'LocalBusiness',
      'name': provider.name,
      'url': provider.url
    },
    'offers': {
      '@type': 'Offer',
      'price': price,
      'priceCurrency': currency,
      'availability': 'https://schema.org/InStock',
      ...(duration && {
        'deliveryLeadTime': {
          '@type': 'QuantitativeValue',
          'value': duration,
          'unitCode': 'MIN'
        }
      })
    }
  };
}

/**
 * Generate Person Schema (for staff members)
 * @param {Object} person - Person data
 * @param {Object} worksFor - Business they work for
 * @returns {Object} JSON-LD structured data
 */
export function generatePersonSchema(person, worksFor) {
  const {
    name,
    jobTitle,
    description,
    image,
    email,
    telephone
  } = person;

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': name,
    'jobTitle': jobTitle,
    'description': description,
    'image': image,
    ...(email && { email }),
    ...(telephone && { telephone }),
    'worksFor': {
      '@type': 'Organization',
      'name': worksFor.name,
      'url': worksFor.url
    }
  };
}

/**
 * Generate Breadcrumb Schema
 * @param {Array} breadcrumbs - Array of {name, url} objects
 * @returns {Object} JSON-LD structured data
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url
    }))
  };
}

/**
 * Generate Product Schema (for items available for sale/rent)
 * @param {Object} product - Product data
 * @param {Object} seller - Business selling the product
 * @returns {Object} JSON-LD structured data
 */
export function generateProductSchema(product, seller) {
  const {
    name,
    description,
    image,
    brand,
    model,
    price,
    currency = 'VND',
    availability = 'InStock',
    condition = 'NewCondition',
    rating
  } = product;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': name,
    'description': description,
    'image': image,
    ...(brand && { brand: { '@type': 'Brand', 'name': brand } }),
    ...(model && { model }),
    'offers': {
      '@type': 'Offer',
      'price': price,
      'priceCurrency': currency,
      'availability': `https://schema.org/${availability}`,
      'itemCondition': `https://schema.org/${condition}`,
      'seller': {
        '@type': 'Organization',
        'name': seller.name,
        'url': seller.url
      }
    }
  };

  // Add aggregate rating if available
  if (rating && rating.value && rating.count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      'ratingValue': rating.value,
      'reviewCount': rating.count,
      'bestRating': '5',
      'worstRating': '1'
    };
  }

  return schema;
}

/**
 * Convert schema object to JSON-LD script tag (for HTML)
 * @param {Object} schema - Schema.org object
 * @returns {string} HTML script tag
 */
export function schemaToScriptTag(schema) {
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

/**
 * Generate multiple schemas for a page
 * @param {Array} schemas - Array of schema objects
 * @returns {string} Combined HTML script tags
 */
export function generateMultipleSchemas(schemas) {
  return schemas.map(schema => schemaToScriptTag(schema)).join('\n');
}
