import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Discovery Ritual | NFE Beauty',
  description:
    'An early-access introduction to the NFE Discovery Ritual for mature, melanated skin.',
}

const discoverySignals = [
  'Learn whether the Face Elixir, Body Elixir, or full ritual feels like the right first step.',
  'Share interest before full commerce opens, without being pushed into a purchase.',
  'Help NFE understand demand, fit, and ritual readiness before launch.',
]

export default function DiscoveryPage() {
  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          Discovery Ritual
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          A Considered First Encounter with NFE
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          The Discovery Ritual is being prepared as a lower-risk way to
          experience NFE&apos;s sensory world before choosing a full-size elixir.
          Full commerce is not live in this phase.
        </p>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              What It Will Help With
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              Discovery before commitment.
            </h2>
          </div>
          <ul className="grid gap-4">
            {discoverySignals.map((signal) => (
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
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Early Access Path
          </p>
          <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Join Founder Access to hear when Discovery opens.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-nfe-muted">
            The current supported path collects email only through the private
            list. No sample purchase, checkout, or subscription flow is active
            yet.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/founder-access"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700"
            >
              Join Founder Access
            </Link>
            <Link
              href="/shop"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper"
            >
              Enter the Atelier
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
