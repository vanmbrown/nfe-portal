import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import type { Product } from '@/types/products';

// Fetch product data
async function getProducts() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products', 'index.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const productsData = JSON.parse(fileContents);
    return productsData.products || [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Shop the NFE Ritual | NFE Beauty',
  description: 'Explore our collection of restorative elixirs designed to nourish, strengthen, and illuminate melanated skin.',
};

export default async function ShopPage() {
  const products = await getProducts();

  // Map product status to display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available Now';
      case 'coming_soon':
        return 'Waitlist Open';
      case 'future_release':
        return 'Coming Soon';
      default:
        return 'Coming Soon';
    }
  };

  // Get description from product data
  const getDescription = (product: { slug?: string; short_description?: string }) => {
    if (product.slug === 'face-elixir') {
      return 'A luminous, restorative emulsion that hydrates, firms, and softens the look of uneven tone — formulated for mature, melanated skin.';
    } else if (product.slug === 'body-elixir') {
      return 'A rich yet fast-absorbing elixir that restores suppleness and glow to dry, crepey skin — your daily ritual for head-to-toe hydration.';
    }
    return product.short_description || '';
  };

  return (
    <section className="bg-[#FAF9F6] text-[#0F2C1C] min-h-screen">
      {/* Header */}
      <div className="text-center py-20 bg-[#0F2C1C] text-[#D4AF37] px-6">
        <h1 className="font-serif text-4xl md:text-5xl mb-2">Shop the NFE Ritual</h1>
        <p className="text-[#FAF9F6]/80 max-w-xl mx-auto text-base md:text-lg">
          Explore our collection of restorative elixirs designed to nourish,
          strengthen, and illuminate melanated skin.
        </p>
      </div>

      {/* Product Cards */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        {products.map((product: Product) => {
          const statusText = getStatusText(product.status);
          const description = getDescription(product);
          const isAvailable = product.status === 'available';
          const isComingSoon = product.status === 'coming_soon';
          const isDisabled = product.status === 'future_release';

          return (
            <div
              key={product.slug}
              className="bg-[#113528] text-[#FAF9F6] rounded-2xl shadow-lg p-8 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
            >
              <div>
                <div className="w-full h-72 mb-6 flex items-center justify-center bg-[#0F2C1C] rounded-lg overflow-hidden">
                  {product.hero_image ? (
                    <Image
                      src={product.hero_image}
                      alt={product.title}
                      width={300}
                      height={300}
                      className="w-auto h-full object-contain"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#FAF9F6]/40">
                      <span className="text-lg">{product.title}</span>
                    </div>
                  )}
                </div>
                <h2 className="font-serif text-2xl md:text-3xl mb-4">{product.title}</h2>
                <p className="text-[#FAF9F6]/80 mb-6 leading-relaxed">{description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#FAF9F6]/20">
                <span className="text-sm uppercase tracking-wide text-[#D4AF37] font-medium">
                  {statusText}
                </span>
                {isDisabled ? (
                  <button
                    disabled
                    className="rounded-full px-5 py-2 text-sm font-semibold bg-[#D4AF37]/40 text-[#0F2C1C]/60 cursor-not-allowed transition"
                    aria-label={`${product.title} coming soon`}
                  >
                    Coming Soon
                  </button>
                ) : (
                  <Link
                    href={`/products/${product.slug}`}
                    className="rounded-full px-5 py-2 text-sm font-semibold bg-[#D4AF37] hover:bg-[#C6A032] text-[#0F2C1C] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-[#113528] min-h-[44px] flex items-center justify-center"
                  >
                    {isComingSoon ? 'Join Waitlist' : 'Discover More'}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
