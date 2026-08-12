import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CircleDot,
  ExternalLink,
  Github,
  Globe,
} from "lucide-react";
import { projects, langLogos, techLogos } from "../data/projects";
import Navbar from "../components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import CursorGlow from "../components/CursorGlow";
import FloatingOrbs from "../components/FloatingOrbs";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import NotFound from "./NotFound";
import { trackEvent } from "../lib/analytics";

function Chip({ label, logo, tone = "accent" }) {
  const tones = {
    accent: "bg-accent/10 text-accent border-accent/20",
    tech: "bg-zinc-800 text-zinc-400 border-zinc-700",
    platform: "bg-zinc-800/50 text-zinc-500 border-zinc-700/50",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${tones[tone]}`}
    >
      {logo && <img src={logo} alt="" className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

function Gallery({ project }) {
  const imgs = project.images.length > 0 ? project.images : [project.preview];
  const [idx, setIdx] = useState(0);

  return (
    <div>
      <div className="relative aspect-video bg-surface border border-border rounded-2xl overflow-hidden">
        <img
          src={imgs[idx]}
          alt={`${project.title} screenshot ${idx + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {imgs.map((src, i) => (
            <button
              key={src}
              onClick={() => setIdx(i)}
              aria-label={`Show screenshot ${i + 1}`}
              aria-current={i === idx}
              className={`flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border transition-colors ${
                i === idx ? "border-accent" : "border-border hover:border-accent/40"
              }`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NeighborCard({ project, direction }) {
  if (!project) return <div className="flex-1" />;
  const isPrev = direction === "prev";
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={`flex-1 group bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-colors ${
        isPrev ? "text-left" : "text-right"
      }`}
    >
      <p className="text-xs text-muted font-mono mb-1 flex items-center gap-1.5 justify-between">
        {isPrev ? (
          <>
            <span className="flex items-center gap-1.5">
              <ArrowLeft size={12} /> Previous
            </span>
          </>
        ) : (
          <>
            <span className="ml-auto flex items-center gap-1.5">
              Next <ArrowRight size={12} />
            </span>
          </>
        )}
      </p>
      <p className="text-sm text-text font-medium group-hover:text-accent transition-colors truncate">
        {project.title}
      </p>
    </Link>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = projects.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) return <NotFound />;

  const index = projects.findIndex((p) => p.slug === slug);
  const prev = projects[index - 1] ?? null;
  const next = projects[index + 1] ?? null;

  const related = projects
    .filter(
      (p) =>
        p.slug !== slug &&
        p.categories.some((c) => project.categories.includes(c))
    )
    .slice(0, 3);

  const isGame = project.categories.includes("Game Dev");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isGame ? "VideoGame" : "CreativeWork",
    name: project.title,
    description: project.description,
    author: { "@type": "Person", name: "Canberk Pitirli" },
    ...(project.store ? { url: project.store } : {}),
    ...(project.git ? { codeRepository: project.git } : {}),
  };

  return (
    <>
      <Seo
        title={project.title}
        description={project.description.slice(0, 160)}
        path={`/projects/${project.slug}`}
        image={project.preview.startsWith("http") ? project.preview : project.preview}
        jsonLd={jsonLd}
      />
      <ScrollProgress />
      <CursorGlow />
      <FloatingOrbs />
      <div className="min-h-screen bg-bg">
        <Navbar />
        <main id="main" className="max-w-4xl mx-auto px-5 md:px-8 pt-28 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <a
              href="/#projects"
              className="inline-flex items-center gap-2 text-muted text-sm hover:text-text transition-colors mb-10"
            >
              <ArrowLeft size={15} />
              All projects
            </a>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.categories.map((c) => (
                    <Chip key={c} label={c} />
                  ))}
                </div>
                <h1 className="font-heading font-bold text-3xl md:text-4xl text-text leading-tight">
                  {project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-3 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    {project.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CircleDot
                      size={12}
                      className={
                        project.status === "In Progress"
                          ? "text-yellow-500"
                          : "text-accent"
                      }
                    />
                    {project.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("project_link_click", { project: project.title, link: "website" })}
                    className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-border text-muted hover:text-text hover:border-accent/30 transition-colors"
                  >
                    <Globe size={15} />
                    {project.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {project.git && (
                  <a
                    href={project.git}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("project_link_click", { project: project.title, link: "github" })}
                    className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-border text-muted hover:text-text hover:border-accent/30 transition-colors"
                  >
                    <Github size={15} />
                    Source
                  </a>
                )}
                {project.store && (
                  <a
                    href={project.store}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("project_link_click", { project: project.title, link: "store" })}
                    className="inline-flex items-center gap-2 bg-accent text-bg font-medium text-sm px-4 py-2 rounded-lg hover:bg-emerald-300 transition-colors"
                  >
                    <ExternalLink size={15} />
                    {project.store.includes("steampowered")
                      ? "View on Steam"
                      : project.store.includes("udemy")
                      ? "View on Udemy"
                      : project.store.includes("play.google")
                      ? "Google Play"
                      : "Visit"}
                  </a>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <Gallery project={project} />
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-muted text-base leading-relaxed">
                {project.description}
              </p>
              {project.details && (
                <div className="mt-4 space-y-4 text-muted text-base leading-relaxed">
                  {project.details.split("\n\n").map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Tech stack */}
            <div className="mb-12">
              <p className="text-xs font-mono text-muted tracking-wider uppercase mb-3">
                Built with
              </p>
              <div className="flex flex-wrap gap-2">
                {project.languages.map((l) => (
                  <Chip key={l} label={l} logo={langLogos[l]} />
                ))}
                {project.techs.map((t) => (
                  <Chip key={t} label={t} logo={techLogos[t]} tone="tech" />
                ))}
                {project.platforms.map((p) => (
                  <Chip key={p} label={p} tone="platform" />
                ))}
              </div>
            </div>

            {/* Prev / next */}
            <div className="flex gap-3 mb-12">
              <NeighborCard project={prev} direction="prev" />
              <NeighborCard project={next} direction="next" />
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div>
                <p className="text-xs font-mono text-muted tracking-wider uppercase mb-4">
                  Related projects
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((p) => (
                    <Link
                      key={p.slug}
                      to={`/projects/${p.slug}`}
                      className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-colors"
                    >
                      <div className="aspect-video bg-bg overflow-hidden">
                        <img
                          src={p.preview}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-text font-medium group-hover:text-accent transition-colors truncate">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted font-mono mt-0.5">
                          {p.date}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </main>
        <Footer />
      </div>
    </>
  );
}
