import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

/**
 * The mock upload architecture is gone and must stay gone.
 *
 * `/api/uploads/put` accepted caller-supplied bytes and wrote them to the
 * server filesystem under a hard-coded mock user id, with no authentication, no
 * size limit and no type allowlist. It could never have worked on the Cloudflare
 * runtime, which has no writable filesystem, so its own failure was the only
 * thing standing between it and an open file-write endpoint.
 *
 * Deleted rather than repaired, after proving the one live caller could be moved
 * onto the real Supabase-backed path.
 */

const root = process.cwd()
const has = (...p: string[]) => existsSync(join(root, ...p))
const read = (...p: string[]) => readFileSync(join(root, ...p), 'utf8')

/** Every source file, so a reintroduction anywhere is caught. */
function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`
    if (entry.isDirectory()) sourceFiles(rel, acc)
    else if (/\.tsx?$/.test(entry.name)) acc.push(rel)
  }
  return acc
}

describe('retired upload surface: the files are gone', () => {
  for (const path of [
    ['src', 'app', 'api', 'uploads'],
    ['src', 'app', 'api', 'uploads', 'put', 'route.ts'],
    ['src', 'app', 'api', 'uploads', 'signed', 'route.ts'],
    ['src', 'app', 'api', 'uploads', 'record', 'route.ts'],
    ['src', 'lib', 'storage', 'localFs.ts'],
    ['src', 'lib', 'auth', 'mockAuth.tsx'],
  ]) {
    it(`${path.join('/')} no longer exists`, () => {
      assert.ok(!has(...path), `${path.join('/')} is back`)
    })
  }
})

describe('retired upload surface: nothing references it', () => {
  const files = sourceFiles('src')

  it('no source file calls the retired endpoints', () => {
    const offenders = files.filter((f) =>
      /api\/uploads\/(put|signed|record)/.test(read(...f.split('/')))
    )
    assert.deepEqual(offenders, [], `still calling a retired upload endpoint: ${offenders}`)
  })

  it('no source file imports the mock auth or local filesystem adapter', () => {
    const offenders = files.filter((f) =>
      /mockAuth|localFsAdapter/.test(read(...f.split('/')))
    )
    assert.deepEqual(offenders, [], `still importing mock auth or local storage: ${offenders}`)
  })

  it('no source file writes to the filesystem at request time', () => {
    // A Worker has no writable filesystem; anything reaching for one is either
    // dead or a bug waiting to surface in production.
    const offenders = files
      .filter((f) => f.startsWith('src/app/api/') || f.startsWith('src/lib/storage/'))
      .filter((f) => /\bwriteFile|createWriteStream|\bmkdir\(/.test(read(...f.split('/'))))
    assert.deepEqual(offenders, [], `request-time filesystem write: ${offenders}`)
  })
})

describe('retired upload surface: the caller was migrated, not stranded', () => {
  it('the enclave uploader sends participants to the real experience', () => {
    const page = read('src', 'app', 'focus-group', 'enclave', 'upload', 'page.tsx')
    assert.match(page, /permanentRedirect\('\/focus-group\/upload'\)/, 'not migrated')
  })

  it('the enclave resources link points at the real uploader', () => {
    const page = read('src', 'app', 'focus-group', 'enclave', 'resources', 'page.tsx')
    assert.ok(page.includes('"/focus-group/upload"'), 'resources still points at the prototype')
  })

  it('the real upload path is authenticated and backed by Supabase storage', () => {
    const route = read('src', 'app', 'api', 'focus-group', 'uploads', 'route.ts')
    assert.match(route, /supabase\.auth\.getUser\(\)/, 'the real endpoint does not authenticate')
    assert.match(route, /uploadToSupabaseStorage/, 'the real endpoint does not use object storage')
    assert.match(route, /status:\s*401/, 'the real endpoint does not reject anonymous callers')
  })
})
