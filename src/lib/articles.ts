import articlesIndex from '@/content/articles/articles.json'
import { getJournalPillar, type JournalPillarId } from '@/content/articles/pillars'

export type ArticleMeta = {
  slug: string
  title: string
  date: string
  author: string
  excerpt: string
  file?: string
  image?: string
  pillar: JournalPillarId
  featured?: boolean
  series?: string
  readingMinutes?: number
}

export function getAllArticles(): ArticleMeta[] {
  const articles = articlesIndex as ArticleMeta[]
  return [...articles].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getArticleBySlug(slug: string): ArticleMeta | undefined {
  return getAllArticles().find((article) => article.slug === slug)
}

export function getFeaturedArticles(): ArticleMeta[] {
  return getAllArticles().filter((article) => article.featured)
}

export function getArticlesByPillar(pillar: JournalPillarId): ArticleMeta[] {
  return getAllArticles().filter((article) => article.pillar === pillar)
}

export function getRelatedArticles(slug: string, limit = 3): ArticleMeta[] {
  const current = getArticleBySlug(slug)
  if (!current) return []

  return getAllArticles()
    .filter((article) => article.slug !== slug)
    .sort((a, b) => {
      const aScore =
        (a.pillar === current.pillar ? 2 : 0) +
        (a.series && a.series === current.series ? 1 : 0)
      const bScore =
        (b.pillar === current.pillar ? 2 : 0) +
        (b.series && b.series === current.series ? 1 : 0)

      if (aScore !== bScore) return bScore - aScore
      return a.date < b.date ? 1 : -1
    })
    .slice(0, limit)
}

export function getPillarLabel(pillar: JournalPillarId): string {
  return getJournalPillar(pillar)?.eyebrow ?? pillar
}
