'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'
import { checkMockInvitation, type MockInviteState } from '@/lib/seed-access/mockInvitations'
import {
  STUDY_CIRCLE_AGE_RANGES,
  STUDY_CIRCLE_CONTACT_METHODS,
  STUDY_CIRCLE_PRODUCTS,
  STUDY_CIRCLE_SKIN_CONCERNS,
  STUDY_CIRCLE_SKIN_TYPES,
  STUDY_CIRCLE_SUCCESS_MESSAGE,
  type StudyCircleProduct,
  type StudyCircleSkinConcern,
} from '@/content/seed-access/options'

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const cardClass =
  'rounded-[1.75rem] border border-nfe-green-900/10 bg-white p-8 md:p-10'
const fieldClass =
  'w-full rounded-xl border border-nfe-green-900/15 bg-nfe-paper px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nfe-gold'
const labelClass = 'mb-2 block text-sm text-nfe-ink/80'
const checkboxRowClass =
  'flex items-start gap-3 rounded-xl border border-nfe-green-900/10 bg-nfe-paper px-4 py-3 text-sm leading-6 text-nfe-ink/72'

export function StudyCircleExperience() {
  const searchParams = useSearchParams()
  const token = searchParams.get('invite')

  const [inviteState, setInviteState] = useState<MockInviteState>('checking')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [hasStarted, setHasStarted] = useState(false)

  // Required fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [skinType, setSkinType] = useState('')
  const [skinConcerns, setSkinConcerns] = useState<StudyCircleSkinConcern[]>([])
  const [product, setProduct] = useState<StudyCircleProduct | ''>('')
  const [willingToUse, setWillingToUse] = useState(false)
  const [willingCheckins, setWillingCheckins] = useState(false)

  // Optional fields
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [routine, setRoutine] = useState('')
  const [sensitivities, setSensitivities] = useState('')
  const [fragranceSensitive, setFragranceSensitive] = useState(false)
  const [contactMethod, setContactMethod] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')

  // Group A — required participation consent
  const [ackExpectations, setAckExpectations] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const [contactAboutStudy, setContactAboutStudy] = useState(false)
  const [ackHonestFeedback, setAckHonestFeedback] = useState(false)
  const [internalUseConsent, setInternalUseConsent] = useState(false)

  // Group B — optional permissions
  const [quotePermission, setQuotePermission] = useState(false)
  const [quoteEditPermission, setQuoteEditPermission] = useState(false)
  const [firstNamePermission, setFirstNamePermission] = useState(false)
  const [fullNamePermission, setFullNamePermission] = useState(false)
  const [photoPermission, setPhotoPermission] = useState(false)
  const [videoPermission, setVideoPermission] = useState(false)
  const [websitePermission, setWebsitePermission] = useState(false)
  const [emailPermission, setEmailPermission] = useState(false)
  const [organicSocialPermission, setOrganicSocialPermission] = useState(false)
  const [paidMediaPermission, setPaidMediaPermission] = useState(false)
  const [futureContactPermission, setFutureContactPermission] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  useEffect(() => {
    trackNfeEvent({
      name: NFE_EVENT_NAMES.seedAccessViewed,
      area: 'seed_access',
      pagePath: '/study-circle',
      source: 'seed_access',
    })
  }, [])

  useEffect(() => {
    const result = checkMockInvitation(token)
    setInviteState(result)
    trackNfeEvent({
      name:
        result === 'valid'
          ? NFE_EVENT_NAMES.seedAccessInviteValid
          : NFE_EVENT_NAMES.seedAccessInviteInvalid,
      area: 'seed_access',
      pagePath: '/study-circle',
      source: 'seed_access',
    })
  }, [token])

  function markStarted() {
    if (!hasStarted) {
      setHasStarted(true)
      trackNfeEvent({
        name: NFE_EVENT_NAMES.seedAccessIntakeStarted,
        area: 'seed_access',
        pagePath: '/study-circle',
        source: 'seed_access',
      })
    }
  }

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
      internalUseConsent,
    [
      ackExpectations,
      privacyAccepted,
      contactAboutStudy,
      ackHonestFeedback,
      internalUseConsent,
    ]
  )

  useEffect(() => {
    if (requiredConsentComplete) {
      trackNfeEvent({
        name: NFE_EVENT_NAMES.seedAccessConsentCompleted,
        area: 'seed_access',
        pagePath: '/study-circle',
        source: 'seed_access',
      })
    }
  }, [requiredConsentComplete])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('submitting')

    // Phase 1 prototype: no network submission. See
    // docs/seed-access/BACKEND_PROPOSAL.md for the real intake contract
    // this will call once backend work is authorized and its migration
    // applied. Nothing here is sent anywhere or persisted.
    await new Promise((resolve) => setTimeout(resolve, 500))

    setStatus('success')
    trackNfeEvent({
      name: NFE_EVENT_NAMES.seedAccessJoined,
      area: 'seed_access',
      pagePath: '/study-circle',
      source: 'seed_access',
      consentGranted: internalUseConsent,
      metadata: {
        product: product || 'none',
        skinConcernCount: skinConcerns.length,
        quotePermission,
        photoPermission,
      },
    })
    trackNfeEvent({
      name: NFE_EVENT_NAMES.seedAccessConfirmationViewed,
      area: 'seed_access',
      pagePath: '/study-circle',
      source: 'seed_access',
    })
  }

  if (inviteState === 'checking') {
    return null
  }

  if (inviteState === 'invalid') {
    return (
      <div className="bg-nfe-paper text-nfe-ink">
        <section className="bg-[#efe4d5] px-6 py-24 text-center md:py-32">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#7a4f22]">
            A Private NFE Invitation
          </p>
          <h1 className="mx-auto max-w-2xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            This link isn&apos;t active.
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-8 text-nfe-ink/72">
            The NFE Study Circle is by private invitation only. If this
            link isn&apos;t working for you, reach out to Vanessa directly
            and she&apos;ll help.
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
          You&apos;ve been invited to experience NFE thoughtfully, use the
          ritual consistently, and share honest observations over time.
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
            perspective and relevance to who NFE is made for — not selected
            at random and not open for general sign-up.
          </p>
          <p className="leading-8 text-nfe-ink/72">
            The purpose is honest feedback. Positive feedback is not
            required, and your participation does not depend on it. What
            you share helps NFE refine ritual guidance, education, and care
            for the people who come after you.
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
              <li>Using the assigned product as directed, over the study period</li>
              <li>Sharing your initial impressions</li>
              <li>A check-in 7–10 days in</li>
              <li>A check-in 3–4 weeks in</li>
              <li>Honest observations at each step</li>
              <li>An optional conversation about a testimonial, only if you&apos;re open to it</li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-nfe-green-900 md:text-3xl">
              What NFE asks.
            </h2>
            <ul className="mt-6 space-y-3 leading-7 text-nfe-ink/72">
              <li>Consistent use, as directed</li>
              <li>Thoughtful, candid feedback — including what isn&apos;t working</li>
              <li>Completing the check-ins above</li>
              <li>Telling NFE promptly if anything feels uncomfortable or irritating</li>
              <li>No obligation to post publicly, ever</li>
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
            item. Saying no to any or all of it does not affect your place
            in the study.
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

            <div className="mt-10 grid gap-6 md:grid-cols-2">
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
                  onChange={(e) => {
                    markStarted()
                    setPhone(e.target.value)
                  }}
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

            <fieldset className="mt-8">
              <legend className="mb-4 text-sm font-medium text-nfe-ink/80">
                Product Being Used <span className="text-nfe-green-700">*</span>
              </legend>
              <div className="flex flex-wrap gap-4">
                {STUDY_CIRCLE_PRODUCTS.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-nfe-green-900/15 px-4 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="sc-product"
                      required
                      value={option.value}
                      checked={product === option.value}
                      onChange={() => {
                        markStarted()
                        setProduct(option.value)
                      }}
                    />
                    <span>{option.label}</span>
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
                <span>I&apos;m willing to use this as directed for the full study period.</span>
              </label>
              <label className={checkboxRowClass}>
                <input
                  type="checkbox"
                  required
                  checked={willingCheckins}
                  onChange={(e) => setWillingCheckins(e.target.checked)}
                  className="mt-1"
                />
                <span>I&apos;m willing to complete the check-ins above.</span>
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
              <label className="flex items-start gap-3 self-end text-sm leading-6 text-nfe-ink/72">
                <input
                  type="checkbox"
                  checked={fragranceSensitive}
                  onChange={(e) => setFragranceSensitive(e.target.checked)}
                  className="mt-1"
                />
                <span>I have fragrance sensitivity.</span>
              </label>
            </div>

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
                Self-reported, for context only. This is not a medical
                intake and NFE does not review medical history.
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
                All five are required to take part.
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
                    I understand what this study asks of me (product use
                    over the stated period, my honest impressions, and
                    completing the check-ins above).
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
                    I understand honest feedback is what&apos;s being
                    asked for — positive feedback is not required, and my
                    participation does not depend on it.
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
              </div>
            </div>

            <div className="mt-12 rounded-[1.75rem] border border-nfe-green-900/10 bg-[#efe4d5] p-6 md:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-[#7a4f22]">
                Sharing My Story
              </p>
              <p className="mt-3 text-sm leading-6 text-nfe-ink/72">
                Everything below is optional. You can say yes to none of
                these, some of these, or all of these — nothing here is
                required to take part.
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
                      checked={quoteEditPermission}
                      onChange={(e) => setQuoteEditPermission(e.target.checked)}
                      className="mt-1"
                    />
                    <span>NFE may lightly edit quotes for length, without changing their meaning.</span>
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
                    checked={marketingOptIn}
                    onChange={(e) => setMarketingOptIn(e.target.checked)}
                    className="mt-1"
                  />
                  <span>I&apos;d like to receive general NFE marketing emails.</span>
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

            {status === 'error' ? (
              <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Something went wrong. Please try again, or reach out
                directly if it keeps happening.
              </div>
            ) : null}
          </form>
        </div>
      </section>
    </div>
  )
}
