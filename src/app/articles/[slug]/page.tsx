import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { articleMDX, allArticleSlugs, type ArticleSlug } from '@/content/articles/registry'
import { getArticleBySlug, getPillarLabel } from '@/lib/articles'
import { ArticleJsonLd } from '@/components/articles/ArticleJsonLd'
import {
  ArticleMaisonLinks,
  ArticleRelatedLinks,
} from '@/components/articles/ArticleRelatedLinks'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return allArticleSlugs.map((slug) => ({ slug }))
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

  return {
    title,
    description: meta.excerpt,
    openGraph: {
      title,
      description: meta.excerpt,
      type: 'article',
      publishedTime: meta.date,
      authors: [meta.author],
      images: meta.image ? [{ url: meta.image }] : [],
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

  const formattedDate = new Date(`${meta.date}T12:00:00Z`).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }
  )

  return (
    <div className="bg-nfe-paper text-nfe-ink">
      <ArticleJsonLd
        slug={meta.slug}
        title={meta.title}
        description={meta.excerpt}
        image={meta.image ?? '/images/homepage/nfe-home-hero-product-vessel-desktop.webp'}
        publishedAt={meta.date}
      />

      <section className="border-b border-nfe-green-900/10 bg-nfe-green-900 px-6 py-20 text-nfe-paper md:py-24">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/articles"
            className="text-sm uppercase tracking-[0.22em] text-nfe-paper/70 transition hover:text-nfe-gold"
          >
            ← Back to the Journal
          </Link>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-nfe-gold">
            {getPillarLabel(meta.pillar)}
            {meta.series ? ` • ${meta.series}` : ''}
          </p>

          <h1 className="mt-5 font-serif text-4xl leading-tight text-nfe-gold md:text-6xl">
            {meta.title}
          </h1>

          {meta.excerpt ? (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-nfe-paper/82 md:text-xl">
              {meta.excerpt}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-nfe-paper/70">
            <span>{meta.author}</span>
            <span>•</span>
            <span>{formattedDate}</span>
            {meta.readingMinutes ? (
              <>
                <span>•</span>
                <span>{meta.readingMinutes} min read</span>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-12">
        <article className="prose prose-lg mx-auto max-w-3xl text-nfe-ink prose-headings:font-serif prose-headings:text-nfe-green-900 prose-a:text-nfe-green-900 prose-a:no-underline hover:prose-a:underline">
          <MDXContent />
        </article>

        <div className="mx-auto max-w-3xl">
          <ArticleRelatedLinks slug={meta.slug} />
          <ArticleMaisonLinks />

          <div className="mt-12 border-t border-nfe-green-900/10 pt-8">
            <Link
              href="/articles"
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
