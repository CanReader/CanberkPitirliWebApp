import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { posts } from "../data/posts";
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

const mdComponents = {
  h1: ({ children }) => (
    <h1 className="font-heading font-bold text-3xl text-text mt-10 mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-heading font-semibold text-2xl text-text mt-9 mb-3 pb-2 border-b border-border">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-heading font-semibold text-xl text-text mt-7 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-muted leading-7 mb-5">{children}</p>
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
      return (
        <div className="my-6 rounded-xl overflow-hidden border border-border">
          <div className="bg-surface px-4 py-2 text-xs font-mono text-muted border-b border-border">
            {match[1]}
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: "#0d0d10",
              fontSize: "0.85rem",
              lineHeight: "1.6",
            }}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
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

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <FloatingOrbs />
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main className="max-w-3xl mx-auto px-5 md:px-8 pt-28 pb-24">
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

            {/* Content */}
            <article>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {post.content}
              </ReactMarkdown>
            </article>

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
