import { useEffect, useRef, useSyncExternalStore } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

// Reading state, kept in the reader's own browser only. Two small stores:
//   blog:read      { slug: ISO date }   posts the reader finished
//   blog:progress  { slug: 0..1 }       how far into an unfinished post they got
// Storage can be unavailable (private mode, blocked site data), so every
// access is guarded and the blog works without it.

function createStore(key) {
  const event = `${key}-change`;
  let cache = null;

  const load = () => {
    if (cache) return cache;
    try {
      cache = JSON.parse(localStorage.getItem(key) || "{}") || {};
    } catch {
      cache = {};
    }
    return cache;
  };

  const save = (next) => {
    cache = next;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Not persisted, but this page view still reflects it.
    }
    window.dispatchEvent(new Event(event));
  };

  const subscribe = (callback) => {
    const onStorage = (e) => {
      if (e.key === key) {
        cache = null; // another tab changed it
        callback();
      }
    };
    window.addEventListener(event, callback);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(event, callback);
      window.removeEventListener("storage", onStorage);
    };
  };

  const use = () => useSyncExternalStore(subscribe, load, () => ({}));
  return { load, save, use };
}

const readStore = createStore("blog:read");
const progressStore = createStore("blog:progress");

// A post counts as started once the reader is this far into it.
export const STARTED_AT = 0.1;

export function markRead(slug) {
  const read = readStore.load();
  if (!read[slug]) readStore.save({ ...read, [slug]: new Date().toISOString() });
  // Finished posts aren't "unfinished" anymore.
  const { [slug]: _, ...rest } = progressStore.load();
  if (_ !== undefined) progressStore.save(rest);
}

export function markUnread(slug) {
  const { [slug]: _, ...rest } = readStore.load();
  readStore.save(rest);
}

function saveProgress(slug, value) {
  // Tracking stops when a post is finished, and stopping flushes one last
  // time; that must not put a finished post back into "unfinished".
  if (readStore.load()[slug]) return;
  const progress = progressStore.load();
  if ((progress[slug] ?? 0) >= value) return;
  progressStore.save({ ...progress, [slug]: value });
}

// The post finished most recently in this tab, so the blog page can replay
// its check once when the reader heads back there. Session-only.
const JUST_FINISHED = "blog:just-finished";

function rememberJustFinished(slug) {
  try {
    sessionStorage.setItem(JUST_FINISHED, slug);
  } catch {
    // Without session storage the blog page just doesn't replay it.
  }
}

// Peek, then clear once shown: Strict Mode runs state initializers twice in
// dev, so reading and clearing in one step would lose the value.
export function peekJustFinished() {
  try {
    return sessionStorage.getItem(JUST_FINISHED);
  } catch {
    return null;
  }
}

export function clearJustFinished() {
  try {
    sessionStorage.removeItem(JUST_FINISHED);
  } catch {
    // nothing to clear
  }
}

// { slug: ISO date } for every finished post.
export const useReadPosts = readStore.use;

// { slug: 0..1 } for every started, unfinished post.
export const useReadingProgress = progressStore.use;

// Reaching the end of the article (`endRef`) finishes the post. Two small
// guards, both invisible to someone who reads down to the end:
//   - the end has to have been off-screen at least once this visit, so
//     starting there (just after "Mark as unread", or a reload that restores
//     the scroll position) doesn't immediately check it off again;
//   - a few seconds on the page, so a jump straight to the bottom on arrival
//     doesn't count.
// Read marks are personal, so there's nothing to defend beyond that.
const MIN_DWELL_MS = 3000;

export function useFinishTracking(slug, endRef, enabled) {
  const elapsed = useRef(0);

  useEffect(() => {
    if (!enabled || !endRef.current) return;
    elapsed.current = 0;
    const needed = MIN_DWELL_MS;
    let atEnd = false;
    let seenAway = false;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      if (document.visibilityState === "visible") elapsed.current += now - last;
      last = now;
      if (atEnd && seenAway && elapsed.current >= needed) {
        markRead(slug);
        rememberJustFinished(slug);
        stop();
      }
    };
    const timer = setInterval(tick, 1000);
    const observer = new IntersectionObserver(([entry]) => {
      atEnd = entry.isIntersecting;
      if (!atEnd) seenAway = true;
      tick();
    });
    observer.observe(endRef.current);

    function stop() {
      clearInterval(timer);
      observer.disconnect();
    }
    return stop;
  }, [slug, endRef, enabled]);
}

// How far through the article the viewport is: 0 with the article's top at
// the top of the screen, 1 with its end at the bottom.
export function articleProgress(el) {
  const rect = el.getBoundingClientRect();
  const span = rect.height - window.innerHeight;
  if (span <= 0) return rect.top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -rect.top / span));
}

// Scrolls so the reader lands where `progress` left them.
export function scrollToProgress(el, progress, behavior = "smooth") {
  const rect = el.getBoundingClientRect();
  const span = Math.max(0, rect.height - window.innerHeight);
  window.scrollTo({ top: window.scrollY + rect.top + span * progress, behavior });
}

// Remembers the furthest point reached in an unfinished post. Scroll is read
// through a motion value (no React re-renders), and storage is only written
// when progress grows by 5 points, plus once more when the reader leaves.
export function useProgressTracking(slug, articleRef, enabled) {
  const { scrollY } = useScroll();
  const best = useRef(0);
  const saved = useRef(0);

  useEffect(() => {
    best.current = progressStore.load()[slug] ?? 0;
    saved.current = best.current;
  }, [slug]);

  const flush = () => {
    if (best.current >= STARTED_AT && best.current > saved.current) {
      saved.current = best.current;
      saveProgress(slug, Math.round(best.current * 100) / 100);
    }
  };

  useMotionValueEvent(scrollY, "change", () => {
    if (!enabled || !articleRef.current) return;
    const p = articleProgress(articleRef.current);
    if (p <= best.current) return;
    best.current = p;
    if (best.current - saved.current >= 0.05) flush();
  });

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush(); // leaving the post through the app's own links
    };
    // flush reads refs only; re-binding per render isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, enabled]);
}
