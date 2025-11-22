import Image from "next/image";
import type { Metadata } from "next";
import { remark } from "remark";
import html from "remark-html";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";

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

  const formattedDate = article.date
    ? new Date(article.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <main className="w-full bg-white">
      {article.image && (
        <div className="relative w-full h-[60vh]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}

      <section className="article-wrapper px-6 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#0D2818]/70 mb-2">
            Articles & Editorials
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#0D2818] mb-4">
            {article.title}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {article.author && <span>By {article.author}</span>}
            {article.author && formattedDate && <span> • </span>}
            {formattedDate}
          </p>
          {article.excerpt && (
            <p className="text-lg md:text-xl text-[#0D2818]/80 font-light leading-relaxed max-w-2xl mx-auto">
              {article.excerpt}
            </p>
          )}
        </div>

        <article
          className="prose prose-lg mx-auto max-w-3xl text-[#0D2818]"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </section>
    </main>
  );
}
