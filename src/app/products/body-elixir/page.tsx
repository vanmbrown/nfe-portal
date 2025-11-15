'use client';

import React, { useEffect } from 'react';
import { Metadata } from 'next';
import { FadeIn, ScrollReveal } from '@/components/motion';
import { 
  ProductHero, IngredientList, BenefitsTable, 
  UsageGuide, ProductFAQ 
} from '@/components/products';
import { trackPageView, trackCTAClick, trackProductView } from '@/lib/analytics';
import { bodyElixirData } from '@/content/products/body-elixir';

export default function BodyElixirPage() {
  useEffect(() => {
    trackPageView('/products/body-elixir', bodyElixirData.seo.title);
    trackProductView(bodyElixirData.id, bodyElixirData.name);
  }, []);

  const handleAddToCart = () => {
    trackCTAClick('Add to Cart', 'Body Elixir Product Page');
    // TODO: Implement add to cart functionality
  };

  const handleAddToWishlist = () => {
    trackCTAClick('Add to Wishlist', 'Body Elixir Product Page');
    // TODO: Implement add to wishlist functionality
  };

  const handleShare = () => {
    trackCTAClick('Share Product', 'Body Elixir Product Page');
    // TODO: Implement share functionality
  };

  return (
    <div className="min-h-screen">
      {/* Product Hero */}
      <ProductHero 
        title={bodyElixirData.name}
        shortDescription={bodyElixirData.shortDescription}
        heroImage={bodyElixirData.images?.[0]?.src || '/images/products/body-elixir-hero.jpg'}
        ctaLabel="Coming Soon"
        status="future_release"
        onCtaClick={() => {/* TODO: Open waitlist modal */}}
      />

      {/* Ingredient List */}
      <IngredientList product={bodyElixirData} />

      {/* Benefits Table */}
      <BenefitsTable product={bodyElixirData} />

      {/* Usage Guide */}
      <UsageGuide product={bodyElixirData} />

      {/* FAQ */}
      <ProductFAQ />
    </div>
  );
}

// Note: In Next.js 14.2.0, metadata should be exported from a separate file
// or handled differently. For now, we'll add it to the layout or handle it in the parent layout.
