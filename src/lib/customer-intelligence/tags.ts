import type { CustomerIntentType } from './types'
import type { ConsentSource } from './types'

export const NFE_CRM_TAGS = {
  brand: 'nfe-beauty',
  privateList: 'private-list',
  founderAccess: 'founder-access',
  discovery: 'discovery-ritual',
  skinRitualQuiz: 'skin-ritual-quiz',
  concierge: 'concierge-interest',
  reviewPanel: 'customer-proof-panel',
  replenishment: 'replenishment-interest',
  wholesale: 'wholesale-interest',
  press: 'press-interest',
  sourceSubscribe: 'source-subscribe',
  sourceFounderAccess: 'source-founder-access',
  sourceDiscovery: 'source-discovery',
  sourceQuiz: 'source-skin-ritual-quiz',
  sourceConcierge: 'source-concierge',
  sourceFutureForm: 'source-future-form',
} as const

export const INTENT_TO_CRM_TAGS: Record<CustomerIntentType, string[]> = {
  founder_access: [
    NFE_CRM_TAGS.brand,
    NFE_CRM_TAGS.privateList,
    NFE_CRM_TAGS.founderAccess,
  ],
  discovery: [
    NFE_CRM_TAGS.brand,
    NFE_CRM_TAGS.privateList,
    NFE_CRM_TAGS.discovery,
  ],
  skin_ritual_quiz: [
    NFE_CRM_TAGS.brand,
    NFE_CRM_TAGS.privateList,
    NFE_CRM_TAGS.skinRitualQuiz,
  ],
  concierge: [NFE_CRM_TAGS.brand, NFE_CRM_TAGS.concierge],
  review: [NFE_CRM_TAGS.brand, NFE_CRM_TAGS.reviewPanel],
  replenishment: [NFE_CRM_TAGS.brand, NFE_CRM_TAGS.replenishment],
  wholesale: [NFE_CRM_TAGS.brand, NFE_CRM_TAGS.wholesale],
  press: [NFE_CRM_TAGS.brand, NFE_CRM_TAGS.press],
}

export const BEEHIIV_FIELD_MAPPING = {
  email: 'email',
  tags: 'tags',
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmTerm: 'utm_term',
  utmContent: 'utm_content',
  referrer: 'referrer',
  landingPage: 'landing_page',
  consentSource: 'consent_source',
} as const

export const BEEHIIV_CUSTOM_FIELDS = {
  firstName: 'First Name',
  skinStage: 'Skin Stage',
  primaryInterest: 'Primary Interest',
  skinPriority: 'Skin Priority',
  source: 'Source',
  launchStatus: 'Launch Status',
  conciergeInterest: 'Concierge Interest',
  productSubscriptionInterest: 'Product Subscription Interest',
  lastPurchaseDate: 'Last Purchase Date',
  productPurchased: 'Product Purchased',
  consentSource: 'Consent Source',
  marketingOptIn: 'Marketing Opt-In',
  privacyAccepted: 'Privacy Accepted',
} as const

export const CONSENT_SOURCE_TO_CRM_TAG: Record<ConsentSource, string> = {
  subscribe_page: NFE_CRM_TAGS.sourceSubscribe,
  founder_access: NFE_CRM_TAGS.sourceFounderAccess,
  discovery: NFE_CRM_TAGS.sourceDiscovery,
  skin_ritual_quiz: NFE_CRM_TAGS.sourceQuiz,
  concierge: NFE_CRM_TAGS.sourceConcierge,
  future_form: NFE_CRM_TAGS.sourceFutureForm,
}

export function getCrmTagsForIntent(intent: CustomerIntentType): string[] {
  return INTENT_TO_CRM_TAGS[intent]
}

export function getSourceCrmTag(source: ConsentSource): string {
  return CONSENT_SOURCE_TO_CRM_TAG[source]
}
