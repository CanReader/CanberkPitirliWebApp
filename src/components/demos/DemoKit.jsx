import { useEffect, useRef } from "react";

// Shared pieces so every demo reads the same: a stage, then one strip with
// a live readout on the left and keyboard-style toggles on the right.

// Keys only fire while the pointer is over the demo or focus is inside it,
// so two demos on one page never fight over the same letter.
export function useDemoKeys(ref, keys) {
  const latest = useRef(keys);
  latest.current = keys;
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const el = ref.current;
      if (!el || !(el.matches(":hover") || el.contains(document.activeElement))) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const fn = latest.current[e.key.toLowerCase()];
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ref]);
}

export function Strip({ readout, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-zinc-800/80 px-4 py-3">
      <div className="min-h-[1.5rem] min-w-0 font-mono text-[12.5px] leading-6 text-zinc-400 [font-variant-numeric:tabular-nums]">
        {readout}
      </div>
      {children && <div className="flex flex-wrap items-center gap-x-5 gap-y-2">{children}</div>}
    </div>
  );
}

// A toggle or action that looks like a key on a keyboard. `on` undefined
// means it's an action (reset, presets) rather than a switch.
export function Key({ k, on, onClick, children }) {
  const isSwitch = on !== undefined;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSwitch ? on : undefined}
      className="group inline-flex items-center gap-2 text-[13px] outline-none"
    >
      <kbd
        className={`grid h-[22px] min-w-[22px] place-items-center rounded-[5px] border px-1 font-mono text-[11px] uppercase shadow-[inset_0_-2px_0_rgba(0,0,0,0.45)] transition-[transform,color,border-color] duration-150 group-active:translate-y-px group-active:shadow-none group-focus-visible:ring-1 group-focus-visible:ring-accent [@media(hover:none)]:hidden ${
          on ? "border-accent/50 bg-accent/10 text-accent" : "border-zinc-700 bg-zinc-900 text-zinc-400 group-hover:text-zinc-200"
        }`}
      >
        {k}
      </kbd>
      <span
        className={`transition-colors ${
          on ? "text-zinc-100 [@media(hover:none)]:underline [@media(hover:none)]:decoration-accent [@media(hover:none)]:underline-offset-4" : isSwitch ? "text-zinc-500 group-hover:text-zinc-300" : "text-zinc-400 group-hover:text-zinc-200"
        }`}
      >
        {children}
      </span>
    </button>
  );
}

// A draggable point: a hit area bigger than it looks, a ring, and the
// one-time pulse that says "you can move me".
export function Handle({ x, y, r, color, hint, active, label, labelDx = 0.45, labelDy = -0.4, fontSize, ...props }) {
  return (
    <g {...props} className="group outline-none">
      <circle cx={x} cy={y} r={r * 3} fill="transparent" />
      {hint && <circle cx={x} cy={y} r={r} fill="none" stroke={color} strokeWidth={r * 0.35} className="demo-hint" />}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="#0c0c0e"
        stroke={color}
        strokeWidth={r * 0.38}
        style={{ transform: active ? "scale(1.25)" : undefined, transformBox: "fill-box", transformOrigin: "center", transition: "transform 150ms" }}
        className="group-hover:[transform:scale(1.18)] group-focus-visible:[transform:scale(1.25)]"
      />
      {label && (
        <text x={x + labelDx} y={y + labelDy} fill={color} fontSize={fontSize ?? r * 1.6} className="pointer-events-none select-none font-mono">
          {label}
        </text>
      )}
    </g>
  );
}

// Signed number with a real minus sign and fixed decimals.
export function num(n, d = 2) {
  const s = Math.abs(n) < 0.5 * 10 ** -d ? 0 : n;
  return (s < 0 ? "−" : "") + Math.abs(s).toFixed(d);
}

export const PALETTE = { coral: "#F2735E", green: "#34D399", blue: "#7AA2F7", ink: "#E4E4E7", bad: "#F87171" };
