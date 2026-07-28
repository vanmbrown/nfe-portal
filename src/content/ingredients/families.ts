import type { IngredientFamily } from './types'

/**
 * The eight ingredient families.
 *
 * Order is the reading order on Ingredients: what holds water, what softens,
 * what supports comfort, then the more specific roles, closing with the
 * sensorial layer that shapes how a formula feels.
 *
 * Descriptions are cosmetic-role language. None of them says or implies that
 * every ingredient in a family appears in every NFE formula — product pages own
 * verified composition.
 */
export const INGREDIENT_FAMILIES: IngredientFamily[] = [
  {
    id: 'humectants',
    label: 'Humectants',
    description:
      'Ingredients chosen for their ability to draw and hold water at the surface, so skin feels replenished rather than tight.',
    order: 1,
    claimsBoundary: ['restores cellular hydration', 'heals dehydration'],
  },
  {
    id: 'emollients',
    label: 'Emollients',
    description:
      'Ingredients that soften and smooth how the surface feels, supporting a cushioned finish and a ritual worth keeping.',
    order: 2,
    claimsBoundary: ['repairs damaged skin', 'restores skin structure'],
  },
  {
    id: 'barrier-supportive-lipids',
    label: 'Barrier-supportive lipids',
    description:
      'Lipids and lipid-supportive ingredients selected to support skin comfort, softness and the retention of moisture through the day.',
    order: 3,
    claimsBoundary: ['repairs the barrier', 'restores barrier function', 'treats sensitivity'],
  },
  {
    id: 'tone-supportive-cosmetic-ingredients',
    label: 'Tone-supportive cosmetic ingredients',
    description:
      'Ingredients used to support a more even-looking complexion and visible tone integrity, patiently and over time.',
    order: 4,
    claimsBoundary: [
      'treats hyperpigmentation',
      'treats melasma',
      'stops melanin production',
      'corrects pigmentation',
    ],
  },
  {
    id: 'peptides',
    label: 'Peptides',
    description:
      'Cosmetic peptides selected to support the look of a smoother, more refined and supple surface.',
    order: 5,
    claimsBoundary: ['rebuilds collagen', 'repairs structural damage', 'erases wrinkles'],
  },
  {
    id: 'antioxidant-supportive-ingredients',
    label: 'Antioxidant-supportive ingredients',
    description:
      'Ingredients chosen to support visible radiance and help skin keep a rested, luminous appearance.',
    order: 6,
    claimsBoundary: [
      'prevents sun damage',
      'reverses oxidative stress',
      'prevents environmental damage',
    ],
  },
  {
    id: 'botanical-oils',
    label: 'Botanical oils',
    description:
      'Plant-derived oils selected for softness, cushion and the sensory character they bring to a formula.',
    order: 7,
    claimsBoundary: ['heals inflammation', 'cures skin conditions'],
  },
  {
    id: 'sensorial-support',
    label: 'Sensorial support',
    description:
      'Ingredients that shape slip, absorption, cushion and finish — the part of care most easily overlooked.',
    order: 8,
    claimsBoundary: ['treats irritation', 'heals sensitivity'],
  },
]

export const FAMILY_BY_ID = Object.fromEntries(
  INGREDIENT_FAMILIES.map((family) => [family.id, family])
) as Record<IngredientFamily['id'], IngredientFamily>

/** Canonical anchor href for a family on Ingredients. Never built by hand. */
export const familyHref = (id: IngredientFamily['id']) => `/inci#${id}`
