'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ActiveIngredient, CategoryFilter } from '@/types/actives';
import { CATEGORY_TO_GROUP } from '@/types/actives';

interface ScienceContextType {
  // Filtered actives based on skin type + concerns
  filteredActives: ActiveIngredient[];
  setFilteredActives: (actives: ActiveIngredient[]) => void;
  
  // Selected categories for refinement (Tone, Hydration, etc.)
  selectedCategories: CategoryFilter[];
  toggleCategory: (category: CategoryFilter) => void;
  clearCategories: () => void;
  
  // Skin type and concerns (for initial filter)
  skinType: string;
  setSkinType: (type: string) => void;
  concerns: string[];
  setConcerns: (concerns: string[]) => void;
  
  // Get actives filtered by selected categories
  getRefinedActives: () => ActiveIngredient[];
}

const ScienceContext = createContext<ScienceContextType | undefined>(undefined);

export function ScienceProvider({ children }: { children: ReactNode }) {
  const [filteredActives, setFilteredActives] = useState<ActiveIngredient[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CategoryFilter[]>([]);
  const [skinType, setSkinType] = useState<string>('');
  const [concerns, setConcerns] = useState<string[]>([]);

  const toggleCategory = useCallback((category: CategoryFilter) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      return [...prev, category];
    });
  }, []);

  const clearCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  // Refine actives based on selected categories
  // If no categories selected, return all filtered actives
  // If categories selected, filter by matching group
  const getRefinedActives = useCallback((): ActiveIngredient[] => {
    if (selectedCategories.length === 0) {
      return filteredActives;
    }
    
    // Convert category filters to groups
    const selectedGroups = selectedCategories.map((cat) => CATEGORY_TO_GROUP[cat]);
    
    // Filter actives that match any of the selected groups
    return filteredActives.filter((active) => selectedGroups.includes(active.group));
  }, [filteredActives, selectedCategories]);

  return (
    <ScienceContext.Provider
      value={{
        filteredActives,
        setFilteredActives,
        selectedCategories,
        toggleCategory,
        clearCategories,
        skinType,
        setSkinType,
        concerns,
        setConcerns,
        getRefinedActives,
      }}
    >
      {children}
    </ScienceContext.Provider>
  );
}

export function useScience() {
  const context = useContext(ScienceContext);
  if (context === undefined) {
    throw new Error('useScience must be used within a ScienceProvider');
  }
  return context;
}









