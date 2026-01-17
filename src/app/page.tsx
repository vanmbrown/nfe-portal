'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowRight } from 'lucide-react';

export default function NFEHomePage() {
  return (
  <>
    {/* Hero Section - Left text + Right full-height image */}
    <section className="grid md:grid-cols-12 items-stretch bg-[#1B3A34] min-h-[90vh] overflow-hidden">
      {/* Left: Tagline and CTA */}
      <div className="md:col-span-6 flex flex-col justify-center px-10 md:px-16 py-24 text-white">
	  
        <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
          NFE—<br />
          <span className="text-[#C6A664]">Not For Everyone</span>
        </h1>
        <div className="mb-8">
          <p className="max-w-lg text-lg md:text-xl text-gray-200 mb-4">
            Minimalist, science-led elixirs for mature melanated skin.
          </p>
          <p className="max-w-lg text-base md:text-lg text-gray-300 font-light italic">
            NFE is currently in a quiet development chapter. The Face Elixir waitlist is open while I decide on the most sustainable path to launch.
          </p>
        </div>
        <Link
          href="/products/face-elixir"
          className="bg-[#D6B370] text-[#1B3A34] px-8 py-3 text-lg rounded-2xl hover:bg-[#E3C58E] transition text-center inline-flex items-center justify-center"
          aria-label="Join the Waitlist"
        >
          Join the Waitlist
        </Link>
      </div>

	  {/* Right: Full-height hero image */}
	  <div className="md:col-span-6 relative min-h-[90vh]">
		<Image
		  src="/images/products/20251003_175948-EDIT.jpg"
		  alt="Vanessa — NFE founder portrait"
		  fill
		  className="object-cover object-center"
		  priority
		/>
	  </div>
	</section>
      {/* Founder Story Section */}
      <section className="px-10 md:px-20 py-24 bg-[#F6F5F3] text-[#1B3A34]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-6">Made for Me. Shared with You.</h2>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto">
            When I couldn&apos;t find a moisturizer that truly nourished my dry, mature, melanated skin, I made one. Years later, NFE is my daily ritual — a minimalist, science-led elixir that hydrates deeply, evens tone, and restores the skin&apos;s natural resilience.
          </p>
        </motion.div>
      </section>

      {/* Product Highlight Section */}
      <section className="px-6 md:px-20 py-16 md:py-24 bg-[#0F2C1C] text-white text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-2xl md:text-4xl font-serif mb-8 md:mb-12 text-[#D4AF37]">
          The NFE Ritual
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Face Elixir Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-[#1A3B2C] rounded-2xl p-6 md:p-8 flex flex-col items-center text-white shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex justify-center items-center mb-6">
              <Image
                src="/images/products/NFE_face_elixir_30_50_proportions_fixed.png"
                alt="NFE Face Elixir"
                width={160}
                height={160}
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
          </motion.div>

          {/* Body Elixir Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-[#1A3B2C] rounded-2xl p-6 md:p-8 flex flex-col items-center text-white shadow-lg opacity-80"
          >
            <div className="flex justify-center items-center mb-6">
              <div className="w-40 h-40 rounded-lg flex items-center justify-center">
                <Image
                  src="/images/products/radiant-body-elixir-white.png"
                  alt="Radiant Body Elixir Bottle"
                  width={160}
                  height={160}
                  className="w-40 h-auto rounded-lg object-contain"
                />
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
              aria-label="Body Elixir in development"
            >
              IN DEVELOPMENT
            </button>
          </motion.div>
        </div>
      </section>

      {/* Ingredient Philosophy (kept) */}
      <section className="px-10 md:px-20 py-24 bg-[#F6F5F3] text-[#1B3A34] text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl font-serif mb-8">
          The Science of Nourishment
        </motion.h2>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed mb-12">
          Powered by clinically proven actives like Niacinamide, Bakuchiol, THD Ascorbate, and Ceramides — each ingredient is intentionally chosen to hydrate, firm, and balance melanated skin.
        </p>
        <Link href="/inci">
          <Button className="bg-[#1B3A34] text-[#D6B370] px-8 py-3 text-lg rounded-2xl hover:bg-[#2A4C44] transition">Explore Ingredients</Button>
        </Link>
      </section>
   </>
  );
}


