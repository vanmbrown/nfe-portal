import { ActiveIngredient, ActivesTable } from '@/types/actives';

let cachedActives: ActiveIngredient[] | null = null;

// Load actives from JSON (synchronous version - will be loaded on first call)
export function loadActives(): ActiveIngredient[] {
  if (cachedActives) {
    return cachedActives;
  }

  // For now, return empty array - data will be loaded via fetch
  // This prevents build-time import issues
  return [];
}

// Initialize actives data (call this on client side)
export async function initializeActives(): Promise<ActiveIngredient[]> {
  if (cachedActives) {
    return cachedActives;
  }

  try {
    const response = await fetch('/data/education/activesTable.json');
    if (!response.ok) {
      throw new Error('Failed to load actives data');
    }
    const data: ActivesTable = await response.json();
    cachedActives = data.actives;
    return data.actives;
  } catch (error) {
    console.error('Error loading actives:', error);
    return [];
  }
}

// Keep loadActives for backward compatibility but it will return empty until initialized
// Components should use initializeActives() on client side

// Filter actives based on ingredient names from API response
export function filterActivesByNames(
  actives: ActiveIngredient[],
  ingredientNames: string[]
): ActiveIngredient[] {
  if (!ingredientNames || ingredientNames.length === 0) {
    return [];
  }

  // Normalize names for comparison (remove concentrations, extra spaces, etc.)
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\([^)]*\)/g, '') // Remove parentheses content
      .replace(/\d+\.?\d*%/g, '') // Remove percentages
      .replace(/\s+/g, ' ')
      .trim();
  };

  const normalizedIngredientNames = ingredientNames.map(normalizeName);

  return actives.filter((active) => {
    const normalizedActiveName = normalizeName(active.name);
    return normalizedIngredientNames.some((name) =>
      normalizedActiveName.includes(name) || name.includes(normalizedActiveName)
    );
  });
}

// Map concern keys to display names
export const CONCERN_MAPPING: Record<string, string> = {
  dark_spots: 'Dark Spots',
  dryness_barrier: 'Dryness/Barrier',
  fine_lines: 'Fine Lines',
  firmness: 'Firmness',
  sensitivity_redness: 'Sensitivity/Redness',
  texture_pores: 'Texture/Pores',
  tone_glow: 'Tone/Glow',
  uneven_skin_tone: 'Uneven Tone',
};

// Filter actives by skin type and concerns
export function filterActivesBySelection(
  actives: ActiveIngredient[],
  skinType: string,
  concerns: string[]
): ActiveIngredient[] {
  if (!skinType || concerns.length === 0) {
    return [];
  }

  // Map concern keys to display names
  const concernNames = concerns.map((c) => CONCERN_MAPPING[c] || c);

  return actives.filter((active) => {
    // Check if active matches skin type
    const matchesSkinType = active.skinTypes.some(
      (st) => st.toLowerCase() === skinType.toLowerCase()
    );

    // Check if active addresses any of the selected concerns
    const matchesConcern = active.concerns.some((concern) =>
      concernNames.some((selected) => concern.includes(selected) || selected.includes(concern))
    );

    return matchesSkinType && matchesConcern;
  });
}

