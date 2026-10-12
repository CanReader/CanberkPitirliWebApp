import { useMemo, useRef, useState } from "react";
import { Key, PALETTE, Strip, useDemoKeys } from "./DemoKit";

// The same disk, triangulated two ways, rasterized on a small pixel grid with
// the real rules: pixel-center sampling, the top-left fill rule, and pixel
// shading in 2x2 quads that each triangle runs on its own. Every quad is
// tinted by how many triangles shaded it. Coverage is identical for both
// triangulations; only the shading work changes.

const W = 36;
const H = 36;
const CX = 18.21;
const CY = 18.37;
const R = 16;
const SEGMENTS = [8, 16, 32, 64];
const HEAT = ["", PALETTE.green, "#E5C07B", "#F59E0B", PALETTE.bad];

const edge = (a, b, p) => (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
const topLeft = (a, b) => (b.y === a.y && b.x > a.x) || b.y < a.y;

function rim(n) {
  return Array.from({ length: n }, (_, i) => ({
    x: CX + R * Math.cos((2 * Math.PI * i) / n),
    y: CY + R * Math.sin((2 * Math.PI * i) / n),
  }));
}

function fan(P) {
  const c = { x: CX, y: CY };
  return P.map((p, i) => [c, p, P[(i + 1) % P.length]]);
}

// For a regular polygon, splitting every index range at its midpoint gives
// the same result as greedily taking the largest remaining triangle.
function maxArea(P) {
  const n = P.length;
  const a = 0;
  const b = Math.round(n / 3);
  const c = Math.round((2 * n) / 3);
  const tris = [[P[a], P[b], P[c]]];
  const fill = (i, j) => {
    if (j - i < 2) return;
    const m = (i + j) >> 1;
    tris.push([P[i], P[m], P[j % n]]);
    fill(i, m);
    fill(m, j);
  };
  fill(a, b);
  fill(b, c);
  fill(c, n);
  return tris;
}

function shade(tris) {
  const quadCount = new Map();
  let pixels = 0;
  let lanes = 0;
  for (let [a, b, c] of tris) {
    if (edge(a, b, c) < 0) [b, c] = [c, b];
    const edges = [[b, c], [c, a], [a, b]];
    const x0 = Math.floor(Math.min(a.x, b.x, c.x));
    const x1 = Math.ceil(Math.max(a.x, b.x, c.x));
    const y0 = Math.floor(Math.min(a.y, b.y, c.y));
    const y1 = Math.ceil(Math.max(a.y, b.y, c.y));
    const mine = new Set();
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const p = { x: x + 0.5, y: y + 0.5 };
        const inside = edges.every(([u, v]) => {
          const w = edge(u, v, p);
          return w > 0 || (w === 0 && topLeft(u, v));
        });
        if (!inside) continue;
        pixels += 1;
        mine.add((y >> 1) * (W >> 1) + (x >> 1));
      }
    }
    lanes += mine.size * 4;
    for (const q of mine) quadCount.set(q, (quadCount.get(q) ?? 0) + 1);
  }
  return { quadCount, pixels, lanes };
}

export default function FanDemo() {
  const rootRef = useRef(null);
  const [mode, setMode] = useState("fan");
  const [segIdx, setSegIdx] = useState(3);
  const [probe, setProbe] = useState(null);
  const n = SEGMENTS[segIdx];

  const P = useMemo(() => rim(n), [n]);
  const tris = useMemo(() => (mode === "fan" ? fan(P) : maxArea(P)), [mode, P]);
  const { quadCount, pixels, lanes } = useMemo(() => shade(tris), [tris]);
  const other = useMemo(() => shade(mode === "fan" ? maxArea(P) : fan(P)), [mode, P]);

  const cycle = () => setSegIdx((i) => (i + 1) % SEGMENTS.length);
  useDemoKeys(rootRef, { f: () => setMode("fan"), m: () => setMode("max"), n: cycle });

  const svgRef = useRef(null);
  const probeAt = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    const qx = Math.floor(p.x / 2);
    const qy = Math.floor(p.y / 2);
    setProbe(qx >= 0 && qx < W / 2 && qy >= 0 && qy < H / 2 ? { qx, qy } : null);
  };

  const quads = [];
  for (const [q, count] of quadCount) {
    const qx = q % (W >> 1);
    const qy = Math.floor(q / (W >> 1));
    quads.push(
      <rect key={q} x={qx * 2} y={qy * 2} width={2} height={2} fill={HEAT[Math.min(count, 4)]} fillOpacity={0.18 + 0.16 * count} />
    );
  }

  const useful = lanes ? Math.round((pixels / lanes) * 100) : 0;
  const extra = other.lanes ? Math.round((lanes / other.lanes - 1) * 100) : 0;
  const probed = probe && (quadCount.get(probe.qy * (W >> 1) + probe.qx) ?? 0);

  const readout = probe ? (
    <span className="flex flex-wrap gap-x-4">
      <span className="text-zinc-200">
        quad ({probe.qx}, {probe.qy})
      </span>
      <span style={{ color: probed ? HEAT[Math.min(probed, 4)] : undefined }}>
        {probed ? `shaded ${probed}x, ${probed * 4} lanes` : "not shaded"}
      </span>
    </span>
  ) : (
    <span className="flex flex-wrap gap-x-4">
      <span className="text-zinc-200">{tris.length} triangles</span>
      <span>{pixels} pixels</span>
      <span>{lanes} lanes shaded</span>
      <span className={useful < 60 ? "text-[#F2735E]" : "text-zinc-100"}>{useful}% useful</span>
      {extra !== 0 && (
        <span className="text-zinc-500">
          {Math.abs(extra)}% {extra > 0 ? "more" : "less"} than {mode === "fan" ? "max area" : "the fan"}
        </span>
      )}
    </span>
  );

  return (
    <div ref={rootRef}>
      <svg
        ref={svgRef}
        viewBox={`-0.5 -0.5 ${W + 1} ${H + 1}`}
        className="mx-auto block w-full max-w-[460px] touch-pan-y select-none"
        role="img"
        aria-label={`A ${n}-sided disk triangulated as ${mode === "fan" ? "a center fan" : "max area"}, with each 2x2 quad tinted by how many triangles shaded it`}
        onPointerMove={probeAt}
        onPointerDown={(e) => e.pointerType !== "mouse" && probeAt(e)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setProbe(null)}
      >
        <rect x={0} y={0} width={W} height={H} fill="#111114" />
        {quads}
        <g stroke="#232327" strokeWidth="0.04">
          {Array.from({ length: W / 2 + 1 }, (_, i) => (
            <line key={`v${i}`} x1={i * 2} y1={0} x2={i * 2} y2={H} />
          ))}
          {Array.from({ length: H / 2 + 1 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 2} x2={W} y2={i * 2} />
          ))}
        </g>
        <g fill="none" stroke="#E4E4E7" strokeOpacity="0.7" strokeWidth="0.06" strokeLinejoin="round">
          {tris.map(([a, b, c], i) => (
            <polygon key={i} points={`${a.x},${a.y} ${b.x},${b.y} ${c.x},${c.y}`} />
          ))}
        </g>
        {probe && (
          <rect x={probe.qx * 2} y={probe.qy * 2} width={2} height={2} fill="none" stroke="#FAFAFA" strokeWidth="0.12" pointerEvents="none" />
        )}
      </svg>

      <Strip readout={readout}>
        <Key k="f" on={mode === "fan"} onClick={() => setMode("fan")}>Fan</Key>
        <Key k="m" on={mode === "max"} onClick={() => setMode("max")}>Max area</Key>
        <Key k="n" onClick={cycle}>{n} sides</Key>
      </Strip>
    </div>
  );
}
