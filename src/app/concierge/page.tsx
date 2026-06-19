import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Concierge | NFE Beauty',
  description:
    'Private cosmetic skincare guidance for mature, melanated skin, rooted in restraint, ritual, and barrier-first care.',
}

const conciergeHelps = [
  'chronic dryness and depleted-feeling skin',
  'uneven-looking tone and radiance loss',
  'mature skin texture and visible softness changes',
  'barrier comfort and routine simplification',
  'Face Elixir, Body Elixir, and Discovery Ritual guidance',
  'sensitivity, fragrance, or compatibility questions',
]

const processSteps = [
  {
    title: 'Share what your skin is asking for.',
    body: 'The full intake experience will collect context such as skin type, concerns, current routine, product interest, and consent.',
  },
  {
    title: 'Receive thoughtful guidance.',
    body: 'NFE Concierge is designed to respond with care, not automation pressure. Guidance will remain cosmetic, measured, and non-medical.',
  },
  {
    title: 'Begin only when the ritual feels right.',
    body: 'If a product path is appropriate, Concierge can guide you toward The Atelier, the Discovery Ritual, or a private checkout path when available.',
  },
]

export default function ConciergePage() {
  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          NFE Concierge
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          Private Guidance for Skin That Deserves to Be Heard
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          NFE Concierge offers thoughtful skincare guidance for mature,
          melanated skin, rooted in restraint, ritual, and barrier-first care.
          It is private care before product pressure.
        </p>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              What Concierge Helps With
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              Guidance for the questions that deserve more than a product grid.
            </h2>
          </div>
          <ul className="grid gap-4 text-base leading-7 text-nfe-muted md:grid-cols-2">
            {conciergeHelps.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-nfe-green-100 bg-white p-5"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            How It Will Work
          </p>
          <h2 className="mx-auto max-w-3xl text-center font-serif text-3xl text-nfe-green-900 md:text-4xl">
            A slower, more considered path to choosing your ritual.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-3xl bg-nfe-paper p-8 shadow-sm"
              >
                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-nfe-gold">
                  Step {index + 1}
                </p>
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-nfe-muted">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl rounded-3xl bg-nfe-green-900 p-8 text-center text-nfe-paper md:p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            Founder Access
          </p>
          <h2 className="font-serif text-3xl text-nfe-gold md:text-4xl">
            Concierge replies are thoughtful, not instant.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-nfe-paper/85">
            The full Concierge intake form is not live yet. Until then, join the
            private list for Founder Access, early ritual guidance, and quiet
            updates as the Concierge experience opens.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/subscribe"
              className="rounded-full bg-nfe-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-paper"
            >
              Join Founder Access
            </Link>
            <Link
              href="/ritual"
              className="rounded-full border border-nfe-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-gold transition-colors hover:bg-nfe-gold hover:text-nfe-green-900"
            >
              Explore the Ritual
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-nfe-green-100 px-6 py-10 md:px-12">
        <p className="mx-auto max-w-4xl text-center text-sm leading-6 text-nfe-muted">
          NFE Concierge provides cosmetic skincare guidance only. It does not
          diagnose, treat, cure, or prevent medical conditions. For persistent
          or complex skin concerns, consult a licensed professional.
        </p>
      </section>
    </div>
  )
}
