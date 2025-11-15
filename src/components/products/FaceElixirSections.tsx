'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/types/products';
import { sanitizeHTML } from '@/lib/utils/sanitize';

interface FaceElixirSectionsProps {
  product: Product;
}

type SectionId = 'details' | 'benefits' | 'usage' | 'ingredients' | 'faq';

export default function FaceElixirSections({ product }: FaceElixirSectionsProps) {
  const [openSection, setOpenSection] = useState<SectionId | null>(null);

  const toggleSection = (sectionId: SectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  const FAQContent = () => {
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
        a: "Yes, Face Elixir layers beautifully under sunscreen and retinol. Apply the elixir first, allow it to absorb (about 2 minutes), then layer your treatment or SPF."
      },
      {
        q: "How long will a 30 ml or 50 ml bottle of the Face Elixir last?",
        a: "Each pump dispenses about 0.20 ml of product. When used 1–2 pumps twice daily, a bottle typically lasts:",
        isHtml: true,
        htmlContent: (
          <>
            <p className="mb-3">
              Each pump dispenses about <strong className="text-[#0F2C1C]">0.20 ml</strong> of product. When used <strong className="text-[#0F2C1C]">1–2 pumps twice daily</strong>, a bottle typically lasts:
            </p>
            <ul className="list-disc ml-6 mb-3 space-y-2">
              <li>
                <strong className="text-[#0F2C1C]">30 ml bottle:</strong> approximately <strong className="text-[#0F2C1C]">1–3 months</strong> (31–94 days, average ~75 days)
              </li>
              <li>
                <strong className="text-[#0F2C1C]">50 ml bottle:</strong> approximately <strong className="text-[#0F2C1C]">2–4 months</strong> (52–156 days, average ~125 days)
              </li>
            </ul>
            <p>
              Actual duration may vary slightly depending on your daily pump amount and skin needs.
            </p>
          </>
        )
      }
    ];

    return (
      <div className="space-y-4">
        {faq.map((item, i) => (
          <details key={i} className="border border-neutral-300 rounded-xl p-4 md:p-6 hover:border-[#D4AF37]/50 transition-colors group">
            <summary className="font-serif text-lg md:text-xl cursor-pointer list-none flex justify-between items-center min-h-[44px]">
              <span className="pr-4">{item.q}</span>
              <span className="text-[#D4AF37] text-xl font-light flex-shrink-0 group-open:hidden">+</span>
              <span className="text-[#D4AF37] text-xl font-light flex-shrink-0 hidden group-open:inline">−</span>
            </summary>
            {item.isHtml ? (
              <div className="mt-4 text-sm md:text-base leading-relaxed text-[#0F2C1C]">
                {item.htmlContent}
              </div>
            ) : (
              <p className="mt-4 text-sm md:text-base leading-relaxed text-[#0F2C1C]">
                {item.a}
              </p>
            )}
          </details>
        ))}
        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t border-neutral-300">
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
      </div>
    );
  };

  const sections: {
    id: SectionId;
    title: string;
    content: string | React.ReactNode;
  }[] = [
    {
      id: 'details',
      title: 'Details',
      content: product.details || 'Product details coming soon.'
    },
    {
      id: 'benefits',
      title: 'Benefits',
      content: product.benefits || 'Product benefits coming soon.'
    },
    {
      id: 'usage',
      title: 'Usage',
      content: product.usage || 'Usage instructions coming soon.'
    },
    {
      id: 'ingredients',
      title: 'Ingredients',
      content: product.ingredients_inci || 'Ingredient list coming soon.'
    },
    {
      id: 'faq',
      title: 'FAQ',
      content: <FAQContent />
    }
  ];

  return (
    <>
      {/* Expandable Sections */}
      <section className="bg-[#FAF9F6] text-[#0F2C1C] py-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {sections.map((section) => {
            const isOpen = openSection === section.id;

            return (
              <div
                key={section.id}
                className="border-b border-neutral-300 last:border-b-0"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`
                    flex justify-between items-center w-full py-4 text-left
                    font-serif text-lg md:text-xl
                    transition-colors duration-200
                    hover:text-[#D4AF37]
                    focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#FAF9F6] rounded-sm
                    ${isOpen ? 'text-[#D4AF37]' : 'text-[#0F2C1C]'}
                  `}
                  aria-expanded={isOpen}
                  aria-controls={`accordion-content-${section.id}`}
                >
                  <span>{section.title}</span>
                  <span className="ml-4 text-xl font-light">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`accordion-content-${section.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className="pb-4 prose prose-sm max-w-none
                          prose-headings:font-serif prose-headings:text-[#0F2C1C]
                          prose-p:text-[#0F2C1C] prose-p:leading-relaxed prose-p:mb-4
                          prose-strong:text-[#0F2C1C] prose-strong:font-semibold
                          prose-ul:text-[#0F2C1C] prose-ul:my-4
                          prose-li:text-[#0F2C1C] prose-li:leading-relaxed
                          prose-a:text-[#0F2C1C] prose-a:underline prose-a:decoration-[#D4AF37] prose-a:underline-offset-2
                          prose-a:hover:text-[#2A4C44]
                          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3 prose-h3:font-serif"
                      >
                        {typeof section.content === 'string' ? (
                          <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(section.content) }} />
                        ) : (
                          section.content
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Texture / Scent / Experience */}
      {product.texture_scent_experience && (
        <section className="bg-white py-16 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-serif text-center mb-8 text-[#0F2C1C]">
              Texture, Scent & Experience
            </h2>
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-[#0F2C1C]
                prose-p:text-[#0F2C1C] prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-[#0F2C1C] prose-strong:font-semibold
                prose-ul:text-[#0F2C1C] prose-ul:my-4
                prose-li:text-[#0F2C1C] prose-li:leading-relaxed
                prose-a:text-[#0F2C1C] prose-a:underline prose-a:decoration-[#D4AF37] prose-a:underline-offset-2
                prose-a:hover:text-[#2A4C44]"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(product.texture_scent_experience) }}
            />
          </div>
        </section>
      )}
    </>
  );
}
