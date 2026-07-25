'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'
import { lookupMockInvitation } from '@/lib/seed-access/mockInvitations'
import {
  STUDY_CIRCLE_AGE_RANGES,
  STUDY_CIRCLE_CONTACT_METHODS,
  STUDY_CIRCLE_SKIN_CONCERNS,
  STUDY_CIRCLE_SKIN_TYPES,
  STUDY_CIRCLE_SUCCESS_MESSAGE,
  studyCircleProductLabel,
  type StudyCircleSkinConcern,
} from '@/content/seed-access/options'

type InviteState = 'checking' | 'valid' | 'invalid'
type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface InvitationView {
  firstName: string | null
  maskedEmail: string
  productAssignment: string
}

const cardClass =
  'rounded-[1.75rem] border border-nfe-green-900/10 bg-white p-8 md:p-10'
const fieldClass =
  'w-full rounded-xl border border-nfe-green-900/15 bg-nfe-paper px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold'
const labelClass = 'mb-2 block text-sm text-nfe-ink/80'
const checkboxRowClass =
  'flex items-start gap-3 rounded-xl border border-nfe-green-900/10 bg-nfe-paper px-4 py-3 text-sm leading-6 text-nfe-ink/72'

export function StudyCircleExperience() {
  const searchParams = useSearchParams()
  const urlToken = searchParams.get('invite')

  /**
   * The token lives in a ref, not in state and not in storage. It is never
   * written to localStorage, a cookie, analytics, or the console. It is read
   * once from the URL, held in memory for the eventual submission, and the URL
   * is then cleaned so it does not linger in the address bar or in a
   * screenshot.
   */
  const tokenRef = useRef<string | null>(null)
  if (tokenRef.current === null && urlToken) tokenRef.current = urlToken

  const [inviteState, setInviteState] = useState<InviteState>('checking')
  const [invitation, setInvitation] = useState<InvitationView | null>(null)
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [hasStarted, setHasStarted] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [skinType, setSkinType] = useState('')
  const [skinConcerns, setSkinConcerns] = useState<StudyCircleSkinConcern[]>([])

  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [routine, setRoutine] = useState('')
  const [sensitivities, setSensitivities] = useState('')
  const [fragranceSensitive, setFragranceSensitive] = useState(false)
  const [contactMethod, setContactMethod] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')

  const [willingToUse, setWillingToUse] = useState(false)
  const [willingCheckins, setWillingCheckins] = useState(false)

  const [ackExpectations, setAckExpectations] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [contactAboutStudy, setContactAboutStudy] = useState(false)
  const [ackHonestFeedback, setAckHonestFeedback] = useState(false)
  const [internalUseConsent, setInternalUseConsent] = useState(false)
  const [confidentiality, setConfidentiality] = useState(false)

  const [quotePermission, setQuotePermission] = useState(false)
  const [quoteLengthEditPermission, setQuoteLengthEditPermission] = useState(false)
  const [firstNamePermission, setFirstNamePermission] = useState(false)
  const [fullNamePermission, setFullNamePermission] = useState(false)
  const [photoPermission, setPhotoPermission] = useState(false)
  const [videoPermission, setVideoPermission] = useState(false)
  const [websitePermission, setWebsitePermission] = useState(false)
  const [emailPermission, setEmailPermission] = useState(false)
  const [organicSocialPermission, setOrganicSocialPermission] = useState(false)
  const [paidMediaPermission, setPaidMediaPermission] = useState(false)
  const [futureContactPermission, setFutureContactPermission] = useState(false)
  const [marketingPermission, setMarketingPermission] = useState(false)

  useEffect(() => {
    trackNfeEvent({
      name: NFE_EVENT_NAMES.seedAccessViewed,
      area: 'seed_access',
      pagePath: '/study-circle',
      source: 'seed_access',
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    const token = tokenRef.current

    async function verify() {
      if (!token) {
        if (!cancelled) setInviteState('invalid')
        return
      }

      // Local development convenience only; never reachable in a production
      // build (see isMockModeEnabled).
      const mock = lookupMockInvitation(token)
      if (mock) {
        if (!cancelled) {
          setInvitation(mock)
          setInviteState('valid')
        }
        return
      }

      try {
        const response = await fetch('/api/seed-access/verify-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await response.json().catch(() => ({ valid: false }))
        if (cancelled) return
        if (data?.valid === true && data.invitation) {
          setInvitation(data.invitation as InvitationView)
          setInviteState('valid')
        } else {
          setInviteState('invalid')
        }
      } catch {
        if (!cancelled) setInviteState('invalid')
      }
    }

    void verify()
    return () => {
      cancelled = true
    }
  }, [])

  // Remove the token from the visible URL once it has been read into memory.
  // The submission still uses tokenRef, so this cannot destroy the only copy.
  useEffect(() => {
    if (!urlToken || typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.delete('invite')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [urlToken])

  useEffect(() => {
    if (inviteState === 'checking') return
    trackNfeEvent({
      name:
        inviteState === 'valid'
          ? NFE_EVENT_NAMES.seedAccessInviteValid
          : NFE_EVENT_NAMES.seedAccessInviteInvalid,
      area: 'seed_access',
      pagePath: '/study-circle',
      source: 'seed_access',
      // Enum only. The token is never an analytics property.
      metadata: invitation ? { product: invitation.productAssignment } : {},
    })
  }, [inviteState, invitation])

  const markStarted = useCallback(() => {
    setHasStarted((already) => {
      if (already) return already
      trackNfeEvent({
        name: NFE_EVENT_NAMES.seedAccessIntakeStarted,
        area: 'seed_access',
        pagePath: '/study-circle',
        source: 'seed_access',
      })
      return true
    })
  }, [])

  function toggleSkinConcern(concern: StudyCircleSkinConcern) {
    markStarted()
    setSkinConcerns((prev) =>
      prev.includes(concern)
        ? prev.filter((item) => item !== concern)
        : [...prev, concern]
    )
  }

  const requiredConsentComplete = useMemo(
    () =>
      ackExpectations &&
      privacyAccepted &&
      contactAboutStudy &&
      ackHonestFeedback &&
      internalUseConsent &&
      confidentiality,
    [
      ackExpectations,
      privacyAccepted,
      contactAboutStudy,
      ackHonestFeedback,
      internalUseConsent,
      confidentiality,
    ]
  )

  useEffect(() => {
    if (!requiredConsentComplete) return
    trackNfeEvent({
      name: NFE_EVENT_NAMES.seedAccessConsentCompleted,
      area: 'seed_access',
      pagePath: '/study-circle',
      source: 'seed_access',
    })
  }, [requiredConsentComplete])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const permissions = {
      quotePermission,
      quoteLengthEditPermission,
      firstNamePermission,
      fullNamePermission,
      photoPermission,
      videoPermission,
      websitePermission,
      emailPermission,
      organicSocialPermission,
      paidMediaPermission,
      futureContactPermission,
      marketingPermission,
    }

    try {
      const response = await fetch('/api/seed-access/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenRef.current,
          firstName,
          lastName,
          email,
          ageRange,
          skinType,
          primaryConcerns: skinConcerns,
          phone,
          location,
          currentRoutine: routine,
          sensitivities,
          fragranceSensitive,
          preferredContactMethod: contactMethod,
          additionalContext,
          willingToUseAsDirected: willingToUse,
          willingToCompleteCheckins: willingCheckins,
          // No product field is sent. The server derives it from the
          // invitation and ignores anything a client might supply.
          consent: {
            understandsExpectations: ackExpectations,
            privacyPolicy: privacyAccepted,
            studyContact: contactAboutStudy,
            honestFeedback: ackHonestFeedback,
            internalLearning: internalUseConsent,
            confidentiality,
          },
          permissions,
        }),
      })

      if (response.ok) {
        setStatus('success')
        trackNfeEvent({
          name: NFE_EVENT_NAMES.seedAccessJoined,
          area: 'seed_access',
          pagePath: '/study-circle',
          source: 'seed_access',
          consentGranted: internalUseConsent,
          metadata: {
            product: invitation?.productAssignment ?? 'unknown',
            concernCount: skinConcerns.length,
            optionalPermissionsGranted:
              Object.values(permissions).filter(Boolean).length,
          },
        })
        trackNfeEvent({
          name: NFE_EVENT_NAMES.seedAccessConfirmationViewed,
          area: 'seed_access',
          pagePath: '/study-circle',
          source: 'seed_access',
        })
        return
      }

      const data = await response.json().catch(() => ({}))
      setStatus('error')
      setErrorMessage(
        typeof data?.error === 'string'
          ? data.error
          : 'Something went wrong. Please try again, or reach out directly if it keeps happening.'
      )
    } catch {
      setStatus('error')
      setErrorMessage('Unable to connect. Please try again.')
    }
  }

  if (inviteState === 'checking') return null

  if (inviteState === 'invalid') {
    return (
      <div className="bg-nfe-paper text-nfe-ink">
        <section className="bg-[#efe4d5] px-6 py-24 text-center md:py-32">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#7a4f22]">
            A Private NFE Invitation
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            This private invitation could not be confirmed.
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-nfe-ink/72">
            Please return to the invitation NFE sent you, or contact the person
            who invited you and they will help.
          </p>
        </section>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="bg-nfe-paper text-nfe-ink">
        <section className="px-6 py-24 md:py-32">
          <div
            role="status"
            aria-live="polite"
            className={`mx-auto max-w-2xl ${cardClass} text-center`}
          >
            <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              The NFE Study Circle
            </p>
            <h1 className="mt-4 font-serif text-3xl text-nfe-green-900 md:text-4xl">
              Your place in the circle is confirmed.
            </h1>
            <p className="mt-6 leading-8 text-nfe-ink/72">
              {STUDY_CIRCLE_SUCCESS_MESSAGE}
            </p>
          </div>
        </section>
      </div>
    )
  }

  const productLabel = invitation
    ? (studyCircleProductLabel(invitation.productAssignment) ?? 'Your NFE ritual')
    : 'Your NFE ritual'

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-[#efe4d5] px-6 py-24 text-center md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#7a4f22]">
          A Private NFE Invitation
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-green-900 md:text-6xl">
          The NFE Study Circle
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-ink/72 md:text-xl">
          You&apos;ve been invited to experience NFE thoughtfully over four
          weeks, use the ritual consistently, and share honest observations
          along the way.
        </p>
        <div className="mt-10">
          <Link
            href="#study-circle-intake"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700"
          >
            Begin Your Private Intake
          </Link>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="font-serif text-2xl text-nfe-green-900 md:text-3xl">
            Why you were invited.
          </h2>
          <p className="leading-8 text-nfe-ink/72">
            This circle is intentionally small. You were invited for your
            perspective and relevance to who NFE is made for — not selected at
            random and not open for general sign-up.
          </p>
          <p className="leading-8 text-nfe-ink/72">
            The purpose is honest feedback. Positive feedback is not required,
            and your participation does not depend on it. What you share helps
            NFE refine ritual guidance, education, and care for the people who
            come after you.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl text-nfe-green-900 md:text-3xl">
              What participation includes.
            </h2>
            <ul className="mt-6 space-y-3 leading-7 text-nfe-ink/72">
              <li>Four weeks with your assigned NFE ritual, used as directed</li>
              <li>A first-use impression</li>
              <li>A check-in 7–10 days in</li>
              <li>A check-in at week 3–4</li>
              <li>Your product is a gift; participation is unpaid</li>
              <li>An optional conversation about a testimonial, only if you&apos;re open to it</li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-nfe-green-900 md:text-3xl">
              What NFE asks.
            </h2>
            <ul className="mt-6 space-y-3 leading-7 text-nfe-ink/72">
              <li>Consistent use across the four weeks</li>
              <li>Thoughtful, candid feedback — including what isn&apos;t working</li>
              <li>Completing the three check-ins above</li>
              <li>
                Stopping use and telling NFE promptly if anything feels
                uncomfortable, and seeking professional guidance where
                appropriate
              </li>
              <li>No obligation to post publicly, ever</li>
              <li>You may step away at any time, without penalty and without returning the product</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-nfe-green-900/10 bg-[#efe4d5] p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-[#7a4f22]">
            Privacy and permission
          </p>
          <p className="mt-6 leading-8 text-nfe-ink/72">
            Everything you share as part of this study is private. NFE will
            never use your name, your image, or your words without your
            separate, explicit permission — granted (or not) below, item by
            item. Saying no to any or all of it does not affect your place in
            the study.
          </p>
        </div>
      </section>

      <section id="study-circle-intake" className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className={cardClass}>
            <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              The NFE Study Circle
            </p>
            <h2 className="mt-4 font-serif text-3xl text-nfe-green-900 md:text-4xl">
              Your Private Intake
            </h2>

            <div className="mt-8 rounded-xl border border-nfe-green-900/10 bg-nfe-paper px-5 py-4">
              <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
                Your NFE Ritual
              </p>
              <p className="mt-2 font-serif text-2xl text-nfe-green-900">
                {productLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-nfe-ink/60">
                Chosen for you by NFE as part of this invitation.
              </p>
              {invitation?.maskedEmail ? (
                <p className="mt-3 text-sm leading-6 text-nfe-ink/60">
                  Invitation sent to {invitation.maskedEmail}
                </p>
              ) : null}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="sc-first-name" className={labelClass}>
                  First Name <span className="text-nfe-green-700">*</span>
                </label>
                <input
                  id="sc-first-name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => {
                    markStarted()
                    setFirstName(e.target.value)
                  }}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="sc-last-name" className={labelClass}>
                  Last Name <span className="text-nfe-green-700">*</span>
                </label>
                <input
                  id="sc-last-name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => {
                    markStarted()
                    setLastName(e.target.value)
                  }}
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="sc-email" className={labelClass}>
                  Email Address <span className="text-nfe-green-700">*</span>
                </label>
                <input
                  id="sc-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    markStarted()
                    setEmail(e.target.value)
                  }}
                  className={fieldClass}
                />
                <p className="mt-2 text-sm leading-6 text-nfe-ink/60">
                  Please use the address your invitation was sent to.
                </p>
              </div>
              <div>
                <label htmlFor="sc-age-range" className={labelClass}>
                  Age Range <span className="text-nfe-green-700">*</span>
                </label>
                <select
                  id="sc-age-range"
                  required
                  value={ageRange}
                  onChange={(e) => {
                    markStarted()
                    setAgeRange(e.target.value)
                  }}
                  className={fieldClass}
                >
                  <option value="">Select an age range</option>
                  {STUDY_CIRCLE_AGE_RANGES.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sc-skin-type" className={labelClass}>
                  Current Skin Type <span className="text-nfe-green-700">*</span>
                </label>
                <select
                  id="sc-skin-type"
                  required
                  value={skinType}
                  onChange={(e) => {
                    markStarted()
                    setSkinType(e.target.value)
                  }}
                  className={fieldClass}
                >
                  <option value="">Select an option</option>
                  {STUDY_CIRCLE_SKIN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sc-phone" className={labelClass}>
                  Phone Number
                </label>
                <input
                  id="sc-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>

            <fieldset className="mt-8">
              <legend className="mb-4 text-sm font-medium text-nfe-ink/80">
                Primary Skin Concerns <span className="text-nfe-green-700">*</span>
              </legend>
              <p className="mb-3 text-sm leading-6 text-nfe-ink/60">
                Self-reported, for context only. This is not a diagnosis.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {STUDY_CIRCLE_SKIN_CONCERNS.map((concern) => (
                  <label key={concern} className={checkboxRowClass}>
                    <input
                      type="checkbox"
                      checked={skinConcerns.includes(concern)}
                      onChange={() => toggleSkinConcern(concern)}
                      className="mt-1"
                    />
                    <span>{concern}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-8 space-y-3">
              <label className={checkboxRowClass}>
                <input
                  type="checkbox"
                  required
                  checked={willingToUse}
                  onChange={(e) => setWillingToUse(e.target.checked)}
                  className="mt-1"
                />
                <span>I&apos;m willing to use this as directed for the four-week study period.</span>
              </label>
              <label className={checkboxRowClass}>
                <input
                  type="checkbox"
                  required
                  checked={willingCheckins}
                  onChange={(e) => setWillingCheckins(e.target.checked)}
                  className="mt-1"
                />
                <span>I&apos;m willing to complete the three check-ins above.</span>
              </label>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="sc-location" className={labelClass}>
                  City / State
                </label>
                <input
                  id="sc-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={fieldClass}
                />
                <p className="mt-2 text-sm leading-6 text-nfe-ink/60">
                  The first cohort ships within the United States only.
                </p>
              </div>
              <div>
                <label htmlFor="sc-contact-method" className={labelClass}>
                  Preferred Contact Method
                </label>
                <select
                  id="sc-contact-method"
                  value={contactMethod}
                  onChange={(e) => setContactMethod(e.target.value)}
                  className={fieldClass}
                >
                  <option value="">Select an option</option>
                  {STUDY_CIRCLE_CONTACT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className={`${checkboxRowClass} mt-6`}>
              <input
                type="checkbox"
                checked={fragranceSensitive}
                onChange={(e) => setFragranceSensitive(e.target.checked)}
                className="mt-1"
              />
              <span>I have fragrance sensitivity.</span>
            </label>

            <div className="mt-8">
              <label htmlFor="sc-routine" className={labelClass}>
                Current skincare routine
              </label>
              <textarea
                id="sc-routine"
                rows={3}
                value={routine}
                onChange={(e) => setRoutine(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="mt-8">
              <label htmlFor="sc-sensitivities" className={labelClass}>
                Known sensitivities
              </label>
              <p className="mb-3 text-sm leading-6 text-nfe-ink/60">
                Please share only what may help NFE understand your
                cosmetic-use context. Do not include medical records or
                diagnostic information.
              </p>
              <textarea
                id="sc-sensitivities"
                rows={3}
                value={sensitivities}
                onChange={(e) => setSensitivities(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="mt-8">
              <label htmlFor="sc-additional-context" className={labelClass}>
                Anything else NFE should know
              </label>
              <textarea
                id="sc-additional-context"
                rows={3}
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="mt-12 border-t border-nfe-green-900/10 pt-8">
              <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
                Participation Agreement
              </p>
              <p className="mt-3 text-sm leading-6 text-nfe-ink/60">
                All six are required to take part.
              </p>
              <div className="mt-6 space-y-3">
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    required
                    checked={ackExpectations}
                    onChange={(e) => setAckExpectations(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I understand what this study asks of me: four weeks of use
                    as directed, my honest impressions, and the three check-ins
                    above.
                  </span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    required
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I have read and agree to the{' '}
                    <Link href="/privacy" className="underline hover:text-nfe-green-900">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    required
                    checked={contactAboutStudy}
                    onChange={(e) => setContactAboutStudy(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE may contact me about this study (logistics, check-in reminders, timing).</span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    required
                    checked={ackHonestFeedback}
                    onChange={(e) => setAckHonestFeedback(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I understand honest feedback is what&apos;s being asked for
                    — positive feedback is not required, and my participation
                    does not depend on it.
                  </span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    required
                    checked={internalUseConsent}
                    onChange={(e) => setInternalUseConsent(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE may use what I submit internally to inform product and education decisions.</span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    required
                    checked={confidentiality}
                    onChange={(e) => setConfidentiality(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I may discuss my experience privately. I understand I
                    should not publicly share unreleased packaging, pricing,
                    launch timing, or other unreleased product details without
                    NFE&apos;s written approval.
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-12 rounded-[1.75rem] border border-nfe-green-900/10 bg-[#efe4d5] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-[#7a4f22]">
                Sharing My Story
              </p>
              <p className="mt-3 text-sm leading-6 text-nfe-ink/72">
                Everything below is optional. You can say yes to none of these,
                some of these, or all of these — nothing here is required to
                take part, and you can ask NFE to stop any of it later.
              </p>

              <div className="mt-6 space-y-3">
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={quotePermission}
                    onChange={(e) => setQuotePermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE may quote my written feedback.</span>
                </label>
                {quotePermission ? (
                  <label className={checkboxRowClass}>
                    <input
                      type="checkbox"
                      checked={quoteLengthEditPermission}
                      onChange={(e) => setQuoteLengthEditPermission(e.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      NFE may shorten quotes for length without changing their
                      meaning. Any materially edited quote comes back to me for
                      approval first.
                    </span>
                  </label>
                ) : null}
              </div>

              <p className="mb-3 mt-6 text-sm font-medium text-nfe-ink/80">Attribution</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={firstNamePermission}
                    onChange={(e) => setFirstNamePermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE may use my first name.</span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={fullNamePermission}
                    onChange={(e) => setFullNamePermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE may use my full name.</span>
                </label>
              </div>

              <p className="mb-3 mt-6 text-sm font-medium text-nfe-ink/80">Media</p>
              <p className="mb-3 text-sm leading-6 text-nfe-ink/60">
                Photographs are always optional and never required to take part.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={photoPermission}
                    onChange={(e) => setPhotoPermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE may photograph me or use a photo I provide.</span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={videoPermission}
                    onChange={(e) => setVideoPermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE may use video of me.</span>
                </label>
              </div>

              <p className="mb-3 mt-6 text-sm font-medium text-nfe-ink/80">Where it may appear</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={websitePermission}
                    onChange={(e) => setWebsitePermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE&apos;s website</span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={emailPermission}
                    onChange={(e) => setEmailPermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>Email to NFE subscribers</span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={organicSocialPermission}
                    onChange={(e) => setOrganicSocialPermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>Organic social media — NFE&apos;s own posts</span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={paidMediaPermission}
                    onChange={(e) => setPaidMediaPermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>Paid advertising</span>
                </label>
              </div>

              <p className="mb-3 mt-6 text-sm font-medium text-nfe-ink/80">Ongoing relationship</p>
              <div className="space-y-3">
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={futureContactPermission}
                    onChange={(e) => setFutureContactPermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>NFE may contact me about future studies like this one.</span>
                </label>
                <label className={checkboxRowClass}>
                  <input
                    type="checkbox"
                    checked={marketingPermission}
                    onChange={(e) => setMarketingPermission(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    I&apos;d like to receive general NFE marketing emails. This
                    is separate from the study and declining does not affect my
                    participation.
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Submitting…' : 'Accept This Invitation'}
              </button>
            </div>

            {status === 'error' && errorMessage ? (
              <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  )
}
