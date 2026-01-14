'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RitualPairingProps {
  relatedProduct: {
    slug: string;
    title: string;
    shortDescription: string;
    heroImage: string;
    status?: string; // Optional status field
  } | null;
}

export function RitualPairing({ relatedProduct }: RitualPairingProps) {
  if (!relatedProduct) {
    return null;
  }

  // Check if product is available (not coming soon or future release)
  const isAvailable = relatedProduct.status === 'available';
  const isComingSoon = relatedProduct.status === 'coming_soon' || relatedProduct.status === 'future_release';
  const isBodyElixir = relatedProduct.title === 'Body Elixir' || relatedProduct.status === 'future_release';

  return (
    <section
      id="ritual-pairing"
      className="flex flex-col items-center justify-center text-center py-24 bg-[#0F2C1C] text-[#D4AF37]"
    >
      <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4 text-[#D4AF37]">
        The Ritual Pairing
      </h2>

      <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-3">
        {relatedProduct.title}
      </h3>

      <p className="text-base md:text-lg text-white mb-6 max-w-md">
        {relatedProduct.shortDescription}
      </p>

      {isAvailable ? (
        <Link
          href={`/products/${relatedProduct.slug}`}
          className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-full hover:bg-[#D4AF37] hover:text-[#0F2C1C] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0F2C1C] min-h-[44px]"
        >
          Discover {relatedProduct.title}
          <ArrowRight size={18} />
        </Link>
      ) : (
        <button
          disabled
          className="border border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-full opacity-70 cursor-not-allowed hover:opacity-90 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0F2C1C] min-h-[44px]"
          aria-label={isBodyElixir ? `${relatedProduct.title} in development` : `${relatedProduct.title} coming soon`}
        >
          {isBodyElixir ? 'IN DEVELOPMENT' : 'Coming Soon'}
        </button>
      )}
    </section>
  );
}
