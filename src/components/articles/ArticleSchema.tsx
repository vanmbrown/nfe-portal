import React from 'react';
import type { Article } from '@/types/articles';

interface ArticleSchemaProps {
  article: Article;
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    datePublished: article.date,
    image: article.featuredImage,
    description: article.excerpt,
  };

  // Note: JSON.stringify is safe for JSON-LD schemas as it properly escapes JSON
  // No HTML sanitization needed here since this is structured data, not HTML content
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}








