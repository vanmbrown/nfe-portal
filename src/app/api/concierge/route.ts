import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import type { NfeAttributionContext } from '@/lib/analytics/utm'
import { messageRatelimit } from '@/lib/ratelimit'
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

function cleanString(value: unknown, maxLength = 240): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

function cleanBoolean(value: unknown): boolean {
  return value === true
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

function renderAttribution(attribution: NfeAttributionContext) {
  return [
    renderRow('UTM Source', attribution.utmSource),
    renderRow('UTM Medium', attribution.utmMedium),
    renderRow('UTM Campaign', attribution.utmCampaign),
    renderRow('UTM Content', attribution.utmContent),
    renderRow('Landing Page', attribution.landingPage),
    renderRow('Referrer', attribution.referrer),
  ].join('')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const firstName = cleanString(body.firstName, 80)
    const email = cleanString(body.email, 180).toLowerCase()
    const primaryArea = cleanString(body.primaryArea, 40)
    const primaryConcern = cleanString(body.primaryConcern, 260)
    const routineFrustration = cleanString(body.routineFrustration, 500)
    const productInterest = cleanString(body.productInterest, 80)
    const discoveryInterest = cleanString(body.discoveryInterest, 80)
    const quizResult = cleanString(body.quizResult, 180)
    const message = cleanString(body.message, 900)
    const consent = cleanBoolean(body.consent)
    const attribution = cleanAttribution(body.attribution)

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (!primaryArea || !message || !consent) {
      return NextResponse.json(
        { error: 'Please complete the required fields and consent checkbox.' },
        { status: 400 }
      )
    }

    if (messageRatelimit) {
      try {
        const ip =
          req.headers.get('cf-connecting-ip') ??
          req.headers.get('x-forwarded-for') ??
          'anonymous'
        const { success } = await messageRatelimit.limit(ip)

        if (!success) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
          )
        }
      } catch (rateLimitError) {
        console.error('[concierge] rate limit failed:', rateLimitError)
        return NextResponse.json(
          { error: 'Concierge is temporarily unavailable. Please try again later.' },
          { status: 503 }
        )
      }
    }

    if (!process.env.RESEND_API_KEY || !ADMIN_NOTIFICATION_EMAIL) {
      console.error('[concierge] Email service is not fully configured')
      return NextResponse.json(
        { error: 'Concierge is temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    const resend = getResend()
    await resend.emails.send({
      from: 'NFE Beauty <notifications@nfebeauty.com>',
      to: ADMIN_NOTIFICATION_EMAIL,
      subject: 'New NFE Concierge Note',
      html: `
        <div style="font-family: sans-serif; max-width: 680px;">
          <h2>New NFE Concierge Note</h2>
          ${renderRow('First Name', firstName)}
          ${renderRow('Email', email)}
          ${renderRow('Primary Area', primaryArea)}
          ${renderRow('Primary Concern', primaryConcern)}
          ${renderRow('Routine Frustration', routineFrustration)}
          ${renderRow('Product Interest', productInterest)}
          ${renderRow('Discovery Interest', discoveryInterest)}
          ${renderRow('Skin Ritual Quiz Result', quizResult)}
          ${renderRow('Consent Accepted', consent)}
          <p><strong>Message:</strong></p>
          <pre style="white-space: pre-wrap; font-family: sans-serif;">${escapeHtml(message)}</pre>
          ${renderAttribution(attribution)}
          <p><strong>Time:</strong> ${escapeHtml(new Date().toISOString())}</p>
          <p style="color: #666; font-size: 13px;">
            This Concierge note is for cosmetic ritual support and product-fit guidance only.
          </p>
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Your note has been received. A thoughtful response will follow.',
    })
  } catch (error) {
    console.error('[concierge] route failed:', error)
    return NextResponse.json(
      { error: 'Unable to send your note right now.' },
      { status: 500 }
    )
  }
}
