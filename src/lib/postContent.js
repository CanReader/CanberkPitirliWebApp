import { useEffect, useState } from "react";
import { loaders } from "virtual:blog-content";

// Post bodies and the search index are separate chunks. Promises are cached
// so a prefetch on hover and the real load share one request.
const bodies = new Map();
let searchIndex = null;

export function loadPostContent(slug) {
  if (!bodies.has(slug)) {
    const load = loaders[slug];
    if (!load) return Promise.reject(new Error(`No post "${slug}"`));
    const promise = load().then((m) => m.default);
    // Drop failed loads so a retry can fetch again.
    promise.catch(() => bodies.delete(slug));
    bodies.set(slug, promise);
  }
  return bodies.get(slug);
}

// Warm the chunk when a reader is about to open a post (hover, focus).
export function prefetchPost(slug) {
  loadPostContent(slug).catch(() => {});
}

// { status: "loading" | "ready" | "error", content, retry }
export function usePostContent(slug) {
  const [state, setState] = useState({ slug, status: "loading", content: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ slug, status: "loading", content: null });
    loadPostContent(slug).then(
      (content) => !cancelled && setState({ slug, status: "ready", content }),
      () => !cancelled && setState({ slug, status: "error", content: null })
    );
    return () => {
      cancelled = true;
    };
  }, [slug, attempt]);

  // Never hand back the previous post's body while the next one loads.
  const current = state.slug === slug ? state : { status: "loading", content: null };
  return { ...current, retry: () => setAttempt((n) => n + 1) };
}

// Full-text search index: { slug: plainText }. Fetched the first time the
// reader searches, then kept.
export function loadSearchIndex() {
  if (!searchIndex) {
    searchIndex = import("virtual:blog-search").then((m) => m.default);
    searchIndex.catch(() => {
      searchIndex = null;
    });
  }
  return searchIndex;
}

export function useSearchIndex(enabled) {
  const [index, setIndex] = useState(null);
  useEffect(() => {
    if (!enabled || index) return;
    let cancelled = false;
    loadSearchIndex().then(
      (docs) => !cancelled && setIndex(docs),
      () => {}
    );
    return () => {
      cancelled = true;
    };
  }, [enabled, index]);
  return index;
}
