import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  checkIntakeRateLimit,
  checkVerifyRateLimit,
  requestKeyFromHeaders,
  type RateLimiterPort,
} from '../../src/lib/seed-access/rateLimit'
import { verifyInvitation } from '../../src/lib/seed-access/invitationService'
import { generateInvitationToken, hashInvitationToken } from '../../src/lib/seed-access/tokens'
import { FakeSeedAccessStore } from './fakeStore'

function setup(overrides = {}) {
  const store = new FakeSeedAccessStore()
  const token = generateInvitationToken()
  const invitation = store.addInvitation(hashInvitationToken(token), overrides)
  return { store, token, invitation }
}

describe('invitation verification', () => {
  it('verifies a valid invitation and returns only safe fields', async () => {
    const { store, token } = setup()
    const result = await verifyInvitation(store, token)

    assert.ok(result.valid)
    assert.equal(result.invitation.productAssignment, 'face_elixir')
    assert.equal(result.invitation.maskedEmail, 'p***@example.invalid')
    assert.equal(result.invitation.firstName, 'Ada')

    // Nothing internal may be present.
    const keys = Object.keys(result.invitation).sort()
    assert.deepEqual(keys, ['firstName', 'maskedEmail', 'productAssignment'])
  })

  it('returns the assigned product for a body elixir invitation', async () => {
    const { store, token } = setup({ productAssignment: 'body_elixir' })
    const result = await verifyInvitation(store, token)
    assert.ok(result.valid)
    assert.equal(result.invitation.productAssignment, 'body_elixir')
  })

  const invalidCases: Array<[string, unknown, Record<string, unknown>]> = [
    ['missing token', null, {}],
    ['malformed token', 'not-a-token', {}],
    ['unknown token', generateInvitationToken(), {}],
  ]

  for (const [label, tokenValue] of invalidCases) {
    it(`returns an identical failure for: ${label}`, async () => {
      const store = new FakeSeedAccessStore()
      const result = await verifyInvitation(store, tokenValue)
      assert.deepEqual(result, { valid: false })
    })
  }

  const stateCases: Array<[string, Record<string, unknown>]> = [
    ['expired', { expiresAt: new Date(Date.now() - 86_400_000).toISOString() }],
    ['redeemed', { status: 'redeemed', redeemedAt: new Date().toISOString() }],
    ['revoked', { status: 'revoked' }],
    ['declined', { status: 'declined' }],
  ]

  for (const [label, overrides] of stateCases) {
    it(`returns an identical failure for a ${label} invitation`, async () => {
      const { store, token } = setup(overrides)
      const result = await verifyInvitation(store, token)
      assert.deepEqual(
        result,
        { valid: false },
        `a ${label} invitation must be indistinguishable from any other failure`
      )
    })
  }

  it('treats an expired-but-still-issued invitation as invalid without a sweep job', async () => {
    const { store, token } = setup({
      status: 'issued',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    })
    const result = await verifyInvitation(store, token)
    assert.deepEqual(result, { valid: false })
  })

  it('returns an identical failure when storage is down', async () => {
    const { store, token } = setup()
    store.failLookup = true
    const result = await verifyInvitation(store, token)
    assert.deepEqual(result, { valid: false })
  })

  it('records an audit event for success and for failure', async () => {
    const { store, token } = setup()
    await verifyInvitation(store, token)
    assert.ok(store.eventTypes().includes('invitation_verified'))

    const store2 = new FakeSeedAccessStore()
    await verifyInvitation(store2, generateInvitationToken())
    assert.ok(store2.eventTypes().includes('invitation_verification_failed'))
  })

  it('never puts a raw token into an audit event', async () => {
    const { store, token } = setup()
    await verifyInvitation(store, token)
    const serialized = JSON.stringify(store.events)
    assert.ok(!serialized.includes(token), 'raw token must never reach an audit event')
  })
})

describe('rate limiting', () => {
  const allowAll: RateLimiterPort = { async check() { return 'allow' } }
  const limited: RateLimiterPort = { async check() { return 'rate_limited' } }
  const broken: RateLimiterPort = { async check() { return 'unavailable' } }

  it('allows verification within the limit', async () => {
    assert.equal(await checkVerifyRateLimit(allowAll, 'ip'), 'allow')
  })

  it('denies verification over the limit', async () => {
    assert.equal(await checkVerifyRateLimit(limited, 'ip'), 'deny')
  })

  it('FAILS CLOSED when the verification limiter is unavailable', async () => {
    assert.equal(await checkVerifyRateLimit(broken, 'ip'), 'deny')
  })

  it('FAILS CLOSED when no verification limiter is configured', async () => {
    assert.equal(await checkVerifyRateLimit(null, 'ip'), 'deny')
  })

  it('FAILS OPEN for intake when the limiter is unavailable', async () => {
    assert.equal(await checkIntakeRateLimit(broken, 'ip'), 'allow')
    assert.equal(await checkIntakeRateLimit(null, 'ip'), 'allow')
  })

  it('denies intake over the limit', async () => {
    assert.equal(await checkIntakeRateLimit(limited, 'ip'), 'deny')
  })

  it('derives a key from headers without using the token or email', () => {
    const headers = new Headers({ 'cf-connecting-ip': '203.0.113.4' })
    assert.equal(requestKeyFromHeaders(headers), '203.0.113.4')

    const forwarded = new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })
    assert.equal(requestKeyFromHeaders(forwarded), '203.0.113.9')

    assert.equal(requestKeyFromHeaders(new Headers()), 'unattributed')
  })
})
