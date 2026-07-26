import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { allProductSlugs, productData } from '@/content/products/registry'

/**
 * Guards the product-architecture cleanup recorded in
 * docs/upgrades/PRODUCT_ARCHITECTURE_AUDIT.md. The dynamic /products/[slug]
 * route was removed because both registered slugs are served by dedicated
 * static pages; these tests protect that invariant so a future change
 * doesn't silently reopen the removed route's failure modes.
 */

const root = process.cwd()
const src = (path: string) => join(root, 'src', path)

describe('product registry', () => {
  it('declares only the two canonical slugs', () => {
    assert.deepEqual([...allProductSlugs].sort(), ['body-elixir', 'face-elixir'])
  })

  it('has a loader for each declared slug', () => {
    for (const slug of allProductSlugs) {
      assert.equal(typeof productData[slug], 'function', `missing loader for ${slug}`)
    }
  })
})

describe('canonical product routes remain', () => {
  it('Face Elixir has its own static page', () => {
    assert.ok(existsSync(src('app/products/face-elixir/page.tsx')))
  })

  it('Body Elixir has its own static page', () => {
    assert.ok(existsSync(src('app/products/body-elixir/page.tsx')))
  })
})

describe('removed dynamic route stays removed', () => {
  it('has no /products/[slug] segment', () => {
    assert.ok(!existsSync(src('app/products/[slug]')))
  })

  it('has no route-only supporting files left behind', () => {
    for (const path of [
      'components/products/ProductHero.tsx',
      'components/products/RitualPairing.tsx',
      'app/shop/ShopCard.tsx',
      'components/products/ProductCard.tsx',
      'components/products/FaceElixirSections.tsx',
    ]) {
      assert.ok(!existsSync(src(path)), `${path} should have been removed`)
    }
  })
})

describe('canonical product pages carry no dead status language', () => {
  const canonicalFiles = [
    'app/products/face-elixir/page.tsx',
    'app/products/body-elixir/page.tsx',
    'app/shop/page.tsx',
    'components/atelier/ElixirEditorialPage.tsx',
  ]

  it('contains no "Coming Soon" placeholder text', () => {
    for (const path of canonicalFiles) {
      const contents = readFileSync(src(path), 'utf8')
      assert.doesNotMatch(contents, /coming soon/i, `${path} should not contain "Coming Soon"`)
    }
  })

  it('contains no "Join Waitlist" CTA', () => {
    for (const path of canonicalFiles) {
      const contents = readFileSync(src(path), 'utf8')
      assert.doesNotMatch(contents, /join.{0,4}waitlist/i, `${path} should not contain a waitlist CTA`)
    }
  })

  it('carries the approved Founder Access status wording on /shop', () => {
    const contents = readFileSync(src('app/shop/page.tsx'), 'utf8')
    assert.match(contents, /Founder Access opens first/)
  })
})
