import type { Metadata } from 'next';
import WaitlistModal from '@/components/shared/WaitlistModal';
import ShopCard from './ShopCard';

export const metadata: Metadata = {
  title: 'Shop the NFE Ritual | NFE Beauty',
  description: 'Explore our collection of restorative elixirs designed to nourish, strengthen, and illuminate melanated skin.',
};

export default function ShopPage() {
  return (
    <>
      <WaitlistModal />

      <section className="min-h-screen bg-green-950 pt-28 pb-20">
        <div className="container mx-auto px-6">
          <h1 className="text-center text-4xl md:text-5xl font-serif text-[#D4AF37] mb-6">
            Discover the NFE Ritual
          </h1>
          <p className="text-center text-white/80 max-w-2xl mx-auto mb-12">
            Explore our collection of restorative elixirs designed to nourish, strengthen, and illuminate melanated skin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <ShopCard
              title="Face Elixir"
              description="A luminous restorative emulsion for mature, melanated skin."
              status="Waitlist Open"
              waitlist
              imageSrc="/images/products/NFE_face_elixir_30_50_proportions_fixed.png"
              imageAlt="NFE Face Elixir Bottles"
            />

            <ShopCard
              title="Body Elixir"
              description="A rich yet fast-absorbing elixir that restores suppleness and glow to dry, crepey skin."
              status="In Development"
              waitlist={false}
              imageSrc="/images/products/body-elixir-detail.jpg"
              imageAlt="Body Elixir"
            />
          </div>
        </div>
      </section>
    </>
  );
}
