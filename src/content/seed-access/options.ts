// Relative (not "@/") imports throughout this module tree: these files are
// exercised directly by `node --test`, which resolves real paths and does not
// read tsconfig path aliases. Next.js handles relative imports identically.
import {
  FOUNDER_ACCESS_AGE_RANGES,
  FOUNDER_ACCESS_SKIN_INTERESTS,
  type FounderAccessSkinInterest,
} from '../founder-access/options'

export const STUDY_CIRCLE_AGE_RANGES = FOUNDER_ACCESS_AGE_RANGES

export const STUDY_CIRCLE_SKIN_CONCERNS = FOUNDER_ACCESS_SKIN_INTERESTS
export type StudyCircleSkinConcern = FounderAccessSkinInterest

export const STUDY_CIRCLE_SKIN_TYPES = [
  'Dry',
  'Normal',
  'Combination',
  'Oily',
  'Sensitive',
  'Mature / Changing Skin',
  'Not Sure',
] as const
export type StudyCircleSkinType = (typeof STUDY_CIRCLE_SKIN_TYPES)[number]

/**
 * Product assignment is made by NFE on the invitation record before the
 * participant ever opens the page (approved policy §2). These values are
 * internal enums; the participant only ever sees the label.
 */
export const STUDY_CIRCLE_PRODUCT_VALUES = ['face_elixir', 'body_elixir'] as const
export type StudyCircleProduct = (typeof STUDY_CIRCLE_PRODUCT_VALUES)[number]

export const STUDY_CIRCLE_PRODUCT_LABELS: Record<StudyCircleProduct, string> = {
  face_elixir: 'Face Elixir',
  body_elixir: 'Body Elixir',
}

export function studyCircleProductLabel(value: string): string | undefined {
  return STUDY_CIRCLE_PRODUCT_LABELS[value as StudyCircleProduct]
}

export const STUDY_CIRCLE_CONTACT_METHODS = ['Email', 'Phone', 'Text'] as const

/**
 * Set by the operator at issuance, never self-reported by the participant.
 */
export const STUDY_CIRCLE_SOURCES = [
  'vanessa_linkedin',
  'nfe_linkedin',
  'instagram',
  'friend_referral',
  'creator_referral',
  'email',
  'event',
  'direct',
  'existing_user',
  'founder_invitation',
] as const
export type StudyCircleSource = (typeof STUDY_CIRCLE_SOURCES)[number]

export const STUDY_CIRCLE_DEFAULT_SOURCE: StudyCircleSource = 'founder_invitation'

export const STUDY_CIRCLE_INVITATION_STATUSES = [
  'issued',
  'redeemed',
  'expired',
  'revoked',
  'declined',
] as const
export type StudyCircleInvitationStatus =
  (typeof STUDY_CIRCLE_INVITATION_STATUSES)[number]

export const STUDY_CIRCLE_PARTICIPATION_STATUSES = [
  'intake_complete',
  'product_shipped',
  'in_progress',
  'completed',
  'withdrawn',
] as const

/**
 * Versioned so a later wording change is distinguishable from the wording a
 * given participant actually agreed to. Bump when participant-facing consent
 * text changes materially.
 */
export const STUDY_CIRCLE_CONSENT_VERSION = 'study-circle-consent-2026-07'
export const STUDY_CIRCLE_PERMISSION_VERSION = 'study-circle-permissions-2026-07'
export const STUDY_CIRCLE_CONFIDENTIALITY_VERSION =
  'study-circle-confidentiality-2026-07'

export const STUDY_CIRCLE_SUCCESS_MESSAGE =
  'Thank you for accepting this invitation. NFE will follow with product timing, ritual guidance, and the details of your first check-in.'
