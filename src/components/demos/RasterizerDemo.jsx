import { useId, useMemo, useState } from "react";
import { useDragPoints } from "./useDragPoints";

// A tiny software rasterizer on a 20x12 pixel grid. Each pixel's center is
// tested against the triangle's three edge functions, exactly as the post
// describes. With the "quads" flag the grid is split into 2x2 quads and the
// pixels a quad shades without covering them (helper lanes) are shown too.

const W = 20;
const H = 12;
const START = [
  { x: 3.2, y: 1.6 },
  { x: 17.4, y: 4.3 },
  { x: 6.8, y: 10.7 },
];
const TINY = [
  { x: 9.3, y: 5.2 },
  { x: 10.9, y: 5.6 },
  { x: 9.8, y: 6.9 },
];

const clamp = (p) => ({ x: Math.min(W, Math.max(0, p.x)), y: Math.min(H, Math.max(0, p.y)) });

function edge(a, b, p) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

function rasterize([v0, v1, v2]) {
  // Flip the tests for the other winding so the demo works however the
  // corners are dragged. A real GPU would cull one of the two instead.
  const sign = edge(v0, v1, v2) < 0 ? -1 : 1;
  const covered = new Set();
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = { x: x + 0.5, y: y + 0.5 };
      if (sign * edge(v0, v1, p) >= 0 && sign * edge(v1, v2, p) >= 0 && sign * edge(v2, v0, p) >= 0) {
        covered.add(y * W + x);
      }
    }
  }
  return covered;
}

// Every 2x2 quad with at least one covered pixel runs all four lanes.
function quadsOf(covered) {
  const quads = [];
  const helpers = new Set();
  for (let qy = 0; qy < H; qy += 2) {
    for (let qx = 0; qx < W; qx += 2) {
      const lanes = [qy * W + qx, qy * W + qx + 1, (qy + 1) * W + qx, (qy + 1) * W + qx + 1];
      if (!lanes.some((i) => covered.has(i))) continue;
      quads.push({ x: qx, y: qy });
      for (const i of lanes) if (!covered.has(i)) helpers.add(i);
    }
  }
  return { quads, helpers };
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-mono text-lg text-text">{value}</dd>
    </div>
  );
}

function Toggle({ on, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors active:scale-[0.98] ${
        on ? "border-accent/50 text-accent" : "border-border text-muted hover:border-muted/50 hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

export default function RasterizerDemo({ flags }) {
  const { points, setPoints, svgRef, handleProps } = useDragPoints(START, { clamp });
  const [showQuads, setShowQuads] = useState(flags.has("quads"));
  const [showCenters, setShowCenters] = useState(!flags.has("quads"));

  const covered = useMemo(() => rasterize(points), [points]);
  const { quads, helpers } = useMemo(() => quadsOf(covered), [covered]);
  const lanes = quads.length * 4;
  const patternId = `helper-${useId().replace(/:/g, "")}`;

  const cells = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const fill = covered.has(i)
        ? "rgba(52, 211, 153, 0.7)"
        : showQuads && helpers.has(i)
          ? `url(#${patternId})`
          : "transparent";
      cells.push(<rect key={i} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  }

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`-0.3 -0.3 ${W + 0.6} ${H + 0.6}`}
        className="block w-full select-none"
        role="img"
        aria-label={`A ${W} by ${H} pixel grid with a triangle covering ${covered.size} pixels`}
      >
        <defs>
          <pattern id={patternId} width="0.25" height="0.25" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="0.25" height="0.25" fill="#34D399" fillOpacity="0.08" />
            <line x1="0" y1="0" x2="0" y2="0.25" stroke="#34D399" strokeOpacity="0.55" strokeWidth="0.06" />
          </pattern>
        </defs>

        {cells}

        {/* pixel grid */}
        <g stroke="#27272A" strokeWidth="0.03">
          {Array.from({ length: W + 1 }, (_, x) => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} />)}
          {Array.from({ length: H + 1 }, (_, y) => <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} />)}
        </g>

        {showQuads && (
          <g fill="none" stroke="#A1A1AA" strokeOpacity="0.7" strokeWidth="0.06">
            {quads.map((q) => <rect key={`${q.x},${q.y}`} x={q.x} y={q.y} width={2} height={2} rx={0.08} />)}
          </g>
        )}

        {showCenters && (
          <g>
            {Array.from({ length: W * H }, (_, i) => (
              <circle
                key={i}
                cx={(i % W) + 0.5}
                cy={Math.floor(i / W) + 0.5}
                r={0.07}
                className={covered.has(i) ? "fill-[#0f0f12]" : "fill-zinc-600"}
              />
            ))}
          </g>
        )}

        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#E4E4E7"
          strokeWidth="0.06"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <g key={i} {...handleProps(i)} aria-label={`Corner ${i + 1}`} className="group outline-none">
            <circle cx={p.x} cy={p.y} r={0.9} fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r={0.32}
              className="fill-[#0f0f12] stroke-accent transition-[r] group-hover:[r:0.42] group-focus-visible:[r:0.42]"
              strokeWidth="0.1"
            />
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-t border-border/70 px-5 py-4">
        <dl className="flex flex-wrap gap-x-8 gap-y-2">
          <Stat label="Pixels covered" value={covered.size} />
          {showQuads && (
            <>
              <Stat label="2x2 quads" value={quads.length} />
              <Stat label="Lanes shaded" value={lanes} />
              <Stat label="Helper lanes" value={lanes ? `${Math.round(((lanes - covered.size) / lanes) * 100)}%` : "0%"} />
            </>
          )}
        </dl>
        <div className="flex flex-wrap gap-2">
          <Toggle on={showCenters} onClick={() => setShowCenters((v) => !v)}>Centers</Toggle>
          <Toggle on={showQuads} onClick={() => setShowQuads((v) => !v)}>Quads</Toggle>
          <Toggle on={false} onClick={() => setPoints(TINY)}>Tiny triangle</Toggle>
          <Toggle on={false} onClick={() => setPoints(START)}>Reset</Toggle>
        </div>
      </div>
    </div>
  );
}
