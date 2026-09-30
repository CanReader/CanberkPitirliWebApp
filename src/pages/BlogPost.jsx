import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  List,
  Link as LinkIcon,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { posts, topicPath, seriesFor } from "../data/posts";
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
import NotFound from "./NotFound";
import { trackEvent } from "../lib/analytics";
import { usePostContent } from "../lib/postContent";

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
      className="font-heading font-semibold text-2xl md:text-[1.7rem] tracking-tight text-text mt-14 mb-4 scroll-mt-24"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={slugifyHeading(nodeText(children))}
      className="font-heading font-semibold text-xl text-text mt-10 mb-3 scroll-mt-24"
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
    return <p className="text-[1.0625rem] text-zinc-300 leading-[1.8] mb-6">{children}</p>;
  },
  img: ({ src, alt }) => (
    <figure className="my-10">
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        decoding="async"
        className="w-full rounded-xl border border-border object-cover"
      />
      {alt && (
        <figcaption className="text-center text-sm text-muted mt-3">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  a: ({ href = "", children }) => {
    const cls = "text-accent underline decoration-accent/30 underline-offset-[3px] hover:decoration-accent transition-colors";
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
    <ul className="mb-6 space-y-2 pl-5 marker:text-accent [list-style-type:'▸_']">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside mb-6 space-y-2 text-zinc-300">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-[1.0625rem] text-zinc-300 leading-[1.8] pl-1">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-accent pl-5 my-8 text-zinc-300 [&>p]:text-zinc-200">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border my-8" />,
  strong: ({ children }) => (
    <strong className="text-text font-semibold">{children}</strong>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-surface">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border last:border-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="text-left font-heading font-semibold text-text px-4 py-2.5 whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-zinc-300 px-4 py-2.5 align-top">{children}</td>
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
        <p className="text-sm font-medium text-text mb-3">
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

/* ── Series, prev / next, related ── */
function SeriesNav({ current }) {
  const s = seriesFor(current.slug);
  if (!s) return null;
  const parts = s.slugs.map((slug) => posts.find((p) => p.slug === slug)).filter(Boolean);
  const index = parts.findIndex((p) => p.slug === current.slug);
  return (
    <nav aria-label={`${s.title} series`} className="mb-10 rounded-xl border border-border bg-surface/50 p-5">
      <p className="text-sm text-muted">
        Part {index + 1} of {parts.length} in{" "}
        <span className="font-medium text-text">{s.title}</span>
      </p>
      <ol className="mt-3 space-y-1.5">
        {parts.map((p, i) => (
          <li key={p.slug} className="flex gap-3 text-sm">
            <span className="w-4 shrink-0 font-mono text-muted">{i + 1}</span>
            {p.slug === current.slug ? (
              <span aria-current="page" className="font-medium text-accent">{p.title}</span>
            ) : (
              <Link to={`/blog/${p.slug}`} className="text-zinc-300 transition-colors hover:text-accent">
                {p.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function NeighborLink({ post, direction }) {
  if (!post) return <div className="hidden sm:block" />;
  const isPrev = direction === "prev";
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group block py-2 ${isPrev ? "sm:text-left" : "sm:text-right"}`}
    >
      <span
        className={`mb-1.5 flex items-center gap-1.5 text-xs text-muted ${
          isPrev ? "" : "sm:justify-end"
        }`}
      >
        {isPrev ? (
          <>
            <ArrowLeft size={12} /> Previous post
          </>
        ) : (
          <>
            Next post <ArrowRight size={12} />
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
    <section aria-labelledby="related-heading" className="mt-16">
      <div className="mb-2 flex items-baseline justify-between gap-4">
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
      <ul className="divide-y divide-border/70">
        {related.map((p) => {
          const cover = coverImage(p);
          return (
            <li key={p.slug} className="group relative flex items-start gap-5 py-5">
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
                <img
                  src={cover.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="hidden aspect-[16/10] w-32 shrink-0 rounded-md border border-border object-cover sm:block"
                />
              )}
            </li>
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
      className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-text"
    >
      {copied ? <Check size={13} className="text-accent" /> : <LinkIcon size={13} />}
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
          <div key={i} className="h-4" />
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
  // Known before the body loads, so the layout doesn't shift when it arrives.
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
      <div className="min-h-[100dvh] bg-bg">
        <Navbar />
        <main
          id="main"
          className={`mx-auto px-4 sm:px-5 md:px-8 pt-28 pb-24 ${
            showToc ? "max-w-3xl xl:max-w-5xl" : "max-w-3xl"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <header className="mb-10 border-b border-border pb-8 xl:max-w-3xl">
              <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-muted">
                <Link to="/blog" className="transition-colors hover:text-text">
                  Blog
                </Link>
                <span aria-hidden="true">/</span>
                <Link to={topicPath(post.category)} className="text-accent hover:underline underline-offset-4">
                  {post.category}
                </Link>
              </nav>

              <h1 className="font-heading text-3xl font-bold leading-[1.15] tracking-tight text-text md:text-[2.6rem]">
                {post.title}
              </h1>
              <p className="mt-5 max-w-[65ch] text-lg leading-relaxed text-muted">
                {post.excerpt}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="font-medium text-text">{site.author}</span>
                <time dateTime={post.date} className="text-muted">
                  {formatDate(post.date)}
                </time>
                <span className="text-muted">{post.readingTime} min read</span>
                <CopyLinkButton />
              </div>
            </header>

            <div
              className={
                showToc
                  ? "xl:grid xl:grid-cols-[minmax(0,1fr)_210px] xl:gap-12"
                  : ""
              }
            >
              <div className="min-w-0">
                <SeriesNav current={post} />
                {showToc && headings.length > 0 && <TocMobile headings={headings} />}

                {/* Content */}
                {status === "ready" && (
                  <article>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={mdComponents}
                    >
                      {content}
                    </ReactMarkdown>
                  </article>
                )}
                {status === "loading" && <ArticleSkeleton />}
                {status === "error" && (
                  <div role="alert" className="rounded-xl border border-border bg-surface/50 px-6 py-10 text-center">
                    <p className="font-heading text-lg text-text">This post didn't load.</p>
                    <p className="mt-2 text-sm text-muted">
                      Check your connection and try again.
                    </p>
                    <button
                      type="button"
                      onClick={retry}
                      className="mt-6 rounded-lg border border-border px-4 py-2 text-sm text-text transition-colors hover:border-accent/50 active:scale-[0.98]"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
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
                  </ul>
                )}

                {/* Author */}
                <div className="mt-12 flex items-center gap-4 border-y border-border py-6">
                  <img
                    src="/images/Profile2.1.webp"
                    loading="lazy"
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-full border border-border bg-surface object-cover object-top"
                  />
                  <p className="text-sm leading-relaxed text-muted">
                    Written by{" "}
                    <Link to="/" className="font-medium text-text hover:text-accent">
                      {site.author}
                    </Link>
                    , a software developer working on game engines, graphics
                    programming, and systems.
                  </p>
                </div>

                {/* Previous / next */}
                <nav aria-label="More posts" className="mt-8 grid gap-6 sm:grid-cols-2">
                  <NeighborLink post={older} direction="prev" />
                  <NeighborLink post={newer} direction="next" />
                </nav>

                <RelatedPosts current={post} />
              </div>

              {showToc && <TocSidebar headings={headings} active={active} />}
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
