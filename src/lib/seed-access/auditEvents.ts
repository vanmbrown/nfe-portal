/**
 * Operational audit events for Study Circle.
 *
 * These are NOT analytics. They are a server-side record of what happened to
 * an invitation or a participant, written to `seed_events`.
 *
 * Metadata is restricted by type to enums, booleans, numbers, timestamps, and
 * internal record IDs. Raw tokens, full emails, phone numbers, names, freeform
 * feedback, sensitivities text, and testimonial text must never appear — the
 * `SeedEventMetadata` type keeps values primitive, and `assertNoPii` is a
 * runtime backstop for the string values that do get through.
 */

export const SEED_EVENT_TYPES = {
  invitationCreated: 'invitation_created',
  invitationVerified: 'invitation_verified',
  invitationVerificationFailed: 'invitation_verification_failed',
  intakeStarted: 'intake_started',
  intakeSubmitted: 'intake_submitted',
  invitationRedeemed: 'invitation_redeemed',
  confirmationEmailRequested: 'confirmation_email_requested',
  confirmationEmailSent: 'confirmation_email_sent',
  confirmationEmailFailed: 'confirmation_email_failed',
  internalNotificationRequested: 'internal_notification_requested',
  internalNotificationSent: 'internal_notification_sent',
  internalNotificationFailed: 'internal_notification_failed',
  participantWithdrawn: 'participant_withdrawn',
  permissionsUpdated: 'permissions_updated',
  retentionReviewDue: 'retention_review_due',
  recordAnonymized: 'record_anonymized',
  recordDeleted: 'record_deleted',
} as const

export type SeedEventType = (typeof SEED_EVENT_TYPES)[keyof typeof SEED_EVENT_TYPES]

export type SeedEventMetadata = Record<
  string,
  string | number | boolean | null
>

export interface SeedEvent {
  eventType: SeedEventType
  participantId?: string | null
  invitationId?: string | null
  source?: string | null
  metadata?: SeedEventMetadata
}

/**
 * Values that must never reach an audit event, identified structurally rather
 * than by key name so a renamed field cannot smuggle one through.
 */
const PII_SHAPES: Array<{ label: string; test: (v: string) => boolean }> = [
  { label: 'email', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
  { label: 'invitation_token', test: (v) => /^[A-Za-z0-9_-]{43}$/.test(v) },
  { label: 'long_freeform_text', test: (v) => v.length > 120 },
]

/**
 * Throws if a metadata value looks like PII. Called before every write, so a
 * mistake fails loudly in tests rather than quietly persisting a participant's
 * email into an operational log.
 */
export function assertNoPii(metadata: SeedEventMetadata | undefined): void {
  if (!metadata) return
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value !== 'string') continue
    for (const shape of PII_SHAPES) {
      if (shape.test(value)) {
        throw new Error(
          `Refusing to write audit metadata: key "${key}" looks like ${shape.label}.`
        )
      }
    }
  }
}
