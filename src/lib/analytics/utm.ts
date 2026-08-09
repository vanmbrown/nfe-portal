export interface NfeAttributionContext {
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  referrer?: string
  landingPage?: string
  capturedAt?: string
}

const STORAGE_KEY = 'nfe.attribution.v1'
const CONSENT_KEY = 'nfe-cookie-consent'
const MAX_VALUE_LENGTH = 180

export type ConsentState = 'accepted' | 'declined' | 'undecided'

/**
 * The visitor's cookie decision.
 *
 * Absent means undecided, and undecided is treated exactly like declined. The
 * banner appears on arrival, so "not yet answered" is the state most first-time
 * visitors are in while a form is mounting.
 */
export function readConsent(): ConsentState {
  if (typeof window === 'undefined') return 'undecided'

  try {
    const value = window.localStorage.getItem(CONSENT_KEY)
    if (value === 'accepted') return 'accepted'
    if (value === 'declined') return 'declined'
    return 'undecided'
  } catch {
    // Storage can be unavailable in strict privacy modes. Absence of a
    // recorded decision is not consent.
    return 'undecided'
  }
}

/** Forget any attribution already held for this session. */
export function clearStoredAttribution(): void {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

const UTM_KEYS = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_term: 'utmTerm',
  utm_content: 'utmContent',
} as const

function cleanValue(value: string | null): string | undefined {
  if (!value) return undefined

  const cleaned = value.trim().slice(0, MAX_VALUE_LENGTH)
  return cleaned || undefined
}

function compactAttribution(
  attribution: NfeAttributionContext
): NfeAttributionContext {
  return Object.fromEntries(
    Object.entries(attribution).filter(([, value]) => Boolean(value))
  ) as NfeAttributionContext
}

export function readAttributionFromUrl(
  url: string,
  referrer?: string
): NfeAttributionContext {
  const parsedUrl = new URL(url)
  const attribution: NfeAttributionContext = {
    referrer: cleanValue(referrer ?? ''),
    landingPage: cleanValue(`${parsedUrl.pathname}${parsedUrl.search}`),
    capturedAt: new Date().toISOString(),
  }

  for (const [queryKey, fieldName] of Object.entries(UTM_KEYS)) {
    attribution[fieldName] = cleanValue(parsedUrl.searchParams.get(queryKey))
  }

  return compactAttribution(attribution)
}

/**
 * Capture attribution, but only once the visitor has said yes.
 *
 * This used to run on mount in both forms and write the record before any
 * decision had been made, then send it with the submission. Referrer, landing
 * path and the full UTM set are an identifier for how someone arrived; holding
 * that before consent, and transmitting it afterwards, is the thing the consent
 * banner exists to prevent.
 *
 * Undecided and declined both clear rather than merely skip, so a visitor who
 * withdraws consent does not leave a record behind from before they changed
 * their mind. Some first-touch attribution is lost that way. That is the
 * intended trade.
 */
export function preserveAttributionFromLocation(): NfeAttributionContext {
  if (typeof window === 'undefined') return {}

  if (readConsent() !== 'accepted') {
    clearStoredAttribution()
    return {}
  }

  const current = readAttributionFromUrl(
    window.location.href,
    document.referrer
  )
  const stored = getStoredAttribution()
  const next = compactAttribution({ ...stored, ...current })

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Session storage can be unavailable in strict privacy modes.
  }

  return next
}

export function getStoredAttribution(): NfeAttributionContext {
  if (typeof window === 'undefined') return {}

  // A record written under an earlier decision is not readable under a later
  // one. Consent is checked on the way out as well as on the way in.
  if (readConsent() !== 'accepted') return {}

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    return compactAttribution(JSON.parse(raw) as NfeAttributionContext)
  } catch {
    return {}
  }
}

/**
 * What travels with a Founder Access or Concierge submission.
 *
 * Empty unless consent is accepted, so an undecided or declining visitor
 * submits the form with no attribution fields at all.
 */
export function buildAttributionForRequest(): NfeAttributionContext {
  if (typeof window === 'undefined') return {}
  if (readConsent() !== 'accepted') return {}

  return compactAttribution({
    ...getStoredAttribution(),
    ...readAttributionFromUrl(window.location.href, document.referrer),
  })
}
