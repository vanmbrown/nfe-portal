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
const MAX_VALUE_LENGTH = 180

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

export function preserveAttributionFromLocation(): NfeAttributionContext {
  if (typeof window === 'undefined') return {}

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

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    return compactAttribution(JSON.parse(raw) as NfeAttributionContext)
  } catch {
    return {}
  }
}

export function buildAttributionForRequest(): NfeAttributionContext {
  return compactAttribution({
    ...getStoredAttribution(),
    ...(typeof window !== 'undefined'
      ? readAttributionFromUrl(window.location.href, document.referrer)
      : {}),
  })
}
