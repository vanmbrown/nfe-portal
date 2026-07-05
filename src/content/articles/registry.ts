export const articleMDX = {
  'well-aging-is-not-disappearing': () =>
    import('./well-aging-is-not-disappearing.mdx'),
  'mature-skin-is-underbuilt': () => import('./mature-skin-is-underbuilt.mdx'),
  'calm-is-part-of-the-science': () => import('./calm-is-part-of-the-science.mdx'),
  'glow-is-a-barrier-story': () => import('./glow-is-a-barrier-story.mdx'),
  'dark-spots-inflammation-before-brightening': () =>
    import('./dark-spots-inflammation-before-brightening.mdx'),
  'body-care-neglected-prestige-beauty': () =>
    import('./body-care-neglected-prestige-beauty.mdx'),
  'sensuality-gap-in-skincare': () => import('./sensuality-gap-in-skincare.mdx'),
  'what-mature-skin-needs-from-makeup': () =>
    import('./what-mature-skin-needs-from-makeup.mdx'),
  'shaving-is-a-barrier-event': () => import('./shaving-is-a-barrier-event.mdx'),
  'well-aging-not-anti-aging': () => import('./well-aging-not-anti-aging.mdx'),
  'ritual-over-correction': () => import('./ritual-over-correction.mdx'),
  'clean-beauty-myths-future-nfe': () =>
    import('./clean-beauty-myths-future-nfe.mdx'),
  'ingredient-translation-brightening-melanated-skin': () =>
    import('./ingredient-translation-brightening-melanated-skin.mdx'),
  'refill-culture-quiet-sustainable-luxury': () =>
    import('./refill-culture-quiet-sustainable-luxury.mdx'),
  'barrier-wealth-aging-melanated-skin': () =>
    import('./why_aging_melanated_skin_ages_differently.mdx'),
  'barrier-wealth-midlife-dryness-after-45': () =>
    import('./drier_skin_after_45.mdx'),
  'black-dont-crack': () => import('./black-dont-crack.mdx'),
  'water-vs-oil': () => import('./water-vs-oil.mdx'),
} as const

export type ArticleSlug = keyof typeof articleMDX
export const allArticleSlugs = Object.keys(articleMDX) as ArticleSlug[]
