'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'

type SkinTypeId =
  | 'dry'
  | 'normal'
  | 'combination'
  | 'oily'
  | 'sensitive'
  | 'mature_changing'
  | 'not_sure'

type ConcernId =
  | 'dryness_barrier'
  | 'dark_marks_discoloration'
  | 'uneven_tone'
  | 'dullness_glow'
  | 'fine_lines_smoothness'
  | 'firmness_bounce'
  | 'texture_visible_pores'
  | 'sensitivity_redness'

type PriorityId =
  | 'barrier_support'
  | 'hydration'
  | 'tone_evenness'
  | 'radiance'
  | 'visible_aging_support'
  | 'texture_refinement'
  | 'comfort'
  | 'firmness_support'
  | 'antioxidant_support'

type ProfileId =
  | 'barrier_glow_loss'
  | 'tone_uneven_dehydration'
  | 'mature_texture_line_support'
  | 'reactive_barrier_stress'
  | 'radiance_even_tone'
  | 'balanced_preventive_support'

interface SkinTypeOption {
  id: SkinTypeId
  label: string
  description: string
  modifiers: Partial<Record<PriorityId, number>>
}

interface ConcernOption {
  id: ConcernId
  label: string
  description: string
  primary: PriorityId[]
  secondary: PriorityId[]
}

interface Priority {
  id: PriorityId
  label: string
  description: string
}

interface Active {
  id: string
  name: string
  layer: 'Stratum Corneum' | 'Epidermis' | 'Dermis Support Story'
  system:
    | 'Barrier and Hydration System'
    | 'Tone and Radiance System'
    | 'Antioxidant and Aging-Support System'
    | 'Comfort and Conditioning System'
  matchedConcerns: ConcernId[]
  priorities: PriorityId[]
  whySelected: string
  whatYouMayNotice: string
  pairsWith: string
  expectation: string
  hero?: boolean
}

interface Profile {
  id: ProfileId
  name: string
  summary: string
  formulaLogic: string
}

const SKIN_TYPES: SkinTypeOption[] = [
  {
    id: 'dry',
    label: 'Dry',
    description: 'Skin often feels tight, depleted, or under-nourished.',
    modifiers: { hydration: 2, barrier_support: 2 },
  },
  {
    id: 'normal',
    label: 'Normal',
    description: 'Skin feels relatively balanced most days.',
    modifiers: {},
  },
  {
    id: 'combination',
    label: 'Combination',
    description: 'Skin shifts between drier and oilier areas.',
    modifiers: { hydration: 1, texture_refinement: 1 },
  },
  {
    id: 'oily',
    label: 'Oily',
    description: 'Shine, visible pores, or surface texture may be priorities.',
    modifiers: { texture_refinement: 2, tone_evenness: 1 },
  },
  {
    id: 'sensitive',
    label: 'Sensitive',
    description: 'Skin often needs a slower, comfort-first approach.',
    modifiers: { comfort: 2, barrier_support: 2 },
  },
  {
    id: 'mature_changing',
    label: 'Mature / Changing Skin',
    description: 'Skin feels different than it used to and needs layered support.',
    modifiers: { visible_aging_support: 2, barrier_support: 1 },
  },
  {
    id: 'not_sure',
    label: 'Not Sure',
    description: 'You are still learning what your skin is asking for.',
    modifiers: {},
  },
]

const CONCERNS: ConcernOption[] = [
  {
    id: 'dryness_barrier',
    label: 'Dryness / Barrier Support',
    description: 'Skin feels dry, tight, depleted, or less comfortable than usual.',
    primary: ['barrier_support', 'hydration'],
    secondary: ['comfort', 'visible_aging_support'],
  },
  {
    id: 'dark_marks_discoloration',
    label: 'Dark Marks / Discoloration',
    description: 'Visible marks, uneven patches, or discoloration are priorities.',
    primary: ['tone_evenness'],
    secondary: ['radiance', 'comfort'],
  },
  {
    id: 'uneven_tone',
    label: 'Uneven Tone',
    description: 'Tone looks patchy, inconsistent, or less uniform.',
    primary: ['tone_evenness'],
    secondary: ['radiance'],
  },
  {
    id: 'dullness_glow',
    label: 'Dullness / Glow',
    description: 'Skin looks tired, flat, or less luminous.',
    primary: ['radiance', 'hydration'],
    secondary: ['tone_evenness', 'antioxidant_support'],
  },
  {
    id: 'fine_lines_smoothness',
    label: 'Fine Lines / Smoothness',
    description: 'Fine lines or surface smoothness are visible concerns.',
    primary: ['visible_aging_support', 'texture_refinement'],
    secondary: ['hydration', 'barrier_support'],
  },
  {
    id: 'firmness_bounce',
    label: 'Firmness / Bounce',
    description: 'Skin looks or feels less firm, full, or bouncy.',
    primary: ['firmness_support', 'visible_aging_support'],
    secondary: ['hydration', 'antioxidant_support'],
  },
  {
    id: 'texture_visible_pores',
    label: 'Texture / Visible Pores',
    description: 'Texture, roughness, or visible pores are part of the concern pattern.',
    primary: ['texture_refinement'],
    secondary: ['hydration', 'tone_evenness'],
  },
  {
    id: 'sensitivity_redness',
    label: 'Sensitivity / Redness',
    description: 'Skin looks reactive, easily irritated, or visibly flushed.',
    primary: ['comfort', 'barrier_support'],
    secondary: ['hydration', 'tone_evenness'],
  },
]

const PRIORITIES: Record<PriorityId, Priority> = {
  barrier_support: {
    id: 'barrier_support',
    label: 'Barrier comfort and moisture retention',
    description:
      'Your selections point to comfort, softness, and a better-conditioned skin surface as important first priorities.',
  },
  hydration: {
    id: 'hydration',
    label: 'Hydration and water-binding support',
    description:
      'Your profile suggests that hydration support may help skin look fresher, more supple, and less depleted.',
  },
  tone_evenness: {
    id: 'tone_evenness',
    label: 'More even-looking tone',
    description:
      'Your selections suggest tone evenness is important, especially when glow, marks, or uneven-looking areas overlap.',
  },
  radiance: {
    id: 'radiance',
    label: 'Visible radiance',
    description:
      'Your profile points to luminosity that comes from hydration, tone support, and consistent care rather than temporary shine.',
  },
  visible_aging_support: {
    id: 'visible_aging_support',
    label: 'Visible well-aging support',
    description:
      'Your selections suggest support for the look of fine lines, smoothness, and better-conditioned mature skin.',
  },
  texture_refinement: {
    id: 'texture_refinement',
    label: 'Smoother-looking texture',
    description:
      'Your profile suggests texture and visible pores may look better when skin is hydrated, comfortable, and not over-stripped.',
  },
  comfort: {
    id: 'comfort',
    label: 'Skin comfort and visible calm',
    description:
      'Your selections point toward a slower, comfort-first ritual with restraint around layering too many strong products.',
  },
  firmness_support: {
    id: 'firmness_support',
    label: 'Appearance of firmness and bounce',
    description:
      'Your profile suggests that the look of firmness should be supported through conditioning, antioxidants, peptides, and consistency.',
  },
  antioxidant_support: {
    id: 'antioxidant_support',
    label: 'Antioxidant care',
    description:
      'Your selections suggest support from ingredients that help skin look brighter, more resilient, and better conditioned.',
  },
}

const PROFILES: Record<ProfileId, Profile> = {
  barrier_glow_loss: {
    id: 'barrier_glow_loss',
    name: 'Barrier-Depleted Glow Loss',
    summary:
      'Your selections suggest skin that may be struggling to hold comfort, moisture, and radiance at the same time.',
    formulaLogic:
      'NFE prioritizes barrier support first, then layers in humectants, emollients, antioxidants, and tone-supportive actives to help skin look more supple and luminous.',
  },
  tone_uneven_dehydration: {
    id: 'tone_uneven_dehydration',
    name: 'Tone-Uneven Dehydration',
    summary:
      'Your selections suggest skin that needs tone support without ignoring hydration and barrier comfort.',
    formulaLogic:
      'NFE pairs tone-supportive actives with replenishing ingredients that help the skin look smoother, more comfortable, and more radiant over time.',
  },
  mature_texture_line_support: {
    id: 'mature_texture_line_support',
    name: 'Mature Texture and Line Support',
    summary:
      'Your selections suggest visible texture, fine lines, and firmness are key priorities.',
    formulaLogic:
      'NFE supports this profile with antioxidant, peptide, retinol-alternative, and barrier-supportive ingredients that help skin appear smoother and better conditioned.',
  },
  reactive_barrier_stress: {
    id: 'reactive_barrier_stress',
    name: 'Reactive Barrier Stress',
    summary:
      'Your selections suggest skin that may need a calmer, barrier-first approach.',
    formulaLogic:
      'NFE emphasizes comfort, moisture retention, and visible resilience before pushing stronger tone or texture goals.',
  },
  radiance_even_tone: {
    id: 'radiance_even_tone',
    name: 'Radiance and Even-Tone Priority',
    summary:
      'Your selections suggest that brightness, radiance, and tone evenness are central goals.',
    formulaLogic:
      'NFE supports this profile through layered tone support, antioxidant care, and hydration that helps glow look more polished rather than temporary.',
  },
  balanced_preventive_support: {
    id: 'balanced_preventive_support',
    name: 'Balanced Preventive Support',
    summary:
      'Your selections suggest a balanced profile that may benefit from consistency and steady support rather than an aggressive routine.',
    formulaLogic:
      'NFE focuses on maintaining hydration, barrier comfort, antioxidant care, and visible radiance through a fewer-better ritual.',
  },
}

const ACTIVES: Active[] = [
  {
    id: 'ceramides_cholesterol',
    name: 'Ceramides + Cholesterol',
    layer: 'Stratum Corneum',
    system: 'Barrier and Hydration System',
    matchedConcerns: ['dryness_barrier', 'sensitivity_redness', 'fine_lines_smoothness'],
    priorities: ['barrier_support', 'comfort', 'hydration'],
    whySelected:
      'Selected to support the outer barrier story, where comfort, softness, and moisture retention are often felt first.',
    whatYouMayNotice:
      'Skin may feel less tight, more cushioned, and better conditioned with consistent use.',
    pairsWith: 'Panthenol, squalane, hyaluronic acid 4D, and gamma-PGA.',
    expectation: 'Barrier support is often felt before it is visibly seen.',
    hero: true,
  },
  {
    id: 'gamma_pga',
    name: 'Gamma-PGA',
    layer: 'Stratum Corneum',
    system: 'Barrier and Hydration System',
    matchedConcerns: ['dryness_barrier', 'dullness_glow', 'fine_lines_smoothness'],
    priorities: ['hydration', 'radiance', 'barrier_support'],
    whySelected:
      'Used for water-binding support and to reinforce the formula hydration story.',
    whatYouMayNotice: 'Skin may look fresher, more hydrated, and less flat.',
    pairsWith: 'Hyaluronic acid 4D, panthenol, and squalane.',
    expectation: 'Hydration can improve the look of glow quickly, but lasting support depends on consistency.',
  },
  {
    id: 'hyaluronic_acid_4d',
    name: 'Hyaluronic Acid 4D',
    layer: 'Stratum Corneum',
    system: 'Barrier and Hydration System',
    matchedConcerns: ['dryness_barrier', 'dullness_glow', 'fine_lines_smoothness'],
    priorities: ['hydration', 'visible_aging_support', 'radiance'],
    whySelected:
      'Included to support multi-level hydration on the skin surface and help skin look more supple.',
    whatYouMayNotice: 'Skin may appear plumper, smoother, and more luminous.',
    pairsWith: 'Gamma-PGA, panthenol, squalane, and ceramides + cholesterol.',
    expectation: 'Best understood as surface hydration support, not a structural claim.',
  },
  {
    id: 'panthenol',
    name: 'Panthenol',
    layer: 'Stratum Corneum',
    system: 'Comfort and Conditioning System',
    matchedConcerns: ['dryness_barrier', 'sensitivity_redness', 'fine_lines_smoothness'],
    priorities: ['comfort', 'barrier_support', 'hydration'],
    whySelected:
      'Selected for comfort, conditioning, and a more resilient-feeling skin surface.',
    whatYouMayNotice: 'Skin may feel softer, less tight, and more comfortable.',
    pairsWith: 'Ceramides + cholesterol, squalane, and gamma-PGA.',
    expectation: 'Especially useful in a ritual designed for dry-feeling or stressed-looking skin.',
  },
  {
    id: 'squalane_emollients',
    name: 'Squalane + Emollients',
    layer: 'Stratum Corneum',
    system: 'Barrier and Hydration System',
    matchedConcerns: ['dryness_barrier', 'dullness_glow', 'fine_lines_smoothness'],
    priorities: ['barrier_support', 'hydration', 'radiance'],
    whySelected:
      'Chosen to soften the surface feel, improve slip, and make consistent use more inviting.',
    whatYouMayNotice: 'Skin may feel smoother, silkier, and more polished.',
    pairsWith: 'Ceramides + cholesterol, panthenol, and THD ascorbate.',
    expectation: 'Emollient support is part of the sensory discipline of the ritual.',
  },
  {
    id: 'niacinamide',
    name: 'Niacinamide',
    layer: 'Epidermis',
    system: 'Tone and Radiance System',
    matchedConcerns: [
      'uneven_tone',
      'dullness_glow',
      'texture_visible_pores',
      'dryness_barrier',
    ],
    priorities: ['tone_evenness', 'texture_refinement', 'barrier_support'],
    whySelected:
      'A versatile active that supports barrier appearance, tone evenness, visible pore refinement, and overall clarity.',
    whatYouMayNotice: 'Skin may look more balanced, smoother, and more even over time.',
    pairsWith: 'Tranexamic acid, licorice root, ceramides + cholesterol, and panthenol.',
    expectation: 'Useful because it supports multiple overlapping needs at once.',
    hero: true,
  },
  {
    id: 'tranexamic_acid',
    name: 'Tranexamic Acid',
    layer: 'Epidermis',
    system: 'Tone and Radiance System',
    matchedConcerns: ['uneven_tone', 'dark_marks_discoloration', 'dullness_glow'],
    priorities: ['tone_evenness', 'radiance'],
    whySelected:
      'Included as part of the tone-support system for the appearance of uneven tone and discoloration.',
    whatYouMayNotice: 'Skin may gradually look more even and less patchy with consistent use.',
    pairsWith: 'Niacinamide, alpha-arbutin, licorice root, and THD ascorbate.',
    expectation: 'Tone support requires patience and consistency.',
    hero: true,
  },
  {
    id: 'alpha_arbutin',
    name: 'Alpha-Arbutin',
    layer: 'Epidermis',
    system: 'Tone and Radiance System',
    matchedConcerns: ['dark_marks_discoloration', 'uneven_tone', 'dullness_glow'],
    priorities: ['tone_evenness', 'radiance'],
    whySelected:
      'Included to support the appearance of a more even-looking tone and a stronger radiance strategy.',
    whatYouMayNotice: 'Skin may look brighter and more uniform over time.',
    pairsWith: 'Tranexamic acid, niacinamide, and licorice root.',
    expectation: 'Best positioned as part of a layered tone-support system.',
  },
  {
    id: 'licorice_root',
    name: 'Licorice Root',
    layer: 'Epidermis',
    system: 'Comfort and Conditioning System',
    matchedConcerns: [
      'dark_marks_discoloration',
      'uneven_tone',
      'sensitivity_redness',
      'dullness_glow',
    ],
    priorities: ['tone_evenness', 'comfort', 'radiance'],
    whySelected:
      'Selected for profiles where tone and visible calm are both part of the concern pattern.',
    whatYouMayNotice: 'Skin may look calmer, more even, and less dull.',
    pairsWith: 'Niacinamide, tranexamic acid, and alpha-arbutin.',
    expectation: 'Useful where comfort and tone support need to coexist.',
  },
  {
    id: 'thd_ascorbate',
    name: 'THD Ascorbate',
    layer: 'Dermis Support Story',
    system: 'Antioxidant and Aging-Support System',
    matchedConcerns: [
      'dullness_glow',
      'uneven_tone',
      'fine_lines_smoothness',
      'firmness_bounce',
    ],
    priorities: ['radiance', 'antioxidant_support', 'visible_aging_support'],
    whySelected:
      'An oil-soluble vitamin C derivative included for antioxidant care, radiance, and the appearance of more even-looking skin.',
    whatYouMayNotice: 'Skin may look brighter, more luminous, and more refined.',
    pairsWith: 'Ferulic acid + tocopherols, CoQ10, squalane, and kojic dipalmitate.',
    expectation: 'A premium active within the formula luxury-science story.',
    hero: true,
  },
  {
    id: 'bakuchiol',
    name: 'Bakuchiol',
    layer: 'Dermis Support Story',
    system: 'Antioxidant and Aging-Support System',
    matchedConcerns: ['fine_lines_smoothness', 'firmness_bounce', 'texture_visible_pores'],
    priorities: ['visible_aging_support', 'texture_refinement', 'firmness_support'],
    whySelected:
      'Included as retinol-alternative support for the look of smoother, more refined skin.',
    whatYouMayNotice: 'Skin may look more polished, smoother, and more even in texture.',
    pairsWith: 'GHK-Cu, THD ascorbate, niacinamide, and barrier-supportive ingredients.',
    expectation: 'Positioned as visible well-aging support, not as a structural claim.',
    hero: true,
  },
  {
    id: 'ghk_cu',
    name: 'GHK-Cu',
    layer: 'Dermis Support Story',
    system: 'Antioxidant and Aging-Support System',
    matchedConcerns: ['firmness_bounce', 'fine_lines_smoothness', 'texture_visible_pores'],
    priorities: ['firmness_support', 'visible_aging_support', 'texture_refinement'],
    whySelected:
      'Part of the peptide story that helps position Face Elixir as more than a simple glow oil.',
    whatYouMayNotice: 'Skin may look smoother, better conditioned, and more refined over time.',
    pairsWith: 'Bakuchiol, barrier-supportive ingredients, and antioxidants.',
    expectation: 'Use careful cosmetic language: appearance, conditioning, and visible support.',
  },
  {
    id: 'coq10_tocopherols',
    name: 'CoQ10 + Tocopherols',
    layer: 'Epidermis',
    system: 'Antioxidant and Aging-Support System',
    matchedConcerns: ['dullness_glow', 'fine_lines_smoothness', 'firmness_bounce'],
    priorities: ['antioxidant_support', 'radiance', 'visible_aging_support'],
    whySelected:
      'Selected to support the antioxidant story and reinforce the formula conditioning feel.',
    whatYouMayNotice: 'Skin may look more radiant, conditioned, and less tired.',
    pairsWith: 'THD ascorbate, ferulic acid, and squalane.',
    expectation: 'Part of the formula long-game support system.',
  },
  {
    id: 'argireline',
    name: 'Argireline',
    layer: 'Dermis Support Story',
    system: 'Antioxidant and Aging-Support System',
    matchedConcerns: ['fine_lines_smoothness'],
    priorities: ['visible_aging_support', 'texture_refinement'],
    whySelected:
      'Included for the appearance of smoother-looking expression lines within the visible well-aging system.',
    whatYouMayNotice: 'Skin may appear smoother in areas where expression lines are visible.',
    pairsWith: 'GHK-Cu, bakuchiol, and hydration support.',
    expectation: 'Do not compare this support to injectables; this is cosmetic appearance support.',
  },
]

const HOW_IT_WORKS = [
  {
    title: 'Select Your Skin Signals',
    body: 'Choose the skin type and concerns you notice most often. Your selections stay local to this page in this phase.',
  },
  {
    title: 'See Your NFE Skin Profile',
    body: 'NFE translates those selections into a skin-priority profile that shows what should be supported first.',
  },
  {
    title: 'Understand the Formula Logic',
    body: 'The page shows which Face Elixir active systems connect to your profile and why they belong together.',
  },
]

const PROOF_STAGES = [
  {
    title: 'Founder and formulation proof',
    body: 'NFE begins with founder experience, formulation discipline, public INCI transparency, and cosmetic-use guardrails.',
  },
  {
    title: 'Customer feedback signals',
    body: 'Discovery, Concierge, and future check-ins can help identify comfort, glow, texture, and tone perception over time.',
  },
  {
    title: 'Testing roadmap',
    body: 'Future proof should separate stability, safety, customer feedback, and any formal testing before making stronger claims.',
  },
]

function includes(concerns: ConcernId[], concern: ConcernId) {
  return concerns.includes(concern)
}

function assignProfile(concerns: ConcernId[]): Profile {
  if (includes(concerns, 'sensitivity_redness') && includes(concerns, 'dryness_barrier')) {
    return PROFILES.reactive_barrier_stress
  }

  if (
    (includes(concerns, 'uneven_tone') || includes(concerns, 'dark_marks_discoloration')) &&
    (includes(concerns, 'dryness_barrier') || includes(concerns, 'dullness_glow'))
  ) {
    return PROFILES.tone_uneven_dehydration
  }

  const textureConcerns = [
    'fine_lines_smoothness',
    'firmness_bounce',
    'texture_visible_pores',
  ].filter((concern) => concerns.includes(concern as ConcernId))

  if (textureConcerns.length >= 2) {
    return PROFILES.mature_texture_line_support
  }

  const toneConcerns = [
    'dullness_glow',
    'uneven_tone',
    'dark_marks_discoloration',
  ].filter((concern) => concerns.includes(concern as ConcernId))

  if (toneConcerns.length >= 2) {
    return PROFILES.radiance_even_tone
  }

  if (includes(concerns, 'dryness_barrier') && includes(concerns, 'dullness_glow')) {
    return PROFILES.barrier_glow_loss
  }

  return PROFILES.balanced_preventive_support
}

function scorePriorities(skinType: SkinTypeId, concerns: ConcernId[]) {
  const scores = Object.keys(PRIORITIES).reduce(
    (acc, priority) => ({ ...acc, [priority]: 0 }),
    {} as Record<PriorityId, number>
  )

  for (const concernId of concerns) {
    const concern = CONCERNS.find((item) => item.id === concernId)
    if (!concern) continue

    for (const priority of concern.primary) {
      scores[priority] += 2
    }
    for (const priority of concern.secondary) {
      scores[priority] += 1
    }
  }

  const selectedSkinType = SKIN_TYPES.find((item) => item.id === skinType)
  for (const [priority, modifier] of Object.entries(
    selectedSkinType?.modifiers ?? {}
  )) {
    scores[priority as PriorityId] += modifier ?? 0
  }

  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .filter(([, score]) => score > 0)
    .slice(0, 3)
    .map(([priority]) => PRIORITIES[priority as PriorityId])
}

function matchActives(concerns: ConcernId[], priorities: Priority[]) {
  const priorityIds = priorities.map((priority) => priority.id)

  return ACTIVES.map((active) => {
    const concernMatches = active.matchedConcerns.filter((concern) =>
      concerns.includes(concern)
    ).length
    const priorityMatches = active.priorities.filter((priority) =>
      priorityIds.includes(priority)
    ).length
    const score = concernMatches * 3 + priorityMatches * 2 + (active.hero ? 1 : 0)

    return { active, score }
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.active.name.localeCompare(b.active.name))
    .slice(0, 9)
    .map((item) => item.active)
}

function buildRitualGuidance(concerns: ConcernId[]) {
  const guidance = [
    'Use the ritual consistently and let comfort be part of the evaluation, not an afterthought.',
  ]

  if (includes(concerns, 'dryness_barrier')) {
    guidance.push(
      'Start with barrier comfort. Avoid stacking too many strong products while skin is trying to feel less tight and depleted.'
    )
  }

  if (includes(concerns, 'uneven_tone') || includes(concerns, 'dark_marks_discoloration')) {
    guidance.push(
      'Be patient with tone support. Pair the ritual with daily sunscreen and avoid irritation, which can make uneven tone look more visible.'
    )
  }

  if (includes(concerns, 'fine_lines_smoothness') || includes(concerns, 'firmness_bounce')) {
    guidance.push(
      'Focus on steady conditioning, hydration, antioxidant care, and visible well-aging support rather than aggressive over-correction.'
    )
  }

  if (includes(concerns, 'sensitivity_redness')) {
    guidance.push(
      'Go slowly. Comfort and barrier support should come before chasing stronger visible results.'
    )
  }

  if (includes(concerns, 'texture_visible_pores')) {
    guidance.push(
      'Support smoothness without stripping. Texture often looks more refined when skin is hydrated and better conditioned.'
    )
  }

  if (includes(concerns, 'dullness_glow')) {
    guidance.push(
      'Build glow from hydration and tone support. The goal is a more rested, even, luminous look.'
    )
  }

  return guidance.slice(0, 5)
}

function ScienceLink({
  href,
  label,
  children,
  variant = 'dark',
}: {
  href: string
  label: string
  children: ReactNode
  variant?: 'dark' | 'outline'
}) {
  const classes =
    variant === 'dark'
      ? 'bg-nfe-green-900 text-nfe-paper hover:bg-nfe-green-700 focus:bg-nfe-green-700'
      : 'border border-current text-current hover:bg-nfe-green-900 hover:text-nfe-paper focus:bg-nfe-green-900 focus:text-nfe-paper'

  return (
    <Link
      href={href}
      onClick={() =>
        trackNfeEvent({
          name: NFE_EVENT_NAMES.ctaClicked,
          area: 'science',
          pagePath: '/science',
          ctaLabel: label,
          destination: href,
          metadata: { storage: 'none', beehiiv: 'not_live' },
        })
      }
      className={`${classes} inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-colors`}
    >
      {children}
    </Link>
  )
}

export default function ScienceIntelligence() {
  const [skinType, setSkinType] = useState<SkinTypeId | ''>('')
  const [selectedConcerns, setSelectedConcerns] = useState<ConcernId[]>([])
  const [submitted, setSubmitted] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    trackNfeEvent({
      name: NFE_EVENT_NAMES.pageViewed,
      area: 'science',
      pagePath: '/science',
      metadata: { storage: 'none', beehiiv: 'not_live' },
    })
  }, [])

  const priorities = useMemo(
    () => (skinType && selectedConcerns.length ? scorePriorities(skinType, selectedConcerns) : []),
    [skinType, selectedConcerns]
  )

  const profile = useMemo(
    () => (selectedConcerns.length ? assignProfile(selectedConcerns) : null),
    [selectedConcerns]
  )

  const matchedActives = useMemo(
    () => matchActives(selectedConcerns, priorities),
    [selectedConcerns, priorities]
  )

  const ritualGuidance = useMemo(
    () => buildRitualGuidance(selectedConcerns),
    [selectedConcerns]
  )

  const canSubmit = Boolean(skinType && selectedConcerns.length)

  function toggleConcern(concern: ConcernId) {
    setSubmitted(false)
    setSelectedConcerns((current) => {
      if (current.includes(concern)) {
        return current.filter((item) => item !== concern)
      }

      if (current.length >= 4) {
        return current
      }

      return [...current, concern]
    })
  }

  function viewProfile() {
    if (!canSubmit || !skinType) return

    setSubmitted(true)
    trackNfeEvent({
      name: NFE_EVENT_NAMES.ctaClicked,
      area: 'science',
      pagePath: '/science',
      ctaLabel: 'View My NFE Skin Profile',
      metadata: {
        storage: 'none',
        beehiiv: 'not_live',
        skinType,
        selectedConcerns: selectedConcerns.length,
      },
    })

    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function resetProfile() {
    setSkinType('')
    setSelectedConcerns([])
    setSubmitted(false)
  }

  return (
    <div id="testing-roadmap" className="scroll-mt-24 bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          NFE Skin Intelligence
        </p>
        <h1 className="mx-auto max-w-5xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          Science that interprets skin, not just ingredients.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          Mature melanated skin often has overlapping needs: hydration, barrier
          support, tone evenness, radiance, and visible firmness. This page
          translates your selected concerns into an NFE Skin Profile, then shows
          the Face Elixir active systems chosen to support those priorities.
        </p>
        <p className="mx-auto mt-5 max-w-2xl leading-7 text-nfe-paper/75">
          No generic routine. No ingredient guessing. Just a clearer view of what
          your skin may be asking for and how NFE was formulated to respond.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="#skin-profile-builder"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-paper"
          >
            Start Your Skin Interpretation
          </a>
          <a
            href="#active-index"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-nfe-gold px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-gold transition-colors hover:bg-nfe-gold hover:text-nfe-green-900"
          >
            Explore the Active Index
          </a>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Method
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            How the NFE Science Map works.
          </h2>
          <p className="mt-6 max-w-3xl leading-7 text-nfe-muted">
            Your skin concerns are not isolated. Dryness can affect glow. Barrier
            stress can make tone look uneven. Visible lines can become more
            noticeable when skin is dehydrated. NFE looks at those concerns
            together, then maps them to active systems inside the Face Elixir.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {HOW_IT_WORKS.map((step, index) => (
              <article
                key={step.title}
                className="rounded-3xl border border-nfe-green-100 bg-white p-6 shadow-sm"
              >
                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-nfe-gold">
                  Step {index + 1}
                </p>
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {step.title}
                </h3>
                <p className="mt-4 leading-7 text-nfe-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skin-profile-builder" className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Build Your NFE Skin Profile
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              Select what your skin is asking for.
            </h2>
            <p className="mt-6 leading-7 text-nfe-muted">
              Choose one skin type and up to four primary concerns. Your
              selections are interpreted locally on this page only. No email,
              Beehiiv sync, storage, or follow-up automation is active in this
              Science rebuild phase.
            </p>
            <div className="mt-8 rounded-2xl border border-nfe-green-100 bg-nfe-paper p-5 text-sm leading-6 text-nfe-muted">
              This tool provides cosmetic skincare guidance based on your
              selected concerns. It does not diagnose, treat, cure, or prevent
              any medical condition.
            </div>
          </div>

          <div className="rounded-3xl border border-nfe-green-100 bg-nfe-paper p-6 shadow-sm md:p-8">
            <label htmlFor="science-skin-type" className="block text-sm font-medium text-nfe-green-900">
              Skin Type
            </label>
            <p className="mt-2 text-sm leading-6 text-nfe-muted">
              Choose the option that best describes your skin most days.
            </p>
            <select
              id="science-skin-type"
              value={skinType}
              onChange={(event) => {
                setSkinType(event.target.value as SkinTypeId)
                setSubmitted(false)
              }}
              className="mt-3 w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
            >
              <option value="">Select one</option>
              {SKIN_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            {skinType ? (
              <p className="mt-3 text-sm leading-6 text-nfe-muted">
                {SKIN_TYPES.find((item) => item.id === skinType)?.description}
              </p>
            ) : null}

            <fieldset className="mt-8">
              <legend className="text-sm font-medium text-nfe-green-900">
                Primary Skin Concerns
              </legend>
              <p className="mt-2 text-sm leading-6 text-nfe-muted">
                Choose up to four concerns you notice most often.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {CONCERNS.map((concern) => {
                  const selected = selectedConcerns.includes(concern.id)
                  const disabled = !selected && selectedConcerns.length >= 4

                  return (
                    <button
                      key={concern.id}
                      type="button"
                      onClick={() => toggleConcern(concern.id)}
                      disabled={disabled}
                      aria-pressed={selected}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected
                          ? 'border-nfe-green-900 bg-nfe-green-900 text-nfe-paper'
                          : 'border-nfe-green-100 bg-white text-nfe-ink hover:border-nfe-green-700'
                      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <span className="block font-serif text-xl">{concern.label}</span>
                      <span
                        className={`mt-2 block text-sm leading-6 ${
                          selected ? 'text-nfe-paper/80' : 'text-nfe-muted'
                        }`}
                      >
                        {concern.description}
                      </span>
                    </button>
                  )
                })}
              </div>
              {selectedConcerns.length >= 4 ? (
                <p className="mt-3 text-sm text-nfe-green-700">
                  Choose up to four primary concerns so your results stay focused.
                </p>
              ) : null}
            </fieldset>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={viewProfile}
                disabled={!canSubmit}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                View My NFE Skin Profile
              </button>
              <button
                type="button"
                onClick={resetProfile}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper"
              >
                Start Over
              </button>
            </div>

            {!canSubmit ? (
              <p className="mt-4 text-sm leading-6 text-nfe-muted">
                Please select your skin type and at least one concern to view
                your NFE Skin Profile.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {submitted && profile ? (
        <section ref={resultsRef} className="px-6 py-20 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Your NFE Skin Interpretation
            </p>
            <div className="rounded-3xl bg-nfe-green-900 p-8 text-nfe-paper md:p-10">
              <h2 className="font-serif text-3xl leading-tight text-nfe-gold md:text-5xl">
                {profile.name}
              </h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-nfe-paper/85">
                {profile.summary}
              </p>
              <p className="mt-4 max-w-3xl leading-7 text-nfe-paper/75">
                {profile.formulaLogic}
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {priorities.map((priority, index) => (
                <article
                  key={priority.id}
                  className="rounded-3xl border border-nfe-green-100 bg-white p-6 shadow-sm"
                >
                  <p className="mb-4 text-xs uppercase tracking-[0.25em] text-nfe-gold">
                    Priority {index + 1}
                  </p>
                  <h3 className="font-serif text-2xl text-nfe-green-900">
                    {priority.label}
                  </h3>
                  <p className="mt-4 leading-7 text-nfe-muted">
                    {priority.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-12">
              <h3 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
                Face Elixir actives matched to your profile.
              </h3>
              <p className="mt-4 max-w-3xl leading-7 text-nfe-muted">
                These actives are most connected to the concerns you selected.
                Each ingredient plays a role in the broader support system, not
                because one ingredient alone solves one concern.
              </p>
              <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {matchedActives.map((active) => (
                  <article
                    key={active.id}
                    className="rounded-3xl border border-nfe-green-100 bg-white p-6 shadow-sm"
                  >
                    <p className="mb-3 text-xs uppercase tracking-[0.22em] text-nfe-green-700">
                      {active.layer}
                    </p>
                    <h4 className="font-serif text-2xl text-nfe-green-900">
                      {active.name}
                    </h4>
                    <p className="mt-3 text-sm font-medium text-[#7a4f22]">
                      {active.system}
                    </p>
                    <p className="mt-4 leading-7 text-nfe-muted">
                      {active.whySelected}
                    </p>
                    <div className="mt-5 space-y-3 text-sm leading-6 text-nfe-muted">
                      <p>
                        <span className="font-medium text-nfe-green-900">
                          What you may notice:
                        </span>{' '}
                        {active.whatYouMayNotice}
                      </p>
                      <p>
                        <span className="font-medium text-nfe-green-900">
                          Works with:
                        </span>{' '}
                        {active.pairsWith}
                      </p>
                      <p>
                        <span className="font-medium text-nfe-green-900">
                          Expectation:
                        </span>{' '}
                        {active.expectation}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-12 rounded-3xl border border-nfe-green-100 bg-nfe-paper p-8">
              <h3 className="font-serif text-3xl text-nfe-green-900">
                Your ritual guidance.
              </h3>
              <div className="mt-6 grid gap-4">
                {ritualGuidance.map((guidance) => (
                  <p
                    key={guidance}
                    className="rounded-2xl bg-white p-5 leading-7 text-nfe-muted"
                  >
                    {guidance}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Layer Science
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              How NFE Face Elixir supports the skin by layer.
            </h2>
            <p className="mt-6 leading-7 text-nfe-muted">
              NFE Face Elixir is built as a layered support system. Some
              ingredients focus on the outer barrier and surface feel. Others
              support the appearance of tone, radiance, and texture. Others
              contribute to the formula visible well-aging and antioxidant story.
            </p>
          </div>
          <div className="grid gap-4">
            {['Stratum Corneum', 'Epidermis', 'Dermis Support Story'].map((layer) => (
              <article
                key={layer}
                className="rounded-3xl border border-nfe-green-100 bg-nfe-paper p-6"
              >
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {layer}
                </h3>
                <p className="mt-3 leading-7 text-nfe-muted">
                  {layer === 'Stratum Corneum'
                    ? 'The outermost visible layer, where dryness, tightness, softness, and barrier comfort are often felt first.'
                    : layer === 'Epidermis'
                      ? 'The layer most closely tied to the appearance of tone, radiance, dullness, and visible texture.'
                      : 'A cosmetic storytelling layer for the appearance of firmness, smoothness, and visible well-aging support. NFE does not claim to change dermal structure.'}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="active-index" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Active Ingredient Index
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            The broader active system behind Face Elixir.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ACTIVES.map((active) => (
              <article
                key={active.id}
                className="rounded-3xl border border-nfe-green-100 bg-white p-6 shadow-sm"
              >
                <p className="mb-3 text-xs uppercase tracking-[0.22em] text-nfe-green-700">
                  {active.system}
                </p>
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {active.name}
                </h3>
                <p className="mt-3 text-sm text-[#7a4f22]">{active.layer}</p>
                <p className="mt-4 leading-7 text-nfe-muted">
                  {active.whatYouMayNotice}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-nfe-green-900 px-6 py-20 text-nfe-paper md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-gold">
              Method for Melanated Skin
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-gold md:text-5xl">
              Melanocyte Interaction Map.
            </h2>
          </div>
          <div className="rounded-3xl border border-nfe-paper/15 bg-white/5 p-8">
            <p className="leading-8 text-nfe-paper/85">
              Melanated skin deserves more than generic brightening language. NFE
              thinks about tone, radiance, barrier support, and visible calm as
              connected concerns. The goal is not to suppress identity or erase
              natural depth of tone. The goal is to support a more even,
              luminous, healthy-looking complexion with cosmetic well-aging care.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                'Tone support is paired with comfort so the ritual does not ignore sensitivity.',
                'Radiance is framed as a barrier, hydration, and tone story rather than a quick shine.',
                'Uneven-looking tone is discussed through appearance support, not disease language.',
                'Proof is separated from promise: founder experience, customer feedback, and future testing stay distinct.',
              ].map((item) => (
                <p
                  key={item}
                  className="rounded-2xl border border-nfe-paper/10 bg-white/5 p-4 leading-7 text-nfe-paper/80"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Proof Discipline
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Proof should be built before it is amplified.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PROOF_STAGES.map((stage) => (
              <article
                key={stage.title}
                className="rounded-3xl border border-nfe-green-100 bg-white p-6 shadow-sm"
              >
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {stage.title}
                </h3>
                <p className="mt-4 leading-7 text-nfe-muted">{stage.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eadcc9] px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#7a4f22]">
            Founder Science Note
          </p>
          <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Mature melanated skin should not be treated as an afterthought.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl leading-8 text-nfe-muted">
            NFE Face Elixir was not built around one hero ingredient. It was
            built as a layered support system: barrier comfort, hydration, tone
            support, antioxidant care, and visible well-aging support working
            together. This page shows the logic behind the formula so you can
            understand not just what is inside NFE, but why it is there.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <ScienceLink href="/skin-ritual-quiz" label="Skin Ritual Quiz">
              Skin Ritual Quiz
            </ScienceLink>
            <ScienceLink href="/discovery" label="Discovery Ritual" variant="outline">
              Discovery Ritual
            </ScienceLink>
            <ScienceLink href="/concierge" label="Concierge" variant="outline">
              Concierge
            </ScienceLink>
          </div>
        </div>
      </section>

      <section className="border-t border-nfe-green-100 px-6 py-10 md:px-12">
        <p className="mx-auto max-w-4xl text-center text-sm leading-6 text-nfe-muted">
          NFE Skin Intelligence provides cosmetic skincare guidance based on
          your selected concerns. It does not diagnose, treat, cure, or prevent
          any medical condition. Results and experiences vary. For persistent or
          complex skin concerns, consult a licensed professional.
        </p>
      </section>
    </div>
  )
}
