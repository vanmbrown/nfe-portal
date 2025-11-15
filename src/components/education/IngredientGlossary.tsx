'use client';

import React, { useState, useMemo } from 'react';
import { GlossaryEntry } from '@/types/actives';
import { Card, CardContent } from '@/components/ui/Card';
import { SimpleInput } from '@/components/ui/SimpleInput';
import { Badge } from '@/components/ui/Badge';

// Load glossary data
const loadGlossary = async (): Promise<GlossaryEntry[]> => {
  try {
    const response = await fetch('/data/education/ingredientGlossary.json');
    if (!response.ok) {
      throw new Error('Failed to load glossary');
    }
    const data = await response.json();
    // Parse new schema with entries wrapper
    return data.entries || [];
  } catch (error) {
    console.error('Error loading glossary:', error);
    return [];
  }
};

export default function IngredientGlossary() {
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadGlossary().then((data) => {
      setGlossary(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return glossary.filter((entry) => {
      const matchesSearch =
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.benefit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === 'all' || entry.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [glossary, searchQuery, filterCategory]);

  const uniqueCategories = useMemo(
    () => Array.from(new Set(glossary.map((e) => e.category))).sort(),
    [glossary]
  );

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading glossary...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card className="border-[#C9A66B]">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SimpleInput
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
        </CardContent>
      </Card>

      {/* Glossary Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((entry, idx) => (
          <Card key={idx} className="border-[#C9A66B] hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-[#0E2A22]">{entry.name}</h3>
                <Badge variant="outline">{entry.category}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{entry.benefit}</p>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Layer:</span> {entry.layer}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-10 text-gray-500">No glossary entries match your search.</p>
      )}
    </div>
  );
}


