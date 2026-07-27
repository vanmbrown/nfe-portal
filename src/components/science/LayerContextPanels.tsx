// Imported per-module rather than through the barrel. The barrel re-exports the
// Layer Context and matrix content, and webpack does not tree-shake it back out
// of this client chunk — a barrel import here put every panel and row of prose
// into the client bundle.
import { FAMILY_BY_ID } from '@/content/science/ingredient-families'
import { LAYER_BY_ID } from '@/content/science/layers'
import { SCIENCE_PAGE } from '@/content/science/page'
import { PATHWAY_BY_ID } from '@/content/science/pathways'
import type { LayerContextPanel, PathwayId } from '@/content/science/types'

interface LayerContextPanelsProps {
  panels: LayerContextPanel[]
  /** Pathways currently selected. Empty means the default state. */
  emphasized: PathwayId[]
  headingId: string
}

const { eyebrow, heading, body, zonesLabel } = SCIENCE_PAGE.layerContext

/**
 * Layer Context — the schematic's companion.
 *
 * This is a framed plate directly beneath the map, at the full width of the
 * dark chapter, so the two read as one system rather than as a drawing followed
 * by an unrelated essay. Each panel translates one band of the schematic into a
 * named support zone, a visible appearance context, and how NFE formulates in
 * response.
 *
 * The visual grammar is taken from the earlier implementation, which the
 * founder valued: framed container, numbered zone eyebrows, a vertical
 * zone-colour bar, and a left/right reading structure. What is not taken from
 * it is the data — the old panels ended with chips naming specific actives
 * beneath a line labelled "Formula support", which together asserted the
 * composition of a formula. These name ingredient families only.
 *
 * Presentational and pure. It renders whatever emphasis it is handed and holds
 * no state, so the server-rendered default and every interactive state come
 * from one code path.
 *
 * Behaviour that is deliberate rather than incidental:
 *
 *  - All five panels always render. Selection never filters, hides, reorders or
 *    ranks them. An unemphasised panel keeps full text contrast — only its
 *    border, surface, title colour and bar intensity shift.
 *  - Emphasis carries a visible "In focus" marker, so it never depends on
 *    colour alone.
 *  - Numbers are structural, tied to the schematic order and the matrix order.
 *    They are not priorities and do not change with selection.
 *  - The colour bar is decorative and aria-hidden; the zone name beside it
 *    carries the same information as text.
 */
export function LayerContextPanels({
  panels,
  emphasized,
  headingId,
}: LayerContextPanelsProps) {
  const ordered = [...panels].sort((a, b) => a.order - b.order)

  return (
    <div className="rounded-[1.75rem] border border-nfe-gold/25 bg-white/[0.03] p-5 sm:p-8 lg:p-11">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-gold">{eyebrow}</p>
          <h3
            id={headingId}
            className="mt-4 font-serif text-3xl leading-tight text-nfe-paper md:text-4xl"
          >
            {heading}
          </h3>
        </div>
        <span className="rounded-full border border-nfe-gold/35 px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-nfe-gold">
          {zonesLabel}
        </span>
      </div>

      <p className="mt-6 max-w-2xl leading-8 text-nfe-paper/75">{body}</p>

      <ul aria-labelledby={headingId} className="mt-10 space-y-4 lg:mt-12">
        {ordered.map((panel) => {
          const active = emphasized.includes(panel.pathwayId)
          const pathway = PATHWAY_BY_ID[panel.pathwayId]
          const zone = LAYER_BY_ID[panel.layerIds[0]]

          return (
            <li key={panel.id}>
              <article
                className={`grid gap-x-10 gap-y-7 rounded-2xl border p-5 transition-colors duration-200 ease-out sm:p-7 lg:grid-cols-[0.85fr_1.15fr] lg:p-9 ${
                  active
                    ? 'border-nfe-gold/55 bg-white/[0.07]'
                    : 'border-nfe-paper/12 bg-white/[0.035]'
                }`}
              >
                {/* Left — zone identity and what is visible there. */}
                <div className="flex items-stretch gap-5">
                  <div
                    aria-hidden="true"
                    className="w-3 shrink-0 rounded-full transition-opacity duration-200 ease-out md:w-4"
                    style={{
                      backgroundColor: zone.bandHex,
                      opacity: active || emphasized.length === 0 ? 1 : 0.55,
                    }}
                  />
                  <div>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <span className="text-xs uppercase tracking-[0.22em] text-nfe-paper/70">
                        {String(panel.order).padStart(2, '0')} · {zone.zone}
                      </span>
                      {active ? (
                        <span className="rounded-full border border-nfe-gold/45 px-3 py-1 text-[0.625rem] uppercase tracking-[0.2em] text-nfe-gold">
                          In focus
                        </span>
                      ) : null}
                    </p>

                    <h4
                      className={`mt-3 font-serif text-2xl leading-snug transition-colors duration-200 ease-out md:text-[1.75rem] ${
                        active ? 'text-nfe-gold' : 'text-nfe-paper'
                      }`}
                    >
                      {panel.title}
                    </h4>

                    <p className="mt-4 text-xs uppercase tracking-[0.2em] text-nfe-paper/60">
                      Visible context
                    </p>
                    <p className="mt-2 text-[1.0625rem] leading-8 text-nfe-paper/80">
                      {panel.visibleContext}
                    </p>
                  </div>
                </div>

                {/* Right — how NFE formulates in response. */}
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-nfe-gold/90">
                    Formulation support
                  </p>
                  <p className="mt-2 text-[1.0625rem] leading-8 text-nfe-paper/80">
                    {panel.formulationPrinciple}
                  </p>

                  <p className="mt-7 text-xs uppercase tracking-[0.2em] text-nfe-paper/60">
                    Ingredient families
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {panel.ingredientFamilyIds.map((id) => (
                      <li
                        key={id}
                        className="rounded-full bg-[#f4eadb] px-3.5 py-1.5 text-xs font-medium text-nfe-green-900"
                      >
                        {FAMILY_BY_ID[id].label}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-7 border-t border-nfe-paper/12 pt-5 text-sm leading-6 text-nfe-paper/65">
                    On the map at {panel.layerIds.map((id) => LAYER_BY_ID[id].zone).join(' and ')}
                    {' · '}
                    Explored through the {pathway.label} pathway
                  </p>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
