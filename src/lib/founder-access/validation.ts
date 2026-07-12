import {
  FOUNDER_ACCESS_AGE_RANGES,
  FOUNDER_ACCESS_PRODUCT_INTERESTS,
  FOUNDER_ACCESS_SKIN_INTERESTS,
  type FounderAccessProductInterest,
  type FounderAccessSkinInterest,
} from '@/content/founder-access/options'

const PRODUCT_VALUES = new Set(
  FOUNDER_ACCESS_PRODUCT_INTERESTS.map((item) => item.value)
)

const SKIN_INTEREST_SET = new Set<string>(FOUNDER_ACCESS_SKIN_INTERESTS)
const AGE_RANGE_SET = new Set<string>(FOUNDER_ACCESS_AGE_RANGES)

export function cleanString(value: unknown, maxLength = 240): string | undefined {
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim().slice(0, maxLength)
  return cleaned || undefined
}

export function cleanEmail(value: unknown): string | undefined {
  const email = cleanString(value, 180)?.toLowerCase()
  if (!email || !email.includes('@')) return undefined
  return email
}

export function cleanSkinInterests(value: unknown): FounderAccessSkinInterest[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item): item is FounderAccessSkinInterest =>
      SKIN_INTEREST_SET.has(item)
    )
    .slice(0, 10)
}

export function cleanProductInterest(
  value: unknown
): FounderAccessProductInterest | undefined {
  if (typeof value !== 'string') return undefined
  return PRODUCT_VALUES.has(value as FounderAccessProductInterest)
    ? (value as FounderAccessProductInterest)
    : undefined
}

export function cleanAgeRange(value: unknown): string | undefined {
  const cleaned = cleanString(value, 40)
  if (!cleaned || !AGE_RANGE_SET.has(cleaned)) return undefined
  return cleaned
}

export function computeHighIntent(input: {
  newsletterOptIn: boolean
  productInterest?: FounderAccessProductInterest
  topicRequest?: string
}): boolean {
  if (!input.newsletterOptIn) return false
  if (
    input.productInterest === 'face_elixir' ||
    input.productInterest === 'both'
  ) {
    return true
  }
  return Boolean(input.topicRequest)
}
