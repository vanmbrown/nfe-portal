import { studyCircleProductLabel } from '../../content/seed-access/options'

/**
 * Study Circle email.
 *
 * Deliberately different from the Founder Access route in one respect: there,
 * a failed send is caught, logged, and invisible to everyone afterwards
 * (confirmed during Wave 1 production verification — a `{success:true}`
 * response does not mean an email arrived). Here, a failure returns a result
 * the caller records as an audit event, so an undelivered confirmation is
 * discoverable without grepping logs.
 *
 * Intake persistence still succeeds when email fails. An invited participant
 * should not lose their place because a mail provider had a bad minute.
 */

export interface EmailMessage {
  to: string
  subject: string
  html: string
  /**
   * Stable per (participant, message kind). A retry reuses the same key, so a
   * provider that honours idempotency keys will not double-send, and our own
   * audit trail can tell a retry from a genuine second message.
   */
  idempotencyKey: string
}

export type EmailSendResult =
  | { ok: true; providerId?: string }
  | { ok: false; errorCategory: EmailErrorCategory }

/** Coarse categories only — provider error text can echo the address back. */
export type EmailErrorCategory =
  | 'not_configured'
  | 'auth_failed'
  | 'rejected'
  | 'transport_error'

export interface EmailAdapter {
  send(message: EmailMessage): Promise<EmailSendResult>
}

/**
 * Test and local adapter. Captures messages in memory; sends nothing.
 * This is the adapter used by every automated test and by local end-to-end
 * runs — no real address is ever contacted.
 */
export class MockEmailAdapter implements EmailAdapter {
  readonly sent: EmailMessage[] = []
  private failNext = false

  failOnce(): void {
    this.failNext = true
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    if (this.failNext) {
      this.failNext = false
      return { ok: false, errorCategory: 'transport_error' }
    }
    // Idempotency: a repeated key is accepted but not duplicated.
    const already = this.sent.some((m) => m.idempotencyKey === message.idempotencyKey)
    if (!already) this.sent.push(message)
    return { ok: true, providerId: `mock-${message.idempotencyKey}` }
  }
}

export interface StudyCircleConfirmationInput {
  firstName: string
  email: string
  productAssignment: string
  participantId: string
}

export function buildParticipantConfirmation(
  input: StudyCircleConfirmationInput
): EmailMessage {
  const productLabel = studyCircleProductLabel(input.productAssignment) ?? 'NFE ritual'
  return {
    to: input.email,
    subject: 'Your place in The NFE Study Circle is confirmed',
    idempotencyKey: `sc-confirmation:${input.participantId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1B3A34;">
        <h2 style="color: #1B3A34;">Thank you, ${escapeHtml(input.firstName)}.</h2>
        <p>Your place in The NFE Study Circle is confirmed.</p>
        <p>Your ritual for this study is the <strong>${escapeHtml(productLabel)}</strong>.</p>
        <p>NFE will follow with product timing, ritual guidance, and the details of your first check-in. Nothing is needed from you until then.</p>
        <p>If anything about your participation is unclear at any point, or if you experience any discomfort once you begin, reply to this message and NFE will respond within one business day.</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">With care,<br>Vanessa<br>NFE Beauty</p>
      </div>
    `,
  }
}

export interface StudyCircleInternalNoticeInput {
  participantId: string
  invitationId: string
  productAssignment: string
  source: string
  ageRange: string
  skinType: string
  concernCount: number
  optionalPermissionsGranted: number
  adminEmail: string
}

/**
 * Internal operational notice. Carries record IDs and enums so the operator
 * can find the participant — never the raw invitation token, and never the
 * participant's freeform text.
 */
export function buildInternalNotification(
  input: StudyCircleInternalNoticeInput
): EmailMessage {
  return {
    to: input.adminEmail,
    subject: 'New NFE Study Circle participant',
    idempotencyKey: `sc-internal:${input.participantId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 680px;">
        <h2>New NFE Study Circle participant</h2>
        <p><strong>Participant record:</strong> ${escapeHtml(input.participantId)}</p>
        <p><strong>Invitation record:</strong> ${escapeHtml(input.invitationId)}</p>
        <p><strong>Assigned product:</strong> ${escapeHtml(
          studyCircleProductLabel(input.productAssignment) ?? input.productAssignment
        )}</p>
        <p><strong>Source:</strong> ${escapeHtml(input.source)}</p>
        <p><strong>Age range:</strong> ${escapeHtml(input.ageRange)}</p>
        <p><strong>Skin type:</strong> ${escapeHtml(input.skinType)}</p>
        <p><strong>Concerns selected:</strong> ${input.concernCount}</p>
        <p><strong>Optional permissions granted:</strong> ${input.optionalPermissionsGranted}</p>
        <p style="color:#666;font-size:13px;">Full intake detail is in the participant record. It is not reproduced here.</p>
      </div>
    `,
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
