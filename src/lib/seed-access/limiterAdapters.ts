import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { RateLimiterPort } from './rateLimit'

/**
 * Concrete limiter backends for Study Circle.
 *
 * Verification is stricter than anything else in this codebase: 5 attempts per
 * 10 minutes, and it fails closed. A legitimate participant needs this
 * endpoint once or twice; anything approaching the limit is a script.
 */
const VERIFY_ATTEMPTS = 5
const VERIFY_WINDOW = '10 m' as const
const INTAKE_ATTEMPTS = 10
const INTAKE_WINDOW = '1 h' as const

function upstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  )
}

function createUpstashPort(attempts: number, window: '10 m' | '1 h'): RateLimiterPort {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  })
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(attempts, window),
    analytics: false,
  })
  return {
    async check(key: string) {
      try {
        const { success } = await limiter.limit(key)
        return success ? 'allow' : 'rate_limited'
      } catch {
        // Reported, not decided here. checkVerifyRateLimit turns this into a
        // denial; checkIntakeRateLimit lets it through.
        return 'unavailable'
      }
    },
  }
}

/**
 * Single-process, in-memory limiter. Local development only — it does not
 * share state across instances, so it is not a real limiter in production.
 * It exists so the feature is testable locally without standing up Redis,
 * and is never returned when NODE_ENV === 'production'.
 */
function createInMemoryPort(attempts: number, windowMs: number): RateLimiterPort {
  const hits = new Map<string, number[]>()
  return {
    async check(key: string) {
      const now = Date.now()
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
      if (recent.length >= attempts) {
        hits.set(key, recent)
        return 'rate_limited'
      }
      recent.push(now)
      hits.set(key, recent)
      return 'allow'
    },
  }
}

/**
 * Returns null in production when no durable limiter is configured, which
 * makes checkVerifyRateLimit deny every request. That is the intended
 * behaviour: an unprotected enumeration oracle is worse than an outage.
 */
export function createVerifyLimiter(): RateLimiterPort | null {
  if (upstashConfigured()) return createUpstashPort(VERIFY_ATTEMPTS, VERIFY_WINDOW)
  if (process.env.NODE_ENV !== 'production') {
    return createInMemoryPort(VERIFY_ATTEMPTS, 10 * 60_000)
  }
  return null
}

export function createIntakeLimiter(): RateLimiterPort | null {
  if (upstashConfigured()) return createUpstashPort(INTAKE_ATTEMPTS, INTAKE_WINDOW)
  if (process.env.NODE_ENV !== 'production') {
    return createInMemoryPort(INTAKE_ATTEMPTS, 60 * 60_000)
  }
  // Intake fails open by design; a null port allows.
  return null
}
