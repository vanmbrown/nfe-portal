'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWaitlistStore } from '@/store/useWaitlistStore';

interface ShopCardProps {
  title: string;
  description: string;
  status?: string;
  waitlist?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  href?: string | null;
  showImage?: boolean;
  reserveImageSpace?: boolean;
}

export default function ShopCard({
  title,
  description,
  status,
  waitlist = false,
  imageSrc,
  imageAlt,
  href = '/products/face-elixir',
  showImage = true,
  reserveImageSpace = true,
}: ShopCardProps) {
  const openWaitlist = useWaitlistStore((s) => s.open);

  const handleWaitlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openWaitlist();
  };

  return (
    <div className="rounded-2xl bg-green-950 p-6 shadow-lg transition hover:shadow-xl border border-green-900 flex flex-col">
      {href ? (
        <Link href={href}>
          {showImage && imageSrc && imageAlt ? (
            <div className="relative w-full h-[350px] flex items-center justify-center cursor-pointer mb-4">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-contain"
                priority
              />
            </div>
          ) : reserveImageSpace ? (
            <div className="w-full h-[350px] mb-4" />
          ) : null}
          <h3 className="text-2xl font-serif text-white mb-2">{title}</h3>
        </Link>
      ) : (
        <>
          {showImage && imageSrc && imageAlt ? (
            <div className="relative w-full h-[350px] flex items-center justify-center mb-4">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                className="object-contain"
                priority
              />
            </div>
          ) : reserveImageSpace ? (
            <div className="w-full h-[350px] mb-4" />
          ) : null}
          <h3 className="text-2xl font-serif text-white mb-2">{title}</h3>
        </>
      )}

      <p className="text-sm text-white/80 leading-relaxed mb-6">{description}</p>

      <div className="mt-auto space-y-4">
        {status && (
          <p className="text-xs tracking-wide text-white/60 uppercase">
            {status}
          </p>
        )}

        {waitlist ? (
          <button
            onClick={handleWaitlist}
            className="w-full bg-[#CDA64D] hover:bg-[#b78f3c] text-white font-medium py-3 rounded-full transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#CDA64D] focus:ring-offset-green-950"
          >
            Join Waitlist
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-[#CDA64D]/30 text-white/60 py-3 rounded-full cursor-not-allowed"
          >
            {title === "Body Elixir" ? "IN DEVELOPMENT" : "Coming Soon"}
          </button>
        )}
      </div>
    </div>
  );
}

