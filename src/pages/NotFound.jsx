import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Terminal } from "lucide-react";
import Navbar from "../components/Navbar";
import FloatingOrbs from "../components/FloatingOrbs";
import Seo from "../components/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="This page does not exist." path="/404" />
      <FloatingOrbs />
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main
          id="main"
          className="max-w-3xl mx-auto px-5 md:px-8 min-h-screen flex flex-col items-center justify-center text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 font-mono text-xs text-muted border border-border rounded-lg px-3 py-2 mb-8 bg-surface">
              <Terminal size={13} className="text-accent" />
              <span>
                $ curl {typeof window !== "undefined" ? window.location.pathname : ""}
              </span>
            </div>

            <p className="font-heading font-bold text-7xl sm:text-8xl text-text mb-2">
              4<span className="text-gradient">0</span>4
            </p>
            <p className="font-mono text-accent text-sm tracking-wider mb-4">
              SEGFAULT: PAGE NOT MAPPED
            </p>
            <p className="text-muted text-sm sm:text-base max-w-md mx-auto mb-10">
              The page you're looking for doesn't exist, was moved, or never
              shipped. Dereferencing it further is undefined behavior.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-accent text-bg font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-emerald-300 transition-colors"
              >
                <ArrowLeft size={15} />
                Back to home
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg border border-border text-muted hover:text-text hover:border-accent/30 transition-colors"
              >
                Read the blog
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
