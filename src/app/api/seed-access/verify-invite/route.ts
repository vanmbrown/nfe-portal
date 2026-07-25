import { NextResponse } from 'next/server'
import { verifyInvitation } from '@/lib/seed-access/invitationService'
import { createVerifyLimiter } from '@/lib/seed-access/limiterAdapters'
import { checkVerifyRateLimit, requestKeyFromHeaders } from '@/lib/seed-access/rateLimit'
import { createSupabaseSeedAccessStore } from '@/lib/seed-access/supabaseStore'

/**
 * POST /api/seed-access/verify-invite
 *
 * Every failure — malformed, unknown, expired, revoked, declined, already
 * redeemed, rate limited, or a database outage — returns exactly
 * `200 { valid: false }`. Same status, same body, no timing-relevant
 * branching that a caller can observe. That uniformity is the entire point:
 * it prevents this endpoint from confirming whether a guessed token or a
 * guessed email corresponds to a real invitation.
 */

const INVALID = { valid: false } as const

export async function POST(req: Request) {
  try {
    const limiterOutcome = await checkVerifyRateLimit(
      createVerifyLimiter(),
      requestKeyFromHeaders(req.headers)
    )
    if (limiterOutcome === 'deny') {
      // Deliberately not 429: a distinct status would tell a script it had
      // found a live endpoint worth pacing against.
      return NextResponse.json(INVALID)
    }

    let payload: unknown
    try {
      payload = await req.json()
    } catch {
      return NextResponse.json(INVALID)
    }

    const token = (payload as Record<string, unknown> | null)?.token
    const result = await verifyInvitation(createSupabaseSeedAccessStore(), token)

    if (!result.valid) return NextResponse.json(INVALID)

    return NextResponse.json({
      valid: true,
      invitation: {
        firstName: result.invitation.firstName,
        maskedEmail: result.invitation.maskedEmail,
        productAssignment: result.invitation.productAssignment,
      },
    })
  } catch {
    // Never leak a stack or a driver message to the participant.
    return NextResponse.json(INVALID)
  }
}
