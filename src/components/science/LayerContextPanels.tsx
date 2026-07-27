import {
  FAMILY_BY_ID,
  LAYER_BY_ID,
  PATHWAY_BY_ID,
  type LayerContextPanel,
  type PathwayId,
} from '@/content/science'

interface LayerContextPanelsProps {
  panels: LayerContextPanel[]
  /** Pathways currently selected. Empty means the default state. */
  emphasized: PathwayId[]
  headingId: string
}

/**
 * Layer Context — five editorial readings of the map above.
 *
 * Presentational and pure, like SkinLayerSchematic. It renders whatever
 * emphasis it is handed and holds no state, so the server-rendered default and
 * every interactive state come from the same code path.
 *
 * Behaviour that is deliberate rather than incidental:
 *
 *  - All five panels are always rendered. Selection never filters, hides,
 *    reorders or ranks them. A panel that is not emphasised keeps full text
 *    contrast — only its container and title shift.
 *  - Emphasis is signalled by border, background, title colour *and* a visible
 *    "In focus" marker, so it never depends on colour alone.
 *  - Order is the content's `order` field, surface downward, mirroring the
 *    schematic bands. It does not change with selection.
 *  - Ingredient families are named as families. No panel names a specific
 *    ingredient, and none asserts what is in a product.
 */
export function LayerContextPanels({
  panels,
  emphasized,
  headingId,
}: LayerContextPanelsProps) {
  const ordered = [...panels].sort((a, b) => a.order - b.order)

  return (
    <ul aria-labelledby={headingId} className="mt-14 space-y-px">
      {ordered.map((panel) => {
        const active = emphasized.includes(panel.pathwayId)
        const pathway = PATHWAY_BY_ID[panel.pathwayId]

        return (
          <li key={panel.id}>
            <article
              className={`grid gap-x-12 gap-y-6 border-l-2 px-6 py-10 transition-colors duration-200 ease-out md:grid-cols-[0.95fr_1.05fr] md:px-10 md:py-12 ${
                active
                  ? 'border-l-nfe-gold bg-white/[0.055]'
                  : 'border-l-nfe-paper/15 bg-white/[0.015]'
              }`}
            >
              <div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs uppercase tracking-[0.24em] text-nfe-paper/65">
                  <span>
                    {String(panel.order).padStart(2, '0')} · {pathway.label}
                  </span>
                  {active ? (
                    <span className="rounded-full border border-nfe-gold/45 px-3 py-1 text-[0.625rem] tracking-[0.2em] text-nfe-gold">
                      In focus
                    </span>
                  ) : null}
                </p>

                <h4
                  className={`mt-4 font-serif text-2xl leading-snug transition-colors duration-200 ease-out md:text-3xl ${
                    active ? 'text-nfe-gold' : 'text-nfe-paper'
                  }`}
                >
                  {panel.title}
                </h4>

                <p className="mt-5 text-[1.0625rem] leading-8 text-nfe-paper/78">
                  {panel.visibleContext}
                </p>
              </div>

              <div className="md:pt-11">
                <p className="text-xs uppercase tracking-[0.2em] text-nfe-gold/85">
                  How NFE supports it
                </p>
                <p className="mt-4 text-[1.0625rem] leading-8 text-nfe-paper/78">
                  {panel.formulationPrinciple}
                </p>

                <p className="mt-7 text-xs uppercase tracking-[0.2em] text-nfe-paper/55">
                  Ingredient families
                </p>
                <p className="mt-3 leading-7 text-nfe-paper/72">
                  {panel.ingredientFamilyIds
                    .map((id) => FAMILY_BY_ID[id].label)
                    .join(' · ')}
                </p>

                <p className="mt-6 text-sm leading-6 text-nfe-paper/60">
                  Read on the map at{' '}
                  {panel.layerIds.map((id) => LAYER_BY_ID[id].zone).join(' and ')}.
                </p>
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
