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
 * origin marker, so a normal visit to this page is exactly as it was. It
 * appears once, near the top, as quiet editorial orientation — a bookmark back
 * into the maison rather than a conversion device. Nothing sticky, nothing
 * floating, no banner, no repetition under each family.
 *
 * The destination is built by `buildScienceReturnHref` from a fixed path and
 * validated ids. This component cannot be pointed anywhere else: it accepts no
 * URL, and there is no returnTo parameter to abuse.
 *
 * Server-rendered and a plain anchor, so it works without JavaScript, and
 * middle-click, keyboard and browser Back all behave normally.
 *
 * The copy is careful on purpose. Nothing was saved and nothing was restored
 * from a record — the pathways were reconstructed from the URL the visitor was
 * already carrying — so the supporting line appears only when there are
 * pathways to continue with, and never claims a session, a profile or a result.
 */
export function ScienceReturnLink({ pathwayIds }: ScienceReturnLinkProps) {
  const hasPathways = pathwayIds.length > 0

  return (
    <div className="mt-10 border-l-2 border-[#C9A66B]/40 pl-5">
      <p>
        <Link
          href={buildScienceReturnHref(pathwayIds)}
          className="text-sm uppercase tracking-[0.18em] text-[#0E2A22] underline decoration-[#C9A66B]/60 underline-offset-8 transition-colors hover:text-[#0E2A22]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] focus-visible:ring-offset-2"
        >
          {/* Decorative. The link's accessible name is the visible label. */}
          <span aria-hidden="true">&larr;</span> Return to your Science Map
        </Link>
      </p>

      {hasPathways ? (
        <p className="mt-3 text-sm leading-6 text-[#0E2A22]/70">
          Continue with the pathways you were exploring.
        </p>
      ) : null}
    </div>
  )
}
