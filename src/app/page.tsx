import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'NFE Beauty | Luxury-Performance Skincare for Mature Melanated Skin',
  description:
    'NFE Beauty creates luxury-performance well-aging skincare for mature, melanated skin through two complete elixirs and a restraint-first ritual.',
}

/**
 * The homepage.
 *
 * The narrative runs philosophy, worldview, trust, formulation intention,
 * product, science, ritual, editorial authority, private guidance, invitation.
 * Product arrives at position five, after the visitor has been told what NFE
 * believes and why the line is only two elixirs. It is deliberately not a
 * conversion-first sequence.
 *
 * THREE WIDTH SYSTEMS, and only three:
 *
 *   SHELL    the principal editorial spine. `mx-auto max-w-6xl` inside
 *            `px-6 md:px-12`. Every section that carries reading copy uses it,
 *            so headings share one left edge instead of the six unrelated
 *            edges the previous page had.
 *   MEASURE  the reading measure inside the spine. Never sets a left edge of
 *            its own; it only limits line length.
 *   Full     bleed, for the hero and the two dark chapters, where the
 *            composition is the point.
 *
 * The spine is related to Science but not copied from it: Science holds a
 * max-w-5xl column, this holds max-w-6xl, so the homepage reads as the wider
 * entrance to the same house.
 */
const SHELL = 'mx-auto max-w-6xl'
const SECTION = 'px-6 md:px-12'
const MEASURE = 'max-w-2xl'

const thesisPoints = [
  {
    title: 'Skin that has lived',
    body: 'NFE begins with experienced melanated skin: dryness, barrier stress, uneven-looking tone, texture changes, and radiance loss.',
  },
  {
    title: 'Fewer, better decisions',
    body: 'The line is intentionally restrained. Face and body care are designed as a focused ritual, not an overcrowded routine.',
  },
  {
    title: 'Measured language',
    body: 'The claims stay cosmetic: supports barrier comfort, visible radiance, and the appearance of more even-looking tone.',
  },
]

const elixirs = [
  {
    eyebrow: 'Face Elixir',
    heading: 'For visible radiance, barrier comfort, and even-looking tone.',
    body: 'A daily face ritual for skin navigating dryness, dullness, uneven-looking tone, or a depleted feel.',
    href: '/products/face-elixir',
    cta: 'Discover Face Elixir',
  },
  {
    eyebrow: 'Body Elixir',
    heading: 'For body skin that deserves face-level intention.',
    body: 'A body ritual for chronic dryness, roughness, crepey-looking texture, and skin that needs a more nourished feel.',
    href: '/products/body-elixir',
    cta: 'Discover Body Elixir',
  },
]

// Real published entries. Slugs verified against the article registry.
const journalSelection = [
  {
    slug: 'well-aging-is-not-disappearing',
    title: 'Well-Aging Is Not Disappearing',
    note: 'On refusing the idea that aging well means becoming less visible.',
  },
  {
    slug: 'barrier-wealth-aging-melanated-skin',
    title: 'Barrier Wealth',
    note: 'Why aging melanated skin ages differently, and what that asks of care.',
  },
  {
    // Not the refill note: that one is already the destination of the vessel
    // section above, and the same article twice reads as a thin selection.
    slug: 'body-care-neglected-prestige-beauty',
    title: 'Body Care',
    note: 'Prestige beauty has a missing ritual, and body skin has been held to a lower standard.',
  },
]

function MaisonLink({
  href,
  children,
  variant = 'dark',
}: {
  href: string
  children: ReactNode
  variant?: 'dark' | 'light' | 'outline' | 'outlineLight'
}) {
  const classes = {
    dark: 'bg-nfe-green-900 text-nfe-paper hover:bg-nfe-green-700 focus:bg-nfe-green-700',
    light: 'bg-nfe-gold text-nfe-green-900 hover:bg-nfe-paper focus:bg-nfe-paper',
    outline:
      'border border-nfe-green-900 text-nfe-green-900 hover:bg-nfe-green-900 hover:text-nfe-paper focus:bg-nfe-green-900 focus:text-nfe-paper',
    outlineLight:
      'border border-nfe-gold/60 text-nfe-gold hover:bg-nfe-gold hover:text-nfe-green-900 focus:bg-nfe-gold focus:text-nfe-green-900',
  }

  return (
    <Link
      href={href}
      className={`${classes[variant]} inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-colors`}
    >
      {children}
    </Link>
  )
}

/**
 * A quiet action. It reads as a text link, not a filled control, but the whole
 * thing is a 44px target: the previous product links were 20px tall, which is
 * under the minimum on every phone. Padding does the work so the restraint is
 * unchanged.
 */
function QuietLink({
  href,
  children,
  tone = 'dark',
}: {
  href: string
  children: ReactNode
  tone?: 'dark' | 'gold'
}) {
  const colour =
    tone === 'gold'
      ? 'text-nfe-gold hover:text-nfe-paper focus-visible:text-nfe-paper'
      : 'text-nfe-green-900 hover:text-nfe-green-700 focus-visible:text-nfe-green-700'
  return (
    <Link
      href={href}
      className={`${colour} inline-flex min-h-[44px] items-center py-3 text-sm font-medium uppercase tracking-[0.2em] underline-offset-8 transition-colors hover:underline focus-visible:underline`}
    >
      {children}
    </Link>
  )
}

export default function NFEHomePage() {
  const heroAlt =
    'NFE Face Elixir bottle with gold pump in a warm sculptural setting.'

  // Static, pre-generated Lanczos-resized WebP variants, served directly —
  // deliberately NOT routed through next/image's runtime optimizer for this
  // one hero. Confirmed via a Laplacian-variance audit (2026-07-19/20) that
  // the runtime resize pipeline was producing measurably softer output than
  // a proper Lanczos downscale (desktop: 60.48 vs 76.63 sharpness; a static
  // Lanczos variant lands within 1.5% of an unprocessed reference). Source
  // is unchanged — same crop, same color, same composition, just a better
  // resize. Route-scoped: this does not change next.config.mjs or affect
  // any other image on the site.
  const desktopHeroSrcSet = [
    '/images/homepage/nfe-home-hero-product-vessel-desktop-960w.webp 960w',
    '/images/homepage/nfe-home-hero-product-vessel-desktop-1600w.webp 1600w',
    '/images/homepage/nfe-home-hero-product-vessel-desktop-2200w.webp 2200w',
  ].join(', ')
  const mobileHeroSrcSet = [
    '/images/homepage/nfe-home-hero-product-vessel-mobile-828w.webp 828w',
    '/images/homepage/nfe-home-hero-product-vessel-mobile-1920w.webp 1920w',
  ].join(', ')

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      {/* 1 — Quiet hero. Full bleed.

          The mobile column no longer inherits the 86vh floor, and the image
          panel is shorter there: measured, the old hero ran 1.56 viewports at
          375 and 1.89 at 320, so the second chapter never appeared until the
          visitor had scrolled most of a screen past the fold. Desktop
          proportions are unchanged. No hero copy was removed. */}
      <section className="grid bg-[#efe4d5] lg:min-h-[86vh] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center px-6 py-10 md:px-12 md:py-20 lg:px-16">
          <p className="mb-4 text-xs uppercase tracking-[0.32em] text-[#7a4f22] md:mb-5">
            Luxury-performance skincare for skin that has lived.
          </p>
          <h1 className="max-w-4xl font-primary text-5xl leading-[0.95] text-nfe-green-900 md:text-7xl">
            For skin that has lived.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-nfe-ink/75 md:mt-8 md:text-xl">
            Two complete elixirs designed to support hydration, barrier comfort,
            tone integrity, and quiet radiance, without asking mature skin to
            perform youth.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-nfe-ink/70 md:mt-5">
            Built for dryness, barrier stress, crepey-looking texture,
            uneven-looking tone, and radiance loss. Well-aging care, made with
            restraint.
          </p>
          {/* Two actions, never three. The philosophy leads; Founder Access is
              the quieter outline beside it, and appears only once more on the
              page, in the closing invitation. */}
          <div className="mt-8 flex flex-wrap gap-4 md:mt-10">
            <MaisonLink href="#brand-thesis">Discover the Philosophy</MaisonLink>
            <MaisonLink href="/founder-access" variant="outline">
              Join Founder Access
            </MaisonLink>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.22em] text-nfe-green-900/70 md:mt-8">
            <span>Barrier comfort</span>
            <span>Visible radiance</span>
            <span>Tone integrity</span>
          </div>
        </div>
        <div className="relative min-h-[300px] overflow-hidden md:min-h-[680px] lg:min-h-full">
          <picture className="absolute inset-0 block">
            <source
              media="(min-width: 1024px)"
              srcSet={desktopHeroSrcSet}
              sizes="48vw"
            />
            <img
              src="/images/homepage/nfe-home-hero-product-vessel-mobile-1920w.webp"
              srcSet={mobileHeroSrcSet}
              sizes="100vw"
              alt={heroAlt}
              width={1920}
              height={2714}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-center md:object-[50%_35%] lg:object-[70%_center]"
            />
          </picture>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-[#efe4d5] via-[#efe4d5]/65 to-transparent lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-nfe-green-900/20 via-transparent to-transparent" />
        </div>
      </section>

      {/* 2 — Brand thesis. Principal spine.

          This is what the page used to say last, in a row of four bordered
          cards at position eleven. It says it first now, and says it as a
          statement rather than a grid: the three supporting points sit on a
          rule, not in boxes. */}
      <section
        id="brand-thesis"
        aria-labelledby="nfe-thesis-heading"
        className={`${SECTION} scroll-mt-24 py-20 md:py-24`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              What NFE believes
            </p>
            <h2
              id="nfe-thesis-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-green-900 md:text-5xl"
            >
              Aging is a privilege. Mature skin deserves the same intelligence
              luxury reserves for everyone else.
            </h2>
            <p className="mt-8 text-lg leading-8 text-nfe-ink/75">
              NFE is built around specificity rather than scale. Melanated skin
              with decades behind it is not a niche to be served last, and
              well-aging is not a softer word for correction. The work is to
              support what skin already does, with fewer and better decisions.
            </p>
          </div>
          <dl className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {thesisPoints.map((point) => (
              <div key={point.title} className="border-t border-nfe-green-900/15 pt-6">
                <dt className="font-primary text-2xl text-nfe-green-900">
                  {point.title}
                </dt>
                <dd className="mt-3 leading-7 text-nfe-muted">{point.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3 — Founder proof. Wide two-column module on the same spine. */}
      <section
        aria-labelledby="nfe-founder-heading"
        className={`${SECTION} bg-white py-20 md:py-24`}
      >
        <div className={`${SHELL} grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center`}>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Made for me. Shared with you.
            </p>
            <h2
              id="nfe-founder-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-green-900 md:text-5xl"
            >
              Made from the questions mainstream skincare did not answer well.
            </h2>
            <div className="relative mt-8 aspect-[4/5] max-w-sm overflow-hidden rounded-3xl bg-white shadow-sm">
              <Image
                src="/images/founder/vanessa-founder-portrait.webp"
                alt="Vanessa McCaleb, founder of NFE Beauty"
                fill
                sizes="(max-width: 768px) 80vw, 28vw"
                quality={90}
                className="object-cover object-center"
              />
            </div>
          </div>
          <div className="space-y-6 text-lg leading-8 text-nfe-muted">
            <p>
              NFE began with Vanessa McCaleb&apos;s search for care that could
              meet tone-rich, experienced skin with specificity and restraint.
              The brand is founder-led, but the goal is larger than one story:
              to build a disciplined beauty house for skin that has lived.
            </p>
            <div>
              <MaisonLink href="/our-story" variant="outline">
                Read the Philosophy
              </MaisonLink>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Product philosophy. Principal spine. Prepares the elixirs without
          showing them, so restraint is explained before it is demonstrated. */}
      <section
        aria-labelledby="nfe-formulation-heading"
        className={`${SECTION} py-20 md:py-24`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Formulation intention
            </p>
            <h2
              id="nfe-formulation-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-green-900 md:text-5xl"
            >
              Two elixirs. One restrained ritual.
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-nfe-ink/75">
              <p>
                A short line is a decision, not a limitation. Two elixirs let
                each one be complete, layered with intention, and finished
                rather than abandoned halfway through a shelf.
              </p>
              <p>
                Both are built barrier first. Comfort is the foundation
                everything else rests on, so tone and texture support can work
                without asking skin to tolerate more than it should.
              </p>
            </div>
            <div className="mt-10">
              <MaisonLink href="/shop" variant="outline">
                Enter the Atelier
              </MaisonLink>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — The elixirs. Full-bleed dark chapter.

          Two editorial studies rather than a product grid: no price, no badge,
          no cart control, no comparison. The actions were 20px text links,
          which is under the touch minimum on every phone; they are now 44px
          targets that still read as links rather than filled buttons. */}
      <section
        aria-labelledby="nfe-elixirs-heading"
        className="bg-nfe-green-900 px-6 py-20 text-nfe-paper md:px-12 md:py-24"
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-gold">
              The Atelier
            </p>
            <h2
              id="nfe-elixirs-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-gold md:text-5xl"
            >
              Two considered objects.
            </h2>
          </div>
          <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16">
            {elixirs.map((elixir) => (
              <article key={elixir.href} className="border-t border-nfe-gold/30 pt-8">
                <p className="text-xs uppercase tracking-[0.25em] text-nfe-gold">
                  {elixir.eyebrow}
                </p>
                <h3 className="mt-4 font-primary text-2xl leading-snug text-nfe-paper md:text-3xl">
                  {elixir.heading}
                </h3>
                <p className="mt-5 leading-7 text-nfe-paper/85">{elixir.body}</p>
                <div className="mt-6">
                  <QuietLink href={elixir.href} tone="gold">
                    {elixir.cta}
                  </QuietLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — Science. Principal spine.

          One invitation, pointing at the whole experience rather than at a
          roadmap anchor deep inside it. The homepage introduces Science; the
          Science page contains it. Nothing interactive is reproduced here. */}
      <section
        aria-labelledby="nfe-science-heading"
        className={`${SECTION} bg-white py-20 md:py-24`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              The NFE Science Map
            </p>
            <h2
              id="nfe-science-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-green-900 md:text-5xl"
            >
              Science that interprets skin, not just ingredients.
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-nfe-ink/75">
              <p>
                Comfort, hydration, tone, texture and resilience move together.
                NFE reads them as relationships across the layers of the skin
                rather than as a list of problems to be scored.
              </p>
              <p>
                The Science Map is where that thinking is shown in full: five
                pathways, the layers they belong to, and the formulation logic
                behind each one. It explains, it does not assess, and nothing
                you choose there is saved.
              </p>
            </div>
            <div className="mt-10">
              <MaisonLink href="/science">Explore the NFE Science Map</MaisonLink>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — Ritual. Principal spine. The quiz lives here now, as a quiet way
          to reflect on care rather than as a conversion slab. */}
      <section
        aria-labelledby="nfe-ritual-heading"
        className={`${SECTION} py-20 md:py-24`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              The ritual
            </p>
            <h2
              id="nfe-ritual-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-green-900 md:text-5xl"
            >
              Application is the part that becomes care.
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-8 text-nfe-ink/75">
              <p>
                A ritual is not a routine with more steps. It is the few minutes
                where attention, warmth and touch do as much as the formula:
                hands on skin, a slower pace, and the sense of having been
                looked after at the end of a day.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2">
              <MaisonLink href="/ritual" variant="outline">
                Enter the Ritual
              </MaisonLink>
              <QuietLink href="/skin-ritual-quiz">Explore your ritual</QuietLink>
            </div>
          </div>
        </div>
      </section>

      {/* 8 — The vessel. Principal spine.

          Scope is bounded by what the Atelier already says in shipped copy:
          NFE is building toward fewer, better objects and refill-minded
          luxury, and the vessel story is editorial rather than a live refill
          flow. No date, cost, saving, cadence, subscription, shipping or
          sustainability-impact claim is made, because none is confirmed. */}
      <section
        aria-labelledby="nfe-vessel-heading"
        className={`${SECTION} bg-white py-20 md:py-24`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              The vessel
            </p>
            <h2
              id="nfe-vessel-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-green-900 md:text-5xl"
            >
              Preserve the vessel. Designed to stay.
            </h2>
            <p className="mt-8 text-lg leading-8 text-nfe-ink/75">
              NFE is building toward fewer, better objects and refill-minded
              luxury. The vessel story is editorial for now rather than a live
              refill flow, and it is written down before it is sold.
            </p>
            <div className="mt-10">
              <QuietLink href="/articles/refill-culture-quiet-sustainable-luxury">
                Continue the ritual
              </QuietLink>
            </div>
          </div>
        </div>
      </section>

      {/* 9 — Editorial invitation. Wide module on the spine.

          Three real entries, each a direct link. No blog cards, no dense grid,
          and nothing that requires a horizontal swipe to reach. */}
      <section
        aria-labelledby="nfe-journal-heading"
        className={`${SECTION} py-20 md:py-24`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              The Journal
            </p>
            <h2
              id="nfe-journal-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-green-900 md:text-5xl"
            >
              Reading for skin that has lived.
            </h2>
          </div>
          <ul className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {journalSelection.map((entry) => (
              <li key={entry.slug} className="border-t border-nfe-green-900/15 pt-6">
                <Link
                  href={`/articles/${entry.slug}`}
                  className="group inline-flex min-h-[44px] flex-col justify-center py-1"
                >
                  <span className="font-primary text-2xl text-nfe-green-900 underline-offset-8 group-hover:underline group-focus-visible:underline">
                    {entry.title}
                  </span>
                </Link>
                <p className="mt-2 leading-7 text-nfe-muted">{entry.note}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <MaisonLink href="/journal" variant="outline">
              Read the Journal
            </MaisonLink>
          </div>
        </div>
      </section>

      {/* 10 — Concierge. Full-bleed dark chapter, the second and last one. */}
      <section
        aria-labelledby="nfe-concierge-heading"
        className="bg-nfe-green-900 px-6 py-20 text-nfe-paper md:px-12 md:py-24"
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-gold">
              Concierge
            </p>
            <h2
              id="nfe-concierge-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-gold md:text-5xl"
            >
              Private guidance, when you would rather ask.
            </h2>
            <p className="mt-8 text-lg leading-8 text-nfe-paper/85">
              Some questions are better answered in a conversation than on a
              page. Concierge is thoughtful care inside the maison: considered
              answers about ritual, layering and fit, given without pressure.
            </p>
            <div className="mt-10">
              <MaisonLink href="/concierge" variant="light">
                Speak with NFE
              </MaisonLink>
            </div>
          </div>
        </div>
      </section>

      {/* 11 — Closing invitation. Principal spine.

          One clear step, and the second and final appearance of Founder Access
          on the page. No email wall, no countdown, no scarcity. */}
      <section
        aria-labelledby="nfe-closing-heading"
        className={`${SECTION} py-20 md:py-28`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              An invitation
            </p>
            <h2
              id="nfe-closing-heading"
              className="mt-5 font-primary text-4xl leading-tight text-nfe-green-900 md:text-5xl"
            >
              Private notes before the full ritual opens.
            </h2>
            <p className="mt-8 text-lg leading-8 text-nfe-ink/75">
              Founder Access is the way in while ordering is being prepared:
              private notes, early ritual guidance, and word when the Atelier
              opens.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-2">
              <MaisonLink href="/founder-access">Join Founder Access</MaisonLink>
              <QuietLink href="/shop">Enter the Atelier</QuietLink>
            </div>
          </div>
        </div>
      </section>

      {/* 12 — Required disclaimer. Unchanged. */}
      <section className={`${SECTION} border-t border-nfe-green-100 py-10`}>
        <p className="mx-auto max-w-4xl text-center text-sm leading-6 text-nfe-muted">
          NFE products are cosmetic skincare products. They are not intended to
          diagnose, treat, cure, or prevent disease or any medical skin
          condition. Results vary. For persistent or complex skin concerns,
          consult a licensed professional.
        </p>
      </section>
    </div>
  )
}
