'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function StoryHero() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
      <Image
        src="/images/products/20251003_175927.jpg"
        alt="Vanessa Story"
        fill
        className="object-cover"
        priority
        unoptimized
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 text-white">
        <h1 className="text-5xl font-serif mb-4 drop-shadow-lg">Vanessa&apos;s Story</h1>
        <p className="text-lg mb-8">Made for Me. Shared with You.</p>

        <button
          onClick={() => setShowVideo(true)}
          className="bg-[#D8B15D] text-green-900 px-6 py-3 rounded-full font-medium hover:bg-yellow-300 transition shadow-lg"
        >
          ▶ Play Video
        </button>
      </div>

      {/* VIDEO MODAL */}
      {showVideo && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[9999]"
          style={{ position: 'fixed' }}
        >
          {/* Close button */}
          <button
            className="absolute top-6 right-6 text-white text-3xl z-[10000]"
            onClick={() => setShowVideo(false)}
            aria-label="Close video"
          >
            ✕
          </button>

          {/* Video container */}
          <div className="w-full max-w-3xl aspect-video z-[10001]">
            <iframe
              className="w-full h-full rounded-xl"
              src="https://www.youtube.com/embed/rK3Vc7JcG7M?autoplay=1&rel=0&modestbranding=1&controls=1"
              title="Vanessa Story Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}

