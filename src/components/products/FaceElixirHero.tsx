'use client';

import Image from 'next/image';
import { useWaitlistStore } from '@/store/useWaitlistStore';

export default function FaceElixirHero() {
  const { open } = useWaitlistStore();

  return (
    <section className="w-full bg-[#0F2A23] text-center py-24 text-white px-4 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-[1]">
        <Image
          src="/images/products/1080_PNG_03.png"
          alt=""
          width={600}
          height={600}
          priority
          className="w-[55vw] max-w-[600px] h-auto"
        />
      </div>

      <div className="relative z-10">
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/products/1080_PNG_03.png"
            alt="NFE Logo"
            width={120}
            height={120}
            priority
            className="w-20 h-20 md:w-24 md:h-24 opacity-90"
          />
        </div>

        <p className="uppercase tracking-widest text-sm text-[#CDA64D] mb-3">
          Not For Everyone
        </p>
        <h1 className="text-4xl md:text-5xl font-serif mb-3 text-[#D4AF37]">
          Face Elixir
        </h1>
        <p className="opacity-80 mb-10 max-w-2xl mx-auto text-base md:text-lg">
          Hydration + Barrier Support for Melanated Skin
        </p>

        <button
          onClick={open}
          className="px-8 py-3 bg-[#CDA64D] text-white rounded-full font-medium hover:bg-[#b78f3c] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CDA64D] focus:ring-offset-[#0F2A23]"
        >
          Join Waitlist
        </button>
      </div>
    </section>
  );
}

