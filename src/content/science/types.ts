/**
 * Structured content model for the NFE Science experience.
 *
 * Phase 1 of the Science Authority & Guided Education System
 * (docs/strategy/SCIENCE_AUTHORITY_GUIDED_EDUCATION_BLUEPRINT.md).
 *
 * Two rules govern every type in this file:
 *
 * 1. Nothing here may hold a score, severity, rank, or profile label. A
 *    pathway is a topic the visitor chooses to read about, never a
 *    classification of the visitor. The non-diagnostic boundary is enforced
 *    by the shape of the data, not by a disclaimer.
 *
 * 2. Every string in these types is customer-facing. Authoring notes, claims
 *    strategy, and brand shorthand do not belong in any field. The previous
 *    implementation carried an `expectation` field that mixed the two and
 *    leaked instructions such as "Use careful cosmetic language" into
 *    production. There is deliberately no equivalent field here.
 */

/** The five approved educational doorways. Topics, not conditions. */
export type PathwayId =
  | 'barrier-comfort'
  | 'hydration'
  | 'tone-integrity'
  | 'texture-suppleness'
  | 'visible-resilience'

/** Cosmetic appearance zones used by the schematic. Not anatomical claims. */
export type LayerId =
  | 'surface'
  | 'barrier'
  | 'tone'
  | 'texture'
  | 'radiance'

export interface SkinLayer {
  id: LayerId
  /** Short label rendered beside the schematic. */
  label: string
  /** Cosmetic zone name, e.g. "Surface hydration". */
  zone: string
  /** What a visitor may notice in this zone. Appearance language only. */
  visibleContext: string
  /** How NFE thinks about supporting this zone cosmetically. */
  formulationContext: string
  /**
   * The zone's colour, as a plain hex.
   *
   * One token, read by both the schematic band and the Layer Context colour
   * bar, so the two can never drift apart — the bar is the visual bridge
   * between the drawing and its explanation.
   *
   * Deliberately not a Tailwind class. This file lives outside the Tailwind
   * content globs, so an arbitrary class here would never be generated. The
   * previous `bandClass` and `labelClass` fields were exactly that: populated,
   * never read, and unusable if they had been.
   */
  bandHex: string
}

export interface EducationalPathway {
  id: PathwayId
  /** Doorway label. Must read as a topic, never as a symptom or condition. */
  label: string
  /** One line shown on the control itself. */
  invitation: string
  /** Layers this pathway brings attention to. Emphasis only — never filtering. */
  emphasizedLayers: LayerId[]
  /** Editorial explanation shown in the interpretation panel. */
  interpretation: string
  /** How NFE approaches this cosmetically. */
  formulationPrinciple: string
  /** Ingredient families relevant to this pathway, by id. */
  ingredientFamilies: IngredientFamilyId[]
  /** A short ritual connection. Explains why, never how — Ritual owns how. */
  ritualConnection: string
  /**
   * Wording this pathway must never drift into. Retained in content so the
   * claims-governance test can assert against it directly.
   */
  claimsBoundary: string[]
}

/**
 * Re-exported from the shared ingredient taxonomy.
 *
 * Science does not define its own family ids or labels. Both live in
 * src/content/ingredients, so a family named here and a section rendered on
 * Ingredients cannot drift apart and the links between them cannot rot.
 */
import type { IngredientFamilyId } from '../ingredients/types'

export type { IngredientFamilyId }

export interface IngredientFamily {
  id: IngredientFamilyId
  /**
   * What the family does, in Science's voice. The canonical label lives in the
   * shared taxonomy and is resolved at render time, never restated here.
   */
  role: string
  /**
   * Representative examples drawn from NFE's published ingredient glossary
   * (data/education/ingredientGlossary.json).
   *
   * These name a family's character. They are deliberately NOT presented as
   * the composition of any specific product — Ingredients owns per-product
   * INCI, and the glossary and product INCI are not currently reconciled.
   * See the Phase 1 implementation record in the blueprint.
   */
  representativeExamples: string[]
}

/**
 * A Layer Context panel: one editorial reading of one part of the map.
 *
 * Panels reference pathways, layers and ingredient families by id rather than
 * restating their labels, so those remain single-sourced. What a panel owns is
 * its own prose — Layer Context is written to reward slower reading, and the
 * matrix is written to be understood at a glance, so the two deliberately do
 * not share sentences.
 *
 * `order` is explicit rather than implied by array position. Panel order is a
 * property of the content and never changes with selection: panels read from
 * the skin surface downward, mirroring the schematic bands above them.
 */
export interface LayerContextPanel {
  id: string
  /** Canonical position, surface downward. Never reordered by selection. */
  order: number
  /** The pathway whose selection brings this panel forward. */
  pathwayId: PathwayId
  /** Editorial title for the panel. */
  title: string
  /** What a visitor may notice. Appearance language only. */
  visibleContext: string
  /** How NFE approaches this cosmetically. */
  formulationPrinciple: string
  /** Ingredient families relevant here, by id. */
  ingredientFamilyIds: IngredientFamilyId[]
  /** Map zones this panel interprets, by id. */
  layerIds: LayerId[]
  /**
   * Wording this panel must never drift into. Retained in content so the
   * claims-governance test can assert against it directly.
   */
  claimsBoundary: string[]
}

/**
 * A Concern-to-Formula Matrix row.
 *
 * The matrix is a compressed reading of the same relationships the panels
 * explain at length. Rows carry short noun phrases built for scanning.
 *
 * There is deliberately no `claimsBoundary` here: a row's boundary is the
 * boundary of the pathway it belongs to, reachable through `pathwayId`. A
 * second copy would be a second source of truth.
 *
 * `ingredientFamilyIds` is the only ingredient reference a row may hold. Rows
 * never name a specific ingredient and never assert the composition of a
 * product — see ingredient-families.ts for why.
 */
export interface ConcernFormulaMatrixRow {
  id: string
  /** Canonical position. Never reordered or sorted by selection. */
  order: number
  /** The pathway whose selection brings this row forward. */
  pathwayId: PathwayId
  /** Column 1 — what the visitor is exploring. Never a diagnosis. */
  explorationLabel: string
  /** Column 2 — where this is read on the map. */
  layerContext: string
  /** Column 3 — how NFE approaches it. */
  formulationPrinciple: string
  /** Column 4 — ingredient families, by id. Never product composition. */
  ingredientFamilyIds: IngredientFamilyId[]
}

export interface FormulationPrinciple {
  id: string
  title: string
  body: string
}

export interface ProofStage {
  id: string
  title: string
  body: string
}

export interface ScienceChapter {
  id: string
  eyebrow: string
  heading: string
  body: string[]
}

export interface ProductContext {
  eyebrow: string
  heading: string
  body: string
  links: { label: string; href: string }[]
}

export interface ConciergeInvitation {
  eyebrow: string
  heading: string
  body: string
  link: { label: string; href: string }
}

export interface FounderNote {
  eyebrow: string
  heading: string
  body: string
}

/**
 * One step in the method orientation.
 *
 * Steps describe what the visitor does and what happens as a result. They are
 * not stages of an assessment: nothing here may hold an outcome, a score, a
 * rank, or a state the visitor carries away from the page.
 */
export interface ScienceMethodStep {
  id: string
  /** Small uppercase marker, e.g. "Step 1". Position, not progress. */
  stepLabel: string
  title: string
  description: string
}

export interface ScienceMethodContent {
  eyebrow: string
  heading: string
  introduction: string
  steps: ScienceMethodStep[]
  /** Anchor label. Navigation only — never a form action. */
  ctaLabel: string
  /** In-page anchor to the pathway section. */
  ctaHref: string
}

/**
 * The framing above the pathway controls.
 *
 * "Profile" here is founder-approved editorial language for a temporary,
 * page-local view. It is not a record, a score, a diagnosis or an account, and
 * `boundary` and `privacy` are what keep that plain to the reader rather than
 * only to us. There is deliberately no field on this type that could hold a
 * result.
 */
export interface ScienceProfileIntroContent {
  eyebrow: string
  heading: string
  description: string
  /** "An interpretive guide, not a diagnosis." */
  boundary: string
  /** "Nothing is saved or submitted." Verified true against executable code. */
  privacy: string
  /** Stable anchor id — the CTA's destination and a public URL fragment. */
  anchorId: string
}

/**
 * One layer card in the Layer Science module.
 *
 * Editorial context for a named skin layer. Cards describe what is *seen* or
 * *felt* at a layer; none of them claims that a product acts there.
 */
export interface LayerScienceCard {
  id: string
  title: string
  body: string
}

export interface LayerScienceIntroContent {
  eyebrow: string
  heading: string
  description: string
  cards: LayerScienceCard[]
}

export interface SciencePageContent {
  hero: {
    eyebrow: string
    heading: string
    intro: string
    subIntro: string
  }
  method: ScienceChapter
  scienceMethod: ScienceMethodContent
  profileIntro: ScienceProfileIntroContent
  layerScience: LayerScienceIntroContent
  mapIntro: {
    eyebrow: string
    heading: string
    body: string
    defaultInterpretation: string
    cosmeticFrameworkNote: string
  }
  layerContext: {
    eyebrow: string
    heading: string
    body: string
    /** Supporting label beside the heading. Names what the panels are. */
    zonesLabel: string
  }
  formulaMatrix: {
    eyebrow: string
    heading: string
    body: string
    /** Column headers, in order. The row shape in ConcernFormulaMatrixRow follows this. */
    columns: [string, string, string, string]
    /** Table caption. Read by assistive technology, visually hidden. */
    caption: string
  }
  formulationPrinciples: FormulationPrinciple[]
  proof: {
    eyebrow: string
    heading: string
    stages: ProofStage[]
  }
  founderNote: FounderNote
  productContext: ProductContext
  concierge: ConciergeInvitation
  closingDisclaimer: string
}
