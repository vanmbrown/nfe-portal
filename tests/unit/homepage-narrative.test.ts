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
    const links = (hero.match(/<Action\b/g) ?? []).length
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
    // The roles are named constants now, so the token appears once per role
    // rather than once per element.
    assert.ok((page.match(/font-primary/g) ?? []).length >= 3)
    for (const role of ['const CHAPTER', 'const SUB']) {
      assert.match(page.slice(page.indexOf(role), page.indexOf(role) + 120), /font-primary/)
    }
  })

  it('keeps the approved heading sizes', () => {
    // The token changed; the scale did not. These are the sizes the page
    // already shipped with.
    const page = homepageSource()
    assert.match(page, /font-primary text-5xl leading-\[0\.95\][^"]*md:text-7xl/)
    // One chapter scale, declared once and used by every chapter heading.
    assert.match(page, /const CHAPTER = 'mt-5 font-primary text-4xl leading-tight md:text-5xl'/)
    const stripped = stripComments(page)
    assert.ok(
      (stripped.match(/\{CHAPTER\}/g) ?? []).length >= 8,
      'every chapter heading uses the one scale'
    )
  })
})

describe('homepage mobile parity', () => {
  it('gives every control a 44px box that a border cannot change', () => {
    const page = homepageSource()
    const base = page.slice(page.indexOf('const CONTROL_BASE'), page.indexOf('const CONTROL_TONE'))
    assert.match(base, /min-h-\[44px\]/)
    assert.match(base, /\bborder\b/)
    assert.match(base, /rounded-sm/)
    const tone = page.slice(page.indexOf('const CONTROL_TONE'), page.indexOf('function Action'))
    assert.equal(
      (tone.match(/border-transparent/g) ?? []).length,
      2,
      'both filled tiers carry a transparent border so heights match'
    )
    const textAction = page.slice(page.indexOf('function TextAction'), page.indexOf('export default'))
    assert.match(textAction, /min-h-\[44px\]/)
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


/* ------------------------------------------------------------------ *
 * Phase C: the consistency system
 * ------------------------------------------------------------------ */

describe('homepage control system', () => {
  it('retires the pill', () => {
    const page = stripComments(homepageSource())
    assert.ok(!page.includes('rounded-full'), 'no rounded-full control remains')
    assert.match(homepageSource(), /const CONTROL_BASE[\s\S]{0,400}rounded-sm/)
  })

  it('carries exactly three control tiers and no more', () => {
    const page = homepageSource()
    const tone = page.slice(page.indexOf('const CONTROL_TONE'), page.indexOf('function Action'))
    const keys = tone.match(/'(primary|secondary)-(light|dark)'/g) ?? []
    assert.equal(keys.length, 4, 'two tiers x two grounds')
    assert.ok(page.includes('function TextAction'))
    assert.ok(!page.includes('function MaisonLink'), 'the old four-variant control is gone')
    assert.ok(!page.includes('function QuietLink'))
  })

  it('uses one control typography everywhere', () => {
    const page = homepageSource()
    const base = page.slice(page.indexOf('const CONTROL_BASE'), page.indexOf('const CONTROL_TONE'))
    const textAction = page.slice(page.indexOf('function TextAction'), page.indexOf('export default'))
    for (const source of [base, textAction]) {
      assert.match(source, /text-sm/)
      assert.match(source, /font-medium/)
      assert.match(source, /tracking-\[0\.18em\]/)
    }
  })

  it('gives gold a standing role on dark ground rather than one use', () => {
    const page = stripComments(homepageSource())
    // Two call sites, three rendered controls: the two elixirs share one
    // mapped call site. Either way gold is a system, not a single use.
    const gold = (page.match(/tier="primary" ground="dark"/g) ?? []).length
    assert.ok(gold >= 2, 'gold primary must be a system, found ' + gold)
    assert.match(page, /<Action href={elixir.href} tier="primary" ground="dark">/)
  })

  it('keeps focus visible on every tier', () => {
    const page = homepageSource()
    const tone = page.slice(page.indexOf('const CONTROL_TONE'), page.indexOf('function Action'))
    for (const key of ['primary-light', 'primary-dark', 'secondary-light', 'secondary-dark']) {
      const slice = tone.slice(tone.indexOf(key))
      assert.match(slice.slice(0, 320), /focus-visible:ring-/)
    }
  })
})

describe('homepage repeated labels', () => {
  const occurrences = (label: string) => {
    const page = stripComments(homepageSource())
    const re = new RegExp('<Action[^>]*>\\s*' + label + '\\s*</Action>', 'g')
    return page.match(re) ?? []
  }

  it('renders Join Founder Access the same way in both places', () => {
    const hits = occurrences('Join Founder Access')
    assert.equal(hits.length, 2, 'hero and closing')
    for (const hit of hits) {
      assert.ok(!hit.includes('tier="primary"'), 'both occurrences are the same tier')
    }
  })

  it('renders Enter The Atelier the same way in both places', () => {
    const hits = occurrences('Enter The Atelier')
    assert.equal(hits.length, 2, 'product philosophy and closing')
    for (const hit of hits) {
      assert.ok(!hit.includes('tier="primary"'))
      assert.ok(!hit.includes('ground="dark"'))
    }
  })
})

describe('homepage typography roles', () => {
  it('declares one treatment per role rather than repeating utilities', () => {
    const page = homepageSource()
    for (const token of ['const EYEBROW', 'const CHAPTER', 'const SUB', 'const LEAD', 'const BODY']) {
      assert.ok(page.includes(token), token + ' must be a named role')
    }
  })

  it('uses one section-eyebrow tracking and one hero kicker', () => {
    const page = homepageSource()
    assert.match(page, /const EYEBROW = 'text-xs uppercase tracking-\[0\.3em\]'/)
    const kicker = (page.match(/tracking-\[0\.32em\]/g) ?? []).length
    assert.equal(kicker, 1, 'the hero kicker is the only 0.32em label')
    for (const dead of ['tracking-[0.25em]', 'tracking-[0.22em]']) {
      assert.ok(!page.includes(dead), dead + ' was an unexplained eyebrow variant')
    }
  })

  it('gives the third tier one scale whatever element carries it', () => {
    const page = homepageSource()
    assert.match(page, /const SUB = 'font-primary text-2xl leading-snug md:text-3xl'/)
    const stripped = stripComments(page)
    assert.ok((stripped.match(/\{SUB\}/g) ?? []).length >= 3)
    const journal = stripped.slice(
      stripped.indexOf('nfe-journal-heading'),
      stripped.indexOf('nfe-concierge-heading')
    )
    assert.match(journal, /<h3 className=/, 'Journal titles are headings, not styled spans')
  })

  it('gives the founder lead the same colour as every other lead', () => {
    const page = stripComments(homepageSource())
    const founder = page.slice(
      page.indexOf('nfe-founder-heading'),
      page.indexOf('nfe-formulation-heading')
    )
    assert.match(founder, /LEAD\} text-nfe-ink\/75/)
    assert.ok(!founder.includes('text-nfe-muted'), 'the founder lead is no longer the odd one out')
  })
})

describe('homepage grounds and rhythm', () => {
  it('uses two grounds, not an imperceptible three', () => {
    const page = stripComments(homepageSource())
    const sections = page.match(/<section[^>]*>/g) ?? []
    const white = sections.filter((x) => /\bbg-white\b/.test(x))
    assert.deepEqual(white, [], 'nfe-paper and white measure 1.045:1 against each other')
    const dark = sections.filter((x) => /bg-nfe-green-900/.test(x))
    assert.equal(dark.length, 2, 'exactly two dark chapters')
  })

  it('uses exactly the three approved section intervals', () => {
    const page = homepageSource()
    assert.match(page, /related: 'py-16 md:py-24'/)
    assert.match(page, /movement: 'py-20 md:py-28'/)
    assert.match(page, /event: 'py-24 md:py-32'/)
    const stripped = stripComments(page)
    const inline = stripped.match(/<section[^>]*\bpy-\d+ md:py-\d+/g) ?? []
    assert.deepEqual(inline, [], 'section intervals come from the scale, not call sites')
  })

  it('does not give every section the same interval', () => {
    const page = stripComments(homepageSource())
    const used = new Set(
      (page.match(/SPACE\.(related|movement|event)/g) ?? []).map((m) => m.split('.')[1])
    )
    assert.equal(used.size, 3, 'all three tiers are actually in use')
  })
})

describe('homepage maison naming', () => {
  it('names the maison sections consistently', () => {
    const page = stripComments(homepageSource())
    for (const name of ['The Atelier', 'The Ritual', 'The Vessel', 'The Journal', 'Concierge']) {
      assert.ok(page.includes(name), name + ' must appear')
    }
    for (const wrong of ['>The ritual<', '>The vessel<', 'Enter the Atelier', 'Read the Journal<']) {
      assert.ok(!page.includes(wrong), 'inconsistent naming: ' + wrong)
    }
    assert.ok(!page.includes('The Concierge'), 'Concierge takes no article')
  })

  it('names the vessel action after its destination', () => {
    const page = stripComments(homepageSource())
    assert.ok(!page.includes('Continue the ritual'), 'that label described a ritual, not an article')
    assert.match(page, /Read the refill note/)
    const vessel = page.slice(
      page.indexOf('nfe-vessel-heading'),
      page.indexOf('nfe-journal-heading')
    )
    assert.match(vessel, /\/articles\/refill-culture-quiet-sustainable-luxury/)
  })
})

describe('homepage layout stability', () => {
  it('keeps the hero metadata row on the control tracking', () => {
    // Not cosmetic. At 0.3em the three items sit on their flex-wrap threshold,
    // so the row wrapped under fallback metrics and unwrapped when Inter
    // loaded. Measured, that reflow took desktop CLS from 0.0036 to 0.0692.
    const page = stripComments(homepageSource())
    const hero = page.slice(page.indexOf('<h1'), page.indexOf('id="brand-thesis"'))
    const meta = hero.slice(hero.indexOf('Barrier comfort') - 400, hero.indexOf('Barrier comfort'))
    assert.match(meta, /tracking-\[0\.18em\]/)
    assert.ok(!meta.includes('tracking-[0.3em]'), 'widening this row reintroduces the shift')
  })
})

/* ------------------------------------------------------------------ *
 * Founder review: Atelier copy and action semantics
 * ------------------------------------------------------------------ */

describe('atelier heading', () => {
  it('carries the founder-approved wording', () => {
    const page = stripComments(homepageSource())
    assert.match(page, /Two elixirs\. One considered philosophy\./)
    assert.ok(!page.includes('Two considered objects'), 'the prior heading is gone')
    // "elixirs" is the approved noun; no synonym substitution.
    for (const wrong of ['Two formulations', 'Two products', 'Two objects']) {
      assert.ok(!page.includes(wrong), `must not say "${wrong}"`)
    }
  })

  it('keeps the heading at the chapter level and scale', () => {
    const page = stripComments(homepageSource())
    const atelier = page.slice(page.indexOf('nfe-elixirs-heading'), page.indexOf('nfe-science-heading'))
    // h2, the shared CHAPTER scale, gold on the dark ground: all unchanged.
    assert.match(atelier, /<h2 id="nfe-elixirs-heading" className=\{`\$\{CHAPTER\} text-nfe-gold`\}>/)
  })
})

describe('homepage action semantics', () => {
  /** Every <Action> call site with its href, tier and ground. */
  const actions = () => {
    const page = stripComments(homepageSource())
    return Array.from(page.matchAll(/<Action\s+href=(?:"([^"]+)"|\{([^}]+)\})([^>]*)>\s*([^<]*?)\s*</g), (m) => ({
      href: m[1] ?? m[2],
      tier: /tier="primary"/.test(m[3]) ? 'primary' : 'secondary',
      ground: /ground="dark"/.test(m[3]) ? 'dark' : 'light',
      label: m[4].trim(),
    }))
  }
  const textActions = () => {
    const page = stripComments(homepageSource())
    return Array.from(page.matchAll(/<TextAction\s+href="([^"]+)"[^>]*>\s*([^<]*?)\s*</g), (m) => ({
      href: m[1],
      label: m[2].trim(),
    }))
  }

  it('gives The Ritual a principal action on its light ground', () => {
    const ritual = actions().find((a) => a.href === '/ritual')
    assert.ok(ritual, 'the Ritual action must exist')
    assert.equal(ritual.tier, 'primary', 'The Ritual is a principal maison experience')
    assert.equal(ritual.ground, 'light')
  })

  it('keeps Science as a principal action on its light ground', () => {
    const science = actions().find((a) => a.href === '/science')
    assert.ok(science)
    assert.equal(science.tier, 'primary')
    assert.equal(science.ground, 'light')
  })

  it('keeps both elixirs as equal principal actions on the dark ground', () => {
    const page = stripComments(homepageSource())
    // One mapped call site serves both products, which is what makes them equal.
    assert.match(page, /<Action href=\{elixir\.href\} tier="primary" ground="dark">/)
    assert.equal(
      (page.match(/<Action href=\{elixir\.href\}/g) ?? []).length,
      1,
      'both products render from one call site, so neither can drift above the other'
    )
  })

  it('keeps Concierge on the same dark-ground primary as the elixirs', () => {
    const concierge = actions().find((a) => a.href === '/concierge')
    assert.ok(concierge)
    assert.equal(concierge.tier, 'primary')
    assert.equal(concierge.ground, 'dark')
  })

  it('routes every reading destination through the one editorial treatment', () => {
    const reading = textActions()
    const hrefs = reading.map((r) => r.href)
    assert.ok(hrefs.includes('/skin-ritual-quiz'), 'the quiz is a supporting path')
    assert.ok(
      hrefs.some((h) => h.startsWith('/articles/')),
      'the refill note is reading, not a product entrance'
    )
    // None of these may be boxed.
    const boxed = actions().map((a) => a.href)
    for (const href of hrefs) {
      assert.ok(!boxed.includes(href), `${href} must not also render as a boxed control`)
    }
  })

  it('keeps the refill note pointing at the approved article', () => {
    const refill = textActions().find((r) => r.href.startsWith('/articles/'))
    assert.ok(refill, 'a reading destination must exist')
    assert.equal(refill.href, '/articles/refill-culture-quiet-sustainable-luxury')
    assert.equal(refill.label, 'Read the refill note')
  })

  it('leaves outlined controls only in the hero and closing hierarchies', () => {
    // Everything still secondary must be a documented subordinate action:
    // the hero pair and the closing pair, plus the two single-action sections
    // reported to the founder rather than changed unilaterally.
    const secondary = actions().filter((a) => a.tier === 'secondary').map((a) => a.href).sort()
    assert.deepEqual(secondary, [
      '/founder-access', '/founder-access', '/journal', '/our-story', '/shop', '/shop',
    ])
  })

  it('never gives one label two treatments', () => {
    const seen: Record<string, string> = {}
    for (const a of [...actions()]) {
      const key = a.label + '|' + a.href
      const treatment = a.tier + '-' + a.ground
      if (seen[key] && seen[key] !== treatment) {
        assert.fail(`${a.label} renders as both ${seen[key]} and ${treatment}`)
      }
      seen[key] = treatment
    }
  })
})

describe('editorial link treatment', () => {
  it('gives every reading destination the same at-rest rule', () => {
    const page = homepageSource()
    // The two short text actions use the shared TextAction component.
    const textAction = page.slice(page.indexOf('function TextAction'), page.indexOf('export default'))
    assert.match(textAction, /border-b border-current/)
    // The Journal titles are headings that link. They keep their scale but
    // carry the same rule, so a reading destination always looks like one.
    const stripped = stripComments(page)
    const journal = stripped.slice(
      stripped.indexOf('nfe-journal-heading'),
      stripped.indexOf('nfe-concierge-heading')
    )
    assert.match(journal, /<span className="border-b border-current pb-1">/)
    assert.ok(
      !journal.includes('hover:underline'),
      'the rule is present at rest, not summoned by hover'
    )
  })

  it('keeps the Journal titles at the sub-tier heading scale', () => {
    // Normalising them down to control text would delete a type role.
    const page = stripComments(homepageSource())
    const journal = page.slice(page.indexOf('nfe-journal-heading'), page.indexOf('nfe-concierge-heading'))
    assert.match(journal, /<h3 className=\{`\$\{SUB\} text-nfe-green-900`\}>/)
  })
})
