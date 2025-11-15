import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArticleHero } from '@/components/articles/ArticleHero';
import { ArticleBody } from '@/components/articles/ArticleBody';
import { ArticleNavigation } from '@/components/articles/ArticleNavigation';
import { ArticleShare } from '@/components/articles/ArticleShare';
import { ArticleSchema } from '@/components/articles/ArticleSchema';
import type { Article, ArticleMetadata } from '@/types/articles';
import fs from 'fs';
import path from 'path';

// Generate static params for all articles
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles', 'index.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const articlesData = JSON.parse(fileContents);
    const articles: ArticleMetadata[] = articlesData.articles;
    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    return [];
  }
}

// Fetch article data
async function getArticle(slug: string): Promise<Article | null> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles', `${slug}.json`);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return null;
  }
}

// Get all articles for navigation
function getAllArticles(): ArticleMetadata[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles', 'index.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const articlesData = JSON.parse(fileContents);
    return articlesData.articles;
  } catch (error) {
    return [];
  }
}

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === params.slug);
  const previousArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : undefined;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : undefined;

  // Format date
  const date = new Date(article.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      {/* Schema.org Markup */}
      <ArticleSchema article={article} />

      <div className="min-h-screen bg-white">
        {/* Hero Image */}
        <ArticleHero
          imageUrl={article.featuredImage}
          imageAlt="Water ripple texture evoking calmness and reflection"
        />

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-serif text-[#1B3A34] mb-4">
          {article.title}
        </h1>

        {/* Author & Date */}
        <p className="uppercase tracking-wide text-xs text-[#2B2B2B]/60 mb-10">
          By {article.author} • {formattedDate}
        </p>

        {/* Body Content */}
        <ArticleBody content={article.body} />

        {/* Disclaimer Section */}
        <div className="border-t border-[#E5E5E5] mt-12 pt-8 text-center">
          <p className="text-xs text-[#2B2B2B]/40 italic max-w-xl mx-auto">
            NFE is a cosmetic product. It does not diagnose, treat, cure, or prevent disease. Results vary based on consistency and care.
          </p>
        </div>

        {/* Social Share */}
        <ArticleShare
          title={article.title}
          url={`/articles/${article.slug}`}
        />

        {/* Navigation */}
        <ArticleNavigation
          previousArticle={previousArticle}
          nextArticle={nextArticle}
        />

        {/* Back to Articles */}
        <div className="mt-12 text-center">
          <Link
            href="/articles"
            className="inline-block text-sm text-[#1B3A34] border-b border-[#1B3A34] hover:border-[#2A4C44] hover:text-[#2A4C44] transition-colors"
          >
            ← Back to Articles
          </Link>
        </div>
      </article>
    </div>
    </>
  );
}

