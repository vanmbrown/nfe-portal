import type { Metadata } from 'next'
import {
  DiscoveryInterestButton,
  DiscoveryPageViewTracker,
  TrackedDiscoveryLink,
} from './DiscoveryRitualTracker'

export const metadata: Metadata = {
  title: 'Discovery Ritual | NFE Beauty',
  description:
    'A considered first experience with NFE Face Elixir and Body Elixir for mature, melanated skin.',
}

const discoveryReasons = [
  {
    title: 'Premium confidence without pressure',
    body: 'Discovery gives you a quieter way to understand texture, scent, finish, and ritual fit before choosing a full-size path.',
  },
  {
    title: 'A private introduction to the elixirs',
    body: 'The experience is designed to introduce Face Elixir, Body Elixir, or the complete ritual without making NFE feel transactional.',
  },
  {
    title: 'Better signals before commerce',
    body: 'Discovery interest helps shape future demand, compatibility guidance, and launch planning without storing personal quiz responses here.',
  },
]

const learnCards = [
  'How the texture feels on your skin and in your daily rhythm.',
  'Whether the aromatic profile and sensory finish feel compatible.',
  'Whether your strongest interest is face, body, or the full ritual.',
  'Whether you want more education before entering The Atelier.',
]

const productCards = [
  {
    title: 'Face Elixir Discovery',
    body: 'For facial skin that feels dry, tight, or under-supported, Face Elixir Discovery is planned as a measured way to experience nourishment, barrier comfort, visible radiance, and the look of more even tone.',
    interest: 'face',
  },
  {
    title: 'Body Elixir Discovery',
    body: 'For body skin that has been treated as an afterthought, Body Elixir Discovery is planned as a considered way to experience comfort, glow, and a more intentional body ritual.',
    interest: 'body',
  },
  {
    title: 'Full Ritual Discovery',
    body: 'For customers drawn to the complete maison ritual, full ritual discovery is planned to help clarify whether both elixirs belong in your first NFE experience.',
    interest: 'full_ritual',
  },
] as const

const forList = [
  'You want a considered entry before choosing full size.',
  'You care about texture, scent, finish, and compatibility.',
  'You are deciding between Face Elixir, Body Elixir, or both.',
  'You prefer education and restraint over aggressive selling.',
]

const notForList = [
  'You are seeking a medical treatment or prescription path.',
  'You require a fragrance-free or essential-oil-free product.',
  'You want an instant transformation or guaranteed cosmetic result.',
  'You are looking for price-led urgency or mass-market promotional offers.',
]

const steps = [
  {
    title: 'Begin with the Skin Ritual Quiz',
    body: 'If you are unsure where to start, the quiz can guide you toward face, body, full ritual, Discovery, Founder Access, or a not-right-fit answer.',
  },
  {
    title: 'Join Founder Access',
    body: 'Founder Access is the supported path for Discovery updates while commerce details remain in planning.',
  },
  {
    title: 'Read the Science',
    body: 'If proof and ingredient context matter first, begin with NFE education before choosing a product path.',
  },
]

const expectations = [
  'Discovery is about texture, compatibility, and ritual fit.',
  'NFE language stays cosmetic: supports barrier comfort, visible radiance, and the appearance of more even-looking tone.',
  'Patch testing is recommended before broader use, especially if your skin is easily reactive.',
  'Full-size credit logic may be planned for a future commerce phase, but it is not active on this page today.',
]

export default function DiscoveryPage() {
  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <DiscoveryPageViewTracker />
      <section className="bg-nfe-green-900 px-6 py-24 text-center text-nfe-paper md:py-32">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
          Discovery Ritual
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
          A considered first experience with NFE.
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85 md:text-xl">
          Discovery Ritual is a private introduction to the elixirs, created to
          reduce premium purchase anxiety while preserving the restraint and
          quiet authority of the maison.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <TrackedDiscoveryLink href="/founder-access" label="Join Founder Access">
            Join Founder Access
          </TrackedDiscoveryLink>
          <TrackedDiscoveryLink
            href="/skin-ritual-quiz"
            label="Take the Skin Ritual Quiz"
            variant="outline"
          >
            Take the Skin Ritual Quiz
          </TrackedDiscoveryLink>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Why Discovery Exists
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              Risk control without diminishing the ritual.
            </h2>
          </div>
          <div className="grid gap-4">
            {discoveryReasons.map((reason) => (
              <article
                key={reason.title}
                className="rounded-2xl border border-nfe-green-100 bg-white p-5 shadow-sm"
              >
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {reason.title}
                </h3>
                <p className="mt-3 leading-7 text-nfe-muted">{reason.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            What You Learn From Discovery
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Texture and compatibility before a full-size decision.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {learnCards.map((card) => (
              <div
                key={card}
                className="rounded-2xl border border-nfe-green-100 bg-nfe-paper p-5 leading-7 text-nfe-muted"
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
            Product Education
          </p>
          <h2 className="max-w-3xl font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Three ways to understand your first experience.
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {productCards.map((card) => (
              <article
                key={card.title}
                className="flex flex-col rounded-3xl border border-nfe-green-100 bg-white p-6 shadow-sm"
              >
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {card.title}
                </h3>
                <p className="mt-4 flex-1 leading-7 text-nfe-muted">
                  {card.body}
                </p>
                <DiscoveryInterestButton
                  interest={card.interest}
                  label={`Note ${card.title}`}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid bg-nfe-green-900 text-nfe-paper md:grid-cols-2">
        <div className="px-6 py-16 md:px-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            Who It Is For
          </p>
          <h2 className="font-serif text-3xl leading-tight text-nfe-gold md:text-4xl">
            A considered entry for people who want to begin with care.
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
            Who It Is Not For
          </p>
          <h2 className="font-serif text-3xl leading-tight text-nfe-gold md:text-4xl">
            A respectful pause can be the right guidance.
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

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              How to Begin
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              Choose the next step that matches your confidence.
            </h2>
          </div>
          <div className="grid gap-4">
            {steps.map((step) => (
              <article
                key={step.title}
                className="rounded-2xl border border-nfe-green-100 bg-white p-5 shadow-sm"
              >
                <h3 className="font-serif text-2xl text-nfe-green-900">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-nfe-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-nfe-green-700">
              Compatibility and Patch Testing
            </p>
            <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
              Let your skin answer slowly.
            </h2>
          </div>
          <div className="grid gap-4">
            {expectations.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-nfe-green-100 bg-nfe-paper p-5 leading-7 text-nfe-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#eadcc9] p-8 text-center md:p-12">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#7a4f22]">
            Founder Access
          </p>
          <h2 className="font-serif text-3xl leading-tight text-nfe-green-900 md:text-5xl">
            Stay close to Discovery without forcing a purchase decision.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-nfe-muted">
            Founder Access is the supported path for updates while Discovery
            commerce architecture, any future full-size credit logic, and
            broader ritual guidance remain in planning.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <TrackedDiscoveryLink href="/founder-access" label="Founder Access">
              Founder Access
            </TrackedDiscoveryLink>
            <TrackedDiscoveryLink
              href="/skin-ritual-quiz"
              label="Skin Ritual Quiz"
              variant="outline"
            >
              Skin Ritual Quiz
            </TrackedDiscoveryLink>
            <TrackedDiscoveryLink
              href="/science"
              label="Science and Proof"
              variant="outline"
            >
              Science / Proof
            </TrackedDiscoveryLink>
            <TrackedDiscoveryLink
              href="/shop"
              label="Enter the Atelier"
              variant="outline"
            >
              Enter the Atelier
            </TrackedDiscoveryLink>
          </div>
        </div>
      </section>
    </div>
  )
}
