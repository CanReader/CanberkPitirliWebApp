// Blog posts live in src/content/posts/<slug>.md (see scripts/lib/posts.mjs
// for the file format). This module only carries their metadata: the post
// bodies are separate chunks loaded on demand through src/lib/postContent.js,
// so listing pages and the home page never download full articles.
import { postIndex } from "virtual:blog-index";
import { usePublishedPosts } from "./blogTaxonomy.js";

export * from "./blogTaxonomy.js";

// Series only show posts that exist here (published, plus drafts in dev).
usePublishedPosts(postIndex.map((p) => p.slug));

// Published posts, newest first. Each has slug, title, date, category, tags,
// excerpt, featured, readingTime (minutes), and cover ({ src, alt } or null).
export const posts = postIndex;
