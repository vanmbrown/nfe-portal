import { SCIENCE_PAGE } from '@/content/science/page'

const { eyebrow, heading, introduction, steps } = SCIENCE_PAGE.scienceMethod

/**
 * The method orientation, between the opening explanation and the dark chapter.
 *
 * Its job is to tell a visitor what is about to happen before she meets the
 * pathway controls, then get out of the way. It orients and recedes: warm
 * ground, restrained borders, no progress indicator, no numbered circles, no
 * animation.
 *
 * Server-rendered with no client boundary. The three steps are static text, so
 * the page needs no JavaScript to be understood or navigated.
 *
 * The gold invitation that used to close this section now sits at the foot of
 * the hero, so it is reachable before these three cards rather than after
 * them. There is still exactly one of it on the page.
 *
 * Three columns only from lg. At 768px three cards gave 139px of text and
 * about seventeen characters a line, which is the crowding this module is
 * meant to avoid; tablets get two columns instead.
 *
 * The steps describe what the visitor does and what follows. Deliberately
 * absent: any language of assessment, ranking, priority or result. Step 2 says
 * in as many words that nothing is diagnosed, scored or saved, because that is
 * the question this module invites.
 */
// pt-14 rather than py-24 more than halves this section's share of the interval
// above it, so the explanation and the Method read as one sequence. The bottom
// padding is untouched, keeping the cards clear of Layer Science.
//
// The interval has been closed in two steps: 192px to 128px in the approved
// alignment pass, then 128px to 112px here as a finishing adjustment.
//
// The left edge is deliberately not changed: measured at 1440, this section
// already sits at 201px, exactly on the same spine as formulation principles
// and ingredient families below. It was the explanation block above that was
// out of line, not this one.
export function ScienceMethod() {
  return (
    <section aria-labelledby="nfe-science-method-heading" className="px-6 pt-14 pb-24 md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            {eyebrow}
          </p>
          <h2
            id="nfe-science-method-heading"
            className="mt-5 font-primary text-3xl leading-tight text-nfe-green-900 md:text-5xl"
          >
            {heading}
          </h2>
          <p className="mt-8 text-lg leading-8 text-nfe-ink/75">{introduction}</p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.id}
              className="rounded-2xl border border-nfe-green-900/15 bg-white p-7 md:p-8"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-nfe-green-700">
                {step.stepLabel}
              </p>
              <h3 className="mt-4 font-primary text-xl leading-snug text-nfe-green-900 md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-4 leading-7 text-nfe-ink/75">{step.description}</p>
            </li>
          ))}
        </ol>

      </div>
    </section>
  )
}
