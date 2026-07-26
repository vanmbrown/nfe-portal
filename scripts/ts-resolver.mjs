import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve as resolvePath } from 'node:path'

/**
 * Test-only module resolution shim.
 *
 * Two gaps between how the bundler resolves modules and how Node's ESM loader
 * does, bridged here so `node --test` can exercise application source directly:
 *
 *   1. Node requires explicit file extensions; the source imports
 *      extensionlessly, as the bundler expects.
 *   2. Node does not read tsconfig path aliases; the source uses "@/…".
 *
 * Doing it here means no production file is modified to suit the test runner.
 */

const projectRoot = resolvePath(dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = join(projectRoot, 'src')

function firstExisting(basePath) {
  for (const candidate of [basePath, `${basePath}.ts`, `${basePath}.tsx`, join(basePath, 'index.ts')]) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

export async function resolve(specifier, context, nextResolve) {
  // "@/lib/foo" -> "<root>/src/lib/foo.ts"
  if (specifier.startsWith('@/')) {
    const resolved = firstExisting(join(srcRoot, specifier.slice(2)))
    if (resolved) return nextResolve(pathToFileURL(resolved).href, context)
  }

  const isRelative = specifier.startsWith('./') || specifier.startsWith('../')
  const hasExtension = /\.[mc]?[jt]sx?$|\.json$/.test(specifier)

  if (isRelative && !hasExtension && context.parentURL) {
    const base = new URL('.', context.parentURL)
    for (const candidate of [`${specifier}.ts`, `${specifier}.tsx`, `${specifier}/index.ts`]) {
      const url = new URL(candidate, base)
      if (existsSync(fileURLToPath(url))) {
        return nextResolve(url.href, context)
      }
    }
  }

  return nextResolve(specifier, context)
}
