import Link from 'next/link'
import type { Metadata } from 'next'
import { getArticlesBySeriesSlug } from '@/lib/articles'
import {
  WELL_AGING_ARTICLE_GROUPS,
  WELL_AGING_SERIES_DEK,
  WELL_AGING_SERIES_SLUG,
  WELL_AGING_SERIES_TITLE,
} from '@/content/articles/well-aging-series'
import {
  JournalArticleCard,
  JournalMaisonLinks,
} from '@/components/articles/JournalArticleCard'

export const metadata: Metadata = {
  title: `${WELL_AGING_SERIES_TITLE} | NFE Journal`,
  description: WELL_AGING_SERIES_DEK,
  openGraph: {
    title: `${WELL_AGING_SERIES_TITLE} | NFE Journal`,
    description: WELL_AGING_SERIES_DEK,
    type: 'website',
  },
}

export default function WellAgingPillarPage() {
  const seriesArticles = getArticlesBySeriesSlug(WELL_AGING_SERIES_SLUG)
  const openingEssay = seriesArticles[0]

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-nfe-paper md:py-32">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/journal"
            className="text-sm uppercase tracking-[0.22em] text-nfe-paper/70 transition hover:text-nfe-gold"
          >
            ← Back to the Journal
          </Link>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            NFE Journal • Editorial Pillar
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
            {WELL_AGING_SERIES_TITLE}
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
            {WELL_AGING_SERIES_DEK}
          </p>
          <p className="mt-6 max-w-3xl text-base leading-7 text-nfe-paper/72">
            Well-aging requires a different vocabulary. Not reversal culture
            softened into luxury language. For NFE, well-aging means care that
            supports skin that has lived: skin with memory, melanin, texture,
            softness, history, and presence.
          </p>
        </div>
      </section>

      {openingEssay ? (
        <section className="border-b border-nfe-green-900/10 bg-white/50 px-6 py-20 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Featured Essay
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              Begin with presence.
            </h2>
            <div className="mt-10">
              <JournalArticleCard article={openingEssay} featured />
            </div>
          </div>
        </section>
      ) : null}

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl space-y-16">
          {WELL_AGING_ARTICLE_GROUPS.map((group) => {
            const groupArticles = group.slugs
              .map((slug) => seriesArticles.find((article) => article.slug === slug))
              .filter((article): article is NonNullable<typeof article> =>
                Boolean(article)
              )

            return (
              <div key={group.id}>
                <div className="mb-8 max-w-3xl">
                  <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
                    {group.eyebrow}
                  </p>
                  <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
                    {group.title}
                  </h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {groupArticles.map((article) => (
                    <JournalArticleCard
                      key={article.slug}
                      article={article}
                      compactImage={article.imageType === 'editorial-science'}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="border-t border-nfe-green-900/10 bg-nfe-green-900/[0.03] px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Continue Inside the Maison
          </p>
          <div className="mt-8">
            <JournalMaisonLinks />
          </div>
        </div>
      </section>
    </div>
  )
}
