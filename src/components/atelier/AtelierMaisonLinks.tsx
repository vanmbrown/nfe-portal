import Link from 'next/link'

const links = [
  {
    href: '/science',
    label: 'Read the Science',
    description: 'Formulation logic, layers, and proof discipline.',
  },
  {
    href: '/skin-ritual-quiz',
    label: 'Take the Skin Ritual Quiz',
    description: 'Educational fit guidance for your current skin signals.',
  },
  {
    href: '/journal',
    label: 'Read the Journal',
    description: 'Editorial well-aging language and ritual intelligence.',
  },
  {
    href: '/concierge',
    label: 'Ask Concierge',
    description: 'Private cosmetic guidance inside the maison.',
  },
  {
    href: '/founder-access',
    label: 'Join Founder Access',
    description: 'Launch access, private notes, and early ritual guidance.',
  },
  {
    href: '/discovery',
    label: 'Explore Discovery Ritual',
    description: 'The considered first experience when ordering opens.',
  },
]

export function AtelierMaisonLinks({
  eyebrow = 'Through the Maison',
  title = 'Continue your path through NFE.',
}: {
  eyebrow?: string
  title?: string
}) {
  return (
    <section className="border-t border-nfe-green-900/10 px-6 py-16 md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
          {eyebrow}
        </p>
        <h2 className="max-w-3xl font-serif text-3xl text-nfe-green-900 md:text-4xl">
          {title}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[1.25rem] border border-nfe-green-900/10 bg-white/70 p-5 transition hover:border-nfe-gold/30 hover:bg-white"
            >
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900">
                {link.label}
              </p>
              <p className="mt-3 text-sm leading-6 text-nfe-ink/68">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
