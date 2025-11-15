'use client';

import dynamic from 'next/dynamic';
import React, { useEffect } from 'react';
import content from '@/content/skin-strategy.json';
import { trackPageView } from '@/lib/analytics';

const NFESkinLayersMap = dynamic(() => import('@/components/nfe/NFESkinLayersMap'), { ssr: false });
const NFEMelanocyteMap = dynamic(() => import('@/components/nfe/NFEMelanocyteMap'), { ssr: false });

export default function SkinStrategyPage() {
  useEffect(() => {
    trackPageView('/skin-strategy', 'Skin Strategy');
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-primary font-bold text-nfe-green mb-6">Skin Strategy</h1>

      <div className="mb-8">
        <p className="text-nfe-muted">Explore skin layers and melanocyte distribution. Use search and filters to explore actives.</p>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-primary font-bold text-nfe-green mb-4">Skin Layers Map</h2>
          <NFESkinLayersMap />
        </section>
        <section>
          <h2 className="text-2xl font-primary font-bold text-nfe-green mb-4">Melanocyte Map</h2>
          <NFEMelanocyteMap />
        </section>
      </div>
    </div>
  );
}


