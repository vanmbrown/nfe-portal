import Link from 'next/link'

import INCITransparencyTabs from '@/components/education/INCITransparencyTabs'
import { IngredientFamilySections } from '@/components/ingredients/IngredientFamilySections'
import { ScienceReturnLink } from '@/components/ingredients/ScienceReturnLink'
import { INGREDIENT_FAMILIES } from '@/content/ingredients/families'
import {
  ORIGIN_PARAM,
  PATHWAYS_PARAM,
  isScienceOrigin,
  parsePathwayQuery,
  type SearchParamValue,
} from '@/lib/science-pathway-state'

/**
 * Ingredients.
 *
 * Server-rendered, so the family sections below are anchor destinations that
 * exist in the markup a browser receives. Science links here as
 * `/inci#humectants`; that only works if the section is present without
 * JavaScript and is not hidden inside a tab.
 *
 * The page reads: what a family is for, which ingredients sit inside it, then
 * the full transparency reference — INCI lists, actives table and the complete
 * glossary — unchanged, in the client island it always lived in.
 *
 * One thing varies with the URL. A visitor who followed an ingredient-family
 * link from Science arrives carrying the pathways she was reading, and gets a
 * quiet way back to that same view. Arriving any other way, the page is exactly
 * what it has always been — the marker is checked strictly, so `?from=other` is
 * not the Science journey and shows nothing.
 *
 * Reading searchParams renders this route per request rather than prerendering
 * it. Metadata and canonical identity do not vary with the query: this is one
 * page seen from two directions, not two pages.
 */
interface INCIPageProps {
  searchParams: Promise<Record<string, SearchParamValue>>
}

export default async function INCIPage({ searchParams }: INCIPageProps) {
  const params = await searchParams
  const cameFromScience = isScienceOrigin(params[ORIGIN_PARAM])

  // Parsed regardless of origin, then only used when the origin is Science, so
  // a pathway value on its own can never introduce the module.
  const pathwayIds = parsePathwayQuery(params[PATHWAYS_PARAM])

  const families = [...INGREDIENT_FAMILIES].sort((a, b) => a.order - b.order)

  return (
    <div id="inci-panel" className="min-h-screen w-full bg-[#F6F5F3]">
      {/* Shown only for a visitor who came from Science, and only once. It is
          fixed to the viewport, so it appears first in the document for
          keyboard order but takes no space in the flow. */}
      {cameFromScience ? <ScienceReturnLink pathwayIds={pathwayIds} /> : null}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-primary font-bold text-[#0E2A22] mb-6">
          NFE Ingredient Transparency
        </h1>

        <p className="max-w-2xl text-lg leading-8 text-[#0E2A22]/75">
          NFE formulates with families of ingredients that work in relation to
          each other. Each family below describes a cosmetic role and the
          ingredients NFE draws on for it.
        </p>

        {/* Compact index. Eight sections is enough that a way in helps, and
            these are plain anchors — no filtering, no state. */}
        <nav aria-label="Ingredient families" className="mt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {families.map((family) => (
              <li key={family.id}>
                <a
                  href={`#${family.id}`}
                  className="text-sm text-[#0E2A22]/80 underline decoration-[#C9A66B]/50 underline-offset-4 transition-colors hover:text-[#0E2A22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A66B] focus-visible:ring-offset-2"
                >
                  {family.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-16">
          <IngredientFamilySections />
        </div>

        <p className="mt-16 max-w-2xl border-t border-[#0E2A22]/12 pt-8 leading-8 text-[#0E2A22]/75">
          Ingredient families describe cosmetic roles and formulation logic. For
          what is in a particular formula, see that product&rsquo;s own
          ingredient declaration.
        </p>

        <div className="mt-20">
          <h2 className="font-serif text-2xl text-[#0E2A22] md:text-3xl">
            Full ingredient reference
          </h2>
          <p className="mt-4 max-w-2xl leading-8 text-[#0E2A22]/75">
            Complete INCI lists, the actives data table, and every ingredient in
            the NFE glossary.
          </p>
          <div className="mt-8">
            <INCITransparencyTabs />
          </div>
        </div>

        <p className="mt-16 border-t border-[#0E2A22]/12 pt-8">
          <Link
            href="/science"
            className="text-sm uppercase tracking-[0.18em] text-[#0E2A22] underline decoration-[#C9A66B]/50 underline-offset-8 transition-colors hover:text-[#0E2A22]/70"
          >
            Return to Science
          </Link>
        </p>
      </div>
    </div>
  )
}
