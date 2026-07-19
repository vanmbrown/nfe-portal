'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { MaisonEyebrow } from '@/components/maison/MaisonEyebrow';
import { MaisonButton } from '@/components/maison/MaisonButton';

const VIDEO_ID = 'rK3Vc7JcG7M';

export default function StoryHero() {
  const [showVideo, setShowVideo] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus management, Escape-to-close, and background scroll lock while the
  // dialog is open. Video only mounts (and only then begins loading) once
  // showVideo is true — there is no autoplay query param, so nothing plays
  // until the visitor has already taken this action.
  // Single close path so Escape and the Close button behave identically —
  // both must return focus to the trigger, not just remove the dialog.
  const closeVideo = useCallback(() => {
    setShowVideo(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!showVideo) return;

    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVideo();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showVideo, closeVideo]);

  return (
    <section className="relative h-[82vh] min-h-[560px] w-full overflow-hidden bg-nfe-green-900">
      <Image
        src="/images/our-story/founder-hero.webp"
        alt="Vanessa McCaleb, founder of NFE, outdoors in natural light"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/*
        Editorial scrim. Monotonically darkening top-to-bottom — no dip.
        An earlier version dipped to 0.05 opacity around 38%, which measured
        AA-passing in isolation but placed a near-transparent trough directly
        under the eyebrow text at its actual render position (~50% down this
        section), where the underlying photo has a bright patch. Measured
        contrast there was 1.47:1. This gradient keeps opacity rising
        continuously through the entire text zone (~45%-90%) so no single
        text element can land in a weak spot regardless of local photo
        brightness.
      */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(43,32,24,0.22) 0%, rgba(43,32,24,0.42) 42%, rgba(43,32,24,0.74) 100%)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-start justify-end px-6 pb-16 md:px-12 md:pb-20 lg:px-20">
        <MaisonEyebrow tone="photo-overlay" className="mb-4">
          The founder
        </MaisonEyebrow>
        <h1 className="max-w-2xl font-primary text-4xl font-medium leading-[1.08] text-maison-bone md:text-6xl">
          Made for me. Shared with you.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-maison-bone md:text-lg">
          The story behind NFE, shaped by Vanessa&apos;s own experience with mature, melanated
          skin.
        </p>

        <MaisonButton ref={triggerRef} variant="ghost" onClick={() => setShowVideo(true)} className="mt-8">
          Play the film
          <span aria-hidden="true">&rarr;</span>
        </MaisonButton>
      </div>

      {showVideo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Vanessa's story film"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={closeVideo}
            className="absolute right-6 top-6 z-[10000] min-h-[44px] px-3 text-xs font-semibold uppercase tracking-[0.16em] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nfe-gold"
          >
            Close
          </button>

          <div className="z-[10001] aspect-video w-full max-w-3xl">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1&controls=1`}
              title="Vanessa's Story — NFE"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
