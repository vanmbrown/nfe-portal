import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ritual | NFE Beauty',
  description:
    'NFE ritual guidance for mature, melanated skin: protect, treat when appropriate, and nourish with restraint.',
}

const ritualLinks = [
  { href: '/science', label: 'Discover the Science' },
  { href: '/shop', label: 'Enter the Atelier' },
  { href: '/inci', label: 'Explore Ingredients' },
  { href: '/articles', label: 'Read the Journal' },
]

export default function RitualPage() {
  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          NFE Ritual
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          The Ritual of Being Deeply Cared For
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          NFE approaches well-aging as a practice of restraint, consistency, and
          comfort. The ritual is not about asking mature skin to perform youth.
          It is about supporting skin that has lived with care that feels
          intelligent, sensorial, and steady.
        </p>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Well-Aging Practice
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              Protect. Treat when appropriate. Nourish.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-8 text-nfe-muted">
            <p>
              NFE is built around layered care. Protect skin daily with SPF.
              Treat persistent or complex concerns with professional guidance
              when appropriate. Nourish consistently with formulas designed to
              support barrier comfort, visible radiance, and a more supple skin
              feel.
            </p>
            <p>
              This is the quiet discipline behind NFE: fewer, better steps that
              are easy to return to, season after season.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <article className="rounded-3xl border border-nfe-green-100 bg-nfe-paper p-8 shadow-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-nfe-gold">
              Face Elixir Ritual
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900">
              For tone integrity, comfort, and quiet radiance.
            </h2>
            <p className="mt-5 text-base leading-7 text-nfe-muted">
              The Face Elixir ritual is designed as daily support for mature,
              melanated skin experiencing dryness, dullness, uneven-looking
              tone, and visible texture. Use with restraint, consistency, and
              sunscreen during the day.
            </p>
            <Link
              href="/products/face-elixir"
              className="mt-8 inline-flex text-sm font-medium uppercase tracking-[0.2em] text-nfe-green-800 hover:text-nfe-gold"
            >
              View Face Elixir
            </Link>
          </article>

          <article className="rounded-3xl border border-nfe-green-100 bg-nfe-paper p-8 shadow-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-nfe-gold">
              Body Elixir Ritual
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900">
              For body skin that deserves face-level care.
            </h2>
            <p className="mt-5 text-base leading-7 text-nfe-muted">
              The Body Elixir ritual is intended for dry, depleted-feeling body
              skin and crepey-looking texture. It supports a smoother, more
              nourished skin feel without reducing body care to an afterthought.
            </p>
            <Link
              href="/products/body-elixir"
              className="mt-8 inline-flex text-sm font-medium uppercase tracking-[0.2em] text-nfe-green-800 hover:text-nfe-gold"
            >
              View Body Elixir
            </Link>
          </article>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Continue the World
          </p>
          <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Let the ritual lead into understanding.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {ritualLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-nfe-green-800 px-5 py-3 text-sm uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper"
              >
                {link.label}
              </Link>
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
