import { expect, test, type Page } from '@playwright/test'

/**
 * The consent matrix for referral attribution.
 *
 * `nfe.attribution.v1` used to be written on mount, before any decision had
 * been made, and then sent with Founder Access and Concierge submissions.
 * Referrer, landing path and the full UTM set describe how someone arrived;
 * holding that before consent is the thing the banner exists to prevent.
 *
 * The rule now: nothing before acceptance, nothing while declined, capture only
 * from acceptance forward, deletion on withdrawal.
 *
 * A link carrying campaign parameters is used throughout, so there is always
 * something available to capture. If the gate leaks, these fail.
 */

const CAMPAIGN =
  '/founder-access?utm_source=test-source&utm_medium=test-medium&utm_campaign=test-campaign'
const KEY = 'nfe.attribution.v1'
const CONSENT = 'nfe-cookie-consent'

/** Seed the consent decision before any page script runs.
 *
 *  Only seeds when nothing is recorded yet. An init script re-runs on every
 *  navigation, so an unconditional write would silently undo a decision the
 *  test makes later, which is what happened to the withdrawal case first time. */
async function seedConsent(page: Page, value: 'accepted' | 'declined' | null) {
  await page.addInitScript(
    ([key, v]) => {
      if (v === null) window.localStorage.removeItem(key)
      else if (window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, v as string)
      }
    },
    [CONSENT, value] as const
  )
}

const stored = (page: Page) => page.evaluate((k) => window.sessionStorage.getItem(k), KEY)

/**
 * Fill and submit Founder Access, and return what the request actually carried.
 *
 * The form is addressed through one of its own fields rather than by index, and
 * submitted with requestSubmit rather than a click: the consent banner is fixed
 * to the bottom of the viewport and can sit over the submit control, which
 * would make this measure overlay geometry instead of the payload.
 * requestSubmit still runs native validation, so required fields are enforced.
 */
async function submitAndCapture(page: Page): Promise<Record<string, unknown>> {
  await page.route('**/api/founder-access', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' })
  )

  const form = page.locator('form:has(#founder-email)')
  await expect(form, 'the Founder Access form did not render').toBeVisible()

  await page.locator('#founder-first-name').fill('QA Check')
  await page.locator('#founder-email').fill('qa-consent-check@example.com')
  // The required privacy agreement, addressed by its own label. Skin-interest
  // checkboxes appear earlier in the form, so `.first()` checks one of those
  // and leaves the required box clear, which silently blocks native validation.
  // The newsletter box is deliberately left alone so a synthetic address is
  // never opted into a real mailing list.
  await page
    .locator('label', { hasText: 'I have read and agree' })
    .locator('input[type="checkbox"]')
    .check()

  const pending = page.waitForRequest('**/api/founder-access', { timeout: 15000 })
  await form.evaluate((el: HTMLFormElement) => el.requestSubmit())
  const request = await pending

  return (request.postDataJSON() ?? {}) as Record<string, unknown>
}

/** The attribution object as transmitted. */
function sentAttribution(body: Record<string, unknown>): Record<string, unknown> {
  return (body.attribution ?? {}) as Record<string, unknown>
}

test.describe('before a decision is made', () => {
  test('nothing is written to session storage', async ({ page }) => {
    await seedConsent(page, null)
    await page.goto(CAMPAIGN)
    await page.waitForLoadState('networkidle')
    expect(await stored(page), 'attribution was captured before consent').toBeNull()
  })

  test('no attribution field is sent with a Founder Access submission', async ({ page }) => {
    await seedConsent(page, null)
    await page.goto(CAMPAIGN)
    await page.waitForLoadState('networkidle')

    const body = await submitAndCapture(page)
    expect(
      Object.keys(sentAttribution(body)),
      'attribution was transmitted without consent'
    ).toEqual([])
  })
})

test.describe('after declining', () => {
  test('nothing is written to session storage', async ({ page }) => {
    await seedConsent(page, 'declined')
    await page.goto(CAMPAIGN)
    await page.waitForLoadState('networkidle')
    expect(await stored(page)).toBeNull()
  })

  test('nothing is transmitted', async ({ page }) => {
    await seedConsent(page, 'declined')
    await page.goto(CAMPAIGN)
    await page.waitForLoadState('networkidle')

    const body = await submitAndCapture(page)
    expect(Object.keys(sentAttribution(body)), 'attribution survived a decline').toEqual([])
  })
})

test.describe('after accepting', () => {
  test('capture resumes and the record is held for the session', async ({ page }) => {
    await seedConsent(page, 'accepted')
    await page.goto(CAMPAIGN)
    await page.waitForLoadState('networkidle')

    // Capture happens in a client effect, so poll rather than read once:
    // networkidle can resolve before hydration under parallel load.
    await expect.poll(() => stored(page), { timeout: 10000 }).not.toBeNull()
    const raw = await stored(page)
    const record = JSON.parse(raw as string)
    expect(record.utmSource).toBe('test-source')
    expect(record.utmCampaign).toBe('test-campaign')
  })

  test('attribution travels with the submission', async ({ page }) => {
    await seedConsent(page, 'accepted')
    await page.goto(CAMPAIGN)
    await page.waitForLoadState('networkidle')

    const body = await submitAndCapture(page)
    expect(sentAttribution(body)).toMatchObject({
      utmSource: 'test-source',
      utmCampaign: 'test-campaign',
    })
  })
})

test.describe('the form still works regardless of the decision', () => {
  for (const decision of ['accepted', 'declined', null] as const) {
    test(`Founder Access submits with consent ${decision ?? 'undecided'}`, async ({ page }) => {
      await seedConsent(page, decision)
      await page.goto(CAMPAIGN)
      await page.waitForLoadState('networkidle')

      const body = await submitAndCapture(page)
      // The enquiry itself must always go through; only attribution is gated.
      expect(body.email).toBe('qa-consent-check@example.com')
      expect(body.firstName).toBe('QA Check')
      expect(body.privacyPolicyAccepted).toBe(true)
    })
  }
})

test.describe('withdrawing consent', () => {
  test('deletes what was already captured', async ({ page }) => {
    await seedConsent(page, 'accepted')
    await page.goto(CAMPAIGN)
    await page.waitForLoadState('networkidle')
    await expect.poll(() => stored(page), { timeout: 10000 }).not.toBeNull()

    // Withdraw the way the banner does, then let the gate run again.
    await page.evaluate((k) => window.localStorage.setItem(k, 'declined'), CONSENT)
    await page.reload()
    await page.waitForLoadState('networkidle')

    expect(await stored(page), 'a pre-withdrawal record survived').toBeNull()
  })
})
