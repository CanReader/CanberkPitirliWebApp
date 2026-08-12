// Thin wrapper around gtag. Safe to call anywhere: in dev (or if GA is
// blocked by an ad blocker) events just accumulate in the dataLayer no-op.
export function trackEvent(name, params = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}
