import type { LayerContextPanel } from './types'

/**
 * Layer Context — "Where visible concerns begin. How NFE supports them."
 *
 * Restored from the previous Science page and rebuilt on the Phase 1 content
 * model. Two things changed in the restoration:
 *
 *  1. The previous version ended each panel with a row of chips naming specific
 *     actives, directly beneath a line labelled "Formula support". Read
 *     together, that asserted the composition of a formula. Panels now name
 *     ingredient *families* by id, and no panel claims what is in a bottle.
 *
 *  2. The previous panels were dense three-line cards inside a nested container
 *     inside the map card. They are now generous editorial panels in the same
 *     continuous dark chapter as the map they interpret.
 *
 * What did not change: the module is static. The previous Layer Context had no
 * dependency on the profiling engine — it read from a plain array and rendered
 * the same five panels for everyone. Selection changes emphasis only, and every
 * panel is present, legible and complete before anything is chosen.
 *
 * Order is surface downward, mirroring the schematic bands above.
 */
export const LAYER_CONTEXT_PANELS: LayerContextPanel[] = [
  {
    id: 'surface-moisture',
    order: 1,
    pathwayId: 'hydration',
    title: 'Skin surface and moisture context',
    visibleContext:
      'Dryness, a rough or tight-feeling surface, and the grey, ashy cast that dryness leaves on deeper skin tones. This is usually the first thing noticed and the first thing dismissed.',
    formulationPrinciple:
      'Hydration that is held rather than applied. Humectants draw water toward the surface, emollients soften how that surface feels, and the two together are why skin reads less dull by evening rather than only after application.',
    ingredientFamilyIds: ['humectants', 'emollients', 'sensorial-support'],
    layerIds: ['surface'],
    claimsBoundary: [
      'restores cellular hydration',
      'heals dryness',
      'prevents transepidermal water loss',
      'eliminates ashiness',
    ],
  },
  {
    id: 'barrier-lipid',
    order: 2,
    pathwayId: 'barrier-comfort',
    title: 'Barrier comfort and lipid context',
    visibleContext:
      'Tightness after cleansing, a surface that feels less cushioned than it used to, and skin that has started responding to products it once tolerated. Comfort is felt long before it is visible, which is why it is so often left until it shows.',
    formulationPrinciple:
      'Comfort before correction. Barrier-supportive lipids and conditioning agents are used to help skin feel replenished, rather than layering assertive actives onto a surface that is asking to be left alone.',
    ingredientFamilyIds: ['barrier-supportive-lipids', 'emollients', 'sensorial-support'],
    layerIds: ['barrier', 'surface'],
    claimsBoundary: [
      'repairs the barrier',
      'restores barrier function',
      'heals sensitivity',
      'treats irritation',
    ],
  },
  {
    id: 'tone-integrity',
    order: 3,
    pathwayId: 'tone-integrity',
    title: 'Epidermal appearance and tone integrity',
    visibleContext:
      'Uneven-looking tone, visible dullness, and the marks that stay long after the blemish that caused them has gone. In mature melanated skin those marks routinely outlast their cause, which is why tone is so often judged more harshly than texture.',
    formulationPrinciple:
      'Patient work at restrained levels. Tone-supportive and antioxidant-supportive ingredients used steadily over months, alongside the barrier care that keeps skin from being irritated into looking more uneven than it is.',
    ingredientFamilyIds: ['tone-supportive-cosmetic-ingredients', 'antioxidant-supportive-ingredients'],
    layerIds: ['tone'],
    claimsBoundary: [
      'treats hyperpigmentation',
      'treats melasma',
      'stops melanin production',
      'corrects pigmentation',
      'fades dark spots',
    ],
  },
  {
    id: 'texture-refinement',
    order: 4,
    pathwayId: 'texture-suppleness',
    title: 'Texture and visible refinement',
    visibleContext:
      'Crepey-looking texture, the appearance of fine lines, and a surface that reads less supple than it did. Skin that is simply depleted can look textured while nothing structural has changed at all.',
    formulationPrinciple:
      'Conditioning rather than resurfacing. Peptides and emollients support a supple-looking surface, instead of stripping skin to force a smoothness it has no way to keep.',
    ingredientFamilyIds: ['peptides', 'emollients', 'antioxidant-supportive-ingredients'],
    layerIds: ['texture'],
    claimsBoundary: [
      'rebuilds collagen',
      'repairs structural damage',
      'reverses aging',
      'erases wrinkles',
    ],
  },
  {
    id: 'radiance-environment',
    order: 5,
    pathwayId: 'visible-resilience',
    title: 'Environmental context and visible radiance',
    visibleContext:
      'Skin that reads flat or tired rather than rested. This is rarely traceable to one thing. It is the accumulated look of daylight, climate, sleep and time.',
    formulationPrinciple:
      'Antioxidant-supportive care applied consistently, and restraint everywhere else. Well-aging, not anti-aging: the aim is skin that looks rested, not skin performing an age it is not.',
    ingredientFamilyIds: ['antioxidant-supportive-ingredients', 'botanical-oils', 'sensorial-support'],
    layerIds: ['radiance'],
    claimsBoundary: [
      'prevents environmental damage',
      'prevents sun damage',
      'reverses oxidative stress',
      'makes skin younger',
    ],
  },
]

export const LAYER_CONTEXT_BY_PATHWAY = Object.fromEntries(
  LAYER_CONTEXT_PANELS.map((panel) => [panel.pathwayId, panel])
) as Record<LayerContextPanel['pathwayId'], LayerContextPanel>
