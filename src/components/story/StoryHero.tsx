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
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Every close path goes through the element itself. Escape is handled by the
  // browser and fires `close`, so Escape and the Close button converge on one
  // listener rather than two code paths that could drift.
  const closeVideo = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onClose = () => {
      setShowVideo(false);
      // Explicit rather than relying on the browser restoring it: the exact
      // trigger must receive focus, not merely something near it.
      triggerRef.current?.focus();
    };

    dialog.addEventListener('close', onClose);
    return () => dialog.removeEventListener('close', onClose);
  }, []);

  // Open in the top layer, put focus on the close control, and hold the page
  // still behind it. showModal() makes everything outside the dialog inert, so
  // no focus trap is hand-rolled here.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !showVideo) return;

    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showVideo]);

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

      {/*
        A native dialog opened with showModal(), rather than a div wearing
        role="dialog" and aria-modal.

        The previous markup announced itself as modal but was not: the page
        behind it was neither inert nor hidden, so Tab from the close button
        through the film continued into the header and body underneath, where
        every link stayed reachable beneath an opaque scrim. showModal() puts
        the dialog in the top layer and makes everything outside it inert, so
        containment comes from the browser instead of a hand-rolled trap.

        The film only mounts while open, so nothing loads until the visitor
        has asked for it. The scrim is the dialog's own ::backdrop, which keeps
        the quiet darkening without a second stacking context.

        No backdrop-click dismissal: it was not part of the approved
        interaction and accessibility does not require it.

        One platform limit, measured rather than assumed: while focus is inside
        the player, Escape is consumed by that cross-origin document and never
        reaches this one, so the dialog stays open. No page can intercept keys
        in a third-party frame, and the alternative is dropping the embed. The
        visitor is never stuck: the dialog holds only the Close control and the
        film, so a single Shift+Tab returns to Close, from where Escape and the
        control both work. Guarded in tests/e2e/quiz-and-film.spec.ts.
      */}
      <dialog
        ref={dialogRef}
        aria-label="Vanessa's story film"
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 backdrop:bg-black/80"
      >
        {showVideo && (
          <div className="flex h-full w-full items-center justify-center p-4">
            <button
              ref={closeRef}
              type="button"
              onClick={closeVideo}
              className="absolute right-6 top-6 min-h-[44px] px-3 text-xs font-semibold uppercase tracking-[0.16em] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nfe-gold"
            >
              Close
            </button>

            <div className="aspect-video w-full max-w-3xl">
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
      </dialog>
    </section>
  );
}
