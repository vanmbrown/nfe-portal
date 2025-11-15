'use client';

import React, { useState, useMemo } from 'react';
import { INCIEntry } from '@/types/actives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// Phase color mapping removed - using plain text headers only

// Load INCI data - in production, this would come from an API
// For now, we'll use placeholder data structure
const loadINCIData = async (source: 'face' | 'body'): Promise<INCIEntry[]> => {
  try {
    const path = source === 'face' 
      ? '/data/formulas/faceElixir.json'
      : '/data/formulas/bodyElixir.json';
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${source} elixir data`);
    }
    const data = await response.json();
    // Parse wrapped structure: { product, ingredients: [...] }
    return data.ingredients || [];
  } catch (error) {
    console.error(`Error loading ${source} elixir:`, error);
    return [];
  }
};

export default function INCILists() {
  const [product, setProduct] = useState<'face' | 'body'>('face');
  const [faceData, setFaceData] = useState<INCIEntry[]>([]);
  const [bodyData, setBodyData] = useState<INCIEntry[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [face, body] = await Promise.all([
        loadINCIData('face'),
        loadINCIData('body'),
      ]);
      setFaceData(face);
      setBodyData(body);
      setLoading(false);
    };
    loadData();
  }, []);

  const currentData = product === 'face' ? faceData : bodyData;
  const isPlaceholder = currentData.length === 0 || (bodyData.length === 0 && product === 'body');

  // Group by phase
  const groupedByPhase = useMemo(() => {
    const groups: Record<string, INCIEntry[]> = {};
    currentData.forEach((item) => {
      const phase = item.phase || 'Other';
      if (!groups[phase]) {
        groups[phase] = [];
      }
      groups[phase].push(item);
    });
    return groups;
  }, [currentData]);

  return (
    <div className="space-y-6">
      {/* Product Toggle - Always visible */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setProduct('face')}
          className={`px-4 py-2 rounded-md font-medium ${
            product === 'face'
              ? 'bg-[#C9A66B] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Face Elixir
        </button>
        <button
          onClick={() => setProduct('body')}
          className={`px-4 py-2 rounded-md font-medium ${
            product === 'body'
              ? 'bg-[#C9A66B] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Body Elixir
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-600">Loading ingredient data...</div>
      ) : product === 'body' && isPlaceholder ? (
        <div className="text-center py-10">
          <p className="text-gray-400 italic">
            The Enhanced Radiant Body Elixir is currently in development. Check back soon.
          </p>
        </div>
      ) : (
        <>
      {/* INCI List by Phase */}
      {Object.entries(groupedByPhase).map(([phase, items]) => {
        return (
        <Card key={phase} className="border-[#C9A66B] rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl text-[#0E2A22]">{phase}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#0E2A22]">{item.inci}</h4>
                    {item.commonName && (
                      <p className="text-sm text-gray-600 mt-1">{item.commonName}</p>
                    )}
                    {item.benefit && (
                      <p className="text-sm text-gray-500 mt-2">{item.benefit}</p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    {item.function && (
                      <Badge variant="outline" className="mb-2">
                        {item.function}
                      </Badge>
                    )}
                    {item.percentageRange && (
                      <p className="text-xs text-gray-500">{item.percentageRange}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        );
      })}
        </>
      )}
    </div>
  );
}


