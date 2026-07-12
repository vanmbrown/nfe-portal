import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FounderAccessForm } from '@/components/founder-access/FounderAccessForm'
import { FounderAccessTracker } from '@/components/founder-access/FounderAccessTracker'

export const metadata: Metadata = {
  title: 'Founder Access | NFE Beauty',
  description:
    'Join NFE Founder Access for private founder notes, release updates, and early invitation into the Founder\'s Edition allocation.',
}

const valuePillars = [
  {
    title: 'First Access',
    body: 'Be among the first invited into NFE before the official launch.',
  },
  {
    title: "Founder's Edition",
    body: 'A limited early allocation of Vanessa\'s founder-developed Face Elixir before final luxury packaging and broader public availability.',
  },
  {
    title: 'Early Experience',
    body: 'Founder Access members may be invited to share ritual feedback, product impressions, and future topic requests.',
  },
]

const VESSEL_DESKTOP =
  '/images/founder-access/nfe-founder-access-founder-edition-vessel-desktop.webp'
const VESSEL_MOBILE =
  '/images/founder-access/nfe-founder-access-founder-edition-vessel-mobile.webp'

export default function FounderAccessPage() {
  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <FounderAccessTracker />

      <section className="bg-[#efe4d5] px-6 py-24 text-center md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#7a4f22]">
          Founder Access
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-green-900 md:text-6xl">
          The first chapter of NFE, released with intention.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-ink/72 md:text-xl">
          A limited first release of founder-developed skincare for mature,
          melanated skin.
        </p>
        <p className="mx-auto mt-6 max-w-3xl leading-8 text-nfe-ink/68">
          NFE began as Vanessa&apos;s personal solution after years of searching
          for skincare that could support skin through dryness, uneven-looking
          tone, texture changes, and barrier stress without asking mature skin to
          perform youth.
        </p>
        <p className="mx-auto mt-6 max-w-3xl leading-8 text-nfe-ink/68">
          The first Founder&apos;s Edition release will be intentionally limited.
          Founder Access members will receive private updates, release
          information, and the opportunity to join NFE&apos;s first paid
          allocation before the official luxury launch.
        </p>
        <div className="mt-10">
          <Link
            href="#request-founder-access"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700"
          >
            Join Founder Access
          </Link>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-nfe-ink/60">
          No public launch date has been announced. Access will open in limited
          waves.
        </p>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {valuePillars.map((pillar) => (
              <article
                key={pillar.title}
                className="rounded-[1.75rem] border border-nfe-green-900/10 bg-white p-6 md:p-8"
              >
                <h2 className="font-serif text-2xl text-nfe-green-900 md:text-3xl">
                  {pillar.title}
                </h2>
                <p className="mt-4 leading-7 text-nfe-ink/72">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-nfe-green-900/10 bg-[#efe4d5] p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-[#7a4f22]">
            Made for me. Shared with you.
          </p>
          <div className="mt-6 space-y-6 leading-8 text-nfe-ink/72">
            <p>
              NFE was created from lived experience, not trend forecasting.
              Vanessa developed the Face Elixir after years of navigating mature
              skin changes, dryness, uneven-looking tone, and products that did
              not meet the needs of melanated skin with depth, elegance, and
              care.
            </p>
            <p>
              NFE is built around a simple belief: well-aging, not anti-aging.
              Skin that has lived deserves care that is intentional, refined, and
              deeply nourishing.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
            The Founder&apos;s Edition Vessel
          </p>
          <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
            An early release, shown with intention.
          </h2>
          <p className="mt-6 leading-8 text-nfe-ink/72">
            The Founder&apos;s Edition is an early, limited release of NFE Face
            Elixir before the official luxury launch. The formula is
            founder-developed and produced in small batches. Packaging may
            continue to evolve as NFE moves toward its final luxury vessel
            system.
          </p>
          <figure className="mt-10">
            <div className="overflow-hidden rounded-[1.75rem] border border-nfe-green-900/10 bg-[#f6f1ea]">
              <div className="relative aspect-[2/3] w-full md:hidden">
                <Image
                  src={VESSEL_MOBILE}
                  alt="NFE Face Elixir Founder Edition vessel with label reading NFE, Not for Everyone, Face Elixir, and Founder Edition"
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
              <div className="relative hidden aspect-[2/3] w-full md:block">
                <Image
                  src={VESSEL_DESKTOP}
                  alt="NFE Face Elixir Founder Edition vessel with label reading NFE, Not for Everyone, Face Elixir, and Founder Edition"
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-contain"
                />
              </div>
            </div>
            <figcaption className="mt-4 text-center text-sm leading-6 text-nfe-ink/60">
              Founder&apos;s Edition vessel shown. Final luxury packaging may
              evolve.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl">
          <FounderAccessForm />
        </div>
      </section>
    </div>
  )
}
