import { useEffect, useRef, useState } from "react";
import { Key, Strip, num, useDemoKeys } from "./DemoKit";

// Two gradients between the same pair of colors. The top one lerps the
// stored sRGB values, the way a naive shader or a non-sRGB render target
// would. The bottom one converts to linear light, lerps, and converts back.

const PRESETS = [
  ["#E8402F", "#2FD06B"],
  ["#000000", "#FFFFFF"],
  ["#2F5BFF", "#FFD23F"],
];
const COLS = 480;

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const toHex = (c) => "#" + c.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const lerp = (a, b, t) => a + (b - a) * t;

function mixSrgb(a, b, t) {
  return a.map((v, i) => lerp(v, b[i], t));
}
function mixLinear(a, b, t) {
  return a.map((v, i) => toSrgb(lerp(toLinear(v), toLinear(b[i]), t)));
}
// Relative luminance, to show the brightness dip as a number.
const luminance = (c) => 0.2126 * toLinear(c[0]) + 0.7152 * toLinear(c[1]) + 0.0722 * toLinear(c[2]);

function Band({ from, to, mix, label, t }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = ref.current.getContext("2d");
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    for (let x = 0; x < COLS; x++) {
      ctx.fillStyle = toHex(mix(a, b, x / (COLS - 1)));
      ctx.fillRect(x, 0, 1, 1);
    }
  }, [from, to, mix]);
  return (
    <div className="relative">
      <canvas ref={ref} width={COLS} height={1} className="block h-14 w-full sm:h-16" aria-hidden="true" />
      <span className="pointer-events-none absolute left-3 top-2 rounded bg-[#0c0c0e]/70 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">{label}</span>
      <span className="pointer-events-none absolute inset-y-0 w-px bg-white/80 mix-blend-difference" style={{ left: `${t * 100}%` }} />
    </div>
  );
}

function Swatch({ value, onChange, label }) {
  return (
    <label className="group relative grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-md border border-zinc-700 transition-transform active:scale-95" style={{ background: value }}>
      <span className="sr-only">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
    </label>
  );
}

export default function GammaDemo() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const [[from, to], setPair] = useState(PRESETS[0]);
  const [t, setT] = useState(0.5);
  const dragging = useRef(false);

  useDemoKeys(rootRef, {
    1: () => setPair(PRESETS[0]),
    2: () => setPair(PRESETS[1]),
    3: () => setPair(PRESETS[2]),
  });

  const setFromEvent = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    setT(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
  };

  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const s = mixSrgb(a, b, t);
  const l = mixLinear(a, b, t);

  const readout = (
    <span className="flex flex-wrap items-center gap-x-4">
      <span className="text-zinc-200">t {num(t)}</span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-3 w-3 rounded-sm border border-white/10" style={{ background: toHex(s) }} />
        sRGB {toHex(s)} <span className="text-zinc-500">Y {num(luminance(s))}</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-3 w-3 rounded-sm border border-white/10" style={{ background: toHex(l) }} />
        linear {toHex(l)} <span className="text-zinc-500">Y {num(luminance(l))}</span>
      </span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <div className="flex items-center gap-3 p-4">
        <Swatch value={from} onChange={(v) => setPair([v, to])} label="Start color" />
        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label="Blend amount"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={Number(t.toFixed(2))}
          className="min-w-0 flex-1 cursor-ew-resize touch-pan-y overflow-hidden rounded-md outline-none ring-accent focus-visible:ring-1"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            setFromEvent(e);
          }}
          onPointerMove={(e) => dragging.current && setFromEvent(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          onKeyDown={(e) => {
            const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[e.key];
            if (!d) return;
            e.preventDefault();
            setT((v) => Math.min(1, Math.max(0, v + d)));
          }}
        >
          <Band from={from} to={to} mix={mixSrgb} label="mixed in sRGB" t={t} />
          <div className="h-px bg-[#0c0c0e]" />
          <Band from={from} to={to} mix={mixLinear} label="mixed in linear" t={t} />
        </div>
        <Swatch value={to} onChange={(v) => setPair([from, v])} label="End color" />
      </div>

      <Strip readout={readout}>
        <Key k="1" onClick={() => setPair(PRESETS[0])}>Red, green</Key>
        <Key k="2" onClick={() => setPair(PRESETS[1])}>Black, white</Key>
        <Key k="3" onClick={() => setPair(PRESETS[2])}>Blue, yellow</Key>
      </Strip>
    </div>
  );
}
