import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'
import { getSiteUrl } from '@/lib/site-url'
import { WELL_AGING_SERIES_SLUG } from '@/content/articles/well-aging-series'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/journal',
    `/articles/${WELL_AGING_SERIES_SLUG}`,
    '/concierge',
    '/discovery',
    '/founder-access',
    '/our-story',
    '/articles',
    '/inci',
    '/learn',
    '/privacy',
    '/shop',
    '/products/face-elixir',
    '/products/body-elixir',
    '/ritual',
    '/science',
    '/skin-ritual-quiz',
    '/subscribe',
    '/cookies',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority:
      path === '/'
        ? 1
        : path === '/journal' || path === `/articles/${WELL_AGING_SERIES_SLUG}`
          ? 0.9
          : 0.8,
  }))

  const articleRoutes: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'monthly',
    priority: article.editorialTier === 'primary' ? 0.75 : 0.45,
  }))

  return [...staticRoutes, ...articleRoutes]
}
