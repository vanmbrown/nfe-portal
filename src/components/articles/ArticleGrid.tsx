'use client';

import React, { useState } from 'react';
import { ArticleCard } from './ArticleCard';
import type { ArticleMetadata } from '@/types/articles';

interface ArticleGridProps {
  articles: ArticleMetadata[];
  showFilters?: boolean;
}

export function ArticleGrid({ articles, showFilters = true }: ArticleGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories from articles
  const categories = Array.from(
    new Set(articles.flatMap(article => article.category))
  ).sort();

  // Filter articles by category
  const filteredArticles = selectedCategory
    ? articles.filter(article => article.category.includes(selectedCategory))
    : articles;

  // Only show category filters if there are multiple categories
  const shouldShowFilters = showFilters && categories.length > 1;

  return (
    <div>
      {/* Category Filters - Only show when multiple categories exist */}
      {shouldShowFilters && (
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-[#1B3A34] text-white'
                : 'bg-white text-[#1B3A34] border border-[#1B3A34] hover:bg-[#1B3A34] hover:text-white'
            }`}
          >
            All Articles
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-[#1B3A34] text-white'
                  : 'bg-white text-[#1B3A34] border border-[#1B3A34] hover:bg-[#1B3A34] hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#2B2B2B]/60">No articles found in this category.</p>
        </div>
      )}
    </div>
  );
}

