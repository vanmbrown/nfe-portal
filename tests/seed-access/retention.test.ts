import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { assertNoPii } from '../../src/lib/seed-access/auditEvents'
import {
  RETENTION_DAYS,
  getPermissionAuditPeriodDays,
  selectInvitationsForPurge,
  selectParticipantsForRetentionAction,
  selectPermissionsForReview,
} from '../../src/lib/seed-access/retention'

const NOW = new Date('2026-07-24T00:00:00Z')
const daysAgo = (n: number) =>
  new Date(NOW.getTime() - n * 86_400_000).toISOString()

describe('retention — invitations', () => {
  it('selects invitations expired beyond 90 days', () => {
    const due = selectInvitationsForPurge(
      [{ id: 'a', status: 'expired', expiresAt: daysAgo(91) }],
      NOW
    )
    assert.equal(due.length, 1)
    assert.equal(due[0].action, 'purge_invitation')
  })

  it('leaves invitations inside the 90-day window alone', () => {
    const due = selectInvitationsForPurge(
      [{ id: 'a', status: 'expired', expiresAt: daysAgo(89) }],
      NOW
    )
    assert.equal(due.length, 0)
  })

  it('selects declined invitations beyond 90 days from the decline date', () => {
    const due = selectInvitationsForPurge(
      [
        {
          id: 'a',
          status: 'declined',
          expiresAt: daysAgo(200),
          declinedAt: daysAgo(91),
        },
      ],
      NOW
    )
    assert.equal(due.length, 1)
    assert.equal(due[0].dueSince, daysAgo(91))
  })

  it('never purges a redeemed invitation on the invitation schedule', () => {
    const due = selectInvitationsForPurge(
      [
        {
          id: 'a',
          status: 'redeemed',
          expiresAt: daysAgo(500),
          redeemedAt: daysAgo(400),
        },
      ],
      NOW
    )
    assert.equal(due.length, 0, 'a redeemed invitation belongs to a participant record')
  })

  it('catches an issued invitation that simply aged out', () => {
    const due = selectInvitationsForPurge(
      [{ id: 'a', status: 'issued', expiresAt: daysAgo(120) }],
      NOW
    )
    assert.equal(due.length, 1)
  })
})

describe('retention — participants', () => {
  it('selects completed participants after 24 months', () => {
    const due = selectParticipantsForRetentionAction(
      [
        {
          id: 'p1',
          participationStatus: 'completed',
          completedAt: daysAgo(RETENTION_DAYS.completedParticipant + 1),
        },
      ],
      NOW
    )
    assert.equal(due.length, 1)
    assert.equal(due[0].action, 'purge_participant')
  })

  it('leaves completed participants inside the 24-month window alone', () => {
    const due = selectParticipantsForRetentionAction(
      [{ id: 'p1', participationStatus: 'completed', completedAt: daysAgo(400) }],
      NOW
    )
    assert.equal(due.length, 0)
  })

  it('selects withdrawn participants after 30 days for anonymisation', () => {
    const due = selectParticipantsForRetentionAction(
      [{ id: 'p1', participationStatus: 'withdrawn', withdrawnAt: daysAgo(31) }],
      NOW
    )
    assert.equal(due.length, 1)
    assert.equal(due[0].action, 'anonymize_withdrawn_participant')
  })

  it('leaves a recently withdrawn participant alone', () => {
    const due = selectParticipantsForRetentionAction(
      [{ id: 'p1', participationStatus: 'withdrawn', withdrawnAt: daysAgo(10) }],
      NOW
    )
    assert.equal(due.length, 0)
  })

  it('skips records that were already anonymised', () => {
    const due = selectParticipantsForRetentionAction(
      [
        {
          id: 'p1',
          participationStatus: 'withdrawn',
          withdrawnAt: daysAgo(90),
          anonymizedAt: daysAgo(60),
        },
      ],
      NOW
    )
    assert.equal(due.length, 0)
  })
})

describe('retention — permissions', () => {
  it('is BLOCKED while the audit period is undecided', () => {
    const outcome = selectPermissionsForReview(
      [{ participantId: 'p1', permissionsWithdrawnAt: daysAgo(999), contentStillInUse: false }],
      NOW,
      null
    )
    assert.equal(outcome.resolved, false)
    assert.ok(!outcome.resolved && outcome.blockedReason === 'permission_audit_period_unset')
  })

  it('protects permission records while content is still in use', () => {
    const outcome = selectPermissionsForReview(
      [{ participantId: 'p1', permissionsWithdrawnAt: daysAgo(999), contentStillInUse: true }],
      NOW,
      30
    )
    assert.ok(outcome.resolved)
    assert.equal(outcome.candidates.length, 0)
  })

  it('selects permissions once content is retired and the period has elapsed', () => {
    const outcome = selectPermissionsForReview(
      [{ participantId: 'p1', permissionsWithdrawnAt: daysAgo(31), contentStillInUse: false }],
      NOW,
      30
    )
    assert.ok(outcome.resolved)
    assert.equal(outcome.candidates.length, 1)
  })

  it('reads the audit period from the environment and rejects nonsense', () => {
    assert.equal(getPermissionAuditPeriodDays({}), null)
    assert.equal(getPermissionAuditPeriodDays({ PERMISSION_AUDIT_PERIOD_DAYS: '' }), null)
    assert.equal(getPermissionAuditPeriodDays({ PERMISSION_AUDIT_PERIOD_DAYS: '0' }), null)
    assert.equal(getPermissionAuditPeriodDays({ PERMISSION_AUDIT_PERIOD_DAYS: '-5' }), null)
    assert.equal(getPermissionAuditPeriodDays({ PERMISSION_AUDIT_PERIOD_DAYS: 'soon' }), null)
    assert.equal(getPermissionAuditPeriodDays({ PERMISSION_AUDIT_PERIOD_DAYS: '90' }), 90)
  })

  it('has no committed production value for the audit period', () => {
    assert.equal(
      getPermissionAuditPeriodDays(process.env),
      null,
      'PERMISSION_AUDIT_PERIOD_DAYS must remain an unresolved policy decision'
    )
  })
})

describe('retention — output safety', () => {
  it('reports record IDs and actions only, never participant fields', () => {
    const due = selectParticipantsForRetentionAction(
      [{ id: 'p1', participationStatus: 'withdrawn', withdrawnAt: daysAgo(31) }],
      NOW
    )
    assert.deepEqual(Object.keys(due[0]).sort(), ['action', 'dueSince', 'recordId'])
  })
})

describe('audit metadata PII guard', () => {
  it('rejects an email in metadata', () => {
    assert.throws(() => assertNoPii({ who: 'ada@example.invalid' }), /looks like email/)
  })

  it('rejects a raw invitation token in metadata', () => {
    assert.throws(() => assertNoPii({ t: 'a'.repeat(43) }), /invitation_token/)
  })

  it('rejects long freeform text in metadata', () => {
    assert.throws(() => assertNoPii({ note: 'x'.repeat(200) }), /long_freeform_text/)
  })

  it('allows enums, counts, and booleans', () => {
    assert.doesNotThrow(() =>
      assertNoPii({ product: 'face_elixir', count: 3, granted: true, reason: null })
    )
  })
})
