import type { IngredientFamily, IngredientFamilyId } from './types'

/**
 * Ingredient families, presented editorially.
 *
 * This replaces the previous fourteen-card active index. That index listed
 * individual ingredients with their own descriptions, which duplicated
 * territory that Ingredients (/inci) owns, and presented them as "actives
 * matched to your profile".
 *
 * Scope discipline, per the Phase 1 brief:
 *
 *  - Families describe how NFE thinks about formulation.
 *  - `representativeExamples` name a family's character. They are drawn from
 *    NFE's published ingredient glossary
 *    (data/education/ingredientGlossary.json) and are NOT presented as the
 *    composition of any specific product.
 *  - Ingredients (/inci) remains the authoritative home for per-product INCI
 *    and per-ingredient function.
 *
 * Known data discrepancy, flagged rather than resolved here: the glossary and
 * data/products/face-elixir.json list different ingredient sets. Reconciling
 * them is formulation work, not a content-architecture decision, so nothing in
 * this file asserts what is in a given bottle. See the Phase 1 implementation
 * record in docs/strategy/SCIENCE_AUTHORITY_GUIDED_EDUCATION_BLUEPRINT.md.
 */
export const INGREDIENT_FAMILIES: IngredientFamily[] = [
  {
    id: 'humectants',
    role: 'Draw and hold water at the surface, helping skin feel replenished rather than tight.',
    representativeExamples: ['Hyaluronic Acid', 'Glycerin', 'Propanediol'],
  },
  {
    id: 'emollients',
    role: 'Soften the surface feel and improve slip, so the ritual is inviting enough to keep.',
    representativeExamples: ['Squalane', 'Coco-Caprylate'],
  },
  {
    id: 'barrier-supportive-lipids',
    role: 'Support the feel of the skin barrier and help skin hold comfort through the day.',
    representativeExamples: ['Ceramide NP, AP and EOP'],
  },
  {
    id: 'antioxidant-supportive-ingredients',
    role: 'Support the look of vitality in skin that reads tired or flat.',
    representativeExamples: ['Tocopherol', 'Green Tea Extract', 'Coenzyme Q10'],
  },
  {
    id: 'tone-supportive-cosmetic-ingredients',
    role: 'Support the appearance of a more even complexion, patiently and over time.',
    representativeExamples: ['Niacinamide', 'Tranexamic Acid', 'Alpha-Arbutin'],
  },
  {
    id: 'peptides',
    role: 'Support the look of a well-conditioned, supple surface.',
    representativeExamples: ['Palmitoyl Tripeptide-1', 'Copper Tripeptide-1'],
  },
  {
    id: 'botanical-oils',
    role: 'Bring conditioning and a considered sensory character to the ritual.',
    representativeExamples: ['Rosehip Oil', 'Jojoba Oil', 'Prickly Pear Seed Oil'],
  },
  {
    id: 'sensorial-support',
    role: 'Shape how a formula feels on skin, the part of care most easily overlooked.',
    representativeExamples: ['Centella Asiatica Extract', 'Bisabolol', 'Allantoin'],
  },
]

export const FAMILY_BY_ID = Object.fromEntries(
  INGREDIENT_FAMILIES.map((family) => [family.id, family])
) as Record<IngredientFamily['id'], IngredientFamily>
