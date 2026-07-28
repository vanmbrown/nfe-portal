/**
 * The shared ingredient-family taxonomy.
 *
 * One authoritative source for family ids, labels, descriptions and order,
 * used by both Science and Ingredients. Science explains what a family is for;
 * Ingredients shows which ingredients sit inside it. Neither may define its own
 * copy of a family, or the two pages drift apart and the links between them
 * rot.
 *
 * The ids are public URLs — they appear as `/inci#humectants` in links,
 * bookmarks and shared addresses. Treat them as stable architecture: lowercase,
 * hyphenated, no punctuation, never derived from a display label at runtime.
 */

export type IngredientFamilyId =
  | 'humectants'
  | 'emollients'
  | 'barrier-supportive-lipids'
  | 'tone-supportive-cosmetic-ingredients'
  | 'peptides'
  | 'antioxidant-supportive-ingredients'
  | 'botanical-oils'
  | 'sensorial-support'

/**
 * A family's identity: what it is called and where it lives.
 *
 * Deliberately small. Science renders family labels inside its client island,
 * so anything on this type ships to the browser. Prose belongs on
 * IngredientFamilyCopy, which only Ingredients imports.
 */
export interface IngredientFamily {
  /** Stable anchor id. Public URL surface — do not change casually. */
  id: IngredientFamilyId
  /** Canonical display label. The only place this text is written. */
  label: string
  /** Deterministic order on Ingredients. Never sorted by anything else. */
  order: number
}

/**
 * A family's prose. Rendered only on Ingredients, so it is kept apart from the
 * identity above and never reaches the Science client bundle.
 */
export interface IngredientFamilyCopy {
  id: IngredientFamilyId
  /** Claims-safe description of the family's cosmetic role. */
  description: string
  /**
   * Wording this family must never drift into. Retained in content so the
   * claims-governance test can assert against it directly.
   */
  claimsBoundary: string[]
}

/**
 * One ingredient as it appears in the family view.
 *
 * `sourceName` is the entry's name in data/education/ingredientGlossary.json,
 * which is the approved compendium and the only place these names come from.
 * Nothing here asserts that an ingredient is in any particular product — see
 * membership.ts for why that boundary matters.
 */
export interface FamilyIngredient {
  /** Stable id, derived once at authoring time, not from the label at runtime. */
  id: string
  /** Display name, taken verbatim from the glossary entry. */
  name: string
  /** Concise cosmetic function, taken from the glossary entry. */
  role: string
  /** Families this ingredient belongs to. An ingredient may sit in more than one. */
  familyIds: IngredientFamilyId[]
}
