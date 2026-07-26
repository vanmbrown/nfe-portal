import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  cleanAgeRange,
  cleanEmail,
  cleanProductInterest,
  cleanSkinInterests,
  cleanString,
  computeHighIntent,
} from '@/lib/founder-access/validation'

/**
 * These guard the live Founder Access form at /founder-access. Every value
 * they accept reaches production storage, so the allowlist behaviour matters:
 * anything not explicitly permitted must be dropped, not passed through.
 */

describe('cleanString', () => {
  it('trims and returns real content', () => {
    assert.equal(cleanString('  hello  '), 'hello')
  })

  it('returns undefined for non-strings and empties', () => {
    for (const value of [undefined, null, 42, {}, [], '', '   ']) {
      assert.equal(cleanString(value), undefined, `should reject: ${JSON.stringify(value)}`)
    }
  })

  it('enforces the length bound', () => {
    assert.equal(cleanString('a'.repeat(500), 10)?.length, 10)
  })
})

describe('cleanEmail', () => {
  it('lowercases and trims', () => {
    assert.equal(cleanEmail('  Vanessa@Example.Invalid '), 'vanessa@example.invalid')
  })

  it('rejects values without an @', () => {
    for (const value of ['nope', '', undefined, 12]) {
      assert.equal(cleanEmail(value), undefined)
    }
  })
})

describe('cleanSkinInterests', () => {
  it('keeps only allowlisted interests', () => {
    const result = cleanSkinInterests(['Dryness', 'Not A Real Interest', 'Radiance'])
    assert.deepEqual(result, ['Dryness', 'Radiance'])
  })

  it('returns an empty array for non-arrays', () => {
    for (const value of [undefined, null, 'Dryness', {}]) {
      assert.deepEqual(cleanSkinInterests(value), [])
    }
  })

  it('ignores non-string members', () => {
    assert.deepEqual(cleanSkinInterests([1, null, 'Dryness']), ['Dryness'])
  })

  it('caps the number of accepted interests', () => {
    const flooded = Array.from({ length: 50 }, () => 'Dryness')
    assert.ok(cleanSkinInterests(flooded).length <= 10)
  })
})

describe('cleanProductInterest', () => {
  it('accepts known product values', () => {
    assert.equal(cleanProductInterest('face_elixir'), 'face_elixir')
    assert.equal(cleanProductInterest('body_elixir'), 'body_elixir')
    assert.equal(cleanProductInterest('both'), 'both')
  })

  it('rejects anything else', () => {
    for (const value of ['gold_elixir', '', undefined, 5, {}]) {
      assert.equal(cleanProductInterest(value), undefined)
    }
  })
})

describe('cleanAgeRange', () => {
  it('accepts a known range', () => {
    assert.equal(cleanAgeRange('45–54'), '45–54')
  })

  it('rejects an unknown range', () => {
    for (const value of ['Ageless', '45-54', undefined, 45]) {
      assert.equal(cleanAgeRange(value), undefined, `should reject: ${String(value)}`)
    }
  })
})

describe('computeHighIntent', () => {
  it('is false without newsletter opt-in, regardless of other signals', () => {
    assert.equal(
      computeHighIntent({
        newsletterOptIn: false,
        productInterest: 'face_elixir',
        topicRequest: 'anything',
      }),
      false
    )
  })

  it('is true for opted-in face or combined product interest', () => {
    assert.equal(
      computeHighIntent({ newsletterOptIn: true, productInterest: 'face_elixir' }),
      true
    )
    assert.equal(computeHighIntent({ newsletterOptIn: true, productInterest: 'both' }), true)
  })

  it('is true for an opted-in topic request without product interest', () => {
    assert.equal(
      computeHighIntent({ newsletterOptIn: true, topicRequest: 'texture' }),
      true
    )
  })

  it('is false for opt-in alone with no other signal', () => {
    assert.equal(computeHighIntent({ newsletterOptIn: true }), false)
    assert.equal(
      computeHighIntent({ newsletterOptIn: true, productInterest: 'body_elixir' }),
      false
    )
  })
})
