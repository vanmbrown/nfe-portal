import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ProductMetadata } from '@/types/products';
import fs from 'fs';
import path from 'path';

interface ProductLayoutProps {
  params: {
    slug: string;
  };
  children: React.ReactNode;
}

async function getProductMetadata(slug: string): Promise<ProductMetadata | null> {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products', 'index.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const productsData = JSON.parse(fileContents);
    const products: ProductMetadata[] = productsData.products;
    return products.find((product) => product.slug === slug) || null;
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const product = await getProductMetadata(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const title = product.seo_title || product.title;
  const description = product.seo_description || product.short_description;

  return {
    title: title.includes('|') ? title : `${title} | NFE Beauty`,
    description,
    openGraph: {
      title: product.title,
      description: product.short_description,
      type: 'website',
      images: [
        {
          url: product.hero_image,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.short_description,
      images: [product.hero_image],
    },
  };
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>;
}

