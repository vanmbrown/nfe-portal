import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { MockEmailAdapter } from '../../src/lib/seed-access/email'
import { submitIntake } from '../../src/lib/seed-access/intakeService'
import { generateInvitationToken, hashInvitationToken } from '../../src/lib/seed-access/tokens'
import { validateIntakePayload, type StudyCircleIntakeInput } from '../../src/lib/seed-access/validation'
import { FakeSeedAccessStore } from './fakeStore'

function buildInput(token: string, overrides: Record<string, unknown> = {}) {
  const result = validateIntakePayload({
    token,
    firstName: 'Ada',
    lastName: 'Okonkwo',
    email: 'participant@example.invalid',
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
  })
  assert.ok(result.ok, 'test fixture must be a valid payload')
  return result.value as StudyCircleIntakeInput
}

function setup(invitationOverrides = {}) {
  const store = new FakeSeedAccessStore()
  const email = new MockEmailAdapter()
  const token = generateInvitationToken()
  store.addInvitation(hashInvitationToken(token), invitationOverrides)
  return { store, email, token }
}

describe('intake submission', () => {
  it('persists a participant for a valid submission', async () => {
    const { store, email, token } = setup()
    const result = await submitIntake({ store, email }, buildInput(token))

    assert.ok(result.ok)
    assert.equal(store.participants.length, 1)
    assert.equal(store.participants[0].id, result.participantId)
  })

  it('derives product assignment from the invitation, not the payload', async () => {
    const { store, email, token } = setup({ productAssignment: 'body_elixir' })
    // The payload tries to claim face_elixir; it must have no effect.
    const input = buildInput(token, { productAssignment: 'face_elixir' })
    const result = await submitIntake({ store, email }, input)

    assert.ok(result.ok)
    const confirmation = email.sent.find((m) => m.subject.includes('confirmed'))
    assert.ok(confirmation)
    assert.ok(
      confirmation.html.includes('Body Elixir'),
      'the confirmation must reflect the invitation assignment'
    )
    assert.ok(!confirmation.html.includes('Face Elixir'))
  })

  it('redeems the invitation exactly once', async () => {
    const { store, email, token } = setup()
    const first = await submitIntake({ store, email }, buildInput(token))
    assert.ok(first.ok)

    const second = await submitIntake({ store, email }, buildInput(token))
    assert.equal(second.ok, false)
    assert.ok(!second.ok && second.reason === 'invitation_unavailable')
    assert.equal(store.participants.length, 1, 'no duplicate participant')
  })

  it('lets only one of two simultaneous submissions succeed', async () => {
    const { store, email, token } = setup()
    const [a, b] = await Promise.all([
      submitIntake({ store, email }, buildInput(token)),
      submitIntake({ store, email }, buildInput(token)),
    ])

    const successes = [a, b].filter((r) => r.ok).length
    assert.equal(successes, 1, 'exactly one concurrent submission may redeem')
    assert.equal(store.participants.length, 1)
  })

  it('rejects an email that does not match the invitation', async () => {
    const { store, email, token } = setup()
    const input = buildInput(token, { email: 'someone-else@example.invalid' })
    const result = await submitIntake({ store, email }, input)

    assert.equal(result.ok, false)
    assert.ok(!result.ok && result.reason === 'invitation_unavailable')
    assert.equal(store.participants.length, 0)
  })

  it('does not consume the invitation on an email mismatch', async () => {
    const { store, email, token } = setup()
    await submitIntake({ store, email }, buildInput(token, { email: 'wrong@example.invalid' }))

    // The rightful participant can still redeem afterwards.
    const result = await submitIntake({ store, email }, buildInput(token))
    assert.ok(result.ok)
  })

  it('rejects an expired invitation', async () => {
    const { store, email, token } = setup({
      expiresAt: new Date(Date.now() - 86_400_000).toISOString(),
    })
    const result = await submitIntake({ store, email }, buildInput(token))
    assert.equal(result.ok, false)
    assert.equal(store.participants.length, 0)
  })

  it('rejects a revoked invitation', async () => {
    const { store, email, token } = setup({ status: 'revoked' })
    const result = await submitIntake({ store, email }, buildInput(token))
    assert.equal(result.ok, false)
  })

  it('rejects a declined invitation', async () => {
    const { store, email, token } = setup({ status: 'declined' })
    const result = await submitIntake({ store, email }, buildInput(token))
    assert.equal(result.ok, false)
  })

  it('reports a storage failure without creating a participant', async () => {
    const { store, email, token } = setup()
    store.failRedeem = true
    const result = await submitIntake({ store, email }, buildInput(token))
    assert.equal(result.ok, false)
    assert.ok(!result.ok && result.reason === 'storage_error')
    assert.equal(store.participants.length, 0)
  })

  it('stores optional permissions independently', async () => {
    const { store, email, token } = setup()
    const input = buildInput(token, {
      permissions: { quotePermission: true, websitePermission: true },
    })
    await submitIntake({ store, email }, input)

    const stored = store.participants[0].intake.permissions
    assert.equal(stored.quotePermission, true)
    assert.equal(stored.websitePermission, true)
    assert.equal(stored.paidMediaPermission, false, 'paid media is never implied')
    assert.equal(stored.photoPermission, false)
    assert.equal(stored.marketingPermission, false)
  })

  it('carries consent and permission versions, not client timestamps', async () => {
    const { store, email, token } = setup()
    await submitIntake({ store, email }, buildInput(token))
    const stored = store.participants[0].intake

    assert.ok(stored.consentVersion.startsWith('study-circle-consent-'))
    assert.ok(stored.permissionVersion.startsWith('study-circle-permissions-'))
    assert.ok(stored.confidentialityVersion.startsWith('study-circle-confidentiality-'))
  })

  it('writes the expected audit events', async () => {
    const { store, email, token } = setup()
    await submitIntake({ store, email }, buildInput(token))
    const types = store.eventTypes()

    for (const expected of [
      'intake_submitted',
      'invitation_redeemed',
      'confirmation_email_requested',
      'confirmation_email_sent',
    ]) {
      assert.ok(types.includes(expected), `expected audit event: ${expected}`)
    }
  })

  it('never writes a raw token or an email into an audit event', async () => {
    const { store, email, token } = setup()
    await submitIntake({ store, email }, buildInput(token))
    const serialized = JSON.stringify(store.events)

    assert.ok(!serialized.includes(token), 'no raw token in audit events')
    assert.ok(
      !serialized.includes('participant@example.invalid'),
      'no participant email in audit events'
    )
  })
})

describe('intake email behaviour', () => {
  it('still confirms the place when the confirmation email fails', async () => {
    const { store, email, token } = setup()
    email.failOnce()

    const result = await submitIntake({ store, email }, buildInput(token))
    assert.ok(result.ok, 'a mail failure must not cost the participant their place')
    assert.equal(result.emailDelivered, false)
    assert.equal(store.participants.length, 1)
  })

  it('records a failed send instead of swallowing it', async () => {
    const { store, email, token } = setup()
    email.failOnce()
    await submitIntake({ store, email }, buildInput(token))

    assert.ok(
      store.eventTypes().includes('confirmation_email_failed'),
      'a failed send must be discoverable in the audit trail'
    )
  })

  it('sends an internal notification when an admin address is configured', async () => {
    const { store, email, token } = setup()
    await submitIntake(
      { store, email, adminEmail: 'ops@example.invalid' },
      buildInput(token)
    )

    const internal = email.sent.find((m) => m.subject === 'New NFE Study Circle participant')
    assert.ok(internal)
    assert.ok(store.eventTypes().includes('internal_notification_sent'))
  })

  it('never puts a raw invitation token in any email', async () => {
    const { store, email, token } = setup()
    await submitIntake(
      { store, email, adminEmail: 'ops@example.invalid' },
      buildInput(token)
    )

    for (const message of email.sent) {
      assert.ok(!message.html.includes(token), 'no raw token may appear in an email')
    }
  })

  it('does not duplicate a message when retried with the same idempotency key', async () => {
    const email = new MockEmailAdapter()
    const message = {
      to: 'ada@example.invalid',
      subject: 'Your place in The NFE Study Circle is confirmed',
      html: '<p>hello</p>',
      idempotencyKey: 'sc-confirmation:par-1',
    }
    await email.send(message)
    await email.send(message)
    assert.equal(email.sent.length, 1, 'a retry must not produce a second message')
  })
})
