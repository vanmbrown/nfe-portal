import Link from 'next/link'

import type { PathwayId } from '@/content/science/types'
import { buildScienceReturnHref } from '@/lib/science-pathway-state'

interface ScienceReturnLinkProps {
  /** Validated pathway ids from the incoming URL. May be empty. */
  pathwayIds: readonly PathwayId[]
}

/**
 * A way back to the Science map, for a visitor who arrived from it.
 *
 * Ingredients renders this only when the incoming URL carries the Science
 * origin marker, so a normal visit to this page is exactly as it was.
 *
 * It travels with the viewport rather than sitting in the page. A visitor who
 * follows a family link lands deep in the document — Sensorial support is past
 * eight sections — and an element in the flow near the top would already be
 * scrolled away before she ever saw it. `position: fixed` is what keeps it
 * visible wherever she lands and for as long as she reads; a `sticky` element
 * would stop following once its own section ended.
 *
 * Placement is measured rather than assumed. The reading column on Ingredients
 * leaves 88px of right margin at 1440 and 15px at every narrower width, so a
 * side rail would sit on top of the text at every size. A compact pill in the
 * bottom corner clears the column instead, and below `md` it becomes a bar
 * inset from both edges.
 *
 * `pointer-events-none` on the wrapper with `pointer-events-auto` on the link
 * means the invisible box beside the pill never intercepts a click meant for
 * the page underneath.
 *
 * `z-40` is deliberate. The cookie consent dialog is fixed at `z-50`, and a
 * consent decision should outrank navigation, so on a first visit the banner
 * covers this until it is answered.
 *
 * No scroll listener, no observer, no state, no dismiss control — the position
 * is CSS, so it costs nothing at runtime and cannot fall out of step with the
 * page. Server-rendered and a plain anchor, so it works without JavaScript and
 * middle-click, keyboard and browser Back all behave normally.
 *
 * The copy is careful. Nothing was saved and nothing was restored from a
 * record: the pathways were reconstructed from the URL the visitor was already
 * carrying. No wording claims a session, a profile, results or a diagnosis.
 */
export function ScienceReturnLink({ pathwayIds }: ScienceReturnLinkProps) {
  return (
    <aside
      aria-label="Science navigation"
      // Safe-area padding sits on the wrapper so the pill lifts clear of a
      // phone's home indicator. It resolves to zero everywhere else.
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className="pointer-events-none fixed inset-x-4 bottom-4 z-40 md:inset-x-auto md:bottom-6 md:right-6 lg:bottom-8 lg:right-8"
    >
      <Link
        href={buildScienceReturnHref(pathwayIds)}
        className="pointer-events-auto flex min-h-[44px] w-full items-center justify-center gap-3 rounded-full border border-[#C9A66B]/45 bg-[#0E2A22] px-6 py-3 text-sm uppercase tracking-[0.16em] text-[#F4EADB] shadow-[0_6px_24px_rgba(14,42,34,0.18)] transition-colors hover:bg-[#143026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F5F3] md:w-auto"
      >
        {/* Decorative. The link's accessible name is the visible label. */}
        <span aria-hidden="true">&larr;</span>
        <span>Return to your Science Map</span>
      </Link>
    </aside>
  )
}
