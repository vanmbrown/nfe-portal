import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AtelierLink } from '@/components/atelier/AtelierLink'
import { AtelierMaisonLinks } from '@/components/atelier/AtelierMaisonLinks'
import indexData from '../../../data/products/index.json'

export const metadata: Metadata = {
  title: 'The Atelier | NFE Beauty',
  description:
    'NFE The Atelier is a private editorial product room for Face Elixir and Body Elixir: formulation philosophy, ritual study, and pre-commerce guidance.',
}

const products = indexData.products

export default function AtelierPage() {
  const face = products.find((product) => product.slug === 'face-elixir')
  const body = products.find((product) => product.slug === 'body-elixir')

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="bg-nfe-green-900 px-6 py-24 text-nfe-paper md:py-32">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-nfe-gold">
            The Atelier
          </p>
          <h1 className="max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
            A private product room for two complete elixirs.
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-nfe-paper/85">
            This is not a checkout aisle. The Atelier is where formulation
            philosophy, ritual guidance, and sensory intent live until ordering
            opens.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <AtelierLink href="/founder-access" variant="light">
              Join Founder Access
            </AtelierLink>
            <AtelierLink href="/skin-ritual-quiz" variant="outline">
              Take the Skin Ritual Quiz
            </AtelierLink>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
            Why Only Two Elixirs
          </p>
          <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Fewer products. More complete rituals.
          </h2>
          <p className="mt-6 leading-8 text-nfe-ink/72">
            NFE is intentionally restrained. Face Elixir and Body Elixir are
            designed as complete formulas, not steps in an overcrowded routine.
            The Atelier exists to study them with the same editorial calm as the
            Journal and Science rooms.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
            The Two Elixirs
          </p>
          <h2 className="max-w-3xl font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Face and body, studied side by side.
          </h2>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {[face, body].map((product) =>
              product ? (
                <article
                  key={product.slug}
                  className="overflow-hidden rounded-[1.75rem] border border-nfe-green-900/10 bg-nfe-paper"
                >
                  <div className="relative aspect-[4/3] bg-nfe-green-900/5">
                    <Image
                      src={
                        product.slug === 'body-elixir'
                          ? '/images/products/radiant-body-elixir-white.png'
                          : product.hero_image
                      }
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-8">
                    <p className="text-xs uppercase tracking-[0.24em] text-nfe-green-700">
                      {product.status === 'coming_soon'
                        ? 'Founder Access opens first'
                        : 'In development'}
                    </p>
                    <h3 className="mt-3 font-serif text-3xl text-nfe-green-900">
                      {product.title}
                    </h3>
                    <p className="mt-4 leading-7 text-nfe-ink/72">
                      {product.short_description}
                    </p>
                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-8 inline-flex text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition hover:text-nfe-green-700"
                    >
                      Open the dossier →
                    </Link>
                  </div>
                </article>
              ) : null
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-6xl rounded-[1.75rem] border border-nfe-green-900/10 bg-[#efe4d5] p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.28em] text-[#7a4f22]">
            The Full Ritual
          </p>
          <h2 className="mt-4 max-w-3xl font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Face and body as one editorial house.
          </h2>
          <p className="mt-6 max-w-3xl leading-8 text-nfe-ink/72">
            The Founder's Set is a future ritual pairing, not a live bundle.
            Explore each elixir on its own first, then use the Skin Ritual Quiz
            or Discovery Ritual pathway when you want guidance on where to begin.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <AtelierLink href="/products/face-elixir" variant="outline">
              Explore Face Elixir
            </AtelierLink>
            <AtelierLink href="/products/body-elixir" variant="outline">
              Explore Body Elixir
            </AtelierLink>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              Discovery Ritual
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              The first experience when ordering opens.
            </h2>
            <p className="mt-6 leading-8 text-nfe-ink/72">
              Discovery Ritual is the future first-purchase pathway: a measured
              introduction to NFE before full-size commitment. Commerce is not
              live yet, but the experience is being prepared with care.
            </p>
            <div className="mt-8">
              <AtelierLink href="/discovery">Explore Discovery Ritual</AtelierLink>
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              Vessel Philosophy
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              Refill culture, quietly considered.
            </h2>
            <p className="mt-6 leading-8 text-nfe-ink/72">
              NFE is building toward fewer, better objects and refill-minded
              luxury. The vessel story is editorial for now, not a live refill
              checkout flow.
            </p>
            <Link
              href="/articles/refill-culture-quiet-sustainable-luxury"
              className="mt-8 inline-flex text-sm font-medium uppercase tracking-[0.18em] text-nfe-green-900 transition hover:text-nfe-green-700"
            >
              Read the Journal note →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-nfe-green-900/10 bg-nfe-green-900/[0.03] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
            Pre-Commerce
          </p>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-nfe-ink/72">
            Checkout is inactive. Join Founder Access for launch notes and early
            ritual guidance while The Atelier remains open for study.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <AtelierLink href="/founder-access">Join Founder Access</AtelierLink>
            <AtelierLink href="/concierge" variant="outline">
              Ask Concierge
            </AtelierLink>
          </div>
        </div>
      </section>

      <AtelierMaisonLinks
        eyebrow="Supporting Rooms"
        title="Continue into the maison."
      />
    </div>
  )
}
