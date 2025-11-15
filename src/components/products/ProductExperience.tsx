'use client';

import React from 'react';
import { sanitizeHTML } from '@/lib/utils/sanitize';

interface ProductExperienceProps {
  content: string; // HTML string
}

export function ProductExperience({ content }: ProductExperienceProps) {
  const sanitizedContent = sanitizeHTML(content);

  return (
    <section className="w-full bg-[#FAF9F6] py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-serif prose-headings:text-[#0F2C1C]
            prose-p:text-[#2B2B2B] prose-p:leading-[1.8] prose-p:mb-6
            prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:font-serif prose-h3:text-[#0F2C1C]
            prose-strong:text-[#0F2C1C] prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </section>
  );
}








