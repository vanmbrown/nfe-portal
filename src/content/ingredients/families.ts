import type { IngredientFamily } from './types'

/**
 * The eight ingredient families — identity only.
 *
 * Order is the reading order on Ingredients: what holds water, what softens,
 * what supports comfort, then the more specific roles, closing with the
 * sensorial layer that shapes how a formula feels.
 *
 * Descriptions and claims boundaries live in family-copy.ts. Science renders
 * these labels inside its client island, so keeping the prose out of this
 * module keeps it out of the browser bundle.
 */
export const INGREDIENT_FAMILIES: IngredientFamily[] = [
  { id: 'humectants', label: 'Humectants', order: 1 },
  { id: 'emollients', label: 'Emollients', order: 2 },
  { id: 'barrier-supportive-lipids', label: 'Barrier-supportive lipids', order: 3 },
  { id: 'tone-supportive-cosmetic-ingredients', label: 'Tone-supportive cosmetic ingredients', order: 4 },
  { id: 'peptides', label: 'Peptides', order: 5 },
  { id: 'antioxidant-supportive-ingredients', label: 'Antioxidant-supportive ingredients', order: 6 },
  { id: 'botanical-oils', label: 'Botanical oils', order: 7 },
  { id: 'sensorial-support', label: 'Sensorial support', order: 8 },
]

export const FAMILY_BY_ID = Object.fromEntries(
  INGREDIENT_FAMILIES.map((family) => [family.id, family])
) as Record<IngredientFamily['id'], IngredientFamily>

/** Canonical anchor href for a family on Ingredients. Never built by hand. */
export const familyHref = (id: IngredientFamily['id']) => `/inci#${id}`
