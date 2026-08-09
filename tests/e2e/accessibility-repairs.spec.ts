import { expect, test, type Page } from '@playwright/test'

/**
 * The contrast and focus repairs, measured in the browser rather than asserted
 * from source. Automated scanners cannot prove focus flow is sensible, so these
 * drive the keyboard and read back what actually happened.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('nfe-cookie-consent', 'declined')
  })
})

/** Contrast of two composited colours, per WCAG. */
async function contrast(page: Page, fg: string, bg: string): Promise<number> {
  return page.evaluate(
    ([a, b]) => {
      const parse = (c: string) => c.match(/[\d.]+/g)!.map(Number)
      const lin = (v: number) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
      const composite = (f: number[], g: number[]) => {
        const alpha = f.length > 3 ? f[3] : 1
        return [0, 1, 2].map((i) => alpha * f[i] + (1 - alpha) * g[i])
      }
      const bgc = parse(b)
      const l1 = lum(composite(parse(a), bgc))
      const l2 = lum(bgc)
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
    },
    [fg, bg]
  )
}

test.describe('W2-08 the skip link moves focus into main', () => {
  test('activating it lands focus on main, and the next Tab stays in main', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Tab once: the skip link is the first focusable thing on the page.
    await page.keyboard.press('Tab')
    const first = await page.evaluate(() => document.activeElement?.textContent?.trim())
    expect(first, 'the skip link is not the first tab stop').toContain('Skip to main content')

    await page.keyboard.press('Enter')

    const landed = await page.evaluate(() => ({
      id: document.activeElement?.id,
      tag: document.activeElement?.tagName,
    }))
    expect(landed.id, 'focus did not move to the main region').toBe('main-content')
    expect(landed.tag).toBe('MAIN')

    // The point of the skip link: the next keyboard action continues through
    // main content rather than returning to the navigation.
    await page.keyboard.press('Tab')
    const inside = await page.evaluate(() =>
      document.getElementById('main-content')?.contains(document.activeElement)
    )
    expect(inside, 'the next Tab left the main region').toBe(true)
  })

  test('main is focusable, and the redundant handler is gone', async ({ page }) => {
    await page.goto('/')
    const tabindex = await page.locator('#main-content').getAttribute('tabindex')
    expect(tabindex, 'main is not focusable, so a fragment link cannot focus it').toBe('-1')
  })
})

test.describe('W2-09 the focus ring is legible on every surface', () => {
  test('light ground: the ring is the on-light accent and clears 3:1', async ({ page }) => {
    await page.goto('/journal')
    await page.waitForLoadState('networkidle')

    const probe = await page.evaluate(() => {
      const el = document.querySelector('main a') as HTMLElement
      el.focus()
      const cs = getComputedStyle(el)
      let node: HTMLElement | null = el
      let bg = 'rgba(0, 0, 0, 0)'
      while (node && (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) {
        bg = getComputedStyle(node).backgroundColor
        node = node.parentElement
      }
      return { outline: cs.outlineColor, width: cs.outlineWidth, ground: bg }
    })

    expect(probe.width, 'the ring is thinner than 2px').toBe('2px')
    const r = await contrast(page, probe.outline, probe.ground)
    expect(r, `ring ${probe.outline} on ${probe.ground} measured ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
  })

  test('dark ground: the header keeps the gold ring and clears 3:1', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const probe = await page.evaluate(() => {
      const el = document.querySelector('header a') as HTMLElement
      el.focus()
      const cs = getComputedStyle(el)
      const header = document.querySelector('header') as HTMLElement
      return { outline: cs.outlineColor, ground: getComputedStyle(header).backgroundColor }
    })

    const r = await contrast(page, probe.outline, probe.ground)
    expect(r, `ring ${probe.outline} on ${probe.ground} measured ${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
  })
})

test.describe('W2-10 Concierge fields have a perceivable boundary', () => {
  test('every field border clears 3:1 against its own fill', async ({ page }) => {
    await page.goto('/concierge')
    await page.waitForLoadState('networkidle')

    const fields = page.locator('form input[type="text"], form input[type="email"], form select, form textarea')
    const count = await fields.count()
    expect(count, 'no Concierge fields found').toBeGreaterThan(3)

    for (let i = 0; i < count; i += 1) {
      const probe = await fields.nth(i).evaluate((el) => {
        const cs = getComputedStyle(el as HTMLElement)
        return { border: cs.borderTopColor, fill: cs.backgroundColor, width: cs.borderTopWidth }
      })
      if (probe.width === '0px') continue
      const r = await contrast(page, probe.border, probe.fill)
      expect(
        r,
        `field ${i}: border ${probe.border} on fill ${probe.fill} measured ${r.toFixed(2)}:1`
      ).toBeGreaterThanOrEqual(3)
    }
  })
})

test.describe('W2-11 Ingredients muted text is readable', () => {
  test('every small muted line clears 4.5:1', async ({ page }) => {
    await page.goto('/inci')
    await page.waitForLoadState('networkidle')

    const worst = await page.evaluate(() => {
      const parse = (c: string) => c.match(/[\d.]+/g)!.map(Number)
      const lin = (v: number) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      }
      const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])
      // Returns null when the ground cannot be reduced to a single colour -
      // a gradient ancestor, for instance. Reporting a ratio against a colour
      // that is not actually behind the text produces false failures: the
      // education tab bar is bone-on-near-black under a gradient, and a naive
      // walk past it lands on a light ancestor and calls it 1.45:1.
      const groundOf = (el: HTMLElement): number[] | null => {
        let node: HTMLElement | null = el
        while (node) {
          const cs = getComputedStyle(node)
          if (cs.backgroundImage && cs.backgroundImage !== 'none') return null
          const bg = cs.backgroundColor
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return parse(bg)
          node = node.parentElement
        }
        return [255, 255, 255]
      }

      let lowest = { ratio: 99, text: '', colour: '' }
      // Scoped to the actives list, which is the component this finding covers.
      const scope = document.querySelector('main') as HTMLElement
      for (const el of Array.from(scope.querySelectorAll('*'))) {
        const node = el as HTMLElement
        if (!node.textContent?.trim() || node.children.length) continue
        const cs = getComputedStyle(node)
        const size = parseFloat(cs.fontSize)
        if (size >= 18.66) continue
        const ground = groundOf(node)
        if (!ground) continue
        const l1 = lum(parse(cs.color))
        const l2 = lum(ground)
        const r = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)
        if (r < lowest.ratio) {
          lowest = { ratio: r, text: node.textContent.trim().slice(0, 48), colour: cs.color }
        }
      }
      return lowest
    })

    expect(
      worst.ratio,
      `lowest small-text contrast on /inci was ${worst.ratio.toFixed(2)}:1 on "${worst.text}" (${worst.colour})`
    ).toBeGreaterThanOrEqual(4.5)
  })
})
