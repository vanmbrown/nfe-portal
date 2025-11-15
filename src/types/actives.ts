// Type definitions for NFE Science + INCI data structures

export interface ActiveIngredient {
  id: string;
  name: string;
  layer: 'Stratum Corneum' | 'Epidermis' | 'Dermis' | 'Hypodermis';
  category: string;
  group: 'tone' | 'hydrate' | 'antioxidant' | 'peptide';
  concerns: string[];
  skinTypes: string[];
  mechanism: string;
  source: string;
  roles: string[];
  targets: string[];
  x: number;
  y: number;
  color: string;
  mech: string;
}

export interface ActivesTable {
  version: string;
  updatedAt: string;
  actives: ActiveIngredient[];
}

export interface INCIEntry {
  inci: string;
  commonName: string;
  function: string;
  phase: string;
  benefit?: string;
  percentageRange?: string;
  source: string;
  placeholder?: boolean;
}

export interface GlossaryEntry {
  name: string;
  commonName?: string;
  category: string;
  function?: string;
  benefit: string;
  phase?: string;
  layer: string;
}

// Category mapping for filter chips
export type CategoryFilter = 'Tone' | 'Hydration' | 'Antioxidants' | 'Peptides';

// Skin type and concern types
export type SkinType = 'normal' | 'dry' | 'combination' | 'sensitive';

export type SkinConcern = 
  | 'dark_spots'
  | 'dryness_barrier'
  | 'fine_lines'
  | 'firmness'
  | 'sensitivity_redness'
  | 'texture_pores'
  | 'tone_glow'
  | 'uneven_skin_tone';

// Mapping from category filter to group
export const CATEGORY_TO_GROUP: Record<CategoryFilter, string> = {
  'Tone': 'tone',
  'Hydration': 'hydrate',
  'Antioxidants': 'antioxidant',
  'Peptides': 'peptide',
};

// Mapping from group to category display name
export const GROUP_TO_CATEGORY: Record<string, CategoryFilter> = {
  'tone': 'Tone',
  'hydrate': 'Hydration',
  'antioxidant': 'Antioxidants',
  'peptide': 'Peptides',
};


