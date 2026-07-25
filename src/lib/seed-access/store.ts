import type { SeedEvent } from './auditEvents'

/**
 * Storage port for Study Circle.
 *
 * The services depend on this interface rather than on a Supabase client, so
 * the whole invitation/intake lifecycle can be exercised by automated tests
 * with an in-memory fake — and so no test can accidentally reach a real
 * database. `supabaseStore.ts` provides the real implementation.
 */

export interface InvitationRecord {
  id: string
  email: string
  participantName: string | null
  productAssignment: string
  source: string
  status: string
  expiresAt: string
  redeemedAt: string | null
}

export interface IntakeRecordInput {
  invitationId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  ageRange: string
  skinType: string
  primaryConcerns: string[]
  currentRoutine?: string
  sensitivities?: string
  fragranceSensitive: boolean
  preferredContactMethod?: string
  location?: string
  additionalContext?: string
  willingToUseAsDirected: boolean
  willingToCompleteCheckins: boolean
  consentVersion: string
  confidentialityVersion: string
  permissionVersion: string
  marketingOptIn: boolean
  permissions: {
    quotePermission: boolean
    quoteLengthEditPermission: boolean
    firstNamePermission: boolean
    fullNamePermission: boolean
    photoPermission: boolean
    videoPermission: boolean
    websitePermission: boolean
    emailPermission: boolean
    organicSocialPermission: boolean
    paidMediaPermission: boolean
    futureContactPermission: boolean
    marketingPermission: boolean
  }
}

/**
 * Result of the atomic redeem-and-create operation.
 *
 * `invitation_unavailable` deliberately collapses expired, revoked, declined,
 * already-redeemed, and never-existed into one outcome: the caller has no way
 * to tell them apart, so it cannot leak the difference.
 */
export type RedeemOutcome =
  | { ok: true; participantId: string; invitationId: string; productAssignment: string; source: string }
  | { ok: false; reason: 'invitation_unavailable' | 'email_mismatch' | 'storage_error' }

export interface SeedAccessStore {
  findInvitationByTokenHash(tokenHash: string): Promise<InvitationRecord | null>

  /**
   * Must be atomic: validate invitation state, verify the normalised email
   * match, derive the product assignment from the invitation, insert the
   * participant and permissions rows, and mark the invitation redeemed —
   * all or nothing. Implementations that cannot guarantee this must not
   * claim to satisfy this interface.
   */
  redeemInvitationAndCreateParticipant(
    tokenHash: string,
    normalizedEmail: string,
    intake: IntakeRecordInput
  ): Promise<RedeemOutcome>

  recordEvent(event: SeedEvent): Promise<void>
}
