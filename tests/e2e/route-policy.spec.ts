import { expect, test, type APIRequestContext } from '@playwright/test'

/**
 * The founder's route policy, probed live.
 *
 * The two gated routes answer 404 only in a production build, so those cases
 * run when PLAYWRIGHT_PRODUCTION is set and are skipped loudly otherwise. A
 * skip is visible in the report; a silently-passing assertion would not be.
 */

const AGAINST_PRODUCTION = process.env.PLAYWRIGHT_PRODUCTION === '1'

async function probe(request: APIRequestContext, path: string) {
  const res = await request.get(path, { maxRedirects: 0, failOnStatusCode: false })
  return { status: res.status(), location: res.headers()['location'] ?? null }
}

/** Sitemap paths, without spreading an iterator: the suite's TS target
 *  predates downlevel iteration. */
function sitemapPaths(xml: string): string[] {
  const re = /<loc>([^<]+)<\/loc>/g
  const out: string[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(xml)) !== null) out.push(new URL(match[1]).pathname)
  return out
}

test.describe('canonical public destinations answer', () => {
  for (const path of [
    '/',
    '/science',
    '/journal',
    '/founder-access',
    '/inci',
    '/shop',
    '/ritual',
    '/concierge',
    '/products/face-elixir',
    '/products/body-elixir',
  ]) {
    test(`${path} is 200`, async ({ request }) => {
      expect((await probe(request, path)).status).toBe(200)
    })
  }
})

test.describe('retired and legacy paths redirect rather than 404', () => {
  const permanent = [
    ['/learn', '/science'],
    ['/articles', '/journal'],
    ['/subscribe', '/founder-access'],
    ['/about', '/our-story'],
    ['/products', '/shop'],
    ['/founders-access', '/founder-access'],
  ] as const

  for (const [from, to] of permanent) {
    test(`${from} redirects to ${to}`, async ({ request }) => {
      const r = await probe(request, from)
      expect(r.status, `${from} did not redirect`).toBeGreaterThanOrEqual(301)
      expect(r.status).toBeLessThan(400)
      expect(r.location, `${from} pointed somewhere unexpected`).toContain(to)
    })
  }

  // Retired URLs, not detours. A 307 tells a crawler the move is temporary and
  // leaves the old URL indexed; 308 retires it.
  for (const path of ['/learn', '/articles', '/subscribe', '/about', '/products']) {
    test(`${path} is permanent, not temporary`, async ({ request }) => {
      expect((await probe(request, path)).status).toBe(308)
    })
  }
})

test.describe('the participant portal has no dead destinations', () => {
  /** The portal needs Supabase configuration. Without it the whole segment
   *  answers 500 before any page of it renders, so these assertions would be
   *  measuring the environment rather than the routing. */
  async function portalIsServing(request: APIRequestContext) {
    return (await probe(request, '/focus-group/login')).status === 200
  }

  test('/focus-group lands on the portal instead of 404', async ({ request }) => {
    test.skip(
      !(await portalIsServing(request)),
      'portal unavailable here (Supabase env unset); the redirect is guarded by tests/unit/route-policy.test.ts'
    )
    const r = await probe(request, '/focus-group')
    expect(r.status, '/focus-group still 404s').not.toBe(404)
    expect(r.location).toContain('/focus-group/profile')
  })

  test('/login is not a destination anyone is sent to', async ({ request }) => {
    // The route genuinely does not exist. What matters is that nothing
    // navigates there; the source guard covers that, and this records that the
    // bare path is not quietly serving something either.
    expect((await probe(request, '/login')).status).toBe(404)
  })

  test('/focus-group/login is the real sign-in', async ({ request }) => {
    test.skip(
      !(await portalIsServing(request)),
      'portal unavailable here (Supabase env unset)'
    )
    expect((await probe(request, '/focus-group/login')).status).toBe(200)
  })
})

test.describe('internal surfaces are not publicly reachable', () => {
  for (const path of ['/skin-strategy', '/community-input']) {
    test(`${path} is withdrawn from the public maison`, async ({ request }) => {
      test.skip(
        !AGAINST_PRODUCTION,
        'gated by NODE_ENV; run with PLAYWRIGHT_PRODUCTION=1 against a production build'
      )
      expect((await probe(request, path)).status).toBe(404)
    })
  }
})

test.describe('the sitemap advertises canonical pages only', () => {
  test('carries no redirect-only, retired or internal URL', async ({ request }) => {
    const paths = sitemapPaths(await (await request.get('/sitemap.xml')).text())

    expect(paths.length, 'the sitemap is empty').toBeGreaterThan(5)

    for (const forbidden of [
      '/articles',
      '/subscribe',
      '/learn',
      '/skin-strategy',
      '/community-input',
    ]) {
      expect(paths, `${forbidden} is advertised as a page`).not.toContain(forbidden)
    }

    expect(paths.some((p) => p.startsWith('/focus-group')), 'the portal is advertised').toBe(false)
  })

  test('still carries the destinations those redirects point at', async ({ request }) => {
    const paths = sitemapPaths(await (await request.get('/sitemap.xml')).text())
    for (const kept of ['/', '/journal', '/founder-access', '/science', '/inci']) {
      expect(paths, `${kept} fell out of the sitemap`).toContain(kept)
    }
  })

  test('every advertised URL answers without redirecting', async ({ request }) => {
    const paths = sitemapPaths(await (await request.get('/sitemap.xml')).text())
    const bad: string[] = []
    for (const p of paths) {
      const r = await probe(request, p)
      if (r.status !== 200) bad.push(`${p} -> ${r.status}`)
    }
    expect(bad, `sitemap entries that are not pages: ${bad.join(', ')}`).toEqual([])
  })
})

test.describe('robots keeps crawlers out of internal surfaces', () => {
  test('disallows the portal and both withdrawn routes', async ({ request }) => {
    const body = await (await request.get('/robots.txt')).text()
    for (const path of ['/focus-group/', '/skin-strategy', '/community-input', '/dev/']) {
      expect(body, `robots does not disallow ${path}`).toContain(path)
    }
  })
})
