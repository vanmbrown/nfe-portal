import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

/**
 * Guards the founder publication decisions for the two supporting editorial
 * notes: bylines, editorial placement, publication state, responsive crops,
 * and the shared accessibility corrections.
 *
 * These read source rather than importing the runtime modules, because the
 * article manifest is JSON and the loader under test is the thing being
 * guarded. Every assertion targets a specific decision and fails if it drifts.
 */

const root = process.cwd()
const read = (...p: string[]) => readFileSync(join(root, ...p), 'utf8')
const articlesPath = ['src', 'content', 'articles', 'articles.json']

type Entry = {
  slug: string
  title: string
  date: string | null
  published?: boolean
  author: string
  editorialTier?: string
  pillar: string
  heroImage?: string
  mobileImage?: string
  imageAlt?: string
  featured?: boolean
}

const entries = JSON.parse(read(...articlesPath)) as Entry[]
const bySlug = (s: string) => entries.find((e) => e.slug === s)

const CABINET = 'whats-in-my-beauty-cabinet'
const SCENT = 'the-scent-of-feeling-beautiful'
const NEW = [CABINET, SCENT]

describe('journal publication: bylines', () => {
  it('attributes both essays to Vanessa McCaleb', () => {
    for (const slug of NEW) {
      assert.equal(bySlug(slug)?.author, 'Vanessa McCaleb', `${slug} byline`)
    }
  })

  it('uses neither of the rejected bylines on these two essays', () => {
    for (const slug of NEW) {
      const author = bySlug(slug)?.author
      assert.notEqual(author, 'Vanessa Brown', `${slug} still uses Vanessa Brown`)
      assert.notEqual(author, 'NFE Beauty', `${slug} still uses NFE Beauty`)
    }
  })

  it('leaves every pre-existing byline untouched', () => {
    const legacy = entries.filter((e) => !NEW.includes(e.slug))
    assert.equal(legacy.length, 16)
    for (const e of legacy) {
      assert.equal(e.author, 'NFE Beauty', `${e.slug} byline changed`)
    }
  })
})

describe('journal publication: editorial placement', () => {
  it('classifies both as supporting editorial notes, not primary essays', () => {
    for (const slug of NEW) {
      assert.equal(bySlug(slug)?.editorialTier, 'legacy', `${slug} tier`)
      assert.notEqual(bySlug(slug)?.featured, true, `${slug} is featured`)
    }
  })

  it('keeps the nine primary authority essays exactly as they were', () => {
    const primary = entries.filter((e) => e.editorialTier === 'primary')
    assert.equal(primary.length, 9, 'primary essay count changed')
    for (const slug of NEW) {
      assert.ok(
        !primary.some((e) => e.slug === slug),
        `${slug} entered the primary collection`
      )
    }
  })

  it('assigns the approved editorial roles', () => {
    assert.equal(bySlug(CABINET)?.pillar, 'proof-discipline')
    assert.equal(bySlug(SCENT)?.pillar, 'ritual-intelligence')
  })

  it('places each essay in the approved supporting-notes group and section', () => {
    const notes = read('src', 'content', 'articles', 'journal-supporting-notes.ts')
    // Beauty Cabinet -> Founder Notes
    assert.match(
      notes,
      new RegExp(`slug:\\s*'${CABINET}',\\s*label:\\s*'Founder Notes'`),
      'Beauty Cabinet is not labelled Founder Notes'
    )
    // Scent -> Ritual Notes
    assert.match(
      notes,
      new RegExp(`slug:\\s*'${SCENT}',\\s*label:\\s*'Ritual Notes'`),
      'Scent is not labelled Ritual Notes'
    )
  })

  it('adds neither essay to the well-aging primary series config', () => {
    const series = read('src', 'content', 'articles', 'well-aging-series.ts')
    for (const slug of NEW) {
      assert.ok(!series.includes(slug), `${slug} entered the primary series`)
    }
  })

  it('lists each essay exactly once across all supporting groups', () => {
    const notes = read('src', 'content', 'articles', 'journal-supporting-notes.ts')
    for (const slug of NEW) {
      const count = notes.split(`'${slug}'`).length - 1
      assert.equal(count, 1, `${slug} appears ${count} times in supporting notes`)
    }
  })
})

describe('journal publication: publication state', () => {
  it('publishes both essays with a real release date', () => {
    for (const slug of NEW) {
      const e = bySlug(slug)
      assert.equal(e?.published, true, `${slug} is not published`)
      assert.match(
        e?.date ?? '',
        /^\d{4}-\d{2}-\d{2}$/,
        `${slug} has no release date in the Journal's date format`
      )
    }
  })

  it('never reintroduces the rejected provisional date', () => {
    const raw = read(...articlesPath)
    assert.ok(!raw.includes('2026-08-05'), 'the provisional date came back')
  })

  it('publishes both essays on the same release date', () => {
    assert.equal(
      bySlug(CABINET)?.date,
      bySlug(SCENT)?.date,
      'the two essays were released on different dates'
    )
  })

  it('leaves every published article published, with a real date', () => {
    for (const e of entries.filter((x) => !NEW.includes(x.slug))) {
      assert.notEqual(e.published, false, `${e.slug} became unpublished`)
      assert.match(e.date ?? '', /^\d{4}-\d{2}-\d{2}$/, `${e.slug} lost its date`)
    }
  })

  it('gates index, sitemap and route generation through one shared filter', () => {
    const lib = read('src', 'lib', 'articles.ts')
    assert.match(lib, /published\?: boolean/, 'no published field on the model')
    assert.match(lib, /INCLUDE_UNPUBLISHED \|\| isPublished\(article\)/,
      'getAllArticles does not gate on publication')

    const sitemap = read('src', 'app', 'sitemap.ts')
    assert.match(sitemap, /getAllArticles\(\)/, 'sitemap bypasses the gate')

    const route = read('src', 'app', 'articles', '[slug]', 'page.tsx')
    assert.match(route, /generateStaticParams/, 'no static params')
    assert.match(route, /publishedSlugs/,
      'route generation does not gate on publication')
  })

  it('emits no structured data for an article with no publication date', () => {
    const route = read('src', 'app', 'articles', '[slug]', 'page.tsx')
    assert.match(route, /meta\.date \? \(\s*<ArticleJsonLd/,
      'JSON-LD is emitted without a publication date')
  })

  it('carries the founder byline into structured data, not the house name', () => {
    const route = read('src', 'app', 'articles', '[slug]', 'page.tsx')
    assert.match(route, /author=\{meta\.author\}/, 'byline is not passed to JSON-LD')
    const jsonld = read('src', 'components', 'articles', 'ArticleJsonLd.tsx')
    assert.match(jsonld, /'@type': 'Person', name: author/, 'no Person author branch')
    // house-written articles must keep the Organization author exactly as before
    assert.match(jsonld, /'@type': 'Organization',\s*name: 'NFE Beauty'/)
  })
})

describe('journal publication: responsive hero crops', () => {
  const MOBILE = {
    [CABINET]: 'whats-in-my-beauty-cabinet-mobile.webp',
    [SCENT]: 'the-scent-of-feeling-beautiful-mobile.webp',
  } as Record<string, string>

  for (const slug of NEW) {
    it(`${slug} declares a dedicated mobile crop`, () => {
      const e = bySlug(slug)
      assert.ok(e?.mobileImage, `${slug} has no mobileImage`)
      assert.ok(
        (e!.mobileImage as string).endsWith(MOBILE[slug]),
        `${slug} mobile filename is not ${MOBILE[slug]}`
      )
      assert.ok(
        (e!.mobileImage as string).startsWith(
          '/images/journal/the-new-language-of-well-aging/'
        ),
        `${slug} mobile crop is outside the approved directory`
      )
    })

    it(`${slug} mobile crop exists on disk and is 4:5 WebP`, () => {
      const e = bySlug(slug)!
      const file = join(root, 'public', e.mobileImage as string)
      assert.ok(existsSync(file), `missing mobile crop for ${slug}`)
      const buf = readFileSync(file)
      assert.equal(buf.toString('ascii', 0, 4), 'RIFF', 'not RIFF')
      assert.equal(buf.toString('ascii', 8, 12), 'WEBP', 'not WebP')
      // VP8 lossy keyframe header carries the canvas size
      const i = buf.indexOf(Buffer.from([0x9d, 0x01, 0x2a]))
      assert.ok(i > 0, 'no VP8 keyframe header')
      const w = buf.readUInt16LE(i + 3) & 0x3fff
      const h = buf.readUInt16LE(i + 5) & 0x3fff
      const ratio = w / h
      assert.ok(
        Math.abs(ratio - 0.8) < 0.02,
        `${slug} mobile crop is ${w}x${h} (ratio ${ratio.toFixed(3)}), expected ~0.800`
      )
    })

    it(`${slug} keeps its approved desktop asset unchanged`, () => {
      const e = bySlug(slug)!
      assert.ok(
        (e.heroImage as string).endsWith(`${slug}.webp`),
        `${slug} desktop hero was replaced`
      )
      assert.notEqual(e.heroImage, e.mobileImage, 'desktop and mobile are the same file')
      assert.ok(existsSync(join(root, 'public', e.heroImage as string)))
    })
  }

  it('serves the mobile crop below the md breakpoint via art direction', () => {
    const route = read('src', 'app', 'articles', '[slug]', 'page.tsx')
    assert.match(route, /media="\(max-width: 767px\)"/, 'no mobile media query')
    assert.match(route, /srcSet=\{meta\.mobileImage\}/, 'mobile source not wired')
  })
})

describe('journal publication: alt text', () => {
  it('describes the cabinet scene without keyword-stuffing brands', () => {
    const alt = bySlug(CABINET)?.imageAlt ?? ''
    assert.ok(alt.length > 30, 'alt too short')
    for (const brand of ['Cetaphil', 'Colorescience', 'Perrigo', 'tretinoin']) {
      assert.ok(!alt.includes(brand), `alt text names ${brand}`)
    }
  })

  it('does not present the generated woman as a real, named person', () => {
    const alt = bySlug(SCENT)?.imageAlt ?? ''
    assert.ok(alt.length > 30, 'alt too short')
    for (const bad of ['Vanessa', 'customer', 'testimonial']) {
      assert.ok(!alt.includes(bad), `alt text implies a real person: ${bad}`)
    }
  })
})

describe('journal publication: attribution and copy freeze', () => {
  it('removes the celebrity attribution from the scent essay', () => {
    const body = read('src', 'content', 'articles', `${SCENT}.mdx`)
    assert.ok(!/Zoe\s+Salda/i.test(body), 'the celebrity name is still present')
    assert.ok(!/\]\(https?:\/\//.test(body), 'an external citation was added')
  })

  it('keeps the underlying idea and the surrounding sentences intact', () => {
    const body = read('src', 'content', 'articles', `${SCENT}.mdx`)
    assert.match(body, /working with what you have, celebrating it, embracing it, and taking care of it/)
    assert.match(body, /That is the kind of beauty that comes with experience\./)
    assert.match(body, /It is not rooted in correction or comparison\. It is rooted in appreciation\./)
  })

  it('leaves the article titles and closing lines untouched', () => {
    assert.equal(bySlug(CABINET)?.title, 'What’s in My Beauty Cabinet?')
    assert.equal(bySlug(SCENT)?.title, 'The Scent of Feeling Beautiful')
    const scent = read('src', 'content', 'articles', `${SCENT}.mdx`)
    assert.match(
      scent,
      /Sometimes, beauty is a feeling\.\n\nAnd sometimes, that feeling has a scent\./
    )
    const cabinet = read('src', 'content', 'articles', `${CABINET}.mdx`)
    assert.match(cabinet, /<Callout title="A note on this routine">/)
  })

  it('renders no em dash and makes no prohibited claim', () => {
    // These words may appear only where the essay repudiates them, which is the
    // founder's own argument ("I am not talking about flawless skin"). Used as
    // a promise instead, they are a claims failure, so each occurrence must sit
    // in a negating sentence.
    const TERMS = [
      'anti-aging', 'age-defying', 'youthful', 'flawless', 'miracle', 'must-have',
    ]
    for (const slug of NEW) {
      const body = read('src', 'content', 'articles', `${slug}.mdx`)
      assert.equal((body.match(/—/g) ?? []).length, 0, `${slug} em dash`)
      for (const sentence of body.split(/(?<=[.!?])\s+/)) {
        for (const term of TERMS) {
          if (!new RegExp(term, 'i').test(sentence)) continue
          assert.match(
            sentence,
            /\b(not|never|no|without)\b/i,
            `${slug} asserts "${term}" as a claim: ${sentence.trim().slice(0, 90)}`
          )
        }
      }
    }
  })
})

describe('journal publication: shared accessibility corrections', () => {
  it('distinguishes the supporting-note link by more than colour', () => {
    const route = read('src', 'app', 'articles', '[slug]', 'page.tsx')
    assert.match(
      route,
      /text-nfe-gold underline underline-offset-4/,
      'the supporting-note link has no resting underline'
    )
    assert.ok(
      !/text-nfe-gold underline-offset-4 hover:underline/.test(route),
      'the colour-only link treatment came back'
    )
  })

  it('labels page sections with real headings so h3 never skips a level', () => {
    const related = read('src', 'components', 'articles', 'ArticleRelatedLinks.tsx')
    assert.match(related, /<h2 className="text-xs uppercase[^"]*">\s*Related Reading/)
    assert.match(related, /<h2 className="text-xs uppercase[^"]*">\s*Continue Inside the Maison/)
    assert.match(related, /<h3 /, 'related cards no longer use h3')
  })

  it('introduces no filler heading in either article body', () => {
    const scent = read('src', 'content', 'articles', `${SCENT}.mdx`)
    assert.equal(
      scent.split('\n').filter((l) => /^#{1,6} /.test(l)).length,
      0,
      'a heading was imposed on the continuous essay'
    )
  })
})

describe('journal publication: protected surfaces', () => {
  it('leaves the homepage Journal selection untouched', () => {
    const home = read('src', 'app', 'page.tsx')
    for (const slug of NEW) {
      assert.ok(!home.includes(slug), `${slug} was added to the homepage`)
    }
    for (const slug of [
      'well-aging-is-not-disappearing',
      'barrier-wealth-aging-melanated-skin',
      'body-care-neglected-prestige-beauty',
    ]) {
      assert.ok(home.includes(slug), `homepage lost its entry ${slug}`)
    }
  })

  it('keeps a loader registered for every manifest entry', () => {
    const registry = read('src', 'content', 'articles', 'registry.ts')
    for (const e of entries) {
      assert.ok(registry.includes(`'${e.slug}'`), `${e.slug} has no loader`)
    }
  })
})
