import { SEED_EVENT_TYPES, assertNoPii } from './auditEvents'
import type { SeedAccessStore } from './store'
import { hashInvitationToken, isPlausibleTokenShape, maskEmail } from './tokens'

/**
 * Invitation verification.
 *
 * Every failure path — malformed, unknown, expired, revoked, declined, already
 * redeemed — returns the identical `{ valid: false }`. There is no code path
 * that lets a caller distinguish them, which is what stops this endpoint from
 * becoming a token-enumeration oracle.
 */

export interface VerifiedInvitationView {
  firstName: string | null
  maskedEmail: string
  productAssignment: string
}

export type VerifyResult =
  | { valid: true; invitation: VerifiedInvitationView }
  | { valid: false }

const INVALID: VerifyResult = { valid: false }

export function isInvitationRedeemable(
  status: string,
  expiresAt: string,
  redeemedAt: string | null,
  now: Date
): boolean {
  if (status !== 'issued') return false
  if (redeemedAt) return false
  const expiry = new Date(expiresAt).getTime()
  if (!Number.isFinite(expiry)) return false
  // Expiry is evaluated here, at validation time. We never depend on a
  // scheduled job having flipped 'issued' to 'expired' first.
  return expiry > now.getTime()
}

export async function verifyInvitation(
  store: SeedAccessStore,
  rawToken: unknown,
  now: Date = new Date()
): Promise<VerifyResult> {
  if (!isPlausibleTokenShape(rawToken)) {
    await safeEvent(store, {
      eventType: SEED_EVENT_TYPES.invitationVerificationFailed,
      metadata: { reason: 'malformed_token' },
    })
    return INVALID
  }

  const tokenHash = hashInvitationToken(rawToken)

  let invitation
  try {
    invitation = await store.findInvitationByTokenHash(tokenHash)
  } catch {
    // A storage failure must look like every other failure to the caller.
    await safeEvent(store, {
      eventType: SEED_EVENT_TYPES.invitationVerificationFailed,
      metadata: { reason: 'storage_error' },
    })
    return INVALID
  }

  if (!invitation) {
    await safeEvent(store, {
      eventType: SEED_EVENT_TYPES.invitationVerificationFailed,
      metadata: { reason: 'not_found' },
    })
    return INVALID
  }

  if (
    !isInvitationRedeemable(
      invitation.status,
      invitation.expiresAt,
      invitation.redeemedAt,
      now
    )
  ) {
    await safeEvent(store, {
      eventType: SEED_EVENT_TYPES.invitationVerificationFailed,
      invitationId: invitation.id,
      // The specific reason is recorded internally for operations, and is
      // never part of the response.
      metadata: { reason: 'not_redeemable', status: invitation.status },
    })
    return INVALID
  }

  await safeEvent(store, {
    eventType: SEED_EVENT_TYPES.invitationVerified,
    invitationId: invitation.id,
    metadata: { product: invitation.productAssignment },
  })

  return {
    valid: true,
    invitation: {
      firstName: invitation.participantName,
      maskedEmail: maskEmail(invitation.email),
      productAssignment: invitation.productAssignment,
    },
  }
}

/**
 * Audit writes must never turn a working request into a failed one, and must
 * never be the thing that leaks PII. `assertNoPii` throws on a bad payload;
 * that throw is contained here.
 */
async function safeEvent(
  store: SeedAccessStore,
  event: Parameters<SeedAccessStore['recordEvent']>[0]
): Promise<void> {
  try {
    assertNoPii(event.metadata)
    await store.recordEvent(event)
  } catch {
    // Intentionally swallowed: see above.
  }
}

export { safeEvent }
