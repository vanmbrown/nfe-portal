import type { IngredientFamilyCopy } from './types'

/**
 * Family prose, rendered only on Ingredients.
 *
 * Kept apart from families.ts because Science renders family labels inside a
 * client island: anything sitting alongside the label ships to the browser,
 * and these descriptions were adding roughly 2.4KB to the Science chunk for
 * text that page never shows.
 *
 * None of these descriptions says or implies that every ingredient in a family
 * appears in every NFE formula. Product pages own verified composition.
 */
export const FAMILY_COPY: IngredientFamilyCopy[] = [
  {
    id: 'humectants',
    description:
      'Ingredients chosen for their ability to draw and hold water at the surface, so skin feels replenished rather than tight.',
    claimsBoundary: ['restores cellular hydration', 'heals dehydration'],
  },
  {
    id: 'emollients',
    description:
      'Ingredients that soften and smooth how the surface feels, supporting a cushioned finish and a ritual worth keeping.',
    claimsBoundary: ['repairs damaged skin', 'restores skin structure'],
  },
  {
    id: 'barrier-supportive-lipids',
    description:
      'Lipids and lipid-supportive ingredients selected to support skin comfort, softness and the retention of moisture through the day.',
    claimsBoundary: ['repairs the barrier', 'restores barrier function', 'treats sensitivity'],
  },
  {
    id: 'tone-supportive-cosmetic-ingredients',
    description:
      'Ingredients used to support a more even-looking complexion and visible tone integrity, patiently and over time.',
    claimsBoundary: ['treats hyperpigmentation',
      'treats melasma',
      'stops melanin production',
      'corrects pigmentation',],
  },
  {
    id: 'peptides',
    description:
      'Cosmetic peptides selected to support the look of a smoother, more refined and supple surface.',
    claimsBoundary: ['rebuilds collagen', 'repairs structural damage', 'erases wrinkles'],
  },
  {
    id: 'antioxidant-supportive-ingredients',
    description:
      'Ingredients chosen to support visible radiance and help skin keep a rested, luminous appearance.',
    claimsBoundary: ['prevents sun damage',
      'reverses oxidative stress',
      'prevents environmental damage',],
  },
  {
    id: 'botanical-oils',
    description:
      'Plant-derived oils selected for softness, cushion and the sensory character they bring to a formula.',
    claimsBoundary: ['heals inflammation', 'cures skin conditions'],
  },
  {
    id: 'sensorial-support',
    description:
      'Ingredients that shape slip, absorption, cushion and finish — the part of care most easily overlooked.',
    claimsBoundary: ['treats irritation', 'heals sensitivity'],
  },
]

export const FAMILY_COPY_BY_ID = Object.fromEntries(
  FAMILY_COPY.map((entry) => [entry.id, entry])
) as Record<IngredientFamilyCopy['id'], IngredientFamilyCopy>
