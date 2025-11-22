import React from 'react';
import { notFound } from 'next/navigation';
import { ProductPageClient } from './ProductPageClient';
import type { Product } from '@/types/products';
import fs from 'fs';
import path from 'path';

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products', 'index.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const productsData = JSON.parse(fileContents);
    const products = productsData.products;
    return products.map((product: { slug: string }) => ({
      slug: product.slug,
    }));
  } catch (error) {
    return [];
  }
}

// Fetch product data
async function getProduct(slug: string): Promise<Product | null> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products', `${slug}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents) as Product;
  } catch (error) {
    console.error('Error loading product:', error);
    return null;
  }
}

// Get all products for related product lookup
async function getAllProducts() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products', 'index.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const productsData = JSON.parse(fileContents);
    return productsData.products || [];
  } catch (error) {
    return [];
  }
}

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);

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

