import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

// Imported per-module rather than through the barrel: the node:test resolver
// hook does not resolve directory imports, while Next.js does.
import { INGREDIENT_FAMILIES } from '@/content/science/ingredient-families'
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
  'content/science/page.ts',
  'content/science/pathways.ts',
  'content/science/layers.ts',
  'content/science/ingredient-families.ts',
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
  // Pathway claimsBoundary lists prohibited wording on purpose; exclude it.
  PATHWAYS.forEach((pathway) => {
    const { claimsBoundary, ...rest } = pathway
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
