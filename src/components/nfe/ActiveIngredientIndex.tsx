'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useScience } from '@/context/ScienceContext';
import { ActiveIngredient } from '@/types/actives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { initializeActives } from '@/lib/actives';

const LAYER_ORDER = ['Stratum Corneum', 'Epidermis', 'Dermis', 'Hypodermis'];

export default function ActiveIngredientIndex() {
  const { getRefinedActives, selectedCategories } = useScience();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize actives data on mount
    initializeActives().then(() => setInitialized(true));
  }, []);

  const refinedActives = getRefinedActives();

  // Group actives by layer
  const activesByLayer = useMemo(() => {
    const grouped: Record<string, ActiveIngredient[]> = {};
    
    refinedActives.forEach((active) => {
      if (!grouped[active.layer]) {
        grouped[active.layer] = [];
      }
      grouped[active.layer].push(active);
    });

    // Sort layers by order
    const sorted: Record<string, ActiveIngredient[]> = {};
    LAYER_ORDER.forEach((layer) => {
      if (grouped[layer]) {
        sorted[layer] = grouped[layer].sort((a, b) => a.name.localeCompare(b.name));
      }
    });

    return sorted;
  }, [refinedActives]);

  if (refinedActives.length === 0) {
    return (
      <div className="text-center py-10 text-[#D5D2C7]">
        <p>No active ingredients match your current filters.</p>
        {selectedCategories.length > 0 && (
          <p className="text-sm mt-2">Try clearing category filters to see more results.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-[90%] md:max-w-6xl mx-auto">
      <div className="mb-6 mt-[2rem]">
        <div className="border-t border-white/10 mb-8"></div>
        <h2 className="text-[#E7C686] text-[1.25rem] font-bold mb-2">Active Ingredient Index</h2>
        <p className="text-[#D5D2C7]">
          Ingredients grouped by skin layer ({refinedActives.length} actives)
        </p>
      </div>

      {LAYER_ORDER.map((layer) => {
        const actives = activesByLayer[layer];
        if (!actives || actives.length === 0) return null;

        return (
          <motion.div
            key={layer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-[#E7C686]/30 bg-[rgba(231,198,134,0.05)]">
              <CardHeader>
                <CardTitle className="text-xl text-[#FDFCF8]">{layer}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {actives.map((active) => (
                    <motion.div
                      key={active.id}
                      className="p-4 border border-[#E7C686]/20 rounded-lg hover:border-[#E7C686]/40 hover:shadow-lg transition-all bg-[rgba(231,198,134,0.03)]"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-[#FDFCF8]">{active.name}</h4>
                        <span
                          className="text-xs px-2 py-1 rounded border"
                          style={{
                            borderColor: active.color,
                            color: active.color,
                          }}
                        >
                          {active.category}
                        </span>
                      </div>
                      <p className="text-sm text-[#D5D2C7] mb-2">{active.mechanism}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {active.roles.map((role, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-[rgba(231,198,134,0.15)] rounded text-[#FDFCF8] border border-[#E7C686]/20"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-[#D5D2C7]">
                        <span className="font-medium text-[#E7C686]">Targets:</span> {active.targets.join(', ')}
                      </div>
                      <div className="mt-2 text-xs text-[#D5D2C7]/70">
                        Source: {active.source}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

