'use client';

import React from 'react';
import { sanitizeHTML } from '@/lib/utils/sanitize';

interface ArticleBodyProps {
  content: string; // HTML string
}

export function ArticleBody({ content }: ArticleBodyProps) {
  const sanitizedContent = sanitizeHTML(content);

  return (
    <div
      className="prose prose-lg prose-neutral max-w-none
        prose-headings:font-serif prose-headings:text-[#1B3A34]
        prose-p:text-[#2B2B2B] prose-p:leading-relaxed prose-p:mb-7
        prose-strong:text-[#1B3A34] prose-strong:font-semibold
        prose-em:text-[#B8944F] prose-em:not-italic
        prose-ul:text-[#2B2B2B] prose-ul:my-6 prose-ul:space-y-2
        prose-ol:text-[#2B2B2B] prose-ol:my-6 prose-ol:space-y-2
        prose-li:my-2 prose-li:leading-relaxed
        prose-a:text-[#1B3A34] prose-a:underline prose-a:decoration-[#B8944F] prose-a:underline-offset-2
        prose-a:hover:text-[#2A4C44]
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:font-serif
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:font-serif
        [&_.list-none]:list-none [&_.list-none]:ml-0 [&_.list-none]:space-y-1 [&_.list-none]:font-medium
        [&_p.italic]:italic
        [&_a]:text-[#1B3A34] [&_a]:underline [&_a]:decoration-[#B8944F] [&_a]:underline-offset-2
        [&_a:hover]:text-[#2A4C44]"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

