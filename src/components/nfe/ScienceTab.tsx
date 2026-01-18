// src/components/nfe/ScienceTab.tsx

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ScienceProvider, useScience } from '@/context/ScienceContext';
import ActiveIngredientIndex from './ActiveIngredientIndex';

// Lazy load heavy map components - only load when needed
const NFEMelanocyteMap = dynamic(() => import('./NFEMelanocyteMap'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px] bg-[#0B291E] rounded-lg">
      <p className="text-[#FDFCF8]">Loading map...</p>
    </div>
  ),
  ssr: false, // Client-side only - these are interactive components
});

const NFESkinLayersMap = dynamic(() => import('./NFESkinLayersMap'), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px] bg-[#0B291E] rounded-lg">
      <p className="text-[#FDFCF8]">Loading map...</p>
    </div>
  ),
  ssr: false, // Client-side only - these are interactive components
});
// import { Dropdown } from '@/components/ui/Dropdown';
import { fetchFilteredIngredients } from '@/lib/api';
import { filterActivesBySelection, initializeActives } from '@/lib/actives';

const SKIN_TYPES = ['normal', 'dry', 'combination', 'sensitive'];
const SKIN_CONCERNS = [
  'dark_spots',
  'dryness_barrier',
  'fine_lines',
  'firmness',
  'sensitivity_redness',
  'texture_pores',
  'tone_glow',
  'uneven_skin_tone',
];

function ScienceTabContent() {
  const {
    skinType,
    setSkinType,
    concerns,
    setConcerns,
    setFilteredActives,
    clearCategories,
  } = useScience();
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!skinType || concerns.length === 0) {
      return;
    }
    setLoading(true);
    setSubmitted(true);
    clearCategories(); // Clear category filters when new search is made
    
    try {
      // Load all actives and filter by selection
      const allActives = await initializeActives();
      const filtered = filterActivesBySelection(allActives, skinType, concerns);
      
      setFilteredActives(filtered);
    } catch (error) {
      console.error('Error loading actives:', error);
      setFilteredActives([]);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = skinType && concerns.length > 0;
  const readyToShowMap = submitted && canSubmit && !loading;

  return (
    <section id="science-panel" className="container mx-auto px-4 py-8" style={{ position: 'relative', zIndex: 1 }}>
      <p className="text-[#FDFCF8] text-base md:text-lg mb-6 leading-relaxed max-w-3xl">
        Mature melanated skin has overlapping needs—hydration, barrier support, tone, and firmness. This tool maps your specific concerns to the key actives in the NFE ritual, so you can see exactly what&apos;s working for you (and why).
      </p>
      <h1 className="text-[#FDFCF8] text-[1.75rem] font-primary font-bold mb-6 tracking-[0.5px]">
        Your Personalized Ingredient Map
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <label htmlFor="skin-type-select" className="block mb-2 text-base md:text-lg font-semibold text-[#FDFCF8] tracking-tight">
            Skin Type
          </label>
          <select
            id="skin-type-select"
            className="w-full rounded-md border border-[#C9A66B] bg-white px-3 py-2 text-sm md:text-base text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C9A66B]"
            value={skinType}
            onChange={(e) => {
              setSkinType(e.target.value);
              setSubmitted(false);
            }}
          >
            <option value="">Select an option</option>
            {SKIN_TYPES.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', zIndex: 10 }}>
          <div className="block mb-2 text-base md:text-lg font-semibold text-[#FDFCF8] tracking-tight">
            Primary Skin Concerns
          </div>
          <div className="max-h-48 overflow-y-auto border border-[#C9A66B] rounded-md bg-white p-2">
            {SKIN_CONCERNS.map((opt) => {
              const isSelected = concerns.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConcerns([...concerns, opt]);
                      } else {
                        setConcerns(concerns.filter((c) => c !== opt));
                      }
                      setSubmitted(false);
                    }}
                    className="w-4 h-4 text-[#C9A66B] border-gray-300 rounded focus:ring-[#C9A66B]"
                  />
                  <span className="text-sm text-gray-900">
                    {opt.replace(/[_-]/g, ' ').replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1))}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className={`px-8 py-3 rounded-md font-semibold text-white transition-colors ${
            canSubmit && !loading
              ? 'bg-[#C9A66B] hover:bg-[#B8955A] cursor-pointer'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Loading...' : 'View Ingredient Map'}
        </button>
      </div>

      {!readyToShowMap && (
        <div className="text-center mt-10">
          {!submitted ? (
            <>
              <p className="text-[#D5D2C7] italic mb-2">
                Select your skin type and at least one concern, then click &quot;View Ingredient Map&quot;.
              </p>
              {skinType && concerns.length === 0 && (
                <p className="text-sm text-[#E7C686]">Please select at least one skin concern.</p>
              )}
              {!skinType && concerns.length > 0 && (
                <p className="text-sm text-[#E7C686]">Please select your skin type.</p>
              )}
            </>
          ) : (
            <p className="text-[#D5D2C7] italic">Loading your personalized ingredient map...</p>
          )}
        </div>
      )}

      {readyToShowMap && (
        <div className="mt-10 space-y-6">
          {/* Active Ingredient Index */}
          <ActiveIngredientIndex />

          {/* Visual Maps */}
          <div className="space-y-6">
            <NFESkinLayersMap />
            <NFEMelanocyteMap loading={loading} />
          </div>
        </div>
      )}
    </section>
  );
}

export default function ScienceTab() {
  return (
    <ScienceProvider>
      <ScienceTabContent />
    </ScienceProvider>
  );
}
