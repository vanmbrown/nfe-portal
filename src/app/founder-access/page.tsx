import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Founder Access | NFE Beauty',
  description:
    'Join NFE Founder Access for private notes, launch updates, and early ritual invitations.',
}

const accessIncludes = [
  'Founder notes on the NFE point of view for mature, melanated skin.',
  'Launch updates for Face Elixir, Body Elixir, and the Discovery Ritual.',
  'Invitations to share structured feedback when customer proof pathways open.',
]

export default function FounderAccessPage() {
  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-[#efe4d5] px-6 py-24 text-center md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#7a4f22]">
          Founder Access
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-green-900 md:text-6xl">
          Private Notes Before the Ritual Fully Opens
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-muted md:text-xl">
          Founder Access is NFE&apos;s quiet entry point for people who want to
          follow the development chapter, understand the philosophy, and receive
          launch updates without marketing pressure.
        </p>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              What Founder Access Includes
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              A measured path into the maison.
            </h2>
          </div>
          <ul className="grid gap-4">
            {accessIncludes.map((item) => (
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
        <div className="mx-auto max-w-4xl rounded-3xl bg-nfe-green-900 p-8 text-center text-nfe-paper md:p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            Current Capture Path
          </p>
          <h2 className="font-serif text-3xl text-nfe-gold md:text-4xl">
            Email only, with consent.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-nfe-paper/85">
            Full segmentation is not active yet. For now, Founder Access uses
            the existing private list signup, which collects only your email and
            links to the privacy policy.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/subscribe"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-paper"
            >
              Join the Private List
            </Link>
            <Link
              href="/skin-ritual-quiz"
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-nfe-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-gold transition-colors hover:bg-nfe-gold hover:text-nfe-green-900"
            >
              Preview the Quiz
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
