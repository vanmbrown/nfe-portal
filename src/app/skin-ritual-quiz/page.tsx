import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Skin Ritual Quiz | NFE Beauty',
  description:
    'Preview the NFE Skin Ritual Quiz for mature, melanated skin and join Founder Access for launch updates.',
}

const quizHelps = [
  'Clarify whether dryness, barrier stress, texture, tone, or radiance loss is the primary ritual priority.',
  'Guide visitors toward Face Elixir, Body Elixir, Discovery Ritual, or Founder Access as the next best step.',
  'Collect better context in a later phase without making the public experience feel mechanical.',
]

export default function SkinRitualQuizPage() {
  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          Skin Ritual Quiz
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          A Future Guide for Choosing with More Confidence
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          The full Skin Ritual Quiz is planned for a later phase. For now, this
          page introduces the experience and offers a supported Founder Access
          path for early updates.
        </p>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              What the Quiz Will Help With
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              Fit before purchase.
            </h2>
          </div>
          <ul className="grid gap-4">
            {quizHelps.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-nfe-green-100 bg-white p-5 leading-7 text-nfe-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Early Access
          </p>
          <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
            The full quiz logic is not live yet.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-nfe-muted">
            Join Founder Access to receive updates when the quiz, Discovery
            Ritual, and fuller ritual guidance are ready. No new form fields are
            collected here in Phase 2.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/founder-access"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700"
            >
              Join Founder Access
            </Link>
            <Link
              href="/ritual"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper"
            >
              Read the Ritual
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
