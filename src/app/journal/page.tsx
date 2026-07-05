import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getArticlesBySeriesSlug,
  getFeaturedArticles,
  getPrimaryArticles,
} from '@/lib/articles'
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
  title: 'Journal | NFE Beauty',
  description:
    'NFE Journal is the editorial house for mature melanated skin: well-aging philosophy, barrier intelligence, tone integrity, and ritual restraint.',
  openGraph: {
    title: 'Journal | NFE Beauty',
    description:
      'Editorial authority for mature melanated skin through The New Language of Well-Aging.',
    type: 'website',
  },
}

export default function JournalLandingPage() {
  const featured = getFeaturedArticles()[0]
  const seriesArticles = getArticlesBySeriesSlug(WELL_AGING_SERIES_SLUG)
  const primaryCount = getPrimaryArticles().length

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          NFE Journal
        </p>
        <h1 className="mx-auto max-w-5xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          The editorial house for mature melanated skin.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          Not a blog archive. A language system for well-aging, barrier comfort,
          tone integrity, ritual intelligence, and proof discipline.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href={`/articles/${WELL_AGING_SERIES_SLUG}`}
            className="rounded-full bg-nfe-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition hover:bg-nfe-gold/90"
          >
            Enter the Pillar
          </Link>
          <Link
            href="/science"
            className="rounded-full border border-nfe-paper/25 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition hover:border-nfe-gold/50 hover:text-nfe-gold"
          >
            Explore Science
          </Link>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Primary Editorial Pillar
          </p>
          <h2 className="max-w-4xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            {WELL_AGING_SERIES_TITLE}
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-nfe-ink/75">
            {WELL_AGING_SERIES_DEK}
          </p>
          <Link
            href={`/articles/${WELL_AGING_SERIES_SLUG}`}
            className="mt-8 inline-flex text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition hover:text-nfe-green-700"
          >
            View the full series →
          </Link>
        </div>
      </section>

      {featured ? (
        <section className="border-y border-nfe-green-900/10 bg-white/50 px-6 py-20 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Begin Here
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              The opening essay of the series.
            </h2>
            <div className="mt-10">
              <JournalArticleCard article={featured} featured />
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
          <h2 className="max-w-3xl font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Education, ritual, and guidance beyond the article page.
          </h2>
          <div className="mt-10">
            <JournalMaisonLinks />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl rounded-[1.75rem] border border-nfe-green-900/10 bg-white p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
            Editorial Note
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-nfe-ink/72">
            NFE Journal content is educational and cosmetic in nature. It does not
            diagnose, treat, cure, or prevent disease. Results and experiences vary.
            The primary editorial experience currently centers on {primaryCount}{' '}
            essays in {WELL_AGING_SERIES_TITLE}.
          </p>
        </div>
      </section>
    </div>
  )
}
