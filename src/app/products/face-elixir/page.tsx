import { notFound } from 'next/navigation';
import FaceElixirHero from '@/components/products/FaceElixirHero';
import { ProductAccordion } from '@/components/products/ProductAccordion';
import FaceElixirFAQ, { faceElixirFaqItems } from '@/components/products/face-elixir/FaceElixirFAQ';
import WaitlistModal from '@/components/shared/WaitlistModal';
import { productData } from '@/content/products/registry';
import type { Product } from '@/types/products';

// Force dynamic rendering for Cloudflare Workers compatibility
export const dynamic = 'force-dynamic';

async function getFaceElixirProduct(): Promise<Product | null> {
  try {
    const loader = productData['face-elixir'];
    const mod = await loader();
    return mod.default as Product;
  } catch (error) {
    console.error('Error loading face-elixir product:', error);
    return null;
  }
}

export default async function FaceElixirPage() {
  const product = await getFaceElixirProduct();

  if (!product) {
    notFound();
  }

  return (
    <>
      <WaitlistModal />
      <FaceElixirHero />

      <section className="bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto">
          <ProductAccordion
            details={product.details}
            benefits={product.benefits}
            usage={product.usage}
            ingredients={product.ingredients_inci}
            textureScentExperience={product.texture_scent_experience}
            faqContent={<FaceElixirFAQ variant="embedded" />}
          />
        </div>
      </section>
    </>
  );
}

