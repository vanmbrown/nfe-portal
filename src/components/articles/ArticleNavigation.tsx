'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ArticleMetadata } from '@/types/articles';

interface ArticleNavigationProps {
  previousArticle?: ArticleMetadata;
  nextArticle?: ArticleMetadata;
}

export function ArticleNavigation({ previousArticle, nextArticle }: ArticleNavigationProps) {
  return (
    <div className="border-t border-[#E5E5E5] mt-12 pt-8">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Previous Article */}
        {previousArticle ? (
          <Link
            href={`/articles/${previousArticle.slug}`}
            className="flex-1 group"
          >
            <div className="flex items-center gap-4">
              <ChevronLeft className="w-5 h-5 text-[#1B3A34] group-hover:text-[#2A4C44] transition-colors" />
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-[#2B2B2B]/60 mb-2">
                  Previous Article
                </p>
                <p className="text-lg font-serif text-[#1B3A34] group-hover:text-[#2A4C44] transition-colors">
                  {previousArticle.title}
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {/* Next Article */}
        {nextArticle ? (
          <Link
            href={`/articles/${nextArticle.slug}`}
            className="flex-1 group text-right"
          >
            <div className="flex items-center gap-4 justify-end">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-[#2B2B2B]/60 mb-2">
                  Next Article
                </p>
                <p className="text-lg font-serif text-[#1B3A34] group-hover:text-[#2A4C44] transition-colors">
                  {nextArticle.title}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#1B3A34] group-hover:text-[#2A4C44] transition-colors" />
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}








