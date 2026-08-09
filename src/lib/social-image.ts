/** The image a shared NFE link carries.
 *
 *  This is the approved homepage hero at its own ratio, not a purpose-made
 *  sharing card. No 1200x630 asset exists in the repository, and cropping an
 *  approved brand image to make one is a founder decision rather than an
 *  engineering one, so the native asset is declared and the platforms letterbox
 *  or centre-crop it themselves.
 *
 *  When a dedicated card is approved, replace the three values below and every
 *  surface picks it up: the root layout, and any route that does not declare
 *  its own image.
 */
export const SOCIAL_IMAGE = {
  url: '/images/homepage/nfe-home-hero-product-vessel-desktop-1600w.webp',
  width: 1600,
  height: 1132,
  alt: 'An NFE elixir vessel resting on a quiet, warm surface.',
} as const
