import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { posts, findSeries, seriesSlugs, seriesUrl } from "../data/posts";
import Navbar from "../components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import BackToTop from "../components/BackToTop";
import Seo from "../components/Seo";
import Reveal, { staggerParent, fadeUpChild } from "../components/Reveal";
import { KineticText, ReadCheck, ProgressRing, AnimatedNumber } from "../components/BlogMotion";
import { useReadPosts, useReadingProgress, STARTED_AT } from "../lib/readPosts";
import { prefetchPost } from "../lib/postContent";
import NotFound from "./NotFound";

// A series as a course outline: its own posts first, then each sub-series as
// a section (nested sub-series nest further), every part showing whether the
// reader finished it. Mirrors the reading order used everywhere else.

const bySlug = new Map(posts.map((p) => [p.slug, p]));

function minutes(slugs) {
  return slugs.reduce((sum, s) => sum + (bySlug.get(s)?.readingTime ?? 0), 0);
}

function PartStatus({ slug }) {
  const read = useReadPosts()[slug];
  const progress = useReadingProgress()[slug] ?? 0;
  if (read) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-accent">
        <ReadCheck size={14} draw={false} />
        <span className="hidden sm:inline">Read</span>
      </span>
    );
  }
  const started = progress >= STARTED_AT;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-muted"
      title={started ? `You've read about ${Math.round(progress * 100)}%` : "Not read yet"}
    >
      <ProgressRing value={started ? progress : 0} size={14} className="text-zinc-300" />
      <span className="hidden sm:inline">{started ? `${Math.round(progress * 100)}%` : "Unfinished"}</span>
    </span>
  );
}

function PartList({ slugs }) {
  return (
    <ol className="divide-y divide-border/70">
      {slugs.map((slug, i) => {
        const post = bySlug.get(slug);
        if (!post) return null;
        return (
          <Reveal as="li" key={slug} y={10} delay={Math.min(i, 6) * 0.04} className="group relative">
            <div className="flex items-start gap-4 py-4">
              <span className="w-6 shrink-0 pt-0.5 text-right font-mono text-sm text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-semibold leading-snug text-text transition-colors group-hover:text-accent">
                  <Link
                    to={`/blog/${slug}`}
                    onMouseEnter={() => prefetchPost(slug)}
                    onFocus={() => prefetchPost(slug)}
                    className="after:absolute after:inset-0"
                  >
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-1 text-xs text-muted">{post.readingTime} min read</p>
              </div>
              <div className="relative shrink-0 pt-0.5">
                <PartStatus slug={slug} />
              </div>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );
}

// Sub-series section; recurses for deeper nesting, one heading level down.
function SubSeries({ node, depth }) {
  const slugs = seriesSlugs(node);
  const readPosts = useReadPosts();
  const done = slugs.filter((s) => readPosts[s]).length;
  const Heading = depth === 0 ? "h2" : "h3";
  return (
    <section className={depth === 0 ? "mt-14" : "mt-10 border-l border-border pl-5 sm:pl-6"}>
      <Reveal className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <Heading className={`font-heading font-semibold tracking-tight text-text ${depth === 0 ? "text-xl md:text-2xl" : "text-lg"}`}>
          <Link to={seriesUrl(node.id)} className="transition-colors hover:text-accent">
            {node.title}
          </Link>
        </Heading>
        <span className="text-sm text-muted">
          {done > 0 ? `${done} of ${slugs.length} read` : `${slugs.length} ${slugs.length === 1 ? "part" : "parts"}`}
          <span className="mx-2 text-border" aria-hidden="true">/</span>
          {minutes(slugs)} min
        </span>
      </Reveal>
      {node.description && (
        <p className="mb-3 max-w-[60ch] text-sm leading-relaxed text-muted">{node.description}</p>
      )}
      {node.slugs?.length > 0 && <PartList slugs={node.slugs} />}
      {(node.children ?? []).map((child) => (
        <SubSeries key={child.id} node={child} depth={depth + 1} />
      ))}
    </section>
  );
}

function SiblingLink({ node, direction }) {
  if (!node) return <div className="hidden sm:block" />;
  const prev = direction === "prev";
  return (
    <Link
      to={seriesUrl(node.id)}
      className={`group block rounded-xl border border-border p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/40 ${prev ? "" : "sm:text-right"}`}
    >
      <span className="mb-2 block text-xs text-muted">{prev ? "Previous section" : "Next section"}</span>
      <span className="font-heading font-semibold leading-snug text-text transition-colors group-hover:text-accent">
        {node.title}
      </span>
    </Link>
  );
}

export default function SeriesPage() {
  const { id } = useParams();
  const found = findSeries(id);
  const readPosts = useReadPosts();
  if (!found) return <NotFound />;

  const { node, path } = found;
  const parents = path.slice(0, -1);
  const slugs = seriesSlugs(node).filter((s) => bySlug.has(s));
  const done = slugs.filter((s) => readPosts[s]).length;
  const next = slugs.find((s) => !readPosts[s]);
  const nextPost = next ? bySlug.get(next) : null;
  const finished = slugs.length > 0 && done === slugs.length;
  const siblings = parents.length ? parents[parents.length - 1].children ?? [] : [];
  const at = siblings.findIndex((n) => n.id === node.id);

  let cta = { label: "Start reading", to: `/blog/${slugs[0]}`, hint: bySlug.get(slugs[0])?.title };
  if (finished) cta = { label: "Read it again", to: `/blog/${slugs[0]}`, hint: null };
  else if (done > 0 && nextPost) cta = { label: "Continue", to: `/blog/${next}`, hint: nextPost.title };

  return (
    <>
      <Seo
        title={node.title}
        description={node.description ?? `A ${slugs.length}-part series by Canberk Pitirli.`}
        path={seriesUrl(node.id)}
      />
      <ScrollProgress />
      <BackToTop />
      <div className="min-h-[100dvh] bg-bg">
        <Navbar />
        <main id="main" className="mx-auto max-w-3xl px-4 pb-28 pt-28 sm:px-5 md:px-8 md:pt-36">
          <motion.header variants={staggerParent(0.08)} initial="hidden" animate="show">
            <motion.nav variants={fadeUpChild} aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <Link to="/blog" className="transition-colors hover:text-text">Blog</Link>
              <span aria-hidden="true" className="text-border">/</span>
              <span>Series</span>
              {parents.map((p) => (
                <span key={p.id} className="contents">
                  <span aria-hidden="true" className="text-border">/</span>
                  <Link to={seriesUrl(p.id)} className="text-accent hover:underline underline-offset-4">
                    {p.title}
                  </Link>
                </span>
              ))}
            </motion.nav>

            <h1 className="text-balance font-heading text-[2.1rem] font-bold leading-[1.12] tracking-[-0.02em] text-text md:text-[2.9rem]">
              <KineticText text={node.title} delay={0.1} stagger={0.05} />
            </h1>
            {node.description && (
              <motion.p variants={fadeUpChild} className="mt-6 text-pretty font-serif text-[1.25rem] leading-[1.6] text-zinc-400 md:text-[1.375rem]">
                {node.description}
              </motion.p>
            )}

            <motion.div variants={fadeUpChild} className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-y border-border py-5">
              <div className="flex items-center gap-4">
                {finished ? (
                  <ReadCheck size={40} draw={false} className="shrink-0 text-accent" />
                ) : (
                  <ProgressRing value={slugs.length ? done / slugs.length : 0} size={40} className="shrink-0 text-zinc-300" />
                )}
                <div className="text-sm leading-snug">
                  <p className="font-medium text-text">
                    {finished ? (
                      "You finished this series"
                    ) : done > 0 ? (
                      <>
                        You've read <AnimatedNumber value={done} /> of {slugs.length}
                      </>
                    ) : (
                      `${slugs.length} ${slugs.length === 1 ? "part" : "parts"}`
                    )}
                  </p>
                  <p className="text-muted">
                    {minutes(slugs)} min total
                    {node.children?.length > 0 && (
                      <>
                        <span className="mx-2 text-border" aria-hidden="true">/</span>
                        {node.children.length} {node.children.length === 1 ? "section" : "sections"}
                      </>
                    )}
                  </p>
                </div>
              </div>
              {slugs.length > 0 && (
                <Link
                  to={cta.to}
                  onMouseEnter={() => prefetchPost(cta.to.slice(6))}
                  className="group inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-transform active:scale-[0.98]"
                  title={cta.hint ?? undefined}
                >
                  {cta.label}
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </motion.div>
            {cta.hint && done > 0 && !finished && (
              <motion.p variants={fadeUpChild} className="mt-3 text-sm text-muted">
                Next up: <span className="text-zinc-300">{cta.hint}</span>
              </motion.p>
            )}
          </motion.header>

          <div className="mt-12">
            {node.slugs?.length > 0 && <PartList slugs={node.slugs} />}
            {(node.children ?? []).map((child) => (
              <SubSeries key={child.id} node={child} depth={0} />
            ))}
          </div>

          {siblings.length > 1 && (
            <nav aria-label="Other sections" className="mt-16 grid gap-4 sm:grid-cols-2">
              <SiblingLink node={siblings[at - 1]} direction="prev" />
              <SiblingLink node={siblings[at + 1]} direction="next" />
            </nav>
          )}
        </main>
      </div>
    </>
  );
}
