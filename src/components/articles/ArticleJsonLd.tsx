'use client';

import Script from 'next/script';
import { getSiteUrl } from '@/lib/site-url';

type ArticleJsonLdProps = {
  slug: string;
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  modifiedAt?: string;
};

export function ArticleJsonLd({
  slug,
  title,
  description,
  image,
  publishedAt,
  modifiedAt,
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
    author: {
      '@type': 'Organization',
      name: 'NFE Beauty',
    },
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
    <Script
      id={`article-jsonld-${slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

