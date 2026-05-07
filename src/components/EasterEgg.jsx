import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function EasterEgg() {
  const [triggered, setTriggered] = useState(false);
  const seq = useRef([]);

  useEffect(() => {
    const handler = (e) => {
      seq.current.push(e.key);
      seq.current = seq.current.slice(-KONAMI.length);
      if (seq.current.length === KONAMI.length &&
          seq.current.every((k, i) => k === KONAMI[i])) {
        setTriggered(true);
        seq.current = [];
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!triggered) return;
    const timer = setTimeout(() => setTriggered(false), 4000);
    return () => clearTimeout(timer);
  }, [triggered]);

  return (
    <AnimatePresence>
      {triggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        >
          {/* Rain of emojis */}
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute text-2xl sm:text-3xl select-none"
              initial={{
                x: `${Math.random() * 100}vw`,
                y: -40,
                rotate: Math.random() * 360,
                opacity: 1,
              }}
              animate={{
                y: "110vh",
                rotate: Math.random() * 720 - 360,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.8,
                ease: "easeIn",
              }}
              style={{ left: `${Math.random() * 95}%` }}
            >
              {["🎮", "🕹️", "💻", "⚡", "🦀", "🚀", "✨", "🔥"][i % 8]}
            </motion.span>
          ))}

          {/* Center message */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
            className="bg-surface border-2 border-accent rounded-2xl px-8 py-6 text-center shadow-2xl shadow-accent/20 z-10"
          >
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-heading font-bold text-xl text-text">
              You found it!
            </p>
            <p className="text-muted text-sm mt-1">
              +30 secret developer points
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
