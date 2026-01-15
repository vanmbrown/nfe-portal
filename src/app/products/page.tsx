'use client';

import ProductCard from '@/components/products/ProductCard';
import WaitlistModal from '@/components/shared/WaitlistModal';

export default function ProductsPage() {
  return (
    <>
      <WaitlistModal />

      <section className="min-h-screen bg-green-950 pt-28 pb-20">
        <div className="container mx-auto px-6">
          <h1 className="text-center text-3xl md:text-4xl font-serif text-[#D4AF37] mb-16">
            Two elixirs designed to work together — nourishing your skin from face to body.
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <ProductCard
              title="Face Elixir"
              description="A luminous restorative emulsion that hydrates, firms, and softens uneven tone — formulated for mature, melanated skin."
              badge="Waitlist Open"
              waitlist={true}
              imageSrc="/images/products/NFE_face_elixir_30_50_proportions_fixed.png"
              imageAlt="NFE Face Elixir Product Bottles"
            />

            <ProductCard
              title="Body Elixir"
              description="A rich yet fast-absorbing elixir that restores suppleness and glow to dry, crepey skin — your daily ritual for head-to-toe hydration."
              badge="In Development"
              waitlist={false}
              href={null}
              showImage={true}
              imageSrc="/images/products/radiant-body-elixir-white.png"
              imageAlt="Radiant Body Elixir Bottle"
            />
          </div>
        </div>
      </section>
    </>
  );
}
