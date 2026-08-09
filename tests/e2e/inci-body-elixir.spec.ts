import { expect, test } from '@playwright/test'

/**
 * The Ingredients route must survive a formula that has no ingredient list yet.
 *
 * `public/data/formulas/bodyElixir.json` ships `"ingredients": {}` while the
 * Body Elixir is in development. `{} || []` is truthy, so the loader handed a
 * plain object to code that called `.forEach` on it, and the error boundary
 * replaced the whole page with "Something went wrong!" — live in production.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('nfe-cookie-consent', 'declined')
  })
})

test('the Body Elixir toggle shows the in-development notice instead of crashing', async ({
  page,
}) => {
  const crashes: string[] = []
  page.on('pageerror', (error) => crashes.push(error.message))

  await page.goto('/inci')
  await page.waitForLoadState('networkidle')

  await page.getByRole('button', { name: /body elixir/i }).first().click()

  await expect(page.getByText('Something went wrong!')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(crashes, `uncaught page errors: ${crashes.join(' | ')}`).toEqual([])
})

test('an ingredients payload of the wrong shape degrades to the placeholder', async ({ page }) => {
  // Force the hostile shape regardless of what the committed data currently says.
  await page.route('**/data/formulas/*.json', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ product: 'Test', status: 'In development', ingredients: {} }),
    }))

  const crashes: string[] = []
  page.on('pageerror', (error) => crashes.push(error.message))

  await page.goto('/inci')
  await page.waitForLoadState('networkidle')
  await page.getByRole('button', { name: /body elixir/i }).first().click()

  await expect(page.getByText('Something went wrong!')).toHaveCount(0)
  expect(crashes, `uncaught page errors: ${crashes.join(' | ')}`).toEqual([])
})
