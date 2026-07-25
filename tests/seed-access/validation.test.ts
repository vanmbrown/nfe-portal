import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { generateInvitationToken } from '../../src/lib/seed-access/tokens'
import { validateIntakePayload } from '../../src/lib/seed-access/validation'

function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    token: generateInvitationToken(),
    firstName: 'Ada',
    lastName: 'Okonkwo',
    email: 'Ada@Example.Invalid',
    ageRange: '45–54',
    skinType: 'Dry',
    primaryConcerns: ['Dryness'],
    willingToUseAsDirected: true,
    willingToCompleteCheckins: true,
    consent: {
      understandsExpectations: true,
      privacyPolicy: true,
      studyContact: true,
      honestFeedback: true,
      internalLearning: true,
      confidentiality: true,
    },
    permissions: {},
    ...overrides,
  }
}

describe('intake validation', () => {
  it('accepts a complete valid payload', () => {
    const result = validateIntakePayload(validPayload())
    assert.equal(result.ok, true)
  })

  it('normalizes the email', () => {
    const result = validateIntakePayload(validPayload())
    assert.ok(result.ok)
    assert.equal(result.value.email, 'ada@example.invalid')
  })

  it('rejects a malformed payload', () => {
    for (const bad of [null, undefined, 'string', 42]) {
      const result = validateIntakePayload(bad)
      assert.equal(result.ok, false)
    }
  })

  it('rejects a malformed token', () => {
    const result = validateIntakePayload(validPayload({ token: 'nope' }))
    assert.equal(result.ok, false)
    assert.ok(!result.ok && result.reason === 'invalid_token_shape')
  })

  it('requires first name, last name, and email', () => {
    for (const field of ['firstName', 'lastName', 'email']) {
      const result = validateIntakePayload(validPayload({ [field]: '' }))
      assert.equal(result.ok, false, `missing ${field} must fail`)
    }
  })

  it('rejects values outside the approved option sets', () => {
    assert.equal(validateIntakePayload(validPayload({ ageRange: 'Ageless' })).ok, false)
    assert.equal(validateIntakePayload(validPayload({ skinType: 'Radiant' })).ok, false)
    assert.equal(
      validateIntakePayload(validPayload({ preferredContactMethod: 'Telepathy' })).ok,
      false
    )
  })

  it('drops unknown skin concerns rather than trusting them', () => {
    const result = validateIntakePayload(
      validPayload({ primaryConcerns: ['Dryness', 'Not A Real Concern'] })
    )
    assert.ok(result.ok)
    assert.deepEqual(result.value.primaryConcerns, ['Dryness'])
  })

  it('requires at least one skin concern', () => {
    assert.equal(validateIntakePayload(validPayload({ primaryConcerns: [] })).ok, false)
  })

  it('requires every one of the six participation consents', () => {
    const keys = [
      'understandsExpectations',
      'privacyPolicy',
      'studyContact',
      'honestFeedback',
      'internalLearning',
      'confidentiality',
    ]
    for (const key of keys) {
      const consent = {
        understandsExpectations: true,
        privacyPolicy: true,
        studyContact: true,
        honestFeedback: true,
        internalLearning: true,
        confidentiality: true,
        [key]: false,
      }
      const result = validateIntakePayload(validPayload({ consent }))
      assert.equal(result.ok, false, `withholding ${key} must block submission`)
      assert.ok(!result.ok && result.reason === 'missing_required_consent')
    }
  })

  it('requires both participation commitments', () => {
    assert.equal(
      validateIntakePayload(validPayload({ willingToUseAsDirected: false })).ok,
      false
    )
    assert.equal(
      validateIntakePayload(validPayload({ willingToCompleteCheckins: false })).ok,
      false
    )
  })

  it('defaults every optional permission to false', () => {
    const result = validateIntakePayload(validPayload({ permissions: {} }))
    assert.ok(result.ok)
    for (const [key, value] of Object.entries(result.value.permissions)) {
      assert.equal(value, false, `${key} must default to false`)
    }
  })

  it('stores optional permissions independently', () => {
    const result = validateIntakePayload(
      validPayload({ permissions: { quotePermission: true, paidMediaPermission: false } })
    )
    assert.ok(result.ok)
    assert.equal(result.value.permissions.quotePermission, true)
    assert.equal(result.value.permissions.paidMediaPermission, false)
    assert.equal(result.value.permissions.photoPermission, false)
    assert.equal(
      result.value.permissions.marketingPermission,
      false,
      'marketing is never implied by another permission'
    )
  })

  it('treats truthy-but-not-true permission values as refusal', () => {
    const result = validateIntakePayload(
      validPayload({ permissions: { quotePermission: 'yes', photoPermission: 1 } })
    )
    assert.ok(result.ok)
    assert.equal(result.value.permissions.quotePermission, false)
    assert.equal(result.value.permissions.photoPermission, false)
  })

  it('never surfaces a client-supplied product assignment', () => {
    const result = validateIntakePayload(
      validPayload({ productAssignment: 'body_elixir', product: 'body_elixir' })
    )
    assert.ok(result.ok)
    assert.equal(
      'productAssignment' in result.value,
      false,
      'product must not survive validation'
    )
    assert.equal('product' in result.value, false)
  })

  it('never surfaces client-supplied server-owned fields', () => {
    const result = validateIntakePayload(
      validPayload({
        status: 'redeemed',
        invitationId: 'inv-hacked',
        id: 'par-hacked',
        source: 'instagram',
        consentVersion: 'forged',
        participationConsentAt: '1999-01-01T00:00:00Z',
        permissionRecordedAt: '1999-01-01T00:00:00Z',
        permissionVersion: 'forged',
      })
    )
    assert.ok(result.ok)
    for (const forbidden of [
      'status',
      'invitationId',
      'id',
      'source',
      'consentVersion',
      'participationConsentAt',
      'permissionRecordedAt',
      'permissionVersion',
    ]) {
      assert.equal(
        forbidden in result.value,
        false,
        `${forbidden} is server-owned and must not survive validation`
      )
    }
  })

  it('bounds field lengths', () => {
    const result = validateIntakePayload(
      validPayload({
        firstName: 'a'.repeat(500),
        sensitivities: 'b'.repeat(5000),
      })
    )
    assert.ok(result.ok)
    assert.equal(result.value.firstName.length, 80)
    assert.equal(result.value.sensitivities?.length, 1200)
  })

  it('treats empty optional strings as absent', () => {
    const result = validateIntakePayload(
      validPayload({ phone: '   ', location: '', additionalContext: '  ' })
    )
    assert.ok(result.ok)
    assert.equal(result.value.phone, undefined)
    assert.equal(result.value.location, undefined)
    assert.equal(result.value.additionalContext, undefined)
  })

  it('rejects an email without a plausible shape', () => {
    for (const bad of ['nope', 'a@b', 'a@@b.co', '@example.invalid']) {
      assert.equal(
        validateIntakePayload(validPayload({ email: bad })).ok,
        false,
        `should reject ${bad}`
      )
    }
  })
})
