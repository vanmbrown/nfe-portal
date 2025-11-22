import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import FaceElixirHero from '@/components/products/FaceElixirHero';
import { ProductAccordion } from '@/components/products/ProductAccordion';
import FaceElixirFAQ, { faceElixirFaqItems } from '@/components/products/face-elixir/FaceElixirFAQ';
import WaitlistModal from '@/components/shared/WaitlistModal';

async function getFaceElixirProduct() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'products', 'face-elixir.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
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

