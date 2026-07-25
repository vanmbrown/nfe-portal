/**
 * Rate limiting for Study Circle endpoints.
 *
 * The verification endpoint takes a guessable-shaped input and returns a
 * boolean, which makes it the one genuine brute-force target in this feature.
 * It therefore **fails closed**: if the limiter backend is unreachable, the
 * request is denied rather than allowed.
 *
 * This is a deliberate departure from every other limiter in this codebase
 * (`src/lib/ratelimit.ts` fails open, which is right for a public opt-in form
 * and wrong here). The intake endpoint keeps the fail-open behaviour, since it
 * is not an oracle and availability matters more there.
 */

export type RateLimitOutcome = 'allow' | 'deny'

export interface RateLimiterPort {
  /**
   * Implementations must not throw. Backend trouble is reported as
   * 'unavailable' so the caller decides fail-open vs fail-closed.
   */
  check(key: string): Promise<'allow' | 'rate_limited' | 'unavailable'>
}

/**
 * Verification: strict, and denies when the limiter itself is down.
 * Thresholds are never surfaced to the caller.
 */
export async function checkVerifyRateLimit(
  limiter: RateLimiterPort | null,
  requestKey: string
): Promise<RateLimitOutcome> {
  if (!limiter) return 'deny'
  const result = await limiter.check(`sc:verify:${requestKey}`)
  return result === 'allow' ? 'allow' : 'deny'
}

/**
 * Intake: fails open, matching the rest of the codebase. An intake submission
 * is not an enumeration oracle, and a limiter outage should not cost an
 * invited participant their place.
 */
export async function checkIntakeRateLimit(
  limiter: RateLimiterPort | null,
  requestKey: string
): Promise<RateLimitOutcome> {
  if (!limiter) return 'allow'
  const result = await limiter.check(`sc:intake:${requestKey}`)
  return result === 'rate_limited' ? 'deny' : 'allow'
}

/**
 * Derives the limiter key from request headers.
 *
 * Never keyed on the token or the email — a limiter key is stored in a shared
 * cache, and neither belongs there. Falls back to a constant bucket when no
 * client IP is present, which is intentionally strict for verification: an
 * unattributable request shares one small bucket rather than getting a free
 * pass.
 */
export function requestKeyFromHeaders(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return 'unattributed'
}
