'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ActiveIngredient } from '@/types/actives';
import { initializeActives } from '@/lib/actives';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SimpleInput } from '@/components/ui/SimpleInput';
import { Badge } from '@/components/ui/Badge';

export default function ActivesDataTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLayer, setFilterLayer] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'layer' | 'category'>('name');

  const [allActives, setAllActives] = useState<ActiveIngredient[]>([]);

  useEffect(() => {
    initializeActives().then(setAllActives);
  }, []);

  const filteredAndSorted = useMemo(() => {
    let filtered = allActives.filter((active) => {
      const matchesSearch =
        active.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        active.mechanism.toLowerCase().includes(searchQuery.toLowerCase()) ||
        active.roles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLayer = filterLayer === 'all' || active.layer === filterLayer;
      const matchesCategory = filterCategory === 'all' || active.category === filterCategory;

      return matchesSearch && matchesLayer && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'layer':
          return a.layer.localeCompare(b.layer);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allActives, searchQuery, filterLayer, filterCategory, sortBy]);

  const uniqueLayers = useMemo(
    () => Array.from(new Set(allActives.map((a) => a.layer))).sort(),
    [allActives]
  );

  const uniqueCategories = useMemo(
    () => Array.from(new Set(allActives.map((a) => a.category))).sort(),
    [allActives]
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-[#C9A66B]">
        <CardHeader>
          <CardTitle className="text-xl text-[#0E2A22]">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SimpleInput
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={filterLayer}
              onChange={(e) => setFilterLayer(e.target.value)}
              className="rounded-md border border-[#C9A66B] bg-white px-3 py-2"
            >
              <option value="all">All Layers</option>
              {uniqueLayers.map((layer) => (
                <option key={layer} value={layer}>
                  {layer}
                </option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border border-[#C9A66B] bg-white px-3 py-2"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label htmlFor="sort-by" className="text-sm text-gray-600 mr-2">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'layer' | 'category')}
              className="rounded-md border border-[#C9A66B] bg-white px-3 py-2 text-sm"
            >
              <option value="name">Name</option>
              <option value="layer">Layer</option>
              <option value="category">Category</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-[#C9A66B]">
        <CardHeader>
          <CardTitle className="text-xl text-[#0E2A22]">
            Active Ingredients ({filteredAndSorted.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSorted.length === 0 ? (
            <p className="text-center py-10 text-gray-500">No ingredients match your filters.</p>
          ) : (
            <div className="space-y-4">
              {filteredAndSorted.map((active) => (
                <div
                  key={active.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg text-[#0E2A22]">{active.name}</h4>
                    <div className="flex gap-2">
                      <Badge variant="outline">{active.layer}</Badge>
                      <Badge variant="outline" className="border-[var(--active-color)] text-[var(--active-color)]" style={{ '--active-color': active.color } as React.CSSProperties}>
                        {active.category}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{active.mechanism}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {active.roles.map((role, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">Targets:</span> {active.targets.join(', ')}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">Source: {active.source}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

