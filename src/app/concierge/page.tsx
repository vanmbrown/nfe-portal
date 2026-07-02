import type { Metadata } from 'next'
import ConciergeIntake from './ConciergeIntake'
import { ConciergePageViewTracker, TrackedConciergeLink } from './ConciergeTracker'

export const metadata: Metadata = {
  title: 'Concierge | NFE Beauty',
  description:
    'Private cosmetic skincare guidance for mature, melanated skin, rooted in restraint, ritual support, and product fit.',
}

const conciergeHelps = [
  'Understanding whether Face Elixir, Body Elixir, or both feel like the right first step.',
  'Thinking through dryness, depleted-feeling skin, radiance, texture, and barrier comfort in cosmetic language.',
  'Choosing between Discovery Ritual, Skin Ritual Quiz guidance, Founder Access, or The Atelier.',
  'Considering fragrance, texture, pace, and compatibility before entering a full ritual.',
  'Simplifying a routine that has become crowded, reactive, or difficult to sustain.',
  'Finding language for what your skin is asking for without turning it into a medical intake.',
]

const forList = [
  'You want private guidance before choosing a product path.',
  'You are deciding between Face, Body, both, or Discovery Ritual.',
  'You want cosmetic well-aging care that feels measured and personal.',
  'You prefer a thoughtful human response over instant automated advice.',
]

const notForList = [
  'You need urgent help or medical care.',
  'You are seeking clinical guidance, medication advice, or disease care.',
  'You want to submit photos or private clinical information.',
  'You need outcome certainty or an instant answer.',
]

const processSteps = [
  {
    title: 'Share only what belongs here.',
    body: 'The intake asks for light cosmetic context: product interest, routine frustration, Discovery interest, and what kind of guidance would feel useful.',
  },
  {
    title: 'Your note is reviewed with care.',
    body: 'Concierge is designed for thoughtful response expectations, not instant replies, scripts, or pressure to purchase.',
  },
  {
    title: 'Begin only when the ritual feels right.',
    body: 'Guidance may point you toward Founder Access, the Skin Ritual Quiz, Discovery Ritual, Science education, or The Atelier.',
  },
]

const shareList = [
  'Your primary area of interest: Face, Body, Both, or Unsure.',
  'What feels frustrating in your current routine.',
  'Which NFE path you are considering.',
  'Any quiz result you want to reference.',
  'Your question in your own words, without medical or highly sensitive details.',
]

const responseExpectations = [
  'A thoughtful response will follow; Concierge does not imply instant support.',
  'Guidance remains cosmetic and focused on ritual support, product fit, compatibility, and skin comfort.',
  'If a concern sounds persistent or complex, the appropriate guidance may be to consult a licensed professional.',
]

export default function ConciergePage() {
  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <ConciergePageViewTracker />
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          NFE Concierge
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          Private guidance for skin that deserves to be heard.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          Concierge is a calm, private way to ask for cosmetic skincare guidance
          before choosing your NFE path. It is not customer support, a chatbot,
          or a medical consult. It is ritual support inside the maison.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <TrackedConciergeLink href="#concierge-intake" label="Begin Concierge Intake">
            Begin Concierge Intake
          </TrackedConciergeLink>
          <TrackedConciergeLink
            href="/skin-ritual-quiz"
            label="Take the Skin Ritual Quiz"
            variant="outline"
          >
            Take the Skin Ritual Quiz
          </TrackedConciergeLink>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              What Concierge Helps With
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              Guidance for questions that deserve more than a product grid.
            </h2>
          </div>
          <ul className="grid gap-4 text-base leading-7 text-nfe-muted md:grid-cols-2">
            {conciergeHelps.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-nfe-green-100 bg-white p-5"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid bg-nfe-green-900 text-nfe-paper md:grid-cols-2">
        <div className="px-6 py-16 md:px-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            Who Concierge Is For
          </p>
          <h2 className="font-serif text-3xl leading-tight text-nfe-gold md:text-4xl">
            For people who want to begin with care.
          </h2>
          <ul className="mt-8 grid gap-4">
            {forList.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-nfe-paper/15 bg-white/5 p-4 leading-7 text-nfe-paper/85"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-nfe-green-800 px-6 py-16 md:px-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            Who Concierge Is Not For
          </p>
          <h2 className="font-serif text-3xl leading-tight text-nfe-gold md:text-4xl">
            Some questions belong outside the maison.
          </h2>
          <ul className="mt-8 grid gap-4">
            {notForList.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-nfe-paper/15 bg-white/5 p-4 leading-7 text-nfe-paper/85"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            How It Works
          </p>
          <h2 className="mx-auto max-w-3xl text-center font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            A slower, more considered path to choosing your ritual.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-3xl bg-nfe-paper p-8 shadow-sm"
              >
                <p className="mb-4 text-xs uppercase tracking-[0.25em] text-nfe-gold">
                  Step {index + 1}
                </p>
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-nfe-muted">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              What to Share
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              Enough context to guide, never more than belongs here.
            </h2>
          </div>
          <div className="grid gap-4">
            {shareList.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-nfe-green-100 bg-white p-5 leading-7 text-nfe-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="concierge-intake" className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Private Intake
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              Send a quiet note to Concierge.
            </h2>
            <p className="mt-6 leading-7 text-nfe-muted">
              This form sends a private admin notification only. It does not
              create a Beehiiv automation, request photos, or ask for sensitive
              medical information.
            </p>
          </div>
          <ConciergeIntake />
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Response Expectations
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              Thoughtful guidance, not instant support.
            </h2>
          </div>
          <div className="grid gap-4">
            {responseExpectations.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-nfe-green-100 bg-white p-5 leading-7 text-nfe-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eadcc9] px-6 py-20 md:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#7a4f22]">
            Continue the Maison Path
          </p>
          <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Choose the next door that feels right.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <TrackedConciergeLink href="/founder-access" label="Founder Access">
              Founder Access
            </TrackedConciergeLink>
            <TrackedConciergeLink
              href="/skin-ritual-quiz"
              label="Skin Ritual Quiz"
              variant="outline"
            >
              Skin Ritual Quiz
            </TrackedConciergeLink>
            <TrackedConciergeLink
              href="/discovery"
              label="Discovery Ritual"
              variant="outline"
            >
              Discovery Ritual
            </TrackedConciergeLink>
          </div>
        </div>
      </section>

      <section className="border-t border-nfe-green-100 px-6 py-10 md:px-12">
        <p className="mx-auto max-w-4xl text-center text-sm leading-6 text-nfe-muted">
          NFE Concierge offers cosmetic skincare guidance only. It is not
          medical advice and is not intended to diagnose, treat, cure, or prevent
          disease. For persistent or complex skin concerns, consult a licensed
          professional.
        </p>
      </section>
    </div>
  )
}
