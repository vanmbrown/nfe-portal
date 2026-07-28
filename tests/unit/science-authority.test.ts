import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

// Imported per-module rather than through the barrel: the node:test resolver
// hook does not resolve directory imports, while Next.js does.
import { CONCERN_FORMULA_MATRIX } from '@/content/science/formula-matrix'
import { INGREDIENT_FAMILIES } from '@/content/science/ingredient-families'
import { INGREDIENT_FAMILIES as INGREDIENT_FAMILY_TAXONOMY } from '@/content/ingredients/families'
import { LAYER_CONTEXT_PANELS } from '@/content/science/layer-context'
import { SKIN_LAYERS } from '@/content/science/layers'
import { SCIENCE_PAGE } from '@/content/science/page'
import { PATHWAYS } from '@/content/science/pathways'

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
      /view my nfe skin profile/i,
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
    // Match invocations, not the import line, which also contains the name.
    const stateHooks = source.match(/useState[<(]/g) ?? []
    assert.equal(stateHooks.length, 1, 'more than one state source in the chapter')
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
    const source = layerContextSource()
    for (const tag of ['<button', '<a ', 'onClick', 'href=', 'tabIndex']) {
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
    assert.equal((source.match(/useState[<(]/g) ?? []).length, 1)
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
    assert.match(source, /const BLOCK = \{ x: 16, y: 14, width: 320, height: 272 \}/)
    assert.match(source, /x=\{BLOCK\.x\}/)
    assert.match(source, /width=\{BLOCK\.width\}/)
  })

  it('uses a viewBox the drawing nearly fills', () => {
    const source = schematic()
    const vb = source.match(/viewBox="0 0 (\d+) (\d+)"/)
    assert.ok(vb, 'schematic needs an explicit viewBox')
    const [width, height] = [Number(vb[1]), Number(vb[2])]
    // Block is 320x272. Vertical dead space must stay small.
    assert.ok(272 / height >= 0.85, `block fills only ${Math.round((272 / height) * 100)}% of viewBox height`)
    assert.ok(320 / width >= 0.55, `block fills only ${Math.round((320 / width) * 100)}% of viewBox width`)
  })

  it('is larger than the previous implementation in both dimensions', () => {
    // Previous: 286x232 in a 566x292 viewBox.
    const source = schematic()
    const vb = source.match(/viewBox="0 0 (\d+) (\d+)"/)
    assert.ok(vb, 'schematic needs an explicit viewBox')
    const scaleRatio = 566 / Number(vb[1])
    const widthGain = (320 * scaleRatio) / 286
    const heightGain = (272 * scaleRatio) / 232
    assert.ok(widthGain >= 1.15, `width gain only ${widthGain.toFixed(2)}x`)
    assert.ok(heightGain >= 1.15, `height gain only ${heightGain.toFixed(2)}x`)
  })

  it('raises label sizes above the previous 19/18/13 units', () => {
    const source = schematic()
    const sizes = Array.from(source.matchAll(/text-\[(\d+)px\]/g), (m) => Number(m[1]))
    assert.ok(sizes.includes(22), 'zone label should be 22 units')
    assert.ok(sizes.includes(20), 'zone sub-label should be 20 units')
    assert.ok(sizes.includes(15), 'anatomical label should be 15 units')
    assert.ok(Math.min(...sizes) >= 15, 'no schematic label below 15 units')
  })

  it('wraps long zone names instead of widening the viewBox', () => {
    const source = schematic()
    assert.match(source, /const wrapLabel/)
    assert.match(source, /<tspan/)
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
      [54, 54, 56, 56, 52]
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
