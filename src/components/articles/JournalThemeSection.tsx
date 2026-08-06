import Link from 'next/link'
import Image from 'next/image'
import type { ArticleMeta } from '@/lib/articles'
import { getArticleCardImage } from '@/lib/articles'
import type { JournalSupportingNoteLabel } from '@/content/articles/journal-supporting-notes'
import { JournalArticleCard } from '@/components/articles/JournalArticleCard'

function formatArticleDate(date: string | null) {
  if (!date) return ''
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
  themeEyebrow,
}: {
  article: ArticleMeta
  label: JournalSupportingNoteLabel
  themeEyebrow?: string
}) {
  const cardImage = getArticleCardImage(article)

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={`group overflow-hidden rounded-[1.25rem] border border-nfe-green-900/8 bg-white/60 transition hover:border-nfe-gold/25 hover:bg-white ${
        cardImage ? 'flex gap-4 p-4 md:p-5' : 'block p-5 md:p-6'
      }`}
    >
      {cardImage ? (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-nfe-green-900/5 md:h-28 md:w-28">
          <Image
            src={cardImage}
            alt={article.imageAlt ?? article.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="112px"
          />
        </div>
      ) : null}

      <div className={cardImage ? 'min-w-0 flex-1' : undefined}>
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.24em] text-nfe-ink/45">
          <span>{label}</span>
          {themeEyebrow ? (
            <>
              <span className="text-nfe-ink/25">•</span>
              <span>{themeEyebrow}</span>
            </>
          ) : null}
        </div>
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

      {primaryArticles.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {primaryArticles.map((article) => (
            <JournalArticleCard
              key={article.slug}
              article={article}
              compactImage={compactImageFor?.(article) ?? false}
            />
          ))}
        </div>
      ) : null}

      {supportingNotes.length > 0 ? (
        <div
          className={`${primaryArticles.length > 0 ? 'mt-8 border-t border-nfe-green-900/8 pt-8' : ''}`}
        >
          <p className="mb-4 text-xs uppercase tracking-[0.28em] text-nfe-ink/45">
            Supporting Editorial Notes
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {supportingNotes.map(({ article, label }) => (
              <JournalSupportingNoteCard
                key={article.slug}
                article={article}
                label={label}
                themeEyebrow={eyebrow}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
