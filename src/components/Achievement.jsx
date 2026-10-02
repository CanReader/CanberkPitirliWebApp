import { forwardRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";
import { posts, seriesForPost, seriesSlugs, seriesUrl } from "../data/posts";
import { ReadCheck, KineticText, AnimatedNumber } from "./BlogMotion";
import { EASE_OUT } from "./Reveal";

// The "you finished it" moment. When `celebrate` is on (the post was just
// finished on this visit) the check draws, pops, and throws a burst of
// sparks, the card glows once, the read count ticks up, and the series
// progress fills its new step. Finishing a whole series gets a trophy and a
// bigger burst. Returning readers see the same card at rest.

const ACCENT = "#34D399";

// Sparks flying out from the centre of the parent (which must be
// `relative`). Positions are fixed per mount; nothing loops.
export function Burst({ count = 14, radius = 44, delay = 0, size = [3, 6] }) {
  const reduce = useReducedMotion();
  const sparks = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = radius * (0.7 + Math.random() * 0.5);
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          d: size[0] + Math.random() * (size[1] - size[0]),
          color: i % 3 === 0 ? "#e4e4e7" : ACCENT,
          extra: Math.random() * 0.12,
        };
      }),
    // Primitive deps: a new `size` array each render must not re-roll sparks
    // mid-flight.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, radius, size[0], size[1]]
  );
  if (reduce) return null;
  return (
    <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2">
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{ width: s.d, height: s.d, marginLeft: -s.d / 2, marginTop: -s.d / 2, background: s.color }}
          initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
          animate={{ x: s.x, y: s.y, scale: [0.4, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.85, delay: delay + s.extra, ease: EASE_OUT, times: [0, 0.35, 1] }}
        />
      ))}
    </span>
  );
}

// One step per part of a series; read parts are filled. With `fresh`, that
// part's step fills in left to right as part of the celebration.
// With `onView`, every read step fills in one after another the first time
// the row scrolls into view (series pages).
export function SeriesSteps({ slugs, readPosts, fresh, delay = 0, onView = false, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <ol className={`flex gap-1.5 ${className}`} aria-hidden="true">
      {slugs.map((slug, i) => {
        const isRead = Boolean(readPosts[slug]);
        const animateIn = !reduce && isRead && (onView || slug === fresh);
        const fill = { scaleX: 1, transition: { duration: 0.6, delay: onView ? 0.15 + i * 0.08 : delay, ease: EASE_OUT } };
        return (
          <li key={slug} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            {isRead && (
              <motion.span
                className="absolute inset-0 origin-left rounded-full bg-accent"
                initial={animateIn ? { scaleX: 0 } : false}
                {...(onView ? { whileInView: fill, viewport: { once: true } } : { animate: fill })}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SeriesProgress({ slug, readPosts, celebrate }) {
  const at = seriesForPost(slug);
  if (!at) return null;
  const { leaf, root } = at;
  const leafSlugs = leaf.slugs;
  const leafDone = leafSlugs.every((s) => readPosts[s]);
  const rootSlugs = seriesSlugs(root);
  const rootDone = root !== leaf && rootSlugs.every((s) => readPosts[s]);
  const doneCount = leafSlugs.filter((s) => readPosts[s]).length;

  if (leafDone) {
    return (
      <div className="mt-5 flex items-center gap-4 border-t border-accent/20 pt-5">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          {celebrate && <Burst count={20} radius={64} delay={1.15} size={[3, 7]} />}
          <motion.span
            className="inline-flex"
            initial={celebrate ? { scale: 0, rotate: -25 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 14, delay: celebrate ? 1.05 : 0 }}
          >
            <Trophy size={20} />
          </motion.span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold text-text">
            {rootDone ? `You completed all of ${root.title}` : `You completed ${leaf.title}`}
          </p>
          <p className="text-sm text-muted">
            {rootDone
              ? `${rootSlugs.length} parts, every section done.`
              : `All ${leafSlugs.length} parts read.`}{" "}
            <Link
              to={seriesUrl(rootDone ? root.id : leaf.id)}
              className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              See the series
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-accent/20 pt-4">
      <div className="mb-2.5 flex items-baseline justify-between gap-4 text-sm">
        <span className="text-muted">
          <span className="text-text">{doneCount}</span> of {leafSlugs.length} in{" "}
          <Link to={seriesUrl(leaf.id)} className="text-text transition-colors hover:text-accent">
            {leaf.title}
          </Link>
        </span>
      </div>
      <SeriesSteps slugs={leafSlugs} readPosts={readPosts} fresh={celebrate ? slug : null} delay={1.05} />
    </div>
  );
}

const GLOW_OFF = "0 0 0 1px rgba(52,211,153,0), 0 0 48px 6px rgba(52,211,153,0)";
const GLOW_ON = "0 0 0 1px rgba(52,211,153,0.45), 0 0 48px 6px rgba(52,211,153,0.24)";

// forwardRef: AnimatePresence's popLayout mode hands its child a ref to
// measure it during the exit animation.
export const FinishCard = forwardRef(function FinishCard(
  { slug, readAt, readPosts, celebrate, onUnread, formatDate },
  ref
) {
  const reduce = useReducedMotion();
  const total = posts.length;
  const readCount = posts.filter((p) => readPosts[p.slug]).length;
  const glow = celebrate && !reduce;

  return (
    <motion.div
      ref={ref}
      key="finished"
      role="status"
      initial={celebrate ? { opacity: 0, y: 18, scale: 0.94 } : { opacity: 0, y: 10 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        // Every keyframe has the same two shadows so the glow can blend; with
        // mismatched shadow lists the browser can't interpolate and it snaps.
        boxShadow: glow ? [GLOW_OFF, GLOW_ON, GLOW_OFF] : GLOW_OFF,
      }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 20,
        // Slow swell and long fade, so it reads as a glow rather than a flash.
        boxShadow: { duration: 4.6, delay: 0.6, times: [0, 0.3, 1], ease: "easeInOut" },
      }}
      className="mb-10 rounded-xl border border-accent/30 bg-accent/[0.06] p-5"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="relative inline-flex shrink-0">
          {celebrate && <Burst delay={0.95} />}
          <motion.span
            className="inline-flex"
            initial={false}
            animate={celebrate && !reduce ? { scale: [1, 1, 1.22, 1] } : { scale: 1 }}
            transition={{ duration: 0.55, delay: 0.75, times: [0, 0.3, 0.6, 1] }}
          >
            <ReadCheck size={36} draw={celebrate} className="text-accent" />
          </motion.span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold text-text">
            {celebrate ? <KineticText text="You finished this post" delay={0.25} stagger={0.06} /> : "You finished this post"}
          </p>
          <p className="text-sm text-muted">
            {celebrate ? (
              <>
                That's <AnimatedNumber value={readCount} from={Math.max(0, readCount - 1)} className="text-text" /> of {total} posts read.
              </>
            ) : (
              `You read it on ${formatDate(readAt)}.`
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onUnread}
          className="rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:bg-white/5 hover:text-text"
        >
          Mark as unread
        </button>
      </div>
      <SeriesProgress slug={slug} readPosts={readPosts} celebrate={celebrate} />
    </motion.div>
  );
});
