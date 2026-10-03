import { useEffect, useMemo, useRef, useState } from "react";
import { Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// A 16x16 texture, repeated, sampled once per output pixel by our own code.
// Texels are stored as sRGB, decoded to linear before filtering (as an sRGB
// texture format does on the GPU) and encoded again for the screen.
// Nearest takes one texel; bilinear blends the four whose centers surround
// the sample point. Mipmaps are 2x2 box-filtered copies, picked by how many
// texels one pixel covers.

const W = 256;
const H = 144;
const N = 16;
const LEVELS = 5; // 16, 8, 4, 2, 1
const ZOOM_MIN = 0.125;
const ZOOM_MAX = 32;
const START = { cx: 8.35, cy: 3.6, zoom: 10 };
const MINIFY = { cx: 8, cy: 8, zoom: 0.35 };

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const hexLinear = (h) => [1, 3, 5].map((i) => toLinear(parseInt(h.slice(i, i + 2), 16) / 255));
const wrap = (i, n) => ((i % n) + n) % n;

function makeMips() {
  const dark = hexLinear("#2A2A33");
  const light = hexLinear("#6B6B78");
  const ring = hexLinear(PALETTE.coral);
  const line = hexLinear(PALETTE.green);
  const dot = hexLinear("#E5C07B");
  const base = new Float32Array(N * N * 3);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let c = ((x >> 1) + (y >> 1)) & 1 ? light : dark;
      const d = Math.hypot(x + 0.5 - 8, y + 0.5 - 8);
      if (d > 4.6 && d < 6.2) c = ring;
      if (x === y) c = line;
      if (x === 15 - y && x > 9) c = dot;
      base.set(c, (y * N + x) * 3);
    }
  }
  const mips = [{ n: N, data: base }];
  for (let l = 1; l < LEVELS; l++) {
    const prev = mips[l - 1];
    const n = prev.n >> 1;
    const data = new Float32Array(n * n * 3);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        for (let k = 0; k < 3; k++) {
          const at = (xx, yy) => prev.data[(yy * prev.n + xx) * 3 + k];
          data[(y * n + x) * 3 + k] = (at(2 * x, 2 * y) + at(2 * x + 1, 2 * y) + at(2 * x, 2 * y + 1) + at(2 * x + 1, 2 * y + 1)) / 4;
        }
      }
    }
    mips.push({ n, data });
  }
  return mips;
}

// u, v are in level 0 texel units, so the same point works on every level.
function sampleLevel(level, u, v, bilinear, out, w) {
  const s = level.n / N;
  const d = level.data;
  const n = level.n;
  if (!bilinear) {
    const i = (wrap(Math.floor(u * s), n) + wrap(Math.floor(v * s), n) * n) * 3;
    out[0] += d[i] * w;
    out[1] += d[i + 1] * w;
    out[2] += d[i + 2] * w;
    return;
  }
  const x = u * s - 0.5;
  const y = v * s - 0.5;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const xa = wrap(x0, n);
  const xb = wrap(x0 + 1, n);
  const ya = wrap(y0, n) * n;
  const yb = wrap(y0 + 1, n) * n;
  const i00 = (ya + xa) * 3;
  const i10 = (ya + xb) * 3;
  const i01 = (yb + xa) * 3;
  const i11 = (yb + xb) * 3;
  const w00 = (1 - fx) * (1 - fy) * w;
  const w10 = fx * (1 - fy) * w;
  const w01 = (1 - fx) * fy * w;
  const w11 = fx * fy * w;
  for (let k = 0; k < 3; k++) out[k] += d[i00 + k] * w00 + d[i10 + k] * w10 + d[i01 + k] * w01 + d[i11 + k] * w11;
}

const lodOf = (zoom) => Math.min(LEVELS - 1, Math.max(0, Math.log2(1 / zoom)));

function render(data, mips, { cx, cy, zoom }, bilinear, useMips) {
  const lod = useMips ? lodOf(zoom) : 0;
  const out = [0, 0, 0];
  const l0 = Math.floor(lod);
  const f = lod - l0;
  const l1 = Math.min(LEVELS - 1, l0 + 1);
  for (let py = 0; py < H; py++) {
    const v = (py + 0.5 - H / 2) / zoom + cy;
    for (let px = 0; px < W; px++) {
      const u = (px + 0.5 - W / 2) / zoom + cx;
      out[0] = out[1] = out[2] = 0;
      if (!useMips || lod === 0) sampleLevel(mips[0], u, v, bilinear, out, 1);
      else if (!bilinear) sampleLevel(mips[Math.round(lod)], u, v, false, out, 1);
      else {
        // Trilinear: bilinear on the two nearest levels, then a lerp.
        sampleLevel(mips[l0], u, v, true, out, 1 - f);
        if (f > 0) sampleLevel(mips[l1], u, v, true, out, f);
      }
      const j = (py * W + px) * 4;
      data[j] = Math.round(toSrgb(out[0]) * 255);
      data[j + 1] = Math.round(toSrgb(out[1]) * 255);
      data[j + 2] = Math.round(toSrgb(out[2]) * 255);
      data[j + 3] = 255;
    }
  }
}

function Track({ label, value, min, max, onChange, display, ariaLabel, ticks = [] }) {
  // Logarithmic: position is log2 of the value.
  const ref = useRef(null);
  const dragging = useRef(false);
  const lmin = Math.log2(min);
  const lmax = Math.log2(max);
  const f = (Math.log2(value) - lmin) / (lmax - lmin);
  const fromEvent = (e) => {
    const r = ref.current.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    onChange(2 ** (lmin + t * (lmax - lmin)));
  };
  const step = (d) => onChange(Math.min(max, Math.max(min, value * 2 ** d)));
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
        aria-valuenow={Number(value.toFixed(3))}
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
          const d = { ArrowLeft: -0.25, ArrowDown: -0.25, ArrowRight: 0.25, ArrowUp: 0.25 }[e.key];
          if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            onChange(e.key === "Home" ? min : max);
          } else if (d) {
            e.preventDefault();
            step(d);
          }
        }}
      >
        <div className="absolute inset-x-1.5 top-1/2">
          <div className="absolute inset-x-0 h-px bg-zinc-700" />
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute h-2 w-px -translate-y-1/2 bg-zinc-600"
              style={{ left: `${((Math.log2(t) - lmin) / (lmax - lmin)) * 100}%` }}
            />
          ))}
          <div
            className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-[#0c0c0e]"
            style={{ left: `${f * 100}%` }}
          />
        </div>
      </div>
      <span className="w-20 shrink-0 text-right text-zinc-200 [font-variant-numeric:tabular-nums]">{display}</span>
    </div>
  );
}

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function FilterDemo({ flags }) {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const mips = useMemo(makeMips, []);
  const minify = flags.has("minify");
  const start = minify ? MINIFY : START;
  const startProbe = { x: W / 2 + 3, y: H / 2 + 2 };
  const [view, setView] = useState(start);
  const [bilinear, setBilinear] = useState(!minify && !flags.has("nearest"));
  const [useMips, setUseMips] = useState(false);
  const [touched, setTouched] = useState(false);
  const [hover, setHover] = useState(null);
  const [pinned, setPinned] = useState(startProbe);
  const drag = useRef(null);

  useEffect(() => {
    if (!ctxRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctxRef.current = { ctx, image: ctx.createImageData(W, H) };
    }
    const { ctx, image } = ctxRef.current;
    render(image.data, mips, view, bilinear, useMips);
    ctx.putImageData(image, 0, 0);
  }, [mips, view, bilinear, useMips]);

  // While minified and untouched, drift slowly so the aliasing shimmers the
  // way it does in motion. Stops off screen and with reduced motion.
  const drifting = view.zoom < 1 && !touched;
  useEffect(() => {
    if (!drifting || reduced()) return;
    let raf = 0;
    let visible = false;
    const tick = () => {
      setView((v) => ({ ...v, cx: v.cx + 0.12 / v.zoom, cy: v.cy + 0.05 / v.zoom }));
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(rootRef.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [drifting]);

  const setZoom = (z) => {
    setTouched(true);
    setView((v) => ({ ...v, zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)) }));
  };
  const nudge = (d) => {
    setTouched(true);
    setView((v) => ({ ...v, zoom: Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v.zoom * 2 ** d)) }));
  };
  const reset = () => {
    setTouched(true);
    setView(start);
    setPinned(startProbe);
  };

  useDemoKeys(rootRef, {
    b: () => setBilinear((v) => !v),
    m: () => setUseMips((v) => !v),
    "-": () => nudge(-0.5),
    "=": () => nudge(0.5),
    "+": () => nudge(0.5),
    r: reset,
  });

  const toPixel = (e) => {
    const r = stageRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * W);
    const y = Math.floor(((e.clientY - r.top) / r.height) * H);
    return x >= 0 && x < W && y >= 0 && y < H ? { x, y } : null;
  };

  const { cx, cy, zoom } = view;
  const at = hover ?? pinned;
  const u = (at.x + 0.5 - W / 2) / zoom + cx;
  const v = (at.y + 0.5 - H / 2) / zoom + cy;
  const toScreenX = (tu) => (tu - cx) * zoom + W / 2;
  const toScreenY = (tv) => (tv - cy) * zoom + H / 2;
  const lod = useMips ? lodOf(zoom) : 0;
  const magnified = lod === 0;

  // The taps for the probed pixel, in unwrapped texel coordinates so they
  // draw in the right place; labels use the wrapped index.
  const x0 = Math.floor(u - 0.5);
  const y0 = Math.floor(v - 0.5);
  const fx = u - 0.5 - x0;
  const fy = v - 0.5 - y0;
  const taps = [
    { i: x0, j: y0, w: (1 - fx) * (1 - fy) },
    { i: x0 + 1, j: y0, w: fx * (1 - fy) },
    { i: x0, j: y0 + 1, w: (1 - fx) * fy },
    { i: x0 + 1, j: y0 + 1, w: fx * fy },
  ];
  const nearest = { i: Math.floor(u), j: Math.floor(v) };
  const label = (t) => `${wrap(t.i, N)},${wrap(t.j, N)}`;

  // Texel grid, only when texels are big enough to see.
  let grid = null;
  if (zoom >= 4) {
    let d = "";
    const u0 = Math.ceil(cx - W / 2 / zoom);
    const u1 = Math.floor(cx + W / 2 / zoom);
    const v0 = Math.ceil(cy - H / 2 / zoom);
    const v1 = Math.floor(cy + H / 2 / zoom);
    for (let k = u0; k <= u1; k++) d += `M${toScreenX(k).toFixed(2)},0V${H}`;
    for (let k = v0; k <= v1; k++) d += `M0,${toScreenY(k).toFixed(2)}H${W}`;
    grid = <path d={d} stroke="#FAFAFA" strokeOpacity={Math.min(0.22, (zoom - 4) * 0.04 + 0.08)} strokeWidth="1" vectorEffect="non-scaling-stroke" />;
  }

  const sx = at.x + 0.5;
  const sy = at.y + 0.5;
  let taps2d = null;
  if (magnified && zoom >= 2) {
    if (bilinear) {
      taps2d = taps.map((t) => {
        const tx = toScreenX(t.i + 0.5);
        const ty = toScreenY(t.j + 0.5);
        return (
          <g key={`${t.i},${t.j}`}>
            <line x1={sx} y1={sy} x2={tx} y2={ty} stroke={PALETTE.green} strokeOpacity={0.25 + t.w * 0.75} strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx={tx} cy={ty} r={Math.max(0.6, Math.sqrt(t.w) * Math.min(zoom, 16) * 0.32)} fill={PALETTE.green} fillOpacity="0.35" stroke={PALETTE.green} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        );
      });
    } else {
      taps2d = (
        <rect
          x={toScreenX(nearest.i)}
          y={toScreenY(nearest.j)}
          width={zoom}
          height={zoom}
          fill="none"
          stroke={PALETTE.green}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      );
    }
  }

  const covers = 1 / zoom;
  let line1;
  if (!magnified) {
    const l0 = Math.floor(lod);
    line1 = (
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">pixel ({at.x}, {at.y})</span>
        <span>mip {num(lod, 2)}</span>
        <span>
          {bilinear ? `trilinear: levels ${l0} and ${Math.min(LEVELS - 1, l0 + 1)}, ${N >> l0} and ${N >> Math.min(LEVELS - 1, l0 + 1)} texels wide` : `nearest level ${Math.round(lod)}, ${N >> Math.round(lod)} texels wide`}
        </span>
      </span>
    );
  } else if (bilinear) {
    line1 = (
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">pixel ({at.x}, {at.y})</span>
        <span>sample at {num(u - Math.floor(u / N) * N)}, {num(v - Math.floor(v / N) * N)}</span>
        <span>
          {taps.map((t, k) => (
            <span key={k} className="mr-2 inline-block">
              <span className="text-zinc-500">{label(t)}</span> <span style={{ color: PALETTE.green }}>{num(t.w)}</span>
            </span>
          ))}
        </span>
      </span>
    );
  } else {
    line1 = (
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">pixel ({at.x}, {at.y})</span>
        <span>sample at {num(u - Math.floor(u / N) * N)}, {num(v - Math.floor(v / N) * N)}</span>
        <span>
          one texel <span style={{ color: PALETTE.green }}>{label(nearest)}</span>, weight 1
        </span>
      </span>
    );
  }
  const line2 = (
    <span className="flex flex-wrap gap-x-4">
      {zoom >= 1 ? (
        <span>{num(zoom, 1)} pixels per texel</span>
      ) : (
        <span>
          one pixel spans <span style={{ color: useMips ? undefined : PALETTE.coral }}>{num(covers, 1)}</span> texels
        </span>
      )}
      {zoom < 1 && !useMips && <span>but reads {bilinear ? "only 4" : "only 1"}, so detail in between is skipped</span>}
      {zoom < 1 && useMips && <span>a smaller mip averages them first</span>}
      {zoom >= 1 && <span>{bilinear ? "four nearest texel centers, blended by distance" : "the texel the sample lands in"}</span>}
    </span>
  );

  return (
    <div ref={rootRef}>
      <div
        ref={stageRef}
        className="relative cursor-grab touch-none select-none bg-[#111114] active:cursor-grabbing"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) {
            if (e.pointerType === "mouse") setHover(toPixel(e));
            return;
          }
          const dx = e.clientX - d.x;
          const dy = e.clientY - d.y;
          if (!d.moved && Math.hypot(dx, dy) < 4) return;
          d.moved = true;
          d.x = e.clientX;
          d.y = e.clientY;
          setTouched(true);
          const scale = W / stageRef.current.getBoundingClientRect().width;
          setView((vw) => ({ ...vw, cx: vw.cx - (dx * scale) / vw.zoom, cy: vw.cy - (dy * scale) / vw.zoom }));
          if (e.pointerType === "mouse") setHover(toPixel(e));
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          if (d && !d.moved) {
            const p = toPixel(e);
            if (p) setPinned(p);
          }
        }}
        onPointerCancel={() => (drag.current = null)}
        onPointerLeave={() => setHover(null)}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block w-full"
          style={{ imageRendering: "pixelated", aspectRatio: `${W} / ${H}` }}
          role="img"
          aria-label="A small repeating pixel art texture, sampled with nearest or bilinear filtering"
        />
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
          {grid}
          {taps2d}
          <rect x={at.x} y={at.y} width={1} height={1} fill="none" stroke="#FAFAFA" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cx={sx} cy={sy} r={Math.max(0.5, Math.min(1.6, zoom * 0.12))} fill={PALETTE.coral} />
        </svg>
      </div>

      <Track
        label="zoom"
        value={zoom}
        min={ZOOM_MIN}
        max={ZOOM_MAX}
        onChange={setZoom}
        display={zoom >= 1 ? `${num(zoom, 1)}x` : `1/${num(1 / zoom, 1)}x`}
        ariaLabel="Zoom, in screen pixels per texel"
        ticks={[1]}
      />

      <Strip
        readout={
          <span className="flex flex-col">
            {line1}
            {line2}
          </span>
        }
      >
        <Key k="b" on={bilinear} onClick={() => setBilinear((x) => !x)}>
          Bilinear
        </Key>
        <Key k="m" on={useMips} onClick={() => setUseMips((x) => !x)}>
          Mipmaps
        </Key>
        <Key k="r" onClick={reset}>
          Reset
        </Key>
      </Strip>
    </div>
  );
}
