// Blog posts live in src/content/posts/<slug>.md (see scripts/lib/posts.mjs
// for the file format). This module only carries their metadata: the post
// bodies are separate chunks loaded on demand through src/lib/postContent.js,
// so listing pages and the home page never download full articles.
import { postIndex } from "virtual:blog-index";

export * from "./blogTaxonomy.js";

// Published posts, newest first. Each has slug, title, date, category, tags,
// excerpt, featured, readingTime (minutes), and cover ({ src, alt } or null).
export const posts = postIndex;
