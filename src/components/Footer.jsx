import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Github, Linkedin, Twitter } from "lucide-react";
import MagneticButton from "./MagneticButton";

const socials = [
  { icon: Github, href: "https://github.com/CanReader", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/bereader/", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/can_reader", label: "X" },
];

const links = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer className="border-t border-border mt-10" ref={ref}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-between gap-8"
        >
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center md:text-left"
          >
            <a
              href="#hero"
              className="font-heading font-bold text-lg text-text tracking-tight"
            >
              CP<span className="text-accent">.</span>
            </a>
            <p className="text-muted text-sm mt-2 max-w-xs">
              Software developer focused on game engines, graphics programming, and systems engineering.
            </p>
          </motion.div>

          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted text-sm hover:text-text transition-colors"
              >
                {link.name}
              </a>
            ))}
          </motion.nav>

          {/* Socials */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-4"
          >
            {socials.map((s) => (
              <MagneticButton key={s.label} strength={0.4}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-muted hover:text-accent transition-colors block p-1"
                >
                  <s.icon size={18} />
                </a>
              </MagneticButton>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-border mt-8 pt-6 text-center"
        >
          <p className="text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} Canberk Pitirli
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
