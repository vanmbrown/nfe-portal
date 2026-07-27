import type { EducationalPathway } from './types'

/**
 * The five approved educational pathways.
 *
 * A pathway is a doorway into a topic. It is not a classification of the
 * visitor, and selecting one produces no profile, score, ranking, or
 * recommendation — only a change of emphasis in the map and interpretation.
 *
 * Labels are deliberately phrased as subjects ("Barrier Comfort"), never as
 * symptoms ("Dryness"), so that choosing one is an act of curiosity rather
 * than self-diagnosis.
 *
 * `claimsBoundary` is retained in content, not just in review notes, so the
 * claims-governance test can assert against it directly.
 */
export const PATHWAYS: EducationalPathway[] = [
  {
    id: 'barrier-comfort',
    label: 'Barrier Comfort',
    invitation: 'How the skin surface holds comfort.',
    emphasizedLayers: ['surface', 'barrier'],
    interpretation:
      'This pathway brings attention to the outermost part of the skin, where comfort is felt before it is seen. When the surface is well conditioned, skin tends to feel cushioned rather than tight, and everything layered over it behaves more predictably.',
    formulationPrinciple:
      'NFE approaches this by supporting the feel of the skin barrier first, with lipids and conditioning agents, rather than layering strong actives onto a surface that is asking for comfort.',
    ingredientFamilies: ['barrier-lipids', 'emollients', 'humectants'],
    ritualConnection:
      'Consistency matters more than intensity here. Ritual explains how to layer without over-stripping.',
    claimsBoundary: [
      'repairs damaged skin',
      'heals the barrier',
      'restores barrier function',
    ],
  },
  {
    id: 'hydration',
    label: 'Hydration',
    invitation: 'How water is held at the surface.',
    emphasizedLayers: ['surface', 'barrier'],
    interpretation:
      'This pathway explores the relationship between water and comfort. Hydration is what makes skin look fresher and feel more supple, and it is also the first thing lost when skin is stripped or exposed.',
    formulationPrinciple:
      'NFE approaches this in layers: humectants to draw water in, emollients to soften the surface, and barrier-supportive lipids to help skin hold what it has been given.',
    ingredientFamilies: ['humectants', 'emollients', 'barrier-lipids'],
    ritualConnection:
      'Hydration reads quickly and fades quickly. Ritual explains the cadence that helps it last.',
    claimsBoundary: [
      'restores cellular hydration',
      'heals dehydration',
      'prevents transepidermal water loss',
    ],
  },
  {
    id: 'tone-integrity',
    label: 'Tone Integrity',
    invitation: 'How even-looking tone is supported.',
    emphasizedLayers: ['tone', 'radiance'],
    interpretation:
      'This pathway brings attention to how tone reads across the skin — including the marks that can linger after a blemish, and the unevenness that mature melanated skin is often left to interpret alone. Tone support is patient work, measured in months rather than days.',
    formulationPrinciple:
      'NFE approaches this through layered, tone-supportive ingredients used at restrained levels, alongside the barrier care that keeps skin from being irritated into looking more uneven.',
    ingredientFamilies: ['tone-supportive', 'antioxidant-support'],
    ritualConnection:
      'Daily sun protection belongs alongside any tone-supportive ritual. Ritual explains where it sits in the sequence.',
    claimsBoundary: [
      'treats hyperpigmentation',
      'treats melasma',
      'stops melanin production',
      'corrects pigmentation',
    ],
  },
  {
    id: 'texture-suppleness',
    label: 'Texture & Suppleness',
    invitation: 'How the surface reads smooth and supple.',
    emphasizedLayers: ['texture', 'surface'],
    interpretation:
      'This pathway explores the relationship between texture and cushioning. Skin that is well conditioned tends to look more refined; skin that is depleted can read crepey even when nothing structural has changed.',
    formulationPrinciple:
      'NFE approaches this by conditioning rather than resurfacing — supporting suppleness so the surface looks softer, instead of stripping it to force smoothness.',
    ingredientFamilies: ['peptides', 'emollients', 'botanical-oils'],
    ritualConnection:
      'Texture responds to steadiness. Ritual explains the unhurried application this asks for.',
    claimsBoundary: [
      'rebuilds collagen',
      'reverses aging',
      'repairs structural damage',
    ],
  },
  {
    id: 'visible-resilience',
    label: 'Visible Resilience',
    invitation: 'How skin reads rested across all of it.',
    emphasizedLayers: ['surface', 'barrier', 'tone', 'texture', 'radiance'],
    interpretation:
      'This pathway looks across the whole relationship rather than one part of it. Resilience is what shows when comfort, hydration, tone and texture are all being supported at once — skin that looks rested rather than corrected.',
    formulationPrinciple:
      'NFE approaches this as the outcome of restraint: fewer, better-considered formulas used consistently, so that support accumulates instead of competing.',
    ingredientFamilies: ['antioxidant-support', 'barrier-lipids', 'sensorial-support'],
    ritualConnection:
      'This is well-aging as a practice rather than a product. Ritual explains what that looks like day to day.',
    claimsBoundary: [
      'makes skin younger',
      'reverses aging',
      'age-defying',
      'prevents aging',
    ],
  },
]

export const PATHWAY_BY_ID = Object.fromEntries(
  PATHWAYS.map((pathway) => [pathway.id, pathway])
) as Record<EducationalPathway['id'], EducationalPathway>
