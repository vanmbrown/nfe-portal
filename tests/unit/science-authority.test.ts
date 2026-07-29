import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

// Imported per-module rather than through the barrel: the node:test resolver
// hook does not resolve directory imports, while Next.js does.
import { CONCERN_FORMULA_MATRIX } from '@/content/science/formula-matrix'
import { INGREDIENT_FAMILIES } from '@/content/science/ingredient-families'
import { INGREDIENT_FAMILIES as INGREDIENT_FAMILY_TAXONOMY } from '@/content/ingredients/families'
import { familyHref } from '@/content/ingredients/families'
import { FAMILY_COPY, FAMILY_COPY_BY_ID } from '@/content/ingredients/family-copy'
import { FAMILY_INGREDIENTS, ingredientsInFamily } from '@/content/ingredients/membership'
import { LAYER_CONTEXT_PANELS } from '@/content/science/layer-context'
import { SKIN_LAYERS } from '@/content/science/layers'
import { SCIENCE_PAGE } from '@/content/science/page'
import { PATHWAYS } from '@/content/science/pathways'
import {
  SCIENCE_MAP_ANCHOR,
  buildIngredientFamilyHref,
  buildScienceReturnHref,
  isScienceOrigin,
  parsePathwayQuery,
  serializePathwayIds,
} from '@/lib/science-pathway-state'
import type { PathwayId } from '@/content/science/types'

/**
 * Guards the Science Authority experience delivered in Phase 1
 * (docs/strategy/SCIENCE_AUTHORITY_GUIDED_EDUCATION_BLUEPRINT.md).
 *
 * These protect properties that are easy to reintroduce by accident: the
 * non-diagnostic boundary, the absence of persistence and analytics, and the
 * separation between customer copy and authoring notes.
 */

const root = process.cwd()
const src = (path: string) => join(root, 'src', path)

const SCIENCE_SOURCE_FILES = [
  'app/(education)/science/page.tsx',
  'components/science/ScienceMapExperience.tsx',
  'components/science/SkinLayerSchematic.tsx',
  'components/science/LayerContextPanels.tsx',
  'components/science/ConcernFormulaMatrix.tsx',
  'content/science/page.ts',
  'content/science/pathways.ts',
  'content/science/layers.ts',
  'content/science/ingredient-families.ts',
  'content/science/layer-context.ts',
  'content/science/formula-matrix.ts',
  'content/science/types.ts',
]

/**
 * Strips comments before scanning.
 *
 * These files document what they deliberately do *not* do — "no localStorage",
 * "must not carry skinType" — so scanning raw text would flag the explanation
 * as the offence. The checks below are about behaviour, not vocabulary.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

const readAllScienceSource = () =>
  SCIENCE_SOURCE_FILES.map((path) => ({
    path,
    contents: stripComments(readFileSync(src(path), 'utf8')),
  }))

/** Content strings only — excludes code identifiers and explanatory comments. */
const customerFacingStrings = (): string[] => {
  const out: string[] = []
  const walk = (value: unknown) => {
    if (typeof value === 'string') out.push(value)
    else if (Array.isArray(value)) value.forEach(walk)
    else if (value && typeof value === 'object') Object.values(value).forEach(walk)
  }
  walk(SCIENCE_PAGE)
  walk(SKIN_LAYERS)
  walk(INGREDIENT_FAMILIES)
  walk(CONCERN_FORMULA_MATRIX)
  // claimsBoundary lists prohibited wording on purpose; exclude it.
  PATHWAYS.forEach((pathway) => {
    const { claimsBoundary, ...rest } = pathway
    void claimsBoundary
    walk(rest)
  })
  LAYER_CONTEXT_PANELS.forEach((panel) => {
    const { claimsBoundary, ...rest } = panel
    void claimsBoundary
    walk(rest)
  })
  return out
}

describe('architecture', () => {
  it('the Science page exists and the profiling component is gone', () => {
    assert.ok(existsSync(src('app/(education)/science/page.tsx')))
    assert.ok(
      !existsSync(src('app/(education)/science/ScienceIntelligence.tsx')),
      'the profiling component must not return'
    )
  })

  it('keeps the client boundary to the map experience alone', () => {
    const page = readFileSync(src('app/(education)/science/page.tsx'), 'utf8')
    assert.ok(!page.includes("'use client'"), 'the page shell must stay server-rendered')

    const clientFiles = SCIENCE_SOURCE_FILES.filter((path) =>
      readFileSync(src(path), 'utf8').includes("'use client'")
    )
    assert.deepEqual(clientFiles, ['components/science/ScienceMapExperience.tsx'])
  })

  it('adds no API dependency or third-party quiz library', () => {
    for (const { path, contents } of readAllScienceSource()) {
      assert.doesNotMatch(contents, /\bfetch\s*\(/, `${path} must not fetch`)
      assert.doesNotMatch(contents, /\/api\//, `${path} must not reference an API route`)
    }
  })
})

describe('educational pathways', () => {
  it('provides exactly the five approved pathways', () => {
    assert.deepEqual(
      PATHWAYS.map((p) => p.id),
      [
        'barrier-comfort',
        'hydration',
        'tone-integrity',
        'texture-suppleness',
        'visible-resilience',
      ]
    )
  })

  it('labels every pathway as a topic, never as a symptom', () => {
    const symptomWords = /dry|oily|sensitive|wrinkle|dark spot|acne|redness|damaged/i
    for (const pathway of PATHWAYS) {
      assert.doesNotMatch(pathway.label, symptomWords, `${pathway.id} label reads as a symptom`)
    }
  })

  it('points every pathway at real layers and real ingredient families', () => {
    const layerIds = new Set(SKIN_LAYERS.map((l) => l.id))
    const familyIds = new Set(INGREDIENT_FAMILIES.map((f) => f.id))
    for (const pathway of PATHWAYS) {
      assert.ok(pathway.emphasizedLayers.length > 0, `${pathway.id} highlights nothing`)
      for (const layer of pathway.emphasizedLayers) {
        assert.ok(layerIds.has(layer), `${pathway.id} references unknown layer ${layer}`)
      }
      for (const family of pathway.ingredientFamilies) {
        assert.ok(familyIds.has(family), `${pathway.id} references unknown family ${family}`)
      }
    }
  })

  it('carries no scoring, ranking, or profile shape in the content model', () => {
    for (const pathway of PATHWAYS as unknown as Record<string, unknown>[]) {
      for (const key of ['score', 'weight', 'rank', 'priority', 'severity', 'profile']) {
        assert.ok(!(key in pathway), `pathway must not carry a "${key}" field`)
      }
    }
  })
})

describe('the map', () => {
  it('defines the five cosmetic layer zones in order', () => {
    assert.deepEqual(
      SKIN_LAYERS.map((l) => l.id),
      ['surface', 'barrier', 'tone', 'texture', 'radiance']
    )
  })

  it('has a meaningful default state that needs no selection', () => {
    assert.ok(SCIENCE_PAGE.mapIntro.defaultInterpretation.length > 40)
    assert.doesNotMatch(
      SCIENCE_PAGE.mapIntro.defaultInterpretation,
      /select your|to receive|your result/i
    )
  })

  it('keeps the schematic labelled and does not signal emphasis by colour alone', () => {
    const svg = readFileSync(src('components/science/SkinLayerSchematic.tsx'), 'utf8')
    assert.match(svg, /<title/, 'schematic needs a title')
    assert.match(svg, /<desc/, 'schematic needs a description')
    assert.match(svg, /In focus/, 'emphasis needs a non-colour signal')
    assert.match(svg, /aria-hidden="true"/, 'decorative marks must be hidden')
  })

  it('retains the cosmetic-framework caution', () => {
    const note = SCIENCE_PAGE.mapIntro.cosmeticFrameworkNote
    assert.match(note, /educational cosmetic framework/i)
    assert.match(note, /not intended to diagnose, treat, cure, or prevent/i)
    assert.match(note, /dermal structure/i)
  })
})

describe('privacy', () => {
  it('stores nothing and sends nothing', () => {
    for (const { path, contents } of readAllScienceSource()) {
      assert.doesNotMatch(contents, /localStorage/, `${path} must not use localStorage`)
      assert.doesNotMatch(contents, /sessionStorage/, `${path} must not use sessionStorage`)
      assert.doesNotMatch(contents, /document\.cookie/, `${path} must not set cookies`)
      assert.doesNotMatch(contents, /navigator\.sendBeacon/, `${path} must not beacon`)
    }
  })

  it('emits no analytics from Science', () => {
    for (const { path, contents } of readAllScienceSource()) {
      assert.doesNotMatch(contents, /trackNfeEvent|trackPageView|gtag/, `${path} must not track`)
    }
  })

  it('never places a skin attribute in a payload', () => {
    for (const { path, contents } of readAllScienceSource()) {
      assert.doesNotMatch(contents, /skinType/, `${path} must not carry skinType`)
      assert.doesNotMatch(contents, /selectedConcerns/, `${path} must not carry selectedConcerns`)
    }
  })
})

describe('copy governance', () => {
  it('renders no internal authoring note', () => {
    const authoringMarkers = [
      /use careful/i,
      /premium active/i,
      /formula (?:luxury-science |long-game )?story/i,
      /\bTODO\b/,
      /\bplaceholder\b/i,
      /\binternal:/i,
      /\bcopy note\b/i,
      /\beditor note\b/i,
      /\bclaims note\b/i,
      /\bdo not compare\b/i,
      /\bpositioned as\b/i,
    ]
    for (const text of customerFacingStrings()) {
      for (const marker of authoringMarkers) {
        assert.doesNotMatch(text, marker, `authoring note reached customer copy: "${text}"`)
      }
    }
  })

  it('renders no prohibited claim', () => {
    const prohibited = [
      /treats melasma/i,
      /cures hyperpigmentation/i,
      /rebuilds collagen/i,
      /repairs damaged skin/i,
      /reverses aging/i,
      /prevents sun damage/i,
      /heals inflammation/i,
      /stops melanin production/i,
      /erases wrinkles/i,
      /age-defying/i,
      /youthful glow/i,
      /\bageless\b/i,
      /\bmiracle\b/i,
      /\bflawless\b/i,
    ]
    for (const text of customerFacingStrings()) {
      for (const claim of prohibited) {
        assert.doesNotMatch(text, claim, `prohibited claim in copy: "${text}"`)
      }
    }
  })

  it('renders no profiling or quiz language', () => {
    const profiling = [
      /your skin profile/i,
      // "View my NFE Skin Profile" is founder-approved copy for the second way
      // into the same map. What must stay out is *result* language, which the
      // rest of this list covers and which the dual-entry suite tests directly.
      /your (?:top )?priorities/i,
      /your skin (?:type )?result/i,
      /your skin score/i,
      /we identified/i,
      /best match/i,
      /recommended for you/i,
      /personalized regimen/i,
      /your treatment plan/i,
      /coming soon/i,
      /join waitlist/i,
    ]
    for (const text of customerFacingStrings()) {
      for (const phrase of profiling) {
        assert.doesNotMatch(text, phrase, `profiling language in copy: "${text}"`)
      }
    }
  })

  it('states the claims boundary each pathway must not cross', () => {
    for (const pathway of PATHWAYS) {
      assert.ok(
        pathway.claimsBoundary.length > 0,
        `${pathway.id} must declare its claims boundary`
      )
    }
  })

  it('keeps a closing cosmetic disclaimer', () => {
    assert.match(
      SCIENCE_PAGE.closingDisclaimer,
      /does not diagnose, treat, cure, or prevent/i
    )
  })
})

describe('cross-linking', () => {
  it('sends ingredient and ritual depth to their authoritative pages', () => {
    const client = readFileSync(src('components/science/ScienceMapExperience.tsx'), 'utf8')
    const page = readFileSync(src('app/(education)/science/page.tsx'), 'utf8')
    assert.match(client + page, /href="\/inci"/, 'must link to Ingredients')
    assert.match(client, /href="\/ritual"/, 'must link to Ritual')
  })

  it('links product context to canonical product routes only', () => {
    const hrefs = SCIENCE_PAGE.productContext.links.map((l) => l.href)
    assert.deepEqual(hrefs, ['/products/face-elixir', '/products/body-elixir', '/shop'])
    for (const href of hrefs) {
      assert.doesNotMatch(href, /\[slug\]/, 'must not depend on the removed dynamic route')
    }
  })

  it('offers exactly one Concierge invitation', () => {
    assert.equal(SCIENCE_PAGE.concierge.link.href, '/concierge')
    const page = readFileSync(src('app/(education)/science/page.tsx'), 'utf8')
    const occurrences = page.match(/concierge\.link\.href/g) ?? []
    assert.equal(occurrences.length, 1, 'exactly one Concierge link')
  })
})

/* ------------------------------------------------------------------ *
 * Phase 1 refinement — Layer Context and the Concern-to-Formula Matrix
 * ------------------------------------------------------------------ */

const PATHWAY_IDS = PATHWAYS.map((pathway) => pathway.id)
const LAYER_IDS = SKIN_LAYERS.map((layer) => layer.id)
const FAMILY_IDS = INGREDIENT_FAMILIES.map((family) => family.id)

const layerContextSource = () =>
  readFileSync(src('components/science/LayerContextPanels.tsx'), 'utf8')
const matrixSource = () =>
  readFileSync(src('components/science/ConcernFormulaMatrix.tsx'), 'utf8')
const experienceSource = () =>
  readFileSync(src('components/science/ScienceMapExperience.tsx'), 'utf8')
const schematicSource = () =>
  readFileSync(src('components/science/SkinLayerSchematic.tsx'), 'utf8')
const LAYER_BY_ID_FOR_TEST = Object.fromEntries(
  SKIN_LAYERS.map((layer) => [layer.id, layer])
) as Record<string, (typeof SKIN_LAYERS)[number]>

describe('layer context structure', () => {
  it('renders the approved heading and subheading', () => {
    assert.equal(SCIENCE_PAGE.layerContext.eyebrow, 'Layer Context')
    assert.equal(
      SCIENCE_PAGE.layerContext.heading,
      'Where visible concerns begin. How NFE supports them.'
    )
  })

  it('has one panel per pathway, no more and no fewer', () => {
    assert.equal(LAYER_CONTEXT_PANELS.length, PATHWAYS.length)
    const covered = LAYER_CONTEXT_PANELS.map((panel) => panel.pathwayId).sort()
    assert.deepEqual(covered, [...PATHWAY_IDS].sort())
  })

  it('gives every panel a stable unique id', () => {
    const ids = LAYER_CONTEXT_PANELS.map((panel) => panel.id)
    assert.equal(new Set(ids).size, ids.length)
    ids.forEach((id) => assert.match(id, /^[a-z][a-z0-9-]*$/))
  })

  it('maps every panel to real layers and real ingredient families', () => {
    for (const panel of LAYER_CONTEXT_PANELS) {
      assert.ok(panel.layerIds.length > 0, `${panel.id} has no layer`)
      assert.ok(panel.ingredientFamilyIds.length > 0, `${panel.id} has no family`)
      panel.layerIds.forEach((id) => assert.ok(LAYER_IDS.includes(id)))
      panel.ingredientFamilyIds.forEach((id) => assert.ok(FAMILY_IDS.includes(id)))
    }
  })

  it('carries a claims boundary on every panel', () => {
    for (const panel of LAYER_CONTEXT_PANELS) {
      assert.ok(panel.claimsBoundary.length > 0, `${panel.id} has no boundary`)
    }
  })

  it('holds no score, rank, severity or profile field', () => {
    const banned = [
      'score',
      'rank',
      'priority',
      'severity',
      'profile',
      'weight',
      'match',
      'recommended',
    ]
    for (const panel of LAYER_CONTEXT_PANELS) {
      for (const key of Object.keys(panel)) {
        assert.ok(
          !banned.some((word) => key.toLowerCase().includes(word)),
          `${panel.id} exposes a "${key}" field`
        )
      }
    }
  })

  it('orders panels deterministically, surface downward', () => {
    const orders = LAYER_CONTEXT_PANELS.map((panel) => panel.order)
    assert.deepEqual(orders, [1, 2, 3, 4, 5])
    // The first panel reads the surface; the last reads radiance. This mirrors
    // the schematic bands above it.
    assert.ok(LAYER_CONTEXT_PANELS[0].layerIds.includes('surface'))
    assert.ok(LAYER_CONTEXT_PANELS[4].layerIds.includes('radiance'))
  })

  it('does not duplicate pathway or family labels into panel content', () => {
    // Labels are referenced by id at render time. A literal copy here would be
    // a second source of truth that could silently drift.
    const source = layerContextSource()
    assert.match(source, /PATHWAY_BY_ID/)
    assert.match(source, /FAMILY_BY_ID/)
    const serialised = JSON.stringify(LAYER_CONTEXT_PANELS)
    for (const family of INGREDIENT_FAMILY_TAXONOMY) {
      assert.ok(
        !serialised.includes(`"${family.label}"`),
        `panel content hardcodes the family label "${family.label}"`
      )
    }
  })
})

describe('layer context behaviour', () => {
  it('renders every panel regardless of selection', () => {
    // The component maps the full array; nothing filters by emphasis.
    const source = stripComments(layerContextSource())
    assert.match(source, /ordered\.map\(/)
    assert.ok(
      !/\.filter\(\s*\(?\s*panel/.test(source),
      'panels are filtered by selection somewhere'
    )
  })

  it('drives emphasis from the pathway id, not from panel state', () => {
    const source = stripComments(layerContextSource())
    assert.match(source, /emphasized\.includes\(panel\.pathwayId\)/)
    assert.ok(!/useState|useReducer/.test(source), 'panel component holds state')
  })

  it('signals emphasis by more than colour', () => {
    assert.match(layerContextSource(), /In focus/)
  })

  it('sorts by canonical order rather than selection order', () => {
    assert.match(layerContextSource(), /sort\(\(a, b\) => a\.order - b\.order\)/)
  })

  it('never scrolls or moves focus from the panels', () => {
    const source = stripComments(layerContextSource())
    assert.ok(!/scrollIntoView|scrollTo|\.focus\(\)/.test(source))
  })
})

describe('formula matrix structure', () => {
  it('renders the approved eyebrow and heading', () => {
    assert.equal(SCIENCE_PAGE.formulaMatrix.eyebrow, 'Concern-to-Formula Matrix')
    assert.equal(
      SCIENCE_PAGE.formulaMatrix.heading,
      'A simpler way to read the formula logic.'
    )
  })

  it('uses the approved four columns', () => {
    assert.deepEqual(SCIENCE_PAGE.formulaMatrix.columns, [
      'What you are exploring',
      'Layer context',
      'NFE formulation principle',
      'Ingredient family',
    ])
  })

  it('does not label a column as diagnosis or recommendation', () => {
    for (const column of SCIENCE_PAGE.formulaMatrix.columns) {
      const lowered = column.toLowerCase()
      assert.ok(!lowered.includes('diagnos'))
      assert.ok(!lowered.includes('recommend'))
      assert.ok(!lowered.includes('prescri'))
    }
  })

  it('has one row per pathway', () => {
    assert.equal(CONCERN_FORMULA_MATRIX.length, 5)
    const covered = CONCERN_FORMULA_MATRIX.map((row) => row.pathwayId).sort()
    assert.deepEqual(covered, [...PATHWAY_IDS].sort())
  })

  it('references ingredient families only, never a named ingredient', () => {
    const namedIngredients = INGREDIENT_FAMILIES.flatMap(
      (family) => family.representativeExamples
    )
    const serialised = JSON.stringify(CONCERN_FORMULA_MATRIX)
    for (const ingredient of namedIngredients) {
      assert.ok(
        !serialised.includes(ingredient),
        `a matrix row names the ingredient "${ingredient}"`
      )
    }
    for (const row of CONCERN_FORMULA_MATRIX) {
      row.ingredientFamilyIds.forEach((id) => assert.ok(FAMILY_IDS.includes(id)))
    }
  })

  it('asserts nothing about the composition of a product', () => {
    const serialised = JSON.stringify(CONCERN_FORMULA_MATRIX).toLowerCase()
    for (const phrase of ['face elixir', 'body elixir', 'in the formula', 'contains']) {
      assert.ok(!serialised.includes(phrase), `a row claims "${phrase}"`)
    }
  })

  it('holds no score, rank or recommendation field', () => {
    const banned = ['score', 'rank', 'priority', 'severity', 'profile', 'recommended']
    for (const row of CONCERN_FORMULA_MATRIX) {
      for (const key of Object.keys(row)) {
        assert.ok(
          !banned.some((word) => key.toLowerCase().includes(word)),
          `${row.id} exposes a "${key}" field`
        )
      }
    }
  })

  it('orders rows deterministically', () => {
    assert.deepEqual(
      CONCERN_FORMULA_MATRIX.map((row) => row.order),
      [1, 2, 3, 4, 5]
    )
  })
})

describe('formula matrix behaviour and semantics', () => {
  it('renders every row regardless of selection', () => {
    const source = stripComments(matrixSource())
    assert.ok(
      !/\.filter\(\s*\(?\s*row/.test(source),
      'rows are filtered by selection somewhere'
    )
  })

  it('never sorts or reorders by selection', () => {
    const source = stripComments(matrixSource())
    const sorts = source.match(/\.sort\(/g) ?? []
    assert.equal(sorts.length, 1, 'more than one sort in the matrix')
    assert.match(source, /sort\(\(a, b\) => a\.order - b\.order\)/)
  })

  it('uses real table semantics on the wide layout', () => {
    const source = matrixSource()
    assert.match(source, /<table/)
    assert.match(source, /<caption/)
    assert.match(source, /<thead/)
    assert.match(source, /<tbody/)
    assert.match(source, /scope="col"/)
    assert.match(source, /scope="row"/)
  })

  it('exposes exactly one representation at a time', () => {
    // Both exist in the markup; each is display:none at the other's breakpoint,
    // which removes it from the accessibility tree.
    const source = matrixSource()
    assert.match(source, /hidden lg:block/)
    assert.match(source, /lg:hidden/)
  })

  it('labels the stacked layout with real elements, not pseudo-content', () => {
    const source = matrixSource()
    assert.match(source, /<dl/)
    assert.match(source, /<dt/)
    assert.match(source, /<dd/)
    assert.ok(!/before:content/.test(source), 'labels depend on pseudo-element content')
  })

  it('signals emphasis by more than colour', () => {
    assert.match(matrixSource(), /In focus/)
  })

  it('never scrolls or moves focus from the matrix', () => {
    const source = stripComments(matrixSource())
    assert.ok(!/scrollIntoView|scrollTo|\.focus\(\)/.test(source))
  })
})

describe('shared pathway state', () => {
  it('keeps one selection owner for all three modules', () => {
    const source = stripComments(experienceSource())
    // Exactly one pathway state. The chapter also tracks which input the
    // visitor is using, which is not a second source of truth for the map, so
    // count the pathway state specifically rather than every hook.
    const pathwayState = source.match(/useState<PathwayId\[\]>/g) ?? []
    assert.equal(pathwayState.length, 1, 'more than one pathway state in the chapter')
    assert.match(source, /<SkinLayerSchematic/)
    assert.match(source, /<LayerContextPanels/)
    assert.match(source, /<ConcernFormulaMatrix/)
  })

  it('passes the same selection to layer context and the matrix', () => {
    const source = stripComments(experienceSource())
    assert.match(source, /<LayerContextPanels[\s\S]*?emphasized=\{selected\}/)
    assert.match(source, /<ConcernFormulaMatrix[\s\S]*?emphasized=\{selected\}/)
  })

  it('keeps the child modules stateless', () => {
    for (const source of [layerContextSource(), matrixSource()]) {
      const stripped = stripComments(source)
      assert.ok(!/useState|useReducer|useEffect/.test(stripped))
    }
  })

  it('introduces no global state or context provider', () => {
    const source = stripComments(experienceSource())
    assert.ok(!/createContext|useContext|zustand|redux/.test(source))
  })

  it('keeps focus on a control when clearing', () => {
    // Clearing unmounts the Clear button, which would otherwise drop focus to
    // the document body. Focus moves to the start of the pathway group instead.
    const source = stripComments(experienceSource())
    assert.match(source, /firstPathwayRef/)
    assert.match(source, /firstPathwayRef\.current\?\.focus\(\)/)
  })

  it('adds no second client boundary', () => {
    for (const source of [layerContextSource(), matrixSource()]) {
      assert.ok(!/use client/.test(source))
    }
  })
})

describe('refinement claims governance', () => {
  it('keeps every prohibited claim out of the new copy', () => {
    const prohibited = [
      'treats melasma',
      'cures hyperpigmentation',
      'rebuilds collagen',
      'repairs damaged skin',
      'reverses aging',
      'prevents sun damage',
      'heals inflammation',
      'stops melanin production',
      'erases wrinkles',
      'restores cellular function',
      'treats sensitivity',
      'repairs the barrier',
      'penetrates the dermis',
      'diagnos',
    ]
    const copy = [
      ...LAYER_CONTEXT_PANELS.flatMap((panel) => [
        panel.title,
        panel.visibleContext,
        panel.formulationPrinciple,
      ]),
      ...CONCERN_FORMULA_MATRIX.flatMap((row) => [
        row.explorationLabel,
        row.layerContext,
        row.formulationPrinciple,
      ]),
      SCIENCE_PAGE.layerContext.heading,
      SCIENCE_PAGE.layerContext.body,
      SCIENCE_PAGE.formulaMatrix.heading,
      SCIENCE_PAGE.formulaMatrix.body,
    ]
      .join(' ')
      .toLowerCase()

    for (const claim of prohibited) {
      assert.ok(!copy.includes(claim), `new copy contains "${claim}"`)
    }
  })

  it('keeps profiling, ranking and diagnosis language out of the new copy', () => {
    const banned = [
      'your skin type',
      'your profile',
      'top priority',
      'priority 1',
      'we recommend',
      'recommended for you',
      'your result',
      'your score',
    ]
    const copy = [
      ...LAYER_CONTEXT_PANELS.map(
        (panel) => `${panel.visibleContext} ${panel.formulationPrinciple}`
      ),
      ...CONCERN_FORMULA_MATRIX.map(
        (row) => `${row.layerContext} ${row.formulationPrinciple}`
      ),
    ]
      .join(' ')
      .toLowerCase()
    for (const phrase of banned) {
      assert.ok(!copy.includes(phrase), `new copy contains "${phrase}"`)
    }
  })

  it('carries no authoring note or placeholder in the new content', () => {
    const markers = [
      'Expectation:',
      'Note:',
      'Internal:',
      'TODO',
      'Placeholder',
      'Use careful',
      'premium active',
      'formula story',
      'claims note',
      'legal review',
      'copy note',
      'editor note',
    ]
    const copy = [
      JSON.stringify(LAYER_CONTEXT_PANELS),
      JSON.stringify(CONCERN_FORMULA_MATRIX),
      JSON.stringify(SCIENCE_PAGE.layerContext),
      JSON.stringify(SCIENCE_PAGE.formulaMatrix),
    ].join(' ')
    for (const marker of markers) {
      assert.ok(!copy.includes(marker), `new content contains "${marker}"`)
    }
  })

  it('keeps the well-aging contrast and never says anti-aging alone', () => {
    const copy = LAYER_CONTEXT_PANELS.map((p) => p.formulationPrinciple).join(' ')
    assert.match(copy, /Well-aging, not anti-aging/)
    const withoutApproved = copy.replace(/Well-aging, not anti-aging/g, '')
    assert.ok(!/anti-aging/.test(withoutApproved))
  })
})

describe('refinement privacy', () => {
  it('persists nothing and sends nothing from the new modules', () => {
    const banned = [
      'localStorage',
      'sessionStorage',
      'document.cookie',
      'fetch(',
      'XMLHttpRequest',
      'sendBeacon',
      'navigator.',
      'track(',
      '<form',
    ]
    for (const path of [
      'components/science/LayerContextPanels.tsx',
      'components/science/ConcernFormulaMatrix.tsx',
      'content/science/layer-context.ts',
      'content/science/formula-matrix.ts',
    ]) {
      const source = stripComments(readFileSync(src(path), 'utf8'))
      for (const token of banned) {
        assert.ok(!source.includes(token), `${path} uses ${token}`)
      }
    }
  })

  it('keeps the new content free of anything visitor-specific', () => {
    const serialised = (
      JSON.stringify(LAYER_CONTEXT_PANELS) + JSON.stringify(CONCERN_FORMULA_MATRIX)
    ).toLowerCase()
    for (const token of ['email', 'userid', 'user_id', 'session', 'visitorid']) {
      assert.ok(!serialised.includes(token))
    }
  })
})

/* ------------------------------------------------------------------ *
 * Visual refinement — Layer Context as the schematic's companion
 * ------------------------------------------------------------------ */

const TAILWIND_OPACITY_STEPS = new Set(
  [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map(String)
)

describe('layer context presentation', () => {
  it('wraps the module in a framed plate that shares the schematic radius', () => {
    const source = layerContextSource()
    assert.match(source, /rounded-\[1\.75rem\]/, 'frame must share the schematic radius')
    assert.match(source, /border border-nfe-gold\/25/, 'frame needs its restrained border')
    // The schematic container uses the same radius, so the two read as one plate.
    const schematic = experienceSource()
    assert.match(schematic, /rounded-\[1\.75rem\]/)
  })

  it('keeps the eyebrow, heading and support-zone label inside the frame', () => {
    const source = layerContextSource()
    assert.match(source, /\{eyebrow\}/)
    assert.match(source, /\{heading\}/)
    assert.match(source, /\{zonesLabel\}/)
    assert.equal(SCIENCE_PAGE.layerContext.eyebrow, 'Layer Context')
    assert.equal(
      SCIENCE_PAGE.layerContext.heading,
      'Where visible concerns begin. How NFE supports them.'
    )
    assert.equal(SCIENCE_PAGE.layerContext.zonesLabel, 'Cosmetic support zones')
  })

  it('numbers every panel 01 to 05, zero padded', () => {
    assert.match(layerContextSource(), /padStart\(2, '0'\)/)
    assert.deepEqual(
      LAYER_CONTEXT_PANELS.map((p) => String(p.order).padStart(2, '0')),
      ['01', '02', '03', '04', '05']
    )
  })

  it('names each panel after the schematic band it explains', () => {
    // The eyebrow reads "01 · Surface hydration" — the layer's own zone name,
    // so the panel and the band above it cannot drift apart.
    assert.match(layerContextSource(), /\{zone\.zone\}/)
    for (const panel of LAYER_CONTEXT_PANELS) {
      const zone = LAYER_BY_ID_FOR_TEST[panel.layerIds[0]]
      assert.ok(zone, `${panel.id} has no primary layer`)
      assert.ok(zone.zone.length > 0)
    }
  })

  it('gives every panel a vertical zone-colour bar driven by the shared token', () => {
    const source = layerContextSource()
    assert.match(source, /backgroundColor: zone\.bandHex/)
    assert.match(source, /aria-hidden="true"/, 'the bar is decorative')
    assert.match(source, /w-3 shrink-0 rounded-full/)
  })

  it('reads zone colour from one token shared with the schematic', () => {
    // Both the band and the bar use bandHex. A second colour source could drift.
    assert.match(schematicSource(), /bandHex/)
    assert.match(layerContextSource(), /bandHex/)
    for (const layer of SKIN_LAYERS) {
      assert.match(layer.bandHex, /^#[0-9a-f]{6}$/, `${layer.id} bandHex must be a plain hex`)
    }
  })

  it('no longer carries the dead bandClass and labelClass fields', () => {
    // They were populated but never read, and held Tailwind classes that could
    // not be generated — src/content is outside the Tailwind content globs.
    const layersSource = readFileSync(src('content/science/layers.ts'), 'utf8')
    assert.ok(!layersSource.includes('bandClass'))
    assert.ok(!layersSource.includes('labelClass'))
  })

  it('uses a two-column reading structure at the wide breakpoint', () => {
    const source = layerContextSource()
    const match = source.match(/lg:grid-cols-\[([\d.]+)fr_([\d.]+)fr\]/)
    assert.ok(match, 'panels need an explicit two-column split')
    const left = Number(match[1])
    const right = Number(match[2])
    const leftPct = (left / (left + right)) * 100
    assert.ok(leftPct >= 38 && leftPct <= 45, `left column is ${leftPct}%, expected 38-45%`)
  })

  it('presents ingredient families as pills with dark text on a warm surface', () => {
    const source = layerContextSource()
    assert.match(source, /rounded-full bg-\[#f4eadb\][^"]*text-nfe-green-900/)
    // No panel may carry more than four family pills.
    for (const panel of LAYER_CONTEXT_PANELS) {
      assert.ok(
        panel.ingredientFamilyIds.length <= 4,
        `${panel.id} has ${panel.ingredientFamilyIds.length} families, max 4`
      )
    }
  })

  it('labels the families section without implying a recommendation', () => {
    const source = layerContextSource()
    assert.match(source, /Ingredient families/)
    for (const banned of ['Recommended ingredients', 'Best ingredients', 'Your ingredients']) {
      assert.ok(!source.includes(banned), `panel labels must not say "${banned}"`)
    }
  })

  it('says formulation support, never formula support', () => {
    // "Formula support" beside ingredient names asserted product composition.
    // Comments are stripped first: the file explains that removal by name, and
    // scanning raw text would flag the explanation as the offence.
    const source = stripComments(layerContextSource())
    assert.match(source, /Formulation support/)
    assert.ok(!/Formula support/.test(source))
  })
})

describe('layer context emphasis presentation', () => {
  it('shifts border, surface and title colour together when in focus', () => {
    const source = layerContextSource()
    assert.match(source, /border-nfe-gold\/60 bg-\[rgba\(244,234,219,0\.14\)\]/)
    assert.match(source, /border-nfe-paper\/15 bg-white\/\[0\.035\]/)
    assert.match(source, /active \? 'text-nfe-gold' : 'text-nfe-paper'/)
  })

  it('keeps a visible non-colour marker for the focused panel', () => {
    assert.match(layerContextSource(), /In focus/)
  })

  it('keeps unemphasised panels at full text contrast', () => {
    // Emphasis may recolour the eyebrow and title. What must never change with
    // selection is the body copy — visibleContext and formulationPrinciple —
    // because that is what makes an unselected panel still readable.
    const source = stripComments(layerContextSource())
    const bodyLines = source
      .split('\n')
      .filter((line) => /text-\[1\.0625rem\]/.test(line))
    assert.ok(bodyLines.length >= 2, 'expected both body paragraphs')
    for (const line of bodyLines) {
      assert.ok(!/active/.test(line), `body copy styling depends on selection: ${line.trim()}`)
      assert.match(line, /text-nfe-paper\/80/)
    }
  })

  it('dims only the decorative bar, never text, on unselected panels', () => {
    const source = layerContextSource()
    assert.match(source, /opacity: !hasSelection \|\| active \? 1 : 0\.5/)
  })

  it('transitions colour within the approved range', () => {
    const source = layerContextSource()
    assert.match(source, /transition-colors duration-200 ease-out/)
    assert.ok(!/duration-(3|4|5|6|7|8|9)\d\d/.test(source), 'transition is too slow')
  })

  it('adds no interactive control inside a panel', () => {
    // Panels carry editorial links to Ingredients, which is intended. What they
    // must never carry is a *control*: a button, a click handler, a tabIndex
    // workaround or any second selection surface. The pathway buttons remain
    // the only controls in this chapter.
    const source = stripComments(layerContextSource())
    for (const tag of ['<button', 'onClick', 'tabIndex', 'role="button"', 'aria-pressed']) {
      assert.ok(!source.includes(tag), `panels must not contain ${tag}`)
    }
  })

  it('adds no second live region', () => {
    const source = layerContextSource()
    assert.ok(!/aria-live/.test(source))
  })
})

describe('tailwind opacity steps actually generate', () => {
  /**
   * Tailwind's opacity scale runs in steps of 5. A utility such as
   * `border-nfe-paper/12` parses fine and looks correct in review, but emits no
   * CSS at all — the element silently falls back to Tailwind's default border
   * colour or an inherited text colour. This guards the dark Science chapter
   * against reintroducing that.
   */
  const darkChapterFiles = [
    'components/science/LayerContextPanels.tsx',
    'components/science/ConcernFormulaMatrix.tsx',
    'components/science/ScienceMapExperience.tsx',
    'components/science/SkinLayerSchematic.tsx',
  ]

  it('uses only opacity steps Tailwind can emit', () => {
    const offenders: string[] = []
    for (const path of darkChapterFiles) {
      const source = readFileSync(src(path), 'utf8')
      const matches =
        source.match(/(?:hover:)?(?:border|text|bg|ring|decoration)-nfe-[a-z0-9-]+\/\d+/g) ?? []
      for (const cls of matches) {
        const step = cls.split('/')[1]
        if (!TAILWIND_OPACITY_STEPS.has(step)) offenders.push(`${path}: ${cls}`)
      }
    }
    assert.deepEqual(offenders, [], `these emit no CSS: ${offenders.join(', ')}`)
  })
})

describe('visual refinement regression protection', () => {
  it('leaves the rest of the Science page in place', () => {
    const page = readFileSync(src('app/(education)/science/page.tsx'), 'utf8')
    for (const marker of [
      'formulationPrinciples',
      'INGREDIENT_FAMILIES',
      'proof',
      'founderNote',
      'productContext',
      'concierge',
      'closingDisclaimer',
    ]) {
      assert.ok(page.includes(marker), `${marker} section must remain`)
    }
  })

  it('keeps the map, pathway controls and matrix in the chapter', () => {
    const source = experienceSource()
    assert.match(source, /<SkinLayerSchematic/)
    assert.match(source, /aria-pressed=\{active\}/)
    assert.match(source, /<ConcernFormulaMatrix/)
    assert.match(source, /<LayerContextPanels/)
  })

  it('keeps Layer Context between the map and the matrix', () => {
    const source = experienceSource()
    const map = source.indexOf('<SkinLayerSchematic')
    const layer = source.indexOf('<LayerContextPanels')
    const matrix = source.indexOf('<ConcernFormulaMatrix')
    assert.ok(map < layer, 'Layer Context must follow the map')
    assert.ok(layer < matrix, 'the matrix must follow Layer Context')
  })

  it('does not restore the profiling component', () => {
    assert.ok(!existsSync(src('app/(education)/science/ScienceIntelligence.tsx')))
  })

  it('adds no new client island', () => {
    const clientFiles = [
      'components/science/LayerContextPanels.tsx',
      'components/science/ConcernFormulaMatrix.tsx',
      'components/science/SkinLayerSchematic.tsx',
    ].filter((path) => readFileSync(src(path), 'utf8').includes('use client'))
    assert.deepEqual(clientFiles, [])
  })
})

/* ------------------------------------------------------------------ *
 * Final refinement — pathway synchronization and schematic scale
 * ------------------------------------------------------------------ */

describe('pathway synchronization', () => {
  it('exposes the pathway id and active state on every panel', () => {
    const source = layerContextSource()
    assert.match(source, /data-pathway-id=\{panel\.pathwayId\}/)
    assert.match(source, /data-active=\{active \? 'true' : 'false'\}/)
    assert.match(source, /data-has-selection=\{hasSelection \? 'true' : 'false'\}/)
  })

  it('derives active state from the pathway id, never a display string', () => {
    const source = stripComments(layerContextSource())
    assert.match(source, /emphasized\.includes\(panel\.pathwayId\)/)
    // No comparison against a label, title or zone name anywhere.
    assert.ok(!/===\s*panel\.title/.test(source))
    assert.ok(!/===\s*pathway\.label/.test(source))
    assert.ok(!/includes\(panel\.title\)/.test(source))
  })

  it('maps every pathway to exactly one panel, one layer and one matrix row', () => {
    for (const pathway of PATHWAYS) {
      const panels = LAYER_CONTEXT_PANELS.filter((p) => p.pathwayId === pathway.id)
      const rows = CONCERN_FORMULA_MATRIX.filter((r) => r.pathwayId === pathway.id)
      assert.equal(panels.length, 1, `${pathway.id} must map to exactly one panel`)
      assert.equal(rows.length, 1, `${pathway.id} must map to exactly one row`)
      assert.ok(panels[0].layerIds.length > 0)
    }
  })

  it('agrees with the schematic on which layers a pathway brings forward', () => {
    // The panel's primary layer must be one the pathway actually emphasises,
    // so the band that lights up and the panel that lights up are the same idea.
    for (const panel of LAYER_CONTEXT_PANELS) {
      const pathway = PATHWAYS.find((p) => p.id === panel.pathwayId)
      assert.ok(pathway, `${panel.id} references an unknown pathway`)
      assert.ok(
        pathway.emphasizedLayers.includes(panel.layerIds[0]),
        `${panel.id} primary layer ${panel.layerIds[0]} is not emphasised by ${pathway.id}`
      )
    }
  })

  it('keeps one selection owner feeding all four expressions', () => {
    const source = stripComments(experienceSource())
    assert.equal((source.match(/useState<PathwayId\[\]>/g) ?? []).length, 1)
    assert.match(source, /<SkinLayerSchematic[\s\S]*?emphasized=\{emphasizedLayers\}/)
    assert.match(source, /<LayerContextPanels[\s\S]*?emphasized=\{selected\}/)
    assert.match(source, /<ConcernFormulaMatrix[\s\S]*?emphasized=\{selected\}/)
  })
})

describe('layer context active-state strength', () => {
  const activeBranch = () => {
    const source = layerContextSource()
    const match = source.match(/active\s*\n?\s*\?\s*'([^']+)'/)
    return match ? match[1] : ''
  }

  it('builds the selected state from at least four distinct cues', () => {
    const source = layerContextSource()
    const cues = {
      border: /border-nfe-gold\/60/.test(source),
      surface: /bg-\[rgba\(244,234,219,0\.14\)\]/.test(source),
      insetRing: /shadow-\[inset_0_0_0_1px_rgba\(198,166,100,0\.32\)\]/.test(source),
      barRing: /ring-2 ring-nfe-gold\/40/.test(source),
      eyebrow: /active \? 'text-nfe-gold' : 'text-nfe-paper\/70'/.test(source),
      title: /active \? 'text-nfe-gold' : 'text-nfe-paper'/.test(source),
      marker: /In focus/.test(source),
    }
    const present = Object.entries(cues).filter(([, v]) => v).map(([k]) => k)
    assert.ok(
      present.length >= 4,
      `only ${present.length} cues present: ${present.join(', ')}`
    )
  })

  it('uses a filled marker so the state reads without inspecting the border', () => {
    assert.match(layerContextSource(), /bg-nfe-gold px-3 py-1[^"]*text-nfe-green-900/)
  })

  it('keeps the border weight constant so selection causes no layout shift', () => {
    const source = layerContextSource()
    assert.match(source, /rounded-2xl border-2 p-5/)
    assert.ok(!activeBranch().includes('border-4'))
    assert.ok(!/active \? 'border '/.test(source))
  })

  it('never emphasises by motion, scale or blur', () => {
    const source = layerContextSource()
    for (const banned of ['scale-', 'animate-', 'blur-', 'translate-']) {
      assert.ok(!source.includes(banned), `emphasis must not use ${banned}`)
    }
  })

  it('does not reduce panel opacity globally', () => {
    const source = stripComments(layerContextSource())
    assert.ok(!/opacity-\d/.test(source), 'no whole-panel opacity utility')
  })
})

describe('schematic scale', () => {
  const schematic = () => schematicSource()

  it('anchors block geometry to one constant', () => {
    const source = schematic()
    assert.match(source, /const BLOCK = \{ x: 16, y: 10, width: 360, height: 280 \}/)
    assert.match(source, /x=\{BLOCK\.x\}/)
    assert.match(source, /width=\{BLOCK\.width\}/)
  })

  it('uses a viewBox the drawing nearly fills', () => {
    const source = schematic()
    const vb = source.match(/viewBox="0 0 (\d+) (\d+)"/)
    assert.ok(vb, 'schematic needs an explicit viewBox')
    const [width, height] = [Number(vb[1]), Number(vb[2])]
    // Block is 320x272. Vertical dead space must stay small.
    assert.ok(280 / height >= 0.85, `block fills only ${Math.round((280 / height) * 100)}% of viewBox height`)
    assert.ok(360 / width >= 0.55, `block fills only ${Math.round((360 / width) * 100)}% of viewBox width`)
  })

  it('is larger than the previous implementation in both dimensions', () => {
    // Previous: 286x232 in a 566x292 viewBox.
    const source = schematic()
    const vb = source.match(/viewBox="0 0 (\d+) (\d+)"/)
    assert.ok(vb, 'schematic needs an explicit viewBox')
    const scaleRatio = 566 / Number(vb[1])
    const widthGain = (360 * scaleRatio) / 286
    const heightGain = (280 * scaleRatio) / 232
    // 1.10, not 1.15: the viewBox has to be wide enough to hold "Texture and
    // suppleness" on one line, and that width costs scale. Wrapping bought a
    // bigger block but collided with the next zone's label, so this is the
    // honest ceiling while the labels stay legible and correct.
    assert.ok(widthGain >= 1.1, `width gain only ${widthGain.toFixed(2)}x`)
    assert.ok(heightGain >= 1.1, `height gain only ${heightGain.toFixed(2)}x`)
  })

  it('keeps label sizes at or above the previous 19/18/13 units', () => {
    // Zone label 19 -> 22 and anatomical 13 -> 15. The sub-label stays at 18:
    // it is the longest string, and every extra unit of its width pushes the
    // viewBox wider, which shrinks the whole drawing at a fixed column width.
    const source = schematic()
    const sizes = Array.from(source.matchAll(/text-\[(\d+)px\]/g), (m) => Number(m[1]))
    assert.ok(sizes.includes(22), 'zone label should be 22 units')
    assert.ok(sizes.includes(18), 'zone sub-label should be 18 units')
    assert.ok(sizes.includes(15), 'anatomical label should be 15 units')
    assert.ok(Math.min(...sizes) >= 15, 'no schematic label below 15 units')
  })

  it('leaves vertical room between a zone label group and the next', () => {
    // The wrapped-label bug: a two-line sub-label pushed the group into the
    // next zone's label. This checks the arithmetic the browser proved wrong --
    // main baseline at midY-8, sub at midY+18, next main at nextMidY-8, and a
    // 22-unit glyph box needs the gap to exceed the font size.
    const source = schematic()
    const bands = Array.from(
      source.matchAll(/id: '(\w+)', y: (\d+), height: (\d+)/g),
      (m) => ({ id: m[1], y: Number(m[2]), height: Number(m[3]) })
    )
    assert.equal(bands.length, 5)
    for (let i = 0; i < bands.length - 1; i += 1) {
      const midY = bands[i].y + bands[i].height / 2
      const nextMidY = bands[i + 1].y + bands[i + 1].height / 2
      const subBaseline = midY + 18
      const nextMainBaseline = nextMidY - 8
      assert.ok(
        nextMainBaseline - subBaseline >= 22,
        `${bands[i].id} sub-label sits ${nextMainBaseline - subBaseline} units from the next label; needs 22`
      )
    }
  })

  it('keeps zone labels on one line', () => {
    // Wrapping was tried and reverted: a band is 52-56 units tall and a wrapped
    // label group needs 62, so the second line collided with the next zone's
    // label. The viewBox holds the longest name on one line instead.
    const source = schematic()
    assert.ok(!/wrapLabel/.test(source), 'zone labels must not wrap')
    assert.ok(!/<tspan/.test(source), 'zone labels must not wrap')
  })

  it('lets the SVG fill its container rather than hardcoding a width', () => {
    const source = schematic()
    assert.match(source, /className="h-auto w-full"/)
    assert.ok(!/<svg[^>]*\swidth="\d/.test(source), 'no hardcoded SVG width')
    assert.ok(!/max-w-\[\d+px\]/.test(source), 'no fixed max width on the schematic')
  })

  it('gives the schematic column the approved share at the wide breakpoint', () => {
    const source = experienceSource()
    const match = source.match(/lg:grid-cols-\[([\d.]+)fr_([\d.]+)fr\]/)
    assert.ok(match, 'map row needs an explicit two-column split')
    const pct = (Number(match[1]) / (Number(match[1]) + Number(match[2]))) * 100
    assert.ok(pct >= 58 && pct <= 65, `schematic column is ${pct.toFixed(0)}%, expected 58-65%`)
  })

  it('keeps band proportions and order unchanged', () => {
    const source = schematic()
    const heights = Array.from(
      source.matchAll(/id: '(\w+)', y: \d+, height: (\d+)/g),
      (m) => ({ id: m[1], h: Number(m[2]) })
    )
    assert.deepEqual(
      heights.map((h) => h.id),
      ['surface', 'barrier', 'tone', 'texture', 'radiance']
    )
    // Previous heights 46,46,48,48,44 — same relative ordering, all scaled up.
    assert.deepEqual(
      heights.map((h) => h.h),
      [56, 56, 58, 58, 52]
    )
  })

  it('keeps the schematic labelled and adds no biological claim', () => {
    const source = schematic()
    assert.match(source, /<title id="nfe-skin-map-title">/)
    assert.match(source, /<desc id="nfe-skin-map-desc">/)
    assert.match(source, /aria-hidden="true"/)
    // Comments are stripped: the file states that no penetration or
    // dermal-action claim is made, and scanning raw text would flag that
    // disclaimer as the offence.
    const rendered = stripComments(source).toLowerCase()
    for (const banned of ['penetrat', 'absorb', 'dermal action', 'bloodstream', 'cellular']) {
      assert.ok(!rendered.includes(banned), `schematic must not mention ${banned}`)
    }
  })
})

/* ------------------------------------------------------------------ *
 * Science-to-Ingredients family navigation
 * ------------------------------------------------------------------ */

const inciPageSource = () => readFileSync(src('app/(education)/inci/page.tsx'), 'utf8')
const familySectionsSource = () =>
  readFileSync(src('components/ingredients/IngredientFamilySections.tsx'), 'utf8')
const pathwayStateSource = () =>
  readFileSync(src('lib/science-pathway-state.ts'), 'utf8')
const returnLinkSource = () =>
  readFileSync(src('components/ingredients/ScienceReturnLink.tsx'), 'utf8')

const REQUIRED_FAMILY_IDS = [
  'humectants',
  'emollients',
  'barrier-supportive-lipids',
  'tone-supportive-cosmetic-ingredients',
  'peptides',
  'antioxidant-supportive-ingredients',
  'botanical-oils',
  'sensorial-support',
]

describe('ingredient family taxonomy', () => {
  it('defines exactly the eight required families with canonical ids', () => {
    assert.deepEqual(
      [...INGREDIENT_FAMILY_TAXONOMY].sort((a, b) => a.order - b.order).map((f) => f.id).sort(),
      [...REQUIRED_FAMILY_IDS].sort()
    )
  })

  it('keeps every id and label unique', () => {
    const ids = INGREDIENT_FAMILY_TAXONOMY.map((f) => f.id)
    const labels = INGREDIENT_FAMILY_TAXONOMY.map((f) => f.label)
    assert.equal(new Set(ids).size, ids.length, 'duplicate family id')
    assert.equal(new Set(labels).size, labels.length, 'duplicate family label')
  })

  it('uses url-safe ids, never derived from labels at runtime', () => {
    for (const family of INGREDIENT_FAMILY_TAXONOMY) {
      assert.match(family.id, /^[a-z][a-z-]*[a-z]$/, `${family.id} is not url-safe`)
      assert.ok(!family.id.includes('--'))
    }
    // The id must not be generated from the label anywhere.
    const sources = [familySectionsSource(), inciPageSource(), layerContextSource()]
    for (const source of sources) {
      assert.ok(
        !/toLowerCase\(\)[\s\S]{0,40}replace\([^)]*\s/.test(source),
        'ids must not be slugified from labels at runtime'
      )
    }
  })

  it('orders families deterministically from 1', () => {
    const orders = [...INGREDIENT_FAMILY_TAXONOMY].map((f) => f.order).sort((a, b) => a - b)
    assert.deepEqual(orders, [1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('defines each family once, not separately in Science and Ingredients', () => {
    // Science's array carries role and examples only; the label lives in the
    // taxonomy. A label field on the Science type would be a second source.
    const scienceFamilies = readFileSync(src('content/science/ingredient-families.ts'), 'utf8')
    assert.ok(!/^\s*label:/m.test(scienceFamilies), 'Science must not restate family labels')
    const scienceTypes = readFileSync(src('content/science/types.ts'), 'utf8')
    assert.match(scienceTypes, /from '\.\.\/ingredients\/types'/)
  })

  it('resolves every Science family reference against the taxonomy', () => {
    const known = new Set(INGREDIENT_FAMILY_TAXONOMY.map((f) => f.id))
    for (const panel of LAYER_CONTEXT_PANELS) {
      for (const id of panel.ingredientFamilyIds) {
        assert.ok(known.has(id), `panel ${panel.id} references unknown family ${id}`)
      }
    }
    for (const row of CONCERN_FORMULA_MATRIX) {
      for (const id of row.ingredientFamilyIds) {
        assert.ok(known.has(id), `row ${row.id} references unknown family ${id}`)
      }
    }
    for (const pathway of PATHWAYS) {
      for (const id of pathway.ingredientFamilies) {
        assert.ok(known.has(id), `pathway ${pathway.id} references unknown family ${id}`)
      }
    }
  })

  it('leaves no orphaned family: every family is used and rendered', () => {
    const referenced = new Set([
      ...LAYER_CONTEXT_PANELS.flatMap((p) => p.ingredientFamilyIds),
      ...CONCERN_FORMULA_MATRIX.flatMap((r) => r.ingredientFamilyIds),
      ...PATHWAYS.flatMap((p) => p.ingredientFamilies),
    ])
    for (const family of INGREDIENT_FAMILY_TAXONOMY) {
      assert.ok(referenced.has(family.id), `${family.id} is defined but never referenced`)
    }
  })

  it('assigns every listed ingredient to at least one valid family', () => {
    const known = new Set(INGREDIENT_FAMILY_TAXONOMY.map((f) => f.id))
    const ids = FAMILY_INGREDIENTS.map((i) => i.id)
    assert.equal(new Set(ids).size, ids.length, 'duplicate ingredient id')
    for (const ingredient of FAMILY_INGREDIENTS) {
      assert.ok(ingredient.familyIds.length > 0, `${ingredient.id} has no family`)
      for (const id of ingredient.familyIds) {
        assert.ok(known.has(id), `${ingredient.id} references unknown family ${id}`)
      }
    }
  })

  it('gives every family at least one ingredient to show', () => {
    for (const family of INGREDIENT_FAMILY_TAXONOMY) {
      assert.ok(
        ingredientsInFamily(family.id).length > 0,
        `${family.id} would render an empty section`
      )
    }
  })
})

describe('science family links', () => {
  it('renders family pills as links, never buttons', () => {
    const source = layerContextSource()
    assert.match(source, /<Link\s+href=\{buildIngredientFamilyHref\(id, emphasized\)\}/)
    const stripped = stripComments(source)
    for (const banned of ['<button', 'role="button"', 'onClick', 'target="_blank"']) {
      assert.ok(!stripped.includes(banned), `family links must not use ${banned}`)
    }
  })

  it('builds every href from the shared taxonomy, not by hand', () => {
    const source = stripComments(layerContextSource())
    assert.match(source, /buildIngredientFamilyHref\(/)
    assert.ok(!/href="\/inci#/.test(source), 'hrefs must not be hardcoded')
    assert.ok(
      !/href="\/inci\?/.test(source),
      'the contextual query must not be hardcoded either'
    )
    // The builder is the only thing that knows the anchor, and it gets it from
    // the shared taxonomy rather than restating it.
    const builder = stripComments(pathwayStateSource())
    assert.match(builder, /familyHref\(familyId\)/)
    assert.ok(!/`\/inci/.test(builder), 'the builder must not restate the route')
  })

  it('produces the canonical anchor href for every family', () => {
    for (const family of INGREDIENT_FAMILY_TAXONOMY) {
      assert.equal(familyHref(family.id), `/inci#${family.id}`)
    }
  })

  it('shows the canonical label as the visible and accessible name', () => {
    const source = layerContextSource()
    assert.match(source, /\{FAMILY_BY_ID\[id\]\.label\}/)
    // No hidden verbose label overriding the visible text.
    assert.ok(!/aria-label=/.test(source), 'links must not override their visible name')
  })

  it('every panel family resolves to a section that exists', () => {
    const sectionIds = new Set(INGREDIENT_FAMILY_TAXONOMY.map((f) => f.id))
    for (const panel of LAYER_CONTEXT_PANELS) {
      for (const id of panel.ingredientFamilyIds) {
        assert.ok(sectionIds.has(id), `${panel.id} links to missing section ${id}`)
      }
    }
  })

  it('uses no query string or client navigation', () => {
    const source = stripComments(layerContextSource())
    assert.ok(!/\?family=/.test(source))
    assert.ok(!/useRouter|router\.push|scrollIntoView/.test(source))
  })
})

describe('inci anchor sections', () => {
  it('renders a section per family with a stable id', () => {
    const source = familySectionsSource()
    assert.match(source, /id=\{family\.id\}/)
    assert.match(source, /aria-labelledby=\{`\$\{family\.id\}-heading`\}/)
  })

  it('gives each section a semantic heading carrying the canonical label', () => {
    const source = familySectionsSource()
    assert.match(source, /<h2\s+id=\{`\$\{family\.id\}-heading`\}/)
    assert.match(source, /\{family\.label\}/)
  })

  it('does not reuse the section id as the heading id', () => {
    // Duplicate ids would break the aria-labelledby relationship.
    const source = familySectionsSource()
    assert.match(source, /\$\{family\.id\}-heading/)
  })

  it('applies scroll margin so a linked heading is not flush to the edge', () => {
    assert.match(familySectionsSource(), /scroll-mt-\d+/)
  })

  it('renders server-side with no client boundary', () => {
    assert.ok(!/use client/.test(familySectionsSource()))
    assert.ok(!/use client/.test(inciPageSource()))
  })

  it('keeps the full transparency reference on the page', () => {
    const source = inciPageSource()
    assert.match(source, /INCITransparencyTabs/)
    const tabs = readFileSync(src('components/education/INCITransparencyTabs.tsx'), 'utf8')
    for (const part of ['INCILists', 'ActivesDataTable', 'IngredientGlossary']) {
      assert.ok(tabs.includes(part), `${part} must remain available`)
    }
  })

  it('offers the family index as plain anchors', () => {
    const source = inciPageSource()
    assert.match(source, /href=\{`#\$\{family\.id\}`\}/)
    assert.ok(!/onClick/.test(source), 'the index must not use click handlers')
  })
})

describe('ingredient source boundaries', () => {
  it('states the composition clarification exactly once', () => {
    const source = inciPageSource()
    const matches = source.match(/Ingredient families describe cosmetic roles/g) ?? []
    assert.equal(matches.length, 1, 'clarification should appear once, not per family')
  })

  it('never claims a family is present in a named product', () => {
    const surfaces = [
      inciPageSource(),
      familySectionsSource(),
      JSON.stringify(INGREDIENT_FAMILY_TAXONOMY),
      JSON.stringify(FAMILY_COPY),
      JSON.stringify(FAMILY_INGREDIENTS),
    ].join(' ')
    for (const phrase of [
      'Face Elixir',
      'Body Elixir',
      'in every NFE',
      'all NFE products contain',
      'Actives in',
    ]) {
      assert.ok(!surfaces.includes(phrase), `family surfaces must not claim "${phrase}"`)
    }
  })

  it('exposes no internal source-conflict language to customers', () => {
    const surfaces = [
      inciPageSource(),
      familySectionsSource(),
      JSON.stringify(INGREDIENT_FAMILY_TAXONOMY),
      JSON.stringify(FAMILY_COPY),
    ].join(' ')
    for (const phrase of ['unverified', 'discrepanc', 'conflict', 'may or may not', 'TODO']) {
      assert.ok(
        !surfaces.toLowerCase().includes(phrase.toLowerCase()),
        `customer-facing surfaces must not say "${phrase}"`
      )
    }
  })

  it('keeps prohibited claims out of family descriptions', () => {
    const copy = INGREDIENT_FAMILY_TAXONOMY.map(
      (f) => `${f.label} ${FAMILY_COPY_BY_ID[f.id].description}`
    )
      .join(' ')
      .toLowerCase()
    for (const claim of [
      'treats melasma',
      'cures hyperpigmentation',
      'rebuilds collagen',
      'repairs damaged skin',
      'reverses aging',
      'prevents sun damage',
      'heals inflammation',
      'stops melanin production',
      'erases wrinkles',
      'penetrates the dermis',
      'repairs the barrier',
      'recommended ingredients',
      'best ingredients',
      'treatment ingredients',
    ]) {
      assert.ok(!copy.includes(claim), `family copy contains "${claim}"`)
    }
  })

  it('carries a claims boundary on every family', () => {
    assert.equal(FAMILY_COPY.length, INGREDIENT_FAMILY_TAXONOMY.length)
    for (const family of INGREDIENT_FAMILY_TAXONOMY) {
      const copy = FAMILY_COPY_BY_ID[family.id]
      assert.ok(copy, `${family.id} has no copy entry`)
      assert.ok(copy.claimsBoundary.length > 0, `${family.id} has no claims boundary`)
      assert.ok(copy.description.length > 0, `${family.id} has no description`)
    }
  })

  it('changes no product data', () => {
    // Membership references the glossary only. Product INCI stays authoritative.
    const membership = readFileSync(src('content/ingredients/membership.ts'), 'utf8')
    assert.ok(!/face-elixir|body-elixir/.test(membership))
    assert.ok(!/%|percent/.test(membership.replace(/\/\*[\s\S]*?\*\//g, '')))
  })
})

/* ------------------------------------------------------------------ *
 * Founder-guided orientation restoration
 * ------------------------------------------------------------------ */

const methodSource = () => readFileSync(src('components/science/ScienceMethod.tsx'), 'utf8')
const sciencePageSource = () => readFileSync(src('app/(education)/science/page.tsx'), 'utf8')
const layerScienceModuleSource = () =>
  readFileSync(src('components/science/LayerScienceModule.tsx'), 'utf8')

describe('method orientation', () => {
  it('renders the approved eyebrow and heading', () => {
    assert.equal(SCIENCE_PAGE.scienceMethod.eyebrow, 'Method')
    assert.equal(SCIENCE_PAGE.scienceMethod.heading, 'How the NFE Science Map works.')
  })

  it('provides exactly three steps in order', () => {
    const steps = SCIENCE_PAGE.scienceMethod.steps
    assert.equal(steps.length, 3, 'the method must have exactly three steps')
    assert.deepEqual(
      steps.map((s) => s.stepLabel),
      ['Step 1', 'Step 2', 'Step 3']
    )
    assert.deepEqual(
      steps.map((s) => s.id),
      ['select', 'relationships', 'formulation']
    )
  })

  it('gives every step a semantic heading in an ordered list', () => {
    const source = methodSource()
    assert.match(source, /<ol/, 'steps are a sequence, so they belong in an ordered list')
    assert.match(source, /<h3/)
    for (const step of SCIENCE_PAGE.scienceMethod.steps) {
      assert.ok(step.title.length > 0, `${step.id} has no title`)
      assert.ok(step.description.length > 0, `${step.id} has no description`)
    }
  })

  it('says plainly that nothing is diagnosed, scored or saved', () => {
    const step2 = SCIENCE_PAGE.scienceMethod.steps[1].description.toLowerCase()
    assert.ok(step2.includes('diagnosis'))
    assert.ok(step2.includes('score'))
    assert.ok(step2.includes('saved profile'))
  })

  it('carries no assessment, ranking or recommendation language', () => {
    const copy = [
      SCIENCE_PAGE.scienceMethod.heading,
      SCIENCE_PAGE.scienceMethod.introduction,
      ...SCIENCE_PAGE.scienceMethod.steps.flatMap((s) => [s.title, s.description]),
    ]
      .join(' ')
      .toLowerCase()
    for (const banned of [
      'your top priorities',
      'first, second, and third',
      'we recommend',
      'recommended for you',
      'your skin type',
      'assessment result',
      'severity',
      'view my nfe skin profile',
      'skin score',
    ]) {
      assert.ok(!copy.includes(banned), `method copy contains "${banned}"`)
    }
  })

  it('renders server-side with no client boundary', () => {
    assert.ok(!/use client/.test(methodSource()))
  })
})

describe('start interpretation invitation', () => {
  it('uses the approved label', () => {
    assert.equal(SCIENCE_PAGE.scienceMethod.ctaLabel, 'Start Your Skin Interpretation')
  })

  it('is a link, never a button', () => {
    const source = stripComments(methodSource())
    assert.match(source, /<Link\s+href=\{ctaHref\}/)
    for (const banned of ['<button', 'role="button"', 'onClick', 'type="submit"', 'target=']) {
      assert.ok(!source.includes(banned), `the invitation must not use ${banned}`)
    }
  })

  it('points at the profile anchor, with no query string', () => {
    assert.equal(SCIENCE_PAGE.scienceMethod.ctaHref, '#build-your-nfe-skin-profile')
    assert.equal(
      SCIENCE_PAGE.scienceMethod.ctaHref,
      `#${SCIENCE_PAGE.profileIntro.anchorId}`,
      'the invitation and its destination must stay in step'
    )
    assert.ok(!SCIENCE_PAGE.scienceMethod.ctaHref.includes('?'))
  })

  it('scrolls by anchor, never by script', () => {
    const source = stripComments(methodSource())
    assert.ok(!/scrollIntoView|scrollTo|useRouter|router\.push|setTimeout/.test(source))
  })

  it('has a destination that exists and clears the top of the viewport', () => {
    const page = sciencePageSource()
    assert.match(page, /id=\{profileIntro\.anchorId\}/)
    assert.match(page, /scroll-mt-\d+/)
  })
})

describe('skin profile framing', () => {
  it('restores the approved eyebrow and heading', () => {
    assert.equal(SCIENCE_PAGE.profileIntro.eyebrow, 'Build Your NFE Skin Profile')
    assert.equal(SCIENCE_PAGE.profileIntro.heading, 'Build Your NFE Skin Profile')
  })

  it('states the non-diagnostic boundary and the privacy line verbatim', () => {
    assert.equal(SCIENCE_PAGE.profileIntro.boundary, 'An interpretive guide, not a diagnosis.')
    assert.equal(SCIENCE_PAGE.profileIntro.privacy, 'Nothing is saved or submitted.')
  })

  it('describes the profile as page-local rather than as a record', () => {
    const description = SCIENCE_PAGE.profileIntro.description.toLowerCase()
    assert.ok(description.includes('stay on this page') || description.includes('this page'))
    for (const banned of ['your account', 'we save', 'stored', 'your record', 'your results']) {
      assert.ok(!description.includes(banned), `profile copy implies "${banned}"`)
    }
  })

  it('keeps "profile" out of every other Science surface', () => {
    // The word is approved for this heading only. It must not spread.
    const elsewhere = [
      JSON.stringify(LAYER_CONTEXT_PANELS),
      JSON.stringify(CONCERN_FORMULA_MATRIX),
      JSON.stringify(PATHWAYS),
      JSON.stringify(SCIENCE_PAGE.scienceMethod.steps),
      JSON.stringify(SCIENCE_PAGE.layerScience),
      JSON.stringify(SCIENCE_PAGE.mapIntro),
    ]
      .join(' ')
      .toLowerCase()
    // Step 2 may say "saved profile" precisely to deny it.
    const withoutDenial = elsewhere.replace(/saved profile/g, '')
    assert.ok(!withoutDenial.includes('profile'), 'profile language has spread beyond its heading')
  })

  it('carries no field that could hold a result', () => {
    for (const key of Object.keys(SCIENCE_PAGE.profileIntro)) {
      for (const banned of ['score', 'rank', 'result', 'severity', 'match', 'recommend']) {
        assert.ok(!key.toLowerCase().includes(banned), `profileIntro exposes "${key}"`)
      }
    }
  })

  it('restores no part of the old form', () => {
    const page = sciencePageSource()
    const island = experienceSource()
    for (const source of [page, island]) {
      for (const banned of ['<select', '<input', 'type="checkbox"', '<form', 'onSubmit']) {
        assert.ok(!source.includes(banned), `the old form must not return: ${banned}`)
      }
    }
    assert.ok(!page.includes('View My NFE Skin Profile'))
  })
})

describe('layer science introduction', () => {
  it('restores the approved eyebrow and heading', () => {
    assert.equal(SCIENCE_PAGE.layerScience.eyebrow, 'Layer Science')
    assert.equal(
      SCIENCE_PAGE.layerScience.heading,
      'How NFE Face Elixir supports the skin by layer.'
    )
  })

  it('describes layered cosmetic support without a mechanism claim', () => {
    const copy = SCIENCE_PAGE.layerScience.description.toLowerCase()
    assert.ok(copy.includes('support'))
    for (const banned of [
      'penetrat',
      'rebuild',
      'collagen',
      'regenerat',
      'cellular',
      'repairs',
      'dermal action',
      'treats',
      'heals',
    ]) {
      assert.ok(!copy.includes(banned), `layer science copy claims "${banned}"`)
    }
  })

  it('sits in its own white section immediately before the dark chapter', () => {
    // The module moved out of the island: it is now a full editorial section
    // rendered by the page, above the chapter that holds the controls and map.
    const page = sciencePageSource()
    const module_ = page.indexOf('<LayerScienceModule />')
    const chapter = page.indexOf('<ScienceMapExperience')
    assert.ok(module_ > -1, 'the Layer Science module must be rendered')
    assert.ok(chapter > -1)
    assert.ok(module_ < chapter, 'the module must precede the interactive chapter')
    assert.ok(!page.includes('layerScienceIntro'), 'the partial intro must be gone')
  })

  it('renders on the server and never inside the client island', () => {
    const island = experienceSource()
    assert.ok(!island.includes('SCIENCE_PAGE.layerScience'), 'copy must not reach the island')
    assert.ok(!island.includes('Stratum Corneum'), 'cards must not reach the island')
    const module_ = layerScienceModuleSource()
    assert.ok(!/use client/.test(module_), 'the module must stay server-rendered')
    assert.ok(!/useState|useEffect|onClick/.test(module_), 'the module must hold no behaviour')
  })
})

describe('restored page order', () => {
  it('places every restored module in the approved sequence', () => {
    const page = sciencePageSource()
    const at = (needle: string) => {
      const index = page.indexOf(needle)
      assert.ok(index > -1, `${needle} not found on the page`)
      return index
    }
    const explanation = at('{method.heading}')
    const methodModule = at('<ScienceMethod />')
    const profile = at('{profileIntro.heading}')
    const layer = at('<LayerScienceModule />')
    const island = at('<ScienceMapExperience')
    const principles = at('Formulation principles')

    assert.ok(explanation < methodModule, 'explanation must precede the method')
    assert.ok(methodModule < profile, 'method must precede the profile framing')
    assert.ok(profile < island, 'profile framing must precede the interactive chapter')
    assert.ok(layer < principles, 'layer science must precede formulation principles')
  })

  it('keeps every existing section', () => {
    const page = sciencePageSource()
    for (const marker of [
      'formulationPrinciples',
      'INGREDIENT_FAMILIES',
      'proof',
      'founderNote',
      'productContext',
      'concierge',
      'closingDisclaimer',
    ]) {
      assert.ok(page.includes(marker), `${marker} must remain`)
    }
  })

  it('duplicates none of the interactive modules', () => {
    const page = sciencePageSource()
    assert.equal((page.match(/<ScienceMapExperience/g) ?? []).length, 1)
    const island = experienceSource()
    assert.equal((island.match(/<SkinLayerSchematic/g) ?? []).length, 1)
    assert.equal((island.match(/<LayerContextPanels/g) ?? []).length, 1)
    assert.equal((island.match(/<ConcernFormulaMatrix/g) ?? []).length, 1)
  })

  it('keeps one h1 and adds no second client island', () => {
    const page = sciencePageSource()
    assert.equal((page.match(/<h1/g) ?? []).length, 1)
    assert.ok(!page.includes("'use client'"))
    assert.ok(!methodSource().includes("'use client'"))
  })
})

describe('orientation privacy and claims', () => {
  it('adds no persistence, network or analytics', () => {
    for (const path of [
      'components/science/ScienceMethod.tsx',
      'app/(education)/science/page.tsx',
    ]) {
      const source = stripComments(readFileSync(src(path), 'utf8'))
      for (const token of [
        'localStorage',
        'sessionStorage',
        'document.cookie',
        'fetch(',
        'sendBeacon',
        'track(',
        'analytics',
        '<form',
        'onSubmit',
      ]) {
        assert.ok(!source.includes(token), `${path} uses ${token}`)
      }
    }
  })

  it('keeps prohibited claims out of all restored copy', () => {
    const copy = [
      SCIENCE_PAGE.scienceMethod.introduction,
      ...SCIENCE_PAGE.scienceMethod.steps.map((s) => `${s.title} ${s.description}`),
      SCIENCE_PAGE.scienceMethod.ctaLabel,
      SCIENCE_PAGE.profileIntro.description,
      SCIENCE_PAGE.profileIntro.boundary,
      SCIENCE_PAGE.profileIntro.privacy,
      SCIENCE_PAGE.layerScience.description,
    ]
      .join(' ')
      .toLowerCase()
    for (const claim of [
      'treats melasma',
      'cures hyperpigmentation',
      'rebuilds collagen',
      'repairs damaged skin',
      'reverses aging',
      'prevents sun damage',
      'stops melanin production',
      'erases wrinkles',
      'anti-aging',
      'age-defying',
      'youthful',
      'problem skin',
      'clinical profile',
      'treatment plan',
    ]) {
      assert.ok(!copy.includes(claim), `restored copy contains "${claim}"`)
    }
  })
})

/* ------------------------------------------------------------------ *
 * Complete Layer Science module
 * ------------------------------------------------------------------ */

describe('layer science module', () => {
  const APPROVED_CARDS = [
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
      body: 'A cosmetic storytelling layer for the appearance of firmness, smoothness, and visible well-aging support. NFE does not claim to change dermal structure.',
    },
  ]

  it('renders the approved eyebrow, heading and supporting paragraph', () => {
    assert.equal(SCIENCE_PAGE.layerScience.eyebrow, 'Layer Science')
    assert.equal(
      SCIENCE_PAGE.layerScience.heading,
      'How NFE Face Elixir supports the skin by layer.'
    )
    assert.match(SCIENCE_PAGE.layerScience.description, /^NFE Face Elixir is built as a layered support system\./)
    assert.match(SCIENCE_PAGE.layerScience.description, /outer barrier and surface feel/)
    assert.match(SCIENCE_PAGE.layerScience.description, /tone, radiance, and texture/)
    assert.match(SCIENCE_PAGE.layerScience.description, /visible well-aging and antioxidant story/)
  })

  it('renders exactly three cards in the approved order', () => {
    const cards = SCIENCE_PAGE.layerScience.cards
    assert.equal(cards.length, 3, 'the module must have exactly three cards')
    assert.deepEqual(
      cards.map((c) => c.title),
      ['Stratum Corneum', 'Epidermis', 'Dermis Support Story']
    )
    assert.deepEqual(
      cards.map((c) => c.id),
      APPROVED_CARDS.map((c) => c.id)
    )
  })

  it('carries the approved card copy verbatim', () => {
    const cards = SCIENCE_PAGE.layerScience.cards
    for (const approved of APPROVED_CARDS) {
      const actual = cards.find((c) => c.id === approved.id)
      assert.ok(actual, `${approved.id} is missing`)
      assert.equal(actual.title, approved.title)
      assert.equal(actual.body, approved.body)
    }
  })

  it('keeps the dermal boundary sentence exactly', () => {
    const dermis = SCIENCE_PAGE.layerScience.cards.find((c) => c.id === 'dermis-support-story')
    assert.ok(dermis)
    assert.ok(
      dermis.body.endsWith('NFE does not claim to change dermal structure.'),
      'the dermal disclaimer must close the card'
    )
  })

  it('makes no dermal, structural or treatment claim anywhere in the module', () => {
    const copy = [
      SCIENCE_PAGE.layerScience.heading,
      SCIENCE_PAGE.layerScience.description,
      ...SCIENCE_PAGE.layerScience.cards.flatMap((c) => [c.title, c.body]),
    ]
      .join(' ')
      .toLowerCase()
    for (const claim of [
      'rebuild',
      'collagen',
      'regenerat',
      'restructur',
      'penetrat',
      'repairs',
      'treats',
      'heals',
      'reverses',
      'stimulates',
      'prevents aging',
      'prevents sun damage',
      'erases wrinkles',
      'corrects pigmentation',
    ]) {
      assert.ok(!copy.includes(claim), `layer science copy claims "${claim}"`)
    }
    // "does not claim to change dermal structure" is the only permitted use.
    const withoutDisclaimer = copy.replace(
      /nfe does not claim to change dermal structure\./g,
      ''
    )
    assert.ok(!withoutDisclaimer.includes('dermal structure'))
  })

  it('uses semantic structure with no interactive control', () => {
    const source = layerScienceModuleSource()
    assert.match(source, /<section aria-labelledby="layer-science-heading"/)
    assert.match(source, /<h2\s+id="layer-science-heading"/)
    assert.match(source, /<h3/)
    assert.match(source, /<article/)
    for (const banned of ['<button', '<a ', 'href=', 'onClick', 'tabIndex', 'aria-live', 'role="tab"']) {
      assert.ok(!source.includes(banned), `the module must not contain ${banned}`)
    }
  })

  it('lays out two columns on wide screens and stacks below', () => {
    const source = layerScienceModuleSource()
    const match = source.match(/lg:grid-cols-\[([\d.]+)fr_([\d.]+)fr\]/)
    assert.ok(match, 'the module needs an explicit two-column split')
    const left = Number(match[1])
    const right = Number(match[2])
    const leftPct = (left / (left + right)) * 100
    assert.ok(leftPct >= 38 && leftPct <= 45, `left column is ${leftPct.toFixed(0)}%, expected 40-43%`)
  })

  it('appears exactly once on the page', () => {
    const page = sciencePageSource()
    assert.equal((page.match(/<LayerScienceModule \/>/g) ?? []).length, 1)
    // The heading and cards live in one place only.
    const island = experienceSource()
    for (const source of [page, island]) {
      assert.ok(!source.includes('How NFE Face Elixir supports the skin by layer.'))
      assert.ok(!source.includes('Stratum Corneum'))
    }
  })

  it('leaves no partial Layer Science intro behind in the dark chapter', () => {
    const page = sciencePageSource()
    const island = experienceSource()
    assert.ok(!page.includes('layerScienceIntro'))
    assert.ok(!island.includes('layerScienceIntro'))
    assert.ok(!island.includes('SCIENCE_PAGE.layerScience'))
  })

  it('keeps the approved map paragraph rather than dropping it', () => {
    // The partial intro used to carry this line. It stays in the dark chapter.
    const page = sciencePageSource()
    assert.match(page, /\{mapIntro\.body\}/)
  })
})

describe('layer science module placement', () => {
  it('sits outside and immediately before the client island', () => {
    // Placement follows the brief's three consistent statements: outside the
    // client island, immediately before the dark chapter, and never inside it.
    // The dark chapter opens with the profile framing, so the module precedes
    // that too.
    const page = sciencePageSource()
    const method = page.indexOf('<ScienceMethod />')
    const module_ = page.indexOf('<LayerScienceModule />')
    const darkChapter = page.indexOf('bg-nfe-green-900 py-24')
    const island = page.indexOf('<ScienceMapExperience')
    assert.ok(module_ > -1 && island > -1, 'module and island must both render')
    assert.ok(method < module_, 'the method orientation comes first')
    assert.ok(module_ < darkChapter, 'the module must sit before the dark chapter')
    assert.ok(module_ < island, 'the module must sit outside the client island')
  })

  it('is not nested inside the dark chapter or the pathway controls', () => {
    const island = experienceSource()
    assert.ok(!island.includes('<LayerScienceModule'))
    assert.ok(!island.includes('layer-science-heading'))
  })

  it('leaves every other section exactly where it was', () => {
    const page = sciencePageSource()
    const order = [
      '{hero.heading}',
      '{method.heading}',
      '<ScienceMethod />',
      '<LayerScienceModule />',
      '{profileIntro.heading}',
      '<ScienceMapExperience',
      'Formulation principles',
      'Ingredient families',
      '{proof.heading}',
      '{founderNote.heading}',
      '{productContext.heading}',
      '{concierge.heading}',
    ]
    const positions = order.map((marker) => {
      const index = page.indexOf(marker)
      assert.ok(index > -1, `${marker} missing from the page`)
      return index
    })
    for (let i = 1; i < positions.length; i += 1) {
      assert.ok(
        positions[i] > positions[i - 1],
        `${order[i]} must follow ${order[i - 1]}`
      )
    }
  })
})

/* ------------------------------------------------------------------ *
 * Science-to-Ingredients return continuity
 * ------------------------------------------------------------------ */

describe('pathway query parser', () => {
  it('accepts one valid id', () => {
    assert.deepEqual(parsePathwayQuery('hydration'), ['hydration'])
  })

  it('accepts several valid ids in one value', () => {
    assert.deepEqual(parsePathwayQuery('hydration,tone-integrity'), [
      'hydration',
      'tone-integrity',
    ])
  })

  it('accepts a repeated parameter as well as a comma list', () => {
    assert.deepEqual(parsePathwayQuery(['hydration', 'tone-integrity']), [
      'hydration',
      'tone-integrity',
    ])
    assert.deepEqual(
      parsePathwayQuery(['hydration,visible-resilience', 'tone-integrity']),
      ['hydration', 'tone-integrity', 'visible-resilience']
    )
  })

  it('discards unknown ids and keeps the valid ones', () => {
    assert.deepEqual(parsePathwayQuery('invalid'), [])
    assert.deepEqual(parsePathwayQuery('hydration,invalid'), ['hydration'])
    assert.deepEqual(parsePathwayQuery('invalid,hydration,also-invalid'), [
      'hydration',
    ])
  })

  it('deduplicates', () => {
    assert.deepEqual(parsePathwayQuery('hydration,hydration'), ['hydration'])
    assert.deepEqual(parsePathwayQuery(['hydration', 'hydration']), ['hydration'])
  })

  it('returns canonical order regardless of the order given', () => {
    const canonical = PATHWAYS.map((pathway) => pathway.id)
    const reversed = [...canonical].reverse().join(',')
    assert.deepEqual(parsePathwayQuery(reversed), canonical)
    assert.deepEqual(parsePathwayQuery('tone-integrity,hydration'), [
      'hydration',
      'tone-integrity',
    ])
  })

  it('returns an empty array for missing, empty or malformed input', () => {
    for (const input of [
      undefined,
      '',
      ',',
      ',,,',
      '   ',
      ' ',
      '%00',
      'null',
      'undefined',
      '[]',
      '{"a":1}',
      '../../etc/passwd',
      '<script>alert(1)</script>',
      'https://example.com',
      'hydration; DROP TABLE',
      [],
      ['', '  '],
    ] as (string | string[] | undefined)[]) {
      assert.deepEqual(
        parsePathwayQuery(input),
        [],
        `expected nothing from ${JSON.stringify(input)}`
      )
    }
  })

  it('trims surrounding whitespace around otherwise valid ids', () => {
    assert.deepEqual(parsePathwayQuery(' hydration , tone-integrity '), [
      'hydration',
      'tone-integrity',
    ])
  })

  it('never throws, whatever arrives in the query string', () => {
    const hostile = [
      undefined,
      '',
      'x'.repeat(10_000),
      Array.from({ length: 500 }, () => 'hydration').join(','),
      Array.from({ length: 500 }, () => 'nope'),
      ' �\uD800',
      '%2e%2e%2f',
    ] as (string | string[] | undefined)[]
    for (const input of hostile) {
      assert.doesNotThrow(() => parsePathwayQuery(input))
    }
  })

  it('accepts every canonical id, and only those', () => {
    for (const pathway of PATHWAYS) {
      assert.deepEqual(parsePathwayQuery(pathway.id), [pathway.id])
    }
    // The labels are not accepted — ids only, never display strings.
    for (const pathway of PATHWAYS) {
      assert.deepEqual(parsePathwayQuery(pathway.label), [])
    }
  })
})

describe('pathway serialization', () => {
  it('produces no parameter at all for zero ids', () => {
    assert.equal(serializePathwayIds([]), undefined)
  })

  it('serializes one id', () => {
    assert.equal(serializePathwayIds(['hydration']), 'hydration')
  })

  it('serializes several ids', () => {
    assert.equal(
      serializePathwayIds(['hydration', 'tone-integrity']),
      'hydration,tone-integrity'
    )
  })

  it('emits canonical order regardless of the order given', () => {
    assert.equal(
      serializePathwayIds(['tone-integrity', 'hydration']),
      'hydration,tone-integrity'
    )
  })

  it('never emits a duplicate', () => {
    assert.equal(
      serializePathwayIds(['hydration', 'hydration', 'hydration']),
      'hydration'
    )
  })

  it('filters anything that is not a canonical id, even when typed as one', () => {
    const smuggled = ['hydration', 'not-a-pathway'] as PathwayId[]
    assert.equal(serializePathwayIds(smuggled), 'hydration')
    assert.equal(serializePathwayIds(['nope'] as unknown as PathwayId[]), undefined)
  })

  it('round-trips through the parser unchanged', () => {
    const all = PATHWAYS.map((pathway) => pathway.id)
    for (const subset of [
      [],
      ['hydration'],
      ['tone-integrity', 'hydration'],
      all,
    ] as PathwayId[][]) {
      const serialized = serializePathwayIds(subset)
      assert.deepEqual(parsePathwayQuery(serialized), parsePathwayQuery(
        serializePathwayIds(parsePathwayQuery(serialized))
      ))
    }
  })

  it('only ever emits url-safe tokens, so no encoding is needed', () => {
    for (const pathway of PATHWAYS) {
      assert.match(pathway.id, /^[a-z][a-z-]*$/, `${pathway.id} needs encoding`)
    }
    for (const family of INGREDIENT_FAMILY_TAXONOMY) {
      assert.match(family.id, /^[a-z][a-z-]*$/, `${family.id} needs encoding`)
    }
  })
})

describe('science origin marker', () => {
  it('recognises exactly the science marker', () => {
    assert.equal(isScienceOrigin('science'), true)
  })

  it('rejects any other value', () => {
    for (const value of [
      undefined,
      '',
      'other',
      'Science',
      'SCIENCE',
      'science-map',
      'sciences',
      ' science x',
      'inci',
      ['science', 'other'],
      ['other'],
      [],
    ] as (string | string[] | undefined)[]) {
      assert.equal(
        isScienceOrigin(value),
        false,
        `${JSON.stringify(value)} must not read as the science origin`
      )
    }
  })

  it('rejects a repeated marker rather than taking the first', () => {
    assert.equal(isScienceOrigin(['science', 'science']), false)
  })
})

describe('contextual ingredient family links', () => {
  const familyIds = INGREDIENT_FAMILY_TAXONOMY.map((family) => family.id)

  it('carries the origin marker with no pathways selected', () => {
    assert.equal(
      buildIngredientFamilyHref('humectants', []),
      '/inci?from=science#humectants'
    )
  })

  it('carries one selected pathway', () => {
    assert.equal(
      buildIngredientFamilyHref('humectants', ['hydration']),
      '/inci?from=science&pathways=hydration#humectants'
    )
  })

  it('carries several selected pathways in canonical order', () => {
    assert.equal(
      buildIngredientFamilyHref('antioxidant-supportive-ingredients', [
        'tone-integrity',
        'hydration',
      ]),
      '/inci?from=science&pathways=hydration,tone-integrity#antioxidant-supportive-ingredients'
    )
  })

  it('never emits an empty pathways parameter', () => {
    for (const id of familyIds) {
      const href = buildIngredientFamilyHref(id, [])
      assert.ok(!href.includes('pathways='), `${href} carries an empty parameter`)
    }
  })

  it('keeps every family anchor intact, and identical to the plain link', () => {
    for (const id of familyIds) {
      for (const ids of [[], ['hydration'], ['hydration', 'visible-resilience']] as PathwayId[][]) {
        const href = buildIngredientFamilyHref(id, ids)
        assert.ok(href.endsWith(`#${id}`), `${href} lost its anchor`)
        assert.equal(href.split('?')[0], familyHref(id).split('#')[0])
        assert.equal(href.split('#')[1], familyHref(id).split('#')[1])
      }
    }
  })

  it('resolves to a section that exists on Ingredients', () => {
    const sections = new Set<string>(INGREDIENT_FAMILY_TAXONOMY.map((f) => f.id))
    for (const panel of LAYER_CONTEXT_PANELS) {
      for (const id of panel.ingredientFamilyIds) {
        const href = buildIngredientFamilyHref(id, ['hydration'])
        assert.ok(sections.has(href.split('#')[1]))
      }
    }
  })

  it('is generated from the live selection, never a remembered one', () => {
    const source = layerContextSource()
    // `emphasized` is the prop the panels are currently rendering. Nothing else
    // may feed the href — an initial or stored value would go stale on Clear.
    assert.match(source, /buildIngredientFamilyHref\(id, emphasized\)/)
    const stripped = stripComments(source)
    for (const banned of [
      'initialSelected',
      'useState',
      'useRef',
      'useMemo',
      'localStorage',
      'sessionStorage',
    ]) {
      assert.ok(
        !stripped.includes(banned),
        `panels must hold no state of their own (${banned})`
      )
    }
  })

  it('stays a plain anchor with no new-tab or handler behaviour', () => {
    const stripped = stripComments(layerContextSource())
    for (const banned of [
      'target=',
      'rel="noopener"',
      'onClick',
      'role="button"',
      '<button',
      'router.push',
    ]) {
      assert.ok(!stripped.includes(banned), `family links must not use ${banned}`)
    }
  })
})

describe('science return href', () => {
  it('returns to the map alone when there is nothing to restore', () => {
    assert.equal(buildScienceReturnHref([]), '/science#science-map')
  })

  it('carries one pathway', () => {
    assert.equal(
      buildScienceReturnHref(['hydration']),
      '/science?pathways=hydration#science-map'
    )
  })

  it('carries several pathways in canonical order', () => {
    assert.equal(
      buildScienceReturnHref(['tone-integrity', 'hydration']),
      '/science?pathways=hydration,tone-integrity#science-map'
    )
  })

  it('always points at the fixed science route and anchor', () => {
    const cases: PathwayId[][] = [
      [],
      ['hydration'],
      PATHWAYS.map((pathway) => pathway.id),
      ['nope'] as unknown as PathwayId[],
    ]
    for (const ids of cases) {
      const href = buildScienceReturnHref(ids)
      assert.ok(href.startsWith('/science'), `${href} left the science route`)
      assert.ok(href.endsWith('#science-map'), `${href} lost the map anchor`)
      assert.ok(!/^https?:|^\/\//.test(href), `${href} is not an internal path`)
    }
  })

  it('cannot be pointed at an arbitrary destination', () => {
    const source = stripComments(pathwayStateSource())
    // No function here takes a URL, so there is no open redirect to have.
    for (const banned of [
      'returnTo',
      'redirect',
      'nextUrl',
      'document.referrer',
      'window.location',
      'new URL(',
    ]) {
      assert.ok(!source.includes(banned), `url state must not use ${banned}`)
    }
    assert.match(source, /export const SCIENCE_PATH = '\/science'/)
  })
})

describe('ingredients return module', () => {
  it('renders only for a visitor who came from science', () => {
    const source = inciPageSource()
    assert.match(source, /isScienceOrigin\(params\[ORIGIN_PARAM\]\)/)
    assert.match(source, /cameFromScience \? <ScienceReturnLink/)
  })

  it('appears exactly once', () => {
    const source = inciPageSource()
    assert.equal((source.match(/<ScienceReturnLink/g) ?? []).length, 1)
    const familySections = familySectionsSource()
    assert.ok(
      !familySections.includes('ScienceReturnLink'),
      'the return link must not repeat inside every family section'
    )
  })

  it('carries the approved visible label', () => {
    assert.match(returnLinkSource(), /Return to your Science Map/)
  })

  it('carries a single line and no supporting sentence', () => {
    // The floating control replaced the inline block. A second line would make
    // it taller on a phone, where it sits over the content, for no gain.
    const source = stripComments(returnLinkSource())
    assert.ok(!source.includes('Continue with the pathways you were exploring.'))
    assert.ok(!source.includes('hasPathways'), 'no conditional second line remains')
  })

  it('never claims a saved session, profile, result or diagnosis', () => {
    const copy = stripComments(returnLinkSource()).toLowerCase()
    for (const banned of [
      'saved session',
      'resume session',
      'resume your profile',
      'your results',
      'your diagnosis',
      'personalized results',
      'personalised results',
      'recommended pathway',
      'your concerns',
      'we remembered',
      'welcome back',
      'restored',
      'session',
      'profile',
      'query string',
      'parameter',
      'url',
    ]) {
      assert.ok(!copy.includes(banned), `return copy must not say "${banned}"`)
    }
  })

  it('is a native link, server-rendered, with no new tab or handler', () => {
    const source = returnLinkSource()
    assert.match(source, /<Link\s+href=\{buildScienceReturnHref\(pathwayIds\)\}/)
    assert.ok(!source.includes("'use client'"), 'the return link must render on the server')
    const stripped = stripComments(source)
    for (const banned of [
      'target=',
      'onClick',
      '<button',
      'role="button"',
      'aria-live',
      'useState',
      'useEffect',
      'router',
    ]) {
      assert.ok(!stripped.includes(banned), `return link must not use ${banned}`)
    }
  })

  it('lets the visible label be the accessible name', () => {
    const source = stripComments(returnLinkSource())
    // The landmark carries a label; the link must not. An aria-label on the
    // anchor would replace the words the visitor can see.
    const anchor = source.slice(source.indexOf('<Link'), source.indexOf('</Link>'))
    assert.ok(!/aria-label=/.test(anchor), 'no hidden name may override the label')
    assert.match(source, /<aside\s+aria-label="Science navigation"/)
    // The arrow is decorative and hidden, so it is not part of the name.
    assert.match(source, /<span aria-hidden="true">&larr;<\/span>/)
    assert.match(source, /<span>Return to your Science Map<\/span>/)
  })

  it('is quiet orientation, not a call to action', () => {
    const source = stripComments(returnLinkSource())
    for (const banned of [
      'animate-',
      'animate-pulse',
      'shadow-2xl',
      'Dismiss',
      'aria-label="Close"',
      'text-lg',
      'text-xl',
      'font-bold',
      'uppercase',
    ]) {
      assert.ok(!source.includes(banned), `return control must not use ${banned}`)
    }
    // Deep green with warm cream, not a filled gold promotional button.
    assert.match(source, /bg-\[#0E2A22\]/)
    assert.ok(!/bg-\[#C9A66B\]|bg-nfe-gold/.test(source))
  })

  it('leaves the existing Return to Science link untouched', () => {
    const source = inciPageSource()
    assert.match(source, /href="\/science"[\s\S]{0,400}Return to Science/)
  })
})

describe('science initial state from the url', () => {
  it('parses the query on the server, not in the browser', () => {
    const page = sciencePageSource()
    assert.match(page, /export default async function SciencePage\(\{ searchParams \}/)
    assert.match(page, /parsePathwayQuery\(params\[PATHWAYS_PARAM\]\)/)
    const stripped = stripComments(page)
    for (const banned of ['useSearchParams', 'window.location', "'use client'"]) {
      assert.ok(!stripped.includes(banned), `science must not read the url via ${banned}`)
    }
  })

  it('hands the validated ids to the existing island as initial state', () => {
    assert.match(
      sciencePageSource(),
      /initialSelectedPathwayIds=\{initialSelectedPathwayIds\}/
    )
    const island = experienceSource()
    assert.match(island, /useState<PathwayId\[\]>\(\s*initialSelectedPathwayIds\s*\)/)
  })

  it('keeps one selection state, seeded once and then owned by react', () => {
    const island = stripComments(experienceSource())
    assert.equal((island.match(/useState<PathwayId\[\]>/g) ?? []).length, 1)
    // No synchronisation back into the url: no router churn, no history spam.
    for (const banned of [
      'router.replace',
      'router.push',
      'useRouter',
      'useSearchParams',
      'history.pushState',
      'history.replaceState',
      'useEffect',
    ]) {
      assert.ok(!island.includes(banned), `the island must not use ${banned}`)
    }
  })

  it('defaults to no selection when the url says nothing', () => {
    assert.match(experienceSource(), /initialSelectedPathwayIds = \[\]/)
  })

  it('restores nothing from an invalid or duplicated query', () => {
    assert.deepEqual(parsePathwayQuery('invalid'), [])
    assert.deepEqual(parsePathwayQuery('hydration,invalid,hydration'), ['hydration'])
  })

  it('keeps Clear pathways able to empty a url-restored state', () => {
    const island = stripComments(experienceSource())
    assert.match(island, /function clearPathways\(\)/)
    assert.match(island, /setSelected\(\[\]\)/)
  })
})

describe('return anchor', () => {
  it('gives the interactive chapter a stable, unique id', () => {
    const page = sciencePageSource()
    assert.match(page, /id=\{SCIENCE_MAP_ANCHOR\}/)
    assert.equal((page.match(/id=\{SCIENCE_MAP_ANCHOR\}/g) ?? []).length, 1)
    assert.equal(SCIENCE_MAP_ANCHOR, 'science-map')
  })

  it('carries scroll-margin, which cannot shift layout', () => {
    assert.match(sciencePageSource(), /id=\{SCIENCE_MAP_ANCHOR\} className="mt-16 scroll-mt-24"/)
  })

  it('lands on the map, not on the first-visit framing above it', () => {
    // Measured: on the chapter wrapper the schematic was below the fold at
    // every height tested. On the island wrapper the controls and the
    // schematic are both in view from 720px up.
    const page = sciencePageSource()
    const anchor = page.indexOf('id={SCIENCE_MAP_ANCHOR}')
    const framing = page.indexOf('id={profileIntro.anchorId}')
    const island = page.indexOf('<ScienceMapExperience')
    assert.ok(framing > -1 && anchor > framing, 'the anchor must follow the framing')
    assert.ok(anchor < island, 'the anchor must wrap the interactive chapter')
  })

  it('does not collide with the existing profile anchor', () => {
    assert.notEqual(SCIENCE_MAP_ANCHOR, SCIENCE_PAGE.profileIntro.anchorId)
    const page = sciencePageSource()
    assert.match(page, /id=\{profileIntro\.anchorId\}/)
  })

  it('needs no javascript and no scripted scrolling', () => {
    const page = stripComments(sciencePageSource())
    for (const banned of ['scrollIntoView', 'scrollTo', 'behavior:', 'useEffect']) {
      assert.ok(!page.includes(banned), `the anchor must not rely on ${banned}`)
    }
  })
})

describe('return continuity privacy and security', () => {
  const CONTINUITY_FILES = [
    'lib/science-pathway-state.ts',
    'components/ingredients/ScienceReturnLink.tsx',
    'app/(education)/inci/page.tsx',
    'app/(education)/science/page.tsx',
    'components/science/LayerContextPanels.tsx',
    'components/science/ScienceMapExperience.tsx',
  ]

  const continuitySource = () =>
    CONTINUITY_FILES.map((path) => ({
      path,
      contents: stripComments(readFileSync(src(path), 'utf8')),
    }))

  it('stores nothing, anywhere', () => {
    for (const { path, contents } of continuitySource()) {
      for (const banned of [
        'localStorage',
        'sessionStorage',
        'indexedDB',
        'document.cookie',
        'cookies(',
        'Cache.',
        'caches.',
      ]) {
        assert.ok(!contents.includes(banned), `${path} uses ${banned}`)
      }
    }
  })

  it('sends nothing anywhere', () => {
    for (const { path, contents } of continuitySource()) {
      for (const banned of [
        'fetch(',
        'XMLHttpRequest',
        'navigator.sendBeacon',
        'supabase',
        '/api/',
        'trackNfeEvent',
        'trackPageView',
        'gtag',
        'dataLayer',
      ]) {
        assert.ok(!contents.includes(banned), `${path} transmits via ${banned}`)
      }
    }
  })

  it('accepts no destination from the query string', () => {
    for (const { path, contents } of continuitySource()) {
      for (const banned of ['returnTo', 'redirect(', 'permanentRedirect']) {
        assert.ok(!contents.includes(banned), `${path} accepts a destination via ${banned}`)
      }
    }
  })

  it('puts only pathway ids in a url — never a person, a score or a product', () => {
    const url = [
      buildScienceReturnHref(PATHWAYS.map((p) => p.id)),
      buildIngredientFamilyHref('humectants', PATHWAYS.map((p) => p.id)),
    ].join(' ')
    for (const banned of [
      'skinType',
      'skin_type',
      'severity',
      'score',
      'rank',
      'profile',
      'concern',
      'email',
      'id=',
      'uid',
      'session',
      'product',
    ]) {
      assert.ok(!url.includes(banned), `urls must not carry ${banned}`)
    }
    for (const pathway of PATHWAYS) {
      assert.ok(!url.includes(pathway.label), 'urls carry ids, never display labels')
    }
  })

  it('keeps metadata fixed, so a pathway combination is never its own page', () => {
    const page = sciencePageSource()
    assert.match(page, /export const metadata: Metadata = \{/)
    // Metadata is a static export: it cannot read searchParams.
    assert.ok(!/generateMetadata/.test(page))
    assert.ok(!/alternates/.test(page), 'no per-query canonical may be generated')
    assert.ok(!/generateMetadata/.test(inciPageSource()))
  })
})

describe('return continuity regression', () => {
  it('leaves every science section in place and in order', () => {
    const page = sciencePageSource()
    const order = [
      '{hero.heading}',
      '{method.heading}',
      '<ScienceMethod />',
      '<LayerScienceModule />',
      '{profileIntro.heading}',
      '<ScienceMapExperience',
      'Formulation principles',
      'Ingredient families',
      '{proof.heading}',
      '{founderNote.heading}',
      '{productContext.heading}',
      '{concierge.heading}',
    ]
    const positions = order.map((marker) => {
      const index = page.indexOf(marker)
      assert.ok(index > -1, `${marker} missing from the page`)
      return index
    })
    for (let i = 1; i < positions.length; i += 1) {
      assert.ok(positions[i] > positions[i - 1], `${order[i]} must follow ${order[i - 1]}`)
    }
  })

  it('keeps all five pathways and the whole layer context plate', () => {
    assert.equal(PATHWAYS.length, 5)
    assert.equal(LAYER_CONTEXT_PANELS.length, 5)
    assert.equal(CONCERN_FORMULA_MATRIX.length, 5)
    assert.equal(SKIN_LAYERS.length, 5)
    assert.equal(INGREDIENT_FAMILY_TAXONOMY.length, 8)
  })

  it('keeps the ingredients page server-rendered', () => {
    const source = inciPageSource()
    assert.ok(!source.includes("'use client'"))
    assert.match(source, /<IngredientFamilySections \/>/)
    assert.match(source, /<INCITransparencyTabs \/>/)
  })

  it('adds no new route', () => {
    assert.ok(!existsSync(src('app/(education)/science/[pathways]')))
    assert.ok(!existsSync(src('app/(education)/inci/[family]')))
  })

  it('keeps the layer science module and the schematic exactly as approved', () => {
    assert.equal(SCIENCE_PAGE.layerScience.cards.length, 3)
    assert.match(schematicSource(), /viewBox="0 0 620 300"/)
  })
})

/* ------------------------------------------------------------------ *
 * Persistent Ingredients return navigation
 * ------------------------------------------------------------------ */

describe('floating return control — visibility conditions', () => {
  it('renders only for a validated science origin', () => {
    const page = inciPageSource()
    assert.match(page, /const cameFromScience = isScienceOrigin\(params\[ORIGIN_PARAM\]\)/)
    assert.match(page, /cameFromScience \? <ScienceReturnLink pathwayIds=\{pathwayIds\} \/> : null/)
  })

  it('leans on the existing strict origin check, not a new one', () => {
    // The control must not appear because a pathway parameter happens to be
    // present, and must not sniff the referrer or history to guess an origin.
    assert.equal(isScienceOrigin('science'), true)
    for (const value of ['other', 'SCIENCE', 'Science', '', undefined, ['science', 'science']]) {
      assert.equal(isScienceOrigin(value as string | string[] | undefined), false)
    }
    const sources = [stripComments(inciPageSource()), stripComments(returnLinkSource())]
    for (const source of sources) {
      for (const banned of ['document.referrer', 'history.', 'navigator.', 'useSearchParams']) {
        assert.ok(!source.includes(banned), `origin must not be inferred via ${banned}`)
      }
    }
  })

  it('renders with zero, one and many pathways alike', () => {
    // Visibility depends on origin only; the pathways change the href, not
    // whether the control exists.
    const source = stripComments(returnLinkSource())
    assert.ok(!/pathwayIds\.length/.test(source), 'presence must not depend on pathway count')
    assert.equal(buildScienceReturnHref([]), '/science#science-map')
    assert.equal(
      buildScienceReturnHref(['hydration']),
      '/science?pathways=hydration#science-map'
    )
    assert.equal(
      buildScienceReturnHref(['tone-integrity', 'hydration']),
      '/science?pathways=hydration,tone-integrity#science-map'
    )
  })
})

describe('floating return control — fixed behaviour', () => {
  const classes = () => {
    const source = returnLinkSource()
    const aside = source.slice(source.indexOf('<aside'), source.indexOf('<Link'))
    const link = source.slice(source.indexOf('<Link'), source.indexOf('</Link>'))
    return { aside, link }
  }

  it('travels with the viewport rather than the document', () => {
    const { aside } = classes()
    assert.match(aside, /\bfixed\b/, 'the control must be viewport-fixed')
    assert.ok(!/\bsticky\b/.test(aside), 'sticky stops following once its section ends')
    assert.ok(!/\babsolute\b/.test(aside))
  })

  it('places itself for every breakpoint', () => {
    const { aside } = classes()
    // Mobile: a bar inset from both edges, near the bottom.
    assert.match(aside, /inset-x-4/)
    assert.match(aside, /bottom-4/)
    // Tablet and up: a compact pill in the bottom corner.
    assert.match(aside, /md:inset-x-auto/)
    assert.match(aside, /md:right-6/)
    assert.match(aside, /md:bottom-6/)
    // Desktop: a little more breathing room.
    assert.match(aside, /lg:right-8/)
    assert.match(aside, /lg:bottom-8/)
  })

  it('lifts clear of the phone home indicator', () => {
    assert.match(
      returnLinkSource(),
      /paddingBottom: 'env\(safe-area-inset-bottom\)'/,
      'the mobile bar needs safe-area padding'
    )
  })

  it('sits under the consent dialog, never over it', () => {
    const { aside } = classes()
    const z = aside.match(/z-(\d+)/)
    assert.ok(z, 'the control needs an explicit stacking order')
    assert.ok(
      Number(z[1]) < 50,
      `z-${z[1]} would cover the cookie consent dialog at z-50`
    )
  })

  it('never swallows a click meant for the page beneath it', () => {
    const { aside, link } = classes()
    assert.match(aside, /pointer-events-none/)
    assert.match(link, /pointer-events-auto/)
  })

  it('costs nothing at runtime — no listener, no observer, no state', () => {
    const source = stripComments(returnLinkSource())
    for (const banned of [
      "'use client'",
      'addEventListener',
      'onScroll',
      'IntersectionObserver',
      'ResizeObserver',
      'useState',
      'useEffect',
      'useRef',
      'requestAnimationFrame',
      'getBoundingClientRect',
      'window.',
    ]) {
      assert.ok(!source.includes(banned), `the control must not use ${banned}`)
    }
  })

  it('offers no dismiss control', () => {
    const source = stripComments(returnLinkSource())
    // Not a bare "hidden" scan — the decorative arrow is legitimately
    // aria-hidden, and that is the opposite of a dismiss affordance.
    for (const banned of ['<button', 'Close', 'Dismiss', 'onClick', 'className="hidden']) {
      assert.ok(!source.includes(banned), `the control must not be dismissible (${banned})`)
    }
  })

  it('keeps a comfortable target and a visible focus ring', () => {
    const { link } = classes()
    assert.match(link, /min-h-\[44px\]/)
    assert.match(link, /focus-visible:ring-2/)
    assert.match(link, /focus-visible:ring-\[#C9A66B\]/)
    assert.match(link, /focus-visible:ring-offset-2/)
  })

  it('stays a plain anchor with no new tab or scripted navigation', () => {
    const { link } = classes()
    assert.match(link, /<Link\s+href=\{buildScienceReturnHref\(pathwayIds\)\}/)
    for (const banned of ['target=', 'rel="noopener"', 'role="button"', 'onClick']) {
      assert.ok(!link.includes(banned), `the control must not use ${banned}`)
    }
  })

  it('is wrapped in a labelled landmark', () => {
    assert.match(returnLinkSource(), /<aside\s+aria-label="Science navigation"/)
  })
})

describe('floating return control — content protection', () => {
  it('gives the page room to clear the control, and only then', () => {
    const page = inciPageSource()
    assert.match(
      page,
      /cameFromScience \? 'pb-32 md:pb-28' : ''/,
      'bottom padding must be contextual, not permanent'
    )
  })

  it('leaves an ordinary visit to Ingredients exactly as it was', () => {
    const page = inciPageSource()
    // The padding and the control are both behind the same condition, so a
    // direct visit renders neither.
    const conditional = page.match(/cameFromScience \?/g) ?? []
    assert.equal(conditional.length, 2, 'control and padding are both contextual')
    assert.match(page, /container mx-auto px-4 py-8 \$\{/)
  })

  it('reserves more room on mobile, where the bar spans the width', () => {
    const page = inciPageSource()
    const mobile = Number(page.match(/pb-(\d+) md:pb-\d+/)![1])
    const desktop = Number(page.match(/pb-\d+ md:pb-(\d+)/)![1])
    assert.ok(mobile > desktop, 'the full-width bar needs more clearance than the pill')
    // Control is 46px tall; clearance must exceed it by a real margin.
    assert.ok(desktop * 4 >= 46 + 24, `${desktop * 4}px is not enough clearance`)
  })
})

describe('floating return control — no duplication', () => {
  it('is the only contextual return control on the page', () => {
    const page = inciPageSource()
    assert.equal((page.match(/<ScienceReturnLink/g) ?? []).length, 1)
    assert.equal(
      (page.match(/Return to your Science Map/g) ?? []).length,
      0,
      'the page must not restate the label inline'
    )
    assert.equal(
      (returnLinkSource().match(/Return to your Science Map/g) ?? []).length,
      1
    )
  })

  it('does not repeat inside the family sections', () => {
    const sections = familySectionsSource()
    assert.ok(!sections.includes('ScienceReturnLink'))
    assert.ok(!sections.includes('Return to your Science Map'))
  })

  it('leaves the longstanding footer link alone', () => {
    const page = inciPageSource()
    assert.match(page, /href="\/science"[\s\S]{0,400}Return to Science/)
    // Distinct copy, so the two are not read as duplicates.
    assert.ok(!page.includes('Return to your Science Map'))
  })
})

describe('persistent return regression', () => {
  it('keeps all eight family anchors', () => {
    assert.equal(INGREDIENT_FAMILY_TAXONOMY.length, 8)
    for (const family of INGREDIENT_FAMILY_TAXONOMY) {
      assert.equal(familyHref(family.id), `/inci#${family.id}`)
    }
  })

  it('leaves the pathway URL contract untouched', () => {
    assert.deepEqual(parsePathwayQuery('hydration,invalid,hydration'), ['hydration'])
    assert.deepEqual(parsePathwayQuery('tone-integrity,hydration'), [
      'hydration',
      'tone-integrity',
    ])
    assert.equal(serializePathwayIds([]), undefined)
    assert.equal(
      buildIngredientFamilyHref('humectants', ['hydration']),
      '/inci?from=science&pathways=hydration#humectants'
    )
  })

  it('keeps Ingredients server-rendered with its sections intact', () => {
    const page = inciPageSource()
    assert.ok(!page.includes("'use client'"))
    assert.match(page, /<IngredientFamilySections \/>/)
    assert.match(page, /<INCITransparencyTabs \/>/)
    assert.match(page, /export default async function INCIPage/)
  })

  it('adds no route and no new parser', () => {
    assert.ok(!existsSync(src('app/(education)/inci/[family]')))
    const source = stripComments(returnLinkSource())
    assert.ok(!source.includes('function parse'), 'the control must reuse the shared parser')
    assert.match(returnLinkSource(), /from '@\/lib\/science-pathway-state'/)
  })
})
