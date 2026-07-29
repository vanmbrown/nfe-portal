import { PATHWAYS } from './pathways'
import type { PathwayId } from './types'

/**
 * The NFE Skin Profile — the second way into the Science Map.
 *
 * A visitor can choose pathways directly, or describe what her skin is asking
 * for and let that resolve to the same five pathways. Both are inputs to one
 * state. There is no second result system here: no profile name, no score, no
 * rank, no primary or secondary concern, no recommendation. The only thing this
 * module produces is a set of canonical pathway ids.
 *
 * That constraint is enforced by the shape of the data. An option carries a
 * `pathways` array and nothing else — there is deliberately no weight, no
 * severity, no order field, so a ranking cannot be expressed even by accident.
 *
 * Every label is cosmetic and appearance-based. Nothing here names a condition,
 * a diagnosis, or a treatment, and the wording avoids implying that a signal is
 * a problem to be corrected.
 */

export type SkinContextId =
  | 'dry-depleted'
  | 'balanced'
  | 'combination'
  | 'oily'
  | 'sensitive-unsettled'
  | 'mature-changing'
  | 'not-sure'

export type SkinSignalId =
  | 'dryness-ashiness'
  | 'tightness-comfort'
  | 'uneven-tone'
  | 'visible-dullness'
  | 'post-blemish-marks'
  | 'fine-lines'
  | 'crepey-texture'
  | 'loss-of-suppleness'
  | 'tired-looking'
  | 'sensitivity-awareness'

/**
 * One choice a visitor can make, and the pathways it brings into focus.
 *
 * `pathways` may be empty. Several contexts — balanced, combination, oily,
 * not sure — describe how skin behaves without pointing at a particular
 * reading of the map, and saying so honestly is better than inventing a
 * connection to justify the field.
 */
export interface SkinProfileOption<Id extends string> {
  id: Id
  label: string
  pathways: PathwayId[]
}

/** Optional. One choice only. Never described as a skin type or a diagnosis. */
export const SKIN_CONTEXTS: SkinProfileOption<SkinContextId>[] = [
  { id: 'dry-depleted', label: 'Dry or easily depleted', pathways: ['barrier-comfort', 'hydration'] },
  { id: 'balanced', label: 'Balanced', pathways: [] },
  { id: 'combination', label: 'Combination', pathways: [] },
  { id: 'oily', label: 'Oily', pathways: [] },
  { id: 'sensitive-unsettled', label: 'Sensitive or easily unsettled', pathways: ['barrier-comfort'] },
  {
    id: 'mature-changing',
    label: 'Mature or changing',
    pathways: ['hydration', 'texture-suppleness', 'visible-resilience'],
  },
  { id: 'not-sure', label: 'Not sure', pathways: [] },
]

/** Multiple choice. Appearance language only. */
export const SKIN_SIGNALS: SkinProfileOption<SkinSignalId>[] = [
  { id: 'dryness-ashiness', label: 'Dryness or ashiness', pathways: ['hydration'] },
  { id: 'tightness-comfort', label: 'Tightness or reduced comfort', pathways: ['barrier-comfort'] },
  { id: 'uneven-tone', label: 'Uneven-looking tone', pathways: ['tone-integrity'] },
  {
    id: 'visible-dullness',
    label: 'Visible dullness',
    // One signal may bring more than one reading forward. Neither is primary.
    pathways: ['tone-integrity', 'visible-resilience'],
  },
  { id: 'post-blemish-marks', label: 'Post-blemish-looking marks', pathways: ['tone-integrity'] },
  { id: 'fine-lines', label: 'Fine-line appearance', pathways: ['texture-suppleness'] },
  { id: 'crepey-texture', label: 'Crepey-looking texture', pathways: ['texture-suppleness'] },
  { id: 'loss-of-suppleness', label: 'Loss of suppleness', pathways: ['texture-suppleness'] },
  { id: 'tired-looking', label: 'Tired-looking skin', pathways: ['visible-resilience'] },
  { id: 'sensitivity-awareness', label: 'Sensitivity awareness', pathways: ['barrier-comfort'] },
]

/**
 * How many signals a visitor may choose.
 *
 * Not a rule about her skin — a limit on how much the map can bring forward at
 * once and still read as an interpretation rather than a wall of emphasis.
 */
export const MAX_SKIN_SIGNALS = 5

const CANONICAL_PATHWAY_IDS: readonly PathwayId[] = PATHWAYS.map((p) => p.id)

/**
 * Resolve a profile to pathways.
 *
 * Deduplicated and returned in canonical order, so the same set of signals
 * always produces the same reading, and the order never suggests a priority.
 * Unknown ids are ignored rather than trusted.
 */
export function mapProfileToPathways(
  contextId: SkinContextId | null,
  signalIds: readonly SkinSignalId[]
): PathwayId[] {
  const wanted = new Set<PathwayId>()

  const context = SKIN_CONTEXTS.find((option) => option.id === contextId)
  if (context) for (const id of context.pathways) wanted.add(id)

  for (const signalId of signalIds) {
    const signal = SKIN_SIGNALS.find((option) => option.id === signalId)
    if (signal) for (const id of signal.pathways) wanted.add(id)
  }

  return CANONICAL_PATHWAY_IDS.filter((id) => wanted.has(id))
}
