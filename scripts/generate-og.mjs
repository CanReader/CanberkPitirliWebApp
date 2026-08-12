// Generates 1200x630 Open Graph cards into dist/og/ for the home page, every
// blog post, and every project page. Full-bleed real imagery: each post's own
// illustration (or a seeded generative nebula), each project's screenshot.
// Requires rsvg-convert + ImageMagick on the build machine; skips if absent.
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { posts } from "../src/data/posts.js";
import { projects } from "../src/data/projects.js";
import { site } from "../src/data/siteConfig.js";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "dist/og");
const ASSETS = join(ROOT, "scripts/og-assets");
const CACHE = join(tmpdir(), "og-image-cache");

try {
  execSync("rsvg-convert --version", { stdio: "ignore" });
  execSync("magick --version", { stdio: "ignore" });
} catch {
  console.warn("⚠ rsvg-convert or magick not found; skipping OG card generation");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
mkdirSync(CACHE, { recursive: true });

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const hash = (s) => createHash("md5").update(s).digest("hex");

// Normalize any source image (local path or URL, any format) to a cached
// 1200-wide jpg and return it as a base64 data URI for SVG embedding.
function embed(source) {
  const key = join(CACHE, hash(source) + ".jpg");
  if (!existsSync(key)) {
    let local = source;
    if (/^https?:\/\//.test(source)) {
      const dl = join(CACHE, hash(source) + ".src");
      execSync(`curl -sL --max-time 20 -o "${dl}" "${source}"`);
      local = dl;
    }
    // [0] takes the first frame of gifs; treat failures as "no image"
    execSync(`magick "${local}[0]" -resize 1300x -quality 85 "${key}"`);
  }
  return "data:image/jpeg;base64," + readFileSync(key).toString("base64");
}

function tryEmbed(source) {
  try {
    return embed(source);
  } catch {
    return null;
  }
}

const NEBULAS = [0, 1, 2, 3].map((i) => embed(join(ASSETS, `bg-${i}.jpg`)));
const nebulaFor = (slug) => NEBULAS[parseInt(hash(slug).slice(0, 8), 16) % NEBULAS.length];

function wrap(text, maxChars, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\W*\s\S*$/, "") + "…";
    return kept;
  }
  return lines;
}

// Full-bleed backdrop + scrims + brand mark. `blur` softens busy hero images.
const CARD = (backdrop, blur, inner) => `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" font-family="Inter">
  <defs>
    <linearGradient id="scrimX" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#07080a" stop-opacity="0.94"/>
      <stop offset="52%" stop-color="#07080a" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#07080a" stop-opacity="0.30"/>
    </linearGradient>
    <linearGradient id="scrimY" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#07080a" stop-opacity="0.85"/>
      <stop offset="35%" stop-color="#07080a" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="nameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#A7F3D0"/>
    </linearGradient>
    <filter id="soften" x="-5%" y="-5%" width="110%" height="110%">
      <feGaussianBlur stdDeviation="${blur}"/>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="#07080a"/>
  <image href="${backdrop}" x="-30" y="-30" width="1260" height="690" preserveAspectRatio="xMidYMid slice" ${blur > 0 ? 'filter="url(#soften)"' : ""}/>
  <rect width="1200" height="630" fill="url(#scrimX)"/>
  <rect width="1200" height="630" fill="url(#scrimY)"/>
  <text x="76" y="92" font-weight="700" font-size="34" fill="#FAFAFA">CP<tspan fill="#34D399">.</tspan></text>
  ${inner}
</svg>`;

const kicker = (parts) =>
  `<text x="78" y="188" font-family="JetBrains Mono" font-size="21" letter-spacing="3" fill="#34D399">${esc(parts.join("  ·  ").toUpperCase())}</text>`;

const footer = (path) => `
  <text x="78" y="566" font-family="JetBrains Mono" font-size="22" fill="#9ca3af">canberkpitirli.com${esc(path)}</text>`;

const titleBlock = (lines, size, startY, fill = "#FAFAFA") =>
  lines
    .map(
      (l, i) =>
        `<text x="76" y="${startY + i * size * 1.18}" font-weight="700" font-size="${size}" letter-spacing="-1" fill="${fill}">${esc(l)}</text>`
    )
    .join("");

function render(name, svg) {
  const tmp = join(tmpdir(), `og-${name}.svg`);
  writeFileSync(tmp, svg);
  execSync(`rsvg-convert -w 1200 -h 630 "${tmp}" -o "${join(OUT, name + ".png")}"`);
  rmSync(tmp, { force: true });
}

const readingTime = (c) => Math.max(1, Math.ceil(c.split(/\s+/).length / 200));
const heroOf = (content) => {
  const m = content.match(/!\[[^\]]*\]\((\/images\/[^)\s]+)\)/);
  return m ? join(ROOT, "public", decodeURIComponent(m[1])) : null;
};

// ── home ──
{
  const photo = tryEmbed(join(ROOT, "public/images/Profile2.1.png"));
  const inner = `
    ${kicker(["game", "graphics", "full stack developer"])}
    <text x="72" y="290" font-weight="700" font-size="92" letter-spacing="-2" fill="url(#nameGrad)">Canberk Pitirli</text>
    <text x="78" y="356" font-size="31" fill="#d4d4d8">From C++ game engines and real-time graphics</text>
    <text x="78" y="400" font-size="31" fill="#d4d4d8">to production web platforms.</text>
    <text x="78" y="452" font-weight="600" font-size="31" fill="#34D399">Shipping since age 14.</text>
    <text x="78" y="508" font-family="JetBrains Mono" font-size="22" fill="#9ca3af">3 Steam titles  ·  TypeScript &amp; React in production</text>
    ${photo ? `
    <defs><clipPath id="pc"><circle cx="985" cy="315" r="150"/></clipPath></defs>
    <circle cx="985" cy="315" r="158" fill="none" stroke="#34D399" stroke-width="3" stroke-opacity="0.8"/>
    <circle cx="985" cy="315" r="150" fill="#0d0d10"/>
    <image href="${photo}" x="835" y="130" width="300" height="420" preserveAspectRatio="xMidYMin slice" clip-path="url(#pc)"/>` : ""}
    ${footer("")}`;
  render("home", CARD(nebulaFor("home"), 0, inner));
}

// ── blog posts ──
for (const post of posts) {
  const hero = heroOf(post.content);
  const backdrop = (hero && tryEmbed(hero)) || nebulaFor(post.slug);
  const usedHero = backdrop !== nebulaFor(post.slug) || !hero ? !!hero : false;
  const lines = wrap(post.title, 28, 3);
  const size = lines.length >= 3 ? 58 : lines.length === 2 ? 66 : 72;
  const startY = 300 - ((lines.length - 1) * size * 1.18) / 2 + (lines.length >= 3 ? 36 : 20);
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const inner = `
    ${kicker([post.category, `${readingTime(post.content)} min read`])}
    <rect x="78" y="206" width="64" height="4" rx="2" fill="#34D399"/>
    ${titleBlock(lines, size, startY)}
    <text x="78" y="500" font-family="JetBrains Mono" font-size="21" fill="#9ca3af">${esc(date)}</text>
    ${footer("/blog")}`;
  render(`blog-${post.slug}`, CARD(backdrop, usedHero ? 4 : 0, inner));
}

// ── projects ──
for (const p of projects) {
  const source =
    (p.images && p.images[0]) || p.preview
      ? String((p.images && p.images[0]) || p.preview)
      : null;
  const resolved = source
    ? /^https?:\/\//.test(source)
      ? source
      : join(ROOT, "public", decodeURIComponent(source))
    : null;
  const backdrop = (resolved && tryEmbed(resolved)) || nebulaFor(p.slug);
  const isPhotoBackdrop = resolved && backdrop !== null;
  const lines = wrap(p.title, 20, 2);
  const size = lines.length >= 2 ? 74 : 88;
  const startY = 300 - ((lines.length - 1) * size * 1.18) / 2 + 16;
  const stack = [...p.languages, ...p.techs].slice(0, 4).join("  ·  ");
  const inner = `
    ${kicker([p.categories[0], p.status])}
    <rect x="78" y="206" width="64" height="4" rx="2" fill="#34D399"/>
    ${titleBlock(lines, size, startY)}
    <text x="78" y="470" font-family="JetBrains Mono" font-size="23" fill="#d4d4d8">${esc(stack)}</text>
    ${footer("/projects")}`;
  render(`project-${p.slug}`, CARD(backdrop, isPhotoBackdrop ? 3 : 0, inner));
}

console.log(`  ✓ OG cards: home + ${posts.length} posts + ${projects.length} projects → dist/og/`);
