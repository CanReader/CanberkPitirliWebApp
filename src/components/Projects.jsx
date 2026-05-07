import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ExternalLink, Github, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  projects,
  allCategories,
  allLanguages,
  langLogos,
  techLogos,
} from "../data/projects";

/* ── Modal ── */
function ProjectModal({ project, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = project.images.length > 0 ? project.images : [project.preview];

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25 }}
        className="bg-surface border-t sm:border border-border sm:rounded-2xl w-full sm:max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image carousel */}
        <div className="relative aspect-video bg-bg overflow-hidden sm:rounded-t-2xl">
          <img
            src={imgs[imgIdx]}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {imgs.length > 1 && (
            <>
              <button
                onClick={() =>
                  setImgIdx((imgIdx - 1 + imgs.length) % imgs.length)
                }
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 active:bg-black/80 hover:bg-black/70 text-white rounded-full p-2 sm:p-1.5 transition-colors"
              >
                <ChevronLeft size={20} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <button
                onClick={() => setImgIdx((imgIdx + 1) % imgs.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 active:bg-black/80 hover:bg-black/70 text-white rounded-full p-2 sm:p-1.5 transition-colors"
              >
                <ChevronRight size={20} className="sm:w-[18px] sm:h-[18px]" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                      i === imgIdx ? "bg-accent" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/50 active:bg-black/80 hover:bg-black/70 text-white rounded-full p-2 sm:p-1.5 transition-colors"
          >
            <X size={20} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="min-w-0">
              <h3 className="font-heading text-xl sm:text-2xl font-bold text-text">
                {project.title}
              </h3>
              <p className="text-muted text-xs sm:text-sm mt-1">
                {project.date} &middot; {project.status}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {project.git && (
                <a
                  href={project.git}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent active:text-accent transition-colors p-2 border border-border rounded-lg hover:border-accent/30"
                >
                  <Github size={18} />
                </a>
              )}
              {project.store && (
                <a
                  href={project.store}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent active:text-accent transition-colors p-2 border border-border rounded-lg hover:border-accent/30"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>

          <p className="text-muted text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">
            {project.description}
          </p>

          {/* Tags with logos */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {project.languages.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-accent/10 text-accent border border-accent/20"
              >
                {langLogos[l] && (
                  <img src={langLogos[l]} alt={l} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
                {l}
              </span>
            ))}
            {project.techs.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
              >
                {techLogos[t] && (
                  <img src={techLogos[t]} alt={t} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
                {t}
              </span>
            ))}
            {project.platforms.map((p) => (
              <span
                key={p}
                className="text-[10px] sm:text-xs font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-zinc-800/50 text-zinc-500 border border-zinc-700/50"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Card with auto-sliding images ── */
function ProjectCard({ project, onClick, index, inView }) {
  const slides = project.images.length > 1 ? project.images : [project.preview];
  const hasSlider = slides.length > 1;
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    if (!hasSlider) return;
    const id = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 3500 + slides.length * 200 + Math.floor(Math.random() * 20000));
    return () => clearInterval(id);
  }, [hasSlider, slides.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.05 * (index % 6) }}
      onClick={onClick}
      className="group cursor-pointer bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/30 active:border-accent/30 transition-all duration-300"
    >
      {/* Image slider */}
      <div className="aspect-video overflow-hidden bg-bg relative">
        <img
          key={slideIdx}
          src={slides[slideIdx]}
          alt={project.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: "fadeIn 0.6s ease-in-out" }}
        />
        {/* Preload next slide */}
        {hasSlider && (
          <link
            rel="prefetch"
            href={slides[(slideIdx + 1) % slides.length]}
          />
        )}

        {/* Slide dots */}
        {hasSlider && (
          <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-10">
            {slides.map((_, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: i === slideIdx ? "#34D399" : "rgba(255,255,255,0.4)",
                  transition: "background-color 0.3s",
                }}
                className="block w-1.5 h-1.5 rounded-full"
              />
            ))}
          </div>
        )}

        {/* Language logos overlay */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex gap-1 sm:gap-1.5 z-10">
          {project.languages.map((l) =>
            langLogos[l] ? (
              <div
                key={l}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center p-0.5 sm:p-1"
              >
                <img src={langLogos[l]} alt={l} className="w-full h-full object-contain" />
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
          <h3 className="font-heading font-semibold text-sm sm:text-base text-text group-hover:text-accent transition-colors truncate">
            {project.title}
          </h3>
          <span className="text-[10px] sm:text-xs text-muted font-mono flex-shrink-0">{project.date}</span>
        </div>

        <p className="text-muted text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {project.techs.slice(0, 3).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] font-mono px-1.5 sm:px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400"
            >
              {techLogos[t] && (
                <img src={techLogos[t]} alt={t} className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              )}
              {t}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Language filter sidebar ── */
function LanguageFilter({ activeLang, onSelect }) {
  return (
    <div className="flex lg:flex-col gap-1.5 sm:gap-2 lg:gap-1.5">
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center justify-center lg:justify-start gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-mono transition-all duration-200 ${
          activeLang === null
            ? "bg-accent/15 text-accent border border-accent/30"
            : "text-muted hover:text-text hover:bg-surface border border-transparent"
        }`}
      >
        <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[9px] sm:text-[10px]">All</span>
      </button>
      {allLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => onSelect(activeLang === lang ? null : lang)}
          title={lang}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-mono transition-all duration-200 ${
            activeLang === lang
              ? "bg-accent/15 text-accent border border-accent/30"
              : "text-muted hover:text-text hover:bg-surface border border-transparent"
          }`}
        >
          {langLogos[lang] ? (
            <img
              src={langLogos[lang]}
              alt={lang}
              className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
            />
          ) : (
            <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[9px] sm:text-[10px]">
              {lang.slice(0, 2)}
            </span>
          )}
          <span className="hidden lg:inline">{lang}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Main section ── */
export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [catFilter, setCatFilter] = useState("All");
  const [langFilter, setLangFilter] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const featured = projects.filter((p) => p.featured);

  const filtered = projects.filter((p) => {
    if (p.featured) return false;
    const matchesCat =
      catFilter === "All" || p.categories.includes(catFilter);
    const matchesLang = !langFilter || p.languages.includes(langFilter);
    return matchesCat && matchesLang;
  });

  const activeCats = allCategories.filter(
    (cat) => cat === "All" || projects.some((p) => p.categories.includes(cat))
  );

  return (
    <section id="projects" className="py-16 sm:py-24 lg:py-32" ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono text-accent text-xs sm:text-sm tracking-wider mb-2 sm:mb-3">
          PROJECTS
        </p>
        <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-text mb-3 sm:mb-4">
          Selected work
        </h2>
        <p className="text-muted text-sm sm:text-base max-w-xl mb-8 sm:mb-10">
          From shipped Steam titles to custom game engines, distributed systems,
          and deep learning frameworks. Here's what I've been building.
        </p>

        {/* Featured projects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-10 sm:mb-16">
          {featured.map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={i}
              inView={inView}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>

        {/* Category filter tabs — horizontal scroll on mobile */}
        <div className="mb-6 sm:mb-8 -mx-5 px-5 sm:mx-0 sm:px-0">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap scrollbar-none">
            {activeCats.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`text-xs sm:text-sm font-mono px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  catFilter === cat
                    ? "bg-accent text-bg border-accent"
                    : "border-border text-muted hover:border-accent/30 hover:text-text active:text-text"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile language filter (horizontal scroll) */}
        <div className="lg:hidden mb-4 sm:mb-6">
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-5 px-5 sm:mx-0 sm:px-0 scrollbar-none">
            <LanguageFilter activeLang={langFilter} onSelect={setLangFilter} />
          </div>
        </div>

        {/* Grid + language sidebar */}
        <div className="flex gap-4 sm:gap-6">
          {/* Language filter sidebar (desktop) */}
          <div className="hidden lg:block flex-shrink-0 w-44">
            <div className="sticky top-24">
              <p className="text-xs font-mono text-muted tracking-wider uppercase mb-3 px-3">
                Language
              </p>
              <LanguageFilter activeLang={langFilter} onSelect={setLangFilter} />
            </div>
          </div>

          {/* Projects grid */}
          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <p className="text-muted text-center py-8 sm:py-12 text-sm">
                No projects match the current filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {filtered.map((project, i) => (
                  <ProjectCard
                    key={project.title}
                    project={project}
                    index={i}
                    inView={inView}
                    onClick={() => setSelectedProject(project)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
