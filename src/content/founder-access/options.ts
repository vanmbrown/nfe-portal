export const FOUNDER_ACCESS_SKIN_INTERESTS = [
  'Dryness',
  'Uneven-looking tone',
  'Radiance',
  'Barrier comfort',
  'Texture changes',
  'Crepey-looking skin',
  'Stubborn-looking discoloration',
  'Simple skincare rituals',
  'Mature, melanated skin care',
  'Body care after 45',
] as const

export type FounderAccessSkinInterest =
  (typeof FOUNDER_ACCESS_SKIN_INTERESTS)[number]

export const FOUNDER_ACCESS_AGE_RANGES = [
  'Under 35',
  '35–44',
  '45–54',
  '55–64',
  '65+',
  'Prefer not to say',
] as const

export const FOUNDER_ACCESS_PRODUCT_INTERESTS = [
  { value: 'face_elixir', label: 'Face Elixir' },
  { value: 'body_elixir', label: 'Body Elixir' },
  { value: 'both', label: 'Both' },
] as const

export type FounderAccessProductInterest =
  (typeof FOUNDER_ACCESS_PRODUCT_INTERESTS)[number]['value']

export const FOUNDER_ACCESS_CONSENT_TEXT_VERSION = 'founder-access-2026-07'

export const FOUNDER_ACCESS_SUCCESS_MESSAGE =
  "You're on the Founder Access list. NFE will open the Founder's Edition release in limited waves. Watch your inbox for founder updates and early access details."
