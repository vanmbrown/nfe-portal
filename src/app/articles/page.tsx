'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArticleGrid } from '@/components/articles/ArticleGrid';
import type { ArticleMetadata } from '@/types/articles';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch articles data from public directory
    fetch('/data/articles/index.json')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading articles:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F5F2]">
      {/* Hero Banner */}
      <section className="w-full text-center py-24 border-b border-[#E5E5E5] bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-[#1B3A34] mb-4">
            Articles
          </h1>
          <p className="mt-4 text-lg text-[#2B2B2B]/70 max-w-2xl mx-auto leading-relaxed">
            A thoughtful collection of reflections, rituals, and real conversations on the care of mature melanated skin.
          </p>
        </motion.div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[#2B2B2B]/60">Loading articles...</p>
          </div>
        ) : (
          <ArticleGrid articles={articles} showFilters={true} />
        )}
      </section>
    </div>
  );
}

