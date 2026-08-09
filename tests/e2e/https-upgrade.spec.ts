import { expect, test } from '@playwright/test'

/**
 * The scheme upgrade in src/proxy.ts.
 *
 * `http://www.nfebeauty.com` answered 200 and served the whole site in the
 * clear. These cases pin the two ways that can go wrong: a redirect that never
 * fires, and one that fires on an already-secure request and loops.
 *
 * Signal precedence is deliberate. `cf-visitor` is set by Cloudflare and cannot
 * be forged by a client; `x-forwarded-proto` can be set by anything upstream.
 * A dev server that injects `x-forwarded-proto: http` must not be able to send
 * a secure request into a redirect.
 */

const HOST = 'www.nfebeauty.com'
const PREVIEW = 'nfe-portal.workers.dev'

/** Follow nothing: the status and Location are the subject under test. */
async function head(request: import('@playwright/test').APIRequestContext, path: string,
  headers: Record<string, string>) {
  const res = await request.get(path, { headers, maxRedirects: 0, failOnStatusCode: false })
  return { status: res.status(), location: res.headers()['location'] ?? null }
}

test.describe('cleartext requests are upgraded', () => {
  for (const path of ['/', '/founder-access', '/concierge', '/journal']) {
    test(`cf-visitor http upgrades ${path}`, async ({ request }) => {
      const r = await head(request, path, {
        host: HOST,
        'cf-visitor': JSON.stringify({ scheme: 'http' }),
      })
      expect(r.status).toBe(308)
      expect(r.location).toBe(`https://${HOST}${path}`)
    })
  }

  test('x-forwarded-proto http upgrades too', async ({ request }) => {
    const r = await head(request, '/founder-access', {
      host: HOST,
      'x-forwarded-proto': 'http',
    })
    expect(r.status).toBe(308)
    expect(r.location).toBe(`https://${HOST}/founder-access`)
  })

  test('the query string survives the upgrade', async ({ request }) => {
    const r = await head(request, '/science?pathways=hydration', {
      host: HOST,
      'cf-visitor': JSON.stringify({ scheme: 'http' }),
    })
    expect(r.status).toBe(308)
    expect(r.location).toContain('https://')
    expect(r.location).toContain('pathways=hydration')
  })
})

test.describe('secure and local requests pass straight through', () => {
  test('cf-visitor https is left alone', async ({ request }) => {
    const r = await head(request, '/', { host: HOST, 'cf-visitor': JSON.stringify({ scheme: 'https' }) })
    expect(r.status, 'an already-secure request was redirected, which loops').toBe(200)
  })

  test('cf-visitor outranks a contradicting x-forwarded-proto', async ({ request }) => {
    const r = await head(request, '/', {
      host: HOST,
      'cf-visitor': JSON.stringify({ scheme: 'https' }),
      'x-forwarded-proto': 'http',
    })
    expect(r.status, 'a forgeable header overrode the one Cloudflare sets').toBe(200)
  })

  test('a malformed cf-visitor is not treated as a signal', async ({ request }) => {
    const r = await head(request, '/', {
      host: HOST,
      'cf-visitor': 'not-json',
      'x-forwarded-proto': 'https',
    })
    expect(r.status).toBe(200)
  })

  test('a workers.dev preview keeps plain HTTP', async ({ request }) => {
    const r = await head(request, '/', { host: PREVIEW, 'x-forwarded-proto': 'http' })
    expect(r.status).toBe(200)
  })

  test('static assets are not routed through the upgrade', async ({ request }) => {
    const r = await head(request, '/images/social/nfe-default-share-card.png', {
      host: HOST,
      'cf-visitor': JSON.stringify({ scheme: 'http' }),
    })
    expect(r.status).toBe(200)
  })
})

test.describe('security response headers', () => {
  test('the baseline headers are present and HSTS is deliberately absent', async ({ request }) => {
    const res = await request.get('/', { headers: { host: HOST, 'x-forwarded-proto': 'https' } })
    const h = res.headers()
    expect(h['x-content-type-options']).toBe('nosniff')
    expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(h['x-frame-options']).toBe('SAMEORIGIN')
    expect(h['permissions-policy']).toContain('camera=()')
    expect(h['x-powered-by'], 'the framework still announces itself').toBeUndefined()
    // On founder hold until the zone's hostname inventory is confirmed.
    expect(h['strict-transport-security'], 'HSTS shipped while still on hold').toBeUndefined()
  })
})

test.describe('the Full INCI List claim is withdrawn', () => {
  for (const slug of ['face-elixir', 'body-elixir']) {
    test(`${slug} no longer publishes a completeness claim`, async ({ request }) => {
      const body = await (await request.get(`/products/${slug}`, {
        headers: { host: HOST, 'x-forwarded-proto': 'https' },
      })).text()
      expect(body).not.toContain('Full INCI List')
      expect(body, 'the truthful actives list was lost too').toContain('Key Actives')
    })
  }
})
