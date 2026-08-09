import articlesIndex from '@/content/articles/articles.json'
import { getJournalPillar, type JournalPillarId } from '@/content/articles/pillars'
import {
  ALL_JOURNAL_SUPPORTING_NOTE_SLUGS,
  JOURNAL_SUPPORTING_NOTES_BY_GROUP,
  type JournalSupportingNoteLabel,
} from '@/content/articles/journal-supporting-notes'
import {
  WELL_AGING_ARTICLE_GROUPS,
  WELL_AGING_SERIES_SLUG,
  WELL_AGING_ARTICLE_ORDER,
  type WellAgingArticleGroupId,
} from '@/content/articles/well-aging-series'

export type ArticleImageType =
  | 'editorial-portrait'
  | 'editorial-science'
  | 'body-ritual'
  | 'skin-detail'

export type EditorialTier = 'primary' | 'legacy'

export type ArticleMeta = {
  slug: string
  title: string
  /**
   * Publication date in the Journal's existing YYYY-MM-DD format.
   * `null` means the final date has not been supplied yet; such an article
   * must also carry `published: false` and is excluded from every surface.
   */
  date: string | null
  /**
   * Omitted or `true` for every article published to date. `false` withholds
   * the article from the Journal index, the sitemap, related reading, metadata
   * and static route generation, consistently and in one place.
   */
  published?: boolean
  author: string
  excerpt: string
  file?: string
  image?: string
  heroImage?: string
  cardImage?: string
  imageAlt?: string
  imageType?: ArticleImageType
  imageCredit?: string | null
  /** Dedicated 4:5 crop served below the md breakpoint.
   *
   *  Only safe when the discarded edges carry nothing but background. An image
   *  whose composition runs to its own edges — a product line-up, embedded
   *  headline type — must use `heroAspect` instead and stay whole. */
  mobileImage?: string
  /** Renders the hero below md at the asset's own ratio, contained rather than
   *  cropped, so a composed plate arrives on a phone entire. Desktop geometry
   *  is unaffected. Values are matched against a fixed table in the article
   *  route so Tailwind can see every class it has to generate. */
  heroAspect?: '4/3' | '3/2' | '1/1' | '4/5'
  pillar: JournalPillarId
  editorialTier?: EditorialTier
  featured?: boolean
  series?: string
  seriesSlug?: string
  readingMinutes?: number
  pullQuote?: string
  relatedSlugs?: string[]
}

/**
 * A local preview build may opt in to unpublished articles so the founder can
 * review them before a publication date is set. It is never enabled in a
 * production build, so unpublished articles stay off every production surface.
 */
const INCLUDE_UNPUBLISHED =
  process.env.NEXT_PUBLIC_INCLUDE_UNPUBLISHED === 'true'

export function isPublished(article: ArticleMeta): boolean {
  return article.published !== false
}

/**
 * The single gate. Every Journal surface reads through this, so the index, the
 * sitemap, related reading, article metadata and static route generation can
 * never disagree about whether an article is public.
 */
export function getAllArticles(): ArticleMeta[] {
  const articles = articlesIndex as ArticleMeta[]
  return articles
    .filter((article) => INCLUDE_UNPUBLISHED || isPublished(article))
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return a.date < b.date ? 1 : -1
    })
}

export function getPrimaryArticles(): ArticleMeta[] {
  return getAllArticles().filter((article) => article.editorialTier === 'primary')
}

export function getLegacyArticles(): ArticleMeta[] {
  return getAllArticles().filter((article) => article.editorialTier === 'legacy')
}

export function getSupportingNotesForGroup(
  groupId: WellAgingArticleGroupId
): Array<{ article: ArticleMeta; label: JournalSupportingNoteLabel }> {
  const notes = JOURNAL_SUPPORTING_NOTES_BY_GROUP[groupId] ?? []

  return notes
    .map((note) => {
      const article = getArticleBySlug(note.slug)
      if (!article || article.editorialTier !== 'legacy') return null
      return { article, label: note.label }
    })
    .filter(
      (
        entry
      ): entry is { article: ArticleMeta; label: JournalSupportingNoteLabel } =>
        Boolean(entry)
    )
}

export function getAllJournalSupportingNotes(): Array<{
  article: ArticleMeta
  label: JournalSupportingNoteLabel
  themeEyebrow: string
}> {
  return WELL_AGING_ARTICLE_GROUPS.flatMap((group) =>
    getSupportingNotesForGroup(group.id).map((entry) => ({
      ...entry,
      themeEyebrow: group.eyebrow,
    }))
  )
}

export function getArticleBySlug(slug: string): ArticleMeta | undefined {
  return getAllArticles().find((article) => article.slug === slug)
}

export function getFeaturedArticles(): ArticleMeta[] {
  return getPrimaryArticles().filter((article) => article.featured)
}

export function getArticlesByPillar(pillar: JournalPillarId): ArticleMeta[] {
  return getPrimaryArticles().filter((article) => article.pillar === pillar)
}

export function getArticlesBySeriesSlug(seriesSlug: string): ArticleMeta[] {
  const order =
    seriesSlug === WELL_AGING_SERIES_SLUG ? WELL_AGING_ARTICLE_ORDER : undefined

  const articles = getPrimaryArticles().filter(
    (article) => article.seriesSlug === seriesSlug
  )

  if (!order) {
    return articles
  }

  return [...articles].sort(
    (a, b) => order.indexOf(a.slug) - order.indexOf(b.slug)
  )
}

export function getRelatedArticles(slug: string, limit = 3): ArticleMeta[] {
  const current = getArticleBySlug(slug)
  if (!current) return []

  if (current.relatedSlugs?.length) {
    return current.relatedSlugs
      .map((relatedSlug) => getArticleBySlug(relatedSlug))
      .filter((article): article is ArticleMeta => Boolean(article))
      .slice(0, limit)
  }

  return getAllArticles()
    .filter((article) => article.slug !== slug)
    .sort((a, b) => {
      const aScore =
        (a.pillar === current.pillar ? 2 : 0) +
        (a.seriesSlug && a.seriesSlug === current.seriesSlug ? 2 : 0) +
        (a.series && a.series === current.series ? 1 : 0)
      const bScore =
        (b.pillar === current.pillar ? 2 : 0) +
        (b.seriesSlug && b.seriesSlug === current.seriesSlug ? 2 : 0) +
        (b.series && b.series === current.series ? 1 : 0)

      if (aScore !== bScore) return bScore - aScore
      if (!a.date) return 1
      if (!b.date) return -1
      return a.date < b.date ? 1 : -1
    })
    .slice(0, limit)
}

export function getPillarLabel(pillar: JournalPillarId): string {
  return getJournalPillar(pillar)?.eyebrow ?? pillar
}

export function getArticleHeroImage(article: ArticleMeta): string | undefined {
  return article.heroImage ?? article.image
}

export function getArticleCardImage(article: ArticleMeta): string | undefined {
  return article.cardImage ?? article.heroImage ?? article.image
}

export function isPrimaryArticle(article: ArticleMeta): boolean {
  return article.editorialTier === 'primary'
}

export function isJournalSupportingNote(slug: string): boolean {
  return ALL_JOURNAL_SUPPORTING_NOTE_SLUGS.includes(slug)
}
