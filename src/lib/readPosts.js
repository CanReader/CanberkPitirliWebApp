import { useEffect, useRef, useSyncExternalStore } from "react";

// Which posts this reader has finished, kept in their own browser only
// ({ slug: ISO date }). Storage can be unavailable (private mode, blocked
// site data), so every access is guarded and the blog works without it.
const KEY = "blog:read";
const EVENT = "blog-read-change";

let cache = null;

function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    cache = {};
  }
  return cache;
}

function save(next) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Not persisted, but this page view still reflects it.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function markRead(slug) {
  const current = load();
  if (current[slug]) return;
  save({ ...current, [slug]: new Date().toISOString() });
}

export function markUnread(slug) {
  const { [slug]: _, ...rest } = load();
  save(rest);
}

function subscribe(callback) {
  const onStorage = (e) => {
    if (e.key === KEY) {
      cache = null; // another tab changed it
      callback();
    }
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

// { slug: ISO date } for every finished post. Re-renders on changes from this
// tab or any other.
export function useReadPosts() {
  return useSyncExternalStore(subscribe, load, () => ({}));
}

// Marks `slug` read once the reader reaches `endRef` (the end of the article)
// after spending a fair share of the estimated reading time on the page:
// a quarter of it, capped at a minute. Jumping straight to the bottom
// doesn't count. Time only accrues while the tab is visible.
export function useFinishTracking(slug, endRef, readingTime, enabled) {
  const elapsed = useRef(0);

  useEffect(() => {
    if (!enabled || !endRef.current) return;
    elapsed.current = 0;
    const needed = Math.min(readingTime * 60 * 0.25, 60) * 1000;
    let atEnd = false;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      if (document.visibilityState === "visible") elapsed.current += now - last;
      last = now;
      if (atEnd && elapsed.current >= needed) {
        markRead(slug);
        stop();
      }
    };
    const timer = setInterval(tick, 1000);
    const observer = new IntersectionObserver(([entry]) => {
      atEnd = entry.isIntersecting;
      tick();
    });
    observer.observe(endRef.current);

    function stop() {
      clearInterval(timer);
      observer.disconnect();
    }
    return stop;
  }, [slug, endRef, readingTime, enabled]);
}
