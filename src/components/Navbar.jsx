import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import MagneticButton from "./MagneticButton";

const sectionLinks = [
  { name: "About", hash: "#about" },
  { name: "Skills", hash: "#skills" },
  { name: "Experience", hash: "#experience" },
  { name: "Projects", hash: "#projects" },
  { name: "Contact", hash: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg/80 backdrop-blur-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 md:px-8 flex items-center justify-between h-16">
        <a
          href="#hero"
          className="font-heading font-bold text-lg text-text tracking-tight hover:text-accent transition-colors"
        >
          CP<span className="text-accent">.</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5 lg:gap-8">
          {sectionLinks.map((link) => (
            <a
              key={link.name}
              href={isHome ? link.hash : `/${link.hash}`}
              className="text-muted text-sm font-medium hover:text-text transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
          <Link
            to="/blog"
            className={`text-sm font-medium transition-colors duration-200 ${
              location.pathname.startsWith("/blog") ? "text-accent" : "text-muted hover:text-text"
            }`}
          >
            Blog
          </Link>
          <MagneticButton strength={0.25}>
            <a
              href="https://drive.google.com/file/d/1N0feMoS_lJVaWSPMEQ0rEjmC5wttEtzR/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-bg transition-all duration-200 block"
            >
              Resume
            </a>
          </MagneticButton>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-bg/95 backdrop-blur-lg border-b border-border overflow-hidden"
          >
            <div className="flex flex-col px-5 py-4 gap-3">
              {sectionLinks.map((link) => (
                <a
                  key={link.name}
                  href={isHome ? link.hash : `/${link.hash}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-muted text-base font-medium hover:text-text transition-colors py-2"
                >
                  {link.name}
                </a>
              ))}
              <Link
                to="/blog"
                onClick={() => setMobileOpen(false)}
                className={`text-base font-medium transition-colors py-2 ${
                  location.pathname.startsWith("/blog") ? "text-accent" : "text-muted hover:text-text"
                }`}
              >
                Blog
              </Link>
              <a
                href="https://drive.google.com/file/d/1N0feMoS_lJVaWSPMEQ0rEjmC5wttEtzR/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium px-4 py-2 rounded-full border border-accent text-accent text-center hover:bg-accent hover:text-bg transition-all duration-200 mt-2"
              >
                Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
