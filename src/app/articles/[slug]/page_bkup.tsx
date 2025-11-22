import type { Metadata } from 'next';
import { remark } from 'remark';
import html from 'remark-html';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticleBySlug(params.slug);

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.image ? [{ url: article.image }] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = getArticleBySlug(params.slug);

  const processed = await remark().use(html).process(article.content);
  const contentHtml = processed.toString();

  return (
    <div className="article-wrapper">
      <div className="article-header text-center py-10">
        <h1 className="text-4xl font-serif text-nfe-green">{article.title}</h1>
        <p className="text-sm uppercase tracking-wide text-gray-500 mt-2">
          By {article.author} • {article.date}
        </p>
      </div>

      <article
        className="prose prose-lg max-w-3xl mx-auto px-4 pb-16"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}

