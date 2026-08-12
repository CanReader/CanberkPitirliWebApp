import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Hash,
  FileText,
  FolderGit2,
  Link as LinkIcon,
  CornerDownLeft,
} from "lucide-react";
import { posts } from "../data/posts";
import { projects } from "../data/projects";
import { site } from "../data/siteConfig";
import { trackEvent } from "../lib/analytics";

// Ctrl+K / Cmd+K command palette. Mounted once in main.jsx.
// Other components can open it via: window.dispatchEvent(new Event("open-cmdk"))

const sections = [
  { name: "About", hash: "#about" },
  { name: "Skills", hash: "#skills" },
  { name: "Experience", hash: "#experience" },
  { name: "Projects", hash: "#projects" },
  { name: "Contact", hash: "#contact" },
];

const groupIcons = {
  Navigate: Hash,
  "Blog posts": FileText,
  Projects: FolderGit2,
  Links: LinkIcon,
};

function buildItems() {
  return [
    ...sections.map((s) => ({
      group: "Navigate",
      label: s.name,
      keywords: "section go to",
      action: { type: "section", hash: s.hash },
    })),
    {
      group: "Navigate",
      label: "Blog",
      keywords: "posts writing articles",
      action: { type: "route", to: "/blog" },
    },
    ...posts.map((p) => ({
      group: "Blog posts",
      label: p.title,
      keywords: `${p.category} ${p.tags.join(" ")}`,
      action: { type: "route", to: `/blog/${p.slug}` },
    })),
    ...projects.map((p) => ({
      group: "Projects",
      label: p.title,
      keywords: `${p.categories.join(" ")} ${p.languages.join(" ")} ${p.techs.join(" ")}`,
      action: { type: "route", to: `/projects/${p.slug}` },
    })),
    {
      group: "Links",
      label: "GitHub",
      keywords: "code repos source",
      action: { type: "external", href: site.socials.github },
    },
    {
      group: "Links",
      label: "LinkedIn",
      keywords: "profile career",
      action: { type: "external", href: site.socials.linkedin },
    },
    {
      group: "Links",
      label: "X / Twitter",
      keywords: "social",
      action: { type: "external", href: site.socials.twitter },
    },
    {
      group: "Links",
      label: "Email me",
      keywords: "contact mail",
      action: { type: "external", href: `mailto:${site.email}` },
    },
  ];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const allItems = useMemo(buildItems, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.toLowerCase().includes(q)
    );
  }, [query, allItems]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIdx(0);
  }, []);

  const run = useCallback(
    (item) => {
      close();
      trackEvent("palette_action", { item: item.label, group: item.group });
      const { action } = item;
      if (action.type === "route") {
        navigate(action.to);
        window.scrollTo(0, 0);
      } else if (action.type === "external") {
        window.open(action.href, "_blank", "noopener,noreferrer");
      } else if (action.type === "section") {
        if (location.pathname === "/") {
          document
            .querySelector(action.hash)
            ?.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = `/${action.hash}`;
        }
      }
    },
    [close, navigate, location.pathname]
  );

  // Global shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", onOpenEvent);
    };
  }, []);

  // Focus + scroll lock while open
  useEffect(() => {
    if (!open) return;
    trackEvent("palette_open");
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Keep active row visible
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${activeIdx}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const onInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIdx]) run(filtered[activeIdx]);
    } else if (e.key === "Escape") {
      close();
    }
  };

  // Rows with group headers, tracking a flat index for keyboard nav
  let lastGroup = null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <Search size={16} className="text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search posts, projects, sections..."
                aria-label="Search"
                className="w-full bg-transparent py-3.5 text-sm text-text placeholder:text-zinc-600 focus:outline-none"
              />
              <kbd className="hidden sm:block text-[10px] font-mono text-muted border border-border rounded px-1.5 py-0.5 flex-shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <p className="text-muted text-sm text-center py-8 font-mono">
                  No results for "{query}"
                </p>
              ) : (
                filtered.map((item, idx) => {
                  const showHeader = item.group !== lastGroup;
                  lastGroup = item.group;
                  const GroupIcon = groupIcons[item.group] ?? Hash;
                  return (
                    <div key={`${item.group}-${item.label}`}>
                      {showHeader && (
                        <p className="px-4 pt-3 pb-1.5 text-[10px] font-mono text-muted tracking-wider uppercase">
                          {item.group}
                        </p>
                      )}
                      <button
                        data-idx={idx}
                        onClick={() => run(item)}
                        onMouseMove={() => setActiveIdx(idx)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                          idx === activeIdx
                            ? "bg-accent/10 text-text"
                            : "text-muted"
                        }`}
                      >
                        <GroupIcon
                          size={14}
                          className={
                            idx === activeIdx ? "text-accent" : "text-zinc-600"
                          }
                        />
                        <span className="truncate flex-1">{item.label}</span>
                        {idx === activeIdx && (
                          <CornerDownLeft size={12} className="text-muted" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-[10px] font-mono text-zinc-600">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
