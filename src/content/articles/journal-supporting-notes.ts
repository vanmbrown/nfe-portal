import type { WellAgingArticleGroupId } from '@/content/articles/well-aging-series'

export type JournalSupportingNoteLabel =
  | 'Earlier Note'
  | 'Foundational Essay'
  | 'From the NFE Archive'
  | 'Founder Notes'
  | 'Ritual Notes'

export type JournalSupportingNote = {
  slug: string
  label: JournalSupportingNoteLabel
}

export const JOURNAL_SUPPORTING_NOTES_BY_GROUP: Record<
  WellAgingArticleGroupId,
  JournalSupportingNote[]
> = {
  'philosophy-presence': [
    { slug: 'clean-beauty-myths-future-nfe', label: 'Foundational Essay' },
    { slug: 'refill-culture-quiet-sustainable-luxury', label: 'Earlier Note' },
    { slug: 'whats-in-my-beauty-cabinet', label: 'Founder Notes' },
  ],
  'barrier-intelligence': [
    { slug: 'barrier-wealth-aging-melanated-skin', label: 'Foundational Essay' },
    { slug: 'water-vs-oil', label: 'Foundational Essay' },
    { slug: 'barrier-wealth-midlife-dryness-after-45', label: 'Earlier Note' },
  ],
  'pigment-inflammation': [
    {
      slug: 'ingredient-translation-brightening-melanated-skin',
      label: 'Foundational Essay',
    },
    { slug: 'black-dont-crack', label: 'Earlier Note' },
  ],
  'body-sensuality-ritual': [
    { slug: 'the-scent-of-feeling-beautiful', label: 'Ritual Notes' },
  ],
  'modern-care': [],
}

export const ALL_JOURNAL_SUPPORTING_NOTE_SLUGS = Object.values(
  JOURNAL_SUPPORTING_NOTES_BY_GROUP
)
  .flat()
  .map((note) => note.slug)
