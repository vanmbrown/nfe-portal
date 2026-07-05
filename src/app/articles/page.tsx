import Link from 'next/link'
import {
  getAllArticles,
  getArticlesByPillar,
  getFeaturedArticles,
} from '@/lib/articles'
import { JOURNAL_PILLARS } from '@/content/articles/pillars'
import {
  JournalArticleCard,
  JournalMaisonLinks,
} from '@/components/articles/JournalArticleCard'

export default function JournalPage() {
  const articles = getAllArticles()
  const featured = getFeaturedArticles().slice(0, 3)

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          NFE Journal
        </p>
        <h1 className="mx-auto max-w-5xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          Editorial authority for mature melanated skin.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          The Journal is not a blog. It is NFE&apos;s editorial house for
          well-aging philosophy, barrier comfort, tone integrity, ritual
          intelligence, science interpretation, and proof discipline.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="#featured-reading"
            className="rounded-full bg-nfe-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition hover:bg-nfe-gold/90"
          >
            Featured Reading
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
            Editorial Position
          </p>
          <h2 className="max-w-4xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Well-aging, not anti-aging. Ritual over correction. Proof before amplification.
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-nfe-ink/75">
            NFE publishes with restraint. No fabricated statistics, no fake clinical
            proof, no bleaching language, and no urgency marketing dressed up as
            luxury. The Journal exists to help mature melanated skin be understood
            on its own terms.
          </p>
        </div>
      </section>

      <section id="featured-reading" className="border-y border-nfe-green-900/10 bg-white/50 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Featured Reading
          </p>
          <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Foundational articles to begin with.
          </h2>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {featured.map((article) => (
              <JournalArticleCard key={article.slug} article={article} featured />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl space-y-16">
          {JOURNAL_PILLARS.map((pillar) => {
            const pillarArticles = getArticlesByPillar(pillar.id)
            if (pillarArticles.length === 0) return null

            return (
              <div key={pillar.id}>
                <div className="mb-8 max-w-3xl">
                  <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
                    {pillar.eyebrow}
                  </p>
                  <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
                    {pillar.title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-nfe-ink/72">
                    {pillar.description}
                  </p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {pillarArticles.map((article) => (
                    <JournalArticleCard key={article.slug} article={article} />
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
            The Journal currently includes {articles.length} editorial articles across{' '}
            {JOURNAL_PILLARS.length} pillars, with room to expand the full nine-article
            editorial architecture over time.
          </p>
        </div>
      </section>
    </div>
  )
}
