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
 * Narrative order, section content and destinations are the approved Wave 2
 * architecture and are unchanged. What changed in this pass is the system the
 * page is dressed in: the page carried 28 rendered type voices and 6 control
 * styles, and two labels rendered two ways each, so a treatment could not
 * teach a visitor anything.
 *
 * THREE WIDTH SYSTEMS
 *   SHELL    principal editorial spine, mx-auto max-w-6xl inside px-6/md:px-12
 *   MEASURE  reading measure inside the spine; sets no left edge of its own
 *   full     bleed, for the hero and the two dark chapters
 *
 * TWO GROUNDS
 *   nfe-paper for every narrative chapter, nfe-green-900 for exactly two.
 *   The previous page alternated nfe-paper (#FAFAF8) with white (#FFFFFF),
 *   which measures 1.045:1 against each other. That is below the threshold at
 *   which a change reads as deliberate, so it produced unevenness rather than
 *   rhythm. White is gone.
 *
 * THREE SECTION INTERVALS
 *   96px  closely related continuation      py-16 md:py-24
 *   112px new movement                      py-20 md:py-28
 *   128px chapter event                     py-24 md:py-32
 *   Assigned by narrative relationship, not by position.
 *
 * THREE UPPERCASE TRACKINGS, each with one job
 *   0.32em hero kicker, once on the page
 *   0.3em  section eyebrow and metadata
 *   0.18em every control and text action
 */
const SHELL = 'mx-auto max-w-6xl'
const SECTION = 'px-6 md:px-12'
const MEASURE = 'max-w-2xl'

const SPACE = {
  related: 'py-16 md:py-24',
  movement: 'py-20 md:py-28',
  event: 'py-24 md:py-32',
}

/** Section eyebrow. One treatment; only the colour answers to the ground. */
const EYEBROW = 'text-xs uppercase tracking-[0.3em]'
/** Chapter heading. One scale. */
const CHAPTER = 'mt-5 font-primary text-4xl leading-tight md:text-5xl'
/** Sub-tier heading. One scale, whatever element carries it. */
const SUB = 'font-primary text-2xl leading-snug md:text-3xl'
/** Lead paragraph. */
const LEAD = 'text-lg leading-8'
/** Body paragraph. */
const BODY = 'leading-7'

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
    slug: 'body-care-neglected-prestige-beauty',
    title: 'Body Care',
    note: 'Prestige beauty has a missing ritual, and body skin has been held to a lower standard.',
  },
]

/**
 * The control system. Two tiers, each with a light and a dark form, plus the
 * text action below. Nothing else on the page is allowed to look actionable.
 *
 * Every control carries `border` — transparent on the filled tiers — so a
 * border can never change the rendered height. Previously filled controls came
 * out at 44px and outlined ones at 46px, and the two sat side by side in the
 * hero. Fixed interface height is the specific discipline the reference gets
 * right, and it is now enforced by the shared base rather than by each call
 * site remembering.
 *
 * Radius is `rounded-sm`, not `rounded-full`: the pill read as ecommerce.
 */
const CONTROL_BASE =
  'inline-flex min-h-[44px] items-center justify-center rounded-sm border px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'

const CONTROL_TONE = {
  'primary-light':
    'border-transparent bg-nfe-green-900 text-nfe-paper hover:bg-nfe-green-700 focus-visible:ring-nfe-green-900 focus-visible:ring-offset-nfe-paper',
  'primary-dark':
    'border-transparent bg-nfe-gold text-nfe-green-900 hover:bg-nfe-gold-hover focus-visible:ring-nfe-paper focus-visible:ring-offset-nfe-green-900',
  'secondary-light':
    'border-nfe-green-900 text-nfe-green-900 hover:bg-nfe-green-900 hover:text-nfe-paper focus-visible:ring-nfe-green-900 focus-visible:ring-offset-nfe-paper',
  'secondary-dark':
    'border-nfe-gold/60 text-nfe-gold hover:bg-nfe-gold hover:text-nfe-green-900 focus-visible:ring-nfe-paper focus-visible:ring-offset-nfe-green-900',
}

function Action({
  href,
  children,
  tier = 'secondary',
  ground = 'light',
}: {
  href: string
  children: ReactNode
  tier?: 'primary' | 'secondary'
  ground?: 'light' | 'dark'
}) {
  return (
    <Link href={href} className={`${CONTROL_BASE} ${CONTROL_TONE[`${tier}-${ground}`]}`}>
      {children}
    </Link>
  )
}

/**
 * The third tier: a reading action, not a button.
 *
 * The rule sits on an inner span so it stays tight to the type while the
 * interactive box is still 44px. The previous version was a bare 20px text
 * link, under the touch minimum on every phone.
 */
function TextAction({
  href,
  children,
  ground = 'light',
}: {
  href: string
  children: ReactNode
  ground?: 'light' | 'dark'
}) {
  const tone =
    ground === 'dark'
      ? 'text-nfe-gold hover:text-nfe-paper focus-visible:ring-nfe-paper focus-visible:ring-offset-nfe-green-900'
      : 'text-nfe-green-900 hover:text-nfe-green-700 focus-visible:ring-nfe-green-900 focus-visible:ring-offset-nfe-paper'
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[44px] items-center text-sm font-medium uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${tone}`}
    >
      <span className="border-b border-current pb-1">{children}</span>
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
  // a proper Lanczos downscale. Route-scoped: this does not change
  // next.config.mjs or affect any other image on the site.
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
      {/* 1 — Quiet hero. Full bleed, warm ground.

          The opening line keeps its seven words and its period. It is not a
          section eyebrow and is no longer dressed as one: it is the hero
          kicker, the only 0.32em label on the page, in the warm-ground eyebrow
          colour this brand already uses on Science, shop, Concierge, Discovery
          and Founder Access. */}
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
          <p className={`mt-4 max-w-2xl ${BODY} text-nfe-ink/70 md:mt-5`}>
            Built for dryness, barrier stress, crepey-looking texture,
            uneven-looking tone, and radiance loss. Well-aging care, made with
            restraint.
          </p>
          {/* Two actions, never three. Founder Access is secondary here and
              secondary again in the closing: one label, one treatment. */}
          <div className="mt-8 flex flex-wrap gap-4 md:mt-10">
            <Action href="#brand-thesis" tier="primary">
              Discover the Philosophy
            </Action>
            <Action href="/founder-access">Join Founder Access</Action>
          </div>
          {/* Metadata, not a section eyebrow, so it takes the control tracking
              rather than the eyebrow's 0.3em.

              This is also a layout-stability fix. At 0.3em these three items
              sit right on their flex-wrap threshold, so the row wrapped to two
              lines under the fallback metrics and unwrapped once Inter loaded.
              Measured, that single reflow took desktop CLS from 0.0036 to
              0.0692. At 0.18em the row is comfortably inside one line at every
              width and CLS is back to 0.0036. Widening this row again will
              reintroduce the shift. */}
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.18em] text-nfe-green-900/70 md:mt-8">
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

      {/* 2 — Brand thesis. Opens the argument, so it takes the movement
          interval rather than the close one. */}
      <section
        id="brand-thesis"
        aria-labelledby="nfe-thesis-heading"
        className={`${SECTION} ${SPACE.movement} scroll-mt-24`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-green-700`}>What NFE believes</p>
            <h2 id="nfe-thesis-heading" className={`${CHAPTER} text-nfe-green-900`}>
              Aging is a privilege. Mature skin deserves the same intelligence
              luxury reserves for everyone else.
            </h2>
            <p className={`mt-8 ${LEAD} text-nfe-ink/75`}>
              NFE is built around specificity rather than scale. Melanated skin
              with decades behind it is not a niche to be served last, and
              well-aging is not a softer word for correction. The work is to
              support what skin already does, with fewer and better decisions.
            </p>
          </div>
          <dl className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {thesisPoints.map((point) => (
              <div key={point.title} className="border-t border-nfe-green-900/15 pt-6">
                <dt className={`${SUB} text-nfe-green-900`}>{point.title}</dt>
                <dd className={`mt-3 ${BODY} text-nfe-ink/70`}>{point.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 3 — Founder proof. Continues the thesis directly, so it takes the
          related interval. */}
      <section
        aria-labelledby="nfe-founder-heading"
        className={`${SECTION} ${SPACE.related}`}
      >
        <div className={`${SHELL} grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center`}>
          <div>
            <p className={`${EYEBROW} text-nfe-green-700`}>
              Made for me. Shared with you.
            </p>
            <h2 id="nfe-founder-heading" className={`${CHAPTER} text-nfe-green-900`}>
              Made from the questions mainstream skincare did not answer well.
            </h2>
            <div className="relative mt-8 aspect-[4/5] max-w-sm overflow-hidden rounded-sm bg-white shadow-sm">
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
          {/* Lead role, same colour as every other lead. It was the only lead
              on the page in the weaker grey. */}
          <div className={`space-y-6 ${LEAD} text-nfe-ink/75`}>
            <p>
              NFE began with Vanessa McCaleb&apos;s search for care that could
              meet tone-rich, experienced skin with specificity and restraint.
              The brand is founder-led, but the goal is larger than one story:
              to build a disciplined beauty house for skin that has lived.
            </p>
            <div>
              <Action href="/our-story">Read the Philosophy</Action>
            </div>
          </div>
        </div>
      </section>

      {/* 4 — Product philosophy. New movement: from what NFE believes to how
          it makes. */}
      <section
        aria-labelledby="nfe-formulation-heading"
        className={`${SECTION} ${SPACE.movement}`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-green-700`}>Formulation intention</p>
            <h2 id="nfe-formulation-heading" className={`${CHAPTER} text-nfe-green-900`}>
              Two elixirs. One restrained ritual.
            </h2>
            <div className={`mt-8 space-y-6 ${LEAD} text-nfe-ink/75`}>
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
              <Action href="/shop">Enter The Atelier</Action>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — The Atelier. Dark chapter, so it takes the event interval and
          lands as a change of room.

          Both products take the dark-ground primary. Gold is now the standard
          primary on dark rather than a single-use style, and the two elixirs
          hold equal weight. */}
      <section
        aria-labelledby="nfe-elixirs-heading"
        className={`bg-nfe-green-900 px-6 text-nfe-paper md:px-12 ${SPACE.event}`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-gold`}>The Atelier</p>
            <h2 id="nfe-elixirs-heading" className={`${CHAPTER} text-nfe-gold`}>
              Two elixirs. One considered philosophy.
            </h2>
          </div>
          <div className="mt-14 grid gap-12 md:grid-cols-2 md:gap-16">
            {elixirs.map((elixir) => (
              <article key={elixir.href} className="border-t border-nfe-gold/30 pt-8">
                <p className={`${EYEBROW} text-nfe-gold`}>{elixir.eyebrow}</p>
                <h3 className={`mt-4 ${SUB} text-nfe-paper`}>{elixir.heading}</h3>
                <p className={`mt-5 ${BODY} text-nfe-paper/85`}>{elixir.body}</p>
                <div className="mt-8">
                  <Action href={elixir.href} tier="primary" ground="dark">
                    {elixir.cta}
                  </Action>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6 — Science. The authority chapter, so it takes the event interval
          even on a light ground. One invitation, to the whole experience. */}
      <section
        aria-labelledby="nfe-science-heading"
        className={`${SECTION} ${SPACE.event}`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-green-700`}>The NFE Science Map</p>
            <h2 id="nfe-science-heading" className={`${CHAPTER} text-nfe-green-900`}>
              Science that interprets skin, not just ingredients.
            </h2>
            <div className={`mt-8 space-y-6 ${LEAD} text-nfe-ink/75`}>
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
              <Action href="/science" tier="primary">
                Explore the NFE Science Map
              </Action>
            </div>
          </div>
        </div>
      </section>

      {/* 7 — The Ritual. Continues from Science. The quiz sits here as a
          reading action, not a conversion slab. */}
      <section
        aria-labelledby="nfe-ritual-heading"
        className={`${SECTION} ${SPACE.related}`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-green-700`}>The Ritual</p>
            <h2 id="nfe-ritual-heading" className={`${CHAPTER} text-nfe-green-900`}>
              Application is the part that becomes care.
            </h2>
            <div className={`mt-8 space-y-6 ${LEAD} text-nfe-ink/75`}>
              <p>
                A ritual is not a routine with more steps. It is the few minutes
                where attention, warmth and touch do as much as the formula:
                hands on skin, a slower pace, and the sense of having been
                looked after at the end of a day.
              </p>
            </div>
            {/* The Ritual is a principal maison experience, so its action takes
                the light-ground primary rather than an outline. It was outlined,
                which put it in the same treatment as the hero's subordinate
                action and left the hierarchy here unreadable: two actions of
                apparently equal weight, one boxed and one not, with nothing
                saying which was the way in.

                The quiz stays a reading action. It is the quieter reflective
                path, not a second entrance. */}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Action href="/ritual" tier="primary">
                Enter The Ritual
              </Action>
              <TextAction href="/skin-ritual-quiz">Explore your ritual</TextAction>
            </div>
          </div>
        </div>
      </section>

      {/* 8 — The Vessel. Continues the ritual. Scope is bounded by what the
          Atelier already states in shipped copy: building toward fewer, better
          objects and refill-minded luxury, editorial for now rather than a live
          refill flow. No date, cost, saving, cadence, subscription, shipping or
          sustainability-impact claim, because none is confirmed.

          The action names its destination: it goes to the published refill
          note in the Journal, so it says so. */}
      <section
        aria-labelledby="nfe-vessel-heading"
        className={`${SECTION} ${SPACE.related}`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-green-700`}>The Vessel</p>
            <h2 id="nfe-vessel-heading" className={`${CHAPTER} text-nfe-green-900`}>
              Preserve the vessel. Designed to stay.
            </h2>
            <p className={`mt-8 ${LEAD} text-nfe-ink/75`}>
              NFE is building toward fewer, better objects and refill-minded
              luxury. The vessel story is editorial for now rather than a live
              refill flow, and it is written down before it is sold.
            </p>
            <div className="mt-10">
              <TextAction href="/articles/refill-culture-quiet-sustainable-luxury">
                Read the refill note
              </TextAction>
            </div>
          </div>
        </div>
      </section>

      {/* 9 — The Journal. New movement: from the object to the writing.

          The three titles are sub-tier headings that happen to be linked, not
          controls. They were styled spans, which told the document outline they
          were not peers of the other sub-headings. They are h3 now. */}
      <section
        aria-labelledby="nfe-journal-heading"
        className={`${SECTION} ${SPACE.movement}`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-green-700`}>The Journal</p>
            <h2 id="nfe-journal-heading" className={`${CHAPTER} text-nfe-green-900`}>
              Reading for skin that has lived.
            </h2>
          </div>
          <ul className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-3">
            {journalSelection.map((entry) => (
              <li key={entry.slug} className="border-t border-nfe-green-900/15 pt-6">
                {/* A reading destination, so it carries the same at-rest rule
                    as the other editorial actions. It keeps its heading
                    typography: these are sub-tier headings that happen to link,
                    and collapsing them to control text would remove a type role
                    from the approved system. What is normalised is the
                    interaction signal, not the scale. */}
                <h3 className={`${SUB} text-nfe-green-900`}>
                  <Link
                    href={`/articles/${entry.slug}`}
                    className="inline-flex min-h-[44px] items-center transition-colors hover:text-nfe-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nfe-green-900 focus-visible:ring-offset-2 focus-visible:ring-offset-nfe-paper"
                  >
                    <span className="border-b border-current pb-1">{entry.title}</span>
                  </Link>
                </h3>
                <p className={`mt-2 ${BODY} text-nfe-ink/70`}>{entry.note}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <Action href="/journal">Read The Journal</Action>
          </div>
        </div>
      </section>

      {/* 10 — Concierge. The second and last dark chapter, so it takes the
          event interval. Gold primary, the same control the Atelier uses. */}
      <section
        aria-labelledby="nfe-concierge-heading"
        className={`bg-nfe-green-900 px-6 text-nfe-paper md:px-12 ${SPACE.event}`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-gold`}>Concierge</p>
            <h2 id="nfe-concierge-heading" className={`${CHAPTER} text-nfe-gold`}>
              Private guidance, when you would rather ask.
            </h2>
            <p className={`mt-8 ${LEAD} text-nfe-paper/85`}>
              Some questions are better answered in a conversation than on a
              page. Concierge is thoughtful care inside the maison: considered
              answers about ritual, layering and fit, given without pressure.
            </p>
            <div className="mt-10">
              <Action href="/concierge" tier="primary" ground="dark">
                Speak with NFE
              </Action>
            </div>
          </div>
        </div>
      </section>

      {/* 11 — Closing invitation.

          Founder Access is secondary here because it is secondary in the hero,
          and one label takes one treatment. The emphasis at the close is
          carried by the heading and the space around it rather than by a
          filled control. */}
      <section
        aria-labelledby="nfe-closing-heading"
        className={`${SECTION} ${SPACE.movement}`}
      >
        <div className={SHELL}>
          <div className={MEASURE}>
            <p className={`${EYEBROW} text-nfe-green-700`}>An invitation</p>
            <h2 id="nfe-closing-heading" className={`${CHAPTER} text-nfe-green-900`}>
              Private notes before the full ritual opens.
            </h2>
            <p className={`mt-8 ${LEAD} text-nfe-ink/75`}>
              Founder Access is the way in while ordering is being prepared:
              private notes, early ritual guidance, and word when The Atelier
              opens.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
              <Action href="/founder-access">Join Founder Access</Action>
              <Action href="/shop">Enter The Atelier</Action>
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
