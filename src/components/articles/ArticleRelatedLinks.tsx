import Link from 'next/link'
import { getRelatedArticles, getPillarLabel } from '@/lib/articles'

export function ArticleRelatedLinks({ slug }: { slug: string }) {
  const related = getRelatedArticles(slug, 3)

  return (
    <section className="mt-16 border-t border-nfe-green-900/10 pt-10">
      <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
        Related Reading
      </p>
      <div className="mt-6 grid gap-4">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="rounded-[1.25rem] border border-nfe-green-900/10 bg-white/70 p-5 transition hover:border-nfe-gold/30"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-nfe-green-700">
              {getPillarLabel(article.pillar)}
            </p>
            <h3 className="mt-2 font-serif text-2xl text-nfe-green-900">{article.title}</h3>
            <p className="mt-3 text-sm leading-6 text-nfe-ink/72">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function ArticleMaisonLinks() {
  const links = [
    { href: '/science', label: 'Science' },
    { href: '/discovery', label: 'Discovery Ritual' },
    { href: '/skin-ritual-quiz', label: 'Skin Ritual Quiz' },
    { href: '/products', label: 'The Atelier' },
    { href: '/founder-access', label: 'Founder Access' },
    { href: '/concierge', label: 'Concierge' },
  ]

  return (
    <section className="mt-12 rounded-[1.5rem] border border-nfe-green-900/10 bg-nfe-green-900/[0.03] p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-nfe-green-700">
        Continue Inside the Maison
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-nfe-green-900/15 px-4 py-2 text-sm text-nfe-green-900 transition hover:border-nfe-gold/40 hover:text-nfe-green-700"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
