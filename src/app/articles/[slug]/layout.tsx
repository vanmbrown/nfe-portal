import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ArticleMetadata } from '@/types/articles';
import fs from 'fs';
import path from 'path';

interface ArticleLayoutProps {
  params: Promise<{
    slug: string;
  }>;
  children: React.ReactNode;
}

async function getArticleMetadata(slug: string): Promise<ArticleMetadata | null> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles', 'index.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const articlesData = JSON.parse(fileContents);
    const articles: ArticleMetadata[] = articlesData.articles;
    return articles.find((article) => article.slug === slug) || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: ArticleLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleMetadata(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;

  return {
    title: title.includes('|') ? title : `${title} | NFE Beauty`,
    description,
    keywords: ['sunscreen for melanated skin', 'mature skin SPF', 'Black don\'t crack myth', 'well-aging skincare', 'NFE Face Elixir', 'layered care skincare'],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      images: [
        {
          url: article.featuredImage,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [article.featuredImage],
    },
  };
}

export default function ArticleLayout({ children }: ArticleLayoutProps) {
  return <>{children}</>;
}

