export const WELL_AGING_SERIES_SLUG = 'the-new-language-of-well-aging'

export const WELL_AGING_SERIES_TITLE = 'The New Language of Well-Aging'

export const WELL_AGING_SERIES_DEK =
  'A collection of NFE essays reframing well-aging for mature, melanated skin — from barrier support and pigment intelligence to body care, sensuality, grooming, makeup, and the right to remain visibly, beautifully present.'

export const WELL_AGING_IMAGE_BASE =
  '/images/journal/the-new-language-of-well-aging'

export type WellAgingArticleGroupId =
  | 'philosophy-presence'
  | 'barrier-intelligence'
  | 'pigment-inflammation'
  | 'body-sensuality-ritual'
  | 'modern-care'

export type WellAgingArticleGroup = {
  id: WellAgingArticleGroupId
  eyebrow: string
  title: string
  slugs: string[]
}

export const WELL_AGING_ARTICLE_GROUPS: WellAgingArticleGroup[] = [
  {
    id: 'philosophy-presence',
    eyebrow: 'Philosophy & Presence',
    title: 'Language, presence, and the architecture of support.',
    slugs: ['well-aging-is-not-disappearing', 'mature-skin-is-underbuilt'],
  },
  {
    id: 'barrier-intelligence',
    eyebrow: 'Barrier Intelligence',
    title: 'Calm, glow, and the science of restraint.',
    slugs: ['calm-is-part-of-the-science', 'glow-is-a-barrier-story'],
  },
  {
    id: 'pigment-inflammation',
    eyebrow: 'Pigment & Inflammation',
    title: 'Tone, friction, and what the skin remembers.',
    slugs: [
      'dark-spots-inflammation-before-brightening',
      'shaving-is-a-barrier-event',
    ],
  },
  {
    id: 'body-sensuality-ritual',
    eyebrow: 'Body, Sensuality & Ritual',
    title: 'Body care, pleasure, and the return to self.',
    slugs: ['body-care-neglected-prestige-beauty', 'sensuality-gap-in-skincare'],
  },
  {
    id: 'modern-care',
    eyebrow: 'Modern Care',
    title: 'Presentation, polish, and grown-up beauty language.',
    slugs: ['what-mature-skin-needs-from-makeup'],
  },
]

export const WELL_AGING_ARTICLE_ORDER = WELL_AGING_ARTICLE_GROUPS.flatMap(
  (group) => group.slugs
)
