import articlesIndex from "@/content/articles/articles.json";

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  file?: string;
};

export function getAllArticles(): ArticleMeta[] {
  const articles = articlesIndex as ArticleMeta[];
  return [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
}
