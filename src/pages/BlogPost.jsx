import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Copy,
  Check,
  List,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { posts } from "../data/posts";
import { site } from "../data/siteConfig";
import {
  readingTime,
  formatDate,
  slugifyHeading,
  extractHeadings,
} from "../lib/blogUtils";
import Navbar from "../components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import CursorGlow from "../components/CursorGlow";
import FloatingOrbs from "../components/FloatingOrbs";
import Seo from "../components/Seo";
import NotFound from "./NotFound";
import { trackEvent } from "../lib/analytics";

// Syntax highlighting is heavy; load it only for posts that contain code.
const CodeBlock = lazy(() => import("../components/CodeBlock"));

function nodeText(children) {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(nodeText).join("");
  if (children?.props?.children) return nodeText(children.props.children);
  return "";
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          trackEvent("code_copy", { page: window.location.pathname });
          setTimeout(() => setCopied(false), 1600);
        });
      }}
      aria-label={copied ? "Copied" : "Copy code"}
      className="flex items-center gap-1.5 text-xs font-mono text-muted hover:text-accent transition-colors"
    >
      {copied ? (
        <>
          <Check size={13} className="text-accent" /> copied
        </>
      ) : (
        <>
          <Copy size={13} /> copy
        </>
      )}
    </button>
  );
}

const mdComponents = {
  h1: ({ children }) => (
    <h1 className="font-heading font-bold text-3xl text-text mt-10 mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2
      id={slugifyHeading(nodeText(children))}
      className="font-heading font-semibold text-2xl text-text mt-9 mb-3 pb-2 border-b border-border scroll-mt-24"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={slugifyHeading(nodeText(children))}
      className="font-heading font-semibold text-xl text-text mt-7 mb-2 scroll-mt-24"
    >
      {children}
    </h3>
  ),
  p: ({ children, node }) => {
    const onlyImage =
      node.children.length === 1 &&
      node.children[0].type === "element" &&
      node.children[0].tagName === "img";
    if (onlyImage) return <>{children}</>;
    return <p className="text-muted leading-7 mb-5">{children}</p>;
  },
  img: ({ src, alt }) => (
    <figure className="my-8">
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        decoding="async"
        className="w-full rounded-xl border border-border object-cover"
      />
      {alt && (
        <figcaption className="text-center text-xs text-muted mt-2 font-mono italic">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent hover:underline underline-offset-2"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-none mb-5 space-y-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-5 space-y-2 text-muted">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-muted leading-7 flex gap-2">
      <span className="text-accent mt-2 shrink-0">▸</span>
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent pl-4 my-6 italic text-muted">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border my-8" />,
  strong: ({ children }) => (
    <strong className="text-text font-semibold">{children}</strong>
  ),
  code({ inline, className, children }) {
    const match = /language-(\w+)/.exec(className || "");
    if (!inline && match) {
      const code = String(children).replace(/\n$/, "");
      return (
        <div className="my-6 rounded-xl overflow-hidden border border-border">
          <div className="flex items-center justify-between bg-surface px-4 py-2 text-xs font-mono text-muted border-b border-border">
            <span>{match[1]}</span>
            <CopyButton text={code} />
          </div>
          <Suspense
            fallback={
              <pre className="p-4 overflow-x-auto text-sm font-mono text-muted bg-[#0d0d10]">
                {code}
              </pre>
            }
          >
            <CodeBlock language={match[1]} code={code} />
          </Suspense>
        </div>
      );
    }
    return (
      <code className="font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded text-sm">
        {children}
      </code>
    );
  },
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

function TocSidebar({ headings, active }) {
  return (
    <nav aria-label="Table of contents" className="hidden xl:block">
      <div className="sticky top-28">
        <p className="text-xs font-mono text-muted tracking-wider uppercase mb-3">
          On this page
        </p>
        <ul className="space-y-1.5 border-l border-border">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => scrollToHeading(e, h.id)}
                className={`block text-[13px] leading-snug py-0.5 border-l-2 -ml-px transition-colors ${
                  h.depth === 3 ? "pl-6" : "pl-3"
                } ${
                  active === h.id
                    ? "border-accent text-accent"
                    : "border-transparent text-muted hover:text-text"
                }`}
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
    <details className="xl:hidden mb-8 bg-surface border border-border rounded-xl overflow-hidden group">
      <summary className="flex items-center gap-2 px-4 py-3 text-sm text-muted cursor-pointer select-none hover:text-text transition-colors">
        <List size={14} className="text-accent" />
        On this page
      </summary>
      <ul className="px-4 pb-4 space-y-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => scrollToHeading(e, h.id)}
              className={`block text-sm text-muted hover:text-accent transition-colors py-0.5 ${
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

/* ── Prev / next + related ── */
function NeighborLink({ post, direction }) {
  if (!post) return <div className="flex-1" />;
  const isPrev = direction === "prev";
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`flex-1 group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-colors ${
        isPrev ? "text-left" : "text-right"
      }`}
    >
      <p
        className={`flex items-center gap-1.5 text-xs text-muted font-mono mb-1.5 ${
          isPrev ? "" : "justify-end"
        }`}
      >
        {isPrev ? (
          <>
            <ArrowLeft size={12} /> Older
          </>
        ) : (
          <>
            Newer <ArrowRight size={12} />
          </>
        )}
      </p>
      <p className="text-sm text-text font-medium leading-snug group-hover:text-accent transition-colors line-clamp-2">
        {post.title}
      </p>
    </Link>
  );
}

function RelatedPosts({ current }) {
  const related = posts
    .filter((p) => p.slug !== current.slug && p.category === current.category)
    .slice(0, 3);
  if (related.length === 0) return null;
  return (
    <div className="mt-12">
      <p className="text-xs font-mono text-muted tracking-wider uppercase mb-4">
        More in {current.category}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${p.slug}`}
            className="group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-colors"
          >
            <p className="text-sm text-text font-medium leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
              {p.title}
            </p>
            <p className="text-xs text-muted font-mono">
              {formatDate(p.date, { short: true })} · {readingTime(p.content)} min
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */
export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  const headings = post ? extractHeadings(post.content) : [];
  const active = useActiveHeading(headings);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) return <NotFound />;

  const index = posts.findIndex((p) => p.slug === slug);
  const newer = posts[index - 1] ?? null;
  const older = posts[index + 1] ?? null;
  const showToc = headings.length >= 3;

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
        type="article"
        jsonLd={jsonLd}
      />
      <ScrollProgress />
      <CursorGlow />
      <FloatingOrbs />
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main
          id="main"
          className={`mx-auto px-5 md:px-8 pt-28 pb-24 ${
            showToc ? "max-w-3xl xl:max-w-5xl" : "max-w-3xl"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted text-sm hover:text-text transition-colors mb-10"
            >
              <ArrowLeft size={15} />
              All posts
            </Link>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted mb-10 pb-8 border-b border-border">
              {post.category && (
                <Link
                  to={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="font-mono px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                >
                  {post.category}
                </Link>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {readingTime(post.content)} min read
              </span>
            </div>

            <div
              className={
                showToc
                  ? "xl:grid xl:grid-cols-[minmax(0,1fr)_210px] xl:gap-12"
                  : ""
              }
            >
              <div className="min-w-0">
                {showToc && <TocMobile headings={headings} />}

                {/* Content */}
                <article>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={mdComponents}
                  >
                    {post.content}
                  </ReactMarkdown>
                </article>
              </div>

              {showToc && <TocSidebar headings={headings} active={active} />}
            </div>

            {/* Prev / next */}
            <div className="flex gap-3 mt-16">
              <NeighborLink post={older} direction="prev" />
              <NeighborLink post={newer} direction="next" />
            </div>

            <RelatedPosts current={post} />

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-border">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted text-sm hover:text-text transition-colors"
              >
                <ArrowLeft size={15} />
                Back to all posts
              </Link>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
