import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleMDX, allArticleSlugs, type ArticleSlug } from "@/content/articles/registry";
import articlesIndex from "@/content/articles/articles.json";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = (articlesIndex as Array<{ slug: string; title: string; excerpt: string; image?: string }>).find(
    (article) => article.slug === slug
  );

  if (!meta) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: meta.title,
    description: meta.excerpt,
    openGraph: {
      title: meta.title,
      description: meta.excerpt,
      images: meta.image ? [{ url: meta.image }] : [],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const typedSlug = slug as ArticleSlug;
  const loader = articleMDX[typedSlug];
  if (!loader) {
    notFound();
  }

  const meta = (articlesIndex as Array<{ slug: string; title: string; excerpt?: string; author?: string; date?: string; image?: string }>).find(
    (article) => article.slug === typedSlug
  );
  if (!meta) {
    notFound();
  }

  const mod = await loader();
  const MDXContent = mod.default;
  
  const formattedDate = meta.date
    ? new Date(meta.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const contentElement = (
    <div className="prose prose-lg max-w-3xl text-[#0D2818]">
      <MDXContent />
    </div>
  );

  return (
    <main className="w-full bg-white">
      {meta.image && (
        <div className="relative w-full h-[60vh]">
          <Image
            src={meta.image}
            alt={meta.title}
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
          {/* Temporary build marker for verification */}
          {process.env.NEXT_PUBLIC_BUILD_SHA && (
            <p className="text-xs text-gray-400 mb-2" data-build-sha={process.env.NEXT_PUBLIC_BUILD_SHA}>
              Build: {process.env.NEXT_PUBLIC_BUILD_SHA}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-serif text-[#0D2818] mb-4">
            {meta.title}
          </h1>
          {/* Hero excerpt (optional) */}
          {meta.excerpt && (
            <div className="my-6 max-w-2xl mx-auto border-t border-b border-[#0D2818]/10 py-6">
              <p className="text-xl md:text-2xl text-[#0D2818] font-serif italic leading-relaxed">
                {meta.excerpt}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-6">
            {meta.author && <span>By {meta.author}</span>}
            {meta.author && formattedDate && <span> • </span>}
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
