import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

/**
 * Guards the founder decision that the maison's six tabs stop occupying the
 * top of every phone screen and retire behind a single mark.
 *
 * Source-level assertions, in the style of the other suites here: the
 * behaviours being protected are structural — which element carries the
 * disclosure, which breakpoint each nav belongs to, which close paths exist —
 * and each one fails loudly if a later change quietly removes it.
 */

const root = process.cwd()
const read = (...p: string[]) => readFileSync(join(root, ...p), 'utf8')

const header = () => read('src', 'components', 'layout', 'Header.tsx')
const mobile = () => read('src', 'components', 'layout', 'MobileNav.tsx')
const primary = () => read('src', 'components', 'layout', 'PrimaryNav.tsx')
const items = () => read('src', 'components', 'layout', 'navItems.ts')

/** First capture group of every match, without spreading an iterator: the
 *  suite's TS target predates downlevel iteration. */
function collect(source: string, pattern: RegExp): string[] {
  const out: string[] = []
  const re = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`)
  let match: RegExpExecArray | null
  while ((match = re.exec(source)) !== null) out.push(match[1])
  return out
}

const APPROVED = [
  'Philosophy',
  'The Atelier',
  'Science',
  'Ritual',
  'Journal',
  'Concierge',
]

describe('mobile navigation: one list, two presentations', () => {
  it('keeps the six approved labels in the founder-approved order', () => {
    const source = items()
    const found = collect(source, /label:\s*'([^']+)'/g)
    assert.deepEqual(
      found.slice(0, APPROVED.length),
      APPROVED,
      'the primary navigation labels or their order changed'
    )
  })

  it('holds Founder Access apart from the primary tabs', () => {
    const source = items()
    assert.match(source, /secondaryNavItem/, 'no secondary item is declared')
    const navBlock = source.slice(
      source.indexOf('export const navItems'),
      source.indexOf('secondaryNavItem')
    )
    assert.ok(
      !navBlock.includes('Founder Access'),
      'Founder Access was promoted into the primary tab row'
    )
  })

  it('reads both navigations from the same list', () => {
    assert.match(primary(), /from '\.\/navItems'/, 'desktop nav has its own copy')
    assert.match(mobile(), /from '\.\/navItems'/, 'mobile nav has its own copy')
  })
})

describe('mobile navigation: the header collapses below md', () => {
  it('hides the tab row below md and shows it from md up', () => {
    assert.match(
      header(),
      /className="hidden md:block lg:-translate-x-14"/,
      'the desktop tab row is no longer gated to md and up'
    )
  })

  it('scopes the drawer to below md', () => {
    assert.match(mobile(), /className="md:hidden"/, 'the mark is not hidden from md up')
  })

  it('no longer stacks the navigation under the wordmark', () => {
    const source = header()
    const row = source.slice(source.indexOf('<div className="flex'), source.indexOf('</header>'))
    assert.ok(
      !row.includes('flex-col'),
      'the header still stacks, which is what consumed the arrival'
    )
  })

  it('keeps the wordmark and the lg grid exactly as they were', () => {
    const source = header()
    assert.match(source, /aria-label="NFE Beauty — home"/, 'the wordmark link changed')
    assert.match(
      source,
      /lg:grid lg:grid-cols-\[minmax\(5rem,1fr\)_auto_minmax\(5rem,1fr\)\]/,
      'the desktop grid changed'
    )
  })

  it('splits by CSS, not by JavaScript, so no desktop row flashes on a phone', () => {
    assert.ok(
      !header().includes('use client'),
      'the header became a client component; the split must stay CSS-only'
    )
    assert.ok(
      !mobile().includes('useMediaQuery') && !mobile().includes('window.matchMedia'),
      'the drawer decides its own breakpoint in JS, which flashes during hydration'
    )
  })
})

describe('mobile navigation: the disclosure is operable', () => {
  it('uses a real button carrying the full disclosure contract', () => {
    const source = mobile()
    assert.match(source, /type="button"/, 'not a semantic button')
    assert.match(source, /aria-label="Open navigation"/, 'no aria-label on the mark')
    assert.match(source, /aria-expanded=\{open\}/, 'no aria-expanded')
    assert.match(source, /aria-controls=\{PANEL_ID\}/, 'no aria-controls')
  })

  it('gives the two marks distinct names so neither is ambiguous to announce', () => {
    const source = mobile()
    const opens = source.match(/aria-label="Open navigation"/g) ?? []
    const closes = source.match(/aria-label="Close navigation"/g) ?? []
    assert.equal(opens.length, 1, 'more than one control announces as "Open navigation"')
    assert.equal(closes.length, 1, 'more than one control announces as "Close navigation"')
    assert.ok(
      !/aria-label=\{open \?/.test(source),
      'the mark renames itself by state, which collides with the close mark'
    )
  })

  it('points aria-controls at a panel that is always in the document', () => {
    const source = mobile()
    assert.match(source, /const PANEL_ID = '[a-z-]+'/, 'no stable panel id')
    assert.match(source, /id=\{PANEL_ID\}/, 'the panel does not carry the id')
    // A conditionally rendered panel leaves aria-controls dangling while closed.
    assert.ok(
      !/\{open && \(/.test(source),
      'the panel is conditionally rendered, so aria-controls dangles when closed'
    )
    assert.match(
      source,
      /'visible translate-x-0' : 'invisible translate-x-full'/,
      'the panel is not hidden by visibility, so its links stay in the tab order'
    )
  })

  it('gives the mark a 44px touch target', () => {
    const source = mobile()
    const marks = source.match(/h-11 w-11/g) ?? []
    assert.ok(marks.length >= 2, 'the open and close marks are not both 44x44')
  })

  it('closes on every path the founder asked for', () => {
    const source = mobile()
    assert.match(source, /event\.key === 'Escape'/, 'Escape does not close it')
    assert.match(source, /onClick=\{\(\) => setOpen\(false\)\}/, 'no tap-to-close target')
    assert.match(source, /aria-label="Close navigation"/, 'no close mark')
    assert.match(source, /\}, \[pathname\]\)/, 'choosing a destination does not close it')
  })

  it('manages focus in and out of the drawer', () => {
    const source = mobile()
    assert.match(source, /closeRef\.current\?\.focus\(\)/, 'focus does not enter the drawer')
    assert.match(source, /toggleRef\.current\?\.focus\(\)/, 'focus does not return to the mark')
    assert.match(source, /event\.key !== 'Tab'/, 'no focus trap')
  })

  it('holds the page still without shifting it', () => {
    const source = mobile()
    assert.match(source, /body\.style\.overflow = 'hidden'/, 'the page scrolls behind it')
    assert.match(
      source,
      /window\.innerWidth - document\.documentElement\.clientWidth/,
      'no scrollbar gutter compensation, so opening it shifts the layout'
    )
    assert.match(source, /body\.style\.overflow = previousOverflow/, 'the lock is never released')
  })

  it('makes each destination a full-width target and marks the current one', () => {
    const source = mobile()
    assert.match(source, /className=\{`block py-4/, 'links are not block-level targets')
    assert.match(source, /aria-current=\{current \? 'page' : undefined\}/, 'no current page')
  })
})
