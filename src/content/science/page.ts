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
      'Mature melanated skin is rarely one need at a time. Comfort, hydration, tone, texture and resilience move together, and they are usually discussed separately, if they are discussed at all.',
    subIntro:
      'This is where NFE explains how it thinks about that relationship. You can read all of it without choosing anything.',
  },

  method: {
    id: 'why-different',
    eyebrow: 'Why this reads differently',
    heading: 'An explanation, not an assessment.',
    body: [
      'Most skincare education begins by asking what is wrong with you. It sorts, scores, and returns a verdict, and the verdict usually resolves into a product.',
      'NFE does not do that. Nothing here assesses your skin, and nothing here is a diagnosis. What follows is an account of how experienced, melanated skin tends to behave, and how NFE formulates in response.',
      'If a topic below draws you, you can follow it. If you would rather simply read, the whole page is written to be read.',
    ],
  },

  scienceMethod: {
    eyebrow: 'Method',
    heading: 'How the NFE Science Map works.',
    introduction:
      'Visible skin needs rarely appear in isolation. Dryness can flatten radiance. Barrier discomfort can make tone look less even. Texture reads more sharply when skin feels depleted. The Science Map holds those relationships in one view, then shows the formulation logic behind them.',
    steps: [
      {
        id: 'select',
        stepLabel: 'Step 1',
        title: 'Select what you are exploring',
        description:
          'Choose the pathways that feel closest to how your skin looks or feels today. Your selections stay on this page and simply change what the map brings into focus.',
      },
      {
        id: 'relationships',
        stepLabel: 'Step 2',
        title: 'See the relationships by layer',
        description:
          'The schematic brings forward the surface and appearance layers connected to what you chose, without producing a diagnosis, a score, or a saved profile.',
      },
      {
        id: 'formulation',
        stepLabel: 'Step 3',
        title: 'Understand the formulation logic',
        description:
          'Layer Context and the Concern-to-Formula Matrix explain how NFE approaches hydration, comfort, tone integrity, texture and visible resilience.',
      },
    ],
    // Title case, per the founder's wording for the strengthened invitation.
    // The brief also asked to correct a misspelling — "Intepretation" — which
    // does not appear anywhere in this codebase. Only the casing changed.
    ctaLabel: 'Start Your Skin Interpretation',
    ctaHref: '#build-your-nfe-skin-profile',
  },

  profileIntro: {
    eyebrow: 'Build Your NFE Skin Profile',
    heading: 'Build Your NFE Skin Profile',
    description:
      'Choose the pathways that reflect what you would like to understand. Your selections stay on this page and simply change how the map, Layer Context and formula logic are emphasised.',
    boundary: 'An interpretive guide, not a diagnosis.',
    privacy: 'Nothing is saved or submitted.',
    anchorId: 'build-your-nfe-skin-profile',
  },

  entryModes: {
    label: 'How would you like to begin?',
    pathwayLabel: 'Explore by pathway',
    profileLabel: 'Build your NFE Skin Profile',
  },

  skinProfile: {
    eyebrow: 'Build Your NFE Skin Profile',
    heading: 'Select what your skin is asking for.',
    description:
      'Choose the signals that feel most relevant to how your skin looks or feels today. Your selections stay within this page and simply change what the NFE Science Map brings into focus.',
    boundary: 'An interpretive guide, not a diagnosis.',
    privacy: 'Nothing is saved or submitted.',
    contextLabel: 'Skin context',
    contextHelper:
      'Choose the option that most closely reflects how your skin tends to feel.',
    signalsLabel: 'What your skin is asking for',
    signalsHelper: 'Choose the signals you would like to understand.',
    limitNote: 'Choose up to five signals so the interpretation remains clear.',
    applyLabel: 'View my NFE Skin Profile',
    applyDisabledHelper:
      'Choose at least one signal to build your NFE Skin Profile.',
    resetLabel: 'Start over',
    appliedStatus: 'Your profile is now reflected across the Science Map.',
    appliedDetail:
      'The highlighted layers, Layer Context panels, and formula matrix correspond to the signals you selected.',
  },

  layerScience: {
    eyebrow: 'Layer Science',
    heading: 'How NFE Face Elixir supports the skin by layer.',
    description:
      "NFE Face Elixir is built as a layered support system. Some ingredients focus on the outer barrier and surface feel. Others support the appearance of tone, radiance, and texture. Others contribute to the formula's visible well-aging and antioxidant story.",
    cards: [
      {
        id: 'stratum-corneum',
        title: 'Stratum Corneum',
        body: 'The outermost visible layer, where dryness, tightness, softness, and barrier comfort are often felt first.',
      },
      {
        id: 'epidermis',
        title: 'Epidermis',
        body: 'The layer most closely tied to the appearance of tone, radiance, dullness, and visible texture.',
      },
      {
        id: 'dermis-support-story',
        title: 'Dermis Support Story',
        // The closing sentence is the claims boundary for this whole module and
        // is asserted verbatim by test. It must not be softened or dropped.
        body: 'A cosmetic storytelling layer for the appearance of firmness, smoothness, and visible well-aging support. NFE does not claim to change dermal structure.',
      },
    ],
  },

  mapIntro: {
    eyebrow: 'The Skin Layer Intelligence Map',
    heading: 'Where visible needs appear, and how they relate.',
    body: 'Dryness can flatten radiance. Barrier stress can make tone look more uneven than it is. Fine lines read deeper when skin is depleted. This map holds those relationships in one view.',
    defaultInterpretation:
      'Explore how barrier comfort, hydration, tone integrity, texture and visible resilience relate across the skin. Choose a pathway to bring one relationship forward, or read the layers as they are.',
    cosmeticFrameworkNote:
      'This map is an educational cosmetic framework. It describes where visible needs appear, not where an ingredient travels. NFE products are not intended to diagnose, treat, cure, or prevent disease, and NFE makes no claim to change dermal structure.',
  },

  layerContext: {
    eyebrow: 'Layer Context',
    heading: 'Where visible concerns begin. How NFE supports them.',
    body: 'Each panel reads one band of the map above. All five are here whether or not you choose a pathway. Choosing one simply brings its panel forward.',
    zonesLabel: 'Cosmetic support zones',
  },

  formulaMatrix: {
    eyebrow: 'Concern-to-Formula Matrix',
    heading: 'A simpler way to read the formula logic.',
    body: 'The same relationships, compressed. Each row connects what you are exploring to where it is read on the map, how NFE approaches it, and which ingredient families that involves.',
    columns: [
      'What you are exploring',
      'Layer context',
      'NFE formulation principle',
      'Ingredient family',
    ],
    caption:
      'Five relationships between what a visitor may be exploring, where it is read on the Skin Layer Intelligence Map, how NFE approaches it cosmetically, and the relevant ingredient families. Rows are not ranked and the order does not change.',
  },

  formulationPrinciples: [
    {
      id: 'barrier-first',
      title: 'Barrier first',
      body: 'Comfort is the foundation everything else is built on. When the surface is well conditioned, tone and texture support work better, and irritate less.',
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
    body: 'NFE was not built around one hero ingredient. It was built as a layered system: barrier comfort, hydration, tone support, antioxidant care, and visible well-aging working together. This page exists so you can see the reasoning, not just the result.',
  },

  productContext: {
    eyebrow: 'Formulation in practice',
    heading: 'Where this thinking becomes a formula.',
    body: 'Two elixirs, formulated on the principles above. The Atelier holds the full dossier for each: how it is composed, how it is meant to be used, and what it is honestly for.',
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
