import Image from 'next/image'
import Link from 'next/link'
import type { ArticleMeta } from '@/lib/articles'
import {
  getArticleCardImage,
  getPillarLabel,
} from '@/lib/articles'

function formatArticleDate(date: string | null) {
  if (!date) return ''
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function JournalArticleCard({
  article,
  featured = false,
  compactImage = false,
}: {
  article: ArticleMeta
  featured?: boolean
  compactImage?: boolean
}) {
  const cardImage = getArticleCardImage(article)
  const imageHeightClass = compactImage
    ? 'h-40 md:h-44'
    : featured
      ? 'h-52 md:h-60'
      : 'h-44 md:h-48'

  return (
    <Link
      href={`/articles/${article.slug}`}
      className={`group block overflow-hidden rounded-[1.75rem] border border-nfe-green-900/10 bg-white transition hover:border-nfe-gold/35 hover:shadow-[0_18px_40px_rgba(13,40,24,0.08)] ${
        featured ? 'md:grid md:grid-cols-[1.05fr_1fr]' : ''
      }`}
    >
      {cardImage ? (
        <div className={`relative ${imageHeightClass} overflow-hidden bg-nfe-green-900/5`}>
          <Image
            src={cardImage}
            alt={article.imageAlt ?? article.title}
            fill
            className={`object-cover transition duration-500 group-hover:scale-[1.02] ${
              compactImage && article.imageType === 'editorial-science'
                ? 'object-center md:object-[center_20%]'
                : ''
            }`}
            sizes={
              featured
                ? '(max-width: 768px) 100vw, 33vw'
                : '(max-width: 768px) 100vw, 50vw'
            }
          />
        </div>
      ) : null}

      <div className={`p-6 ${featured ? 'md:p-8' : ''}`}>
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-nfe-green-700">
          <span>{article.series ?? getPillarLabel(article.pillar)}</span>
        </div>

        <h3
          className={`font-serif leading-tight text-nfe-green-900 transition group-hover:text-nfe-green-700 ${
            featured ? 'text-3xl md:text-4xl' : 'text-2xl'
          }`}
        >
          {article.title}
        </h3>

        <p
          className={`mt-4 leading-7 text-nfe-ink/72 ${
            featured ? 'text-lg' : 'text-base'
          }`}
        >
          {article.excerpt}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-nfe-ink/65">
          <span>{formatArticleDate(article.date)}</span>
          {article.readingMinutes ? (
            <>
              <span>•</span>
              <span>{article.readingMinutes} min read</span>
            </>
          ) : null}
        </div>

        <p className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900">
          Read article
        </p>
      </div>
    </Link>
  )
}

export function JournalMaisonLinks() {
  const links = [
    {
      href: '/science',
      label: 'Science',
      body: 'Interpret skin by layer, concern, and formula logic.',
    },
    {
      href: '/discovery',
      label: 'Discovery Ritual',
      body: 'A measured first experience with the elixirs.',
    },
    {
      href: '/skin-ritual-quiz',
      label: 'Skin Ritual Quiz',
      body: 'Find the NFE path that fits your current skin signals.',
    },
    {
      href: '/shop',
      label: 'The Atelier',
      body: 'Explore Face Elixir and Body Elixir with editorial restraint.',
    },
    {
      href: '/founder-access',
      label: 'Founder Access',
      body: 'Join the private list without promotional noise.',
    },
    {
      href: '/concierge',
      label: 'Concierge',
      body: 'Ask for private cosmetic guidance inside the maison.',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded-[1.5rem] border border-nfe-green-900/10 bg-white/70 p-5 transition hover:border-nfe-gold/30"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-nfe-green-700">
            {link.label}
          </p>
          <p className="mt-3 text-sm leading-6 text-nfe-ink/72">{link.body}</p>
        </Link>
      ))}
    </div>
  )
}
