'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'

import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'
import {
  buildAttributionForRequest,
  preserveAttributionFromLocation,
  type NfeAttributionContext,
} from '@/lib/analytics/utm'
import { getCrmTagsForIntent } from '@/lib/customer-intelligence/tags'

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'

const initialForm = {
  firstName: '',
  email: '',
  primaryArea: '',
  primaryConcern: '',
  routineFrustration: '',
  productInterest: '',
  discoveryInterest: '',
  quizResult: '',
  message: '',
  consent: false,
}

function conciergeMetadata() {
  return {
    tags: getCrmTagsForIntent('concierge').join(','),
    storage: 'admin_notification_only',
    automation: 'not_live',
  }
}

export default function ConciergeIntake() {
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [attribution, setAttribution] = useState<NfeAttributionContext>({})
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    setAttribution(preserveAttributionFromLocation())
    trackNfeEvent({
      name: NFE_EVENT_NAMES.formViewed,
      area: 'concierge',
      pagePath: '/concierge',
      formId: 'concierge-intake',
      metadata: conciergeMetadata(),
    })
  }, [])

  function updateField(field: keyof typeof initialForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))

    if (!hasStarted) {
      setHasStarted(true)
      trackNfeEvent({
        name: NFE_EVENT_NAMES.conciergeInterestCaptured,
        area: 'concierge',
        pagePath: '/concierge',
        formId: 'concierge-intake',
        metadata: {
          ...conciergeMetadata(),
          stage: 'form_started',
        },
      })
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    trackNfeEvent({
      name: NFE_EVENT_NAMES.formSubmitted,
      area: 'concierge',
      pagePath: '/concierge',
      formId: 'concierge-intake',
      consentGranted: form.consent,
      metadata: conciergeMetadata(),
    })

    try {
      const response = await fetch('/api/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'concierge',
          context: {
            intent: 'concierge',
            pagePath:
              typeof window !== 'undefined' ? window.location.pathname : '/concierge',
            consentSource: 'concierge',
            marketingOptIn: false,
            privacyPolicyAccepted: form.consent,
          },
          attribution: {
            ...attribution,
            ...buildAttributionForRequest(),
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Unable to send your note right now.')
      }

      setStatus('success')
      setForm(initialForm)
      setHasStarted(false)
      trackNfeEvent({
        name: NFE_EVENT_NAMES.conciergeInterestCaptured,
        area: 'concierge',
        pagePath: '/concierge',
        formId: 'concierge-intake',
        consentGranted: true,
        metadata: {
          ...conciergeMetadata(),
          stage: 'form_completed',
          primaryArea: form.primaryArea || 'not_shared',
          productInterest: form.productInterest || 'not_shared',
          discoveryInterest: form.discoveryInterest || 'not_shared',
        },
      })
      trackNfeEvent({
        name: NFE_EVENT_NAMES.formSucceeded,
        area: 'concierge',
        pagePath: '/concierge',
        formId: 'concierge-intake',
        consentGranted: true,
        metadata: conciergeMetadata(),
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to send your note right now.'
      setStatus('error')
      setErrorMessage(message)
      trackNfeEvent({
        name: NFE_EVENT_NAMES.formFailed,
        area: 'concierge',
        pagePath: '/concierge',
        formId: 'concierge-intake',
        consentGranted: form.consent,
        metadata: {
          ...conciergeMetadata(),
          reason: 'submission_failed',
        },
      })
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-3xl border border-nfe-green-100 bg-nfe-paper p-8 text-center shadow-sm"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-nfe-green-700">
          Note Received
        </p>
        <h3 className="mt-4 font-serif text-3xl text-nfe-green-900">
          Your note has been received.
        </h3>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-nfe-muted">
          A thoughtful response will follow. Concierge guidance remains
          cosmetic, measured, and private.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full border border-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper"
        >
          Send another note
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 rounded-3xl border border-nfe-green-100 bg-nfe-paper p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="First name" id="concierge-first-name">
          <input
            id="concierge-first-name"
            name="firstName"
            value={form.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            maxLength={80}
            autoComplete="given-name"
            className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
          />
        </Field>
        <Field label="Email" id="concierge-email" required>
          <input
            id="concierge-email"
            name="email"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            maxLength={180}
            autoComplete="email"
            required
            className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Primary area of interest"
          id="concierge-primary-area"
          required
        >
          <select
            id="concierge-primary-area"
            name="primaryArea"
            value={form.primaryArea}
            onChange={(event) => updateField('primaryArea', event.target.value)}
            required
            className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
          >
            <option value="">Select one</option>
            <option value="face">Face</option>
            <option value="body">Body</option>
            <option value="both">Both</option>
            <option value="unsure">Unsure</option>
          </select>
        </Field>
        <Field label="Product interest" id="concierge-product-interest">
          <select
            id="concierge-product-interest"
            name="productInterest"
            value={form.productInterest}
            onChange={(event) =>
              updateField('productInterest', event.target.value)
            }
            className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
          >
            <option value="">Select if known</option>
            <option value="face-elixir">Face Elixir</option>
            <option value="body-elixir">Body Elixir</option>
            <option value="founders-set">Founder&apos;s Set</option>
            <option value="unsure">Unsure</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Primary concern" id="concierge-primary-concern">
          <input
            id="concierge-primary-concern"
            name="primaryConcern"
            value={form.primaryConcern}
            onChange={(event) =>
              updateField('primaryConcern', event.target.value)
            }
            maxLength={260}
            placeholder="Example: dryness, texture, comfort, radiance"
            className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
          />
        </Field>
        <Field
          label="Discovery Ritual interest"
          id="concierge-discovery-interest"
        >
          <select
            id="concierge-discovery-interest"
            name="discoveryInterest"
            value={form.discoveryInterest}
            onChange={(event) =>
              updateField('discoveryInterest', event.target.value)
            }
            className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
          >
            <option value="">Select if relevant</option>
            <option value="face">Face Discovery</option>
            <option value="body">Body Discovery</option>
            <option value="full-ritual">Full Ritual Discovery</option>
            <option value="not-sure">Not sure yet</option>
          </select>
        </Field>
      </div>

      <Field
        label="Current routine frustration"
        id="concierge-routine-frustration"
      >
        <textarea
          id="concierge-routine-frustration"
          name="routineFrustration"
          value={form.routineFrustration}
          onChange={(event) =>
            updateField('routineFrustration', event.target.value)
          }
          maxLength={500}
          rows={3}
          placeholder="Share what feels crowded, uncomfortable, underwhelming, or difficult to sustain."
          className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
        />
      </Field>

      <Field
        label="Skin Ritual Quiz result, optional"
        id="concierge-quiz-result"
      >
        <input
          id="concierge-quiz-result"
          name="quizResult"
          value={form.quizResult}
          onChange={(event) => updateField('quizResult', event.target.value)}
          maxLength={180}
          placeholder="Example: Discovery Ritual, Face Elixir, Body Elixir"
          className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
        />
      </Field>

      <Field label="Message" id="concierge-message" required>
        <textarea
          id="concierge-message"
          name="message"
          value={form.message}
          onChange={(event) => updateField('message', event.target.value)}
          maxLength={900}
          rows={5}
          required
          placeholder="Ask for cosmetic ritual support or product-fit guidance. Please do not include clinical history, medication details, photos, or private clinical information."
          className="w-full rounded-xl border border-nfe-green-100 bg-white px-4 py-3 text-nfe-ink outline-none transition focus:border-nfe-green-700"
        />
      </Field>

      <label className="flex gap-3 rounded-2xl border border-nfe-green-100 bg-white p-4 text-sm leading-6 text-nfe-muted">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(event) => updateField('consent', event.target.checked)}
          required
          className="mt-1 h-4 w-4 shrink-0 accent-nfe-green-900"
        />
        <span>
          I understand this is cosmetic skincare guidance only, and I agree to
          share this note with NFE Concierge under the{' '}
          <Link href="/privacy" className="underline hover:no-underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <p className="text-xs leading-5 text-nfe-muted">
        Please do not include clinical labels, medication details, photos, or
        private clinical information.
      </p>

      {status === 'error' && errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending note' : 'Send note to Concierge'}
      </button>
    </form>
  )
}

function Field({
  label,
  id,
  required = false,
  children,
}: {
  label: string
  id: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label htmlFor={id} className="grid gap-2">
      <span className="text-sm font-medium text-nfe-green-900">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {children}
    </label>
  )
}
