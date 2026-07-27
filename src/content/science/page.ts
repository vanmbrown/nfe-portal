import type { SciencePageContent } from './types'

/**
 * Editorial content for the Science page.
 *
 * Preserved from the previous implementation, per the Phase 1 brief's
 * instruction not to discard the strongest existing content:
 *  - the Proof Discipline chapter, largely intact
 *  - the Founder Note, whose central sentence is the strongest on the page
 *  - the barrier-first and mature-melanated-skin framing from the hero
 *  - the cosmetic-framework caution around the schematic
 *
 * Removed, per the same brief: the "How the NFE Science Map works" chapter,
 * which existed only to explain the quiz.
 */
export const SCIENCE_PAGE: SciencePageContent = {
  hero: {
    eyebrow: 'NFE Science',
    heading: 'Science that interprets skin, not just ingredients.',
    intro:
      'Mature melanated skin is rarely one need at a time. Comfort, hydration, tone, texture and resilience move together — and they are usually discussed separately, if they are discussed at all.',
    subIntro:
      'This is where NFE explains how it thinks about that relationship. You can read all of it without choosing anything.',
  },

  method: {
    id: 'why-different',
    eyebrow: 'Why this reads differently',
    heading: 'An explanation, not an assessment.',
    body: [
      'Most skincare education begins by asking what is wrong with you. It sorts, scores, and returns a verdict — and the verdict usually resolves into a product.',
      'NFE does not do that. Nothing here assesses your skin, and nothing here is a diagnosis. What follows is an account of how experienced, melanated skin tends to behave, and how NFE formulates in response.',
      'If a topic below draws you, you can follow it. If you would rather simply read, the whole page is written to be read.',
    ],
  },

  mapIntro: {
    eyebrow: 'The Skin Layer Intelligence Map',
    heading: 'Where visible needs appear, and how they relate.',
    body: 'Dryness can flatten radiance. Barrier stress can make tone look more uneven than it is. Fine lines read deeper when skin is depleted. This map holds those relationships in one view.',
    defaultInterpretation:
      'Explore how barrier comfort, hydration, tone integrity, texture and visible resilience relate across the skin. Choose a pathway to bring one relationship forward — or read the layers as they are.',
    cosmeticFrameworkNote:
      'This map is an educational cosmetic framework. It describes where visible needs appear, not where an ingredient travels. NFE products are not intended to diagnose, treat, cure, or prevent disease, and NFE makes no claim to change dermal structure.',
  },

  formulationPrinciples: [
    {
      id: 'barrier-first',
      title: 'Barrier first',
      body: 'Comfort is the foundation everything else is built on. When the surface is well conditioned, tone and texture support work better — and irritate less.',
    },
    {
      id: 'fewer-better',
      title: 'Fewer, better',
      body: 'Two complete formulas, not a twelve-step sequence. Restraint is a formulation decision, not a limitation.',
    },
    {
      id: 'layered-support',
      title: 'Layered, not single-hero',
      body: 'No one ingredient carries a formula. Support is distributed across families that work in relation to each other.',
    },
    {
      id: 'patience',
      title: 'Patience as a principle',
      body: 'Tone and texture respond over months. Formulas are built for consistency rather than for a dramatic first week.',
    },
  ],

  proof: {
    eyebrow: 'Proof discipline',
    heading: 'Proof should be built before it is amplified.',
    stages: [
      {
        id: 'founder-formulation',
        title: 'Founder and formulation proof',
        body: 'NFE begins with founder experience, formulation discipline, public INCI transparency, and cosmetic-use guardrails.',
      },
      {
        id: 'feedback',
        title: 'Customer feedback signals',
        body: 'Discovery, Concierge, and future check-ins can help identify comfort, glow, texture, and tone perception over time.',
      },
      {
        id: 'roadmap',
        title: 'Testing roadmap',
        body: 'Future proof should separate stability, safety, customer feedback, and any formal testing before making stronger claims.',
      },
    ],
  },

  founderNote: {
    eyebrow: 'Founder note',
    heading: 'Mature melanated skin should not be treated as an afterthought.',
    body: 'NFE was not built around one hero ingredient. It was built as a layered system — barrier comfort, hydration, tone support, antioxidant care, and visible well-aging working together. This page exists so you can see the reasoning, not just the result.',
  },

  productContext: {
    eyebrow: 'Formulation in practice',
    heading: 'Where this thinking becomes a formula.',
    body: 'Two elixirs, formulated on the principles above. The Atelier holds the full dossier for each — how it is composed, how it is meant to be used, and what it is honestly for.',
    links: [
      { label: 'Face Elixir', href: '/products/face-elixir' },
      { label: 'Body Elixir', href: '/products/body-elixir' },
      { label: 'The Atelier', href: '/shop' },
    ],
  },

  concierge: {
    eyebrow: 'Concierge',
    heading: 'If you would like to think this through with someone.',
    body: 'Concierge is open for quiet, unhurried conversation about how NFE may belong in your ritual. No assessment, no pressure.',
    link: { label: 'Speak with Concierge', href: '/concierge' },
  },

  closingDisclaimer:
    'NFE Science is cosmetic education. It does not diagnose, treat, cure, or prevent any medical condition. Results and experiences vary. For persistent or complex skin concerns, consult a licensed professional.',
}
