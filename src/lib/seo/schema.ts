/**
 * JSON-LD Schema Builder for NFE Portal
 * Generates structured data for SEO and rich snippets
 */

// Base schema interfaces
interface BaseSchema {
  '@context': string;
  '@type': string;
}

interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  foundingDate: string;
  address: {
    '@type': 'PostalAddress';
    addressCountry: string;
  };
  sameAs: string[];
  contactPoint: {
    '@type': 'ContactPoint';
    contactType: string;
    email: string;
  };
}

interface WebSiteSchema extends BaseSchema {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  potentialAction: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

interface ProductSchema extends BaseSchema {
  '@type': 'Product';
  name: string;
  description: string;
  image: string[];
  brand: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
    availability: string;
    seller: {
      '@type': 'Organization';
      name: string;
    };
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
  };
}

interface ArticleSchema extends BaseSchema {
  '@type': 'Article';
  headline: string;
  description: string;
  image: string[];
  author: {
    '@type': 'Organization';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

interface BreadcrumbSchema extends BaseSchema {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

// Schema builders
export function buildOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NFE Beauty',
    url: 'https://nfe-portal.vercel.app',
    logo: 'https://nfe-portal.vercel.app/logo.png',
    description: 'Science-backed skincare for melanated skin through barrier-first approach',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    sameAs: [
      'https://instagram.com/nfebeauty',
      'https://twitter.com/nfebeauty',
      'https://linkedin.com/company/nfebeauty',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'hello@nfebeauty.com',
    },
  };
}

export function buildWebSiteSchema(): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NFE Portal',
    url: 'https://nfe-portal.vercel.app',
    description: 'Science-backed skincare for melanated skin through barrier-first approach',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://nfe-portal.vercel.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildProductSchema(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: Array<{ src: string; alt: string }>;
}): ProductSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => `https://nfe-portal.vercel.app${img.src}`),
    brand: {
      '@type': 'Brand',
      name: 'NFE Beauty',
    },
    offers: {
      '@type': 'Offer',
      price: product.price.toString(),
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'NFE Beauty',
      },
    },
  };
}

export function buildArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string;
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image ? [`https://nfe-portal.vercel.app${article.image}`] : [],
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NFE Beauty',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nfe-portal.vercel.app/logo.png',
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url,
    },
  };
}

export function buildBreadcrumbSchema(breadcrumbs: Array<{
  name: string;
  url: string;
}>): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

// Research organization schema for scientific content
export function buildResearchOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NFE Research',
    url: 'https://nfe-portal.vercel.app/research',
    logo: 'https://nfe-portal.vercel.app/logo.png',
    description: 'Dermatological research focused on melanated skin and inclusive skincare science',
    foundingDate: '2024',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    sameAs: [
      'https://instagram.com/nfebeauty',
      'https://twitter.com/nfebeauty',
      'https://linkedin.com/company/nfebeauty',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Research Inquiries',
      email: 'research@nfebeauty.com',
    },
  };
}

// Utility function to generate all schemas for a page
export function generatePageSchemas(pageType: 'home' | 'product' | 'article' | 'about', data?: any) {
  const schemas: any[] = [buildOrganizationSchema(), buildWebSiteSchema()];

  switch (pageType) {
    case 'home':
      // Add any home-specific schemas
      break;
    case 'product':
      if (data) {
        schemas.push(buildProductSchema(data));
      }
      break;
    case 'article':
      if (data) {
        schemas.push(buildArticleSchema(data));
      }
      break;
    case 'about':
      schemas.push(buildResearchOrganizationSchema());
      break;
  }

  return schemas;
}

// Utility function to render schemas as JSON-LD script tags
export function renderSchemasAsJSONLD(schemas: any[]): string {
  return schemas
    .map(schema => `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`)
    .join('\n');
}
