'use client'

import { useState, type ReactNode } from 'react'
import clsx from 'clsx'

export type ElixirFaqItem = { q: string; a: ReactNode }

export function ElixirFAQ({
  title,
  items,
}: {
  title: string
  items: ElixirFaqItem[]
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
          FAQ
        </p>
        <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
          {title}
        </h2>
        <div className="mt-8 divide-y divide-nfe-green-900/10">
          {items.map((item, index) => (
            <div key={item.q}>
              <button
                type="button"
                onClick={() =>
                  setOpenIndex((prev) => (prev === index ? null : index))
                }
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-medium text-nfe-green-900">{item.q}</span>
                <span className="text-xl text-nfe-gold">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index ? (
                <div className="pb-6 leading-7 text-nfe-ink/72">{item.a}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const bodyElixirFaqItems: ElixirFaqItem[] = [
  {
    q: 'Can Body Elixir replace body lotion?',
    a: 'For many routines, yes. It is designed as a complete body emulsion rather than a thin lotion layer. Very dry skin may still prefer a second layer on elbows, knees, or heels.',
  },
  {
    q: 'Will it feel greasy on larger skin areas?',
    a: 'The formula is intended to spread across the body and absorb without a heavy residue. The finish should feel supple, not slick.',
  },
  {
    q: 'When should I apply it?',
    a: 'Apply after bathing while skin is still slightly damp to support hydration and barrier comfort. It can also be used as a targeted second layer on extra-dry areas.',
  },
  {
    q: 'Is Body Elixir available to order yet?',
    a: 'Not yet. Body Elixir remains in development. Founder Access is the primary path for launch updates while checkout stays inactive.',
  },
  {
    q: 'Can I use it with Face Elixir?',
    a: 'Yes. The two elixirs are designed as a restrained full ritual: face and body care with the same formulation philosophy.',
  },
]
