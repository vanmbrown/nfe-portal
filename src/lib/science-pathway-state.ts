import { familyHref } from '@/content/ingredients/families'
import type { IngredientFamilyId } from '@/content/ingredients/types'
import { PATHWAYS } from '@/content/science/pathways'
import type { PathwayId } from '@/content/science/types'

/**
 * Validated URL state for the Science → Ingredients → Science journey.
 *
 * A visitor exploring pathways on Science can follow an ingredient-family link
 * to Ingredients and come back to the same focused view. The pathways she was
 * reading travel in the URL and nowhere else.
 *
 * What that deliberately is not:
 *
 *  - not storage. No localStorage, sessionStorage, cookie or IndexedDB.
 *  - not a record. Nothing is written to a database, sent to an API, or tied to
 *    a person. The state exists only as long as the address bar holds it.
 *  - not a profile, score, rank or diagnosis. A pathway is a topic the visitor
 *    chose to read about, and the URL carries topics, not conclusions.
 *
 * The security boundary is the reason this file exists at all rather than the
 * URLs being assembled inline at each call site.
 *
 *  - No caller can supply a destination. `buildScienceReturnHref` returns a
 *    path built from the SCIENCE_PATH constant; there is no `returnTo`
 *    parameter, and no function here accepts a URL. An open redirect is not
 *    possible because there is nothing to redirect to but the fixed route.
 *  - Nothing trusts the query string. Every value arriving from a public URL
 *    is checked against the canonical pathway ids and dropped if it does not
 *    match exactly, so an id can never be echoed back into a link or into the
 *    page. Malformed input returns an empty array; nothing here throws.
 *  - Serialization is validated too, not just parsing. A caller that passes a
 *    bad id gets it filtered out rather than written into a URL.
 *
 * Both the canonical order and the family anchor come from their existing
 * sources — PATHWAYS and familyHref — so a URL built here cannot drift from
 * the page it points at.
 *
 * Server-safe and client-safe: no window, no document, no Next runtime import.
 */

/** The Science route. Fixed. The only destination a return link may have. */
export const SCIENCE_PATH = '/science'

/** Anchor on the interactive Science chapter — pathway controls and the map. */
export const SCIENCE_MAP_ANCHOR = 'science-map'

/** Query parameter carrying the selected pathway ids. */
export const PATHWAYS_PARAM = 'pathways'

/** Query parameter marking a visitor who arrived from Science. */
export const ORIGIN_PARAM = 'from'

/** The only accepted value of the origin marker. */
export const SCIENCE_ORIGIN = 'science'

/**
 * What a Next.js `searchParams` entry can be: absent, one value, or repeated.
 * All three are handled; none of them is trusted.
 */
export type SearchParamValue = string | string[] | undefined

/**
 * Canonical id order, taken from the pathway content so there is one source of
 * truth. Restored selections always read in this order, never in the order the
 * visitor clicked or the order the query happened to list — the same set of
 * pathways therefore always produces the same URL and the same page.
 */
const CANONICAL_PATHWAY_IDS: readonly PathwayId[] = PATHWAYS.map(
  (pathway) => pathway.id
)

const CANONICAL_PATHWAY_ID_SET: ReadonlySet<string> = new Set(
  CANONICAL_PATHWAY_IDS
)

function toValues(value: SearchParamValue): string[] {
  if (value === undefined) return []
  const values = Array.isArray(value) ? value : [value]
  return values.filter((entry): entry is string => typeof entry === 'string')
}

/**
 * Read pathway ids out of a public query string.
 *
 * Accepts `?pathways=a,b`, a repeated `?pathways=a&pathways=b`, and any mixture
 * of the two. Unknown ids are discarded, duplicates collapse, empty segments
 * are ignored, and the result is returned in canonical order. Invalid or
 * missing input yields an empty array.
 *
 * This never throws. It is reached by anything a visitor, a crawler or a
 * scanner can put in the address bar.
 */
export function parsePathwayQuery(value: SearchParamValue): PathwayId[] {
  const found = new Set<string>()

  for (const raw of toValues(value)) {
    for (const candidate of raw.split(',')) {
      const trimmed = candidate.trim()
      if (!trimmed) continue
      if (!CANONICAL_PATHWAY_ID_SET.has(trimmed)) continue
      found.add(trimmed)
    }
  }

  return CANONICAL_PATHWAY_IDS.filter((id) => found.has(id))
}

/**
 * Render pathway ids for a URL, or `undefined` when there are none.
 *
 * `undefined` rather than an empty string, so a caller cannot emit a bare
 * `pathways=` that parses back to nothing.
 *
 * Validation runs here as well as in the parser. Every id is checked against
 * the canonical set even though the type says it is already one, because the
 * output of this function goes into a public URL and types do not survive the
 * boundary the values crossed to get here.
 */
export function serializePathwayIds(
  ids: readonly PathwayId[]
): string | undefined {
  const wanted = new Set<string>(ids)
  const canonical = CANONICAL_PATHWAY_IDS.filter((id) => wanted.has(id))
  return canonical.length > 0 ? canonical.join(',') : undefined
}

/**
 * Whether a request carries the Science origin marker.
 *
 * Deliberately strict: exactly one value, exactly `science`. `?from=other`,
 * `?from=SCIENCE` and a repeated marker are all rejected, so the contextual
 * return module appears only for the journey it was built for and a normal
 * visit to Ingredients is untouched.
 */
export function isScienceOrigin(value: SearchParamValue): boolean {
  const values = toValues(value)
  return values.length === 1 && values[0].trim() === SCIENCE_ORIGIN
}

/**
 * The return destination from Ingredients back to the Science map.
 *
 * The path is the SCIENCE_PATH constant and the anchor is SCIENCE_MAP_ANCHOR.
 * Only the validated pathway ids vary. There is no parameter through which a
 * caller — or a crafted inbound URL — could influence where this points.
 */
export function buildScienceReturnHref(ids: readonly PathwayId[]): string {
  const pathways = serializePathwayIds(ids)
  const query = pathways ? `?${PATHWAYS_PARAM}=${pathways}` : ''
  return `${SCIENCE_PATH}${query}#${SCIENCE_MAP_ANCHOR}`
}

/**
 * An ingredient-family link that carries the visitor's current reading state.
 *
 * The path and anchor come from `familyHref`, so this cannot point at a
 * section that does not exist; only the query is added. The origin marker is
 * always present — it is what tells Ingredients to offer a way back — while
 * the pathway parameter appears only when something is selected.
 *
 * Values are safe to interpolate unencoded: family ids and pathway ids are
 * lowercase-and-hyphen tokens from closed sets, and a test asserts that.
 * Nothing a visitor typed reaches this string.
 */
export function buildIngredientFamilyHref(
  familyId: IngredientFamilyId,
  ids: readonly PathwayId[]
): string {
  const [path, anchor] = familyHref(familyId).split('#')
  const pathways = serializePathwayIds(ids)
  const query = pathways
    ? `?${ORIGIN_PARAM}=${SCIENCE_ORIGIN}&${PATHWAYS_PARAM}=${pathways}`
    : `?${ORIGIN_PARAM}=${SCIENCE_ORIGIN}`

  return `${path}${query}#${anchor}`
}
