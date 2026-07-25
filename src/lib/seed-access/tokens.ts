import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * Invitation token handling.
 *
 * The raw token exists in exactly two places, ever: the one-time CLI output,
 * and the invitation URL the operator sends. It is never persisted — not to
 * the database, not to logs, not to analytics, not to disk. Only the SHA-256
 * hash is stored (approved policy §16).
 */

/** 32 bytes = 256 bits of entropy. Not guessable, not enumerable. */
const TOKEN_BYTES = 32

/** base64url of 32 bytes is always 43 chars, unpadded. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function generateInvitationToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashInvitationToken(rawToken: string): string {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex')
}

/**
 * Cheap shape check used before touching the database, so obviously-malformed
 * input costs a hash and a rate-limit slot rather than a query. Callers must
 * still return the same generic failure for a bad shape as for a valid-shaped
 * token that does not exist — see the API routes.
 */
export function isPlausibleTokenShape(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value)
}

/**
 * Constant-time comparison of two hex hashes. Not strictly required (the
 * secret is 256 random bits, so a timing oracle on the hash buys an attacker
 * nothing practical), but it costs nothing and removes the question.
 */
export function hashesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Email shown back to a participant after their invitation validates, so they
 * can confirm they opened the right invitation without the page ever
 * displaying a full address it was handed by the server.
 *
 * "vanessa@example.com" -> "v***@example.com"
 */
export function maskEmail(email: string): string {
  const trimmed = email.trim()
  const at = trimmed.lastIndexOf('@')
  if (at <= 0) return '***'
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  if (!domain) return '***'
  const first = local.slice(0, 1)
  return `${first}***@${domain}`
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}
