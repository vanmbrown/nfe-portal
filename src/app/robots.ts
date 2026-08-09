import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Internal surfaces. Each already returns 404 in a production build or
      // sits behind authentication; this is the second layer, so they are never
      // crawled even from a preview deployment where the gate is open.
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/private/',
        '/dev/',
        '/focus-group/',
        '/skin-strategy',
        '/community-input',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
