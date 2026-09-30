import { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowUp } from "lucide-react";

// Appears after the first screen of scrolling. With `showProgress`, a ring
// around the arrow fills as the reader moves through the page. Scroll is read
// through motion values, so React only re-renders when visibility flips.
export default function BackToTop({ showProgress = false }) {
  const [show, setShow] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 500;
    if (next !== show) setShow(next);
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-lg shadow-black/20 transition-colors duration-200 hover:border-accent/40 hover:text-accent"
          aria-label="Back to top"
        >
          {showProgress && (
            <svg
              aria-hidden="true"
              viewBox="0 0 44 44"
              className="pointer-events-none absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] -rotate-90"
            >
              <motion.circle
                cx="22"
                cy="22"
                r="21"
                fill="none"
                stroke="#34D399"
                strokeWidth="2"
                style={{ pathLength: progress }}
              />
            </svg>
          )}
          <ArrowUp size={18} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
