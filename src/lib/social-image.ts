/** The image a shared NFE link carries when the page authors none of its own.
 *
 *  A purpose-built card at the platforms' native 1200x630, drawn from the
 *  maison tokens rather than cropped from a photograph: deep green ground, the
 *  wordmark in warm gold, warm-bone supporting type, generous negative space.
 *  Typographic and architectural by decision, because a card built from type
 *  survives every crop a platform applies, and forcing a composed photograph
 *  into 1.91 is what cost the Beauty Cabinet plate a product.
 *
 *  Regenerate with `node scripts/build-social-card.js`.
 *
 *  Articles keep their own authored imagery. This is the fallback for the
 *  homepage and the core routes only.
 */
export const SOCIAL_IMAGE = {
  url: '/images/social/nfe-default-share-card.png',
  width: 1200,
  height: 630,
  alt: 'NFE. Not for everyone. Luxury-performance skincare for skin that has lived.',
} as const
