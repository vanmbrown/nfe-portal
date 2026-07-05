import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/types/products'
import type { ElixirEditorialProfile } from '@/content/atelier/elixir-editorial'
import { AtelierLink } from '@/components/atelier/AtelierLink'
import { AtelierMaisonLinks } from '@/components/atelier/AtelierMaisonLinks'
import { ProductAccordion } from '@/components/products/ProductAccordion'
import { ElixirFAQ, bodyElixirFaqItems } from '@/components/atelier/ElixirFAQ'
import { faceElixirFaqItems } from '@/components/products/face-elixir/FaceElixirFAQ'

function sanitizeDetails(html: string) {
  return html
    .replace(/firms, and softens/gi, 'supports visible radiance and helps improve the appearance of uneven tone')
    .replace(/\bfirms\b/gi, 'supports visible radiance')
    .replace(/\brestorative\b/gi, 'supportive')
    .replace(/\bfirmness\b/gi, 'a supple feel')
    .replace(/\belasticity\b/gi, 'resilience')
    .replace(/fine lines/gi, 'texture')
}

export function ElixirEditorialPage({
  product,
  editorial,
}: {
  product: Product
  editorial: ElixirEditorialProfile
}) {
  const faqItems =
    editorial.slug === 'face-elixir' ? faceElixirFaqItems : bodyElixirFaqItems

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <section className="border-b border-nfe-green-900/10 bg-nfe-green-900 text-nfe-paper">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-12">
          <Link
            href="/shop"
            className="text-sm uppercase tracking-[0.22em] text-nfe-paper/70 transition hover:text-nfe-gold"
          >
            ← Back to The Atelier
          </Link>
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 md:grid-cols-[0.95fr_1.05fr] md:items-center md:px-12 md:pb-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-nfe-paper/10 bg-nfe-green-900/40">
            <Image
              src={product.hero_image}
              alt={`${product.title} bottle`}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 560px"
            />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-nfe-gold">
              The Atelier
            </p>
            <h1 className="mt-4 font-serif text-4xl text-nfe-gold md:text-6xl">
              {product.title}
            </h1>
            <p className="mt-3 text-sm uppercase tracking-[0.22em] text-nfe-paper/70">
              {editorial.statusLabel}
            </p>
            <p className="mt-8 max-w-xl text-lg leading-8 text-nfe-paper/85">
              {editorial.emotionalPromise}
            </p>
            <p className="mt-4 max-w-xl text-base leading-7 text-nfe-paper/70">
              {product.short_description}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <AtelierLink href="/founder-access" variant="light">
                Join Founder Access
              </AtelierLink>
              <AtelierLink href="/skin-ritual-quiz" variant="outline">
                Take the Skin Ritual Quiz
              </AtelierLink>
            </div>
            <div className="mt-4 flex flex-wrap gap-4">
              <AtelierLink href="/discovery" variant="outline">
                Explore Discovery Ritual
              </AtelierLink>
              <AtelierLink href="/concierge" variant="outline">
                Ask Concierge
              </AtelierLink>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              Formulation Thesis
            </p>
            <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
              A dossier, not a discount shelf.
            </h2>
            <p className="mt-6 leading-8 text-nfe-ink/72">
              {editorial.formulationThesis}
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              Who It Is For
            </p>
            <ul className="space-y-4">
              {editorial.whoItIsFor.map((item) => (
                <li
                  key={item}
                  className="rounded-[1.25rem] border border-nfe-green-900/10 bg-white/70 p-5 leading-7 text-nfe-ink/72"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              Texture and Finish
            </p>
            <p className="leading-8 text-nfe-ink/72">{editorial.textureFinish}</p>
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              Ritual Guidance
            </p>
            <p className="leading-8 text-nfe-ink/72">{editorial.ritualGuidance}</p>
          </div>
        </div>
      </section>

      {editorial.bodyEditorialHref ? (
        <section className="px-6 py-16 md:px-12">
          <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-nfe-green-900/10 bg-nfe-green-900/[0.03] p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
              Body-Care Editorial
            </p>
            <Link
              href={editorial.bodyEditorialHref}
              className="mt-4 inline-block font-serif text-2xl text-nfe-green-900 transition hover:text-nfe-green-700 md:text-3xl"
            >
              {editorial.bodyEditorialLabel} →
            </Link>
          </div>
        </section>
      ) : null}

      <section className="bg-white px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
            Cosmetic-Safe Active Story
          </p>
          <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
            What the formula is designed to support.
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {product.benefits.map((benefit) => (
              <li
                key={benefit}
                className="rounded-[1.25rem] border border-nfe-green-900/10 bg-nfe-paper p-5 leading-7 text-nfe-ink/72"
              >
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-nfe-green-900/10 bg-[#efe4d5] p-8 md:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-[#7a4f22]">
            A Note from Vanessa
          </p>
          <p className="mt-4 font-serif text-2xl leading-snug text-nfe-green-900 md:text-3xl">
            {editorial.founderNote}
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-16 md:px-12">
        <div className="mx-auto max-w-4xl">
          <ProductAccordion
            details={sanitizeDetails(product.details)}
            benefits={product.benefits}
            usage={product.usage}
            ingredients={product.ingredients_inci}
            textureScentExperience={product.texture_scent_experience}
          />
        </div>
      </section>

      <ElixirFAQ title={`Questions about ${product.title}`} items={faqItems} />

      <section className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-nfe-green-700">
            Related Reading
          </p>
          <h2 className="font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Journal and Science context.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              href={editorial.scienceHref}
              className="rounded-[1.25rem] border border-nfe-green-900/10 bg-white/70 p-5 transition hover:border-nfe-gold/30"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-nfe-green-700">
                Science
              </p>
              <h3 className="mt-2 font-serif text-2xl text-nfe-green-900">
                {editorial.scienceLabel}
              </h3>
            </Link>
            {editorial.relatedJournal.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="rounded-[1.25rem] border border-nfe-green-900/10 bg-white/70 p-5 transition hover:border-nfe-gold/30"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-nfe-green-700">
                  Journal
                </p>
                <h3 className="mt-2 font-serif text-2xl text-nfe-green-900">
                  {article.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-nfe-ink/68">
                  {article.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-nfe-green-900/10 bg-nfe-green-900/[0.03] px-6 py-16 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
            Pre-Commerce
          </p>
          <h2 className="mt-4 font-serif text-3xl text-nfe-green-900 md:text-4xl">
            Ordering is not live yet.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl leading-7 text-nfe-ink/72">
            Checkout remains inactive. Founder Access is the primary conversion
            path while The Atelier stays open as an editorial product room.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <AtelierLink href="/founder-access">Join Founder Access</AtelierLink>
            <AtelierLink href="/shop" variant="outline">
              Return to The Atelier
            </AtelierLink>
          </div>
        </div>
      </section>

      <AtelierMaisonLinks />
    </div>
  )
}
