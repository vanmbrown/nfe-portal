import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { articleMDX, allArticleSlugs, type ArticleSlug } from '@/content/articles/registry'
import {
  getAllArticles,
  getArticleBySlug,
  getArticleHeroImage,
  getPillarLabel,
  isPrimaryArticle,
  type ArticleMeta,
} from '@/lib/articles'
import { WELL_AGING_SERIES_SLUG } from '@/content/articles/well-aging-series'
import { ArticleJsonLd } from '@/components/articles/ArticleJsonLd'
import {
  ArticleMaisonLinks,
  ArticleRelatedLinks,
} from '@/components/articles/ArticleRelatedLinks'

type Props = {
  params: Promise<{ slug: string }>
}

/** Hero ratios below the md breakpoint, spelled out so Tailwind can see every
 *  class it must generate. An article opting in here is served whole on a
 *  phone: the container takes the asset's own ratio and the image is contained
 *  rather than covered, so no edge of the composition is ever cut away. */
const MOBILE_HERO_ASPECT: Record<NonNullable<ArticleMeta['heroAspect']>, string> = {
  '4/3': 'aspect-[4/3]',
  '3/2': 'aspect-[3/2]',
  '1/1': 'aspect-square',
  '4/5': 'aspect-[4/5]',
}

export function generateStaticParams() {
  // Only published articles get a generated route, so an article withheld from
  // the index and the sitemap is not quietly reachable by direct URL either.
  const publishedSlugs = new Set(getAllArticles().map((article) => article.slug))
  return allArticleSlugs
    .filter((slug) => publishedSlugs.has(slug))
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const meta = getArticleBySlug(slug)

  if (!meta) {
    return {
      title: 'Article Not Found',
    }
  }

  const title = `${meta.title} | NFE Journal`
  const heroImage = getArticleHeroImage(meta)

  return {
    title,
    description: meta.excerpt,
    openGraph: {
      title,
      description: meta.excerpt,
      type: 'article',
      ...(meta.date ? { publishedTime: meta.date } : {}),
      authors: [meta.author],
      images: heroImage ? [{ url: heroImage, alt: meta.imageAlt ?? meta.title }] : [],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const typedSlug = slug as ArticleSlug
  const loader = articleMDX[typedSlug]
  if (!loader) {
    notFound()
  }

  const meta = getArticleBySlug(typedSlug)
  if (!meta) {
    notFound()
  }

  const mod = await loader()
  const MDXContent = mod.default
  const heroImage = getArticleHeroImage(meta)
  const primary = isPrimaryArticle(meta)
  const mobileHeroAspect = meta.heroAspect ? MOBILE_HERO_ASPECT[meta.heroAspect] : undefined
  const backHref = primary ? '/journal' : '/journal'
  const seriesHref =
    meta.seriesSlug === WELL_AGING_SERIES_SLUG
      ? `/articles/${WELL_AGING_SERIES_SLUG}`
      : undefined

  // `date` is null until a publication date is supplied; such an article is
  // unpublished and only reachable in a local preview build.
  const formattedDate = meta.date
    ? new Date(`${meta.date}T12:00:00Z`).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : null

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      {/* Structured data is emitted only once a publication date exists, so an
          unpublished article never advertises a date it does not have. */}
      {meta.date ? (
        <ArticleJsonLd
          slug={meta.slug}
          title={meta.title}
          description={meta.excerpt}
          image={
            heroImage ?? '/images/homepage/nfe-home-hero-product-vessel-desktop.webp'
          }
          publishedAt={meta.date}
          author={meta.author}
        />
      ) : null}

      <section className="border-b border-nfe-green-900/10 bg-nfe-green-900 text-nfe-paper">
        <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
          <Link
            href={backHref}
            className="text-sm uppercase tracking-[0.22em] text-nfe-paper/70 transition hover:text-nfe-gold"
          >
            ← Back to the Journal
          </Link>

          {!primary ? (
            <div className="mt-6 rounded-[1.25rem] border border-nfe-paper/15 bg-nfe-paper/5 px-5 py-4 text-sm leading-6 text-nfe-paper/78">
              This supporting editorial note remains part of the NFE Journal.
              For the primary series, begin with{' '}
              <Link
                href={`/articles/${WELL_AGING_SERIES_SLUG}`}
                className="text-nfe-gold underline underline-offset-4 hover:text-nfe-paper"
              >
                The New Language of Well-Aging
              </Link>
              .
            </div>
          ) : null}

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            {meta.series ?? getPillarLabel(meta.pillar)}
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
            {meta.title}
          </h1>

          {meta.excerpt ? (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-nfe-paper/82 md:text-xl">
              {meta.excerpt}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-nfe-paper/70">
            <span>{meta.author}</span>
            {formattedDate ? (
              <>
                <span>•</span>
                <span>{formattedDate}</span>
              </>
            ) : null}
            {meta.readingMinutes ? (
              <>
                <span>•</span>
                <span>{meta.readingMinutes} min read</span>
              </>
            ) : null}
          </div>
        </div>

        {heroImage ? (
          <div className="relative mx-auto max-w-6xl px-6 pb-10 md:px-12 md:pb-12">
            <div
              className={`relative overflow-hidden rounded-[1.75rem] border border-nfe-paper/10 bg-nfe-green-900/40 ${
                mobileHeroAspect
                  ? `${mobileHeroAspect} md:aspect-[16/10] md:max-h-[620px]`
                  : meta.imageType === 'editorial-science'
                    ? 'aspect-[4/3] md:aspect-[16/9]'
                    : meta.imageType === 'editorial-portrait' &&
                        heroImage.includes('well-aging-not-disappearing')
                      ? 'aspect-[16/9]'
                      : 'aspect-[4/5] max-h-[70vh] md:aspect-[16/10] md:max-h-[620px]'
              }`}
            >
              {meta.mobileImage && !mobileHeroAspect ? (
                /* Art direction: a dedicated 4:5 crop below the md breakpoint,
                   the approved desktop asset above it. One <picture> means the
                   browser fetches exactly one of the two. */
                <picture>
                  <source
                    media="(max-width: 767px)"
                    srcSet={meta.mobileImage}
                    type="image/webp"
                  />
                  <source srcSet={heroImage} type="image/webp" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage}
                    alt={meta.imageAlt ?? meta.title}
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </picture>
              ) : (
                <Image
                  src={heroImage}
                  alt={meta.imageAlt ?? meta.title}
                  fill
                  priority
                  className={`${
                    mobileHeroAspect ? 'object-contain md:object-cover' : 'object-cover'
                  } ${
                    meta.imageType === 'editorial-science'
                      ? 'object-center md:object-[center_18%]'
                      : ''
                  }`}
                  sizes="(max-width: 768px) 100vw, 1152px"
                />
              )}
            </div>
          </div>
        ) : null}
      </section>

      <section className="px-6 py-16 md:px-12">
        <article className="prose prose-lg mx-auto max-w-3xl text-nfe-ink prose-headings:font-serif prose-headings:text-nfe-green-900 prose-a:text-nfe-green-900 prose-a:no-underline hover:prose-a:underline">
          <MDXContent />
        </article>

        <div className="mx-auto max-w-3xl">
          {seriesHref ? (
            <div className="mt-12 rounded-[1.5rem] border border-nfe-green-900/10 bg-white/70 p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
                Editorial Pillar
              </p>
              <Link
                href={seriesHref}
                className="mt-3 inline-flex font-serif text-2xl text-nfe-green-900 transition hover:text-nfe-green-700"
              >
                Explore The New Language of Well-Aging →
              </Link>
            </div>
          ) : null}

          <ArticleRelatedLinks slug={meta.slug} />
          <ArticleMaisonLinks />

          <div className="mt-12 border-t border-nfe-green-900/10 pt-8">
            <Link
              href={backHref}
              className="text-sm uppercase tracking-[0.18em] text-nfe-green-900 transition hover:text-nfe-green-700"
            >
              ← Back to the Journal
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
