export const NFE_EVENT_NAMES = {
  pageViewed: 'nfe.page.viewed',
  ctaClicked: 'nfe.cta.clicked',
  formViewed: 'nfe.form.viewed',
  formSubmitted: 'nfe.form.submitted',
  formSucceeded: 'nfe.form.succeeded',
  formFailed: 'nfe.form.failed',
  founderAccessViewed: 'nfe.founder_access.viewed',
  founderAccessJoined: 'nfe.founder_access.joined',
  discoveryViewed: 'nfe.discovery.viewed',
  discoveryInterestCaptured: 'nfe.discovery.interest_captured',
  quizViewed: 'nfe.skin_ritual_quiz.viewed',
  quizInterestCaptured: 'nfe.skin_ritual_quiz.interest_captured',
  conciergeViewed: 'nfe.concierge.viewed',
  conciergeInterestCaptured: 'nfe.concierge.interest_captured',
  reviewInvitationViewed: 'nfe.review.invitation_viewed',
  reviewSubmitted: 'nfe.review.submitted',
  replenishmentInterestCaptured: 'nfe.replenishment.interest_captured',
  wholesaleInterestCaptured: 'nfe.wholesale.interest_captured',
  pressInterestCaptured: 'nfe.press.interest_captured',
} as const

export type NfeEventName =
  (typeof NFE_EVENT_NAMES)[keyof typeof NFE_EVENT_NAMES]

export type NfeEventArea =
  | 'homepage'
  | 'founder_access'
  | 'discovery'
  | 'skin_ritual_quiz'
  | 'concierge'
  | 'review'
  | 'replenishment'
  | 'wholesale'
  | 'press'
  | 'atelier'
  | 'science'
  | 'journal'
  | 'subscribe'

export interface NfeEventPayload {
  name: NfeEventName
  area: NfeEventArea
  pagePath?: string
  source?: string
  ctaLabel?: string
  destination?: string
  formId?: string
  consentGranted?: boolean
  metadata?: Record<string, string | number | boolean | null>
}

export const NFE_EVENT_TAXONOMY: Record<NfeEventName, string> = {
  [NFE_EVENT_NAMES.pageViewed]: 'A public page was viewed.',
  [NFE_EVENT_NAMES.ctaClicked]: 'A primary or secondary CTA was clicked.',
  [NFE_EVENT_NAMES.formViewed]: 'A supported opt-in form was rendered.',
  [NFE_EVENT_NAMES.formSubmitted]: 'A supported opt-in form was submitted.',
  [NFE_EVENT_NAMES.formSucceeded]: 'A supported opt-in form completed successfully.',
  [NFE_EVENT_NAMES.formFailed]: 'A supported opt-in form returned an error.',
  [NFE_EVENT_NAMES.founderAccessViewed]: 'Founder Access page or module was viewed.',
  [NFE_EVENT_NAMES.founderAccessJoined]: 'Founder Access interest was captured through a supported opt-in path.',
  [NFE_EVENT_NAMES.discoveryViewed]: 'Discovery Ritual page or module was viewed.',
  [NFE_EVENT_NAMES.discoveryInterestCaptured]: 'Discovery Ritual interest was captured.',
  [NFE_EVENT_NAMES.quizViewed]: 'Skin Ritual Quiz page or module was viewed.',
  [NFE_EVENT_NAMES.quizInterestCaptured]: 'Skin Ritual Quiz interest was captured.',
  [NFE_EVENT_NAMES.conciergeViewed]: 'Concierge page or module was viewed.',
  [NFE_EVENT_NAMES.conciergeInterestCaptured]: 'Concierge interest was captured.',
  [NFE_EVENT_NAMES.reviewInvitationViewed]: 'Review or panel invitation was viewed.',
  [NFE_EVENT_NAMES.reviewSubmitted]: 'Review feedback was submitted through a supported path.',
  [NFE_EVENT_NAMES.replenishmentInterestCaptured]: 'Replenishment interest was captured.',
  [NFE_EVENT_NAMES.wholesaleInterestCaptured]: 'Wholesale interest was captured.',
  [NFE_EVENT_NAMES.pressInterestCaptured]: 'Press interest was captured.',
}
