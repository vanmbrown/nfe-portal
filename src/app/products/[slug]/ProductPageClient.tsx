'use client';

import React, { useState } from 'react';
import { ProductHero } from '@/components/products/ProductHero';
import { ProductAccordion } from '@/components/products/ProductAccordion';
import { RitualPairing } from '@/components/products/RitualPairing';
import { WaitlistModal } from '@/components/products/WaitlistModal';
import type { Product } from '@/types/products';

interface ProductPageClientProps {
  product: Product;
  relatedProduct: {
    slug: string;
    title: string;
    shortDescription: string;
    heroImage: string;
  } | null;
}

export function ProductPageClient({ product, relatedProduct }: ProductPageClientProps) {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  const handleCtaClick = () => {
    if (product.status === 'coming_soon') {
      setIsWaitlistOpen(true);
    } else if (product.status === 'available' && product.cta_link) {
      window.location.href = product.cta_link;
    }
    // future_release status: button is disabled, no action
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ProductHero
        title={product.title}
        shortDescription={product.short_description}
        heroImage={product.hero_image}
        ctaLabel={product.cta_label}
        status={product.status}
        onCtaClick={handleCtaClick}
      />

      {/* Expandable Product Information */}
      <ProductAccordion
        details={product.details}
        benefits={product.benefits}
        usage={product.usage}
        ingredients={product.ingredients_inci}
        textureScentExperience={product.texture_scent_experience}
        faq={[
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
            a: "Each pump dispenses about 0.20 ml of product. When used 1–2 pumps twice daily, a bottle typically lasts: 30 ml bottle: approximately 1–3 months (31–94 days, average ~75 days). 50 ml bottle: approximately 2–4 months (52–156 days, average ~125 days). Actual duration may vary slightly depending on your daily pump amount and skin needs."
          }
        ]}
      />

      {/* The Ritual Pairing */}
      {relatedProduct && <RitualPairing relatedProduct={relatedProduct} />}

      {/* Footer CTA (Conditional) */}
      {product.status === 'coming_soon' && (
        <section className="w-full bg-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <button
              onClick={() => setIsWaitlistOpen(true)}
              className="px-8 py-4 border-2 border-[#D4AF37] text-[#D4AF37] rounded-full font-medium hover:bg-[#D4AF37] hover:text-[#0F2C1C] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
            >
              Join Waitlist
            </button>
          </div>
        </section>
      )}

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        productTitle={product.title}
      />
    </div>
  );
}

