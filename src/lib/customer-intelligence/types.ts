import type { NfeAttributionContext } from '@/lib/analytics/utm'

export type CustomerIntentType =
  | 'founder_access'
  | 'discovery'
  | 'skin_ritual_quiz'
  | 'concierge'
  | 'review'
  | 'replenishment'
  | 'wholesale'
  | 'press'

export type ConsentSource =
  | 'subscribe_page'
  | 'founder_access'
  | 'discovery'
  | 'skin_ritual_quiz'
  | 'concierge'
  | 'future_form'

export interface ConsentState {
  marketingOptIn: boolean
  privacyPolicyAccepted: boolean
  consentText?: string
  consentedAt?: string
  consentSource: ConsentSource
}

export interface CustomerIntelligenceContext {
  source: ConsentSource
  pagePath?: string
  ctaLabel?: string
  intent?: CustomerIntentType
  attribution?: NfeAttributionContext
}

export interface BaseCustomerIntelligencePayload {
  email?: string
  intent: CustomerIntentType
  consent: ConsentState
  context: CustomerIntelligenceContext
  tags: string[]
}

export interface FounderAccessPayload extends BaseCustomerIntelligencePayload {
  intent: 'founder_access'
}

export interface DiscoveryInterestPayload
  extends BaseCustomerIntelligencePayload {
  intent: 'discovery'
  productInterest?: 'face_elixir' | 'body_elixir' | 'both' | 'undecided'
}

export interface SkinRitualQuizInterestPayload
  extends BaseCustomerIntelligencePayload {
  intent: 'skin_ritual_quiz'
  quizStatus: 'interest_only' | 'started' | 'completed'
}

export interface ConciergeInterestPayload
  extends BaseCustomerIntelligencePayload {
  intent: 'concierge'
  guidanceNeed?: string
}

export interface ReviewSignalPayload extends BaseCustomerIntelligencePayload {
  intent: 'review'
  reviewStage: 'invited' | 'submitted' | 'moderated'
}

export interface ReplenishmentInterestPayload
  extends BaseCustomerIntelligencePayload {
  intent: 'replenishment'
  productInterest?: 'face_elixir' | 'body_elixir' | 'both'
}

export interface WholesaleInterestPayload
  extends BaseCustomerIntelligencePayload {
  intent: 'wholesale'
  organizationType?: 'retailer' | 'spa' | 'clinic' | 'other'
}

export interface PressInterestPayload extends BaseCustomerIntelligencePayload {
  intent: 'press'
  outletType?: 'editorial' | 'creator' | 'podcast' | 'other'
}

export type CustomerIntelligencePayload =
  | FounderAccessPayload
  | DiscoveryInterestPayload
  | SkinRitualQuizInterestPayload
  | ConciergeInterestPayload
  | ReviewSignalPayload
  | ReplenishmentInterestPayload
  | WholesaleInterestPayload
  | PressInterestPayload
