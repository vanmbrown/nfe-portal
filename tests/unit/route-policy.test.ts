import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

/**
 * The founder's information-architecture decisions, as source-level guards.
 *
 * These run everywhere, including where no server is available, and they cover
 * the half of the policy a live probe cannot see: that a production gate exists
 * at all, and that a retired route has not quietly come back.
 *
 * The live half - status codes, redirect targets, sitemap contents - is in
 * tests/e2e/route-policy.spec.ts.
 */

const root = process.cwd()
const read = (...p: string[]) => readFileSync(join(root, ...p), 'utf8')
const has = (...p: string[]) => existsSync(join(root, ...p))

describe('route policy: one authoritative Science experience', () => {
  it('retires the second Science page', () => {
    assert.ok(!has('src', 'app', 'learn'), '/learn still has a route')
  })

  it('redirects /learn to /science permanently', () => {
    const config = read('next.config.mjs')
    assert.match(
      config,
      /source:\s*"\/learn",\s*destination:\s*"\/science",\s*permanent:\s*true/,
      'no permanent /learn to /science redirect'
    )
  })

  it('leaves no link to the retired route', () => {
    for (const file of ['src/app/focus-group/enclave/resources/page.tsx']) {
      assert.ok(!read(...file.split('/')).includes('"/learn"'), `${file} still links to /learn`)
      assert.ok(!read(...file.split('/')).includes("'/learn'"), `${file} still links to /learn`)
    }
  })
})

describe('route policy: internal surfaces are gated', () => {
  for (const route of ['skin-strategy', 'community-input']) {
    it(`/${route} returns 404 in a production build`, () => {
      const layout = read('src', 'app', route, 'layout.tsx')
      assert.match(
        layout,
        /process\.env\.NODE_ENV === 'production'/,
        `/${route} has no production gate`
      )
      assert.match(layout, /notFound\(\)/, `/${route} does not 404`)
    })

    it(`/${route} asks not to be indexed`, () => {
      const layout = read('src', 'app', route, 'layout.tsx')
      assert.match(layout, /robots:\s*\{\s*index:\s*false/, `/${route} is still indexable`)
    })

    it(`robots disallows /${route}`, () => {
      assert.ok(read('src', 'app', 'robots.ts').includes(`'/${route}'`), `robots allows /${route}`)
    })
  }

  it('robots disallows the participant portal', () => {
    assert.ok(read('src', 'app', 'robots.ts').includes("'/focus-group/'"), 'portal is crawlable')
  })
})

describe('route policy: the portal has no dead destinations', () => {
  it('declares the portal routes in one place', () => {
    const routes = read('src', 'lib', 'auth', 'routes.ts')
    assert.match(routes, /FOCUS_GROUP_LOGIN_ROUTE = '\/focus-group\/login'/)
    assert.match(routes, /FOCUS_GROUP_HOME_ROUTE = '\/focus-group\/profile'/)
  })

  it('leaves no bare /login destination anywhere', () => {
    const offenders: string[] = []
    for (const file of [
      'src/app/focus-group/enclave/page.tsx',
      'src/app/focus-group/admin/uploads/page.tsx',
      'src/app/focus-group/admin/participant/[userId]/page.tsx',
    ]) {
      const body = read(...file.split('/'))
      if (/['"]\/login['"]/.test(body)) offenders.push(file)
    }
    assert.deepEqual(offenders, [], `still navigating to the non-existent /login: ${offenders}`)
  })

  it('gives /focus-group a landing rather than a 404', () => {
    assert.ok(has('src', 'app', 'focus-group', 'page.tsx'), '/focus-group has no page')
    const page = read('src', 'app', 'focus-group', 'page.tsx')
    assert.match(page, /redirect\(FOCUS_GROUP_HOME_ROUTE\)/, 'does not land on the portal home')
  })

  it('keeps the auth callback landing in agreement with the masthead', () => {
    assert.ok(
      read('src', 'app', 'auth', 'callback', 'route.ts').includes('/focus-group/profile'),
      'the callback lands somewhere else'
    )
  })
})

describe('route policy: the sitemap lists canonical pages only', () => {
  const sitemap = () => read('src', 'app', 'sitemap.ts')

  // Redirect-only shims, retired routes, and internal surfaces.
  const forbidden = ['/articles', '/subscribe', '/learn', '/skin-strategy', '/community-input']

  for (const path of forbidden) {
    it(`does not advertise ${path}`, () => {
      const listed = new RegExp(`^\\s*'${path.replace('/', '\\/')}',`, 'm')
      assert.ok(!listed.test(sitemap()), `${path} is still in the sitemap`)
    })
  }

  it('keeps the destinations those redirects point at', () => {
    assert.match(sitemap(), /^\s*'\/journal',/m, '/journal is missing')
    assert.match(sitemap(), /^\s*'\/founder-access',/m, '/founder-access is missing')
    assert.match(sitemap(), /^\s*'\/science',/m, '/science is missing')
  })

  it('keeps the legacy redirects that protect old inbound links', () => {
    const config = read('next.config.mjs')
    for (const source of ['/about', '/products', '/founders-access']) {
      assert.ok(config.includes(`source: "${source}"`), `${source} redirect was removed`)
    }
  })
})
