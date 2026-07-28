import Link from 'next/link'

import { SCIENCE_PAGE } from '@/content/science/page'

const { eyebrow, heading, introduction, steps, ctaLabel, ctaHref } =
  SCIENCE_PAGE.scienceMethod

/**
 * The method orientation, between the opening explanation and the dark chapter.
 *
 * Its job is to tell a visitor what is about to happen before she meets the
 * pathway controls, then get out of the way. It orients and recedes: warm
 * ground, restrained borders, no progress indicator, no numbered circles, no
 * animation.
 *
 * Server-rendered with no client boundary. The three steps and the invitation
 * are static text, and the invitation is a plain anchor — the page needs no
 * JavaScript to be understood or navigated.
 *
 * The steps describe what the visitor does and what follows. Deliberately
 * absent: any language of assessment, ranking, priority or result. Step 2 says
 * in as many words that nothing is diagnosed, scored or saved, because that is
 * the question this module invites.
 */
export function ScienceMethod() {
  return (
    <section aria-labelledby="nfe-science-method-heading" className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            {eyebrow}
          </p>
          <h2
            id="nfe-science-method-heading"
            className="mt-5 font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl"
          >
            {heading}
          </h2>
          <p className="mt-8 text-lg leading-8 text-nfe-ink/75">{introduction}</p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.id}
              className="rounded-2xl border border-nfe-green-900/15 bg-white p-7 md:p-8"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-nfe-green-700">
                {step.stepLabel}
              </p>
              <h3 className="mt-4 font-serif text-xl leading-snug text-nfe-green-900 md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-4 leading-7 text-nfe-ink/75">{step.description}</p>
            </li>
          ))}
        </ol>

        {/* An invitation, not a control. A plain anchor to the pathway section:
            no handler, no scroll script, no state, so it behaves the way a
            visitor expects and works without JavaScript. */}
        <p className="mt-12">
          <Link
            href={ctaHref}
            className="inline-flex min-h-[44px] items-center rounded-full border border-nfe-green-900 px-7 text-sm uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nfe-gold focus-visible:ring-offset-2"
          >
            {ctaLabel}
          </Link>
        </p>
      </div>
    </section>
  )
}
