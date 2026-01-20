import React from 'react';
import { notFound } from 'next/navigation';
import { ProductPageClient } from './ProductPageClient';
import type { Product } from '@/types/products';
import { productData, productsIndex, type ProductSlug } from '@/content/products/registry';

// Force dynamic rendering for Cloudflare Workers compatibility
export const dynamic = 'force-dynamic';

// Fetch product data using static imports
async function getProduct(slug: string): Promise<Product | null> {
  try {
    const loader = productData[slug as ProductSlug];
    if (!loader) {
      return null;
    }
    const mod = await loader();
    return mod.default as Product;
  } catch (error) {
    console.error('Error loading product:', error);
    return null;
  }
}

// Get all products for related product lookup
async function getAllProducts() {
  try {
    const mod = await productsIndex();
    const productsData = mod.default as { products: Array<{ slug: string }> };
    return productsData.products || [];
  } catch (error) {
    console.error('Error loading products index:', error);
    return [];
  }
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Get related product data if exists
  let relatedProduct = null;
  if (product.related_product) {
    const related = await getProduct(product.related_product);
    if (related) {
      relatedProduct = {
        slug: related.slug,
        title: related.title,
        shortDescription: related.short_description,
        heroImage: related.hero_image,
      };
    }
  }

  return (
    <ProductPageClient
      product={product}
      relatedProduct={relatedProduct}
    />
  );
}

