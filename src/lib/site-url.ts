// The canonical host. The apex answers 307 to www, so anything built on the
// apex (canonical tags, Open Graph image URLs, the sitemap) would advertise a
// redirect rather than the page itself. Production sets NEXT_PUBLIC_SITE_URL to
// this already; the fallback now agrees with it instead of contradicting it.
const PRODUCTION_SITE_URL = 'https://www.nfebeauty.com';

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl || configuredUrl.includes('localhost')) {
    return PRODUCTION_SITE_URL;
  }

  return configuredUrl.replace(/\/$/, '');
}
