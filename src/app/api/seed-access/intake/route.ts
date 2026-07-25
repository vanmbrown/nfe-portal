import { NextResponse } from 'next/server'
import { MockEmailAdapter, type EmailAdapter } from '@/lib/seed-access/email'
import { submitIntake } from '@/lib/seed-access/intakeService'
import { createIntakeLimiter } from '@/lib/seed-access/limiterAdapters'
import { checkIntakeRateLimit, requestKeyFromHeaders } from '@/lib/seed-access/rateLimit'
import { createResendEmailAdapter } from '@/lib/seed-access/resendAdapter'
import { createSupabaseSeedAccessStore } from '@/lib/seed-access/supabaseStore'
import { validateIntakePayload } from '@/lib/seed-access/validation'

/**
 * POST /api/seed-access/intake
 *
 * The product assignment is derived from the invitation record inside the
 * database function. Any product value present in the request body is ignored
 * by validation and never reaches the database.
 *
 * All six consent timestamps are generated server-side. A browser-supplied
 * timestamp is never read.
 */

function selectEmailAdapter(): EmailAdapter {
  // A real send requires an explicit opt-in as well as a key, so a developer
  // running locally with production-shaped env vars still cannot mail anyone.
  if (process.env.RESEND_API_KEY && process.env.STUDY_CIRCLE_ENABLE_EMAIL === 'true') {
    return createResendEmailAdapter(process.env.RESEND_API_KEY)
  }
  return new MockEmailAdapter()
}

export async function POST(req: Request) {
  try {
    const limiterOutcome = await checkIntakeRateLimit(
      createIntakeLimiter(),
      requestKeyFromHeaders(req.headers)
    )
    if (limiterOutcome === 'deny') {
      return NextResponse.json(
        { error: 'Too many requests. Please try again shortly.' },
        { status: 429 }
      )
    }

    let payload: unknown
    try {
      payload = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }

    const validation = validateIntakePayload(payload)
    if (!validation.ok) {
      // Category only. The offending value is never echoed or logged.
      const status = validation.reason === 'missing_required_consent' ? 400 : 400
      return NextResponse.json(
        {
          error:
            validation.reason === 'missing_required_consent'
              ? 'Please complete the required participation agreement.'
              : 'Please check the form and try again.',
        },
        { status }
      )
    }

    const result = await submitIntake(
      {
        store: createSupabaseSeedAccessStore(),
        email: selectEmailAdapter(),
        adminEmail:
          process.env.ADMIN_NOTIFICATION_EMAIL || process.env.FORWARD_TO_EMAIL,
      },
      validation.value
    )

    if (!result.ok) {
      // Expired, revoked, declined, already redeemed, and email mismatch all
      // land here with the same wording.
      return NextResponse.json(
        { error: 'This invitation link has expired or has already been used.' },
        { status: 409 }
      )
    }

    // emailDelivered is reported so the client can stay silent about it while
    // operations can still see the audit trail. The participant's place is
    // confirmed either way.
    return NextResponse.json({ success: true, emailDelivered: result.emailDelivered })
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}
