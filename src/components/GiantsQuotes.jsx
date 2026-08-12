import { useMemo } from "react";
import { quotes } from "../data/quotes";

export default function GiantsQuotes() {
  // One random quote, redrawn on every page load
  const quote = useMemo(
    () => quotes[Math.floor(Math.random() * quotes.length)],
    []
  );
  if (!quote) return null;

  return (
    <div className="mt-10 sm:mt-14">
      {/* Divider with label */}
      <div className="flex items-center gap-4 mb-10 sm:mb-12">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
        <p className="text-[10px] sm:text-xs font-mono text-muted tracking-widest uppercase whitespace-nowrap">
          And from the giants
        </p>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
      </div>

      <blockquote className="relative max-w-3xl mx-auto text-center px-4 sm:px-10">
        {/* Decorative quote glyph */}
        <span
          aria-hidden="true"
          className="absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 font-heading text-7xl sm:text-8xl leading-none text-accent/15 select-none"
        >
          &ldquo;
        </span>

        <p className="font-heading text-lg sm:text-xl md:text-2xl text-zinc-200 leading-relaxed sm:leading-relaxed pt-1">
          {quote.text}
        </p>
        <footer className="mt-5 flex flex-col items-center gap-0.5">
          <cite className="not-italic font-mono text-accent text-sm">
            {quote.author}
          </cite>
          <span className="text-muted text-xs">{quote.title}</span>
        </footer>
      </blockquote>
    </div>
  );
}
