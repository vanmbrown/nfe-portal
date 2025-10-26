import React from 'react';
import { cn } from '@/lib/utils';

interface PullQuoteProps {
  quote: string;
  author?: string;
  source?: string;
  className?: string;
}

export function PullQuote({ 
  quote, 
  author, 
  source, 
  className = '' 
}: PullQuoteProps) {
  return (
    <blockquote 
      className={cn(
        'border-l-4 border-nfe-gold pl-6 py-4 my-8',
        'text-lg md:text-xl text-nfe-ink',
        'font-primary italic',
        'bg-nfe-paper/50 rounded-r-lg',
        className
      )}
    >
      <p className="mb-4 leading-relaxed">
        &quot;{quote}&quot;
      </p>
      {(author || source) && (
        <footer className="text-sm text-nfe-muted not-italic">
          {author && <cite className="font-semibold">{author}</cite>}
          {author && source && <span className="mx-2">•</span>}
          {source && <cite>{source}</cite>}
        </footer>
      )}
    </blockquote>
  );
}
