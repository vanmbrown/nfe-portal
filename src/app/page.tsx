import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image, { getImageProps } from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'NFE Beauty | Luxury-Performance Skincare for Mature Melanated Skin',
  description:
    'NFE Beauty creates luxury-performance well-aging skincare for mature, melanated skin through two complete elixirs and a restraint-first ritual.',
}

const differencePoints = [
  {
    title: 'Mature melanated skin specificity',
    body: 'NFE begins with skin that has lived: dryness, barrier stress, uneven-looking tone, texture changes, and radiance loss.',
  },
  {
    title: 'Two complete elixirs',
    body: 'The line is intentionally restrained. Face and body care are designed as a focused ritual, not an overcrowded routine.',
  },
  {
    title: 'Cosmetic claim discipline',
    body: 'The language stays measured: supports barrier comfort, visible radiance, and the appearance of more even-looking tone.',
  },
]

const roadmapItems = [
  {
    status: 'In Progress',
    title: 'Founder and early-user feedback',
    body: 'NFE is collecting structured feedback on texture, comfort, scent, skin feel, and ritual fit.',
  },
  {
    status: 'Planned',
    title: 'Discovery Ritual signal tracking',
    body: 'Discovery interest, sensory response, compatibility feedback, and full-size conversion will inform launch planning.',
  },
  {
    status: 'Planned',
    title: 'Structured review architecture',
    body: 'Future reviews will be organized by product, concern, length of use, and repurchase intent with claim-safe moderation.',
  },
]

const proofSignals = [
  'Founder proof rooted in lived experience and formulation discipline.',
  'Waitlist and Founder Access pathways for structured demand signals.',
  'Future review and replenishment architecture planned before full commerce.',
]

const philosophyCards = [
  'Luxury restraint over product noise.',
  'Education before pressure.',
  'Specificity without exclusion.',
  'Data discipline beneath an editorial surface.',
]

function MaisonLink({
  href,
  children,
  variant = 'dark',
}: {
  href: string
  children: ReactNode
  variant?: 'dark' | 'light' | 'outline'
}) {
  const classes = {
    dark:
      'bg-nfe-green-900 text-nfe-paper hover:bg-nfe-green-700 focus:bg-nfe-green-700',
    light:
      'bg-nfe-gold text-nfe-green-900 hover:bg-nfe-paper focus:bg-nfe-paper',
    outline:
      'border border-nfe-green-900 text-nfe-green-900 hover:bg-nfe-green-900 hover:text-nfe-paper focus:bg-nfe-green-900 focus:text-nfe-paper',
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

export default function NFEHomePage() {
  const heroAlt =
    'NFE Face Elixir bottle with gold pump in a warm sculptural setting.'
  const {
    props: { srcSet: desktopHeroSrcSet },
  } = getImageProps({
    src: '/images/homepage/nfe-home-hero-product-vessel-desktop.webp',
    alt: heroAlt,
    width: 3600,
    height: 2547,
    sizes: '(min-width: 1024px) 48vw, 100vw',
    quality: 90,
    priority: true,
  })
  const { props: mobileHeroProps } = getImageProps({
    src: '/images/homepage/nfe-home-hero-product-vessel-mobile.webp',
    alt: heroAlt,
    width: 2000,
    height: 2827,
    sizes: '100vw',
    quality: 90,
    priority: true,
  })

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="grid min-h-[86vh] bg-[#efe4d5] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-center px-6 py-20 md:px-12 lg:px-16">
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#7a4f22]">
            Luxury-performance skincare for mature, melanated skin.
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] text-nfe-green-900 md:text-7xl">
            For skin that has lived.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-nfe-ink/75 md:text-xl">
            Two complete elixirs designed to support hydration, barrier comfort,
            tone integrity, and quiet radiance, without asking mature skin to
            perform youth.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-nfe-ink/70">
            Built for dryness, barrier stress, crepey-looking texture,
            uneven-looking tone, and radiance loss. Well-aging care, made with
            restraint.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <MaisonLink href="/shop">Enter the Atelier</MaisonLink>
            <MaisonLink href="/skin-ritual-quiz" variant="outline">
              Take the Skin Ritual Quiz
            </MaisonLink>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.22em] text-nfe-green-900/70">
            <span>Barrier comfort</span>
            <span>Visible radiance</span>
            <span>Tone integrity</span>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden md:min-h-[680px] lg:min-h-full">
          <picture className="absolute inset-0 block">
            <source
              media="(min-width: 1024px)"
              srcSet={desktopHeroSrcSet}
              sizes="48vw"
            />
            <img
              {...mobileHeroProps}
              className="h-full w-full object-cover object-center md:object-[50%_35%] lg:object-[70%_center]"
            />
          </picture>
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-[#efe4d5] via-[#efe4d5]/65 to-transparent lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-nfe-green-900/20 via-transparent to-transparent" />
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Founder Story Snapshot
            </p>
            <h2 className="font-serif text-4xl text-nfe-green-900 md:text-5xl">
              Made from the questions mainstream skincare did not answer well.
            </h2>
            <div className="relative mt-8 aspect-[4/5] max-w-sm overflow-hidden rounded-3xl bg-white shadow-sm">
              <Image
                src="/images/products/20251003_175948-EDIT.jpg"
                alt="Vanessa McCaleb, founder of NFE Beauty"
                fill
                sizes="(max-width: 768px) 80vw, 28vw"
                className="object-cover object-center"
              />
            </div>
          </div>
          <div className="space-y-6 text-lg leading-8 text-nfe-muted">
            <p>
              NFE began with Vanessa McCaleb&apos;s search for care that could
              meet dry, mature, melanated skin with specificity and restraint.
              The brand is founder-led, but the goal is larger than one story:
              to build a disciplined beauty house for skin that has lived.
            </p>
            <MaisonLink href="/our-story" variant="outline">
              Read the Philosophy
            </MaisonLink>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-center text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            The NFE Difference
          </p>
          <h2 className="mx-auto max-w-3xl text-center font-serif text-4xl text-nfe-green-900 md:text-5xl">
            A maison built around specificity, trust, and fewer, better
            decisions.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {differencePoints.map((point) => (
              <article
                key={point.title}
                className="rounded-3xl border border-nfe-green-100 bg-nfe-paper p-8"
              >
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {point.title}
                </h3>
                <p className="mt-4 leading-7 text-nfe-muted">{point.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
                Product Ritual Preview
              </p>
              <h2 className="max-w-3xl font-serif text-4xl text-nfe-green-900 md:text-5xl">
                Two elixirs. One restrained ritual.
              </h2>
            </div>
            <MaisonLink href="/shop" variant="outline">
              Enter the Atelier
            </MaisonLink>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <article className="rounded-3xl bg-nfe-green-900 p-8 text-nfe-paper md:p-10">
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-nfe-gold">
                Face Elixir
              </p>
              <h3 className="font-serif text-3xl text-nfe-gold">
                For visible radiance, barrier comfort, and even-looking tone.
              </h3>
              <p className="mt-5 leading-7 text-nfe-paper/85">
                A daily face ritual for mature, melanated skin that feels dry,
                dull, uneven-looking, or depleted.
              </p>
              <Link
                href="/products/face-elixir"
                className="mt-8 inline-flex text-sm font-medium uppercase tracking-[0.2em] text-nfe-gold hover:text-nfe-paper"
              >
                View Face Elixir
              </Link>
            </article>
            <article className="rounded-3xl bg-nfe-green-900 p-8 text-nfe-paper md:p-10">
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-nfe-gold">
                Body Elixir
              </p>
              <h3 className="font-serif text-3xl text-nfe-gold">
                For body skin that deserves face-level intention.
              </h3>
              <p className="mt-5 leading-7 text-nfe-paper/85">
                A body ritual for chronic dryness, roughness, crepey-looking
                texture, and skin that needs a more nourished feel.
              </p>
              <Link
                href="/products/body-elixir"
                className="mt-8 inline-flex text-sm font-medium uppercase tracking-[0.2em] text-nfe-gold hover:text-nfe-paper"
              >
                View Body Elixir
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12" id="proof-roadmap">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Proof & Testing Roadmap
            </p>
            <h2 className="font-serif text-4xl text-nfe-green-900 md:text-5xl">
              Proof should be built with discipline before it is used as a
              claim.
            </h2>
            <p className="mt-6 leading-7 text-nfe-muted">
              NFE will distinguish founder proof, customer feedback, testing
              roadmap status, and future published evidence. Nothing here
              implies completed testing unless it is complete.
            </p>
            <div className="mt-8">
              <MaisonLink href="/science#testing-roadmap" variant="outline">
                Visit Science
              </MaisonLink>
            </div>
          </div>
          <div className="grid gap-5">
            {roadmapItems.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-nfe-green-100 bg-nfe-paper p-6"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-nfe-gold">
                  {item.status}
                </p>
                <h3 className="mt-3 font-serif text-2xl text-nfe-green-900">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-nfe-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid bg-nfe-green-900 text-nfe-paper md:grid-cols-2">
        <div className="px-6 py-20 md:px-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            Skin Ritual Quiz
          </p>
          <h2 className="font-serif text-4xl text-nfe-gold md:text-5xl">
            Begin with fit, not pressure.
          </h2>
          <p className="mt-6 max-w-xl leading-7 text-nfe-paper/85">
            The NFE Skin Ritual Quiz will help visitors understand whether Face
            Elixir, Body Elixir, the Discovery Ritual, or Founder Access is the
            right next step.
          </p>
          <div className="mt-8">
            <MaisonLink href="/skin-ritual-quiz" variant="light">
              Take the Skin Ritual Quiz
            </MaisonLink>
          </div>
        </div>
        <div className="border-t border-nfe-gold/30 px-6 py-20 md:border-l md:border-t-0 md:px-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            Discovery Ritual
          </p>
          <h2 className="font-serif text-4xl text-nfe-gold md:text-5xl">
            A considered first experience with NFE.
          </h2>
          <p className="mt-6 max-w-xl leading-7 text-nfe-paper/85">
            Discovery should reduce premium purchase uncertainty without
            discounting the brand. The commerce flow is not live yet, but the
            pathway is being prepared with care.
          </p>
          <div className="mt-8">
            <MaisonLink href="/discovery" variant="light">
              Experience the Discovery Ritual
            </MaisonLink>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Customer Proof In Progress
            </p>
            <h2 className="font-serif text-4xl text-nfe-green-900 md:text-5xl">
              Building evidence without overclaiming.
            </h2>
          </div>
          <ul className="space-y-4">
            {proofSignals.map((signal) => (
              <li
                key={signal}
                className="rounded-2xl border border-nfe-green-100 bg-white p-5 leading-7 text-nfe-muted"
              >
                {signal}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#efe4d5] p-8 text-center md:p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#7a4f22]">
            Founder Access
          </p>
          <h2 className="font-serif text-4xl text-nfe-green-900 md:text-5xl">
            Private notes before the full ritual opens.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-nfe-muted">
            Join the private list for founder notes, launch access, Discovery
            Ritual updates, and quiet education on well-aging care. The current
            supported signup path collects email only.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <MaisonLink href="/founder-access">Join Founder Access</MaisonLink>
            <MaisonLink href="/subscribe" variant="outline">
              Go to Private List
            </MaisonLink>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-center text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Brand Philosophy
          </p>
          <h2 className="mx-auto max-w-4xl text-center font-serif text-4xl text-nfe-green-900 md:text-5xl">
            Luxury restraint on the surface. Data discipline underneath.
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {philosophyCards.map((card) => (
              <div
                key={card}
                className="rounded-3xl border border-nfe-green-100 bg-white p-6 text-center font-serif text-xl text-nfe-green-900"
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-nfe-green-100 px-6 py-10 md:px-12">
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


