import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Search, X } from "lucide-react";
import { posts, topics, topicPath, series } from "../data/posts";
import Navbar from "../components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import Seo from "../components/Seo";
import BackToTop from "../components/BackToTop";
import Reveal, { EASE_OUT, staggerParent, fadeUpChild } from "../components/Reveal";
import { KineticText, Tilt, AnimatedNumber, DrawLine, useParallax, ReadCheck } from "../components/BlogMotion";
import { useReadPosts } from "../lib/readPosts";
import NotFound from "./NotFound";
import usePrefersReducedMotion from "../lib/usePrefersReducedMotion";
import {
  formatDate,
  coverImage,
  scorePost,
  searchSnippet,
} from "../lib/blogUtils";
import { prefetchPost, useSearchIndex } from "../lib/postContent";

const EASE = EASE_OUT;

// Rows shown before "Show older posts" when a list gets long.
const PAGE_SIZE = 12;

const topicCounts = posts.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] ?? 0) + 1;
  return acc;
}, {});

// Tags that appear on at least two posts, most used first.
const popularTags = Object.entries(
  posts.reduce((acc, p) => {
    for (const t of p.tags) acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {})
)
  .filter(([, n]) => n >= 2)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 16)
  .map(([t]) => t);

function groupByYear(list) {
  const groups = [];
  for (const post of list) {
    const year = post.date.slice(0, 4);
    const last = groups[groups.length - 1];
    if (last && last.year === year) last.posts.push(post);
    else groups.push({ year, posts: [post] });
  }
  return groups;
}

// Wraps every search term inside `text` in <mark>.
function Highlight({ text, terms }) {
  if (!terms.length) return text;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = text.split(new RegExp(`(${escaped.join("|")})`, "gi"));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-accent/20 px-0.5 text-text">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

// ── Small pieces ────────────────────────────────────────────────────────────

// Title link that stretches over its whole row, and starts fetching the post
// body as soon as the reader points at it.
function PostLink({ post, children }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      onMouseEnter={() => prefetchPost(post.slug)}
      onFocus={() => prefetchPost(post.slug)}
      onTouchStart={() => prefetchPost(post.slug)}
      className="after:absolute after:inset-0"
    >
      {children}
    </Link>
  );
}

function Meta({ post, className = "" }) {
  const read = Boolean(useReadPosts()[post.slug]);
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${className}`}>
      <Link
        to={topicPath(post.category)}
        className="relative z-10 font-medium text-accent hover:underline underline-offset-4"
      >
        {post.category}
      </Link>
      <time dateTime={post.date} className="text-muted">
        {formatDate(post.date, { short: true })}
      </time>
      <span className="text-muted">{post.readingTime} min read</span>
      {read && (
        <span className="inline-flex items-center gap-1 text-accent" title="You've read this post">
          <ReadCheck size={13} draw={false} />
          Read
        </span>
      )}
    </div>
  );
}

function Cover({ post, className, sizes, eager = false, parallax = false }) {
  const frameRef = useRef(null);
  const drift = useParallax(frameRef, 18);
  const cover = coverImage(post);
  if (!cover) return null;
  return (
    <div
      ref={frameRef}
      className={`overflow-hidden rounded-lg border border-border bg-surface ${className}`}
    >
      <motion.img
        style={parallax ? drift : undefined}
        src={cover.src}
        alt=""
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
    </div>
  );
}

// ── Lead: the featured story plus the latest few ────────────────────────────

function Lead({ lead, latest }) {
  return (
    <section
      aria-label="Featured and latest posts"
      className="grid gap-12 border-b border-border pb-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14"
    >
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
        className="group relative"
      >
        <motion.div
          initial={{ scale: 1.04, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
        >
          <Tilt max={3} className="relative z-10 mb-6">
            <Link to={`/blog/${lead.slug}`} tabIndex={-1} aria-hidden="true" onMouseEnter={() => prefetchPost(lead.slug)}>
              <Cover post={lead} eager parallax className="aspect-[16/9]" />
            </Link>
          </Tilt>
        </motion.div>
        <Meta post={lead} className="mb-3" />
        <h2 className="font-heading text-2xl font-bold leading-tight tracking-tight text-text transition-colors group-hover:text-accent md:text-[2.1rem]">
          <PostLink post={lead}>
            {lead.title}
          </PostLink>
        </h2>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-muted line-clamp-3">
          {lead.excerpt}
        </p>
      </motion.article>

      <div>
        <h2 className="border-b border-border pb-3 text-sm font-medium text-text">
          Latest
        </h2>
        <motion.ol
          variants={staggerParent(0.08, 0.3)}
          initial="hidden"
          animate="show"
          className="divide-y divide-border/70"
        >
          {latest.map((post) => (
            <motion.li variants={fadeUpChild} key={post.slug} className="group relative py-5">
              <Meta post={post} className="mb-2" />
              <h3 className="font-heading text-lg font-semibold leading-snug text-text transition-colors group-hover:text-accent">
                <PostLink post={post}>
                  {post.title}
                </PostLink>
              </h3>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

// ── Archive row ─────────────────────────────────────────────────────────────

function PostRow({ post, query, body, activeTag, onTag, hovered, onHover, delay = 0 }) {
  const hasCover = Boolean(coverImage(post));
  const snippet = query ? searchSnippet(post, query, body) : null;
  const terms = query ? query.toLowerCase().split(/\s+/).filter(Boolean) : [];
  return (
    <Reveal
      as="article"
      y={14}
      delay={delay}
      onMouseEnter={() => onHover(post.slug)}
      className={`group relative grid gap-x-8 py-7 ${
        hasCover ? "sm:grid-cols-[minmax(0,1fr)_200px]" : ""
      }`}
    >
      {/* One highlight shared by all rows; it glides to whichever row the
          pointer is on. */}
      {hovered && (
        <motion.span
          layoutId="row-hover"
          aria-hidden="true"
          transition={{ type: "spring", stiffness: 350, damping: 34 }}
          className="pointer-events-none absolute -inset-x-4 inset-y-1.5 hidden rounded-xl bg-surface/60 md:block"
        />
      )}
      <div className="relative min-w-0">
        <Meta post={post} className="mb-2.5" />
        <h4 className="font-heading text-lg font-semibold leading-snug text-text transition-colors group-hover:text-accent sm:text-xl">
          <PostLink post={post}>
            <Highlight text={post.title} terms={terms} />
            <ArrowUpRight
              size={18}
              aria-hidden="true"
              className="ml-1 inline-block -translate-x-1 translate-y-px align-baseline opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </PostLink>
        </h4>
        {snippet ? (
          <p className="mt-2 max-w-[68ch] text-[0.95rem] leading-relaxed text-muted">
            {snippet.before && "..."}
            <Highlight text={snippet.text} terms={snippet.terms} />
            {snippet.after && "..."}
          </p>
        ) : (
          <p className="mt-2 max-w-[68ch] text-[0.95rem] leading-relaxed text-muted line-clamp-2">
            <Highlight text={post.excerpt} terms={terms} />
          </p>
        )}
        {post.tags.length > 0 && (
          <ul className="mt-3 hidden flex-wrap gap-x-3 gap-y-1 sm:flex">
            {post.tags.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => onTag(t)}
                  className={`relative z-10 font-mono text-xs transition-colors hover:text-text ${
                    t === activeTag ? "text-accent" : "text-muted/70"
                  }`}
                >
                  #{t}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Thumbnails are text-heavy diagrams; too small to read on phones. */}
      {hasCover && (
        // The tilt layer sits above the row's stretched title link, so it
        // links to the post itself (hidden from keyboard and screen readers,
        // which already have the title link).
        <Tilt max={8} className="relative hidden self-start sm:block">
          <Link to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true" onMouseEnter={() => prefetchPost(post.slug)}>
            <Cover post={post} sizes="200px" className="aspect-[16/10]" />
          </Link>
        </Tilt>
      )}
    </Reveal>
  );
}

// ── Sidebar ─────────────────────────────────────────────────────────────────

function TopicLink({ to, label, count, active }) {
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`relative flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors duration-300 ${
        active ? "font-medium text-text" : "text-muted hover:bg-surface/60 hover:text-text"
      }`}
    >
      {/* One highlight shared by every topic, so it slides to the new one. */}
      {active && (
        <motion.span
          layoutId="topic-highlight"
          aria-hidden="true"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="absolute inset-0 rounded-md bg-surface"
        >
          <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />
        </motion.span>
      )}
      <span className="relative">{label}</span>
      <AnimatedNumber value={count} className="relative font-mono text-xs text-muted" />
    </Link>
  );
}

// "You've read 5 of 33": only shown once the reader has finished something.
function ReadingCount() {
  const readPosts = useReadPosts();
  const count = posts.filter((p) => readPosts[p.slug]).length;
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-6 flex items-center gap-2 px-3 text-sm text-muted"
        >
          <ReadCheck size={15} draw={false} className="text-accent" />
          <span>
            You've read <AnimatedNumber value={count} className="text-text" /> of {posts.length}
          </span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function Sidebar({ topic, tag, onTag }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-10">
        <nav aria-label="Topics">
          <ReadingCount />
          <h2 className="mb-2 px-3 text-sm font-medium text-text">Topics</h2>
          <ul className="space-y-0.5">
            <li>
              <TopicLink to="/blog" label="All posts" count={posts.length} active={!topic} />
            </li>
            {topics.map((t) => (
              <li key={t.name}>
                <TopicLink
                  to={topicPath(t.name)}
                  label={t.name}
                  count={topicCounts[t.name] ?? 0}
                  active={topic?.name === t.name}
                />
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Series">
          <h2 className="mb-2 px-3 text-sm font-medium text-text">Series</h2>
          <ul className="space-y-0.5">
            {series.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/blog/${s.slugs[0]}`}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface/60 hover:text-text"
                >
                  <span>{s.title}</span>
                  <span className="font-mono text-xs">{s.slugs.length} parts</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 px-3 text-sm font-medium text-text">Popular tags</h2>
          <ul className="flex flex-wrap gap-1.5 px-3">
            {popularTags.map((t) => (
              <li key={t}>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={() => onTag(t === tag ? "" : t)}
                  aria-pressed={t === tag}
                  className={`rounded-md border px-2 py-1 font-mono text-xs transition-colors ${
                    t === tag
                      ? "border-accent/50 bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-muted/50 hover:text-text"
                  }`}
                >
                  {t}
                </motion.button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function BlogList() {
  const { topic: topicSlug } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const tag = params.get("tag") ?? "";
  const query = params.get("q") ?? "";
  const legacyCategory = params.get("category");
  const reduce = usePrefersReducedMotion();
  const searchRef = useRef(null);
  const archiveRef = useRef(null);
  const [expandedKey, setExpandedKey] = useState(null);
  const [searchTouched, setSearchTouched] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState(null);

  const topic = topicSlug ? topics.find((t) => t.slug === topicSlug) : null;
  const q = query.trim();
  const browsing = !topic && !tag && !q;
  // Post text for full-text search is its own chunk; fetch it once the reader
  // shows intent to search, not on every visit.
  const searchIndex = useSearchIndex(searchTouched || Boolean(q));

  const filtered = useMemo(() => {
    const list = posts
      .filter((p) => (!topic || p.category === topic.name) && (!tag || p.tags.includes(tag)))
      .map((p) => ({ post: p, score: scorePost(p, q, searchIndex?.[p.slug]) }))
      .filter((r) => r.score > 0);
    // Search results are ranked; everything else stays newest first.
    if (q) list.sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date));
    return list.map((r) => r.post);
  }, [topic, tag, q, searchIndex]);

  // "/" focuses search, as on most docs and blog sites.
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target;
      if (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      e.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // The list only animates when a filter changes, not on first paint.
  const listKey = `${topicSlug}|${tag}|${query}`;
  const firstKey = useRef(listKey);
  const animateList = !reduce && listKey !== firstKey.current;

  // Old links used /blog?category=Graphics; send them to the topic page.
  if (legacyCategory) {
    const t = topics.find((x) => x.name === legacyCategory);
    return <Navigate to={t ? topicPath(t.name) : "/blog"} replace />;
  }
  if (topicSlug && !topic) return <NotFound />;

  // The lead needs an illustration to carry the top of the page: a featured
  // post with a cover wins, otherwise the newest post that has one.
  const lead =
    posts.find((p) => p.featured && coverImage(p)) ??
    posts.find((p) => coverImage(p)) ??
    posts[0];
  const latest = posts.filter((p) => p !== lead).slice(0, 4);

  // Search results are ranked, so they are not split by year.
  const expanded = expandedKey === listKey || filtered.length <= PAGE_SIZE + 3;
  const visible = expanded ? filtered : filtered.slice(0, PAGE_SIZE);
  const groups = q ? [{ year: null, posts: visible }] : groupByYear(visible);

  function update(next, { replace = false, scroll = true } = {}) {
    const path = "topic" in next ? (next.topic ? topicPath(next.topic) : "/blog") : topic ? topicPath(topic.name) : "/blog";
    const merged = { tag, q: query, ...next };
    const search = new URLSearchParams(
      Object.entries({ tag: merged.tag, q: merged.q }).filter(([, v]) => v)
    ).toString();
    navigate(search ? `${path}?${search}` : path, { replace });
    if (scroll) {
      // If the list header is above the fold, bring it back into view so the
      // new results are what the reader is looking at.
      requestAnimationFrame(() => {
        const el = archiveRef.current;
        if (el && el.getBoundingClientRect().top < 0) {
          el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }
      });
    }
  }

  const setTag = (t) => update({ tag: t });
  const setQuery = (v) => update({ q: v }, { replace: true, scroll: false });
  const clearAll = () => update({ topic: "", tag: "", q: "" });

  let heading = "All posts";
  if (topic) heading = topic.name;
  else if (tag) heading = `Tagged ${tag}`;
  else if (q) heading = "Search results";

  return (
    <>
      <Seo
        title={topic ? `${topic.name} posts` : "Blog"}
        description={
          topic
            ? `${topic.blurb} Posts by Canberk Pitirli.`
            : "Writing on graphics programming, game development, performance, and systems engineering by Canberk Pitirli."
        }
        path={topic ? topicPath(topic.name) : "/blog"}
      />
      <ScrollProgress />
      <BackToTop />
      <div className="min-h-[100dvh] bg-bg">
        <Navbar />
        <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-5 md:px-8">
          {/* Header */}
          <motion.header
            variants={staggerParent(0.08)}
            initial="hidden"
            animate="show"
            className={browsing ? "mb-12" : "mb-10"}
          >
            <motion.div variants={fadeUpChild}>
              <Link
                to="/"
                className="group mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-text"
              >
                <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
                Portfolio
              </Link>
            </motion.div>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <motion.div variants={fadeUpChild}>
                <h1 className="font-heading text-4xl font-bold tracking-tight text-text md:text-5xl">
                  <Link to="/blog" className="hover:text-text">
                    <KineticText text="Blog" delay={0.05} />
                  </Link>
                </h1>
                <p className="mt-3 max-w-[56ch] leading-relaxed text-muted">
                  Graphics programming, game development, and systems work, written
                  up from real projects.
                </p>
              </motion.div>

              <motion.div variants={fadeUpChild} className="w-full lg:max-w-sm">
                <label htmlFor="blog-search" className="sr-only">
                  Search posts
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    ref={searchRef}
                    id="blog-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSearchTouched(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setQuery("");
                        e.currentTarget.blur();
                      }
                    }}
                    placeholder="Search all posts"
                    autoComplete="off"
                    className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text placeholder:text-muted/80 transition-colors focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 [&::-webkit-search-cancel-button]:hidden"
                  />
                  {/* The "/" hint turns into a clear button once there's a query. */}
                  <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center">
                    <AnimatePresence initial={false} mode="popLayout">
                      {query ? (
                        <motion.button
                          key="clear"
                          type="button"
                          onClick={() => setQuery("")}
                          aria-label="Clear search"
                          initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="rounded p-1 text-muted hover:text-text"
                        >
                          <X size={14} />
                        </motion.button>
                      ) : (
                        <motion.kbd
                          key="hint"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="pointer-events-none mr-0.5 hidden rounded border border-border px-1.5 font-mono text-[11px] text-muted sm:block"
                        >
                          /
                        </motion.kbd>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.header>

          {browsing && <Lead lead={lead} latest={latest} />}

          <div className={`grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14 ${browsing ? "pt-12" : ""}`}>
            <Sidebar topic={topic} tag={tag} onTag={setTag} />

            <section ref={archiveRef} aria-labelledby="archive-heading" className="min-w-0 scroll-mt-24">
              {/* Topic chips: the sidebar's job on small screens */}
              <nav
                aria-label="Topics"
                className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none lg:hidden"
              >
                {[null, ...topics].map((t) => {
                  const active = (topic?.name ?? null) === (t?.name ?? null);
                  return (
                    <Link
                      key={t?.slug ?? "all"}
                      to={t ? topicPath(t.name) : "/blog"}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-300 ${
                        active
                          ? "border-accent font-medium text-bg"
                          : "border-border text-muted hover:text-text"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="topic-chip"
                          aria-hidden="true"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute -inset-px rounded-full bg-accent"
                        />
                      )}
                      <span className="relative">{t ? t.name : "All"}</span>
                      <span className={`relative ml-1.5 font-mono text-xs ${active ? "text-bg/70" : "text-muted/70"}`}>
                        <AnimatedNumber value={t ? topicCounts[t.name] ?? 0 : posts.length} />
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-border pb-5">
                <div>
                  <h2 id="archive-heading" className="font-heading text-2xl font-bold tracking-tight text-text">
                    {heading}
                  </h2>
                  {topic && (
                    <p className="mt-1.5 max-w-[60ch] text-sm leading-relaxed text-muted">
                      {topic.blurb}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted" aria-live="polite">
                    <AnimatedNumber value={filtered.length} /> {filtered.length === 1 ? "post" : "posts"}
                    {q && (
                      <>
                        {" "}matching <span className="text-text">{q}</span>
                        {!searchIndex && <span className="text-muted">, searching post text...</span>}
                      </>
                    )}
                  </span>
                  {!browsing && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-accent hover:underline underline-offset-4"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* Active tag on small screens, where the tag list is hidden */}
              {tag && (
                <div className="mt-4 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setTag("")}
                    className="inline-flex items-center gap-1.5 rounded-md border border-accent/50 bg-accent/10 px-2 py-1 font-mono text-xs text-accent"
                  >
                    #{tag}
                    <X size={12} />
                  </button>
                </div>
              )}

              <motion.div
                key={listKey}
                initial={animateList ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="py-20 text-center"
                  >
                    <p className="font-heading text-lg text-text">No posts match that.</p>
                    <p className="mt-2 text-sm text-muted">
                      Try a broader term, or browse by topic instead.
                    </p>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="mt-6 rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:border-accent/50 active:scale-[0.98]"
                    >
                      Show all posts
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div onMouseLeave={() => setHoveredSlug(null)}>
                      {groups.map((g, i) => (
                        <div key={g.year ?? "results"}>
                          {g.year && (
                            <h3 className={`flex items-center gap-4 font-mono text-sm text-muted ${i === 0 ? "pt-8" : "pt-12"}`}>
                              {g.year}
                              <DrawLine className="flex-1" />
                            </h3>
                          )}
                          <div className="divide-y divide-border/70">
                            {g.posts.map((post) => (
                              <PostRow
                                key={post.slug}
                                post={post}
                                query={q}
                                body={searchIndex?.[post.slug]}
                                activeTag={tag}
                                onTag={setTag}
                                hovered={hoveredSlug === post.slug}
                                onHover={setHoveredSlug}
                                // After a filter change, the first rows cascade in.
                                delay={animateList ? Math.min(visible.indexOf(post), 6) * 0.06 : 0}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!expanded && (
                      <div className="border-t border-border/70 pt-8 text-center">
                        <motion.button
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          type="button"
                          onClick={() => setExpandedKey(listKey)}
                          className="rounded-lg border border-border px-5 py-2.5 text-sm text-text transition-colors hover:border-accent/50 active:scale-[0.98]"
                        >
                          Show {filtered.length - PAGE_SIZE} older posts
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
