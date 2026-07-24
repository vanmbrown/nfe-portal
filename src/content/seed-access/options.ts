import {
  FOUNDER_ACCESS_AGE_RANGES,
  FOUNDER_ACCESS_SKIN_INTERESTS,
  type FounderAccessSkinInterest,
} from '@/content/founder-access/options'

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

export const STUDY_CIRCLE_PRODUCTS = [
  { value: 'face_elixir', label: 'Face Elixir' },
  { value: 'body_elixir', label: 'Body Elixir' },
] as const
export type StudyCircleProduct = (typeof STUDY_CIRCLE_PRODUCTS)[number]['value']

export const STUDY_CIRCLE_CONTACT_METHODS = ['Email', 'Phone', 'Text'] as const

export const STUDY_CIRCLE_SOURCES = [
  'Vanessa LinkedIn',
  'NFE LinkedIn',
  'Instagram',
  'Friend Referral',
  'Creator Referral',
  'Email',
  'Event',
  'Direct',
  'Existing User',
  'Founder Invitation',
] as const

export const STUDY_CIRCLE_CONSENT_TEXT_VERSION = 'seed-access-2026-07'

export const STUDY_CIRCLE_SUCCESS_MESSAGE =
  "Thank you for accepting this invitation. NFE will follow with product timing, ritual guidance, and the details of your first check-in."
