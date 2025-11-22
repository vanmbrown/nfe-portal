'use client';

import { useState, type ReactNode } from 'react';
import clsx from 'clsx';

export const faceElixirFaqItems: Array<{ q: string; a: ReactNode }> = [
  {
    q: 'Can the Face Elixir replace my moisturizer?',
    a: 'Yes — for most skin types, the elixir provides sufficient hydration and barrier support. If your skin is very dry, layer beneath a lightweight cream.',
  },
  {
    q: 'Is the formula safe for sensitive or acne-prone skin?',
    a: 'Yes. No added synthetic fragrance or harsh actives. Every ingredient supports balance — suitable even for reactive skin.',
  },
  {
    q: 'Does the formula contain essential oils?',
    a: 'Yes, in trace amounts — Blue Tansy and Helichrysum essential oils for skin-calming and restorative benefits, not for scent.',
  },
  {
    q: 'Why is the elixir amber-colored?',
    a: 'The warm hue reflects concentrated botanicals and antioxidants — no dyes or colorants.',
  },
  {
    q: 'Can I use this with sunscreen or retinol?',
    a: (
      <div className="space-y-3">
        <p>Yes — but the order and timing matter.</p>
        <p>
          <strong>With retinol (evening):</strong> Apply retinol first to clean, dry skin. Allow it to absorb for 20–30 minutes, then follow with the Face Elixir to support hydration and barrier comfort.
        </p>
        <p>
          <strong>With sunscreen (morning):</strong> After cleansing, apply the Face Elixir to slightly damp skin for best absorption. Allow it to absorb for 2–3 minutes, then apply your broad-spectrum SPF as the final step.
        </p>
      </div>
    ),
  },
  {
    q: 'How long will a 30 ml or 50 ml bottle last?',
    a: 'Each pump dispenses ~0.20 ml. 1–2 pumps per use typically lasts ~1–3 months for 30 ml and ~3–5 months for 50 ml depending on usage.',
  },
];

type FaceElixirFAQProps = {
  variant?: 'standalone' | 'embedded';
};

export default function FaceElixirFAQ({ variant = 'standalone' }: FaceElixirFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  const Container = variant === 'standalone' ? 'section' : 'div';

  return (
    <Container
      className={clsx(
        variant === 'standalone' && 'max-w-3xl mx-auto px-4 pt-12 pb-20'
      )}
    >
      {variant === 'standalone' && (
        <h2 className="font-serif mb-6 text-center text-2xl text-green-900">
          FAQ — The Face Elixir
        </h2>
      )}

      <div className="divide-y divide-gray-300">
        {faceElixirFaqItems.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => toggleFAQ(i)}
              className="w-full text-left py-5 flex justify-between items-center"
            >
              <span className={clsx(
                'font-medium',
                variant === 'standalone' ? 'text-green-900' : 'text-[#0F2C1C]'
              )}>
                {item.q}
              </span>
              <span className={clsx(
                'text-xl',
                variant === 'standalone' ? 'text-green-700' : 'text-[#D4AF37]'
              )}>
                {openIndex === i ? '−' : '+'}
              </span>
            </button>

            {openIndex === i && (
              <div
                className={clsx(
                  'pb-6 leading-relaxed',
                  variant === 'standalone' ? 'text-green-800' : 'text-[#0F2C1C]'
                )}
              >
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </Container>
  );
}

