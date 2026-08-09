import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

/**
 * The scheme upgrade has to stay edge-compatible, or the Worker never builds.
 *
 * Next 16 deprecates `middleware` in favour of `proxy` and prints a warning
 * saying so. Taking that advice breaks this deployment twice over: `proxy`
 * runs on the Node.js runtime unconditionally and rejects route segment
 * config, and the Cloudflare adapter refuses to bundle a Node.js proxy at all,
 * so `.open-next/worker.js` is simply never emitted.
 *
 * That failure is silent from the application's point of view. Everything
 * typechecks, every test passes, the standard Next build succeeds, and only
 * the Worker build fails. These guards make the constraint explicit so the
 * deprecation notice does not quietly cost a release.
 */

const root = process.cwd()
const read = (...p: string[]) => readFileSync(join(root, ...p), 'utf8')
const has = (...p: string[]) => existsSync(join(root, ...p))

describe('the scheme upgrade stays deployable on Cloudflare', () => {
  it('uses the middleware convention, which runs on the edge', () => {
    assert.ok(has('src', 'middleware.ts'), 'src/middleware.ts is missing')
  })

  it('does not use the proxy convention, which is Node-only', () => {
    assert.ok(
      !has('src', 'proxy.ts') && !has('proxy.ts'),
      'a proxy file is present; the Cloudflare adapter will not emit a Worker'
    )
  })

  it('declares no runtime in its config', () => {
    // Middleware is edge by default. Naming a runtime is what triggered
    // "Route segment config is not allowed in Proxy file".
    assert.ok(
      !/runtime:\s*['"]/.test(read('src', 'middleware.ts')),
      'a runtime is declared; remove it and let middleware default to edge'
    )
  })

  it('records why the deprecation notice is not being followed', () => {
    const source = read('src', 'middleware.ts')
    assert.match(
      source,
      /proxy/i,
      'the reason for keeping the deprecated convention is not documented'
    )
  })

  it('keeps the upgrade limited to browsable routes', () => {
    assert.match(read('src', 'middleware.ts'), /matcher:/, 'no matcher; every asset would be checked')
  })
})
