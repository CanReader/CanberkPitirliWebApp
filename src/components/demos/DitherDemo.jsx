import { useEffect, useMemo, useRef, useState } from "react";
import { Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// A soft pool of light, computed in linear light and encoded to sRGB as
// floats. Then each channel is quantized to N bits the way a real 8 bit
// (or smaller) sRGB buffer stores it: the encoded value is rounded to one
// of 2^N levels, after adding a dither offset in [-0.5, 0.5) of a step.

const W = 256;
const H = 144;
// Magnifier region. Square, so with a 16:9 column split it is exactly as
// tall as the 16:9 image beside it.
const MW = 40;
const MH = 40;
const BITS_MIN = 1;
const BITS_MAX = 8;
const LIGHT = [1, 0.78, 0.52];
const MODES = [
  { k: "1", name: "None", long: "no dither, plain rounding" },
  { k: "2", name: "White noise", long: "white noise, a fresh random offset per pixel" },
  { k: "3", name: "Bayer", long: "ordered, Bayer 8x8 threshold matrix" },
  { k: "4", name: "Blue noise", long: "blue noise, a generated 32x32 tile" },
  { k: "5", name: "Floyd Steinberg", long: "error diffusion, Floyd Steinberg, serpentine" },
];

const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function hash(x, y) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Bayer matrix by the usual recursion, as thresholds in (0, 1).
function bayer(n) {
  let m = [[0]];
  while (m.length < n) {
    const s = m.length;
    const next = Array.from({ length: s * 2 }, () => new Array(s * 2));
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        const v = 4 * m[y][x];
        next[y][x] = v;
        next[y][x + s] = v + 2;
        next[y + s][x] = v + 3;
        next[y + s][x + s] = v + 1;
      }
    }
    m = next;
  }
  return m.map((row) => row.map((v) => (v + 0.5) / (n * n)));
}

// A small blue noise tile by greedy void filling: each step ranks the empty
// pixel with the lowest Gaussian energy (the biggest hole) next. This is the
// ranking half of void and cluster, simplified, good enough to show the idea.
function blueNoise(n) {
  const sigma = 1.5;
  const kernel = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dx = Math.min(x, n - x);
      const dy = Math.min(y, n - y);
      kernel[y * n + x] = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
    }
  }
  const energy = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) energy[i] = hash(i, 91) * 1e-4; // breaks ties
  const rank = new Float32Array(n * n).fill(-1);
  for (let r = 0; r < n * n; r++) {
    let best = -1;
    let low = Infinity;
    for (let i = 0; i < n * n; i++) {
      if (rank[i] < 0 && energy[i] < low) {
        low = energy[i];
        best = i;
      }
    }
    rank[best] = (r + 0.5) / (n * n);
    const bx = best % n;
    const by = (best / n) | 0;
    for (let y = 0; y < n; y++) {
      const ky = ((y - by + n) % n) * n;
      for (let x = 0; x < n; x++) energy[y * n + x] += kernel[ky + ((x - bx + n) % n)];
    }
  }
  return rank;
}

function makeSource() {
  const src = new Float32Array(W * H * 3);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = (x + 0.5 - 92) / 70;
      const dy = (y + 0.5 - 62) / 58;
      const L = 0.85 * Math.exp(-(dx * dx + dy * dy)) + 0.003;
      for (let k = 0; k < 3; k++) src[(y * W + x) * 3 + k] = toSrgb(L * LIGHT[k]);
    }
  }
  return src;
}

// Returns quantized levels (integers 0..n-1) per channel.
function quantize(src, bits, mode, tables) {
  const n = 2 ** bits - 1;
  const q = new Uint8Array(W * H * 3);
  if (mode === 4) {
    const err = new Float32Array(W * H * 3);
    for (let y = 0; y < H; y++) {
      const ltr = y % 2 === 0;
      for (let s = 0; s < W; s++) {
        const x = ltr ? s : W - 1 - s;
        const dir = ltr ? 1 : -1;
        for (let k = 0; k < 3; k++) {
          const i = (y * W + x) * 3 + k;
          const want = src[i] * n + err[i];
          const got = Math.min(n, Math.max(0, Math.round(want)));
          q[i] = got;
          const e = want - got;
          const push = (xx, yy, w) => {
            if (xx < 0 || xx >= W || yy >= H) return;
            err[(yy * W + xx) * 3 + k] += e * w;
          };
          push(x + dir, y, 7 / 16);
          push(x - dir, y + 1, 3 / 16);
          push(x, y + 1, 5 / 16);
          push(x + dir, y + 1, 1 / 16);
        }
      }
    }
    return q;
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let t = 0.5;
      if (mode === 1) t = hash(x, y);
      else if (mode === 2) t = tables.bayer[y & 7][x & 7];
      else if (mode === 3) t = tables.blue[(y & 31) * 32 + (x & 31)];
      const d = t - 0.5;
      for (let k = 0; k < 3; k++) {
        const i = (y * W + x) * 3 + k;
        q[i] = Math.min(n, Math.max(0, Math.round(src[i] * n + d)));
      }
    }
  }
  return q;
}

// Error in steps of the quantizer (LSB): the worst single pixel, and the
// worst average over an 8x8 block, which is closer to what the eye sees.
function errors(src, q, bits) {
  const n = 2 ** bits - 1;
  let pixel = 0;
  let block = 0;
  for (let by = 0; by < H; by += 8) {
    for (let bx = 0; bx < W; bx += 8) {
      for (let k = 0; k < 3; k++) {
        let sum = 0;
        for (let y = by; y < by + 8; y++) {
          for (let x = bx; x < bx + 8; x++) {
            const i = (y * W + x) * 3 + k;
            const e = q[i] - src[i] * n;
            sum += e;
            if (Math.abs(e) > pixel) pixel = Math.abs(e);
          }
        }
        block = Math.max(block, Math.abs(sum / 64));
      }
    }
  }
  return { pixel, block };
}

function Track({ label, value, min, max, onChange, display, ariaLabel }) {
  const ref = useRef(null);
  const dragging = useRef(false);
  const f = (value - min) / (max - min);
  const fromEvent = (e) => {
    const r = ref.current.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    onChange(Math.round(min + t * (max - min)));
  };
  const stops = Array.from({ length: max - min + 1 }, (_, i) => min + i);
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
        aria-valuenow={value}
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
          const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
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
          {stops.map((s) => (
            <div
              key={s}
              className={`absolute h-2 w-px -translate-y-1/2 ${s <= value ? "bg-accent/70" : "bg-zinc-600"}`}
              style={{ left: `${((s - min) / (max - min)) * 100}%` }}
            />
          ))}
          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-[#0c0c0e] transition-[left] duration-100"
            style={{ left: `${f * 100}%` }}
          />
        </div>
      </div>
      <span className="w-20 shrink-0 text-right text-zinc-200 [font-variant-numeric:tabular-nums]">{display}</span>
    </div>
  );
}

export default function DitherDemo({ flags }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const magRef = useRef(null);
  const imageRef = useRef(null);
  const src = useMemo(makeSource, []);
  const tables = useMemo(() => ({ bayer: bayer(8), blue: blueNoise(32) }), []);
  const startMode = flags.has("fs") ? 4 : flags.has("blue") ? 3 : 2;
  const startBits = flags.has("8bit") ? 8 : 4;
  const START_LENS = { x: 166, y: 74 };
  const [bits, setBits] = useState(startBits);
  const [mode, setMode] = useState(startMode);
  const [split, setSplit] = useState(true);
  const [lens, setLens] = useState(START_LENS);
  const [stats, setStats] = useState({ pixel: 0, block: 0 });
  const dragging = useRef(false);

  const plain = useMemo(() => quantize(src, bits, 0, tables), [src, bits, tables]);
  const dithered = useMemo(() => (mode === 0 ? plain : quantize(src, bits, mode, tables)), [src, bits, mode, tables, plain]);

  useEffect(() => {
    setStats(errors(src, dithered, bits));
  }, [src, dithered, bits]);

  useEffect(() => {
    if (!imageRef.current) imageRef.current = canvasRef.current.getContext("2d").createImageData(W, H);
    const image = imageRef.current;
    const data = image.data;
    const n = 2 ** bits - 1;
    // Exact level to 8 bit: v / n * 255, rounded. At 8 bits this is the
    // identity, so the canvas holds exactly what we quantized.
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const q = split && x < W / 2 ? plain : dithered;
        const i = (y * W + x) * 3;
        const j = (y * W + x) * 4;
        data[j] = Math.round((q[i] / n) * 255);
        data[j + 1] = Math.round((q[i + 1] / n) * 255);
        data[j + 2] = Math.round((q[i + 2] / n) * 255);
        data[j + 3] = 255;
      }
    }
    canvasRef.current.getContext("2d").putImageData(image, 0, 0);
  }, [plain, dithered, split, bits]);

  const lx = Math.round(Math.min(W - MW, Math.max(0, lens.x - MW / 2)));
  const ly = Math.round(Math.min(H - MH, Math.max(0, lens.y - MH / 2)));

  useEffect(() => {
    if (!imageRef.current) return;
    magRef.current.getContext("2d").putImageData(imageRef.current, -lx, -ly, lx, ly, MW, MH);
  }, [lx, ly, plain, dithered, split, bits]);

  const setBitsClamped = (b) => setBits(Math.min(BITS_MAX, Math.max(BITS_MIN, b)));
  const reset = () => {
    setBits(startBits);
    setMode(startMode);
    setSplit(true);
    setLens(START_LENS);
  };

  useDemoKeys(rootRef, {
    1: () => setMode(0),
    2: () => setMode(1),
    3: () => setMode(2),
    4: () => setMode(3),
    5: () => setMode(4),
    s: () => setSplit((v) => !v),
    "-": () => setBits((b) => Math.max(BITS_MIN, b - 1)),
    "=": () => setBits((b) => Math.min(BITS_MAX, b + 1)),
    "+": () => setBits((b) => Math.min(BITS_MAX, b + 1)),
    r: reset,
  });

  const moveLens = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    setLens({
      x: Math.min(W, Math.max(0, ((e.clientX - r.left) / r.width) * W)),
      y: Math.min(H, Math.max(0, ((e.clientY - r.top) / r.height) * H)),
    });
  };

  const levels = 2 ** bits;
  const lensSide = split && lx + MW / 2 < W / 2 ? 0 : mode;
  const readout = (
    <span className="flex flex-col">
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">
          {bits} {bits === 1 ? "bit" : "bits"}, {levels} levels
        </span>
        <span>{MODES[mode].long}</span>
      </span>
      <span className="flex flex-wrap gap-x-4">
        <span>
          worst pixel off by <span className="text-zinc-200">{num(stats.pixel, 2)}</span> steps
        </span>
        <span>
          worst 8x8 average off by <span style={{ color: stats.block < 0.1 ? PALETTE.green : PALETTE.coral }}>{num(stats.block, 2)}</span>
        </span>
      </span>
    </span>
  );

  const tag = "pointer-events-none absolute top-2 rounded bg-[#0c0c0e]/70 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300";

  return (
    <div ref={rootRef}>
      <div className="grid grid-cols-[16fr_9fr] bg-[#111114]">
        <div
          className="relative cursor-crosshair touch-none select-none bg-[#111114]"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true;
            moveLens(e);
          }}
          onPointerMove={(e) => (dragging.current || e.pointerType === "mouse") && moveLens(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block w-full"
            style={{ imageRendering: "pixelated", aspectRatio: `${W} / ${H}` }}
            role="img"
            aria-label="A soft light falloff quantized to a few bits per channel, with and without dithering"
          />
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            {split && <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke="#FAFAFA" strokeOpacity="0.35" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
            <rect x={lx} y={ly} width={MW} height={MH} fill="none" stroke={PALETTE.green} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          {split && <span className={`${tag} left-2`}>none</span>}
          <span className={`${tag} ${split ? "left-[calc(50%+0.5rem)]" : "left-2"}`}>{MODES[mode].name.toLowerCase()}</span>
        </div>
        <div className="relative border-l border-[#0c0c0e]">
          <canvas
            ref={magRef}
            width={MW}
            height={MH}
            className="block h-full w-full"
            style={{ imageRendering: "pixelated" }}
            role="img"
            aria-label="Magnified view of the outlined region"
          />
          <span className={`${tag} left-2`}>{MODES[lensSide].name.toLowerCase()}</span>
        </div>
      </div>

      <Track
        label="bits"
        value={bits}
        min={BITS_MIN}
        max={BITS_MAX}
        onChange={setBitsClamped}
        display={`${bits} bit${bits === 1 ? "" : "s"}`}
        ariaLabel="Bits per channel"
      />

      <Strip readout={readout}>
        {MODES.map((m, i) => (
          <Key key={m.k} k={m.k} on={mode === i} onClick={() => setMode(i)}>
            {m.name}
          </Key>
        ))}
        <Key k="s" on={split} onClick={() => setSplit((v) => !v)}>
          Split
        </Key>
        <Key k="r" onClick={reset}>
          Reset
        </Key>
      </Strip>
    </div>
  );
}
