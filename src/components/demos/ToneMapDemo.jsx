import { useEffect, useMemo, useRef, useState } from "react";
import { Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// A night street rendered into a float buffer of linear radiance, with
// lamps and a neon sign far brighter than 1.0. Exposure scales it, an
// operator maps it to 0..1, and only then is it encoded to sRGB for the
// screen. Everything before the encode stays in linear light.

const W = 240;
const H = 136;
const HORIZON = 84;
const FOCAL = 120; // pixels
const CAM_H = 1.6; // meters
const EV_MIN = -6;
const EV_MAX = 6;
const S0 = -10; // curve x range, stops of scene luminance
const S1 = 8;

const SKY_TOP = [0.002, 0.003, 0.01];
const SKY_LOW = [0.03, 0.024, 0.032];
const NEON = [9, 1.4, 0.2];
const CYAN = [0.15, 2, 4];
const LAMPS = [
  { X: 1.5, Z: 8, h: 4.5, I: 1100, c: [1, 0.72, 0.42], size: [3, 2], glow: 3.5 },
  { X: -2.6, Z: 20, h: 4.5, I: 1100, c: [0.62, 0.8, 1], size: [2, 1], glow: 2.2 },
];
const GLYPHS = {
  B: ["110", "101", "110", "101", "110"],
  A: ["010", "101", "111", "101", "101"],
  R: ["110", "101", "110", "101", "101"],
};

const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function hash(x, y) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Narkowicz 2015, "ACES Filmic Tone Mapping Curve": a rational fit to the
// ACES reference transform's overall shape. An approximation, applied per
// channel, so it also desaturates bright colors on its own.
const aces = (x) => Math.max(0, (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14));

// John Hable's Uncharted 2 curve with his published constants.
const hableRaw = (x) => {
  const A = 0.15, B = 0.5, C = 0.1, D = 0.2, E = 0.02, F = 0.3;
  return (x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F) - E / F;
};
const HABLE_WHITE = 1 / hableRaw(11.2);
const hable = (x) => hableRaw(2 * x) * HABLE_WHITE;

const OPS = [
  { k: "1", name: "Clamp", note: "no tone mapping, anything over 1.0 is cut off", fn: (r, g, b) => [r, g, b] },
  {
    k: "2",
    name: "Reinhard",
    note: "L / (1 + L) on luminance, color scaled by the same factor",
    fn: (r, g, b) => {
      const L = lum(r, g, b);
      if (L <= 0) return [0, 0, 0];
      const s = 1 / (1 + L);
      return [r * s, g * s, b * s];
    },
  },
  { k: "3", name: "ACES fit", note: "Narkowicz's fit of the ACES curve, per channel", fn: (r, g, b) => [aces(r), aces(g), aces(b)] },
  { k: "4", name: "Hable", note: "Uncharted 2 curve, per channel, white point 11.2", fn: (r, g, b) => [hable(r), hable(g), hable(b)] },
];

function buildScene() {
  const buf = new Float32Array(W * H * 3);
  const set = (x, y, c) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = (y * W + x) * 3;
    buf[i] = c[0];
    buf[i + 1] = c[1];
    buf[i + 2] = c[2];
  };
  const add = (i, c, k) => {
    buf[i] += c[0] * k;
    buf[i + 1] += c[1] * k;
    buf[i + 2] += c[2] * k;
  };
  const lamps = LAMPS.map((l) => ({
    ...l,
    sx: W / 2 + (FOCAL * l.X) / l.Z,
    base: HORIZON + (FOCAL * CAM_H) / l.Z,
    bulb: HORIZON + (FOCAL * (CAM_H - l.h)) / l.Z,
  }));

  // Sky, and a road lit by the lamps: irradiance I cos(theta) / d^2 on a
  // flat ground plane, times albedo / pi.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (y < HORIZON) {
        const t = (y / HORIZON) ** 2;
        set(x, y, SKY_TOP.map((v, k) => v + (SKY_LOW[k] - v) * t));
        continue;
      }
      const z = (FOCAL * CAM_H) / (y + 0.5 - HORIZON);
      const X = ((x + 0.5 - W / 2) * z) / FOCAL;
      const albedo = Math.abs(X) < 0.07 && Math.floor(z / 2.5) % 2 === 0 ? 0.55 : 0.16;
      const c = [0.006, 0.007, 0.01];
      for (const l of lamps) {
        const d2 = (X - l.X) ** 2 + (z - l.Z) ** 2 + l.h * l.h;
        const k = ((albedo / Math.PI) * l.I * l.h) / (d2 * Math.sqrt(d2));
        c[0] += l.c[0] * k;
        c[1] += l.c[1] * k;
        c[2] += l.c[2] * k;
      }
      set(x, y, c);
    }
  }

  // Far skyline with a few lit windows.
  for (let x = 64; x < 182; x++) {
    const top = HORIZON - 4 - Math.floor(hash(Math.floor(x / 7), 1) * 13);
    for (let y = top; y < HORIZON; y++) {
      const lit = x % 2 === 0 && y % 3 === 0 && hash(x, y) > 0.86;
      set(x, y, lit ? [0.5, 0.38, 0.22] : [0.003, 0.003, 0.005]);
    }
  }

  // Two near buildings with windows, some lit.
  const building = (x0, x1, y0, y1, cols, rows, wx, wy, sx, sy, seed) => {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) set(x, y, [0.005, 0.005, 0.007]);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const on = hash(i + seed, j + 7) > 0.4;
        const k = 0.5 + hash(i + 3, j + seed);
        const c = on ? [1.5 * k, 1.0 * k, 0.5 * k] : [0.01, 0.012, 0.02];
        for (let y = 0; y < 7; y++) for (let x = 0; x < 6; x++) set(wx + i * sx + x, wy + j * sy + y, c);
      }
    }
  };
  building(0, 64, 24, 100, 5, 6, 5, 30, 12, 11, 0);
  building(182, W, 40, 98, 4, 2, 186, 72, 13, 12, 11);

  // A neon sign: a cyan frame around red-orange letters.
  for (let x = 188; x < 220; x++) {
    set(x, 46, CYAN);
    set(x, 63, CYAN);
  }
  for (let y = 46; y < 64; y++) {
    set(188, y, CYAN);
    set(219, y, CYAN);
  }
  [..."BAR"].forEach((ch, n) => {
    GLYPHS[ch].forEach((row, gy) =>
      [...row].forEach((bit, gx) => {
        if (bit !== "1") return;
        for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) set(193 + n * 9 + gx * 2 + dx, 50 + gy * 2 + dy, NEON);
      }),
    );
  });

  // Lamp poles and bulbs.
  for (const l of lamps) {
    const px = Math.round(l.sx);
    for (let y = Math.round(l.bulb) + 1; y <= Math.round(l.base); y++) set(px, y, [0.012, 0.012, 0.014]);
    for (let y = 0; y < l.size[1]; y++) {
      for (let x = 0; x < l.size[0]; x++) set(px - (l.size[0] >> 1) + x, Math.round(l.bulb) - y, l.c.map((v) => v * 60));
    }
  }

  // Moon.
  for (let y = 10; y < 23; y++) for (let x = 24; x < 37; x++) if ((x - 30) ** 2 + (y - 16) ** 2 <= 16) set(x, y, [2.2, 2.2, 2.0]);

  // Haze around the bright things, added on top in linear light.
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      for (const l of lamps) {
        const d2 = (x - l.sx) ** 2 + (y - l.bulb) ** 2;
        add(i, l.c, 0.4 / (1 + d2 / (l.glow * l.glow)));
      }
      const q = ((x - 203.5) / 15) ** 2 + ((y - 54.5) / 10) ** 2;
      add(i, NEON, 0.03 / (1 + q));
      add(i, CYAN, 0.012 / (1 + q));
      add(i, [0.05, 0.06, 0.08], 1 / (1 + ((x - 30) ** 2 + (y - 16) ** 2) / 49));
    }
  }
  return buf;
}

const DEFAULT_PROBE = { x: 193, y: 50 };

function Track({ label, value, min, max, step, onChange, display, ariaLabel, ticks = [] }) {
  const ref = useRef(null);
  const dragging = useRef(false);
  const f = (value - min) / (max - min);
  const fromEvent = (e) => {
    const r = ref.current.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    onChange(min + Math.round((t * (max - min)) / step) * step);
  };
  return (
    <div className="flex items-center gap-3 px-4 pt-3 font-mono text-[12px]">
      <span className="shrink-0 text-zinc-500">{label}</span>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Number(value.toFixed(2))}
        aria-valuetext={display}
        className="relative h-7 min-w-0 flex-1 cursor-ew-resize touch-pan-y rounded-md outline-none ring-accent focus-visible:ring-1"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          dragging.current = true;
          fromEvent(e);
        }}
        onPointerMove={(e) => dragging.current && fromEvent(e)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        onKeyDown={(e) => {
          const d = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step }[e.key];
          if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            onChange(e.key === "Home" ? min : max);
          } else if (d) {
            e.preventDefault();
            onChange(Math.min(max, Math.max(min, value + d)));
          }
        }}
      >
        <div className="absolute inset-x-1.5 top-1/2">
          <div className="absolute inset-x-0 h-px bg-zinc-700" />
          {ticks.map((t) => (
            <div key={t} className="absolute h-2 w-px -translate-y-1/2 bg-zinc-600" style={{ left: `${((t - min) / (max - min)) * 100}%` }} />
          ))}
          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-[#0c0c0e]"
            style={{ left: `${f * 100}%` }}
          />
        </div>
      </div>
      <span className="w-16 shrink-0 text-right text-zinc-200 [font-variant-numeric:tabular-nums]">{display}</span>
    </div>
  );
}

// The curve panel: scene luminance in stops (before exposure) against the
// sRGB-encoded value that reaches the screen, for a grey input.
const PX0 = 24;
const PX1 = 192;
const PY0 = 10;
const PY1 = 124;
const xOf = (s) => PX0 + ((s - S0) / (S1 - S0)) * (PX1 - PX0);
const yOf = (o) => PY1 - o * (PY1 - PY0);

function Curve({ op, ev, probe }) {
  const gain = 2 ** ev;
  const { fit, over } = useMemo(() => {
    // Each segment goes to the coral path if either end is over 1.0.
    let fit = "";
    let over = "";
    let prev = null;
    for (let i = 0; i <= 180; i++) {
      const s = S0 + ((S1 - S0) * i) / 180;
      const g = 2 ** s * gain;
      const raw = op.fn(g, g, g)[1];
      const p = { xy: `${xOf(s).toFixed(2)},${yOf(toSrgb(Math.min(1, Math.max(0, raw)))).toFixed(2)}`, over: raw > 1.0001 };
      if (prev) {
        const seg = `M${prev.xy}L${p.xy}`;
        if (prev.over || p.over) over += seg;
        else fit += seg;
      }
      prev = p;
    }
    return { fit, over };
  }, [op, gain]);

  let marker = null;
  if (probe) {
    const s = Math.min(S1, Math.max(S0, Math.log2(Math.max(probe.sceneL, 2 ** S0))));
    const g = 2 ** s * gain;
    const raw = op.fn(g, g, g)[1];
    const mx = xOf(s);
    const my = yOf(toSrgb(Math.min(1, Math.max(0, raw))));
    const color = probe.clipped ? PALETTE.coral : PALETTE.ink;
    marker = (
      <g>
        <line x1={mx} y1={PY1} x2={mx} y2={my} stroke={color} strokeOpacity="0.4" strokeDasharray="2 2" strokeWidth="0.8" />
        <line x1={PX0} y1={my} x2={mx} y2={my} stroke={color} strokeOpacity="0.4" strokeDasharray="2 2" strokeWidth="0.8" />
        <circle cx={mx} cy={my} r="3.2" fill="#0c0c0e" stroke={color} strokeWidth="1.4" />
      </g>
    );
  }

  const ticks = [-8, -4, 0, 4, 8];
  return (
    <svg viewBox="0 0 200 150" className="block h-auto w-full" role="img" aria-label={`${op.name} tone curve`}>
      {ticks.map((s) => (
        <g key={s}>
          <line x1={xOf(s)} y1={PY0} x2={xOf(s)} y2={PY1} stroke="#FAFAFA" strokeOpacity="0.06" strokeWidth="0.8" />
          <text x={xOf(s)} y={PY1 + 11} fill="#71717A" fontSize="8.5" textAnchor="middle" className="font-mono">
            {s > 0 ? `+${s}` : s < 0 ? `−${-s}` : "0"}
          </text>
        </g>
      ))}
      <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="#3F3F46" strokeWidth="0.8" />
      <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke="#FAFAFA" strokeOpacity="0.25" strokeDasharray="3 3" strokeWidth="0.8" />
      <text x={PX0 - 4} y={PY0 + 3} fill="#71717A" fontSize="8.5" textAnchor="end" className="font-mono">1</text>
      <text x={PX0 - 4} y={PY1 + 3} fill="#71717A" fontSize="8.5" textAnchor="end" className="font-mono">0</text>
      <text x={(PX0 + PX1) / 2} y={PY1 + 23} fill="#71717A" fontSize="8.5" textAnchor="middle" className="font-mono">
        scene luminance, stops
      </text>
      <path d={fit} fill="none" stroke={PALETTE.green} strokeWidth="1.6" strokeLinecap="round" />
      <path d={over} fill="none" stroke={PALETTE.coral} strokeWidth="1.6" strokeLinecap="round" />
      {marker}
    </svg>
  );
}

export default function ToneMapDemo({ flags }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const scene = useMemo(buildScene, []);
  const startOp = flags.has("hable") ? 3 : flags.has("aces") ? 2 : flags.has("reinhard") ? 1 : 0;
  const [opIndex, setOpIndex] = useState(startOp);
  const [ev, setEv] = useState(0);
  const [showClip, setShowClip] = useState(flags.has("clip"));
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(DEFAULT_PROBE);
  const [clippedShare, setClippedShare] = useState(0);
  const op = OPS[opIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!ctxRef.current) {
      const ctx = canvas.getContext("2d");
      ctxRef.current = { ctx, image: ctx.createImageData(W, H) };
    }
    const { ctx, image } = ctxRef.current;
    const data = image.data;
    const gain = 2 ** ev;
    const coral = [1, 3, 5].map((i) => parseInt(PALETTE.coral.slice(i, i + 2), 16));
    let clipped = 0;
    for (let p = 0; p < W * H; p++) {
      const i = p * 3;
      const o = op.fn(scene[i] * gain, scene[i + 1] * gain, scene[i + 2] * gain);
      const over = o[0] > 1.0001 || o[1] > 1.0001 || o[2] > 1.0001;
      if (over) clipped++;
      const j = p * 4;
      if (over && showClip) {
        data[j] = coral[0];
        data[j + 1] = coral[1];
        data[j + 2] = coral[2];
      } else {
        data[j] = Math.round(toSrgb(Math.min(1, Math.max(0, o[0]))) * 255);
        data[j + 1] = Math.round(toSrgb(Math.min(1, Math.max(0, o[1]))) * 255);
        data[j + 2] = Math.round(toSrgb(Math.min(1, Math.max(0, o[2]))) * 255);
      }
      data[j + 3] = 255;
    }
    ctx.putImageData(image, 0, 0);
    setClippedShare(clipped / (W * H));
  }, [scene, op, ev, showClip]);

  const nudge = (d) => setEv((v) => Math.min(EV_MAX, Math.max(EV_MIN, Math.round((v + d) * 2) / 2)));
  const reset = () => {
    setOpIndex(startOp);
    setEv(0);
    setShowClip(flags.has("clip"));
    setPinned(DEFAULT_PROBE);
  };

  useDemoKeys(rootRef, {
    1: () => setOpIndex(0),
    2: () => setOpIndex(1),
    3: () => setOpIndex(2),
    4: () => setOpIndex(3),
    c: () => setShowClip((v) => !v),
    "-": () => nudge(-0.5),
    "=": () => nudge(0.5),
    "+": () => nudge(0.5),
    r: reset,
  });

  const toPixel = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * W);
    const y = Math.floor(((e.clientY - r.top) / r.height) * H);
    return x >= 0 && x < W && y >= 0 && y < H ? { x, y } : null;
  };

  const at = hover ?? pinned;
  const gain = 2 ** ev;
  const si = (at.y * W + at.x) * 3;
  const input = [scene[si] * gain, scene[si + 1] * gain, scene[si + 2] * gain];
  const raw = op.fn(...input);
  const isClipped = raw.some((v) => v > 1.0001);
  const shown = raw.map((v) => Math.min(1, Math.max(0, v)));
  const swatch = `rgb(${shown.map((v) => Math.round(toSrgb(v) * 255)).join(",")})`;
  const probe = { sceneL: lum(scene[si], scene[si + 1], scene[si + 2]), clipped: isClipped };
  const fmt = (c) => c.map((v) => num(v, v >= 10 ? 1 : 2)).join(" ");

  const readout = (
    <span className="flex flex-col">
      <span className="flex flex-wrap items-center gap-x-4">
        <span className="text-zinc-200">pixel ({at.x}, {at.y})</span>
        <span>in {fmt(input)}</span>
        <span className="inline-flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded-sm border border-white/10" style={{ background: swatch }} />
          out {fmt(raw.map((v) => Math.max(0, v)))}
        </span>
        <span style={{ color: isClipped ? PALETTE.coral : PALETTE.green }}>{isClipped ? "clipped" : "fits"}</span>
      </span>
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">{op.name}</span>
        <span>{op.note}</span>
        <span>
          <span style={{ color: clippedShare > 0 ? PALETTE.coral : undefined }}>{(clippedShare * 100).toFixed(1)}%</span> of pixels clip
        </span>
      </span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <div className="flex flex-col bg-[#111114] sm:flex-row sm:items-center">
        <div
          className="relative cursor-crosshair select-none sm:flex-[1.75]"
          onPointerMove={(e) => e.pointerType === "mouse" && setHover(toPixel(e))}
          onPointerDown={(e) => {
            const p = toPixel(e);
            if (p) setPinned(p);
          }}
          onPointerLeave={() => setHover(null)}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block w-full"
            style={{ imageRendering: "pixelated", aspectRatio: `${W} / ${H}` }}
            role="img"
            aria-label="A night street with lamps and a neon sign, rendered in HDR and tone mapped"
          />
          <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full">
            <rect
              x={at.x - 1.5}
              y={at.y - 1.5}
              width={4}
              height={4}
              fill="none"
              stroke={isClipped ? PALETTE.coral : "#FAFAFA"}
              strokeWidth="0.6"
            />
          </svg>
        </div>
        <div className="mx-auto w-full max-w-[320px] px-3 py-3 sm:max-w-none sm:flex-1">
          <Curve op={op} ev={ev} probe={probe} />
        </div>
      </div>

      <Track
        label="exposure"
        value={ev}
        min={EV_MIN}
        max={EV_MAX}
        step={0.25}
        onChange={setEv}
        display={`${ev > 0 ? "+" : ""}${num(ev, 2)} EV`}
        ariaLabel="Exposure in stops"
        ticks={[0]}
      />

      <Strip readout={readout}>
        {OPS.map((o, i) => (
          <Key key={o.k} k={o.k} on={opIndex === i} onClick={() => setOpIndex(i)}>
            {o.name}
          </Key>
        ))}
        <Key k="c" on={showClip} onClick={() => setShowClip((v) => !v)}>
          Show clipping
        </Key>
        <Key k="r" onClick={reset}>
          Reset
        </Key>
      </Strip>
    </div>
  );
}
