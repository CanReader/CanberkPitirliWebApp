import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { AnimatedNumber } from "./BlogMotion";
import { Burst } from "./Achievement";

// Emoji reactions under posts and series. The emoji are Google's Noto
// Animated Emoji (CC BY 4.0, credited in the site footer), self-hosted in
// public/emoji: a static SVG at
// rest, the Lottie animation while hovered. Counts live in the site's
// database behind public/api/reactions.php; in dev a stand-in serves the same
// API (scripts/vite-plugin-reactions-dev.mjs).

const API = "/api/reactions.php";

// Positive to negative, left to right. Keep in sync with EMOJI in
// public/api/reactions.php and the dev stand-in.
export const REACTIONS = [
  { id: "1f60d", label: "Love it" },
  { id: "1f525", label: "Fire" },
  { id: "1f92f", label: "Mind blown" },
  { id: "1f44f", label: "Applause" },
  { id: "1f602", label: "Funny" },
  { id: "1f914", label: "Made me think" },
  { id: "1f928", label: "Not convinced" },
  { id: "1f971", label: "Boring" },
  { id: "1f621", label: "Angry" },
];

// A random id per browser, so each visitor can toggle each emoji once.
function visitorId() {
  try {
    let id = localStorage.getItem("blog:visitor");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("blog:visitor", id);
    }
    return id;
  } catch {
    return "";
  }
}

// Lottie and each animation load on first hover, once.
let lottiePromise = null;
const animationData = new Map();
function loadAnimation(id) {
  lottiePromise ??= import("lottie-web/build/player/lottie_light").then((m) => m.default);
  if (!animationData.has(id)) {
    const p = fetch(`/emoji/${id}.json`).then((r) => {
      if (!r.ok) throw new Error(`emoji ${id}`);
      return r.json();
    });
    p.catch(() => animationData.delete(id));
    animationData.set(id, p);
  }
  return Promise.all([lottiePromise, animationData.get(id)]);
}

function useReactions(target, inView) {
  const [state, setState] = useState({ status: "idle", counts: null, mine: [] });
  const [notice, setNotice] = useState("");
  const visitor = useRef("");
  const started = useRef(false);

  // Load once, when the bar first comes near the screen. A ref rather than
  // the status in the deps: re-running on our own "loading" update would
  // cancel the request that's already in flight.
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    visitor.current = visitorId();
    let cancelled = false;
    setState((s) => ({ ...s, status: "loading" }));
    fetch(`${API}?target=${encodeURIComponent(target)}&visitor=${visitor.current}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => !cancelled && setState({ status: "ready", counts: d.counts, mine: d.mine }))
      .catch(() => !cancelled && setState({ status: "unavailable", counts: null, mine: [] }));
    return () => {
      cancelled = true;
      // Strict Mode unmounts and remounts once in dev; let the remount load.
      started.current = false;
    };
  }, [inView, target]);

  const toggle = useCallback(
    async (emoji) => {
      if (state.status !== "ready" || !visitor.current) return false;
      const on = !state.mine.includes(emoji);
      const before = state;
      // Optimistic: the reader sees their reaction land immediately.
      setState((s) => ({
        ...s,
        mine: on ? [...s.mine, emoji] : s.mine.filter((e) => e !== emoji),
        counts: { ...s.counts, [emoji]: Math.max(0, (s.counts[emoji] ?? 0) + (on ? 1 : -1)) },
      }));
      setNotice("");
      try {
        const r = await fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target, emoji, visitor: visitor.current, on }),
        });
        if (!r.ok) throw r.status;
        const d = await r.json();
        setState({ status: "ready", counts: d.counts, mine: d.mine });
      } catch (status) {
        setState(before);
        setNotice(status === 429 ? "That's a lot of reactions. Give it a minute." : "Couldn't save that. Try again in a moment.");
      }
      return on;
    },
    [state, target]
  );

  return { ...state, toggle, notice };
}

function ReactionButton({ reaction, count, mine, disabled, onToggle }) {
  const reduce = useReducedMotion();
  const holder = useRef(null);
  const anim = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [burst, setBurst] = useState(0);

  const play = useCallback(
    (loop) => {
      if (reduce) return;
      loadAnimation(reaction.id)
        .then(([lottie, data]) => {
          if (!holder.current) return;
          if (!anim.current) {
            anim.current = lottie.loadAnimation({
              container: holder.current,
              renderer: "svg",
              loop,
              autoplay: false,
              animationData: data,
            });
            anim.current.addEventListener("complete", () => setPlaying(false));
          }
          anim.current.loop = loop;
          anim.current.goToAndPlay(0, true);
          setPlaying(true);
        })
        .catch(() => {});
    },
    [reaction.id, reduce]
  );

  const stop = useCallback(() => {
    anim.current?.stop();
    setPlaying(false);
  }, []);

  useEffect(() => () => anim.current?.destroy(), []);

  const label = `${reaction.label}${count ? `, ${count}` : ""}${mine ? ", you reacted" : ""}`;

  return (
    <motion.button
      type="button"
      aria-label={label}
      aria-pressed={mine}
      title={reaction.label}
      disabled={disabled}
      onPointerEnter={(e) => e.pointerType === "mouse" && play(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && stop()}
      onFocus={() => play(true)}
      onBlur={stop}
      onClick={async (e) => {
        const nowOn = await onToggle(reaction.id);
        if (nowOn) setBurst((n) => n + 1);
        // Touch has no hover, so a tap plays the animation once.
        if (e.nativeEvent.pointerType && e.nativeEvent.pointerType !== "mouse") play(false);
      }}
      whileHover={reduce ? undefined : { scale: 1.3, y: -6, zIndex: 10 }}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      className="relative flex h-14 w-14 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-60 sm:h-16 sm:w-16"
    >
      {/* Your own reaction: a soft glow behind the emoji rather than a box. */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-1 rounded-full bg-accent/20 blur-md"
        initial={false}
        animate={{ opacity: mine ? 1 : 0, scale: mine ? 1 : 0.6 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
      />
      {burst > 0 && <Burst key={burst} count={14} radius={48} size={[3, 6]} />}
      <img
        src={`/emoji/${reaction.id}.svg`}
        alt=""
        width={48}
        height={48}
        loading="lazy"
        draggable={false}
        className={`relative h-10 w-10 select-none transition-opacity sm:h-12 sm:w-12 duration-150 ${playing ? "opacity-0" : "opacity-100"}`}
      />
      <span
        ref={holder}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 m-auto h-10 w-10 transition-opacity sm:h-12 sm:w-12 duration-150 ${playing ? "opacity-100" : "opacity-0"}`}
      />
      {count > 0 && (
        <motion.span
          key={mine ? "mine" : "other"}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className={`absolute bottom-0 right-0 flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 font-mono text-[11px] leading-none ${
            mine ? "border-accent bg-accent font-semibold text-bg" : "border-border bg-bg text-zinc-300"
          }`}
        >
          <AnimatedNumber value={count} from={count} />
        </motion.span>
      )}
    </motion.button>
  );
}

export default function Reactions({ target, prompt }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "200px 0px" });
  const { status, counts, mine, toggle, notice } = useReactions(target, inView);

  return (
    <section ref={ref} aria-labelledby={`reactions-${target}`} className="mb-10 text-center">
      <h2 id={`reactions-${target}`} className="mb-4 font-heading text-base font-semibold text-text">
        {prompt}
      </h2>
      <div role="group" aria-label="Reactions" className="mx-auto flex max-w-[22rem] flex-wrap justify-center gap-1 sm:max-w-none sm:gap-1.5">
        {REACTIONS.map((r) => (
          <ReactionButton
            key={r.id}
            reaction={r}
            count={counts?.[r.id] ?? 0}
            mine={mine.includes(r.id)}
            disabled={status === "unavailable"}
            onToggle={toggle}
          />
        ))}
      </div>
      <p className="mt-4 min-h-[1.25rem] text-xs text-muted" aria-live="polite">
        {notice ||
          (status === "unavailable" ? "Reactions aren't available right now." : null)}
      </p>
    </section>
  );
}
