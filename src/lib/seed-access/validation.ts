import {
  STUDY_CIRCLE_AGE_RANGES,
  STUDY_CIRCLE_CONTACT_METHODS,
  STUDY_CIRCLE_SKIN_CONCERNS,
  STUDY_CIRCLE_SKIN_TYPES,
  type StudyCircleSkinConcern,
} from '../../content/seed-access/options'
import { isPlausibleTokenShape, normalizeEmail } from './tokens'

/**
 * Server-side validation for Study Circle intake.
 *
 * Everything the browser sends is untrusted. Values that belong to NFE rather
 * than to the participant — product assignment, invitation status, record IDs,
 * source, and every consent/permission *timestamp* — are never read from the
 * payload, even if present. They are derived server-side or ignored entirely.
 *
 * This module never logs the values it rejects: a rejected payload is still
 * participant PII.
 */

const MAX = {
  name: 80,
  email: 180,
  phone: 40,
  location: 120,
  routine: 1200,
  sensitivities: 1200,
  additionalContext: 1200,
} as const

const AGE_RANGES = new Set<string>(STUDY_CIRCLE_AGE_RANGES)
const SKIN_TYPES = new Set<string>(STUDY_CIRCLE_SKIN_TYPES)
const SKIN_CONCERNS = new Set<string>(STUDY_CIRCLE_SKIN_CONCERNS)
const CONTACT_METHODS = new Set<string>(STUDY_CIRCLE_CONTACT_METHODS)

export interface StudyCircleIntakeInput {
  token: string
  firstName: string
  lastName: string
  email: string
  ageRange: string
  skinType: string
  primaryConcerns: StudyCircleSkinConcern[]
  phone?: string
  location?: string
  currentRoutine?: string
  sensitivities?: string
  fragranceSensitive: boolean
  preferredContactMethod?: string
  additionalContext?: string
  willingToUseAsDirected: boolean
  willingToCompleteCheckins: boolean
  permissions: StudyCirclePermissionInput
}

export interface StudyCirclePermissionInput {
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

export type ValidationResult =
  | { ok: true; value: StudyCircleIntakeInput }
  | { ok: false; reason: ValidationFailureReason }

/**
 * Coarse, non-identifying failure categories. These are safe to put in an
 * audit event or an analytics property; the offending value never is.
 */
export type ValidationFailureReason =
  | 'malformed_payload'
  | 'invalid_token_shape'
  | 'missing_required_field'
  | 'invalid_field_value'
  | 'missing_required_consent'

function cleanString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim().slice(0, maxLength)
  return cleaned.length > 0 ? cleaned : undefined
}

function isTrue(value: unknown): boolean {
  return value === true
}

/** Optional booleans default to false — never to true, never to "whatever was sent". */
function optionalBoolean(value: unknown): boolean {
  return value === true
}

function cleanEmail(value: unknown): string | undefined {
  const raw = cleanString(value, MAX.email)
  if (!raw) return undefined
  const email = normalizeEmail(raw)
  // Deliberately permissive: one "@", something either side, no whitespace.
  // Strict RFC validation rejects real addresses and buys nothing here, since
  // the address must also match an invitation that NFE itself created.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return undefined
  return email
}

function cleanPhone(value: unknown): string | undefined {
  const raw = cleanString(value, MAX.phone)
  if (!raw) return undefined
  // Keep digits and common separators; drop anything else.
  const cleaned = raw.replace(/[^\d+()\-.\s]/g, '').trim()
  return cleaned.length > 0 ? cleaned : undefined
}

function cleanConcerns(value: unknown): StudyCircleSkinConcern[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const out: StudyCircleSkinConcern[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!SKIN_CONCERNS.has(trimmed) || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed as StudyCircleSkinConcern)
    if (out.length >= SKIN_CONCERNS.size) break
  }
  return out
}

function cleanPermissions(value: unknown): StudyCirclePermissionInput {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<
    string,
    unknown
  >
  return {
    quotePermission: optionalBoolean(raw.quotePermission),
    quoteLengthEditPermission: optionalBoolean(raw.quoteLengthEditPermission),
    firstNamePermission: optionalBoolean(raw.firstNamePermission),
    fullNamePermission: optionalBoolean(raw.fullNamePermission),
    photoPermission: optionalBoolean(raw.photoPermission),
    videoPermission: optionalBoolean(raw.videoPermission),
    websitePermission: optionalBoolean(raw.websitePermission),
    emailPermission: optionalBoolean(raw.emailPermission),
    organicSocialPermission: optionalBoolean(raw.organicSocialPermission),
    paidMediaPermission: optionalBoolean(raw.paidMediaPermission),
    futureContactPermission: optionalBoolean(raw.futureContactPermission),
    marketingPermission: optionalBoolean(raw.marketingPermission),
  }
}

export function validateIntakePayload(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, reason: 'malformed_payload' }
  }
  const body = payload as Record<string, unknown>

  if (!isPlausibleTokenShape(body.token)) {
    return { ok: false, reason: 'invalid_token_shape' }
  }

  const firstName = cleanString(body.firstName, MAX.name)
  const lastName = cleanString(body.lastName, MAX.name)
  const email = cleanEmail(body.email)
  if (!firstName || !lastName || !email) {
    return { ok: false, reason: 'missing_required_field' }
  }

  const ageRange = cleanString(body.ageRange, 40)
  const skinType = cleanString(body.skinType, 40)
  if (!ageRange || !AGE_RANGES.has(ageRange)) {
    return { ok: false, reason: 'invalid_field_value' }
  }
  if (!skinType || !SKIN_TYPES.has(skinType)) {
    return { ok: false, reason: 'invalid_field_value' }
  }

  const primaryConcerns = cleanConcerns(body.primaryConcerns)
  if (primaryConcerns.length === 0) {
    return { ok: false, reason: 'missing_required_field' }
  }

  const preferredContactMethod = cleanString(body.preferredContactMethod, 40)
  if (preferredContactMethod && !CONTACT_METHODS.has(preferredContactMethod)) {
    return { ok: false, reason: 'invalid_field_value' }
  }

  // The two participation commitments and the six required consents. All must
  // be explicitly true; absent or falsy is a refusal, never a default-yes.
  if (!isTrue(body.willingToUseAsDirected) || !isTrue(body.willingToCompleteCheckins)) {
    return { ok: false, reason: 'missing_required_consent' }
  }
  const consent = (body.consent && typeof body.consent === 'object'
    ? body.consent
    : {}) as Record<string, unknown>
  const requiredConsents = [
    consent.understandsExpectations,
    consent.privacyPolicy,
    consent.studyContact,
    consent.honestFeedback,
    consent.internalLearning,
    consent.confidentiality,
  ]
  if (!requiredConsents.every(isTrue)) {
    return { ok: false, reason: 'missing_required_consent' }
  }

  return {
    ok: true,
    value: {
      token: body.token,
      firstName,
      lastName,
      email,
      ageRange,
      skinType,
      primaryConcerns,
      phone: cleanPhone(body.phone),
      location: cleanString(body.location, MAX.location),
      currentRoutine: cleanString(body.currentRoutine, MAX.routine),
      sensitivities: cleanString(body.sensitivities, MAX.sensitivities),
      fragranceSensitive: optionalBoolean(body.fragranceSensitive),
      preferredContactMethod,
      additionalContext: cleanString(body.additionalContext, MAX.additionalContext),
      willingToUseAsDirected: true,
      willingToCompleteCheckins: true,
      permissions: cleanPermissions(body.permissions),
    },
  }
}

/**
 * Fields a client might try to send that are server-owned. Exported so a test
 * can assert none of them survive validation.
 */
export const SERVER_OWNED_FIELDS = [
  'productAssignment',
  'product_assignment',
  'product',
  'status',
  'invitationId',
  'invitation_id',
  'participantId',
  'id',
  'source',
  'consentVersion',
  'participationConsentAt',
  'privacyConsentAt',
  'permissionRecordedAt',
  'permissionVersion',
  'confidentialityAcknowledgedAt',
] as const
