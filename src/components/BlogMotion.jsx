import { useEffect, useRef } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { EASE_OUT } from "./Reveal";

// Motion pieces for the blog. Anything that moves with the pointer or the
// scroll position is driven by motion values, never React state, so none of
// it re-renders the page while it runs. Each one checks reduced motion itself
// where the global MotionConfig can't (clip paths, pointer tilt, parallax).

// Words rise into place from behind a mask. Screen readers get the plain
// text once from a visually hidden copy; the animated pieces are hidden.
export function KineticText({ text, delay = 0, stagger = 0.04, className = "" }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        // pb/-mb keeps descenders (g, y, p) from being clipped by the mask.
        <span
          key={i}
          aria-hidden="true"
          className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={reduce ? { opacity: 0 } : { y: "105%" }}
            animate={reduce ? { opacity: 1 } : { y: "0%" }}
            transition={{ duration: 0.8, delay: delay + i * stagger, ease: EASE_OUT }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}

// 3D tilt toward the pointer, mouse only. Springs back when the pointer
// leaves.
export function Tilt({ children, max = 6, className = "" }) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 220, damping: 22 });
  const rotateY = useSpring(ry, { stiffness: 220, damping: 22 });

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry.set(px * max * 2);
        rx.set(-py * max * 2);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

// Counts toward `value` whenever it changes, starting from 0 on first show.
export function AnimatedNumber({ value, className = "" }) {
  const ref = useRef(null);
  const current = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = String(value);
      current.current = value;
      return;
    }
    const controls = animate(current.current, value, {
      duration: 0.9,
      ease: EASE_OUT,
      onUpdate: (v) => {
        current.current = v;
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
    </span>
  );
}

// Uncovers its content top to bottom the first time it scrolls into view,
// with a slight zoom settling back to 1. The in-view check runs on an
// unclipped outer wrapper: a fully clipped element reads as invisible to
// IntersectionObserver in Chrome and would never trigger.
const wipe = {
  hidden: { clipPath: "inset(0% 0% 100% 0% round 12px)", scale: 1.03, opacity: 0.4 },
  show: {
    clipPath: "inset(0% 0% 0% 0% round 12px)",
    scale: 1,
    opacity: 1,
    transition: { duration: 1, ease: EASE_OUT },
  },
};

export function WipeReveal({ children, className = "" }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <motion.div variants={wipe}>{children}</motion.div>
    </motion.div>
  );
}

// A hairline that draws itself from the left when it scrolls into view.
export function DrawLine({ className = "" }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px origin-left bg-border ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: EASE_OUT }}
    />
  );
}

// Moves an image slightly against the scroll direction while its frame
// crosses the viewport. The image is scaled up so the drift never shows an
// edge; the frame must clip (overflow-hidden).
export function useParallax(ref, distance = 24) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  return reduce ? {} : { y, scale: 1.08 };
}

// The "finished reading" mark: a ring that draws itself, then the check
// inside it. With `draw` false it renders already complete (a post read on an
// earlier visit), so only the moment of finishing animates. A plain circle
// and a two-segment stroke, nothing an icon set would do differently.
export function ReadCheck({ size = 20, draw = true, className = "" }) {
  const reduce = useReducedMotion();
  const animateIn = draw && !reduce;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        initial={animateIn ? { pathLength: 0, opacity: 0.3 } : false}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE_OUT }}
        style={{ rotate: -90, transformOrigin: "50% 50%" }}
      />
      <motion.path
        d="M7.5 12.5l3 3 6-6.5"
        initial={animateIn ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: animateIn ? 0.55 : 0, ease: EASE_OUT }}
      />
    </svg>
  );
}

// Partial ring for an unfinished post: a faint full track with the part
// already read drawn over it. Same geometry as ReadCheck so the two read as
// one family (in progress, then done). Fills in from empty on first paint.
export function ProgressRing({ value, size = 14, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle cx="12" cy="12" r="9.5" opacity="0.25" />
      <motion.circle
        cx="12"
        cy="12"
        r="9.5"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: Math.max(0.04, value) }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
      />
    </svg>
  );
}

// ProgressRing driven by a live motion value (0..1), e.g. scroll position.
// Smoothed with a spring; updates never re-render React.
export function LiveRing({ progress, size = 36, className = "" }) {
  const smooth = useSpring(progress, { stiffness: 140, damping: 24 });
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle cx="12" cy="12" r="10" opacity="0.2" />
      <motion.circle cx="12" cy="12" r="10" style={{ pathLength: smooth }} />
    </svg>
  );
}
