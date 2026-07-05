import Link from 'next/link'
import type { ArticleMeta } from '@/lib/articles'
import type { JournalSupportingNoteLabel } from '@/content/articles/journal-supporting-notes'
import { JournalArticleCard } from '@/components/articles/JournalArticleCard'

function formatArticleDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function JournalSupportingNoteCard({
  article,
  label,
}: {
  article: ArticleMeta
  label: JournalSupportingNoteLabel
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block rounded-[1.25rem] border border-nfe-green-900/8 bg-white/60 p-5 transition hover:border-nfe-gold/25 hover:bg-white"
    >
      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-nfe-ink/45">
        {label}
      </p>
      <h3 className="mt-3 font-serif text-xl leading-snug text-nfe-green-900/90 transition group-hover:text-nfe-green-700">
        {article.title}
      </h3>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-nfe-ink/58">
        {article.excerpt}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-nfe-ink/45">
        <span>{formatArticleDate(article.date)}</span>
        {article.readingMinutes ? (
          <>
            <span>•</span>
            <span>{article.readingMinutes} min read</span>
          </>
        ) : null}
      </div>
    </Link>
  )
}

export function JournalThemeSection({
  eyebrow,
  title,
  primaryArticles,
  supportingNotes,
  compactImageFor,
}: {
  eyebrow: string
  title: string
  primaryArticles: ArticleMeta[]
  supportingNotes: Array<{ article: ArticleMeta; label: JournalSupportingNoteLabel }>
  compactImageFor?: (article: ArticleMeta) => boolean
}) {
  return (
    <div>
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
          {eyebrow}
        </p>
        <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
          {title}
        </h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {primaryArticles.map((article) => (
          <JournalArticleCard
            key={article.slug}
            article={article}
            compactImage={compactImageFor?.(article) ?? false}
          />
        ))}
      </div>

      {supportingNotes.length > 0 ? (
        <div className="mt-8 border-t border-nfe-green-900/8 pt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-nfe-ink/45">
            Supporting Editorial Notes
          </p>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {supportingNotes.map(({ article, label }) => (
              <JournalSupportingNoteCard
                key={article.slug}
                article={article}
                label={label}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
