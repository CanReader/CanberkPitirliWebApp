import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { posts } from "../data/posts";

function readingTime(content) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PostCard({ post, index, inView }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0, over: false });
  const cardRef = useRef(null);
  const num = String(index + 1).padStart(2, "0");

  const onMove = (e) => {
    const r = cardRef.current.getBoundingClientRect();
    setMouse({ x: e.clientX - r.left, y: e.clientY - r.top, over: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1, ease: [0.25, 0.4, 0.25, 1] }}
      className="shrink-0 w-[340px]"
    >
      <Link to={`/blog/${post.slug}`} className="block h-full group">
        <div
          ref={cardRef}
          onMouseMove={onMove}
          onMouseLeave={() => setMouse((m) => ({ ...m, over: false }))}
          className="relative flex flex-col h-full bg-surface border border-border rounded-xl overflow-hidden
                     transition-all duration-300
                     group-hover:border-accent/40
                     group-hover:-translate-y-1.5
                     group-hover:shadow-[0_12px_48px_rgba(52,211,153,0.08)]"
        >
          {/* Spotlight */}
          <div
            className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
            style={{
              opacity: mouse.over ? 1 : 0,
              background: `radial-gradient(320px circle at ${mouse.x}px ${mouse.y}px, rgba(52,211,153,0.06), transparent 70%)`,
            }}
          />

          {/* Terminal chrome header */}
          <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg/40">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 group-hover:bg-red-500/70 transition-colors duration-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 group-hover:bg-yellow-500/70 transition-colors duration-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 group-hover:bg-accent/70 transition-colors duration-300" />
            </div>
            <span className="font-mono text-[10px] text-muted/60 tracking-wider">
              post_{num}.md
            </span>
          </div>

          {/* Card body */}
          <div className="relative z-10 flex flex-col flex-1 p-5">
            {/* Number + tags row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 leading-none py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="font-mono text-4xl font-bold text-border/50 leading-none ml-3 shrink-0 group-hover:text-accent/15 transition-colors duration-300">
                {num}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-heading font-bold text-base text-text leading-snug mb-3 group-hover:text-accent transition-colors duration-300">
              {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-muted text-xs leading-relaxed line-clamp-3 mb-5 flex-1">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-[11px] text-muted pt-3 border-t border-border/60">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {readingTime(post.content)} min
              </span>
              <span className="ml-auto flex items-center gap-0.5 text-accent font-mono font-medium text-[11px] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                Read <ArrowRight size={11} />
              </span>
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/70 to-transparent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function BlogPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  if (posts.length === 0) return null;

  return (
    <section ref={ref} className="py-16 sm:py-24 lg:py-32 relative">
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(52,211,153,0.10) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between mb-8 gap-4"
      >
        <div>
          <p className="font-mono text-accent text-xs tracking-wider mb-2">// WRITING</p>
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-text whitespace-nowrap">
              From the Blog
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex-1 h-px bg-gradient-to-r from-border to-transparent origin-left hidden sm:block"
            />
          </div>
        </div>

        <Link
          to="/blog"
          className="shrink-0 group flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors duration-200 font-medium"
        >
          View all
          <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </motion.div>

      {/* Horizontal row */}
      <div
        className="flex justify-center gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} index={i} inView={inView} />
        ))}
      </div>
    </section>
  );
}
