import { getSiteUrl } from '@/lib/site-url';

/**
 * Server-rendered, deliberately.
 *
 * This was a client component using next/script, so the structured data was
 * injected after hydration and the markup a crawler receives on its first fetch
 * carried none of it. Nothing here needs the browser: it is a pure function of
 * its props, so it renders on the server and ships inside the HTML.
 */

type ArticleJsonLdProps = {
  slug: string;
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  modifiedAt?: string;
  /**
   * Byline for founder-written pieces. Omitted for house-written articles,
   * which stay attributed to the organization exactly as before.
   */
  author?: string;
};

export function ArticleJsonLd({
  slug,
  title,
  description,
  image,
  publishedAt,
  modifiedAt,
  author,
}: ArticleJsonLdProps) {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/articles/${slug}`,
    },
    headline: title,
    description,
    image: [`${siteUrl}${image}`],
    author:
      author && author !== 'NFE Beauty'
        ? { '@type': 'Person', name: author }
        : { '@type': 'Organization', name: 'NFE Beauty' },
    publisher: {
      '@type': 'Organization',
      name: 'NFE Beauty',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo/nfe_logo.png`,
      },
    },
    datePublished: publishedAt,
    dateModified: modifiedAt ?? publishedAt,
  };

  return (
    <script
      type="application/ld+json"
      // The payload is built here from typed props, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

