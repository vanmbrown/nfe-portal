'use client';

import React from 'react';
import { ProductHero } from '@/components/products/ProductHero';
import { ProductAccordion } from '@/components/products/ProductAccordion';
import { RitualPairing } from '@/components/products/RitualPairing';
import type { Product } from '@/types/products';
import FaceElixirFAQ, { faceElixirFaqItems } from '@/components/products/face-elixir/FaceElixirFAQ';
import { useWaitlistStore } from '@/store/useWaitlistStore';

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
  const isFaceElixir = product.slug === 'face-elixir';
  const { open } = useWaitlistStore();

  const handleCtaClick = () => {
    if (product.status === 'available' && product.cta_link) {
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
        ctaSlot={
          product.status === 'coming_soon'
            ? (
                <button
                  type="button"
                  onClick={open}
                  className="border border-[#D4AF37] text-[#D4AF37] px-6 py-2 rounded-full hover:bg-[#D4AF37] hover:text-[#0F2C1C] transition focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#0F2C1C]"
                >
                  {product.cta_label}
                </button>
              )
            : undefined
        }
      />

      {/* Expandable Product Information */}
      <ProductAccordion
        details={product.details}
        benefits={product.benefits}
        usage={product.usage}
        ingredients={product.ingredients_inci}
        textureScentExperience={product.texture_scent_experience}
        faq={isFaceElixir ? undefined : undefined}
        faqContent={isFaceElixir ? <FaceElixirFAQ variant="embedded" /> : undefined}
      />

      {/* The Ritual Pairing */}
      {relatedProduct && <RitualPairing relatedProduct={relatedProduct} />}

      {/* Footer CTA (Conditional) */}
      {product.status === 'coming_soon' && (
        <section className="w-full bg-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <button
              type="button"
              onClick={open}
              className="px-8 py-4 border-2 border-[#D4AF37] text-[#D4AF37] rounded-full font-medium hover:bg-[#D4AF37] hover:text-[#0F2C1C] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2"
            >
              Join Waitlist
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

