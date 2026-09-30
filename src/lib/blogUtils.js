export function formatDate(iso, opts = {}) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: opts.short ? "short" : "long",
    day: "numeric",
  });
}

export function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Extract ## and ### headings from markdown, skipping fenced code blocks.
export function extractHeadings(markdown) {
  const headings = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (match) {
      const text = match[2].replace(/[*_`]/g, "").trim();
      headings.push({
        depth: match[1].length,
        text,
        id: slugifyHeading(text),
      });
    }
  }
  return headings;
}

// True when the post contains at least one fenced code block with a language
// tag — used to decide whether the syntax highlighter chunk is worth loading.
export function hasCodeBlocks(markdown) {
  return /```[a-zA-Z]/.test(markdown);
}

// { src, alt } or null. Computed at build time from the post's `cover` field
// or its first local illustration (see scripts/lib/posts.mjs).
export function coverImage(post) {
  return post.cover ?? null;
}

function terms(query) {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

// Every term must appear somewhere in the post: title, excerpt, topic, tags,
// or `body` (plain text from the search index; may be null while it loads).
// Returns a relevance score, 0 for no match. Title hits count most, then
// excerpt/topic/tags, then body text.
export function scorePost(post, query, body) {
  const ts = terms(query);
  if (ts.length === 0) return 1;
  const title = post.title.toLowerCase();
  const meta = [post.excerpt, post.category, ...post.tags].join(" ").toLowerCase();
  const text = body ? body.toLowerCase() : "";
  let score = 0;
  for (const t of ts) {
    if (title.includes(t)) score += 10;
    else if (meta.includes(t)) score += 4;
    else if (text.includes(t)) score += 1;
    else return 0;
  }
  return score;
}

// When a search term only appears in the body, return the window around its
// first occurrence so the reader sees why the post matched.
export function searchSnippet(post, query, body, radius = 90) {
  const ts = terms(query);
  if (ts.length === 0 || !body) return null;
  const visible = [post.title, post.excerpt].join(" ").toLowerCase();
  const hidden = ts.find((t) => !visible.includes(t));
  if (!hidden) return null;
  const at = body.toLowerCase().indexOf(hidden);
  if (at < 0) return null;
  const start = Math.max(0, body.lastIndexOf(" ", Math.max(0, at - radius)) + 1);
  let end = body.indexOf(" ", at + hidden.length + radius);
  if (end < 0) end = body.length;
  let snippet = body.slice(start, end);
  if (end < body.length) snippet = snippet.replace(/[.,;:!?]+$/, "");
  return {
    text: snippet,
    before: start > 0,
    after: end < body.length,
    terms: ts,
  };
}
