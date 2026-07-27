'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'

// Per-module, not the barrel — see LayerContextPanels for why.
import { INGREDIENT_FAMILIES } from '@/content/science/ingredient-families'
import { LAYER_BY_ID, SKIN_LAYERS } from '@/content/science/layers'
import { SCIENCE_PAGE } from '@/content/science/page'
import { PATHWAYS } from '@/content/science/pathways'
import type {
  ConcernFormulaMatrixRow,
  IngredientFamilyId,
  LayerContextPanel,
  LayerId,
  PathwayId,
} from '@/content/science/types'

import { ConcernFormulaMatrix } from './ConcernFormulaMatrix'
import { LayerContextPanels } from './LayerContextPanels'
import { SkinLayerSchematic } from './SkinLayerSchematic'

/**
 * The interactive Science chapter, and the only interactive element on the
 * Science page.
 *
 * It owns one piece of state — the set of selected pathways — and three
 * modules read from it: the Skin Layer Intelligence Map, Layer Context, and the
 * Concern-to-Formula Matrix. They live in one island rather than three so there
 * is a single authoritative selection; the rest of the page stays server-
 * rendered. Each module is a pure child that renders the emphasis it is handed.
 *
 * Layer Context and matrix content arrive as props rather than being imported
 * here. Importing them pulled their prose into the client bundle, which took
 * the page chunk from 16,579 to 28,964 bytes and cost about three Lighthouse
 * Performance points. As props they travel as data in the server payload
 * instead of as code to parse. The server owns the content; this island owns
 * only the interaction.
 *
 * What this deliberately does not do:
 *  - it does not build a profile, score, rank, or classify anything
 *  - it does not persist: no localStorage, no sessionStorage, no cookie
 *  - it does not call an API or submit anything
 *  - it does not emit analytics; the previous implementation put the visitor's
 *    selected skin type into an event payload, which is removed here
 *  - it does not require a selection: the default state is complete and
 *    meaningful, and the surrounding page is fully readable without it
 *
 * Multi-selection is supported and deterministic: emphasis is the union of the
 * selected pathways' layers, and interpretation is rendered in the canonical
 * PATHWAYS order rather than click order, so the same set always reads the
 * same way. No combined labels are generated.
 */
interface ScienceMapExperienceProps {
  layerContextPanels: LayerContextPanel[]
  matrixRows: ConcernFormulaMatrixRow[]
}

export function ScienceMapExperience({
  layerContextPanels,
  matrixRows,
}: ScienceMapExperienceProps) {
  const [selected, setSelected] = useState<PathwayId[]>([])
  const firstPathwayRef = useRef<HTMLButtonElement>(null)

  const activePathways = useMemo(
    () => PATHWAYS.filter((pathway) => selected.includes(pathway.id)),
    [selected]
  )

  const emphasizedLayers = useMemo<LayerId[]>(() => {
    const set = new Set<LayerId>()
    for (const pathway of activePathways) {
      for (const layer of pathway.emphasizedLayers) set.add(layer)
    }
    // Preserve canonical layer order, not selection order.
    return SKIN_LAYERS.map((layer) => layer.id).filter((id) => set.has(id))
  }, [activePathways])

  const families = useMemo(() => {
    // Canonical family order, deduplicated — not selection order.
    const wanted = new Set<IngredientFamilyId>()
    for (const pathway of activePathways) {
      for (const family of pathway.ingredientFamilies) wanted.add(family)
    }
    return INGREDIENT_FAMILIES.filter((family) => wanted.has(family.id))
  }, [activePathways])

  function togglePathway(id: PathwayId) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  function clearPathways() {
    // "Clear pathways" only exists while something is selected, so activating
    // it destroys the control the user is standing on. Without this, focus
    // falls to <body> and a keyboard user loses their place entirely. Move
    // focus to the start of the group first, while that node is still mounted.
    firstPathwayRef.current?.focus()
    setSelected([])
  }

  const hasSelection = activePathways.length > 0

  const announcement = hasSelection
    ? `Exploring ${activePathways.map((p) => p.label).join(', ')}. Bringing forward ${emphasizedLayers
        .map((id) => LAYER_BY_ID[id].zone)
        .join(', ')}.`
    : 'Showing all layers.'

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12">
      {/* Pathway selector. On mobile this sits above the schematic. */}
      <div className="mx-auto max-w-3xl">
        <h3
          id="nfe-pathways-label"
          className="font-serif text-2xl text-nfe-gold md:text-3xl"
        >
          Choose a pathway, or read the layers as they are.
        </h3>
        <p className="mt-3 text-sm leading-6 text-nfe-paper/70">
          Each pathway is a way into the map. Choosing one brings a relationship
          forward — it does not assess your skin, and nothing is saved.
        </p>
      </div>

      <div
        role="group"
        aria-labelledby="nfe-pathways-label"
        className="mt-8 flex flex-wrap gap-3"
      >
        {PATHWAYS.map((pathway, index) => {
          const active = selected.includes(pathway.id)
          return (
            <button
              key={pathway.id}
              ref={index === 0 ? firstPathwayRef : undefined}
              type="button"
              onClick={() => togglePathway(pathway.id)}
              aria-pressed={active}
              className={`min-h-[44px] rounded-full border px-5 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nfe-gold focus-visible:ring-offset-2 focus-visible:ring-offset-nfe-green-900 ${
                active
                  ? 'border-nfe-gold bg-nfe-gold text-nfe-green-900'
                  : 'border-nfe-paper/30 text-nfe-paper/85 hover:border-nfe-gold/70'
              }`}
            >
              <span className="block font-medium uppercase tracking-[0.14em]">
                {pathway.label}
              </span>
              <span
                className={`mt-1 block text-xs leading-5 ${
                  active ? 'text-nfe-green-900/80' : 'text-nfe-paper/60'
                }`}
              >
                {pathway.invitation}
              </span>
            </button>
          )
        })}

        {hasSelection ? (
          <button
            type="button"
            onClick={clearPathways}
            className="min-h-[44px] rounded-full border border-nfe-paper/25 px-5 py-3 text-sm uppercase tracking-[0.14em] text-nfe-paper/75 transition-colors hover:border-nfe-paper/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nfe-gold focus-visible:ring-offset-2 focus-visible:ring-offset-nfe-green-900"
          >
            Clear pathways
          </button>
        ) : null}
      </div>

      {/* Concise, polite announcement of interpretation changes only. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {/* Schematic + interpretation. Two columns on desktop, stacked on mobile. */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        {/* Minimal padding on mobile so the schematic keeps as much width as
            possible and its labels stay legible without zooming. */}
        <div className="rounded-[1.75rem] border border-nfe-paper/12 bg-white/[0.04] p-2 md:p-7">
          <SkinLayerSchematic layers={SKIN_LAYERS} emphasized={emphasizedLayers} />
        </div>

        <div className="lg:pt-4">
          {hasSelection ? (
            <div className="space-y-10">
              {activePathways.map((pathway) => (
                <article key={pathway.id}>
                  <p className="text-xs uppercase tracking-[0.28em] text-nfe-gold">
                    You are exploring
                  </p>
                  <h4 className="mt-3 font-serif text-2xl text-nfe-paper md:text-3xl">
                    {pathway.label}
                  </h4>
                  <p className="mt-4 leading-7 text-nfe-paper/78">
                    {pathway.interpretation}
                  </p>
                  <p className="mt-5 text-sm uppercase tracking-[0.2em] text-nfe-gold/85">
                    Within the skin
                  </p>
                  <p className="mt-2 leading-7 text-nfe-paper/72">
                    {pathway.emphasizedLayers
                      .map((id) => LAYER_BY_ID[id].zone)
                      .join(' · ')}
                  </p>
                  <p className="mt-5 text-sm uppercase tracking-[0.2em] text-nfe-gold/85">
                    NFE approaches this through
                  </p>
                  <p className="mt-2 leading-7 text-nfe-paper/72">
                    {pathway.formulationPrinciple}
                  </p>
                  <p className="mt-5 text-sm uppercase tracking-[0.2em] text-nfe-gold/85">
                    Related ritual context
                  </p>
                  <p className="mt-2 leading-7 text-nfe-paper/72">
                    {pathway.ritualConnection}{' '}
                    <Link
                      href="/ritual"
                      className="underline decoration-nfe-gold/50 underline-offset-4 hover:text-nfe-paper"
                    >
                      Ritual
                    </Link>
                  </p>
                </article>
              ))}

              {families.length ? (
                <div className="border-t border-nfe-paper/12 pt-8">
                  <p className="text-sm uppercase tracking-[0.2em] text-nfe-gold/85">
                    Relevant ingredient families
                  </p>
                  <ul className="mt-4 space-y-3">
                    {families.map((family) => (
                      <li key={family.id} className="leading-7 text-nfe-paper/72">
                        <span className="text-nfe-paper">{family.label}</span> —{' '}
                        {family.role}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm leading-6 text-nfe-paper/55">
                    Individual ingredients, and what is in each formula, live on{' '}
                    <Link
                      href="/inci"
                      className="underline decoration-nfe-gold/50 underline-offset-4 hover:text-nfe-paper"
                    >
                      Ingredients
                    </Link>
                    .
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-nfe-gold">
                All layers
              </p>
              <p className="mt-4 text-lg leading-8 text-nfe-paper/80">
                {SCIENCE_PAGE.mapIntro.defaultInterpretation}
              </p>
              <ul className="mt-8 space-y-5">
                {SKIN_LAYERS.map((layer) => (
                  <li key={layer.id}>
                    <p className="font-serif text-xl text-nfe-paper">{layer.zone}</p>
                    <p className="mt-2 leading-7 text-nfe-paper/68">
                      {layer.visibleContext}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <p className="mt-12 max-w-3xl text-sm leading-6 text-nfe-paper/55">
        {SCIENCE_PAGE.mapIntro.cosmeticFrameworkNote}
      </p>

      {/* Layer Context — reads the map above. Sits here, inside the same dark
          chapter and the same client island, because it interprets the map and
          responds to the same pathway state. */}
      <section aria-labelledby="nfe-layer-context-heading" className="mt-24 md:mt-28">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-gold">
            {SCIENCE_PAGE.layerContext.eyebrow}
          </p>
          <h3
            id="nfe-layer-context-heading"
            className="mt-5 font-serif text-3xl leading-tight text-nfe-paper md:text-4xl"
          >
            {SCIENCE_PAGE.layerContext.heading}
          </h3>
          <p className="mt-6 leading-8 text-nfe-paper/72">
            {SCIENCE_PAGE.layerContext.body}
          </p>
        </div>

        <LayerContextPanels
          panels={layerContextPanels}
          emphasized={selected}
          headingId="nfe-layer-context-heading"
        />
      </section>

      {/* The same relationships, compressed for scanning. */}
      <section aria-labelledby="nfe-formula-matrix-heading" className="mt-24 md:mt-28">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-gold">
            {SCIENCE_PAGE.formulaMatrix.eyebrow}
          </p>
          <h3
            id="nfe-formula-matrix-heading"
            className="mt-5 font-serif text-3xl leading-tight text-nfe-paper md:text-4xl"
          >
            {SCIENCE_PAGE.formulaMatrix.heading}
          </h3>
          <p className="mt-6 leading-8 text-nfe-paper/72">
            {SCIENCE_PAGE.formulaMatrix.body}
          </p>
        </div>

        <ConcernFormulaMatrix rows={matrixRows} emphasized={selected} />

        <p className="mt-10 max-w-3xl text-sm leading-6 text-nfe-paper/60">
          Ingredient families describe how NFE formulates. What is in a given
          formula is listed on{' '}
          <Link
            href="/inci"
            className="underline decoration-nfe-gold/50 underline-offset-4 hover:text-nfe-paper"
          >
            Ingredients
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
