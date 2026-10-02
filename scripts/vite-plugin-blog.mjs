// Turns src/content/posts/*.md into browser modules so post bodies never sit
// in the main bundle:
//
//   virtual:blog-index    every published post's metadata, readingTime, and
//                         cover. Small; imported by anything that lists posts.
//   virtual:blog-content  { slug: () => import(body) }. Each body is its own
//                         chunk, fetched only when that post is opened.
//   virtual:blog-search   plain text of every post for full-text search.
//                         Loaded on demand when the reader starts searching.
//
// Drafts (visible: false) are left out of all three, so their text is not
// shipped. In dev, adding or editing a post file reloads the page.
import { join } from "node:path";
import { loadPosts, plainText, POSTS_DIR } from "./lib/posts.mjs";
// Series are defined in this file; a mistake there should fail loudly.
const TAXONOMY = new URL("../src/data/blogTaxonomy.js", import.meta.url).pathname;

const INDEX = "virtual:blog-index";
const CONTENT = "virtual:blog-content";
const SEARCH = "virtual:blog-search";
const BODY = "virtual:blog-body/";

export default function blogPlugin() {
  let server;

  const resolved = (id) => "\0" + id;
  const isOurs = (id) =>
    id === INDEX || id === CONTENT || id === SEARCH || id.startsWith(BODY);

  return {
    name: "blog-posts",

    resolveId(id) {
      return isOurs(id) ? resolved(id) : null;
    },

    async load(id) {
      if (!id.startsWith("\0virtual:blog-")) return null;
      const name = id.slice(1);
      const posts = loadPosts();
      // `vite build --watch` rebuilds when a post changes. The dev server has
      // its own reload hook below (it can't take a directory as a watch file).
      if (!server) {
        for (const p of posts) this.addWatchFile(join(POSTS_DIR, `${p.slug}.md`));
      }

      if (name === INDEX) {
        // Cache-busted import: a plain one would keep validating the series
        // tree as it was when the dev server started.
        const { validateSeries } = await import(`${TAXONOMY}?t=${Date.now()}`);
        const problems = validateSeries(posts.map((p) => p.slug));
        if (problems.length) this.error(`Series definition problems:\n  ${problems.join("\n  ")}`);
        const index = posts.map(({ content, ...meta }) => meta);
        return `export const postIndex = ${JSON.stringify(index)};`;
      }
      if (name === CONTENT) {
        const entries = posts.map(
          (p) => `  ${JSON.stringify(p.slug)}: () => import(${JSON.stringify(BODY + p.slug)}),`
        );
        return `export const loaders = {\n${entries.join("\n")}\n};`;
      }
      if (name === SEARCH) {
        const docs = Object.fromEntries(posts.map((p) => [p.slug, plainText(p.content)]));
        return `export default ${JSON.stringify(docs)};`;
      }
      if (name.startsWith(BODY)) {
        const post = posts.find((p) => p.slug === name.slice(BODY.length));
        if (!post) this.error(`Unknown or unpublished post: ${name}`);
        return `export default ${JSON.stringify(post.content)};`;
      }
      return null;
    },

    configureServer(s) {
      server = s;
      server.watcher.add(POSTS_DIR);
      const onChange = (file) => {
        const isPost = file.startsWith(POSTS_DIR) && file.endsWith(".md");
        if (!isPost && file !== TAXONOMY) return;
        for (const mod of server.moduleGraph.idToModuleMap.values()) {
          if (mod.id?.startsWith("\0virtual:blog-")) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", onChange);
      server.watcher.on("change", onChange);
      server.watcher.on("unlink", onChange);
    },
  };
}
