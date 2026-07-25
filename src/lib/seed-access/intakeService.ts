import {
  STUDY_CIRCLE_CONFIDENTIALITY_VERSION,
  STUDY_CIRCLE_CONSENT_VERSION,
  STUDY_CIRCLE_PERMISSION_VERSION,
} from '../../content/seed-access/options'
import { SEED_EVENT_TYPES } from './auditEvents'
import {
  buildInternalNotification,
  buildParticipantConfirmation,
  type EmailAdapter,
} from './email'
import { safeEvent } from './invitationService'
import type { SeedAccessStore } from './store'
import { hashInvitationToken } from './tokens'
import type { StudyCircleIntakeInput } from './validation'

/**
 * Intake submission.
 *
 * Ordering matters and is deliberate:
 *   1. redeem + persist atomically (the store guarantees all-or-nothing)
 *   2. only then attempt email
 *
 * Email is explicitly *outside* the transaction. A mail outage must not roll
 * back a participant's accepted place, and a slow provider must not hold a
 * database transaction open. The cost is that a send can fail after the record
 * exists — which is why every send outcome is written to the audit log rather
 * than swallowed.
 */

export type IntakeResult =
  | { ok: true; participantId: string; emailDelivered: boolean }
  | { ok: false; reason: 'invitation_unavailable' | 'storage_error' }

export interface IntakeDependencies {
  store: SeedAccessStore
  email: EmailAdapter
  adminEmail?: string
}

function countGrantedPermissions(permissions: Record<string, boolean>): number {
  return Object.values(permissions).filter(Boolean).length
}

export async function submitIntake(
  deps: IntakeDependencies,
  input: StudyCircleIntakeInput
): Promise<IntakeResult> {
  const { store, email, adminEmail } = deps
  const tokenHash = hashInvitationToken(input.token)

  await safeEvent(store, {
    eventType: SEED_EVENT_TYPES.intakeSubmitted,
    metadata: { concernCount: input.primaryConcerns.length },
  })

  let outcome
  try {
    outcome = await store.redeemInvitationAndCreateParticipant(
      tokenHash,
      input.email,
      {
        invitationId: '', // derived inside the atomic operation from the hash
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        ageRange: input.ageRange,
        skinType: input.skinType,
        primaryConcerns: input.primaryConcerns,
        currentRoutine: input.currentRoutine,
        sensitivities: input.sensitivities,
        fragranceSensitive: input.fragranceSensitive,
        preferredContactMethod: input.preferredContactMethod,
        location: input.location,
        additionalContext: input.additionalContext,
        willingToUseAsDirected: input.willingToUseAsDirected,
        willingToCompleteCheckins: input.willingToCompleteCheckins,
        consentVersion: STUDY_CIRCLE_CONSENT_VERSION,
        confidentialityVersion: STUDY_CIRCLE_CONFIDENTIALITY_VERSION,
        permissionVersion: STUDY_CIRCLE_PERMISSION_VERSION,
        marketingOptIn: input.permissions.marketingPermission,
        permissions: input.permissions,
      }
    )
  } catch {
    await safeEvent(store, {
      eventType: SEED_EVENT_TYPES.invitationVerificationFailed,
      metadata: { reason: 'storage_error', stage: 'intake' },
    })
    return { ok: false, reason: 'storage_error' }
  }

  if (!outcome.ok) {
    // email_mismatch is folded into the same participant-facing outcome as an
    // unavailable invitation. The distinction is recorded internally only.
    await safeEvent(store, {
      eventType: SEED_EVENT_TYPES.invitationVerificationFailed,
      metadata: { reason: outcome.reason, stage: 'intake' },
    })
    return {
      ok: false,
      reason: outcome.reason === 'storage_error' ? 'storage_error' : 'invitation_unavailable',
    }
  }

  await safeEvent(store, {
    eventType: SEED_EVENT_TYPES.invitationRedeemed,
    invitationId: outcome.invitationId,
    participantId: outcome.participantId,
    metadata: { product: outcome.productAssignment },
  })

  const emailDelivered = await deliverEmails(
    deps,
    outcome,
    input,
    adminEmail,
    email
  )

  return { ok: true, participantId: outcome.participantId, emailDelivered }
}

async function deliverEmails(
  deps: IntakeDependencies,
  outcome: {
    participantId: string
    invitationId: string
    productAssignment: string
    source: string
  },
  input: StudyCircleIntakeInput,
  adminEmail: string | undefined,
  email: EmailAdapter
): Promise<boolean> {
  const { store } = deps
  let allDelivered = true

  await safeEvent(store, {
    eventType: SEED_EVENT_TYPES.confirmationEmailRequested,
    participantId: outcome.participantId,
  })

  const confirmation = await email.send(
    buildParticipantConfirmation({
      firstName: input.firstName,
      email: input.email,
      productAssignment: outcome.productAssignment,
      participantId: outcome.participantId,
    })
  )

  await safeEvent(store, {
    eventType: confirmation.ok
      ? SEED_EVENT_TYPES.confirmationEmailSent
      : SEED_EVENT_TYPES.confirmationEmailFailed,
    participantId: outcome.participantId,
    metadata: confirmation.ok ? {} : { errorCategory: confirmation.errorCategory },
  })
  if (!confirmation.ok) allDelivered = false

  if (adminEmail) {
    await safeEvent(store, {
      eventType: SEED_EVENT_TYPES.internalNotificationRequested,
      participantId: outcome.participantId,
    })

    const internal = await email.send(
      buildInternalNotification({
        participantId: outcome.participantId,
        invitationId: outcome.invitationId,
        productAssignment: outcome.productAssignment,
        source: outcome.source,
        ageRange: input.ageRange,
        skinType: input.skinType,
        concernCount: input.primaryConcerns.length,
        optionalPermissionsGranted: countGrantedPermissions(
          input.permissions as unknown as Record<string, boolean>
        ),
        adminEmail,
      })
    )

    await safeEvent(store, {
      eventType: internal.ok
        ? SEED_EVENT_TYPES.internalNotificationSent
        : SEED_EVENT_TYPES.internalNotificationFailed,
      participantId: outcome.participantId,
      metadata: internal.ok ? {} : { errorCategory: internal.errorCategory },
    })
    if (!internal.ok) allDelivered = false
  }

  return allDelivered
}
