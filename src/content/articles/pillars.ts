export type JournalPillarId =
  | 'the-new-language-of-well-aging'
  | 'barrier-wealth'
  | 'well-aging'
  | 'tone-integrity'
  | 'ritual-intelligence'
  | 'proof-discipline'

export type JournalPillar = {
  id: JournalPillarId
  eyebrow: string
  title: string
  description: string
}

export const JOURNAL_PILLARS: JournalPillar[] = [
  {
    id: 'the-new-language-of-well-aging',
    eyebrow: 'The New Language of Well-Aging',
    title: 'NFE’s primary editorial pillar.',
    description:
      'Nine essays reframing mature, melanated skincare through presence, barrier intelligence, pigment awareness, sensuality, and support — not correction, disappearance, or fear.',
  },
  {
    id: 'well-aging',
    eyebrow: 'Well-Aging Philosophy',
    title: 'Well-aging, not anti-aging.',
    description:
      'Editorial language for mature skin that respects dignity, restraint, and cosmetic care without fear or reversal promises.',
  },
  {
    id: 'tone-integrity',
    eyebrow: 'Tone Integrity',
    title: 'Tone appearance without bleaching language.',
    description:
      'How melanated skin deserves tone education that is specific, calm, and free from bleaching or correction framing.',
  },
  {
    id: 'ritual-intelligence',
    eyebrow: 'Ritual Intelligence',
    title: 'Ritual over correction.',
    description:
      'Why daily rhythm, hydration balance, and fewer better steps often outperform reactive product stacking.',
  },
  {
    id: 'proof-discipline',
    eyebrow: 'Proof Discipline',
    title: 'Fewer, better formulations.',
    description:
      'Transparency, restraint, sustainability, and proof discipline as part of luxury skincare integrity.',
  },
]

export function getJournalPillar(id: JournalPillarId): JournalPillar | undefined {
  return JOURNAL_PILLARS.find((pillar) => pillar.id === id)
}
