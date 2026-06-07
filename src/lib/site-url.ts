const PRODUCTION_SITE_URL = 'https://nfebeauty.com';

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl || configuredUrl.includes('localhost')) {
    return PRODUCTION_SITE_URL;
  }

  return configuredUrl.replace(/\/$/, '');
}
