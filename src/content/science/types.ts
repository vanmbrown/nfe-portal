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
  /** Tailwind class for the schematic band fill. */
  bandClass: string
  /** Tailwind classes for the label chip on dark ground. */
  labelClass: string
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

export type IngredientFamilyId =
  | 'humectants'
  | 'emollients'
  | 'barrier-lipids'
  | 'antioxidant-support'
  | 'tone-supportive'
  | 'peptides'
  | 'botanical-oils'
  | 'sensorial-support'

export interface IngredientFamily {
  id: IngredientFamilyId
  label: string
  /** What the family does, in cosmetic appearance language. */
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

export interface SciencePageContent {
  hero: {
    eyebrow: string
    heading: string
    intro: string
    subIntro: string
  }
  method: ScienceChapter
  mapIntro: {
    eyebrow: string
    heading: string
    body: string
    defaultInterpretation: string
    cosmeticFrameworkNote: string
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
