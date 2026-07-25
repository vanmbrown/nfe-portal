import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/**
 * Resolves extensionless relative imports to their .ts files.
 *
 * Node's ESM loader requires explicit file extensions. The application source
 * imports extensionlessly (as the bundler expects), so this hook bridges the
 * two for `node --test` without touching a single source file and without
 * adding a test dependency.
 */
export async function resolve(specifier, context, nextResolve) {
  const isRelative = specifier.startsWith('./') || specifier.startsWith('../')
  const hasExtension = /\.[mc]?[jt]sx?$|\.json$/.test(specifier)

  if (isRelative && !hasExtension && context.parentURL) {
    const base = new URL('.', context.parentURL)
    for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
      const url = new URL(candidate, base)
      if (existsSync(fileURLToPath(url))) {
        return nextResolve(url.href, context)
      }
    }
  }

  return nextResolve(specifier, context)
}
