'use client';

import React from 'react';
import Image from 'next/image';

interface ArticleHeroProps {
  imageUrl: string;
  imageAlt: string;
}

export function ArticleHero({ imageUrl, imageAlt }: ArticleHeroProps) {
  // Default alt text if not provided
  const altText = imageAlt || 'Article hero image';
  
  return (
    <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
      <Image
        src={imageUrl}
        alt={altText}
        fill
        className="object-cover"
        priority
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTdlOWViIi8+PC9zdmc+"
        sizes="100vw"
      />
    </div>
  );
}

