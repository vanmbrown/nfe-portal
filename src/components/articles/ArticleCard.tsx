'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { ArticleMetadata } from '@/types/articles';

interface ArticleCardProps {
  article: ArticleMetadata;
  className?: string;
}

export function ArticleCard({ article, className = '' }: ArticleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`group ${className}`}
    >
      <Link href={`/articles/${article.slug}`} className="block">
        {/* Image Container with Hover Effect */}
        <div className="relative overflow-hidden rounded-2xl shadow-sm mb-6 aspect-[4/3]">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-[#1B3A34] opacity-0 group-hover:opacity-15 transition-opacity duration-500" />
        </div>

        {/* Content */}
        <div>
          <h2 className="text-xl font-serif text-[#1B3A34] group-hover:text-[#2A4C44] transition-colors mb-3">
            {article.title}
          </h2>
          <p className="text-sm text-[#2B2B2B]/70 leading-relaxed mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          <span className="inline-block text-sm font-medium text-[#1B3A34] border-b border-[#1B3A34] group-hover:border-[#2A4C44] transition-colors">
            Read Article →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}








