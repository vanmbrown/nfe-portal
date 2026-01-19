export const articleMDX = {
  "clean-beauty-myths-future-nfe": () =>
    import("./clean-beauty-myths-future-nfe.mdx"),
  "ingredient-translation-brightening-melanated-skin": () =>
    import("./ingredient-translation-brightening-melanated-skin.mdx"),
  "refill-culture-quiet-sustainable-luxury": () =>
    import("./refill-culture-quiet-sustainable-luxury.mdx"),
  "barrier-wealth-aging-melanated-skin": () =>
    import("./why_aging_melanated_skin_ages_differently.mdx"),
  "barrier-wealth-midlife-dryness-after-45": () =>
    import("./drier_skin_after_45.mdx"),
  "black-dont-crack": () => import("./black-dont-crack.mdx"),
  "water-vs-oil": () => import("./water-vs-oil.mdx"),
} as const;

export type ArticleSlug = keyof typeof articleMDX;
export const allArticleSlugs = Object.keys(articleMDX) as ArticleSlug[];
