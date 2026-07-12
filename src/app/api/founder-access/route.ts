import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import type { NfeAttributionContext } from '@/lib/analytics/utm'
import { syncBeehiivSubscriber } from '@/lib/beehiiv/subscriber'
import { FOUNDER_ACCESS_CONSENT_TEXT_VERSION } from '@/content/founder-access/options'
import {
  cleanAgeRange,
  cleanEmail,
  cleanProductInterest,
  cleanSkinInterests,
  cleanString,
  computeHighIntent,
} from '@/lib/founder-access/validation'
import { checkSubscribeRateLimit } from '@/lib/ratelimit'
import { createAdminSupabase } from '@/lib/supabase/server'
import { escapeHtml } from '@/lib/utils/sanitize'

const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || process.env.FORWARD_TO_EMAIL

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured')
  }
  return new Resend(apiKey)
}

function cleanAttribution(value: unknown): NfeAttributionContext {
  if (!value || typeof value !== 'object') return {}

  const attribution = value as Record<string, unknown>

  return {
    utmSource: cleanString(attribution.utmSource),
    utmMedium: cleanString(attribution.utmMedium),
    utmCampaign: cleanString(attribution.utmCampaign),
    utmTerm: cleanString(attribution.utmTerm),
    utmContent: cleanString(attribution.utmContent),
    referrer: cleanString(attribution.referrer, 300),
    landingPage: cleanString(attribution.landingPage, 300),
    capturedAt: cleanString(attribution.capturedAt, 60),
  }
}

function renderRow(label: string, value: string | boolean | undefined) {
  if (value === undefined || value === '') return ''
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</p>`
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get('cf-connecting-ip') ??
      req.headers.get('x-forwarded-for') ??
      'anonymous'
    const rateLimitDecision = await checkSubscribeRateLimit(ip)
    if (rateLimitDecision === 'rate_limited') {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const payload = await req.json()
    const email = cleanEmail(payload.email)
    const firstName = cleanString(payload.firstName, 80)
    const lastName = cleanString(payload.lastName, 80)
    const phone = cleanString(payload.phone, 40)
    const ageRange = cleanAgeRange(payload.ageRange)
    const primarySkinInterests = cleanSkinInterests(payload.primarySkinInterests)
    const productInterest = cleanProductInterest(payload.productInterest)
    const topicRequest = cleanString(payload.topicRequest, 900)
    const newsletterOptIn = payload.newsletterOptIn === true
    const privacyPolicyAccepted = payload.privacyPolicyAccepted === true
    const attribution = cleanAttribution(payload.attribution)
    const sourcePage = cleanString(payload.sourcePage, 120) ?? '/founder-access'
    const now = new Date().toISOString()

    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Please provide your first name and a valid email address.' },
        { status: 400 }
      )
    }

    if (!privacyPolicyAccepted) {
      return NextResponse.json(
        { error: 'Please acknowledge the Privacy Policy to continue.' },
        { status: 400 }
      )
    }

    const highIntent = computeHighIntent({
      newsletterOptIn,
      productInterest,
      topicRequest,
    })

    const signupRecord = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
      age_range: ageRange,
      primary_skin_interests: primarySkinInterests,
      product_interest: productInterest,
      topic_request: topicRequest,
      newsletter_opt_in: newsletterOptIn,
      privacy_policy_accepted: privacyPolicyAccepted,
      consent_text_version: FOUNDER_ACCESS_CONSENT_TEXT_VERSION,
      consented_at: now,
      source_page: sourcePage,
      utm_source: attribution.utmSource,
      utm_medium: attribution.utmMedium,
      utm_campaign: attribution.utmCampaign,
      utm_term: attribution.utmTerm,
      utm_content: attribution.utmContent,
      referrer: attribution.referrer,
      landing_page: attribution.landingPage,
      high_intent: highIntent,
      updated_at: now,
    }

    let dbSuccess = false
    let beehiivStatus: string | undefined
    let beehiivReason: string | undefined
    const supabase = createAdminSupabase()

    try {
      const { data: existingSignup, error: lookupError } = await supabase
        .from('founder_access_signups')
        .select('id')
        .eq('email', email)
        .maybeSingle()

      if (lookupError) {
        console.error('[founder-access] lookup failed:', lookupError)
        return NextResponse.json(
          { error: 'Unable to save your request right now. Please try again.' },
          { status: 500 }
        )
      }

      if (existingSignup) {
        const { error: updateError } = await supabase
          .from('founder_access_signups')
          .update(signupRecord)
          .eq('id', existingSignup.id)

        if (updateError) {
          console.error('[founder-access] update failed:', updateError)
          return NextResponse.json(
            { error: 'Unable to save your request right now. Please try again.' },
            { status: 500 }
          )
        }
      } else {
        const { error: insertError } = await supabase
          .from('founder_access_signups')
          .insert(signupRecord)

        if (insertError) {
          console.error('[founder-access] insert failed:', insertError)
          return NextResponse.json(
            { error: 'Unable to save your request right now. Please try again.' },
            { status: 500 }
          )
        }
      }

      dbSuccess = true

      const { data: existingSubscriber } = await supabase
        .from('subscribers')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (!existingSubscriber) {
        await supabase.from('subscribers').insert({
          email,
          source: 'founder_access',
        })
      }
    } catch (dbError) {
      console.error('[founder-access] database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Unable to save your request right now. Please try again.' },
        { status: 500 }
      )
    }

    if (dbSuccess) {
      const beehiivResult = await syncBeehiivSubscriber({
        email,
        intent: 'founder_access',
        source: 'founder_access',
        pagePath: sourcePage,
        consentSource: 'founder_access',
        marketingOptIn: newsletterOptIn,
        privacyPolicyAccepted,
        attribution,
        founderAccess: {
          firstName,
          lastName,
          phone,
          productInterest,
          primarySkinInterests,
          topicRequest,
          signupDate: now,
          sourcePage,
          highIntent,
        },
      })
      beehiivStatus = beehiivResult.status
      beehiivReason = beehiivResult.reason

      if (process.env.RESEND_API_KEY) {
        try {
          const resend = getResend()
          await resend.emails.send({
            from: 'NFE Beauty <notifications@nfebeauty.com>',
            to: email,
            subject: 'Your Founder Access request is received',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1B3A34;">
                <h2 style="color: #1B3A34;">Thank you, ${escapeHtml(firstName)}.</h2>
                <p>Your Founder Access request has been received.</p>
                <p>NFE will open the Founder's Edition release in limited waves. Watch your inbox for founder updates and early access details when invitations begin.</p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">With care,<br>Vanessa<br>NFE Beauty</p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error('[founder-access] confirmation email failed:', emailError)
        }
      }

      if (process.env.RESEND_API_KEY && ADMIN_NOTIFICATION_EMAIL) {
        try {
          const resend = getResend()
          await resend.emails.send({
            from: 'NFE Beauty <notifications@nfebeauty.com>',
            to: ADMIN_NOTIFICATION_EMAIL,
            subject: 'New Founder Access Request',
            html: `
              <div style="font-family: sans-serif; max-width: 680px;">
                <h2>New Founder Access Request</h2>
                ${renderRow('First Name', firstName)}
                ${renderRow('Last Name', lastName)}
                ${renderRow('Email', email)}
                ${renderRow('Phone', phone)}
                ${renderRow('Age Range', ageRange)}
                ${renderRow('Primary Skin Interests', primarySkinInterests.join(', '))}
                ${renderRow('Product Interest', productInterest)}
                ${renderRow('Topic Request', topicRequest)}
                ${renderRow('Newsletter Opt-In', newsletterOptIn)}
                ${renderRow('High Intent', highIntent)}
                ${renderRow('Source Page', sourcePage)}
                ${renderRow('UTM Source', attribution.utmSource)}
                ${renderRow('UTM Campaign', attribution.utmCampaign)}
                ${renderRow('Referrer', attribution.referrer)}
                ${renderRow('Beehiiv Status', beehiivStatus)}
                ${renderRow('Beehiiv Reason', beehiivReason)}
                <p><strong>Time:</strong> ${escapeHtml(now)}</p>
              </div>
            `,
          })
        } catch (emailError) {
          console.error('[founder-access] admin notification failed:', emailError)
        }
      }

      await supabase
        .from('founder_access_signups')
        .update({ beehiiv_status: beehiivStatus, beehiiv_reason: beehiivReason })
        .eq('email', email)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[founder-access] critical route error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
