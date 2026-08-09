import { expect, test, type Page } from '@playwright/test'

/**
 * W2-13. The cookie notice as a labelled region, not a dialog.
 *
 * It used to declare role="dialog" while behaving as ordinary content: no
 * aria-modal, no focus management, rendered last in the document after the
 * footer. That announces a modal and then fails every expectation a modal sets.
 *
 * A notice offering a choice is not a modal. The tests below assert the
 * opposite of modal behaviour on purpose.
 */

const KEY = 'nfe-cookie-consent'

async function undecided(page: Page) {
  await page.addInitScript((k) => window.localStorage.removeItem(k), KEY)
}

const notice = (page: Page) => page.getByRole('region', { name: 'Cookie Consent' })
const prefs = (page: Page) => page.locator('#cookie-preferences')

test.describe('appearance', () => {
  test('is a labelled region, not a dialog, and takes no focus', async ({ page }) => {
    await undecided(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(notice(page)).toBeVisible()
    await expect(page.getByRole('dialog'), 'still announcing itself as a dialog').toHaveCount(0)

    const modal = await notice(page).getAttribute('aria-modal')
    expect(modal, 'aria-modal is set on a non-modal notice').toBeNull()

    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(focused, 'the notice stole focus on appearance').toBe('BODY')
  })

  test('the page behind it stays interactive, because it is not modal', async ({ page }) => {
    await undecided(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // A link in the header must still be reachable and operable.
    const link = page.getByRole('banner').getByRole('link', { name: 'NFE Beauty — home' })
    await expect(link).toBeVisible()
    await link.focus()
    await expect(link).toBeFocused()
  })

  test('sits early in the keyboard order, not after the footer', async ({ page }) => {
    await undecided(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const order = await page.evaluate(() => {
      const nodes = Array.from(
        document.querySelectorAll('a[href], button:not([disabled])')
      ) as HTMLElement[]
      const accept = nodes.findIndex((n) => n.textContent?.trim() === 'Accept All')
      const footerFirst = nodes.findIndex((n) => n.closest('footer'))
      return { accept, footerFirst, total: nodes.length }
    })

    expect(order.accept, 'the notice controls are not in the tab order').toBeGreaterThan(-1)
    expect(
      order.accept,
      'the notice comes after the footer, so a keyboard visitor traverses the whole site first'
    ).toBeLessThan(order.footerFirst)
  })

  for (const [width, height, limit] of [
    // 375 is where the audit measured 41%. 320 is the narrowest supported
    // width, where the same copy necessarily wraps further.
    [375, 812, 0.3],
    [320, 568, 0.36],
    [430, 932, 0.26],
  ] as const) {
    test(`at ${width}px it does not overflow and stays a modest slice`, async ({ page }) => {
      await undecided(page)
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0)

      const box = (await notice(page).boundingBox())!
      const share = box.height / height
      expect(
        share,
        `the notice occupies ${(share * 100).toFixed(0)}% of a ${width}px viewport`
      ).toBeLessThan(limit)
    })
  }
})

test.describe('making a choice', () => {
  for (const [label, expected] of [
    ['Accept All', 'accepted'],
    ['Decline', 'declined'],
  ] as const) {
    test(`${label} is keyboard operable and records ${expected}`, async ({ page }) => {
      await undecided(page)
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const button = page.getByRole('button', { name: label })
      await button.focus()
      await expect(button).toBeFocused()
      await page.keyboard.press('Enter')

      await expect(notice(page)).toBeHidden()
      expect(await page.evaluate((k) => window.localStorage.getItem(k), KEY)).toBe(expected)
    })

    test(`${label} by keyboard leaves focus somewhere sensible`, async ({ page }) => {
      await undecided(page)
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      await page.getByRole('button', { name: label }).focus()
      await page.keyboard.press('Enter')
      await expect(notice(page)).toBeHidden()

      // The failure this guards against: focus falls to <body> and the next
      // Tab restarts at the top of the document.
      const landed = await page.evaluate(() => document.activeElement?.id)
      expect(landed, 'focus was dropped after dismissal').toBe('cookie-preferences')
    })
  }
})

test.describe('returning to the choice', () => {
  test('the footer control reopens the notice', async ({ page }) => {
    await page.addInitScript((k) => window.localStorage.setItem(k, 'declined'), KEY)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(notice(page), 'the notice shows despite a recorded decision').toBeHidden()
    await expect(prefs(page), 'no persistent way back to the choice').toBeVisible()

    await prefs(page).click()
    await expect(notice(page)).toBeVisible()
  })

  test('withdrawing consent clears attribution, as the security tranche established',
    async ({ page }) => {
      await page.addInitScript((k) => window.localStorage.setItem(k, 'accepted'), KEY)
      await page.goto('/founder-access?utm_source=cookie-test&utm_campaign=cookie-test')
      await page.waitForLoadState('networkidle')

      await expect
        .poll(() => page.evaluate(() => window.sessionStorage.getItem('nfe.attribution.v1')), {
          timeout: 10000,
        })
        .not.toBeNull()

      await prefs(page).click()
      await expect(notice(page)).toBeVisible()
      await page.getByRole('button', { name: 'Decline' }).click()

      await expect
        .poll(() => page.evaluate(() => window.sessionStorage.getItem('nfe.attribution.v1')))
        .toBeNull()
      expect(await page.evaluate((k) => window.localStorage.getItem(k), KEY)).toBe('declined')
    })
})
