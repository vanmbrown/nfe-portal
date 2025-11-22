'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ProductHeroProps {
  title: string;
  shortDescription: string;
  heroImage: string;
  ctaLabel: string;
  status: 'available' | 'coming_soon' | 'future_release';
  onCtaClick: () => void;
  ctaSlot?: React.ReactNode;
}

export function ProductHero({
  title,
  shortDescription,
  heroImage,
  ctaLabel,
  status,
  onCtaClick,
  ctaSlot,
}: ProductHeroProps) {
  const isDisabled = status === 'future_release';
  const isAvailable = status === 'available';

  const [imageError, setImageError] = React.useState(false);

  return (
    <section className="relative h-[45vh] bg-[#0F2C1C] flex flex-col items-center justify-center text-center text-white overflow-hidden">
      {/* Logo - Always visible with fallback */}
      <div className="mb-4 z-10" style={{ display: 'block', opacity: 1 }}>
        {!imageError ? (
            <Image
              src="/images/products/1080_PNG_03.png"
            alt="NFE Logo"
            width={96}
            height={96}
            className="mx-auto w-20 h-20 md:w-24 md:h-24 opacity-90"
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMGYyYzFjIi8+PC9zdmc+"
              sizes="(max-width: 768px) 80px, 96px"
              onError={() => {
                setImageError(true);
              }}
              style={{ 
                display: 'block',
              width: '80px',
              height: 'auto',
              maxWidth: '100%'
            }}
          />
        ) : (
          <Image
            src="/images/products/1080_PNG_03.png"
            alt="NFE Logo"
            width={80}
            height={80}
            className="mx-auto opacity-90"
            loading="eager"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMGYyYzFjIi8+PC9zdmc+"
            sizes="80px"
            style={{
              width: '80px',
              height: 'auto',
              maxWidth: '100%'
              }}
            />
        )}
        </div>

      {/* Title + Subtext */}
      <h1 className="text-3xl md:text-4xl font-serif text-[#D4AF37] mb-2 z-10">
          {title}
        </h1>
      <p className="text-sm md:text-base text-gray-200 mb-6 tracking-wide z-10">
          {shortDescription}
        </p>

      {/* Button */}
      <div className="z-10">
        {ctaSlot ?? (
          <button
            onClick={onCtaClick}
            disabled={isDisabled}
            className={`
              border border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-full hover:bg-[#D4AF37] hover:text-[#0F2C1C] transition
              ${
                isAvailable
                  ? 'bg-[#D4AF37] text-[#0F2C1C] hover:bg-[#E7C686]'
                  : isDisabled
                  ? 'bg-[#D4AF37]/60 text-[#0F2C1C]/60 cursor-not-allowed border-[#D4AF37]/60'
                  : ''
              }
              focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0F2C1C]
            `}
            aria-label={ctaLabel}
          >
            {ctaLabel}
          </button>
        )}
      </div>

      {/* Subtle logo watermark in background (optional) */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-5"
        aria-hidden="true"
      >
        <Image
          src="/images/products/1080_PNG_03.png"
          alt=""
          width={800}
          height={800}
          className="w-[50vh] md:w-[70vh] h-auto"
          sizes="(max-width: 768px) 50vh, 70vh"
          loading="lazy"
          style={{ display: 'block' }}
        />
      </div>
    </section>
  );
}
