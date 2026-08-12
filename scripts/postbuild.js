// Post-build SEO pass. Runs after `vite build` (see package.json).
//
// The site is a SPA on static hosting, so without this step every URL serves
// the same <head> and crawlers/social scrapers never see per-page titles,
// descriptions or OG tags. This script:
//   1. Prerenders dist/blog/, dist/blog/<slug>/ and dist/projects/<slug>/
//      as copies of index.html with correct meta + JSON-LD baked in.
//      (Apache serves those directories directly; the SPA takes over on load.)
//   2. Generates dist/sitemap.xml
//   3. Generates dist/rss.xml for the blog
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { posts } from "../src/data/posts.js";
import { projects } from "../src/data/projects.js";
import { site } from "../src/data/siteConfig.js";

const DIST = new URL("../dist", import.meta.url).pathname;
const template = readFileSync(join(DIST, "index.html"), "utf8");
const today = new Date().toISOString().slice(0, 10);

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function replaceMeta(html, attr, key, value) {
  const re = new RegExp(`(<meta\\s+[^>]*${attr}="${key}"[^>]*content=")[^"]*(")`);
  if (!re.test(html)) {
    console.warn(`  ⚠ meta ${attr}="${key}" not found in template`);
    return html;
  }
  return html.replace(re, `$1${esc(value)}$2`);
}

function renderPage(page) {
  let html = template;
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${esc(page.title)}</title>`
  );
  html = replaceMeta(html, "name", "title", page.title);
  html = replaceMeta(html, "name", "description", page.description);
  html = replaceMeta(html, "property", "og:title", page.title);
  html = replaceMeta(html, "property", "og:description", page.description);
  html = replaceMeta(html, "property", "og:url", page.url);
  html = replaceMeta(html, "property", "og:type", page.type ?? "website");
  html = replaceMeta(html, "property", "twitter:title", page.title);
  html = replaceMeta(html, "name", "twitter:description", page.description);
  html = replaceMeta(html, "property", "twitter:url", page.url);
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${esc(page.url)}" />`
  );

  if (page.image) {
    // All page images are generated 1200x630 cards, so the default
    // og:image:width/height stay correct.
    html = replaceMeta(html, "property", "og:image", page.image);
    html = replaceMeta(html, "property", "twitter:image", page.image);
    html = replaceMeta(html, "property", "og:image:alt", page.title);
  }

  let extra = "";
  if (page.publishedTime) {
    extra += `<meta property="article:published_time" content="${esc(page.publishedTime)}" />\n`;
  }
  if (page.jsonLd) {
    extra += `<script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>\n`;
  }
  if (extra) html = html.replace("</head>", `${extra}</head>`);

  return html;
}

function writePage(route, page) {
  const dir = join(DIST, ...route.split("/").filter(Boolean));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), renderPage(page));
  console.log(`  ✓ ${route}/index.html`);
}

console.log("Prerendering routes...");

// ── Blog list ──
writePage("/blog", {
  title: `Blog — ${site.author}`,
  description:
    "Thoughts on graphics programming, game development, C++, Rust, and systems design by Canberk Pitirli.",
  url: `${site.url}/blog`,
  image: `${site.url}/og/home.png`,
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${site.author} — Blog`,
    url: `${site.url}/blog`,
    author: { "@type": "Person", name: site.author, url: site.url },
  },
});

// ── Blog posts ──
for (const post of posts) {
  const url = `${site.url}/blog/${post.slug}`;
  writePage(`/blog/${post.slug}`, {
    title: `${post.title} — ${site.author}`,
    description: post.excerpt,
    url,
    type: "article",
    publishedTime: post.date,
    image: `${site.url}/og/blog-${post.slug}.png`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      keywords: post.tags.join(", "),
      url,
      image: `${site.url}/og/blog-${post.slug}.png`,
      mainEntityOfPage: url,
      author: { "@type": "Person", name: site.author, url: site.url },
    },
  });
}

// ── Project pages ──
for (const project of projects) {
  const url = `${site.url}/projects/${project.slug}`;
  const image = project.preview.startsWith("http")
    ? project.preview
    : site.url + project.preview;
  writePage(`/projects/${project.slug}`, {
    title: `${project.title} — ${site.author}`,
    description: project.description.slice(0, 300),
    url,
    image: `${site.url}/og/project-${project.slug}.png`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": project.categories.includes("Game Dev") ? "VideoGame" : "CreativeWork",
      name: project.title,
      description: project.description,
      image,
      url,
      author: { "@type": "Person", name: site.author, url: site.url },
    },
  });
}

// ── sitemap.xml ──
const urls = [
  { loc: `${site.url}/`, lastmod: today, priority: "1.0" },
  { loc: `${site.url}/blog`, lastmod: posts[0]?.date ?? today, priority: "0.8" },
  ...posts.map((p) => ({
    loc: `${site.url}/blog/${p.slug}`,
    lastmod: p.date,
    priority: "0.7",
  })),
  ...projects.map((p) => ({
    loc: `${site.url}/projects/${p.slug}`,
    lastmod: today,
    priority: "0.6",
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
writeFileSync(join(DIST, "sitemap.xml"), sitemap);
console.log(`  ✓ sitemap.xml (${urls.length} URLs)`);

// ── rss.xml ──
const rssItems = posts
  .map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${site.url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${site.url}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <category>${esc(p.category)}</category>
      <description>${esc(p.excerpt)}</description>
    </item>`
  )
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.author)} — Blog</title>
    <link>${site.url}/blog</link>
    <description>${esc("Graphics programming, game development, C++, Rust, and systems design.")}</description>
    <language>en-us</language>
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>
`;
writeFileSync(join(DIST, "rss.xml"), rss);
console.log(`  ✓ rss.xml (${posts.length} items)`);

console.log("Postbuild SEO pass done.");
