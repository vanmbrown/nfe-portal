'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'
import {
  buildAttributionForRequest,
  preserveAttributionFromLocation,
  type NfeAttributionContext,
} from '@/lib/analytics/utm'
import {
  FOUNDER_ACCESS_AGE_RANGES,
  FOUNDER_ACCESS_PRODUCT_INTERESTS,
  FOUNDER_ACCESS_SKIN_INTERESTS,
  FOUNDER_ACCESS_SUCCESS_MESSAGE,
  type FounderAccessProductInterest,
  type FounderAccessSkinInterest,
} from '@/content/founder-access/options'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export function FounderAccessForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [skinInterests, setSkinInterests] = useState<FounderAccessSkinInterest[]>(
    []
  )
  const [productInterest, setProductInterest] = useState<
    FounderAccessProductInterest | ''
  >('')
  const [topicRequest, setTopicRequest] = useState('')
  const [newsletterOptIn, setNewsletterOptIn] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [attribution, setAttribution] = useState<NfeAttributionContext>({})
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    setAttribution(preserveAttributionFromLocation())
    trackNfeEvent({
      name: NFE_EVENT_NAMES.formViewed,
      area: 'founder_access',
      pagePath: '/founder-access',
      source: 'founder_access',
      formId: 'founder-access-form',
    })
  }, [])

  function markStarted() {
    if (!hasStarted) {
      setHasStarted(true)
      trackNfeEvent({
        name: NFE_EVENT_NAMES.ctaClicked,
        area: 'founder_access',
        pagePath: '/founder-access',
        source: 'founder_access',
        formId: 'founder-access-form',
        ctaLabel: 'form_started',
      })
    }
  }

  function toggleSkinInterest(interest: FounderAccessSkinInterest) {
    markStarted()
    setSkinInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    trackNfeEvent({
      name: NFE_EVENT_NAMES.formSubmitted,
      area: 'founder_access',
      pagePath: '/founder-access',
      source: 'founder_access',
      formId: 'founder-access-form',
      consentGranted: newsletterOptIn,
      metadata: {
        productInterest: productInterest || 'none',
        skinInterestCount: skinInterests.length,
        topicSubmitted: Boolean(topicRequest.trim()),
      },
    })

    try {
      const response = await fetch('/api/founder-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          ageRange: ageRange || undefined,
          primarySkinInterests: skinInterests,
          productInterest: productInterest || undefined,
          topicRequest,
          newsletterOptIn,
          privacyPolicyAccepted: privacyAccepted,
          sourcePage: '/founder-access',
          attribution: {
            ...attribution,
            ...buildAttributionForRequest(),
          },
        }),
      })

      if (response.ok) {
        setStatus('success')
        trackNfeEvent({
          name: NFE_EVENT_NAMES.founderAccessJoined,
          area: 'founder_access',
          pagePath: '/founder-access',
          source: 'founder_access',
          formId: 'founder-access-form',
          consentGranted: newsletterOptIn,
          metadata: {
            productInterest: productInterest || 'none',
            newsletterOptIn,
            topicSubmitted: Boolean(topicRequest.trim()),
          },
        })
        trackNfeEvent({
          name: NFE_EVENT_NAMES.formSucceeded,
          area: 'founder_access',
          pagePath: '/founder-access',
          source: 'founder_access',
          formId: 'founder-access-form',
          consentGranted: newsletterOptIn,
        })
        return
      }

      const data = await response.json().catch(() => ({ error: 'Unknown error' }))
      setStatus('error')
      setErrorMessage(data.error || 'Something went wrong. Please try again.')
      trackNfeEvent({
        name: NFE_EVENT_NAMES.formFailed,
        area: 'founder_access',
        pagePath: '/founder-access',
        source: 'founder_access',
        formId: 'founder-access-form',
        metadata: { status: response.status },
      })
    } catch {
      setStatus('error')
      setErrorMessage('Unable to connect. Please try again.')
      trackNfeEvent({
        name: NFE_EVENT_NAMES.formFailed,
        area: 'founder_access',
        pagePath: '/founder-access',
        source: 'founder_access',
        formId: 'founder-access-form',
      })
    }
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[1.75rem] border border-nfe-green-900/10 bg-white p-8 md:p-10"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
          Founder Access
        </p>
        <h2 className="mt-4 font-serif text-3xl text-nfe-green-900 md:text-4xl">
          Request received.
        </h2>
        <p className="mt-6 leading-8 text-nfe-ink/70">
          {FOUNDER_ACCESS_SUCCESS_MESSAGE}
        </p>
        <div className="mt-8">
          <Link
            href="/skin-ritual-quiz"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper"
          >
            Take the Skin Ritual Quiz
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      id="request-founder-access"
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-nfe-green-900/10 bg-white p-8 md:p-10"
    >
      <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
        Founder Access
      </p>
      <h2 className="mt-4 font-serif text-3xl text-nfe-green-900 md:text-4xl">
        Request Founder Access.
      </h2>
      <p className="mt-6 leading-8 text-nfe-ink/70">
        Join the private Founder Access list for release updates, founder notes,
        and early invitation into NFE&apos;s first Founder&apos;s Edition
        allocation.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="founder-first-name" className="mb-2 block text-sm text-nfe-ink/80">
            First Name <span className="text-nfe-green-700">*</span>
          </label>
          <input
            id="founder-first-name"
            type="text"
            required
            value={firstName}
            onChange={(e) => {
              markStarted()
              setFirstName(e.target.value)
            }}
            className="w-full rounded-xl border border-nfe-green-900/15 bg-nfe-paper px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold"
          />
        </div>
        <div>
          <label htmlFor="founder-last-name" className="mb-2 block text-sm text-nfe-ink/80">
            Last Name
          </label>
          <input
            id="founder-last-name"
            type="text"
            value={lastName}
            onChange={(e) => {
              markStarted()
              setLastName(e.target.value)
            }}
            className="w-full rounded-xl border border-nfe-green-900/15 bg-nfe-paper px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold"
          />
        </div>
        <div>
          <label htmlFor="founder-email" className="mb-2 block text-sm text-nfe-ink/80">
            Email Address <span className="text-nfe-green-700">*</span>
          </label>
          <input
            id="founder-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              markStarted()
              setEmail(e.target.value)
            }}
            className="w-full rounded-xl border border-nfe-green-900/15 bg-nfe-paper px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold"
          />
        </div>
        <div>
          <label htmlFor="founder-phone" className="mb-2 block text-sm text-nfe-ink/80">
            Phone Number
          </label>
          <input
            id="founder-phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              markStarted()
              setPhone(e.target.value)
            }}
            className="w-full rounded-xl border border-nfe-green-900/15 bg-nfe-paper px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="founder-age-range" className="mb-2 block text-sm text-nfe-ink/80">
            Age Range
          </label>
          <select
            id="founder-age-range"
            value={ageRange}
            onChange={(e) => {
              markStarted()
              setAgeRange(e.target.value)
            }}
            className="w-full rounded-xl border border-nfe-green-900/15 bg-nfe-paper px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold"
          >
            <option value="">Select an age range</option>
            {FOUNDER_ACCESS_AGE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="mb-4 text-sm font-medium text-nfe-ink/80">
          Primary Skin Interest
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {FOUNDER_ACCESS_SKIN_INTERESTS.map((interest) => (
            <label
              key={interest}
              className="flex items-start gap-3 rounded-xl border border-nfe-green-900/10 bg-nfe-paper px-4 py-3 text-sm leading-6 text-nfe-ink/70"
            >
              <input
                type="checkbox"
                checked={skinInterests.includes(interest)}
                onChange={() => toggleSkinInterest(interest)}
                className="mt-1"
              />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="mb-4 text-sm font-medium text-nfe-ink/80">
          Product Interest
        </legend>
        <div className="flex flex-wrap gap-4">
          {FOUNDER_ACCESS_PRODUCT_INTERESTS.map((option) => (
            <label
              key={option.value}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-nfe-green-900/15 px-4 py-2 text-sm"
            >
              <input
                type="radio"
                name="product-interest"
                value={option.value}
                checked={productInterest === option.value}
                onChange={() => {
                  markStarted()
                  setProductInterest(option.value)
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-8">
        <label htmlFor="founder-topic-request" className="mb-2 block text-sm text-nfe-ink/80">
          Topic Request
        </label>
        <p className="mb-3 text-sm leading-6 text-nfe-ink/60">
          What would you like Vanessa to discuss in future NFE founder notes,
          skincare articles, or podcast conversations?
        </p>
        <textarea
          id="founder-topic-request"
          rows={4}
          value={topicRequest}
          onChange={(e) => {
            markStarted()
            setTopicRequest(e.target.value)
          }}
          className="w-full rounded-xl border border-nfe-green-900/15 bg-nfe-paper px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold"
        />
      </div>

      <div className="mt-8 space-y-4">
        <label className="flex items-start gap-3 text-sm leading-6 text-nfe-ink/70">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
            className="mt-1"
          />
          <span>
            I have read and agree to the{' '}
            <Link href="/privacy" className="underline hover:text-nfe-green-900">
              Privacy Policy
            </Link>
            . NFE provides cosmetic ritual guidance only, not medical advice.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-nfe-ink/70">
          <input
            type="checkbox"
            checked={newsletterOptIn}
            onChange={(e) => setNewsletterOptIn(e.target.checked)}
            className="mt-1"
          />
          <span>
            Yes, I would like to receive NFE founder updates, skincare education,
            articles, and product release news. I understand I can unsubscribe
            at any time.
          </span>
        </label>
      </div>

      <p className="mt-6 text-sm leading-6 text-nfe-ink/60">
        No public launch date has been announced. Access will open in limited
        waves.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? 'Submitting...' : 'Request Founder Access'}
        </button>
        <Link
          href="/skin-ritual-quiz"
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition-colors hover:bg-nfe-green-900 hover:text-nfe-paper"
        >
          Take the Skin Ritual Quiz
        </Link>
      </div>

      {status === 'error' && errorMessage ? (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}
    </form>
  )
}
