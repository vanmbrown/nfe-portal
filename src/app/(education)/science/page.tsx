import type { Metadata } from 'next'
import Link from 'next/link'

import { ScienceMapExperience } from '@/components/science/ScienceMapExperience'
import { ScienceMethod } from '@/components/science/ScienceMethod'
import {
  CONCERN_FORMULA_MATRIX,
  INGREDIENT_FAMILIES,
  LAYER_CONTEXT_PANELS,
  SCIENCE_PAGE,
} from '@/content/science'
import { FAMILY_BY_ID as FAMILY_LABELS } from '@/content/ingredients/families'

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
 */
export default function SciencePage() {
  const {
    hero,
    method,
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
          <h1 className="mt-6 font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
            {hero.heading}
          </h1>
          <p className="mt-10 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
            {hero.intro}
          </p>
          <p className="mt-5 max-w-2xl leading-7 text-nfe-paper/70">
            {hero.subIntro}
          </p>
        </div>
      </section>

      {/* 2 — Why NFE Science is different */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            {method.eyebrow}
          </p>
          <h2 className="mt-5 font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
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
      </section>

      {/* 3 — How the Science Map works, and the invitation into it */}
      <ScienceMethod />

      {/* 4, 5, 6 — Pathways, the map, and what the layers mean */}
      <section className="bg-nfe-green-900 py-24 text-nfe-paper md:py-32">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-nfe-gold">
              {mapIntro.eyebrow}
            </p>
            <h2 className="mt-5 font-serif text-3xl leading-tight text-nfe-gold md:text-5xl">
              {mapIntro.heading}
            </h2>
            <p className="mt-8 text-lg leading-8 text-nfe-paper/80">
              {mapIntro.body}
            </p>
          </div>
        </div>

        {/* Layer Context and matrix content is passed in rather than imported
            by the island, so the prose ships as data instead of as client
            code. See ScienceMapExperience for the measurement. */}
        <div className="mt-16">
          <ScienceMapExperience
            layerContextPanels={LAYER_CONTEXT_PANELS}
            matrixRows={CONCERN_FORMULA_MATRIX}
          />
        </div>
      </section>

      {/* 6 — Formulation principles */}
      <section className="px-6 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Formulation principles
          </p>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            How NFE decides what belongs in a formula.
          </h2>
          <div className="mt-14 space-y-12">
            {formulationPrinciples.map((principle) => (
              <div
                key={principle.id}
                className="grid gap-4 border-t border-nfe-green-900/12 pt-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10"
              >
                <h3 className="font-serif text-2xl text-nfe-green-900 md:text-3xl">
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
          <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Families, not a catalogue.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-nfe-ink/72">
            NFE formulates with families that work in relation to each other.
            These describe the character of that thinking — the specifics of any
            single ingredient, and what is in each formula, live on Ingredients.
          </p>
          <dl className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {INGREDIENT_FAMILIES.map((family) => (
              <div
                key={family.id}
                className="border-t border-nfe-green-900/12 pt-6"
              >
                <dt className="font-serif text-xl text-nfe-green-900">
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
          <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            {proof.heading}
          </h2>
          <div className="mt-14 space-y-12">
            {proof.stages.map((stage) => (
              <div
                key={stage.id}
                className="grid gap-4 border-t border-nfe-green-900/12 pt-8 md:grid-cols-[0.8fr_1.2fr] md:gap-10"
              >
                <h3 className="font-serif text-2xl text-nfe-green-900">
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
          <h2 className="mt-5 font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
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
          <h2 className="mt-5 font-serif text-3xl leading-tight text-nfe-green-900 md:text-4xl">
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
          <h2 className="mt-5 font-serif text-3xl leading-tight text-nfe-green-900 md:text-4xl">
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
