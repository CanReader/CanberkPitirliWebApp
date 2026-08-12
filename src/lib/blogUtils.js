export function readingTime(content) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

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
