'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { VideoLightbox } from '@/components/ui/VideoLightbox';
import { Play } from 'lucide-react';

export default function OurStoryPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoUrl = 'https://www.youtube.com/shorts/rK3Vc7JcG7M';

  // Debug: Log state changes
  useEffect(() => {
    console.log('OurStoryPage - isVideoOpen state changed to:', isVideoOpen);
  }, [isVideoOpen]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
  };

  return (
    <>
      {/* Hero Section - Full-Bleed Visual + Overlay Text */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Golden Filter */}
        <div className="absolute inset-0">
          <Image
            src="/images/products/20251003_175927.jpg"
            alt="Vanessa, Founder of NFE"
            fill
            className="object-cover"
            style={{
              filter: 'sepia(20%) saturate(80%) brightness(105%)',
            }}
            priority
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjhmNWYyIi8+PC9zdmc+"
            sizes="100vw"
          />
          {/* Frosted Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/15 mix-blend-multiply pointer-events-none" />
        </div>

        {/* Text Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-20 text-center text-white px-4 max-w-2xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 drop-shadow-lg">
            Vanessa&apos;s Story
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl font-serif mb-8 drop-shadow-md">
            Made for Me. Shared with You.
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Button clicked, setting isVideoOpen to true');
              setIsVideoOpen(true);
              console.log('State updated, isVideoOpen should be:', true);
            }}
            className="inline-flex items-center gap-2 bg-[#D6B370] hover:bg-[#E7C686] text-[#1B3A34] px-6 py-3 rounded-full font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#D6B370] focus:ring-offset-2 focus:ring-offset-transparent relative z-50 cursor-pointer pointer-events-auto"
            aria-label="Play video about Vanessa's story"
            type="button"
            style={{ position: 'relative', zIndex: 50 }}
          >
            <Play size={20} fill="currentColor" />
            Play Video
          </button>
        </motion.div>
      </section>

      {/* Section 2 – The Narrative Block */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#F8F5F2]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left Column - Text */}
            <motion.div
              {...fadeInUp}
              className="space-y-6 text-[#2B2B2B]"
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1B3A34] mb-6">
                The Journey to NFE
              </h2>
              
              <p className="text-lg leading-relaxed font-serif">
                I believe in <em className="text-[#6B5230] not-italic font-semibold">honest skincare</em>. NFE was born out of necessity—and love.
              </p>

              <p className="text-lg leading-relaxed font-serif">
                For most of my life, my skin was even, balanced, and easy to care for. But in my late forties, everything changed. I developed melasma—a condition I had never heard of—and suddenly, my reflection felt unfamiliar. The diagnosis was emotional, and the path forward was confusing. My dermatologist guided me through professional treatments, including a peel and tretinoin, which helped—but what truly transformed my skin was consistency. That&apos;s when NFE became my twice-daily ritual: deeply hydrating, strengthening my barrier, and supporting a more even, radiant tone.
              </p>

              <p className="text-lg leading-relaxed font-serif">
                But my story with NFE started years earlier. Back in 2016, I was frustrated with dry, crepey skin that no store-bought lotion could touch. Premium creams left me ashy by midday, and even the DIY mixtures I made lost their magic over time. So I began researching, experimenting, and learning—layer by layer—what mature, melanated skin truly needs to thrive. What began as a simple body oil evolved over years into a sophisticated, nutrient-rich emulsion that hydrates like water, nourishes like an oil, and supports tone with brightening botanicals and restorative actives.
              </p>

              <p className="text-lg leading-relaxed font-serif">
                As I aged, I embraced a new philosophy: <em className="text-[#6B5230] not-italic font-semibold">well-aging, not anti-aging</em>. If you&apos;re lucky, you get to age. My goal is simply to do it well—to stay vibrant, balanced, and confident in my own skin. For me, that means a holistic, layered approach: I move my body, eat well, protect my skin from the sun, and nourish it daily with NFE.
              </p>

              <p className="text-lg leading-relaxed font-serif">
                NFE—short for <em className="text-[#6B5230] not-italic font-semibold">Not For Everyone</em>—is a reflection of that truth. It&apos;s not meant to be everything for everyone. It&apos;s for those who want simplicity without compromise; who want to age well, not fight it; who want skincare that understands the unique needs of mature, melanated skin—dryness, uneven tone, and barrier fragility—and meets them with science and care.
              </p>

              <p className="text-lg leading-relaxed font-serif">
                Healthy, radiant skin isn&apos;t about chasing miracles. It&apos;s about smart layers: protect (SPF), treat when needed (with your dermatologist), and nourish daily (with NFE). That&apos;s the approach that brought my skin to a place I&apos;m truly happy with—and the philosophy behind everything I create.
              </p>

              <p className="text-lg leading-relaxed font-serif">
                I made NFE for myself. I share it with anyone who sees themselves in my story.
              </p>

              <p className="text-lg leading-relaxed font-serif font-semibold text-[#1B3A34]">
                Because beautiful skin isn&apos;t effortless—it&apos;s intentional. And it&apos;s always worth it.
              </p>
            </motion.div>

            {/* Right Column - Image */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src="/images/products/20251003_175927.jpg"
                alt="Vanessa, Founder of NFE"
                fill
                className="object-cover"
                style={{
                  filter: 'sepia(10%) saturate(90%)',
                }}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZjhmNWYyIi8+PC9zdmc+"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3 – Brand Ethos / Core Philosophy */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#1B3A34] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-[#E7C686]">
              Honest Skincare. Designed for the Journey.
            </h2>
            <p className="text-lg md:text-xl leading-relaxed font-serif text-white/90 max-w-3xl mx-auto">
              NFE isn&apos;t anti-aging—it&apos;s pro-wellness. Our formulations are crafted for mature, melanated skin, built on nourishment, science, and simplicity. We believe in healthy barrier function, visible radiance, and the confidence that comes from care—not perfection.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 4 – Closing CTA */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1B3A34] mb-4">
              Discover the Ritual
            </h2>
            <p className="text-lg md:text-xl text-[#2B2B2B] mb-8 font-serif leading-relaxed">
              Explore NFE Face and Body Elixirs—the daily nourishment your skin deserves.
            </p>
            <Link href="/shop">
              <Button className="bg-[#D6B370] hover:bg-[#E7C686] text-[#1B3A34] px-8 py-4 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all">
                Shop NFE Elixirs
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Video Lightbox */}
      <VideoLightbox
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={videoUrl}
        title="Vanessa's Story - Made for Me. Shared with You."
      />
    </>
  );
}

