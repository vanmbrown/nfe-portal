import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  generateInvitationToken,
  hashInvitationToken,
  hashesMatch,
  isPlausibleTokenShape,
  maskEmail,
  normalizeEmail,
} from '../../src/lib/seed-access/tokens'

describe('invitation tokens', () => {
  it('generates unguessable, unique tokens', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 500; i++) seen.add(generateInvitationToken())
    assert.equal(seen.size, 500, 'every generated token must be unique')
  })

  it('generates tokens of the expected shape', () => {
    const token = generateInvitationToken()
    assert.ok(isPlausibleTokenShape(token))
    assert.equal(token.length, 43, '32 random bytes base64url-encode to 43 chars')
  })

  it('hashes deterministically and irreversibly', () => {
    const token = generateInvitationToken()
    const a = hashInvitationToken(token)
    const b = hashInvitationToken(token)
    assert.equal(a, b)
    assert.equal(a.length, 64, 'sha256 hex')
    assert.notEqual(a, token, 'the hash must never equal the raw token')
    assert.ok(!a.includes(token), 'the hash must not contain the raw token')
  })

  it('produces different hashes for different tokens', () => {
    assert.notEqual(
      hashInvitationToken(generateInvitationToken()),
      hashInvitationToken(generateInvitationToken())
    )
  })

  it('rejects malformed token shapes', () => {
    for (const bad of ['', 'short', null, undefined, 42, {}, 'a'.repeat(44), 'has spaces!']) {
      assert.equal(isPlausibleTokenShape(bad), false, `should reject: ${String(bad)}`)
    }
  })

  it('compares hashes safely', () => {
    const h = hashInvitationToken('x')
    assert.equal(hashesMatch(h, h), true)
    assert.equal(hashesMatch(h, hashInvitationToken('y')), false)
    assert.equal(hashesMatch(h, 'short'), false)
  })

  it('masks emails without revealing the local part', () => {
    assert.equal(maskEmail('vanessa@example.invalid'), 'v***@example.invalid')
    assert.equal(maskEmail('a@b.co'), 'a***@b.co')
    assert.equal(maskEmail('not-an-email'), '***')
    assert.equal(maskEmail(''), '***')
  })

  it('normalizes emails for binding comparison', () => {
    assert.equal(normalizeEmail('  Vanessa@Example.Invalid '), 'vanessa@example.invalid')
  })
})
