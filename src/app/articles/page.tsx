import Link from "next/link";
import Image from "next/image";
import { getAllArticles } from "@/lib/articles";

export default function ArticlesIndexPage() {
  const articles = getAllArticles();

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-serif text-center text-[#0D2818] mb-12">
        Articles & Editorials
      </h1>

      <div className="grid md:grid-cols-2 gap-12">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="cursor-pointer border border-gray-200 rounded-xl hover:shadow-lg transition p-4 bg-white"
          >
            {article.image && (
              <div className="relative w-full h-60 overflow-hidden rounded-lg mb-4">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            <h2 className="text-xl	 font-semibold text-[#0D2818] mb-2">
              {article.title}
            </h2>

            <p className="text-sm text-gray-500 mb-4">{article.date}</p>

            <p className="text-gray-700 mb-4">{article.excerpt}</p>

            <span className="text-sm text-[#0D2818] font-medium border-b border-[#0D2818]">
              Read article →
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
