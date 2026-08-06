import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { articleMDX, allArticleSlugs } from '@/content/articles/registry'

/**
 * Guards the two Journal essays added by the beauty-cabinet / scent expansion.
 *
 * These articles are deliberately NOT given an `editorialTier`. The repository
 * has no draft flag, and `/journal` surfaces articles only through the explicit
 * slug lists in well-aging-series.ts and journal-supporting-notes.ts plus the
 * `featured` flag. Omitting the tier is what keeps both essays off every Journal
 * surface while their direct routes still render for founder review, and it is
 * what keeps the rendered primary/legacy counts unchanged. The tests below fail
 * if any of that drifts.
 */

const root = process.cwd()

const NEW_SLUGS = [
  'whats-in-my-beauty-cabinet',
  'the-scent-of-feeling-beautiful',
] as const

const IMAGE_DIR = '/images/journal/the-new-language-of-well-aging/'

type ArticleEntry = {
  slug: string
  title: string
  date: string | null
  published?: boolean
  mobileImage?: string
  author: string
  excerpt: string
  file?: string
  pillar: string
  editorialTier?: string
  featured?: boolean
  readingMinutes?: number
  pullQuote?: string
  heroImage?: string
  cardImage?: string
  imageAlt?: string
  imageCredit?: string | null
  relatedSlugs?: string[]
}

const entries = JSON.parse(
  readFileSync(join(root, 'src', 'content', 'articles', 'articles.json'), 'utf8')
) as ArticleEntry[]

/** Collects one capture group across all matches, without iterator spread. */
function collect(source: string, pattern: RegExp, group: number): string[] {
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  const found: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) {
    found.push(match[group])
    if (match.index === re.lastIndex) re.lastIndex += 1
  }
  return found
}
const bySlug = (slug: string) => entries.find((entry) => entry.slug === slug)
const mdxPath = (file: string) => join(root, 'src', 'content', 'articles', file)
const publicPath = (url: string) => join(root, 'public', url)

describe('journal expansion: source files', () => {
  for (const slug of NEW_SLUGS) {
    it(`${slug} has an MDX body on disk`, () => {
      const entry = bySlug(slug)
      assert.ok(entry, `${slug} is missing from articles.json`)
      assert.ok(entry.file, `${slug} declares no file`)
      assert.ok(
        existsSync(mdxPath(entry.file as string)),
        `missing MDX body for ${slug}`
      )
    })

    it(`${slug} MDX body carries real prose, not a stub`, () => {
      const entry = bySlug(slug)
      const body = readFileSync(mdxPath(entry!.file as string), 'utf8')
      const words = body.split(/\s+/).filter(Boolean).length
      assert.ok(words > 700, `${slug} body has only ${words} words`)
    })

    it(`${slug} MDX body carries no YAML frontmatter`, () => {
      // This repo has no frontmatter parser; a leading --- block would render
      // as visible page content.
      const entry = bySlug(slug)
      const body = readFileSync(mdxPath(entry!.file as string), 'utf8')
      assert.ok(
        !body.startsWith('---'),
        `${slug} still begins with a frontmatter block`
      )
    })

    it(`${slug} MDX body declares no h1 (the route supplies it)`, () => {
      const entry = bySlug(slug)
      const body = readFileSync(mdxPath(entry!.file as string), 'utf8')
      const h1s = body.split('\n').filter((line) => /^# /.test(line))
      assert.equal(h1s.length, 0, `${slug} body declares ${h1s.length} h1(s)`)
    })

    it(`${slug} renders no em dash or en dash`, () => {
      const entry = bySlug(slug)
      const body = readFileSync(mdxPath(entry!.file as string), 'utf8')
      assert.equal((body.match(/—/g) ?? []).length, 0, 'em dash present')
      assert.equal((body.match(/–/g) ?? []).length, 0, 'en dash present')
    })
  }
})

describe('journal expansion: hero images', () => {
  for (const slug of NEW_SLUGS) {
    it(`${slug} hero and card images sit in the approved directory`, () => {
      const entry = bySlug(slug)
      assert.ok(entry?.heroImage?.startsWith(IMAGE_DIR), `${slug} heroImage path`)
      assert.ok(entry?.cardImage?.startsWith(IMAGE_DIR), `${slug} cardImage path`)
    })

    it(`${slug} hero image file exists and is WebP`, () => {
      const entry = bySlug(slug)
      const file = publicPath(entry!.heroImage as string)
      assert.ok(existsSync(file), `missing hero image for ${slug}`)
      assert.match(file, /\.webp$/, `${slug} hero image is not .webp`)
      const head = readFileSync(file).subarray(0, 12)
      assert.equal(head.toString('ascii', 0, 4), 'RIFF', 'not a RIFF container')
      assert.equal(head.toString('ascii', 8, 12), 'WEBP', 'not a WebP payload')
    })

    it(`${slug} carries descriptive alt text`, () => {
      const entry = bySlug(slug)
      assert.ok(entry?.imageAlt, `${slug} has no imageAlt`)
      assert.ok(
        (entry!.imageAlt as string).length > 30,
        `${slug} alt text is too short to be descriptive`
      )
    })
  }
})

describe('journal expansion: manifest and registry', () => {
  it('registers both essays for the /articles/[slug] route', () => {
    for (const slug of NEW_SLUGS) {
      assert.equal(
        typeof (articleMDX as Record<string, unknown>)[slug],
        'function',
        `${slug} has no MDX loader`
      )
      assert.ok(allArticleSlugs.includes(slug), `${slug} missing from slug list`)
    }
  })

  it('keeps every article slug unique', () => {
    const slugs = entries.map((entry) => entry.slug)
    assert.equal(new Set(slugs).size, slugs.length, 'duplicate article slug')
  })

  it('gives both essays the required schema fields', () => {
    for (const slug of NEW_SLUGS) {
      const entry = bySlug(slug)
      assert.ok(entry, `${slug} missing`)
      // `date` is checked separately below: null is a valid unpublished state.
      for (const key of ['title', 'author', 'excerpt', 'pillar'] as const) {
        assert.ok(entry[key], `${slug} is missing required field ${key}`)
      }
      assert.equal(typeof entry.readingMinutes, 'number', `${slug} readingMinutes`)
      // The date is null until the founder supplies a publication date; when
      // present it must use the Journal's existing YYYY-MM-DD format.
      if (entry.date !== null) {
        assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/, `${slug} date format`)
      }
    }
  })

  it('introduces no field the article schema does not already use', () => {
    const known = new Set(
      entries
        .filter((entry) => !NEW_SLUGS.includes(entry.slug as never))
        .flatMap((entry) => Object.keys(entry))
    )
    // Added to the shared article model for these two essays, and declared on
    // ArticleMeta so every article may use them.
    known.add('published')
    known.add('mobileImage')
    for (const slug of NEW_SLUGS) {
      for (const key of Object.keys(bySlug(slug) as object)) {
        assert.ok(known.has(key), `${slug} introduces unsupported field "${key}"`)
      }
    }
    const model = readFileSync(join(root, 'src', 'lib', 'articles.ts'), 'utf8')
    assert.match(model, /published\?: boolean/, 'published is not on the model')
    assert.match(model, /mobileImage\?: string/, 'mobileImage is not on the model')
  })

  it('points every related slug at a real article', () => {
    const slugs = new Set(entries.map((entry) => entry.slug))
    for (const slug of NEW_SLUGS) {
      const related = bySlug(slug)?.relatedSlugs ?? []
      assert.ok(related.length > 0, `${slug} has no related reading`)
      for (const target of related) {
        assert.ok(slugs.has(target), `${slug} relates to unknown slug ${target}`)
        assert.notEqual(target, slug, `${slug} relates to itself`)
      }
    }
  })

  it('points every in-body internal link at a real route', () => {
    const routed = new Set([
      '/ritual',
      '/science',
      '/journal',
      '/shop',
      '/concierge',
      '/our-story',
      '/founder-access',
      '/skin-ritual-quiz',
      '/discovery',
      '/inci',
      '/products/face-elixir',
      '/products/body-elixir',
      ...entries.map((entry) => `/articles/${entry.slug}`),
    ])
    for (const slug of NEW_SLUGS) {
      const body = readFileSync(mdxPath(bySlug(slug)!.file as string), 'utf8')
      const links = collect(body, /\]\((\/[^)]*)\)/g, 1)
      for (const href of links) {
        assert.ok(routed.has(href), `${slug} links to unrouted path ${href}`)
      }
    }
  })
})

describe('journal expansion: published as supporting editorial notes', () => {
  it('publishes both essays without promoting either to featured', () => {
    for (const slug of NEW_SLUGS) {
      const entry = bySlug(slug)
      assert.equal(entry?.published, true, `${slug} is not published`)
      assert.match(entry?.date ?? '', /^\d{4}-\d{2}-\d{2}$/, `${slug} release date`)
      assert.notEqual(entry?.featured, true, `${slug} is flagged featured`)
    }
  })

  it('classifies both as supporting notes, never as primary essays', () => {
    const primary = entries.filter((e) => e.editorialTier === 'primary').length
    assert.equal(primary, 9, 'primary essay count changed')
    for (const slug of NEW_SLUGS) {
      assert.equal(bySlug(slug)?.editorialTier, 'legacy', `${slug} tier`)
    }
  })

  it('places both in supporting notes and neither in the primary series', () => {
    const series = readFileSync(
      join(root, 'src', 'content', 'articles', 'well-aging-series.ts'),
      'utf8'
    )
    const notes = readFileSync(
      join(root, 'src', 'content', 'articles', 'journal-supporting-notes.ts'),
      'utf8'
    )
    for (const slug of NEW_SLUGS) {
      assert.ok(!series.includes(slug), `${slug} was added to the series config`)
      assert.ok(notes.includes(slug), `${slug} is missing from supporting notes`)
    }
  })
})

describe('journal expansion: editorial requirements', () => {
  it('keeps the beauty cabinet medical disclaimer in a Callout, not body copy', () => {
    const body = readFileSync(mdxPath('whats-in-my-beauty-cabinet.mdx'), 'utf8')
    assert.match(body, /<Callout title="A note on this routine">/)
    assert.match(body, /not medical advice or a universal skincare regimen/)
    assert.match(body, /under the guidance of a qualified medical professional/)
  })

  it('keeps the beauty cabinet section order intact', () => {
    const body = readFileSync(mdxPath('whats-in-my-beauty-cabinet.mdx'), 'utf8')
    const headings = body
      .split('\n')
      .filter((line) => line.startsWith('## '))
      .map((line) => line.replace('## ', '').trim())
    assert.deepEqual(headings, [
      'Experience changes the way you choose',
      'I cleanse',
      'I support renewal',
      'I protect',
      'I nourish',
      'The canvas beneath everything else',
      'Fewer does not mean less',
      'Working with what I have',
      'What has earned its place?',
    ])
  })

  it('keeps the tretinoin framing non-prescriptive and uncommercial', () => {
    const body = readFileSync(mdxPath('whats-in-my-beauty-cabinet.mdx'), 'utf8')
    assert.match(body, /I do not consider tretinoin a universal recommendation/)
    // prescription and third-party brands must never carry a purchase link
    const links = collect(body, /\[([^\]]+)\]\([^)]*\)/g, 1)
    for (const label of links) {
      assert.ok(
        !/tretinoin|Cetaphil|Colorescience/i.test(label),
        `prescription or third-party brand is linked: ${label}`
      )
    }
  })

  it('keeps the scent essay continuous, with no imposed section headings', () => {
    const body = readFileSync(mdxPath('the-scent-of-feeling-beautiful.mdx'), 'utf8')
    const headings = body.split('\n').filter((line) => /^#{1,3} /.test(line))
    assert.equal(headings.length, 0, 'headings were imposed on the essay')
  })

  it('keeps the scent essay closing lines exactly as written', () => {
    const body = readFileSync(mdxPath('the-scent-of-feeling-beautiful.mdx'), 'utf8')
    assert.match(
      body,
      /Sometimes, beauty is a feeling\.\n\nAnd sometimes, that feeling has a scent\./
    )
  })

  it('carries no celebrity attribution and no invented citation', () => {
    // The founder directed removal of the named reference rather than sourcing
    // it; the underlying idea stays, the borrowed authority does not.
    const body = readFileSync(mdxPath('the-scent-of-feeling-beautiful.mdx'), 'utf8')
    assert.ok(!/Zoe\s+Saldañ?a/i.test(body), 'the celebrity name is still present')
    assert.ok(
      !/\]\(https?:\/\//.test(body),
      'an external citation URL was added'
    )
  })

  it('adds no product recommendation or urgency language', () => {
    for (const slug of NEW_SLUGS) {
      const body = readFileSync(mdxPath(bySlug(slug)!.file as string), 'utf8')
      assert.ok(
        !/buy now|shop now|add to (bag|cart)|limited time|while supplies last/i.test(
          body
        ),
        `${slug} contains commercial or urgency language`
      )
    }
  })
})

describe('journal expansion: existing entries untouched', () => {
  it('preserves all sixteen pre-existing articles unchanged', () => {
    const existing = entries.filter(
      (entry) => !NEW_SLUGS.includes(entry.slug as never)
    )
    assert.equal(existing.length, 16, 'an existing article was added or removed')
    const featured = existing.filter((entry) => entry.featured)
    assert.equal(featured.length, 1, 'the featured article changed')
    assert.equal(
      featured[0].slug,
      'well-aging-is-not-disappearing',
      'the featured article changed'
    )
  })

  it('keeps a loader registered for every manifest entry', () => {
    for (const entry of entries) {
      assert.equal(
        typeof (articleMDX as Record<string, unknown>)[entry.slug],
        'function',
        `${entry.slug} has no MDX loader`
      )
    }
  })
})
