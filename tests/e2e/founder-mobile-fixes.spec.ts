import { expect, test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The two defects the founder observed on a phone, proved fixed.
 *
 * Both are checked by measurement rather than by eye. A screenshot shows what a
 * hero looked like; only the numbers show whether any of the composition was
 * thrown away, and it was exactly that difference which let a broken crop ship
 * once already.
 */

const SHOTS = join(process.cwd(), 'test-results', 'founder-mobile-fixes')
mkdirSync(SHOTS, { recursive: true })

const CABINET = '/articles/whats-in-my-beauty-cabinet'

// Every width the founder named, plus the two she wants evidence at.
const WIDTHS = [320, 360, 375, 390, 412, 430]
const EVIDENCE_WIDTHS = [390, 430]

/** The mark in the header. Its name is constant; state lives on aria-expanded. */
const openMark = (page: Page) => page.getByRole('button', { name: 'Open navigation' })

/** The close mark inside the drawer, scoped so it never collides with the header. */
const closeMark = (page: Page) =>
  page.locator('#mobile-navigation-panel').getByRole('button', { name: 'Close navigation' })

/** The consent banner is fixed to the bottom of the viewport and mounts after
 *  hydration, so clicking it away races the page. Seed the decision instead,
 *  before any script runs, and it never appears over the evidence. */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('nfe-cookie-consent', 'declined')
  })
})

async function settle(page: Page) {
  await page.waitForLoadState('networkidle')
  await expect(page.getByText('Cookie Consent')).toHaveCount(0)
}

/** Wait for the drawer to finish sliding.
 *
 *  A translateX transition moves the panel without changing its width, so a
 *  width assertion passes while it is still in flight — and a screenshot taken
 *  then shows a half-open drawer. Poll the left edge until it comes to rest. */
async function drawerSettled(page: Page) {
  const panel = page.locator('#mobile-navigation-panel')
  await expect
    .poll(async () => {
      const box = await panel.boundingBox()
      const viewport = page.viewportSize()!
      return Math.round((box!.x + box!.width) - viewport.width)
    }, { timeout: 3000 })
    .toBe(0)
}

test.describe('Issue A — the cabinet plate arrives whole on a phone', () => {
  for (const width of WIDTHS) {
    test(`shows the entire four-product composition at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(CABINET)
      await settle(page)

      const hero = page.locator('main img').first()
      await expect(hero).toBeVisible()
      await hero.evaluate((img: HTMLImageElement) =>
        img.complete ? null : new Promise((r) => img.addEventListener('load', r)))

      const m = await hero.evaluate((img: HTMLImageElement) => {
        const box = img.getBoundingClientRect()
        const style = getComputedStyle(img)
        return {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          boxWidth: box.width,
          boxHeight: box.height,
          objectFit: style.objectFit,
          src: img.currentSrc || img.src,
        }
      })

      // With object-fit, the visible fraction of the source is the ratio of the
      // box to the scaled image. contain shows all of it; cover clips whichever
      // axis is proportionally longer.
      const scale =
        m.objectFit === 'contain'
          ? Math.min(m.boxWidth / m.naturalWidth, m.boxHeight / m.naturalHeight)
          : Math.max(m.boxWidth / m.naturalWidth, m.boxHeight / m.naturalHeight)

      const shownWidth = Math.min(1, m.boxWidth / (m.naturalWidth * scale))
      const shownHeight = Math.min(1, m.boxHeight / (m.naturalHeight * scale))

      expect(
        shownWidth,
        `${(shownWidth * 100).toFixed(1)}% of the plate's width is visible at ${width}px; ` +
          `the Cetaphil sits at the left edge, so anything under 100% cuts a product`
      ).toBeGreaterThan(0.999)
      expect(
        shownHeight,
        `${(shownHeight * 100).toFixed(1)}% of the plate's height is visible at ${width}px; ` +
          `the headline sits at the top edge and the closing line at the bottom`
      ).toBeGreaterThan(0.999)

      // The withdrawn 4:5 crop must not come back through art direction.
      expect(m.src, 'the discarded mobile crop is being served again').not.toContain('-mobile.webp')
    })
  }

  test('introduces no horizontal overflow at the narrowest width', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 })
    await page.goto(CABINET)
    await settle(page)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow, 'the page scrolls sideways at 320px').toBeLessThanOrEqual(0)
  })

  test('keeps the editorial frame', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(CABINET)
    await settle(page)
    const radius = await page
      .locator('main img')
      .first()
      .evaluate((img) => getComputedStyle(img.parentElement as HTMLElement).borderRadius)
    expect(radius, 'the rounded editorial frame was lost').not.toBe('0px')
  })

  for (const width of EVIDENCE_WIDTHS) {
    test(`evidence: cabinet hero at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto(CABINET)
      await settle(page)
      await page
        .locator('main img')
        .first()
        .screenshot({ path: join(SHOTS, `A-cabinet-hero-${width}.png`) })
      await page.screenshot({ path: join(SHOTS, `A-cabinet-page-${width}.png`) })
    })
  }
})

test.describe('Issue B — the header collapses to a single mark', () => {
  for (const width of EVIDENCE_WIDTHS) {
    test(`shows a hamburger and no tab row at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('/')
      await settle(page)

      const toggle = page.getByRole('button', { name: 'Open navigation' })
      await expect(toggle).toBeVisible()
      await expect(page.getByRole('link', { name: 'NFE Beauty — home' })).toBeVisible()

      // None of the six tabs may be reachable while the drawer is shut.
      for (const label of ['Philosophy', 'The Atelier', 'Science', 'Ritual', 'Concierge']) {
        await expect(
          page.getByRole('banner').getByRole('link', { name: label, exact: true })
        ).toHaveCount(0)
      }

      // 44px minimum touch target.
      const box = await toggle.boundingBox()
      expect(box!.width).toBeGreaterThanOrEqual(44)
      expect(box!.height).toBeGreaterThanOrEqual(44)

      // The header must stay compact rather than wrapping to several rows.
      const headerHeight = (await page.getByRole('banner').boundingBox())!.height
      expect(headerHeight, 'the header still spans several rows').toBeLessThan(96)

      await page.getByRole('banner').screenshot({ path: join(SHOTS, `B-header-closed-${width}.png`) })
      await toggle.click()
      await expect(closeMark(page)).toBeVisible()
      await drawerSettled(page)

      // The drawer leaves a genuine outside to tap, and never exceeds the screen.
      const panel = (await page.locator('#mobile-navigation-panel').boundingBox())!
      expect(panel.width, `the drawer is ${panel.width}px wide at ${width}px`)
        .toBeLessThanOrEqual(Math.min(352, width * 0.82) + 1)
      expect(panel.width, 'the drawer leaves no backdrop to tap').toBeLessThan(width - 40)
      expect(panel.width, 'the drawer is too narrow to read').toBeGreaterThan(width * 0.6)
      // Fully arrived: the right edge is flush with the viewport, not mid-slide.
      expect(Math.round(panel.x + panel.width), 'the drawer is still sliding').toBe(width)

      await page.screenshot({ path: join(SHOTS, `B-drawer-open-${width}.png`) })
    })
  }

  test('opens, lists the six destinations in order, and marks the current page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/journal')
    await settle(page)
    await page.getByRole('button', { name: 'Open navigation' }).click()

    const panel = page.locator('#mobile-navigation-panel')
    // textContent, not innerText: the secondary link is styled uppercase and
    // innerText would report the rendered casing rather than the label.
    const labels = await panel.locator('nav a').evaluateAll((els) =>
      els.map((el) => (el.textContent ?? '').trim()))
    expect(labels).toEqual([
      'Philosophy',
      'The Atelier',
      'Science',
      'Ritual',
      'Journal',
      'Concierge',
    ])

    // Founder Access is present, but held outside the primary list.
    await expect(panel.getByRole('link', { name: 'Founder Access' })).toBeVisible()
    await expect(
      panel.locator('nav').getByRole('link', { name: 'Founder Access' }),
      'Founder Access was promoted into the primary tab list'
    ).toHaveCount(0)

    await expect(panel.getByRole('link', { name: 'Journal' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  test('carries the disclosure contract', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await settle(page)
    const toggle = openMark(page)
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(toggle).toHaveAttribute('aria-controls', 'mobile-navigation-panel')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    // Exactly one control may answer to each name while the drawer is open.
    await expect(page.getByRole('button', { name: 'Open navigation' })).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveCount(1)
  })

  test('closes on Escape, on the close mark, on an outside tap, and on choosing a destination',
    async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      await page.goto('/')
      await settle(page)
      const open = () => openMark(page).click()
      const panel = page.locator('#mobile-navigation-panel')
      const isShut = () => expect(panel).toBeHidden()

      await open()
      await page.keyboard.press('Escape')
      await isShut()

      await open()
      await closeMark(page).click()
      await isShut()

      await open()
      await page.mouse.click(20, 500) // the backdrop, left of the drawer
      await isShut()

      await open()
      await panel.getByRole('link', { name: 'Science' }).click()
      await expect(page).toHaveURL(/\/science$/)
      await isShut()
    })

  test('holds the page still while open and does not shift the layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await settle(page)
    const widthBefore = await page.evaluate(() => document.body.getBoundingClientRect().width)

    await openMark(page).click()
    const state = await page.evaluate(() => ({
      overflow: getComputedStyle(document.body).overflow,
      width: document.body.getBoundingClientRect().width,
    }))
    expect(state.overflow, 'the page scrolls behind the drawer').toBe('hidden')
    expect(state.width, 'opening the drawer shifted the layout').toBeCloseTo(widthBefore, 1)

    await page.keyboard.press('Escape')
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
      .not.toBe('hidden')
  })

  test('moves focus into the drawer and returns it to the mark', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await settle(page)
    await openMark(page).click()
    await expect(closeMark(page)).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(openMark(page)).toBeFocused()
  })

  test('leaves the desktop navigation exactly as it was', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await settle(page)
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeHidden()
    for (const label of ['Philosophy', 'The Atelier', 'Science', 'Ritual', 'Journal', 'Concierge']) {
      await expect(
        page.getByRole('banner').getByRole('link', { name: label, exact: true })
      ).toBeVisible()
    }
    await page.getByRole('banner').screenshot({ path: join(SHOTS, 'B-header-desktop-1280.png') })
  })
})
