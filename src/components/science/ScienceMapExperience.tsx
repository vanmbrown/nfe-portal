'use client'

import Link from 'next/link'
import { useMemo, useRef, useState, type ReactNode } from 'react'

// Per-module, not the barrel — see LayerContextPanels for why.
import { INGREDIENT_FAMILIES } from '@/content/science/ingredient-families'
import { FAMILY_BY_ID as FAMILY_LABELS } from '@/content/ingredients/families'
import { LAYER_BY_ID, SKIN_LAYERS } from '@/content/science/layers'
import { SCIENCE_PAGE } from '@/content/science/page'
import { PATHWAYS } from '@/content/science/pathways'
import type {
  ConcernFormulaMatrixRow,
  IngredientFamilyId,
  LayerContextPanel,
  LayerId,
  PathwayId,
  ScienceEntryModesContent,
  SkinProfileContent,
} from '@/content/science/types'

import type {
  SkinContextId,
  SkinProfileOption,
  SkinSignalId,
} from '@/content/science/skin-profile'

import { ConcernFormulaMatrix } from './ConcernFormulaMatrix'
import { LayerContextPanels } from './LayerContextPanels'
import { SkinLayerSchematic } from './SkinLayerSchematic'
import { SkinProfileBuilder } from './SkinProfileBuilder'

/** The two ways in. Both write to one selected-pathway state. */
type EntryMode = 'pathway' | 'profile'

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
  /**
   * A short server-rendered note between the pathway controls and the
   * schematic. Passed as a node rather than imported so the copy travels as
   * markup instead of client code. The Layer Science module itself is a
   * separate white section above this chapter.
   */
  mapChapterNote?: ReactNode
  /**
   * Pathways to open with, parsed and validated on the server from the page's
   * query string. This is how a visitor returning from Ingredients gets her
   * view back.
   *
   * It seeds the state once and is never read again. The URL is an opening
   * position, not a synchronised copy: selections made here stay in React, the
   * address bar is not rewritten on every click, and no history entry is
   * created for exploring. Because the same validated array renders on the
   * server and seeds the first client render, there is nothing for hydration
   * to disagree about.
   */
  initialSelectedPathwayIds?: PathwayId[]
  /**
   * Copy and options for the Skin Profile builder, passed in rather than
   * imported so the labels travel as data instead of client code — the same
   * reason the Layer Context panels and matrix rows arrive as props.
   */
  entryModes: ScienceEntryModesContent
  skinProfile: SkinProfileContent
  skinContexts: SkinProfileOption<SkinContextId>[]
  skinSignals: SkinProfileOption<SkinSignalId>[]
  maxSkinSignals: number
}

export function ScienceMapExperience({
  layerContextPanels,
  matrixRows,
  mapChapterNote,
  initialSelectedPathwayIds = [],
  entryModes,
  skinProfile,
  skinContexts,
  skinSignals,
  maxSkinSignals,
}: ScienceMapExperienceProps) {
  const [selected, setSelected] = useState<PathwayId[]>(
    initialSelectedPathwayIds
  )
  // Which input the visitor is using. Not a second state for the map — the
  // selected pathways below are the only authority, and both modes write to
  // them. Switching modes therefore never disturbs what is selected.
  const [entryMode, setEntryMode] = useState<EntryMode>('pathway')
  // Whether the profile status line should show. Presentation only — the map
  // reads `selected` and nothing else.
  const [profileApplied, setProfileApplied] = useState(false)
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
    // A manual change makes the controls authoritative. The status line would
    // otherwise keep claiming the map reflects a profile it no longer matches.
    setProfileApplied(false)
  }

  /**
   * The profile's one write into the map.
   *
   * It replaces the selection rather than merging with it, so what the visitor
   * described is what she sees. She can still adjust by hand afterwards, and
   * from that moment the controls are authoritative — nothing remaps until she
   * asks for a profile again.
   */
  function applyProfile(pathwayIds: PathwayId[]) {
    setSelected(pathwayIds)
    setProfileApplied(pathwayIds.length > 0)
  }

  function clearPathways() {
    // "Clear pathways" only exists while something is selected, so activating
    // it destroys the control the user is standing on. Without this, focus
    // falls to <body> and a keyboard user loses their place entirely. Move
    // focus to the start of the group first, while that node is still mounted.
    firstPathwayRef.current?.focus()
    setSelected([])
    setProfileApplied(false)
  }

  /**
   * "Start over" in the profile panel. The same clearing as the pathway
   * control, without moving focus: the button the visitor just pressed is
   * still there, unlike "Clear pathways", which removes itself.
   */
  function resetProfile() {
    setSelected([])
    setProfileApplied(false)
  }

  const hasSelection = activePathways.length > 0

  const announcement = hasSelection
    ? `Exploring ${activePathways.map((p) => p.label).join(', ')}. Bringing forward ${emphasizedLayers
        .map((id) => LAYER_BY_ID[id].zone)
        .join(', ')}.`
    : 'Showing all layers.'

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-12">
      {/* Two ways in. Plain buttons with aria-pressed rather than an ARIA tab
          widget: there is no roving focus to manage and nothing is hidden that
          a tab panel would need to describe, so the simpler semantics are the
          more accurate ones. */}
      <div
        role="group"
        aria-label={entryModes.label}
        className="mb-12 flex flex-wrap gap-3"
      >
        {(
          [
            ['pathway', entryModes.pathwayLabel],
            ['profile', entryModes.profileLabel],
          ] as const
        ).map(([mode, label]) => {
          const active = entryMode === mode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setEntryMode(mode)}
              aria-pressed={active}
              data-entry-mode={mode}
              className={`min-h-[44px] rounded-full border px-6 py-3 text-sm tracking-[0.02em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nfe-gold focus-visible:ring-offset-2 focus-visible:ring-offset-nfe-green-900 ${
                active
                  ? 'border-nfe-gold bg-nfe-gold font-medium text-nfe-green-900'
                  : 'border-nfe-paper/30 text-nfe-paper/85 hover:border-nfe-gold/70'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Pathway selector. On mobile this sits above the schematic. */}
      <div className={entryMode === 'pathway' ? undefined : 'hidden'}>
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
      </div>

      {/* The second way in. Same state, different input. */}
      {entryMode === 'profile' ? (
        <SkinProfileBuilder
          copy={skinProfile}
          contexts={skinContexts}
          signals={skinSignals}
          maxSignals={maxSkinSignals}
          onApply={applyProfile}
          onReset={resetProfile}
          applied={profileApplied}
        />
      ) : null}

      {/* Concise, polite announcement of interpretation changes only. */}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {mapChapterNote ? <div className="mt-20">{mapChapterNote}</div> : null}

      {/* Schematic + interpretation. Two columns on desktop, stacked on mobile. */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        {/* Minimal padding on mobile so the schematic keeps as much width as
            possible and its labels stay legible without zooming. */}
        <div className="rounded-[1.75rem] border border-nfe-paper/15 bg-white/[0.04] p-2 md:p-7">
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
                  <p className="mt-4 leading-7 text-nfe-paper/80">
                    {pathway.interpretation}
                  </p>
                  <p className="mt-5 text-sm uppercase tracking-[0.2em] text-nfe-gold/85">
                    Within the skin
                  </p>
                  <p className="mt-2 leading-7 text-nfe-paper/70">
                    {pathway.emphasizedLayers
                      .map((id) => LAYER_BY_ID[id].zone)
                      .join(' · ')}
                  </p>
                  <p className="mt-5 text-sm uppercase tracking-[0.2em] text-nfe-gold/85">
                    NFE approaches this through
                  </p>
                  <p className="mt-2 leading-7 text-nfe-paper/70">
                    {pathway.formulationPrinciple}
                  </p>
                  <p className="mt-5 text-sm uppercase tracking-[0.2em] text-nfe-gold/85">
                    Related ritual context
                  </p>
                  <p className="mt-2 leading-7 text-nfe-paper/70">
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
                <div className="border-t border-nfe-paper/15 pt-8">
                  <p className="text-sm uppercase tracking-[0.2em] text-nfe-gold/85">
                    Relevant ingredient families
                  </p>
                  <ul className="mt-4 space-y-3">
                    {families.map((family) => (
                      <li key={family.id} className="leading-7 text-nfe-paper/70">
                        <span className="text-nfe-paper">{FAMILY_LABELS[family.id].label}</span> —{' '}
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
                    <p className="mt-2 leading-7 text-nfe-paper/70">
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
      {/* The framed plate owns its own heading, so the eyebrow, heading and
          zones label sit inside the frame with the panels they introduce. */}
      <section aria-labelledby="nfe-layer-context-heading" className="mt-16 md:mt-20">
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
          <p className="mt-6 leading-8 text-nfe-paper/70">
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
