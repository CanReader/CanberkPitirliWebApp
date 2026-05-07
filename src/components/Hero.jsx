import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { ArrowDown, Github, Linkedin, Twitter } from "lucide-react";
import MagneticButton from "./MagneticButton";

const phrases = [
  "I build game engines from scratch.",
  "I shipped 3 titles on Steam.",
  "I optimize frame times, not just code.",
  "I write CUDA kernels in Rust.",
  "I teach on Udemy, 4.8/5 rated.",
];

function useTypewriter(phrases, typingSpeed = 60, deletingSpeed = 35, pause = 1800) {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const tick = useCallback(() => {
    const current = phrases[phraseIdx];
    if (!deleting) {
      setText(current.slice(0, text.length + 1));
      if (text.length + 1 === current.length) {
        setTimeout(() => setDeleting(true), pause);
        return;
      }
    } else {
      setText(current.slice(0, text.length - 1));
      if (text.length - 1 === 0) {
        setDeleting(false);
        setPhraseIdx((phraseIdx + 1) % phrases.length);
        return;
      }
    }
  }, [text, phraseIdx, deleting, phrases, pause]);

  useEffect(() => {
    const speed = deleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, deleting, typingSpeed, deletingSpeed]);

  return text;
}

const socials = [
  { icon: Github, href: "https://github.com/CanReader", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/bereader/", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/can_reader", label: "X" },
];

export default function Hero() {
  const typed = useTypewriter(phrases);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-center pt-16"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #34D399 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gradient glow — clamped to viewport */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(600px,90vw)] h-[min(600px,90vw)] bg-accent/5 rounded-full blur-[120px] -z-10" />

      <div className="flex flex-col-reverse lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-mono text-accent text-xs sm:text-sm mb-3 sm:mb-4 tracking-wider"
          >
            SOFTWARE DEVELOPER
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-text leading-[1.1] mb-4 sm:mb-6"
          >
            Canberk
            <br />
            <span className="text-gradient">Pitirli</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-6 sm:mb-8"
          >
            <p className="font-mono text-base sm:text-lg md:text-xl text-text min-h-[1.75rem] sm:min-h-[2rem]">
              {typed}
              <span className="inline-block w-[2px] h-4 sm:h-5 bg-accent ml-0.5 align-middle animate-pulse" />
            </p>
            <p className="text-muted text-sm sm:text-base max-w-lg mt-2 sm:mt-3 leading-relaxed mx-auto lg:mx-0">
              Specializing in C++, Rust, and real-time applications.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-center lg:justify-start gap-5"
          >
            {socials.map((s) => (
              <MagneticButton key={s.label} strength={0.4}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-muted hover:text-accent transition-colors duration-200 block p-2 sm:p-1"
                >
                  <s.icon size={22} className="sm:w-5 sm:h-5" />
                </a>
              </MagneticButton>
            ))}
          </motion.div>
        </div>

        {/* Profile image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative flex-shrink-0"
          style={{ perspective: 800 }}
        >
          <motion.div
            className="relative w-52 h-52 sm:w-72 sm:h-72 lg:w-[22rem] lg:h-[22rem]"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            whileHover={{ rotateX: 8, rotateY: -8, scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Animated ring */}
            <motion.div
              className="absolute inset-0 rounded-full p-[2px]"
              style={{
                background:
                  "conic-gradient(from 0deg, #34D399, #065F46, #34D399, #065F46, #34D399)",
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full bg-bg" />
            </motion.div>
            {/* Glow pulse */}
            <motion.div
              className="absolute -inset-3 rounded-full bg-accent/10 blur-xl -z-10"
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            {/* Clip container */}
            <div className="absolute inset-2 rounded-full overflow-hidden">
              <img
                src="/images/Profile2.1.webp"
                alt="Canberk Pitirli"
                className="w-full h-full object-cover object-[center_15%] scale-[1.35]"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 text-muted hover:text-accent transition-colors"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown size={20} />
        </motion.div>
      </motion.a>
    </section>
  );
}
