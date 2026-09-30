// Reads blog posts from src/content/posts/<slug>.md. Shared by the Vite blog
// plugin (which turns them into browser modules) and the Node build scripts
// (OG cards, prerender, sitemap, RSS), so every consumer sees the same data.
//
// A post file is a header block followed by Markdown:
//
//   ---
//   title: "Shadow Mapping from Scratch in DirectX 11"
//   date: "2026-04-18"
//   category: "Graphics"
//   tags: ["DirectX 11", "HLSL", "Tutorials"]
//   excerpt: "One or two sentences shown in lists and search results."
//   featured: false
//   ---
//
//   Post body in Markdown...
//
// Every header value is JSON (quoted strings, arrays, true/false), one key
// per line. Optional keys: `featured`, `visible: false` for drafts (excluded
// from the site and the build), and `cover: "/images/x.webp"` to override the
// cover, which otherwise is the first local image in the body.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { extractHeadings } from "../../src/lib/blogUtils.js";

export const POSTS_DIR = new URL("../../src/content/posts/", import.meta.url).pathname;

const REQUIRED = ["title", "date", "category", "tags", "excerpt"];

export function parsePost(slug, raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!m) throw new Error(`${slug}.md: missing --- header block`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const kv = /^(\w+):\s*(.*)$/.exec(line);
    if (!kv) throw new Error(`${slug}.md: bad header line: ${line}`);
    try {
      meta[kv[1]] = JSON.parse(kv[2]);
    } catch {
      throw new Error(`${slug}.md: value for "${kv[1]}" is not valid JSON`);
    }
  }
  for (const key of REQUIRED) {
    if (meta[key] === undefined) throw new Error(`${slug}.md: missing "${key}"`);
  }
  return { slug, ...meta, content: m[2].replace(/^\n+/, "") };
}

export function readingTime(content) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

export function coverFrom(post) {
  if (post.cover) return { src: post.cover, alt: post.title };
  const m = post.content.match(/!\[([^\]]*)\]\((\/images\/[^)\s]+)\)/);
  return m ? { src: m[2], alt: m[1] || post.title } : null;
}

// Markdown to searchable plain text: drops code fences, images, link targets,
// math blocks, and formatting marks.
export function plainText(content) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// All published posts, newest first, each with its body (`content`) plus the
// derived fields pages need before the body loads: `readingTime`, `cover`, and
// `headingCount` (the post page reserves table-of-contents space from it).
export function loadPosts({ includeDrafts = false } = {}) {
  const posts = readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.slice(0, -3);
      const post = parsePost(slug, readFileSync(join(POSTS_DIR, f), "utf8"));
      return {
        ...post,
        readingTime: readingTime(post.content),
        cover: coverFrom(post),
        headingCount: extractHeadings(post.content).length,
      };
    });
  return posts
    .filter((p) => includeDrafts || p.visible !== false)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
