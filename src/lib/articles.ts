import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
};

export type Article = ArticleMeta & {
  content: string;
};

const articlesDir = path.join(process.cwd(), "src", "content", "articles");
const articlesJsonPath = path.join(process.cwd(), "src", "content", "articles.json");

function loadArticlesMeta(): ArticleMeta[] {
  const raw = fs.readFileSync(articlesJsonPath, "utf8");
  return JSON.parse(raw) as ArticleMeta[];
}

export function getAllArticles(): ArticleMeta[] {
  const articles = loadArticlesMeta();
  return [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticleBySlug(slug: string): Article {
  const filePath = path.join(articlesDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Article markdown not found for slug: ${slug}`);
  }

  const file = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(file);
  const metaFromJson = loadArticlesMeta().find((article) => article.slug === slug);

  return {
    slug,
    title: (data.title as string) ?? metaFromJson?.title ?? slug,
    date: (data.date as string) ?? metaFromJson?.date ?? "",
    author: (data.author as string) ?? metaFromJson?.author ?? "",
    image: (data.image as string) ?? metaFromJson?.image ?? "",
    excerpt: (data.excerpt as string) ?? metaFromJson?.excerpt ?? "",
    content,
  };
}
