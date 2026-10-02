import { useState, useEffect, useMemo, useRef, useCallback, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { useParams, Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  List,
  Link as LinkIcon,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { posts, topicPath, seriesForPost, nextInSeries, seriesUrl } from "../data/posts";
import { site } from "../data/siteConfig";
import {
  formatDate,
  slugifyHeading,
  extractHeadings,
  coverImage,
} from "../lib/blogUtils";
import Navbar from "../components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import Seo from "../components/Seo";
import BackToTop from "../components/BackToTop";
import Reveal, { EASE_OUT, staggerParent, fadeUpChild } from "../components/Reveal";
import { KineticText, Tilt, WipeReveal, ReadCheck, ProgressRing, LiveRing } from "../components/BlogMotion";
import {
  useReadPosts,
  useReadingProgress,
  useFinishTracking,
  useProgressTracking,
  markUnread,
  scrollToProgress,
  articleProgress,
  STARTED_AT,
} from "../lib/readPosts";
import NotFound from "./NotFound";
import { trackEvent } from "../lib/analytics";
import { usePostContent, prefetchPost } from "../lib/postContent";

// Syntax highlighting is heavy; load it only for posts that contain code.
const CodeBlock = lazy(() => import("../components/CodeBlock"));

// Layout: every article element sits in a centered reading column
// (`.article-grid`, see index.css). Diagrams, code, and tables add the
// `wide` class to break out of it, since their detail needs the room.

function nodeText(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(nodeText).join("");
  if (children?.props?.children) return nodeText(children.props.children);
  return "";
}

/* ── Article elements ── */

// Copy-style icon that flips to a check for a moment after the action works.
function SwapIcon({ on, size, idle: Idle = Copy }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={on ? "done" : "idle"}
          initial={{ opacity: 0, scale: 0.4, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.4, rotate: 45 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute inset-0 inline-flex"
        >
          {on ? <Check size={size} className="text-accent" /> : <Idle size={size} />}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          trackEvent("code_copy", { page: window.location.pathname });
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      aria-label={copied ? "Copied" : "Copy code"}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 font-sans text-xs text-muted transition-colors hover:bg-white/5 hover:text-text"
    >
      <SwapIcon on={copied} size={13} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const LANGUAGE_NAMES = {
  cpp: "C++",
  c: "C",
  csharp: "C#",
  cs: "C#",
  hlsl: "HLSL",
  glsl: "GLSL",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  py: "Python",
  python: "Python",
  rust: "Rust",
  go: "Go",
  java: "Java",
  bash: "Shell",
  sh: "Shell",
  shell: "Shell",
  cmake: "CMake",
  json: "JSON",
  kotlin: "Kotlin",
};

function CodeFigure({ language, code }) {
  return (
    <Reveal className="wide group/code my-10 overflow-hidden rounded-xl border border-border bg-[#0f0f12]">
      <div className="flex items-center justify-between border-b border-border/70 py-1.5 pl-4 pr-2">
        <span className="font-sans text-xs text-muted">
          {language ? LANGUAGE_NAMES[language] ?? language : "Code"}
        </span>
        <CopyButton text={code} />
      </div>
      {language ? (
        <Suspense fallback={<PlainCode code={code} />}>
          <CodeBlock language={language} code={code} />
        </Suspense>
      ) : (
        <PlainCode code={code} />
      )}
    </Reveal>
  );
}

function PlainCode({ code }) {
  return (
    <pre className="overflow-x-auto px-5 py-4 font-mono text-[0.875rem] leading-[1.7] text-zinc-300">
      {code}
    </pre>
  );
}

// Diagrams are detailed; clicking one opens it full screen. The overlay
// grows out of the page so it's clear where the image came from.
function ZoomableImage({ src, alt }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      root.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open, close]);

  return (
    <figure className="wide my-12">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="group/img block w-full cursor-zoom-in rounded-xl"
        aria-label={alt ? `Enlarge image: ${alt}` : "Enlarge image"}
      >
        <WipeReveal className="mx-auto w-fit max-w-full">
          <img
            src={src}
            alt={alt || ""}
            loading="lazy"
            decoding="async"
            className="block h-auto max-w-full rounded-xl border border-border transition-[border-color,transform] duration-500 ease-out group-hover/img:border-muted/40 motion-safe:group-hover/img:scale-[1.005]"
          />
        </WipeReveal>
      </button>
      {alt && (
        <figcaption className="mx-auto mt-4 max-w-[40rem] text-center font-sans text-sm leading-relaxed text-muted">
          {alt}
        </figcaption>
      )}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={alt || "Image"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.25 }}
              onClick={close}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-bg/90 p-4 backdrop-blur-sm md:p-10"
            >
              <motion.img
                src={src}
                alt={alt || ""}
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                transition={{ type: "spring", stiffness: 260, damping: 28 }}
                className="max-h-full max-w-full cursor-zoom-out rounded-lg object-contain"
              />
              <motion.button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 26, delay: 0.05 }}
                className="fixed right-4 top-4 rounded-full border border-border bg-surface p-2 text-muted transition-colors hover:text-text"
              >
                <X size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </figure>
  );
}

function Heading({ as: Tag, children, className }) {
  const id = slugifyHeading(nodeText(children));
  return (
    <Reveal as={Tag} y={10} id={id} className={`group relative scroll-mt-28 ${className}`}>
      <a
        href={`#${id}`}
        aria-label="Link to this section"
        className="absolute -left-8 top-1/2 hidden -translate-y-1/2 p-1 text-muted opacity-0 transition-opacity hover:text-accent focus-visible:opacity-100 group-hover:opacity-100 md:block"
      >
        <LinkIcon size={16} />
      </a>
      {children}
    </Reveal>
  );
}

const mdComponents = {
  h1: ({ children }) => (
    <Heading as="h2" className="mb-5 mt-14 font-heading text-[1.75rem] font-semibold leading-snug tracking-tight text-text">
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <Heading as="h2" className="mb-5 mt-14 font-heading text-[1.6rem] font-semibold leading-snug tracking-tight text-text md:text-[1.75rem]">
      {children}
    </Heading>
  ),
  h3: ({ children }) => (
    <Heading as="h3" className="mb-3 mt-10 font-heading text-[1.25rem] font-semibold leading-snug text-text md:text-[1.35rem]">
      {children}
    </Heading>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-8 font-heading text-lg font-semibold text-text">{children}</h4>
  ),
  p: ({ children, node }) => {
    const onlyImage =
      node.children.length === 1 &&
      node.children[0].type === "element" &&
      node.children[0].tagName === "img";
    if (onlyImage) return <>{children}</>;
    return <p className="mb-7">{children}</p>;
  },
  img: ({ src, alt }) => <ZoomableImage src={src} alt={alt} />,
  a: ({ href = "", children }) => {
    const cls =
      "text-accent underline decoration-accent/35 decoration-1 underline-offset-[5px] transition-colors hover:decoration-accent";
    // Links to other pages on this site stay in the same tab.
    if (href.startsWith("/")) {
      return <Link to={href} className={cls}>{children}</Link>;
    }
    if (href.startsWith("#")) {
      return <a href={href} className={cls}>{children}</a>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ul className="mb-7 space-y-2.5 pl-6 marker:text-accent [list-style-type:'▸_']">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-7 list-decimal space-y-2.5 pl-7 marker:font-sans marker:text-[0.9em] marker:text-muted">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1.5">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-10 border-l-2 border-accent pl-6 text-[1.2rem] italic leading-relaxed text-zinc-200 [&>p:last-child]:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr aria-hidden="true" className="mx-auto my-14 w-16 border-zinc-700" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-zinc-100">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
  table: ({ children }) => (
    <Reveal className="wide my-10 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse font-sans text-[0.925rem]">{children}</table>
    </Reveal>
  ),
  thead: ({ children }) => <thead className="bg-surface/70">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border/70 last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="whitespace-nowrap px-4 py-3 text-left font-heading font-semibold text-text">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 align-top leading-relaxed text-zinc-300">{children}</td>
  ),
  // Fenced blocks arrive as <pre><code class="language-x">. Render the whole
  // block here so blocks without a language still get the code styling.
  pre: ({ children }) => {
    const child = Array.isArray(children) ? children[0] : children;
    const className = child?.props?.className ?? "";
    const language = /language-([\w+#-]+)/.exec(className)?.[1] ?? null;
    const code = nodeText(child?.props?.children).replace(/\n$/, "");
    return <CodeFigure language={language} code={code} />;
  },
  code: ({ children }) => (
    <code className="rounded-md border border-border bg-surface px-[0.35em] py-[0.1em] font-mono text-[0.82em] text-zinc-100">
      {children}
    </code>
  ),
};

/* ── Table of contents ── */
function useActiveHeading(headings) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);
  return active;
}

function scrollToHeading(e, id) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
}

// Sits in the right margin next to the reading column, only when the screen
// is wide enough that it never overlaps a wide diagram or code block.
function TocSidebar({ headings, active }) {
  return (
    <nav
      aria-label="Table of contents"
      className="absolute inset-y-0 left-[calc(50%+28rem)] hidden w-52 min-[1360px]:block"
    >
      <div className="sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto pb-6 scrollbar-none">
        <p className="mb-3 font-sans text-sm font-medium text-text">On this page</p>
        <ul className="space-y-0.5 border-l border-border">
          {headings.map((h) => (
            <li key={h.id} className="relative">
              {active === h.id && (
                <motion.span
                  layoutId="toc-marker"
                  aria-hidden="true"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className="absolute -left-px inset-y-0 w-0.5 rounded-full bg-accent"
                />
              )}
              <a
                href={`#${h.id}`}
                onClick={(e) => scrollToHeading(e, h.id)}
                aria-current={active === h.id ? "location" : undefined}
                className={`block py-1 font-sans text-[13px] leading-snug transition-colors duration-300 ${
                  h.depth === 3 ? "pl-6" : "pl-3"
                } ${active === h.id ? "text-text" : "text-muted hover:text-text"}`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function TocMobile({ headings }) {
  return (
    <details className="mb-10 overflow-hidden rounded-xl border border-border bg-surface/40 font-sans min-[1360px]:hidden">
      <summary className="flex cursor-pointer select-none items-center gap-2 px-4 py-3 text-sm text-muted transition-colors hover:text-text">
        <List size={14} className="text-accent" />
        On this page
      </summary>
      <ul className="space-y-1.5 px-4 pb-4">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => scrollToHeading(e, h.id)}
              className={`block py-0.5 text-sm text-muted transition-colors hover:text-accent ${
                h.depth === 3 ? "pl-4" : ""
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ── Series, prev / next, related ── */
function SeriesNav({ current }) {
  const readPosts = useReadPosts();
  const at = seriesForPost(current.slug);
  if (!at) return null;
  const { leaf, path, index } = at;
  const parts = leaf.slugs.map((slug) => posts.find((p) => p.slug === slug)).filter(Boolean);
  return (
    <Reveal as="nav" aria-label={`${leaf.title} series`} className="mb-10 rounded-xl border border-border bg-surface/40 p-5 font-sans">
      {/* Where this sub-series sits: C++ Tutorials / C++ Basics */}
      {path.length > 1 && (
        <p className="mb-1.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
          {path.slice(0, -1).map((n) => (
            <span key={n.id} className="contents">
              <Link to={seriesUrl(n.id)} className="transition-colors hover:text-accent">{n.title}</Link>
              <span aria-hidden="true" className="text-border">/</span>
            </span>
          ))}
        </p>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm text-muted">
          Part {index + 1} of {parts.length} in{" "}
          <Link to={seriesUrl(leaf.id)} className="font-medium text-text transition-colors hover:text-accent">
            {leaf.title}
          </Link>
        </p>
        <Link to={seriesUrl(path[0].id)} className="text-xs text-accent hover:underline underline-offset-4">
          {path.length > 1 ? `All of ${path[0].title}` : "Series outline"}
        </Link>
      </div>
      <ol className="mt-3 space-y-1.5">
        {parts.map((p, i) => (
          <li key={p.slug} className="flex items-start gap-3 text-sm leading-snug">
            <span className="w-4 shrink-0 font-mono text-muted">{i + 1}</span>
            {p.slug === current.slug ? (
              <span aria-current="page" className="flex-1 font-medium text-accent">{p.title}</span>
            ) : (
              <Link to={`/blog/${p.slug}`} className="flex-1 text-zinc-300 transition-colors hover:text-accent">
                {p.title}
              </Link>
            )}
            {readPosts[p.slug] && (
              <ReadCheck size={14} draw={false} className="mt-px shrink-0 text-accent" />
            )}
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

// "Next in C++ Basics" at the end of a post, crossing into the next
// sub-series (and saying so) when this one ends.
function NextInSeries({ current }) {
  const nextSlug = nextInSeries(current.slug);
  const next = nextSlug && posts.find((p) => p.slug === nextSlug);
  if (!next) return null;
  const here = seriesForPost(current.slug);
  const there = seriesForPost(next.slug);
  const label =
    there.leaf.id === here.leaf.id ? `Next in ${here.leaf.title}` : `Up next: ${there.leaf.title}`;
  return (
    <Reveal className="mb-10">
      <Link
        to={`/blog/${next.slug}`}
        onMouseEnter={() => prefetchPost(next.slug)}
        className="group flex items-center justify-between gap-6 rounded-xl border border-border p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/40"
      >
        <span className="min-w-0">
          <span className="mb-1 block text-xs text-muted">{label}</span>
          <span className="font-heading text-lg font-semibold leading-snug text-text transition-colors group-hover:text-accent">
            {next.title}
          </span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent" />
      </Link>
    </Reveal>
  );
}

function NeighborLink({ post, direction }) {
  if (!post) return <div className="hidden sm:block" />;
  const isPrev = direction === "prev";
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block rounded-xl border border-border p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/40 ${
        isPrev ? "sm:text-left" : "sm:text-right"
      }`}
    >
      <span
        className={`mb-2 flex items-center gap-1.5 text-xs text-muted ${
          isPrev ? "" : "sm:justify-end"
        }`}
      >
        {isPrev ? (
          <>
            <ArrowLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-1" /> Previous post
          </>
        ) : (
          <>
            Next post <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </span>
      <span className="font-heading font-semibold leading-snug text-text transition-colors group-hover:text-accent">
        {post.title}
      </span>
    </Link>
  );
}

// Same topic counts most, shared tags break ties, newer wins after that.
function relatedPosts(current, count = 3) {
  return posts
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({
      post: p,
      score:
        (p.category === current.category ? 3 : 0) +
        p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, count)
    .map((r) => r.post);
}

function RelatedPosts({ current }) {
  const related = relatedPosts(current);
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="mt-20">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id="related-heading" className="font-heading text-xl font-semibold text-text">
          Keep reading
        </h2>
        <Link
          to={topicPath(current.category)}
          className="text-sm text-accent hover:underline underline-offset-4"
        >
          All {current.category} posts
        </Link>
      </div>
      <ul className="divide-y divide-border/70 border-t border-border/70">
        {related.map((p, i) => {
          const cover = coverImage(p);
          return (
            <Reveal as="li" delay={i * 0.08} key={p.slug} className="group relative flex items-start gap-5 py-5">
              <div className="min-w-0 flex-1">
                <p className="mb-1.5 text-xs text-muted">
                  <span className="text-accent">{p.category}</span>
                  <span className="mx-2">{formatDate(p.date, { short: true })}</span>
                  {p.readingTime} min read
                </p>
                <h3 className="font-heading font-semibold leading-snug text-text transition-colors group-hover:text-accent">
                  <Link to={`/blog/${p.slug}`} className="after:absolute after:inset-0">
                    {p.title}
                  </Link>
                </h3>
              </div>
              {cover && (
                <Tilt max={10} className="relative hidden shrink-0 sm:block">
                  <Link to={`/blog/${p.slug}`} tabIndex={-1} aria-hidden="true">
                  <img
                    src={cover.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/10] w-32 rounded-md border border-border object-cover"
                  />
                  </Link>
                </Tilt>
              )}
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(window.location.href.split("#")[0]).then(() => {
          setCopied(true);
          trackEvent("post_link_copy", { page: window.location.pathname });
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-muted/50 hover:text-text active:scale-[0.98]"
    >
      <SwapIcon on={copied} size={14} idle={LinkIcon} />
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

// Placeholder shaped like the opening paragraphs while the body chunk loads.
function ArticleSkeleton() {
  const lines = [100, 96, 98, 72, 0, 100, 94, 97, 88, 60];
  return (
    <div aria-hidden="true" className="animate-pulse space-y-4 motion-reduce:animate-none">
      {lines.map((w, i) =>
        w === 0 ? (
          <div key={i} className="h-5" />
        ) : (
          <div key={i} className="h-4 rounded bg-surface" style={{ width: `${w}%` }} />
        )
      )}
    </div>
  );
}

/* ── Page ── */
export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  const { status, content, retry } = usePostContent(slug);

  // Finished-reading state. The check only draws itself if the post wasn't
  // already read when this visit started; a returning reader just sees it.
  const readPosts = useReadPosts();
  const readAt = readPosts[slug];
  const arrival = useRef({ slug: null, read: false });
  if (arrival.current.slug !== slug) arrival.current = { slug, read: Boolean(readAt) };
  const drawCheck = !arrival.current.read;
  const endRef = useRef(null);
  const articleRef = useRef(null);
  const tracking = Boolean(post) && status === "ready" && !readAt;
  useFinishTracking(slug, endRef, post?.readingTime ?? 1, tracking);
  useProgressTracking(slug, articleRef, tracking);
  const progress = useReadingProgress()[slug] ?? 0;
  const started = progress >= STARTED_AT;

  // Live position in the article for the end-of-post ring. A motion value, so
  // scrolling never re-renders the page.
  const { scrollY } = useScroll();
  const live = useMotionValue(0);
  const updateLive = () => articleRef.current && live.set(articleProgress(articleRef.current));
  useMotionValueEvent(scrollY, "change", updateLive);
  useEffect(() => {
    if (status === "ready") updateLive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, slug]);
  const liveText = useTransform(live, (v) =>
    v >= 0.98
      ? "You're at the end. It checks off after a little more reading time."
      : `You're ${Math.round(v * 100)}% of the way through.`
  );
  const headings = useMemo(() => (content ? extractHeadings(content) : []), [content]);
  const active = useActiveHeading(headings);

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [slug]);

  // Links like /blog/post#section can only land once the body has rendered.
  useEffect(() => {
    if (status !== "ready" || !window.location.hash) return;
    const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    el?.scrollIntoView();
  }, [status, slug]);

  if (!post) return <NotFound />;

  const index = posts.findIndex((p) => p.slug === slug);
  const newer = posts[index - 1] ?? null;
  const older = posts[index + 1] ?? null;
  // Known before the body loads, so nothing shifts when it arrives.
  const showToc = post.headingCount >= 3;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    keywords: post.tags.join(", "),
    url: `${site.url}/blog/${post.slug}`,
    author: {
      "@type": "Person",
      name: site.author,
      url: site.url,
    },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={`/og/blog-${post.slug}.png`}
        type="article"
        jsonLd={jsonLd}
      />
      <ScrollProgress />
      <BackToTop showProgress />
      <div className="min-h-[100dvh] bg-bg">
        <Navbar />
        <main id="main" className="pb-28 pt-28 md:pt-36">
          {/* Header */}
          <header className="article-grid">
            <motion.div variants={staggerParent(0.08)} initial="hidden" animate="show">
              <motion.nav variants={fadeUpChild} aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted">
                <Link to="/blog" className="transition-colors hover:text-text">
                  Blog
                </Link>
                <span aria-hidden="true" className="text-border">/</span>
                <Link to={topicPath(post.category)} className="text-accent hover:underline underline-offset-4">
                  {post.category}
                </Link>
              </motion.nav>

              <h1 className="text-balance font-heading text-[2.1rem] font-bold leading-[1.12] tracking-[-0.02em] text-text md:text-[2.9rem]">
                <KineticText text={post.title} delay={0.1} stagger={0.035} />
              </h1>
              <motion.p variants={fadeUpChild} className="mt-6 text-pretty font-serif text-[1.25rem] leading-[1.6] text-zinc-400 md:text-[1.375rem]">
                {post.excerpt}
              </motion.p>

              <motion.div variants={fadeUpChild} className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-y border-border py-5">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/images/Profile2.1.webp"
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-full border border-border bg-surface object-cover object-top"
                  />
                  <div className="text-sm leading-snug">
                    <Link to="/" className="font-medium text-text transition-colors hover:text-accent">
                      {site.author}
                    </Link>
                    <p className="text-muted">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span className="mx-2 text-border" aria-hidden="true">/</span>
                      {post.readingTime} min read
                      <AnimatePresence initial={false}>
                        {!readAt && (
                          <motion.span
                            key="unfinished"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ type: "spring", stiffness: 420, damping: 26 }}
                            className="ml-3 inline-flex items-center gap-1.5 align-middle text-zinc-300"
                            title={
                              started
                                ? `You've read about ${Math.round(progress * 100)}% of this post`
                                : "You haven't finished this post yet"
                            }
                          >
                            <ProgressRing value={started ? progress : 0} size={14} />
                            Unfinished
                            {started && (
                            <button
                              type="button"
                              disabled={status !== "ready"}
                              onClick={() => articleRef.current && scrollToProgress(articleRef.current, progress)}
                              className="ml-1 text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent disabled:opacity-50"
                            >
                              Continue at {Math.round(progress * 100)}%
                            </button>
                            )}
                          </motion.span>
                        )}
                        {readAt && (
                          <motion.span
                            key="read"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            transition={{ type: "spring", stiffness: 420, damping: 26 }}
                            className="ml-3 inline-flex items-center gap-1 align-middle text-accent"
                          >
                            <ReadCheck size={14} draw={drawCheck} />
                            Read
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </p>
                  </div>
                </div>
                <CopyLinkButton />
              </motion.div>
            </motion.div>
          </header>

          {/* Body */}
          <div className="relative mt-12">
            {showToc && <TocSidebar headings={headings} active={active} />}

            <div className="article-grid">
              <div>
                <SeriesNav current={post} />
                {showToc && headings.length > 0 && <TocMobile headings={headings} />}
              </div>
            </div>

            {status === "ready" && (
              <motion.article
                ref={articleRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="article-grid article-body"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={mdComponents}
                >
                  {content}
                </ReactMarkdown>
              </motion.article>
            )}
            {status === "ready" && (
              // Reaching this point is what "finished" means.
              <div ref={endRef} aria-hidden="true" className="h-px" />
            )}
            {status === "loading" && (
              <div className="article-grid">
                <ArticleSkeleton />
              </div>
            )}
            {status === "error" && (
              <div className="article-grid">
                <div role="alert" className="rounded-xl border border-border bg-surface/50 px-6 py-10 text-center">
                  <p className="font-heading text-lg text-text">This post didn't load.</p>
                  <p className="mt-2 text-sm text-muted">Check your connection and try again.</p>
                  <button
                    type="button"
                    onClick={retry}
                    className="mt-6 rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:border-accent/50 active:scale-[0.98]"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* After the article */}
          <footer className="article-grid mt-16">
            <div>
              {/* One card, two states: a ring that fills as you read, then the
                  check that draws itself once the post counts as finished. */}
              <AnimatePresence initial={false} mode="popLayout">
                {readAt ? (
                  <motion.div
                    key="finished"
                    role="status"
                    initial={{ opacity: 0, y: 14, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-accent/30 bg-accent/[0.06] p-5"
                  >
                    <ReadCheck size={36} draw={drawCheck} className="shrink-0 text-accent" />
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-text">You finished this post</p>
                      <p className="text-sm text-muted">
                        {drawCheck
                          ? "It now shows as read on the blog page."
                          : `You read it on ${formatDate(readAt)}.`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        arrival.current.read = false;
                        markUnread(slug);
                      }}
                      className="rounded-lg px-2 py-1 text-sm text-muted transition-colors hover:bg-white/5 hover:text-text"
                    >
                      Mark as unread
                    </button>
                  </motion.div>
                ) : (
                  status === "ready" && (
                    <motion.div
                      key="unfinished"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                      transition={{ type: "spring", stiffness: 260, damping: 24 }}
                      className="mb-10 flex items-center gap-4 rounded-xl border border-border bg-surface/40 p-5"
                    >
                      <LiveRing progress={live} size={36} className="shrink-0 text-zinc-300" />
                      <div className="min-w-0 flex-1">
                        <p className="font-heading font-semibold text-text">Not finished yet</p>
                        <motion.p className="text-sm text-muted">{liveText}</motion.p>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
              <NextInSeries current={post} />
              {post.tags.length > 0 && (
                <Reveal as="ul" className="flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="inline-block rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/50 hover:text-text"
                      >
                        #{tag}
                      </Link>
                    </li>
                  ))}
                </Reveal>
              )}

              <Reveal className="mt-12 flex items-start gap-5 rounded-xl border border-border bg-surface/40 p-6">
                <img
                  src="/images/Profile2.1.webp"
                  alt=""
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-full border border-border bg-surface object-cover object-top"
                />
                <div>
                  <p className="text-sm text-muted">Written by</p>
                  <Link to="/" className="font-heading text-lg font-semibold text-text transition-colors hover:text-accent">
                    {site.author}
                  </Link>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Software developer working on game engines, graphics programming,
                    and systems. I write about what I learn shipping them.
                  </p>
                </div>
              </Reveal>

              <Reveal as="nav" aria-label="More posts" className="mt-8 grid gap-4 sm:grid-cols-2">
                <NeighborLink post={older} direction="prev" />
                <NeighborLink post={newer} direction="next" />
              </Reveal>

              <RelatedPosts current={post} />
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
