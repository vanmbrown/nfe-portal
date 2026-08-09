import { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'
import { getSiteUrl } from '@/lib/site-url'
import { WELL_AGING_SERIES_SLUG } from '@/content/articles/well-aging-series'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl()
  const now = new Date()

  // Canonical public destinations only.
  //
  // Deliberately absent, and each for its own reason:
  //   /articles, /subscribe  redirect-only shims. Listing a redirect
  //                          advertises a hop instead of the page, and both
  //                          destinations are already here in their own right.
  //   /learn                 retired; now a permanent redirect to /science.
  //   /skin-strategy         withdrawn from the public maison.
  //   /community-input       research, not a public destination.
  //   /focus-group/*         authenticated participant portal.
  //
  // The redirects themselves stay in next.config.mjs; they protect old inbound
  // links. They simply are not pages, so they are not advertised as pages.
  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/journal',
    `/articles/${WELL_AGING_SERIES_SLUG}`,
    '/concierge',
    '/discovery',
    '/founder-access',
    '/our-story',
    '/inci',
    '/privacy',
    '/shop',
    '/products/face-elixir',
    '/products/body-elixir',
    '/ritual',
    '/science',
    '/skin-ritual-quiz',
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

  // getAllArticles() already excludes unpublished articles, so an article
  // without a publication date can never reach the sitemap.
  const articleRoutes: MetadataRoute.Sitemap = getAllArticles()
    .filter((article) => Boolean(article.date))
    .map((article) => ({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.date as string),
      changeFrequency: 'monthly',
      priority: article.editorialTier === 'primary' ? 0.75 : 0.45,
    }))

  return [...staticRoutes, ...articleRoutes]
}
