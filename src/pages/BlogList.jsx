import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { posts, categories } from "../data/posts";
import Navbar from "../components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import CursorGlow from "../components/CursorGlow";
import FloatingOrbs from "../components/FloatingOrbs";

function readingTime(content) {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Count posts per category (for the tab badges)
function buildCounts() {
  const counts = { All: posts.length };
  for (const post of posts) {
    counts[post.category] = (counts[post.category] ?? 0) + 1;
  }
  return counts;
}

// Only show tabs that have at least 1 post, or "All"
function visibleCategories(counts) {
  return categories.filter((cat) => cat === "All" || (counts[cat] ?? 0) > 0);
}

// ── Featured hero card ──────────────────────────────────────────────────────
function FeaturedCard({ post }) {
  const mins = readingTime(post.content);
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Link to={`/blog/${post.slug}`} className="block group">
        <div
          className={[
            "relative bg-surface border border-border rounded-2xl p-7 md:p-8",
            "border-l-2 border-l-accent",
            "hover:border-accent/40 hover:shadow-[0_0_24px_0_rgba(52,211,153,0.08)]",
            "transition-all duration-300 hover:-translate-y-0.5",
          ].join(" ")}
        >
          {/* FEATURED badge */}
          <span className="inline-flex items-center font-mono text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/25 mb-4">
            Featured
          </span>

          {/* Category + meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Calendar size={11} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Clock size={11} />
              {mins} min read
            </span>
          </div>

          <h2 className="font-heading font-bold text-2xl md:text-3xl text-text mb-3 leading-snug group-hover:text-accent transition-colors duration-200">
            {post.title}
          </h2>
          <p className="text-muted text-sm leading-relaxed line-clamp-4 mb-5">
            {post.excerpt}
          </p>

          <span className="text-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Read →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

// ── Regular compact card ────────────────────────────────────────────────────
function PostCard({ post, index }) {
  const mins = readingTime(post.content);
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
    >
      <Link to={`/blog/${post.slug}`} className="block group h-full">
        <div
          className={[
            "relative flex flex-col h-full bg-surface border border-border rounded-2xl p-6",
            "hover:border-accent/30 transition-all duration-300 hover:-translate-y-0.5",
            "overflow-hidden",
          ].join(" ")}
        >
          {/* Bottom accent line on hover */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-2xl" />

          {/* Category chip */}
          <span className="inline-flex self-start text-xs font-mono px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 mb-3">
            {post.category}
          </span>

          <h2 className="font-heading font-semibold text-lg text-text mb-2 leading-snug group-hover:text-accent transition-colors duration-200">
            {post.title}
          </h2>
          <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted mt-auto">
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} />
              {mins} min read
            </span>
            <span className="ml-auto text-accent opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              Read →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "All";

  const counts = buildCounts();
  const tabs = visibleCategories(counts);

  // Derive filtered posts
  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  // When "All" is active, split into featured hero + rest
  const featuredPost =
    activeCategory === "All" ? filteredPosts.find((p) => p.featured) : null;
  const gridPosts =
    activeCategory === "All"
      ? filteredPosts.filter((p) => !p.featured)
      : filteredPosts;

  function handleTabClick(cat) {
    if (cat === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  }

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <FloatingOrbs />
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="max-w-4xl mx-auto px-5 md:px-8 pt-28 pb-24">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted text-sm hover:text-text transition-colors mb-8"
            >
              <ArrowLeft size={15} />
              Back to portfolio
            </Link>
            <div className="flex items-center gap-4 mb-3">
              <h1 className="font-heading font-bold text-4xl text-text">Blog</h1>
              <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
            </div>
            <p className="text-muted">
              Thoughts on graphics programming, game dev, and systems design.
            </p>
          </motion.div>

          {/* Category filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-10"
          >
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {tabs.map((cat) => {
                const isActive = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    onClick={() => handleTabClick(cat)}
                    className={[
                      "flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap",
                      isActive
                        ? "bg-accent text-bg font-semibold border-accent"
                        : "bg-surface border-border text-muted hover:text-text hover:border-accent/30",
                    ].join(" ")}
                  >
                    {cat}
                    <span
                      className={[
                        "ml-1.5 text-xs",
                        isActive ? "text-bg/70" : "text-muted/60",
                      ].join(" ")}
                    >
                      ({counts[cat] ?? 0})
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Content */}
          {filteredPosts.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-muted text-center py-16"
            >
              Nothing here yet.
            </motion.p>
          ) : (
            <>
              {/* Featured hero — only when "All" is active */}
              {featuredPost && <FeaturedCard post={featuredPost} />}

              {/* Grid */}
              {gridPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {gridPosts.map((post, i) => (
                    <PostCard key={post.slug} post={post} index={i} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
