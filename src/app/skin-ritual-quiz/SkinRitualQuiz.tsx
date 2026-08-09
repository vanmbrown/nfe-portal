'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { NFE_EVENT_NAMES } from '@/lib/analytics/events'
import { trackNfeEvent } from '@/lib/analytics/track'
import { getCrmTagsForIntent } from '@/lib/customer-intelligence/tags'
import type { SkinRitualQuizInterestPayload } from '@/lib/customer-intelligence/types'

type QuestionId =
  | 'skinNow'
  | 'areaFocus'
  | 'ageRange'
  | 'skinContext'
  | 'middayFeel'
  | 'triedBefore'
  | 'priority'
  | 'pathPreference'
  | 'fragranceSensitivity'
  | 'replenishment'

type RecommendationId =
  | 'face_elixir'
  | 'body_elixir'
  | 'founders_set'
  | 'discovery_ritual'
  | 'founder_access'
  | 'not_right_fit'

interface Option {
  value: string
  label: string
  note?: string
}

interface Question {
  id: QuestionId
  eyebrow?: string
  title: string
  helper: string
  optional?: boolean
  options: Option[]
}

interface Recommendation {
  id: RecommendationId
  eyebrow: string
  title: string
  body: string
  ritualNotes: string[]
  primaryCta: { href: string; label: string }
  secondaryCta: { href: string; label: string }
}

type Answers = Partial<Record<QuestionId, string>>

interface LocalQuizGuidancePayload extends SkinRitualQuizInterestPayload {
  recommendation: RecommendationId
  responseSummary: {
    areaFocus?: string
    pathPreference?: string
    fragranceSensitivity?: string
    replenishmentInterest?: string
  }
}

const QUESTIONS: Question[] = [
  {
    id: 'skinNow',
    eyebrow: 'Ritual Priority',
    title: 'What best describes your skin right now?',
    helper:
      'Choose the answer that feels most true today. This is guidance, not diagnosis.',
    options: [
      {
        value: 'dry_barrier',
        label: 'Dry, tight, or easily uncomfortable',
        note: 'You are looking for barrier comfort and nourishment.',
      },
      {
        value: 'tone_radiance',
        label: 'Uneven-looking tone or low radiance',
        note: 'You want visible radiance and a more cared-for look.',
      },
      {
        value: 'texture',
        label: 'Texture or crepey-looking skin',
        note: 'You want skin to feel smoother and better supported.',
      },
      {
        value: 'body_neglected',
        label: 'My body skin feels under-cared-for',
        note: 'Your ritual may need to extend below the face.',
      },
      {
        value: 'prescription',
        label: 'I am seeking help for a medical skin concern',
        note: 'A clinician or prescription path may be more appropriate.',
      },
    ],
  },
  {
    id: 'areaFocus',
    eyebrow: 'Area of Focus',
    title: 'Which area are you most focused on?',
    helper: 'NFE is intentionally restrained: face, body, or the complete ritual.',
    options: [
      { value: 'face', label: 'Face' },
      { value: 'body', label: 'Body' },
      { value: 'both', label: 'Both face and body' },
      { value: 'unsure', label: 'I am not sure yet' },
    ],
  },
  {
    id: 'ageRange',
    eyebrow: 'Optional Context',
    title: 'Age range, if you wish to share',
    helper:
      'This helps shape language and ritual guidance. You may skip this question.',
    optional: true,
    options: [
      { value: 'under_35', label: 'Under 35' },
      { value: '35_44', label: '35-44' },
      { value: '45_54', label: '45-54' },
      { value: '55_64', label: '55-64' },
      { value: '65_plus', label: '65+' },
      { value: 'prefer_not', label: 'Prefer not to say' },
    ],
  },
  {
    id: 'skinContext',
    eyebrow: 'Optional Context',
    title: 'Which context feels most relevant to your skin?',
    helper:
      'Choose only what feels comfortable. This quiz does not store your responses.',
    optional: true,
    options: [
      {
        value: 'mature_melanated',
        label: 'Mature, melanated skin that needs more specific care',
      },
      {
        value: 'dry_climate',
        label: 'Dry climate, seasonal dryness, or frequent tightness',
      },
      {
        value: 'sensitive_history',
        label: 'A history of easily reactive skin',
      },
      {
        value: 'body_ritual_gap',
        label: 'I have never had a body ritual that felt intentional',
      },
      { value: 'prefer_not', label: 'Prefer not to answer' },
    ],
  },
  {
    id: 'middayFeel',
    eyebrow: 'Skin Feel',
    title: 'How does your skin usually feel by midday?',
    helper: 'Think about comfort, not perfection.',
    options: [
      { value: 'tight', label: 'Tight or thirsty' },
      { value: 'comfortable', label: 'Comfortable, but I want more radiance' },
      { value: 'dull', label: 'Dull or a little flat' },
      { value: 'rough', label: 'Rough, dry, or uneven to the touch' },
      { value: 'varies', label: 'It varies too much to say' },
    ],
  },
  {
    id: 'triedBefore',
    eyebrow: 'Past Rituals',
    title: 'What have you tried before?',
    helper: 'This helps distinguish simplicity from overwhelm.',
    options: [
      { value: 'many_steps', label: 'Many steps, but not enough comfort' },
      { value: 'actives', label: 'Active-heavy routines that felt too much' },
      { value: 'body_lotions', label: 'Body lotions that did not feel elevated' },
      { value: 'minimal', label: 'Very little; I prefer a simple ritual' },
      { value: 'still_learning', label: 'I am still learning what fits' },
    ],
  },
  {
    id: 'priority',
    eyebrow: 'What Matters',
    title: 'What matters most to you?',
    helper: 'NFE favors fewer, better formulations and quiet consistency.',
    options: [
      { value: 'barrier', label: 'Barrier comfort and nourishment' },
      { value: 'radiance', label: 'Visible radiance and tone integrity' },
      { value: 'texture', label: 'Softening the look of texture' },
      { value: 'restraint', label: 'A restrained ritual that does not overwhelm' },
      { value: 'proof', label: 'More education and proof before choosing' },
    ],
  },
  {
    id: 'pathPreference',
    eyebrow: 'Next Step',
    title: 'What would you prefer as your next step?',
    helper: 'There is no pressure to move faster than your confidence.',
    options: [
      { value: 'full_size', label: 'Full size, if the fit is clear' },
      { value: 'discovery', label: 'Discovery Ritual first' },
      { value: 'founders_set', label: 'Founder’s Set if both products fit' },
      { value: 'proof_first', label: 'More proof and education first' },
      { value: 'learn_more', label: 'Founder Access or learn more' },
    ],
  },
  {
    id: 'fragranceSensitivity',
    eyebrow: 'Comfort Check',
    title: 'Do you have known fragrance or essential oil sensitivity?',
    helper:
      'If you know aromatic ingredients are not a fit, NFE may not be your best first step.',
    options: [
      { value: 'yes', label: 'Yes, I avoid fragrance or essential oils' },
      { value: 'unsure', label: 'I am unsure and would prefer to learn more' },
      { value: 'no', label: 'No known sensitivity' },
    ],
  },
  {
    id: 'replenishment',
    eyebrow: 'Later, Not Now',
    title: 'Would you like replenishment reminders later?',
    helper:
      'This does not turn on reminders today. It only helps shape future product planning.',
    optional: true,
    options: [
      { value: 'yes', label: 'Yes, that could be useful later' },
      { value: 'no', label: 'No, I prefer to manage timing myself' },
      { value: 'not_sure', label: 'Not sure yet' },
    ],
  },
]

const RECOMMENDATIONS: Record<RecommendationId, Recommendation> = {
  face_elixir: {
    id: 'face_elixir',
    eyebrow: 'Your strongest match',
    title: 'Your skin may benefit from the Face Elixir ritual.',
    body:
      'Your answers point toward facial dryness, comfort, visible radiance, or tone integrity as the highest priority. Face Elixir is the focused NFE starting point for cosmetic well-aging care above the neck.',
    ritualNotes: [
      'Designed to help skin feel nourished without adding a crowded routine.',
      'Best when your main concern is facial comfort, radiance, or the look of texture.',
      'A measured fit if you prefer fewer, better formulations.',
    ],
    primaryCta: { href: '/shop', label: 'Enter the Atelier' },
    secondaryCta: { href: '/science', label: 'Read the Science' },
  },
  body_elixir: {
    id: 'body_elixir',
    eyebrow: 'Your strongest match',
    title: 'Your strongest match is the Body Elixir.',
    body:
      'Your answers suggest that body skin needs the most attention right now. Body Elixir is designed for skin below the neck that can feel dry, underbuilt, or overlooked in mature routines.',
    ritualNotes: [
      'A fit when body skin needs a more intentional ritual.',
      'Supports the feel of nourishment and barrier comfort.',
      'Keeps body care inside the same restrained maison language as face care.',
    ],
    primaryCta: { href: '/shop', label: 'Enter the Atelier' },
    secondaryCta: { href: '/ritual', label: 'Read the Ritual' },
  },
  founders_set: {
    id: 'founders_set',
    eyebrow: 'Complete ritual fit',
    title: 'You may be a Founder’s Set customer.',
    body:
      'Your answers point to both face and body needs, with a preference for a complete but restrained ritual. The Founder’s Set is the most aligned direction when the full NFE philosophy feels right.',
    ritualNotes: [
      'Best when face and body both need comfort, radiance, and consistency.',
      'Keeps the routine edited: two complete elixirs, not a crowded shelf.',
      'A good fit for customers who value restraint and long-term ritual design.',
    ],
    primaryCta: { href: '/shop', label: 'View the Atelier' },
    secondaryCta: { href: '/founder-access', label: 'Founder Access' },
  },
  discovery_ritual: {
    id: 'discovery_ritual',
    eyebrow: 'Start with confidence',
    title: 'Begin with the Discovery Ritual.',
    body:
      'Your answers suggest curiosity, caution, or a desire to experience fit before choosing full size. Discovery Ritual is the restrained next step when sensory feel and confidence matter first.',
    ritualNotes: [
      'Useful if you are still learning how NFE fits your skin and preferences.',
      'A considered way to evaluate texture, comfort, scent, and ritual feel.',
      'No pressure to move into full size before the experience feels right.',
    ],
    primaryCta: { href: '/discovery', label: 'Explore Discovery' },
    secondaryCta: { href: '/founder-access', label: 'Founder Access' },
  },
  founder_access: {
    id: 'founder_access',
    eyebrow: 'Learn before choosing',
    title: 'Founder Access is the right next step.',
    body:
      'Your answers suggest that education, proof, or founder context should come before product selection. Founder Access keeps you close to the maison while you learn more.',
    ritualNotes: [
      'Best if you want more proof or context before choosing a product.',
      'A quiet path for updates without forcing a purchase decision.',
      'Aligned with NFE’s education-before-pressure approach.',
    ],
    primaryCta: { href: '/founder-access', label: 'Founder Access' },
    secondaryCta: { href: '/science', label: 'Read the Science' },
  },
  not_right_fit: {
    id: 'not_right_fit',
    eyebrow: 'A careful note',
    title: 'NFE may not be the right fit for what you need today.',
    body:
      'If you are seeking prescription care, medical guidance, or a product without aromatic ingredients, NFE may not be the best first step. The more respectful choice may be to pause and gather the right guidance.',
    ritualNotes: [
      'NFE is cosmetic well-aging care, not a prescription or clinical treatment path.',
      'Known fragrance or essential oil sensitivity deserves caution.',
      'You are welcome to keep learning before choosing anything.',
    ],
    primaryCta: { href: '/science', label: 'Read the Science' },
    secondaryCta: { href: '/founder-access', label: 'Founder Access' },
  },
}

function scoreRecommendation(answers: Answers): RecommendationId {
  if (
    answers.skinNow === 'prescription' ||
    answers.fragranceSensitivity === 'yes'
  ) {
    return 'not_right_fit'
  }

  if (
    answers.pathPreference === 'proof_first' ||
    answers.pathPreference === 'learn_more' ||
    answers.priority === 'proof'
  ) {
    return 'founder_access'
  }

  if (
    answers.pathPreference === 'discovery' ||
    answers.areaFocus === 'unsure' ||
    answers.fragranceSensitivity === 'unsure' ||
    answers.triedBefore === 'still_learning'
  ) {
    return 'discovery_ritual'
  }

  if (
    answers.pathPreference === 'founders_set' ||
    answers.areaFocus === 'both'
  ) {
    return 'founders_set'
  }

  if (
    answers.areaFocus === 'body' ||
    answers.skinNow === 'body_neglected' ||
    answers.triedBefore === 'body_lotions' ||
    answers.skinContext === 'body_ritual_gap'
  ) {
    return 'body_elixir'
  }

  return 'face_elixir'
}

function buildQuizPayload(
  answers: Answers,
  recommendation: RecommendationId
): LocalQuizGuidancePayload {
  return {
    intent: 'skin_ritual_quiz',
    quizStatus: 'completed',
    consent: {
      marketingOptIn: false,
      privacyPolicyAccepted: false,
      consentSource: 'skin_ritual_quiz',
      consentText:
        'Quiz responses were used locally for on-page guidance and were not submitted or stored.',
    },
    context: {
      source: 'skin_ritual_quiz',
      pagePath: '/skin-ritual-quiz',
      intent: 'skin_ritual_quiz',
      ctaLabel: 'View recommendation',
    },
    tags: getCrmTagsForIntent('skin_ritual_quiz'),
    recommendation,
    responseSummary: {
      areaFocus: answers.areaFocus,
      pathPreference: answers.pathPreference,
      fragranceSensitivity: answers.fragranceSensitivity,
      replenishmentInterest: answers.replenishment,
    },
  }
}

function MaisonLink({
  href,
  children,
  variant = 'dark',
  onClick,
}: {
  href: string
  children: ReactNode
  variant?: 'dark' | 'outline'
  onClick?: () => void
}) {
  const classes =
    variant === 'dark'
      ? 'bg-nfe-green-900 text-nfe-paper hover:bg-nfe-green-700 focus:bg-nfe-green-700'
      : 'border border-nfe-green-900 text-nfe-green-900 hover:bg-nfe-green-900 hover:text-nfe-paper focus:bg-nfe-green-900 focus:text-nfe-paper'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${classes} inline-flex min-h-[44px] items-center justify-center rounded-full px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] transition-colors`}
    >
      {children}
    </Link>
  )
}

export default function SkinRitualQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [hasStarted, setHasStarted] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const resultRef = useRef<HTMLDivElement>(null)
  const questionHeadingRef = useRef<HTMLHeadingElement>(null)
  const wasShowingResult = useRef(false)
  const returnToFirstQuestion = useRef(false)

  const currentQuestion = QUESTIONS[step]
  const selectedAnswer = answers[currentQuestion.id]
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100)
  const recommendationId = useMemo(() => scoreRecommendation(answers), [answers])
  const recommendation = RECOMMENDATIONS[recommendationId]

  useEffect(() => {
    trackNfeEvent({
      name: NFE_EVENT_NAMES.quizViewed,
      area: 'skin_ritual_quiz',
      pagePath: '/skin-ritual-quiz',
      metadata: {
        tags: getCrmTagsForIntent('skin_ritual_quiz').join(','),
        storage: 'none',
      },
    })
  }, [])

  function selectAnswer(questionId: QuestionId, value: string) {
    if (!hasStarted) {
      setHasStarted(true)
      trackNfeEvent({
        name: NFE_EVENT_NAMES.quizInterestCaptured,
        area: 'skin_ritual_quiz',
        pagePath: '/skin-ritual-quiz',
        metadata: {
          quizStatus: 'started',
          tags: getCrmTagsForIntent('skin_ritual_quiz').join(','),
          storage: 'none',
        },
      })
    }

    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  function moveNext() {
    if (step < QUESTIONS.length - 1) {
      setStep((current) => current + 1)
      return
    }

    const payload = buildQuizPayload(answers, recommendationId)
    trackNfeEvent({
      name: NFE_EVENT_NAMES.quizInterestCaptured,
      area: 'skin_ritual_quiz',
      pagePath: '/skin-ritual-quiz',
      metadata: {
        quizStatus: payload.quizStatus,
        recommendation: payload.recommendation,
        tags: payload.tags.join(','),
        storage: 'none',
        replenishmentInterest:
          payload.responseSummary.replenishmentInterest ?? 'not_answered',
      },
    })
    setShowResult(true)
  }

  function moveBack() {
    setStep((current) => Math.max(0, current - 1))
  }

  function resetQuiz() {
    returnToFirstQuestion.current = true
    setAnswers({})
    setStep(0)
    setHasStarted(false)
    setShowResult(false)
  }

  // Move focus deliberately when the panel swaps, in an effect so it runs after
  // the new markup exists. Into the recommendation when it appears; back to the
  // first question when the visitor retakes.
  useEffect(() => {
    if (showResult && !wasShowingResult.current) {
      resultRef.current?.focus()
    } else if (!showResult && wasShowingResult.current && returnToFirstQuestion.current) {
      questionHeadingRef.current?.focus()
      returnToFirstQuestion.current = false
    }
    wasShowingResult.current = showResult
  }, [showResult])

  function trackCta(label: string, destination: string) {
    trackNfeEvent({
      name: NFE_EVENT_NAMES.ctaClicked,
      area: 'skin_ritual_quiz',
      pagePath: '/skin-ritual-quiz',
      ctaLabel: label,
      destination,
      metadata: {
        recommendation: recommendation.id,
        storage: 'none',
      },
    })
  }

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          Skin Ritual Quiz
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          Private guidance for choosing with more confidence.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          A restrained quiz for mature, melanated skin, designed to guide your
          next NFE step without pressure, exaggerated claims, or a crowded
          routine.
        </p>
      </section>

      <section className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Fit before purchase
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-4xl">
              A quiet ritual recommendation, not a diagnosis.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-nfe-muted">
              <p>
                Your answers stay in this browser session. NFE does not submit
                or store quiz responses here, and no pixel or Beehiiv automation
                is activated by this quiz.
              </p>
              <p>
                The result is cosmetic guidance only. If you need medical skin
                guidance, a clinician is the right path.
              </p>
            </div>
            <div className="mt-8 rounded-2xl border border-nfe-green-900/10 bg-nfe-paper p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-nfe-green-700">
                Progress
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-nfe-green-900 transition-all"
                  style={{ width: showResult ? '100%' : `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-nfe-muted">
                {showResult
                  ? 'Recommendation ready'
                  : `Question ${step + 1} of ${QUESTIONS.length}`}
              </p>
            </div>
          </aside>

          <div className="rounded-3xl border border-nfe-green-900/10 bg-white p-6 shadow-sm md:p-8">
            {showResult ? (
              // Focus lands here when the question interface is replaced, so
              // the change of state is understood rather than inferred. Focus
              // management alone, deliberately: adding a live region as well
              // would announce the recommendation twice.
              <div ref={resultRef} tabIndex={-1} className="focus:outline-none">
                <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
                  {recommendation.eyebrow}
                </p>
                <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
                  {recommendation.title}
                </h2>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-nfe-muted">
                  {recommendation.body}
                </p>
                <ul className="mt-8 grid gap-4">
                  {recommendation.ritualNotes.map((note) => (
                    <li
                      key={note}
                      className="rounded-2xl border border-nfe-green-900/10 bg-nfe-paper p-4 leading-7 text-nfe-muted"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-4">
                  <MaisonLink
                    href={recommendation.primaryCta.href}
                    onClick={() =>
                      trackCta(
                        recommendation.primaryCta.label,
                        recommendation.primaryCta.href
                      )
                    }
                  >
                    {recommendation.primaryCta.label}
                  </MaisonLink>
                  <MaisonLink
                    href={recommendation.secondaryCta.href}
                    variant="outline"
                    onClick={() =>
                      trackCta(
                        recommendation.secondaryCta.label,
                        recommendation.secondaryCta.href
                      )
                    }
                  >
                    {recommendation.secondaryCta.label}
                  </MaisonLink>
                </div>
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="mt-6 text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-700 underline-offset-4 hover:underline"
                >
                  Retake the quiz
                </button>
              </div>
            ) : (
              <div>
                {/* A real fieldset with a real legend, and real radios beneath
                    it. This was a div with role="radiogroup" holding buttons
                    with role="radio" and aria-checked, which announces a radio
                    group and then supplies none of the keyboard behaviour one
                    provides: arrow keys did nothing. Native inputs are visually
                    hidden and the labels carry the existing card treatment, so
                    the appearance is unchanged and the mechanics come from the
                    browser. */}
                <fieldset className="border-0 p-0">
                  <legend className="w-full p-0">
                    <span className="mb-4 block text-xs uppercase tracking-[0.3em] text-nfe-green-700">
                      {currentQuestion.eyebrow}
                    </span>
                    <h2
                      ref={questionHeadingRef}
                      tabIndex={-1}
                      className="font-serif text-3xl leading-tight text-nfe-green-900 focus:outline-none md:text-5xl"
                    >
                      {currentQuestion.title}
                    </h2>
                  </legend>
                  <p className="mt-4 max-w-3xl leading-7 text-nfe-muted">
                    {currentQuestion.helper}
                  </p>
                  <div className="mt-8 grid gap-3">
                    {currentQuestion.options.map((option) => {
                      const isSelected = selectedAnswer === option.value
                      const inputId = `${currentQuestion.id}-${option.value}`

                      return (
                        <div key={option.value} className="contents">
                          <input
                            type="radio"
                            id={inputId}
                            name={currentQuestion.id}
                            value={option.value}
                            checked={isSelected}
                            onChange={() =>
                              selectAnswer(currentQuestion.id, option.value)
                            }
                            className="peer sr-only"
                          />
                          <label
                            htmlFor={inputId}
                            className={`cursor-pointer rounded-2xl border p-4 text-left transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[color:var(--focus-ring-on-light)] ${
                              isSelected
                                ? 'border-nfe-green-900 bg-nfe-green-900 text-nfe-paper'
                                : 'border-nfe-green-900/50 bg-nfe-paper text-nfe-ink hover:border-nfe-green-700'
                            }`}
                          >
                            <span className="block font-medium">{option.label}</span>
                            {option.note ? (
                              <span
                                className={`mt-2 block text-sm leading-6 ${
                                  isSelected
                                    ? 'text-nfe-paper/80'
                                    : 'text-nfe-muted'
                                }`}
                              >
                                {option.note}
                              </span>
                            ) : null}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </fieldset>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={moveNext}
                    disabled={!selectedAnswer}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-nfe-green-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.18em] text-nfe-paper transition-colors hover:bg-nfe-green-700 disabled:cursor-not-allowed disabled:bg-nfe-muted/30 disabled:text-nfe-muted"
                  >
                    {step === QUESTIONS.length - 1
                      ? 'View Recommendation'
                      : 'Continue'}
                  </button>
                  {currentQuestion.optional && !selectedAnswer ? (
                    <button
                      type="button"
                      onClick={moveNext}
                      className="text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-700 underline-offset-4 hover:underline"
                    >
                      Skip
                    </button>
                  ) : null}
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={moveBack}
                      className="text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-700 underline-offset-4 hover:underline"
                    >
                      Back
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
