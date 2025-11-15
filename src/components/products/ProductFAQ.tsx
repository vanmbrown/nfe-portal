'use client';

import React from 'react';

const faq = [
  {
    q: "Can the Face Elixir replace my moisturizer?",
    a: "Yes — for most skin types, the elixir provides sufficient hydration and barrier support. If your skin is very dry, layer beneath a lightweight cream."
  },
  {
    q: "Is the formula safe for sensitive or acne-prone skin?",
    a: "Yes. No added synthetic fragrance or harsh actives. Every ingredient serves a functional purpose to support balance — suitable even for reactive skin."
  },
  {
    q: "Does the formula contain essential oils?",
    a: "Yes, in trace amounts — Blue Tansy and Helichrysum essential oils for skin-calming and restorative benefits, not for scent. No synthetic fragrance added."
  },
  {
    q: "Why is the elixir amber-colored?",
    a: "The warm hue reflects concentrated botanicals and antioxidants — no dyes or colorants."
  },
  {
    q: "Can I use this with sunscreen or retinol?",
    a: "Yes. It layers beautifully under SPF and alongside retinoids to reduce dryness and maintain barrier integrity."
  }
];

export function ProductFAQ() {
  return (
    <section className="bg-[#FAF9F6] text-[#0F2C1C] py-16 px-4 md:px-6">
      <h2 className="text-2xl md:text-3xl font-serif text-center mb-8 md:mb-12">FAQ — The Face Elixir</h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faq.map((item, i) => (
          <details
            key={i}
            className="border border-neutral-300 rounded-xl p-4 md:p-6 hover:border-[#D4AF37]/50 transition-colors group"
          >
            <summary className="font-serif text-lg md:text-xl cursor-pointer list-none flex justify-between items-center min-h-[44px]">
              <span className="pr-4">{item.q}</span>
              <span className="text-[#D4AF37] text-xl font-light flex-shrink-0 group-open:hidden">+</span>
              <span className="text-[#D4AF37] text-xl font-light flex-shrink-0 hidden group-open:inline">−</span>
            </summary>
            <p className="mt-4 text-sm md:text-base leading-relaxed text-[#0F2C1C]">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      {/* Contact Support */}
      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-neutral-300">
        <div className="text-center">
          <p className="text-center text-sm md:text-base text-neutral-700 mb-6">
            Still have questions? Our team is here to help you find the perfect NFE ritual.
          </p>
          <div className="flex justify-center">
            <a
              href="mailto:vanessa@nfebeauty.com?subject=NFE%20Support%20Request"
              className="inline-flex items-center justify-center border border-[#0F2C1C] text-[#0F2C1C] px-6 py-2 rounded-full hover:bg-[#0F2C1C] hover:text-white transition font-medium min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#0F2C1C] focus:ring-offset-2"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
