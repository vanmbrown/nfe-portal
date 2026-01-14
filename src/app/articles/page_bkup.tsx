// src/app/articles/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";

export const metadata = {
  title: "Articles • NFE Beauty",
  description: "Science-backed skincare education for mature melanated skin.",
};

export default async function ArticlesIndex() {
  const articles = getAllArticles();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl font-semibold mb-10 text-center">
        Articles & Editorials
      </h1>

      <div className="grid gap-12 md:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group block"
          >
            <div className="overflow-hidden rounded-lg shadow-sm bg-white">
              {article.image && (
                <div className="relative w-full h-56">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl font-semibold group-hover:opacity-80">
                  {article.title}
                </h2>

                <p className="mt-2 text-gray-500 text-sm">
                  {new Date(article.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                <p className="mt-4 text-gray-700 line-clamp-3">
                  {article.excerpt}
                </p>

                <span className="mt-4 inline-block text-primary font-medium group-hover:underline">
                  Read article →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
