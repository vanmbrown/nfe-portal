'use client';

import React, { useEffect } from 'react';
import { Metadata } from 'next';
import { FadeIn, ScrollReveal } from '@/components/motion';
import { 
  ProductHero, IngredientList, BenefitsTable, 
  UsageGuide, ProductFAQ 
} from '@/components/products';
import { trackPageView, trackCTAClick, trackProductView } from '@/lib/analytics';
import { faceElixirData } from '@/content/products/face-elixir';

export default function FaceElixirPage() {
  useEffect(() => {
    trackPageView('/products/face-elixir', faceElixirData.seo.title);
    trackProductView(faceElixirData.id, faceElixirData.name);
  }, []);

  const handleAddToCart = () => {
    trackCTAClick('Add to Cart', 'Face Elixir Product Page');
    // TODO: Implement add to cart functionality
  };

  const handleAddToWishlist = () => {
    trackCTAClick('Add to Wishlist', 'Face Elixir Product Page');
    // TODO: Implement add to wishlist functionality
  };

  const handleShare = () => {
    trackCTAClick('Share Product', 'Face Elixir Product Page');
    // TODO: Implement share functionality
  };

  return (
    <div className="min-h-screen">
      {/* Product Hero */}
      <ProductHero 
        product={faceElixirData}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        onShare={handleShare}
      />

      {/* Ingredient List */}
      <IngredientList product={faceElixirData} />

      {/* Benefits Table */}
      <BenefitsTable product={faceElixirData} />

      {/* Usage Guide */}
      <UsageGuide product={faceElixirData} />

      {/* FAQ */}
      <ProductFAQ product={faceElixirData} />
    </div>
  );
}

// Note: In Next.js 14.2.0, metadata should be exported from a separate file
// or handled differently. For now, we'll add it to the layout or handle it in the parent layout.
