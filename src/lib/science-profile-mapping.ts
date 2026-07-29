import { PATHWAYS } from '@/content/science/pathways'
import type { PathwayId } from '@/content/science/types'

/**
 * Resolve chosen profile options to pathways.
 *
 * This is the one place the ordering and deduplication rule lives, and it is
 * deliberately tiny and prose-free.
 *
 * The reason it is not in `skin-profile.ts` with the options is measured: the
 * mapping function there reads the option arrays, so importing it into the
 * client island pulled every label into the browser bundle and took the
 * Science chunk from 25,768 to 33,320 bytes. Taking already-selected options as
 * an argument breaks that link — the builder passes what the visitor chose, and
 * the labels stay on the server where they travel as data.
 *
 * Canonical order, never selection order, so the same description always reads
 * the same way and the order never suggests one pathway matters more.
 */
export function collectPathways(
  chosen: readonly { pathways: readonly PathwayId[] }[]
): PathwayId[] {
  const wanted = new Set<PathwayId>()
  for (const option of chosen) {
    for (const id of option.pathways) wanted.add(id)
  }
  return PATHWAYS.map((pathway) => pathway.id).filter((id) => wanted.has(id))
}
