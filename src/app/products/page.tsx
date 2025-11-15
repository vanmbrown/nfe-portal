'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#0F2C1C] text-center py-16 md:py-24 px-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#D4AF37] mb-4">
          The NFE Ritual
        </h1>
        <p className="text-[#EDEBE7] text-lg md:text-xl max-w-2xl mx-auto">
          Two elixirs designed to work together — nourishing your skin from face to body.
        </p>
      </section>

      {/* Products Grid */}
      <section className="px-6 md:px-20 py-16 md:py-24 bg-[#0F2C1C]">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Face Elixir Card */}
          <div 
            className="bg-[#1A3B2C] rounded-2xl p-6 md:p-8 flex flex-col items-center text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex justify-center items-center mb-6">
              <Image
                src="/images/products/NFE_face_elixir_30_50_proportions_fixed.png"
                alt="NFE Face Elixir"
                width={160}
                height={160}
                priority
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMGYyYzFjIi8+PC9zdmc+"
                sizes="(max-width: 768px) 160px, 160px"
                className="w-40 h-auto rounded-lg object-contain"
              />
            </div>
            <h3 className="text-xl md:text-2xl font-serif mb-2">Face Elixir</h3>
            <p className="text-sm md:text-base mb-4 max-w-xs text-gray-200 leading-relaxed">
              A luminous, restorative emulsion that hydrates, firms, and softens the look of uneven tone — formulated for mature, melanated skin.
            </p>
            <span className="text-xs tracking-wider uppercase mb-3 text-[#D4AF37] font-medium">
              Waitlist Open
            </span>
            <Link
              href="/products/face-elixir"
              className="border border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-full hover:bg-[#D4AF37] hover:text-[#0F2C1C] transition-all duration-200 text-sm md:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#1A3B2C] min-h-[44px] flex items-center justify-center"
            >
              Discover More →
            </Link>
          </div>

          {/* Body Elixir Card */}
          <div 
            className="bg-[#1A3B2C] rounded-2xl p-6 md:p-8 flex flex-col items-center text-white shadow-lg opacity-80"
          >
            <div className="flex justify-center items-center mb-6">
              <div className="w-40 h-40 bg-[#2A4C44] rounded-lg flex items-center justify-center">
                <span className="text-gray-200 text-sm">Body Elixir</span>
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-serif mb-2">Body Elixir</h3>
            <p className="text-sm md:text-base mb-4 max-w-xs text-gray-200 leading-relaxed">
              A rich yet fast-absorbing elixir that restores suppleness and glow to dry, crepey skin — your daily ritual for head-to-toe hydration.
            </p>
            <span className="text-xs tracking-wider uppercase mb-3 text-gray-200 font-medium">
              In Development
            </span>
            <button
              disabled
              className="border border-gray-300 text-gray-200 px-6 py-2 rounded-full cursor-not-allowed opacity-60 text-sm md:text-base font-medium min-h-[44px] flex items-center justify-center"
              aria-label="Body Elixir coming soon"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
