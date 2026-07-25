import { Resend } from 'resend'
import type { EmailAdapter, EmailMessage, EmailSendResult } from './email'

/**
 * Resend-backed adapter.
 *
 * Only constructed when BOTH a key is present and STUDY_CIRCLE_ENABLE_EMAIL is
 * explicitly "true" (see the intake route). Requiring the second flag means a
 * developer whose local environment happens to carry a real key still cannot
 * send mail by accident — the mock adapter is used instead.
 *
 * Errors are mapped to coarse categories. Provider error text can echo the
 * recipient address back, so it is never returned or logged verbatim.
 */
export function createResendEmailAdapter(apiKey: string): EmailAdapter {
  const resend = new Resend(apiKey)

  return {
    async send(message: EmailMessage): Promise<EmailSendResult> {
      try {
        const { error } = await resend.emails.send({
          from: 'NFE Beauty <notifications@nfebeauty.com>',
          to: message.to,
          subject: message.subject,
          html: message.html,
          headers: {
            // Honoured by providers that support it; harmless where not. Our
            // own idempotency guarantee is the participant record's unique
            // invitation_id, not this header.
            'Idempotency-Key': message.idempotencyKey,
          },
        })

        if (error) {
          const name = String((error as { name?: string }).name ?? '').toLowerCase()
          if (name.includes('auth') || name.includes('api_key')) {
            return { ok: false, errorCategory: 'auth_failed' }
          }
          return { ok: false, errorCategory: 'rejected' }
        }
        return { ok: true }
      } catch {
        return { ok: false, errorCategory: 'transport_error' }
      }
    },
  }
}
