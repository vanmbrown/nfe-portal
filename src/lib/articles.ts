import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

export type ArticleMeta = {
  slug: string;
  title: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  file?: string;
};

export type Article = ArticleMeta & {
  contentHtml: string;
};

const articlesDir = path.join(process.cwd(), "src", "content", "articles");
const articlesJsonPath = path.join(process.cwd(), "src", "content", "articles", "articles.json");

function loadArticlesMeta(): ArticleMeta[] {
  const raw = fs.readFileSync(articlesJsonPath, "utf8");
  return JSON.parse(raw) as ArticleMeta[];
}

export function getAllArticles(): ArticleMeta[] {
  const articles = loadArticlesMeta();
  return [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getArticleBySlug(slug: string): Article {
  const metaFromJson = loadArticlesMeta().find((article) => article.slug === slug);
  
  // Try to use the file name from JSON metadata first, then fall back to slug
  let filePath: string | null = null;
  
  if (metaFromJson && (metaFromJson as any).file) {
    // Use the file name specified in articles.json
    const specifiedFile = (metaFromJson as any).file;
    const specifiedPath = path.join(articlesDir, specifiedFile);
    if (fs.existsSync(specifiedPath)) {
      filePath = specifiedPath;
    }
  }
  
  // Fall back to slug-based lookup if file not found
  if (!filePath) {
    const mdPath = path.join(articlesDir, `${slug}.md`);
    const mdxPath = path.join(articlesDir, `${slug}.mdx`);
    
    if (fs.existsSync(mdxPath)) {
      filePath = mdxPath;
    } else if (fs.existsSync(mdPath)) {
      filePath = mdPath;
    }
  }
  
  if (!filePath) {
    throw new Error(`Article markdown not found for slug: ${slug}`);
  }

  const file = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(file);
  const isMDX = filePath.endsWith(".mdx");

  // For MDX files, strip component definitions but keep the JSX usage as raw HTML.
  let processedContent = content;
  if (isMDX) {
    const lines = content.split("\n");
    let markdownStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith("#")) {
        markdownStartIndex = i;
        break;
      }
    }

    if (markdownStartIndex === 0) {
      let foundExports = false;
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith("export ") || trimmed.startsWith("const ")) {
          foundExports = true;
        } else if (trimmed && foundExports) {
          markdownStartIndex = i;
          break;
        }
      }
    }

    processedContent = lines.slice(markdownStartIndex).join("\n").trim();
  }

  const contentHtml = remark().use(html).processSync(processedContent).toString();

  return {
    slug,
    title: (data.title as string) ?? metaFromJson?.title ?? slug,
    date: (data.date as string) ?? metaFromJson?.date ?? "",
    author: (data.author as string) ?? metaFromJson?.author ?? "",
    image: (data.image as string) ?? metaFromJson?.image ?? "",
    excerpt: (data.excerpt as string) ?? metaFromJson?.excerpt ?? "",
    contentHtml,
  };
}
