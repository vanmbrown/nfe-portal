import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { remark } from "remark";
import html from "remark-html";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllArticles, getArticleBySlug } from "@/lib/articles";
import { mdxComponents } from "@/components/articles/MDXComponents";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

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
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  
  const formattedDate = article.date
    ? new Date(article.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  // Render MDX or Markdown based on file type
  let contentElement: React.ReactNode;
  
  if (article.isMDX) {
    // Use MDXRemote for MDX files with component support
    contentElement = (
      <MDXRemote source={article.content} components={mdxComponents} />
    );
  } else {
    // Use remark for regular markdown files
    const processed = await remark().use(html).process(article.content);
    const contentHtml = processed.toString();
    contentElement = (
      <div
        className="prose prose-lg max-w-3xl text-[#0D2818]"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    );
  }

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
        <div className="max-w-3xl mx-auto mb-8">
          <Link 
            href="/articles" 
            className="text-[#0D2818]/60 hover:text-[#0D2818] transition-colors text-sm font-medium flex items-center gap-2"
          >
            ← Back to all Articles & Editorials
          </Link>
        </div>

        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#0D2818]/70 mb-2">
            Articles & Editorials
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-[#0D2818] mb-4">
            {article.title}
          </h1>
          {/* Hero excerpt (optional) */}
          {article.excerpt && (
            <div className="my-6 max-w-2xl mx-auto border-t border-b border-[#0D2818]/10 py-6">
              <p className="text-xl md:text-2xl text-[#0D2818] font-serif italic leading-relaxed">
                {article.excerpt}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-6">
            {article.author && <span>By {article.author}</span>}
            {article.author && formattedDate && <span> • </span>}
            {formattedDate}
          </p>
        </div>

        <article className="prose prose-lg mx-auto max-w-3xl text-[#0D2818]">
          {contentElement}
        </article>

        <div className="max-w-3xl mx-auto mt-16 pt-8 border-t border-gray-200">
          <Link 
            href="/articles" 
            className="text-[#0D2818]/60 hover:text-[#0D2818] transition-colors text-sm font-medium flex items-center gap-2"
          >
            ← Back to all Articles & Editorials
          </Link>
        </div>
      </section>
    </main>
  );
}
