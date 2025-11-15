'use client';

import React from 'react';
import NFEMelanocyteMapInteractive from '@/components/interactive/NFEMelanocyteMap';

export default function NFEMelanocyteMap({ ingredients, loading }: { ingredients?: any[], loading?: boolean }) {
  // This component acts as a client-side wrapper for the base interactive map
  // Pass through ingredients and loading props to the base component
  return <NFEMelanocyteMapInteractive ingredients={ingredients} loading={loading} />;
}
