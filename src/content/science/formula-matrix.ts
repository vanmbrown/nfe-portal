import type { ConcernFormulaMatrixRow } from './types'

/**
 * The Concern-to-Formula Matrix — "A simpler way to read the formula logic."
 *
 * Restored from the previous Science page. Three things changed:
 *
 *  1. Seven rows became five, one per pathway. The previous seven split
 *     "crepey-looking texture" from "fine lines appearance" and "radiance loss"
 *     from "sensitivity awareness", which implied a precision the content did
 *     not have and left two rows with no pathway to belong to.
 *
 *  2. The final column was "Example ingredients" and listed named actives
 *     beside a column called "Formula support". Together those read as a
 *     statement of what is in the formula. The column is now "Ingredient
 *     family" and holds family ids only.
 *
 *  3. The first column was "Concern". It is now "What you are exploring" — the
 *     matrix describes a subject the visitor chose to read about, not a finding
 *     about the visitor.
 *
 * Rows are compressed on purpose. Layer Context explains these relationships in
 * full; the matrix exists to make the same system legible at a glance.
 */
export const CONCERN_FORMULA_MATRIX: ConcernFormulaMatrixRow[] = [
  {
    id: 'dryness-ashiness',
    order: 1,
    pathwayId: 'hydration',
    explorationLabel: 'Dryness and ashiness',
    layerContext: 'Skin surface and outer barrier',
    formulationPrinciple: 'Surface hydration and moisture retention',
    ingredientFamilyIds: ['humectants', 'emollients'],
  },
  {
    id: 'tightness-comfort',
    order: 2,
    pathwayId: 'barrier-comfort',
    explorationLabel: 'Tightness and barrier comfort',
    layerContext: 'Barrier-supportive surface context',
    formulationPrinciple: 'Cushioned feel and replenishing care',
    ingredientFamilyIds: ['barrier-lipids', 'sensorial-support'],
  },
  {
    id: 'uneven-tone',
    order: 3,
    pathwayId: 'tone-integrity',
    explorationLabel: 'Uneven-looking tone',
    layerContext: 'Epidermal appearance and tone integrity',
    formulationPrinciple: 'More even-looking complexion and visible radiance',
    ingredientFamilyIds: ['tone-supportive', 'antioxidant-support'],
  },
  {
    id: 'texture-fine-lines',
    order: 4,
    pathwayId: 'texture-suppleness',
    explorationLabel: 'Texture and fine-line appearance',
    layerContext: 'Surface texture and visible refinement',
    formulationPrinciple: 'Supple-looking skin and visible softness',
    ingredientFamilyIds: ['peptides', 'emollients', 'antioxidant-support'],
  },
  {
    id: 'dull-tired',
    order: 5,
    pathwayId: 'visible-resilience',
    explorationLabel: 'Dull or tired-looking appearance',
    layerContext: 'Visible radiance and environmental context',
    formulationPrinciple: 'Rested-looking skin and luminous appearance',
    ingredientFamilyIds: ['antioxidant-support', 'botanical-oils', 'sensorial-support'],
  },
]

export const MATRIX_ROW_BY_PATHWAY = Object.fromEntries(
  CONCERN_FORMULA_MATRIX.map((row) => [row.pathwayId, row])
) as Record<ConcernFormulaMatrixRow['pathwayId'], ConcernFormulaMatrixRow>
