import { expect, test, type Page } from '@playwright/test'

/**
 * W2-32 / W2-21 (quiz) and W2-30 (founder film).
 *
 * Both replace an ARIA imitation with the real thing: a div carrying
 * role="radiogroup" over buttons carrying role="radio", and a div carrying
 * role="dialog" and aria-modal. Each announced a behaviour it did not
 * implement. The tests below exercise the behaviour, not the attributes.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('nfe-cookie-consent', 'declined')
  })
})

/**
 * Choose an option the way a visitor does: by clicking its card.
 *
 * The native inputs are deliberately `sr-only` so the labels can carry the
 * approved card treatment, which means Playwright's `check()` will not act on
 * them - it requires a visible target. Clicking the label is both what actually
 * happens and what exercises the label/input association.
 */
async function chooseOption(page: Page, index: number) {
  await page.locator('fieldset label').nth(index).click()
}

const active = (page: Page) =>
  page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    return {
      tag: el?.tagName ?? null,
      type: (el as HTMLInputElement | null)?.type ?? null,
      value: (el as HTMLInputElement | null)?.value ?? null,
      text: el?.textContent?.trim().slice(0, 40) ?? null,
      inDialog: Boolean(el?.closest('dialog')),
    }
  })

test.describe('W2-32 the quiz uses native radio semantics', () => {
  test('the group is a fieldset with a legend and real radios', async ({ page }) => {
    await page.goto('/skin-ritual-quiz')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('fieldset')).toHaveCount(1)
    await expect(page.locator('fieldset legend')).toHaveCount(1)

    const radios = page.locator('fieldset input[type="radio"]')
    expect(await radios.count(), 'no native radios').toBeGreaterThan(1)

    // The imitation must be gone entirely.
    await expect(page.locator('[role="radiogroup"]')).toHaveCount(0)
    await expect(page.locator('[role="radio"]')).toHaveCount(0)

    // The group carries an accessible name from its legend.
    const name = await page.locator('fieldset legend').innerText()
    expect(name.trim().length, 'the legend is empty').toBeGreaterThan(0)
  })

  test('arrow keys move the selection, which the old widget never did', async ({ page }) => {
    await page.goto('/skin-ritual-quiz')
    await page.waitForLoadState('networkidle')

    const radios = page.locator('fieldset input[type="radio"]')
    await radios.first().focus()
    await page.keyboard.press('Space')
    await expect(radios.first()).toBeChecked()

    await page.keyboard.press('ArrowDown')
    await expect(radios.nth(1), 'ArrowDown did not move the selection').toBeChecked()
    await expect(radios.first()).not.toBeChecked()

    await page.keyboard.press('ArrowUp')
    await expect(radios.first(), 'ArrowUp did not move the selection back').toBeChecked()
  })

  test('a visitor can revise a choice before committing it', async ({ page }) => {
    await page.goto('/skin-ritual-quiz')
    await page.waitForLoadState('networkidle')

    const radios = page.locator('fieldset input[type="radio"]')
    await chooseOption(page, 1)
    await expect(radios.nth(1)).toBeChecked()

    // Change of mind, still on the same question.
    await chooseOption(page, 0)
    await expect(radios.nth(0)).toBeChecked()
    await expect(radios.nth(1)).not.toBeChecked()

    // Nothing advanced on its own: the question is still on screen.
    await expect(page.locator('fieldset')).toBeVisible()
  })

  test('selecting does not auto-advance, so arrow keys stay usable', async ({ page }) => {
    await page.goto('/skin-ritual-quiz')
    await page.waitForLoadState('networkidle')

    const legendBefore = await page.locator('fieldset legend').innerText()
    await chooseOption(page, 0)
    await page.waitForTimeout(400)
    const legendAfter = await page.locator('fieldset legend').innerText()

    expect(
      legendAfter,
      'the group unmounted on selection, which would make native arrow keys unusable'
    ).toBe(legendBefore)
  })
})

test.describe('W2-21 the quiz moves focus when the panel changes', () => {
  async function completeQuiz(page: Page) {
    for (let guard = 0; guard < 12; guard += 1) {
      const fieldset = page.locator('fieldset')
      if ((await fieldset.count()) === 0) break
      await chooseOption(page, 0)
      const advance = page.getByRole('button', { name: /Continue|View Recommendation/ })
      await advance.click()
      await page.waitForTimeout(150)
    }
  }

  test('focus lands on the recommendation when it replaces the questions', async ({ page }) => {
    await page.goto('/skin-ritual-quiz')
    await page.waitForLoadState('networkidle')
    await completeQuiz(page)

    await expect(page.getByRole('button', { name: 'Retake the quiz' })).toBeVisible()

    const landed = await active(page)
    expect(landed.tag, 'focus did not move to the recommendation').toBe('DIV')
    const holdsResult = await page.evaluate(() =>
      document.activeElement?.querySelector('h2')?.textContent?.trim().length
    )
    expect(holdsResult, 'the focused container does not hold the recommendation').toBeGreaterThan(0)
  })

  test('Retake returns focus to the first question', async ({ page }) => {
    await page.goto('/skin-ritual-quiz')
    await page.waitForLoadState('networkidle')
    await completeQuiz(page)

    await page.getByRole('button', { name: 'Retake the quiz' }).click()
    await expect(page.locator('fieldset')).toBeVisible()

    const landed = await active(page)
    expect(landed.tag, 'focus did not return to the question heading').toBe('H2')

    // And the quiz really is back at the start with nothing selected.
    const checked = await page.locator('fieldset input[type="radio"]:checked').count()
    expect(checked, 'a previous answer survived the retake').toBe(0)
  })
})

test.describe('W2-30 the founder film is a real modal', () => {
  const openFilm = async (page: Page) => {
    await page.goto('/our-story')
    await page.waitForLoadState('networkidle')
    const trigger = page.locator('button', { hasText: /watch|film|story/i }).first()
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('dialog[open]')).toBeVisible()
    return trigger
  }

  test('opens by keyboard and puts focus inside', async ({ page }) => {
    await openFilm(page)
    const landed = await active(page)
    expect(landed.inDialog, 'focus did not enter the dialog').toBe(true)
    expect(landed.text).toContain('Close')
  })

  test('the film has a useful title and is reachable', async ({ page }) => {
    await openFilm(page)
    const frame = page.locator('dialog iframe')
    await expect(frame).toHaveAttribute('title', /story/i)
    const src = await frame.getAttribute('src')
    expect(src, 'the player would autoplay').not.toContain('autoplay=1')
  })

  test('Tab stays inside the dialog and never reaches the page beneath', async ({ page }) => {
    await openFilm(page)

    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Tab')
      const where = await active(page)
      // Anything outside the dialog means containment failed. The browser
      // makes the rest of the document inert for a modal dialog, so the only
      // acceptable results are inside it or the document body itself.
      expect(
        where.inDialog || where.tag === 'BODY' || where.tag === 'HTML',
        `Tab ${i + 1} escaped the dialog and landed on ${where.tag} "${where.text}"`
      ).toBe(true)
    }
  })

  test('Escape closes it and focus returns to the exact trigger', async ({ page }) => {
    const trigger = await openFilm(page)
    await page.keyboard.press('Escape')
    await expect(page.locator('dialog[open]')).toHaveCount(0)
    await expect(trigger, 'focus did not return to the opener').toBeFocused()
  })

  test('the close control closes it and focus returns to the exact trigger', async ({ page }) => {
    const trigger = await openFilm(page)
    await page.locator('dialog button', { hasText: 'Close' }).click()
    await expect(page.locator('dialog[open]')).toHaveCount(0)
    await expect(trigger).toBeFocused()
  })

  test('focus inside the player can always get back out', async ({ page }) => {
    // Escape is consumed by the cross-origin player and never reaches this
    // document, which no page can change. What must hold is that the visitor is
    // not stuck: one Shift+Tab returns to the close control.
    await openFilm(page)
    await page.keyboard.press('Tab')
    expect((await active(page)).tag, 'Tab did not reach the film').toBe('IFRAME')

    await page.keyboard.press('Escape')
    await expect(
      page.locator('dialog[open]'),
      'if Escape now closes from inside the frame, this note is stale and can go'
    ).toHaveCount(1)

    await page.keyboard.press('Shift+Tab')
    const out = await active(page)
    expect(out.text, 'no way back to the close control from the player').toContain('Close')

    await page.keyboard.press('Escape')
    await expect(page.locator('dialog[open]')).toHaveCount(0)
  })

  test('page scroll is held while open and restored after', async ({ page }) => {
    await page.goto('/our-story')
    await page.waitForLoadState('networkidle')
    const before = await page.evaluate(() => window.scrollY)

    const trigger = page.locator('button', { hasText: /watch|film|story/i }).first()
    await trigger.click()
    await expect(page.locator('dialog[open]')).toBeVisible()
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden')

    await page.keyboard.press('Escape')
    await expect(page.locator('dialog[open]')).toHaveCount(0)
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.body).overflow))
      .not.toBe('hidden')
    expect(await page.evaluate(() => window.scrollY), 'the page jumped').toBe(before)
  })

  for (const width of [320, 390, 430]) {
    test(`stays usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await openFilm(page)

      const frame = (await page.locator('dialog iframe').boundingBox())!
      expect(frame.width, 'the film overflows the viewport').toBeLessThanOrEqual(width)
      expect(frame.width).toBeGreaterThan(100)

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
      expect(overflow, 'horizontal overflow while the film is open').toBeLessThanOrEqual(0)
    })
  }
})
