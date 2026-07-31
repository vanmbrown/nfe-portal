import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const src = (path: string) => join(process.cwd(), 'src', path)
const homepageSource = () => readFileSync(src('app/page.tsx'), 'utf8')

/**
 * Strips comments before scanning. The homepage documents what it deliberately
 * does not do, so a raw scan would flag the explanation as the offence.
 */
const stripComments = (source: string) =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')

/** Index of each section, in render order, by its aria-labelledby id. */
const sectionOrder = () => {
  const page = homepageSource()
  return [
    'hero',
    'nfe-thesis-heading',
    'nfe-founder-heading',
    'nfe-formulation-heading',
    'nfe-elixirs-heading',
    'nfe-science-heading',
    'nfe-ritual-heading',
    'nfe-vessel-heading',
    'nfe-journal-heading',
    'nfe-concierge-heading',
    'nfe-closing-heading',
  ].map((id) => ({
    id,
    at: id === 'hero' ? page.indexOf('{/* 1 ') : page.indexOf(`id="${id}"`),
  }))
}

describe('homepage narrative order', () => {
  it('renders the approved sequence, philosophy before product', () => {
    const order = sectionOrder()
    for (const section of order) {
      assert.ok(section.at > -1, `${section.id} must be present`)
    }
    for (let i = 1; i < order.length; i += 1) {
      assert.ok(
        order[i].at > order[i - 1].at,
        `${order[i].id} must follow ${order[i - 1].id}`
      )
    }
  })

  it('puts the brand thesis and the founder ahead of the elixirs', () => {
    const at = Object.fromEntries(sectionOrder().map((s) => [s.id, s.at]))
    assert.ok(at['nfe-thesis-heading'] < at['nfe-elixirs-heading'])
    assert.ok(at['nfe-founder-heading'] < at['nfe-elixirs-heading'])
    // and the thesis leads the founder, not the other way round
    assert.ok(at['nfe-thesis-heading'] < at['nfe-founder-heading'])
  })

  it('introduces the elixirs before Science, and Science before the closing', () => {
    const at = Object.fromEntries(sectionOrder().map((s) => [s.id, s.at]))
    assert.ok(at['nfe-elixirs-heading'] < at['nfe-science-heading'])
    assert.ok(at['nfe-science-heading'] < at['nfe-closing-heading'])
  })

  it('no longer renders the four removed sections', () => {
    const page = stripComments(homepageSource())
    for (const gone of [
      'Three ways to enter NFE',
      'Through the Maison',
      'Continue into the maison',
      'Customer Proof In Progress',
      'Building evidence without overclaiming',
      'Begin with fit, not pressure',
    ]) {
      assert.ok(!page.includes(gone), `"${gone}" must no longer render`)
    }
  })
})

describe('homepage destinations', () => {
  const hrefs = () => {
    const page = stripComments(homepageSource())
    return Array.from(page.matchAll(/href=(?:"([^"]+)"|\{`([^`]+)`\})/g), (m) =>
      (m[1] ?? m[2]).replace(/\$\{[^}]+\}/, ':slug')
    )
  }

  it('sends the Science invitation to the whole experience, not an anchor', () => {
    const page = stripComments(homepageSource())
    assert.ok(page.includes('href="/science"'), 'Science CTA must point at /science')
    assert.ok(
      !page.includes('/science#'),
      'the homepage must not link into a Science sub-anchor'
    )
    assert.match(page, /Explore the NFE Science Map/)
  })

  it('uses the canonical product routes', () => {
    const page = stripComments(homepageSource())
    assert.ok(page.includes('/products/face-elixir'))
    assert.ok(page.includes('/products/body-elixir'))
    // the short forms are not real routes in this repository
    assert.ok(!/href="\/face-elixir"/.test(page))
    assert.ok(!/href="\/body-elixir"/.test(page))
  })

  it('keeps the Journal, Concierge and Ritual destinations', () => {
    const all = hrefs()
    for (const href of ['/journal', '/concierge', '/ritual', '/shop', '/our-story']) {
      assert.ok(all.includes(href), `${href} must remain reachable`)
    }
  })

  it('leaves no orphaned link from the removed sections', () => {
    const all = hrefs()
    // The quiz survived the removal of its conversion slab.
    assert.ok(all.includes('/skin-ritual-quiz'), 'the quiz must remain reachable')
  })
})

describe('homepage call-to-action discipline', () => {
  it('shows Founder Access exactly twice: hero and closing', () => {
    const page = stripComments(homepageSource())
    const count = (page.match(/\/founder-access/g) ?? []).length
    assert.equal(count, 2, 'Founder Access appears in the hero and the closing only')
  })

  it('leads the hero with the philosophy, not with lead capture', () => {
    const page = stripComments(homepageSource())
    const hero = page.slice(page.indexOf('<h1'), page.indexOf('id="brand-thesis"'))
    const philosophy = hero.indexOf('Discover the Philosophy')
    const founder = hero.indexOf('Join Founder Access')
    assert.ok(philosophy > -1 && founder > -1, 'both hero actions must be present')
    assert.ok(philosophy < founder, 'the philosophy action must come first')
    assert.ok(hero.includes('href="#brand-thesis"'), 'it anchors to the thesis')
  })

  it('adds no third hero action and no purchase control', () => {
    const page = stripComments(homepageSource())
    const hero = page.slice(page.indexOf('<h1'), page.indexOf('id="brand-thesis"'))
    const links = (hero.match(/<MaisonLink|<QuietLink|<Link/g) ?? []).length
    assert.equal(links, 2, 'the hero carries exactly two actions')
    for (const banned of ['Add to cart', 'Buy now', 'Shop now', 'Best seller']) {
      assert.ok(!page.includes(banned), `the homepage must not use "${banned}"`)
    }
  })
})

describe('homepage typography', () => {
  it('uses the brand serif token, never the generic one', () => {
    const page = homepageSource()
    assert.ok(
      !page.includes('font-serif'),
      'font-serif resolves to ui-serif and renders Times on Windows'
    )
    assert.ok((page.match(/font-primary/g) ?? []).length >= 10)
  })

  it('keeps the approved heading sizes', () => {
    // The token changed; the scale did not. These are the sizes the page
    // already shipped with.
    const page = homepageSource()
    assert.match(page, /font-primary text-5xl leading-\[0\.95\][^"]*md:text-7xl/)
    assert.ok(
      (page.match(/font-primary text-4xl leading-tight[^"]*md:text-5xl/g) ?? []).length >= 8,
      'section headings stay at 4xl/5xl'
    )
  })
})

describe('homepage mobile parity', () => {
  it('gives both product actions a 44px touch target', () => {
    const page = homepageSource()
    // QuietLink is the shared control both product links use.
    const quiet = page.slice(page.indexOf('function QuietLink'), page.indexOf('export default'))
    assert.match(quiet, /min-h-\[44px\]/)
    assert.match(quiet, /inline-flex/)
    const stripped = stripComments(page)
    assert.match(stripped, /<QuietLink href=\{elixir\.href\} tone="gold">/)
  })

  it('states a mobile value wherever the hero sets a desktop one', () => {
    const page = stripComments(homepageSource())
    const hero = page.slice(page.indexOf('<section className="grid bg-'), page.indexOf('id="brand-thesis"'))
    // Every md: spacing override in the hero must have an unprefixed partner,
    // so mobile is a decision rather than an inheritance.
    for (const pair of ['md:mb-5', 'md:mt-8', 'md:mt-5', 'md:mt-10', 'md:py-20']) {
      assert.ok(hero.includes(pair), `hero must set ${pair} explicitly`)
    }
    assert.ok(hero.includes('py-10'), 'and a smaller mobile padding beneath it')
  })

  it('keeps every section on mobile', () => {
    // Nothing may be hidden below a breakpoint: the mobile page carries the
    // same eleven narrative sections as desktop.
    const page = stripComments(homepageSource())
    // Standalone `hidden` only. `overflow-hidden` is not a display utility, and
    // a hyphen counts as a word boundary, so \b would match inside it.
    const classLists = Array.from(page.matchAll(/className="([^"]*)"/g), (m) => m[1])
    const hiddenOnMobile = classLists.filter((list) => {
      const classes = list.split(/\s+/)
      if (!classes.includes('hidden')) return false
      // acceptable only when a breakpoint brings it back
      return !classes.some((c) => /^(sm|md|lg|xl):(block|flex|grid|inline-flex)$/.test(c))
    })
    assert.deepEqual(hiddenOnMobile, [], 'nothing may be hidden on mobile without returning')
    assert.equal((page.match(/aria-labelledby="nfe-/g) ?? []).length, 10)
  })

  it('uses one editorial spine rather than per-section offsets', () => {
    const page = homepageSource()
    assert.match(page, /const SHELL = 'mx-auto max-w-6xl'/)
    const stripped = stripComments(page)
    // Class-boundary matching: `scroll-mt-24` legitimately contains "-mt-",
    // and it is an anchor offset, not an alignment hack.
    assert.ok(
      !/(^|["'\s])-m[trblxy]?-/.test(stripped),
      'no negative-margin alignment'
    )
    for (const banned of ['ml-[', 'translate-x-']) {
      assert.ok(!stripped.includes(banned), `no one-off offset: ${banned}`)
    }
  })
})

describe('homepage language and claims', () => {
  it('uses no prohibited or anti-aging language', () => {
    const page = homepageSource().toLowerCase()
    for (const banned of [
      'miracle', 'magic', 'game-changing', 'anti-aging', 'age-defying',
      'flawless', 'perfect skin', 'glow-up', 'obsessed', 'viral',
      'must-have', 'holy grail', 'reverse aging', 'erase wrinkles',
      'fight aging', 'youthful glow', 'ageless', 'boss babe',
      'wellness hack', 'affordable luxury',
    ]) {
      assert.ok(!page.includes(banned), `the homepage must not use "${banned}"`)
    }
  })

  it('renders no em dash', () => {
    const page = stripComments(homepageSource())
    assert.ok(!page.includes('—'), 'homepage copy must not use an em dash')
  })

  it('keeps the vessel section inside its confirmed scope', () => {
    const page = stripComments(homepageSource())
    const vessel = page.slice(page.indexOf('id="nfe-vessel-heading"'), page.indexOf('id="nfe-journal-heading"'))
    assert.match(vessel, /building toward fewer, better objects and refill-minded/)
    assert.match(vessel, /editorial for now/)
    // Nothing beyond what the Atelier already states in shipped copy.
    for (const unsupported of [
      'subscription', 'subscribe', 'free shipping', 'save ', 'discount',
      '% less', 'every 30', 'monthly', 'carbon', 'plastic saved',
    ]) {
      assert.ok(
        !vessel.toLowerCase().includes(unsupported),
        `the vessel section must not claim "${unsupported}"`
      )
    }
  })

  it('keeps the required cosmetic disclaimer', () => {
    assert.match(homepageSource(), /not intended to\s+diagnose, treat, cure, or prevent disease/)
  })
})

describe('homepage leaves Science alone', () => {
  it('imports no Science component and reproduces no Science interaction', () => {
    const page = homepageSource()
    for (const banned of [
      'ScienceMapExperience', 'SkinLayerSchematic', 'SkinProfileBuilder',
      'LayerContextPanels', 'ConcernFormulaMatrix', 'LayerScienceModule',
      '@/content/science', 'PATHWAYS', 'use client',
    ]) {
      assert.ok(!page.includes(banned), `the homepage must not pull in ${banned}`)
    }
  })
})
