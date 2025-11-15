export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string; // ISO format: YYYY-MM-DD
  featuredImage: string;
  category: string[];
  tags: string[];
  body: string; // Markdown or HTML
  seoTitle?: string;
  seoDescription?: string;
  relatedArticles?: string[]; // Article slugs
}

export interface ArticleMetadata {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  featuredImage: string;
  category: string[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export type ArticleCategory = 
  | 'Skincare Education'
  | 'Well-Aging'
  | "Founder's Notes"
  | 'Science'
  | 'Rituals'
  | 'Lifestyle';








