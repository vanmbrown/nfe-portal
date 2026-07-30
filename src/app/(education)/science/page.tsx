import type { Metadata } from 'next'
import Link from 'next/link'

import { ScienceMapExperience } from '@/components/science/ScienceMapExperience'
import { LayerScienceModule } from '@/components/science/LayerScienceModule'
import { ScienceMethod } from '@/components/science/ScienceMethod'
import {
  CONCERN_FORMULA_MATRIX,
  INGREDIENT_FAMILIES,
  LAYER_CONTEXT_PANELS,
  SCIENCE_PAGE,
} from '@/content/science'
import { FAMILY_BY_ID as FAMILY_LABELS } from '@/content/ingredients/families'
import {
  MAX_SKIN_SIGNALS,
  SKIN_CONTEXTS,
  SKIN_SIGNALS,
} from '@/content/science/skin-profile'
import {
  PATHWAYS_PARAM,
  SCIENCE_MAP_ANCHOR,
  parsePathwayQuery,
  type SearchParamValue,
} from '@/lib/science-pathway-state'

/**
 * Title, description and canonical identity are fixed and do not vary with the
 * query string. A pathway combination is a temporary view of one page, not a
 * page of its own, so it must never become separately indexable.
 */
export const metadata: Metadata = {
  title: 'Science, Method & Proof | NFE Beauty',
  description:
    'NFE Skin Intelligence translates mature, melanated skin priorities into cosmetic formulation logic, ritual guidance, and proof discipline.',
}

/**
 * The Science page.
 *
 * Server-rendered end to end. The only client boundary is
 * ScienceMapExperience, which holds pathway selection and the map's emphasis
 * state. Everything else — hero, chapters, principles, families, proof,
 * founder note, product context, Concierge — is static.
 *
 * The page is written to be read straight through. No selection is required
 * for any content to appear, and the map has a complete default state, so the
 * page remains meaningful without JavaScript.
 *
 * `?pathways=` is read here rather than in the browser. A visitor returning
 * from Ingredients gets her selections back in the first HTML the server sends,
 * so there is no flash of the default state and nothing for hydration to
 * disagree about. Reading searchParams makes this route render per request
 * instead of being prerendered; that is the cost of restoring the view on the
 * server, and the page's output is identical for the same URL.
 *
 * Everything about that state is temporary: it is validated, held in React, and
 * never written to storage, an API or a record.
 */
interface SciencePageProps {
  searchParams: Promise<Record<string, SearchParamValue>>
}

export default async function SciencePage({ searchParams }: SciencePageProps) {
  const params = await searchParams

  // Validated against the canonical pathway ids. Anything else is discarded,
  // so a crafted URL can restore a view but cannot introduce one.
  const initialSelectedPathwayIds = parsePathwayQuery(params[PATHWAYS_PARAM])

  const {
    hero,
    method,
    scienceMethod,
    profileIntro,
    mapIntro,
    formulationPrinciples,
    proof,
    founderNote,
    productContext,
    concierge,
    closingDisclaimer,
  } = SCIENCE_PAGE

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      {/* 1 — Quiet hero */}
      <section className="bg-nfe-green-900 px-6 py-24 text-nfe-paper md:px-12 md:py-32">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs uppercase tracking-[0.35em] text-nfe-gold">
            {hero.eyebrow}
          </p>
          <h1 className="mt-6 font-primary text-4xl leading-tight text-nfe-gold md:text-6xl">
            {hero.heading}
          </h1>
          <p className="mt-10 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
            {hero.intro}
          </p>
          <p className="mt-5 max-w-2xl leading-7 text-nfe-paper/70">
            {hero.subIntro}
          </p>
          {/* The invitation into the interpretation, moved up from the foot of
              the Method section so a visitor who already knows she wants to
              begin does not have to read two chapters to find the way in. It
              stays at the foot of the hero content, after both paragraphs, so
              the heading still opens the page.

              There is one of these on the page, not two: this is the same
              anchor, relocated, not a duplicate.

              Same gold fill and deep-green label as before, so the measured
              6.63:1 is unchanged. The focus ring is the one thing that had to
              change with the ground: a deep-green ring was legible on warm
              paper but would disappear on this dark green, so the ring is
              paper and the offset is the hero's own green. */}
          <p className="mt-10">
            <Link
              href={scienceMethod.ctaHref}
              className="inline-flex min-h-[44px] items-center rounded-full border border-nfe-gold-hover bg-nfe-gold px-7 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-gold-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nfe-paper focus-visible:ring-offset-2 focus-visible:ring-offset-nfe-green-900"
            >
              {scienceMethod.ctaLabel}
            </Link>
          </p>
        </div>
      </section>

      {/* 2 — Why NFE Science is different */}
      {/* Measured before this correction: this block sat on a centred max-w-3xl
          container, putting its left edge 128px right of everything beneath it
          at 1440 — 329 against 201 for Method, formulation principles and
          ingredient families. It read as indented rather than as the opening of
          the page's editorial column.

          It now uses the same container pattern the Method section already
          uses: max-w-5xl establishes the left edge, max-w-3xl keeps the
          reading measure. Same words, same width, same tone — it simply starts
          where the rest of the page starts.

          pb-14 rather than py-24 closes the interval to the Method block; the
          space above is deliberately unchanged.

          The approved alignment pass took the interval from 192px to 128px, a
          third of it. This is the finishing adjustment on top of that, and is
          deliberately a much smaller move: 128px to 112px, 16px, 12.5%. */}
      <section className="px-6 pt-24 pb-14 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              {method.eyebrow}
            </p>
            <h2 className="mt-5 font-primary text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              {method.heading}
            </h2>
            <div className="mt-8 space-y-6">
              {method.body.map((paragraph) => (
                <p key={paragraph} className="text-lg leading-8 text-nfe-ink/75">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3 — How the Science Map works, and the invitation into it */}
      <ScienceMethod />

      {/* 4 — Layer Science: the editorial bridge into the interactive chapter */}
      <LayerScienceModule />

      {/* 5, 6, 7 — Pathways, the map, and what the layers mean */}
      <section className="bg-nfe-green-900 py-24 text-nfe-paper md:py-32">
        {/* The dark chapter now opens with the founder's framing for the
            pathway controls. This is also the destination of the method
            invitation above, so it carries the anchor id and scroll margin. */}
        <div
          id={profileIntro.anchorId}
          className="mx-auto max-w-6xl scroll-mt-24 px-6 md:px-12"
        >
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-gold">
              {profileIntro.eyebrow}
            </p>
            <h2 className="mt-5 font-primary text-3xl leading-tight text-nfe-gold md:text-5xl">
              {profileIntro.heading}
            </h2>
            <p className="mt-8 text-lg leading-8 text-nfe-paper/80">
              {profileIntro.description}
            </p>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-6 text-nfe-paper/70">
              <span className="text-nfe-gold">{profileIntro.boundary}</span>
              <span>{profileIntro.privacy}</span>
            </p>
          </div>
        </div>

        {/* Layer Context and matrix content is passed in rather than imported
            by the island, so the prose ships as data instead of as client
            code. See ScienceMapExperience for the measurement. */}
        {/* `science-map` is the return destination from Ingredients, and it
            sits on the map itself rather than on the chapter above it.
            Measured: anchored to the chapter wrapper, a returning visitor
            landed on the first-visit framing with the controls only fully in
            view at 900px tall and the schematic below the fold at every height
            tested. Anchored here, the controls and the schematic are both in
            view from 720px up. The framing is still one scroll away.

            A plain fragment — it resolves without JavaScript, and scroll-margin
            is layout-neutral. */}
        <div id={SCIENCE_MAP_ANCHOR} className="mt-16 scroll-mt-24">
          <ScienceMapExperience
            layerContextPanels={LAYER_CONTEXT_PANELS}
            matrixRows={CONCERN_FORMULA_MATRIX}
            initialSelectedPathwayIds={initialSelectedPathwayIds}
            entryModes={SCIENCE_PAGE.entryModes}
            skinProfile={SCIENCE_PAGE.skinProfile}
            skinContexts={SKIN_CONTEXTS}
            skinSignals={SKIN_SIGNALS}
            maxSkinSignals={MAX_SKIN_SIGNALS}
            mapChapterNote={
              /* The partial Layer Science intro that used to sit here is now the
                 complete module above. Only this approved paragraph remains, so
                 nothing is duplicated and nothing approved is lost. */
              <p className="max-w-3xl text-lg leading-8 text-nfe-paper/80">
                {mapIntro.body}
              </p>
            }
          />
        </div>
      </section>

      {/* 6 — Formulation principles */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Formulation principles
          </p>
          <h2 className="mt-5 max-w-2xl font-primary text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            How NFE decides what belongs in a formula.
          </h2>
          <div className="mt-14 space-y-12">
            {formulationPrinciples.map((principle) => (
              <div
                key={principle.id}
                className="grid gap-4 border-t border-nfe-green-900/12 pt-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10"
              >
                <h3 className="font-primary text-2xl text-nfe-green-900 md:text-3xl">
                  {principle.title}
                </h3>
                <p className="text-lg leading-8 text-nfe-ink/72">
                  {principle.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Ingredient families */}
      <section className="bg-white px-6 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Ingredient families
          </p>
          <h2 className="mt-5 max-w-2xl font-primary text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Families, not a catalogue.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-nfe-ink/72">
            NFE formulates with families that work in relation to each other.
            These describe the character of that thinking. The specifics of any
            single ingredient, and what is in each formula, live on Ingredients.
          </p>
          <dl className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {INGREDIENT_FAMILIES.map((family) => (
              <div
                key={family.id}
                className="border-t border-nfe-green-900/12 pt-6"
              >
                <dt className="font-primary text-xl text-nfe-green-900">
                  {FAMILY_LABELS[family.id].label}
                </dt>
                <dd className="mt-3 leading-7 text-nfe-ink/72">
                  {family.role}
                  {/* /55 composited to #7c7c7c on this white ground — 4.17:1,
                      short of AA. /70 clears it. */}
                  <span className="mt-3 block text-sm text-nfe-ink/70">
                    Such as {family.representativeExamples.join(', ')}.
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-12">
            <Link
              href="/inci"
              className="text-sm uppercase tracking-[0.18em] text-nfe-green-900 underline decoration-nfe-green-900/30 underline-offset-8 transition-colors hover:text-nfe-green-700"
            >
              See every ingredient on Ingredients
            </Link>
          </p>
        </div>
      </section>

      {/* 8 — Proof discipline */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            {proof.eyebrow}
          </p>
          <h2 className="mt-5 max-w-2xl font-primary text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            {proof.heading}
          </h2>
          <div className="mt-14 space-y-12">
            {proof.stages.map((stage) => (
              <div
                key={stage.id}
                className="grid gap-4 border-t border-nfe-green-900/12 pt-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10"
              >
                <h3 className="font-primary text-2xl text-nfe-green-900 md:text-3xl">
                  {stage.title}
                </h3>
                <p className="text-lg leading-8 text-nfe-ink/72">{stage.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 — Founder note */}
      <section className="bg-[#eadcc9] px-6 py-24 md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#7a4f22]">
            {founderNote.eyebrow}
          </p>
          <h2 className="mt-5 font-primary text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            {founderNote.heading}
          </h2>
          <p className="mt-8 text-lg leading-8 text-[#5c5c5c]">
            {founderNote.body}
          </p>
        </div>
      </section>

      {/* 10 — Product context, then one quiet Concierge invitation */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            {productContext.eyebrow}
          </p>
          <h2 className="mt-5 font-primary text-3xl leading-tight text-nfe-green-900 md:text-4xl">
            {productContext.heading}
          </h2>
          <p className="mt-8 text-lg leading-8 text-nfe-ink/72">
            {productContext.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
            {productContext.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-[0.18em] text-nfe-green-900 underline decoration-nfe-green-900/30 underline-offset-8 transition-colors hover:text-nfe-green-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-nfe-green-900/10 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            {concierge.eyebrow}
          </p>
          <h2 className="mt-5 font-primary text-3xl leading-tight text-nfe-green-900 md:text-4xl">
            {concierge.heading}
          </h2>
          <p className="mt-6 text-lg leading-8 text-nfe-ink/72">
            {concierge.body}
          </p>
          <p className="mt-8">
            <Link
              href={concierge.link.href}
              className="inline-flex min-h-[44px] items-center rounded-full border border-nfe-green-900 px-7 text-sm uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper"
            >
              {concierge.link.label}
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-nfe-green-900/10 px-6 py-10 md:px-12">
        <p className="mx-auto max-w-3xl text-sm leading-6 text-nfe-muted">
          {closingDisclaimer}
        </p>
      </section>
    </div>
  )
}
