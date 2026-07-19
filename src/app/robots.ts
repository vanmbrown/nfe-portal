import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /dev/ holds internal review surfaces (e.g. the Maison token specimen).
      // Those routes already return 404 in production builds; this is a second
      // layer so they are never crawled even in a preview deployment.
      disallow: ['/admin/', '/api/', '/_next/', '/private/', '/dev/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
