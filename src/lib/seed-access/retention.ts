/**
 * Study Circle retention policy (approved policy §12).
 *
 * This module is pure: it decides *what* is due for action given a set of
 * records and a reference time. It never touches a database and never deletes
 * anything. The maintenance script applies these decisions, and only ever
 * destructively with an explicit flag.
 */

export const RETENTION_DAYS = {
  /** Expired or unused invitations: 90 days after expiry. */
  expiredInvitation: 90,
  /** Declined invitations: 90 days after decline. */
  declinedInvitation: 90,
  /** Participant intake and check-ins: 24 months after completion. */
  completedParticipant: 730,
  /** Withdrawn participants: anonymise or delete within 30 days. */
  withdrawnParticipant: 30,
} as const

/**
 * Permission records are retained while the content they authorise is still
 * in use, plus an audit period.
 *
 * That audit period is a policy decision that has NOT been made. It is
 * deliberately left unresolved rather than guessed: committing a number here
 * would silently invent a founder decision. Set it via the environment when it
 * is decided; until then, permission cleanup is reported as "blocked on
 * unresolved policy" and never acted on.
 */
export const PERMISSION_AUDIT_PERIOD_ENV = 'PERMISSION_AUDIT_PERIOD_DAYS'

export function getPermissionAuditPeriodDays(
  env: Record<string, string | undefined> = process.env
): number | null {
  const raw = env[PERMISSION_AUDIT_PERIOD_ENV]
  if (!raw) return null
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

export type RetentionAction =
  | 'purge_invitation'
  | 'purge_participant'
  | 'anonymize_withdrawn_participant'
  | 'review_permissions'

export interface RetentionCandidate {
  action: RetentionAction
  recordId: string
  dueSince: string
}

export interface InvitationRetentionRecord {
  id: string
  status: string
  expiresAt: string
  redeemedAt?: string | null
  declinedAt?: string | null
}

export interface ParticipantRetentionRecord {
  id: string
  participationStatus: string
  completedAt?: string | null
  withdrawnAt?: string | null
  anonymizedAt?: string | null
}

function daysBetween(fromIso: string, now: Date): number {
  const from = new Date(fromIso).getTime()
  if (!Number.isFinite(from)) return -1
  return (now.getTime() - from) / 86_400_000
}

export function selectInvitationsForPurge(
  records: InvitationRetentionRecord[],
  now: Date
): RetentionCandidate[] {
  const out: RetentionCandidate[] = []
  for (const record of records) {
    // A redeemed invitation is part of a live participant's record chain and
    // is never purged on the invitation schedule.
    if (record.status === 'redeemed' || record.redeemedAt) continue

    if (record.status === 'declined') {
      const anchor = record.declinedAt ?? record.expiresAt
      if (daysBetween(anchor, now) >= RETENTION_DAYS.declinedInvitation) {
        out.push({ action: 'purge_invitation', recordId: record.id, dueSince: anchor })
      }
      continue
    }

    // Anything else unredeemed is judged from its expiry, which covers both
    // 'expired' and an 'issued' row that simply aged out without being flipped.
    if (daysBetween(record.expiresAt, now) >= RETENTION_DAYS.expiredInvitation) {
      out.push({
        action: 'purge_invitation',
        recordId: record.id,
        dueSince: record.expiresAt,
      })
    }
  }
  return out
}

export function selectParticipantsForRetentionAction(
  records: ParticipantRetentionRecord[],
  now: Date
): RetentionCandidate[] {
  const out: RetentionCandidate[] = []
  for (const record of records) {
    if (record.anonymizedAt) continue

    if (record.participationStatus === 'withdrawn' && record.withdrawnAt) {
      if (daysBetween(record.withdrawnAt, now) >= RETENTION_DAYS.withdrawnParticipant) {
        out.push({
          action: 'anonymize_withdrawn_participant',
          recordId: record.id,
          dueSince: record.withdrawnAt,
        })
      }
      continue
    }

    if (record.completedAt) {
      if (daysBetween(record.completedAt, now) >= RETENTION_DAYS.completedParticipant) {
        out.push({
          action: 'purge_participant',
          recordId: record.id,
          dueSince: record.completedAt,
        })
      }
    }
  }
  return out
}

export interface PermissionRetentionRecord {
  participantId: string
  permissionsWithdrawnAt?: string | null
  contentStillInUse: boolean
}

export type PermissionRetentionOutcome =
  | { resolved: true; candidates: RetentionCandidate[] }
  | { resolved: false; blockedReason: 'permission_audit_period_unset' }

export function selectPermissionsForReview(
  records: PermissionRetentionRecord[],
  now: Date,
  auditPeriodDays: number | null
): PermissionRetentionOutcome {
  if (auditPeriodDays === null) {
    return { resolved: false, blockedReason: 'permission_audit_period_unset' }
  }
  const candidates: RetentionCandidate[] = []
  for (const record of records) {
    if (record.contentStillInUse) continue
    if (!record.permissionsWithdrawnAt) continue
    if (daysBetween(record.permissionsWithdrawnAt, now) >= auditPeriodDays) {
      candidates.push({
        action: 'review_permissions',
        recordId: record.participantId,
        dueSince: record.permissionsWithdrawnAt,
      })
    }
  }
  return { resolved: true, candidates }
}
