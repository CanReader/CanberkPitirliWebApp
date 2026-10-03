import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useDragPoints } from "./useDragPoints";
import { Handle, Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// A tiny software rasterizer on a 20x12 pixel grid. Every pixel center in
// the triangle's bounding box is tested against the three edge functions,
// exactly as the post describes, and covered pixels get the vertex colors
// blended by their barycentric weights. Hovering a pixel shows its weights.
// The "quads" flag groups pixels into 2x2 quads and shows helper lanes.

const W = 20;
const H = 12;
const START = [
  { x: 3.4, y: 1.7 },
  { x: 17.3, y: 4.6 },
  { x: 7.2, y: 10.6 },
];
const TINY = [
  { x: 9.3, y: 5.2 },
  { x: 10.9, y: 5.6 },
  { x: 9.8, y: 6.9 },
];
const COLORS = [PALETTE.coral, PALETTE.green, PALETTE.blue];
const RGB = COLORS.map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));

const clamp = (p) => ({ x: Math.min(W, Math.max(0, p.x)), y: Math.min(H, Math.max(0, p.y)) });

function edge(a, b, p) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

// Barycentric weights of p. Dividing by the signed area makes the test the
// same for either winding: inside means all three weights are >= 0.
function weights([v0, v1, v2], p) {
  const area = edge(v0, v1, v2);
  if (Math.abs(area) < 1e-6) return null;
  return [edge(v1, v2, p) / area, edge(v2, v0, p) / area, edge(v0, v1, p) / area];
}

function bbox(pts) {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return {
    x0: Math.max(0, Math.floor(Math.min(...xs))),
    y0: Math.max(0, Math.floor(Math.min(...ys))),
    x1: Math.min(W - 1, Math.ceil(Math.max(...xs)) - 1),
    y1: Math.min(H - 1, Math.ceil(Math.max(...ys)) - 1),
  };
}

function rasterize(pts) {
  const covered = new Map(); // index -> rgb string
  const box = bbox(pts);
  for (let y = box.y0; y <= box.y1; y++) {
    for (let x = box.x0; x <= box.x1; x++) {
      const w = weights(pts, { x: x + 0.5, y: y + 0.5 });
      if (!w || w.some((v) => v < 0)) continue;
      const c = [0, 1, 2].map((k) => Math.round(w[0] * RGB[0][k] + w[1] * RGB[1][k] + w[2] * RGB[2][k]));
      covered.set(y * W + x, `rgb(${c.join(",")})`);
    }
  }
  return { covered, box };
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

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function RasterizerDemo({ flags }) {
  const rootRef = useRef(null);
  const { points, animateTo, svgRef, toSvg, handleProps, touched, dragging } = useDragPoints(START, { clamp });
  const [showQuads, setShowQuads] = useState(flags.has("quads"));
  const [probe, setProbe] = useState(null);
  const [scan, setScan] = useState(null); // number of bbox pixels visited so far
  const scanRaf = useRef(0);

  const { covered, box } = useMemo(() => rasterize(points), [points]);
  const { quads, helpers } = useMemo(() => quadsOf(covered), [covered]);
  const lanes = quads.length * 4;
  const boxW = box.x1 - box.x0 + 1;
  const boxCells = Math.max(0, boxW * (box.y1 - box.y0 + 1));
  const patternId = `helper-${useId().replace(/:/g, "")}`;

  // Walk the bounding box one pixel per frame so you can watch the test run.
  const startScan = () => {
    cancelAnimationFrame(scanRaf.current);
    if (reduced()) return setScan(null);
    let n = 0;
    const tick = () => {
      n += 1;
      setScan(n);
      if (n < boxCells) scanRaf.current = requestAnimationFrame(tick);
      else setTimeout(() => setScan(null), 500);
    };
    scanRaf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(scanRaf.current), []);
  useEffect(() => {
    cancelAnimationFrame(scanRaf.current);
    setScan(null);
  }, [points]);

  useDemoKeys(rootRef, {
    q: () => setShowQuads((v) => !v),
    s: startScan,
    t: () => animateTo(TINY),
    r: () => animateTo(START),
  });

  // Mouse probes on hover; touch probes on tap.
  const probeAt = (e) => {
    const p = toSvg(e);
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);
    setProbe(x >= 0 && x < W && y >= 0 && y < H ? { x, y } : null);
  };

  const visited = (x, y) => {
    if (scan == null) return true;
    if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) return false;
    return (y - box.y0) * boxW + (x - box.x0) < scan;
  };
  const scanAt = scan != null && scan <= boxCells ? { x: box.x0 + ((scan - 1) % boxW), y: box.y0 + Math.floor((scan - 1) / boxW) } : null;

  // What the probe (hovered pixel, or the scan cursor) sees.
  const focus = scanAt ?? (dragging == null ? probe : null);
  const focusW = focus && weights(points, { x: focus.x + 0.5, y: focus.y + 0.5 });
  const failing = focusW ? [0, 1, 2].filter((k) => focusW[k] < 0) : [];

  const cells = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!visited(x, y)) continue;
      if (covered.has(i)) cells.push(<rect key={i} x={x} y={y} width={1} height={1} fill={covered.get(i)} fillOpacity={0.92} />);
      else if (showQuads && helpers.has(i)) cells.push(<rect key={i} x={x} y={y} width={1} height={1} fill={`url(#${patternId})`} />);
    }
  }

  const readout = focus ? (
    <span className="flex flex-wrap gap-x-4">
      <span className="text-zinc-200">
        pixel ({focus.x}, {focus.y})
      </span>
      {focusW ? (
        <>
          {focusW.map((w, k) => (
            <span key={k} style={{ color: w < 0 ? PALETTE.bad : COLORS[k] }}>
              w{k} {num(w)}
            </span>
          ))}
          <span className={failing.length ? "text-zinc-500" : "text-zinc-100"}>
            {failing.length ? `outside edge ${failing.map((k) => `v${(k + 1) % 3}v${(k + 2) % 3}`).join(", ")}` : "inside"}
          </span>
        </>
      ) : (
        <span>degenerate triangle</span>
      )}
    </span>
  ) : showQuads ? (
    <span className="flex flex-wrap gap-x-4">
      <span className="text-zinc-200">{covered.size} pixels</span>
      <span>{quads.length} quads</span>
      <span>{lanes} lanes shaded</span>
      <span className={lanes && (lanes - covered.size) / lanes > 0.4 ? "text-[#F2735E]" : ""}>
        {lanes ? Math.round(((lanes - covered.size) / lanes) * 100) : 0}% helpers
      </span>
    </span>
  ) : (
    <span className="flex flex-wrap gap-x-4">
      <span className="text-zinc-200">{covered.size} pixels covered</span>
      <span>{boxCells} tested</span>
      {!touched && <span className="text-zinc-500">drag a corner, or point at a pixel</span>}
    </span>
  );

  return (
    <div ref={rootRef}>
      <svg
        ref={svgRef}
        viewBox={`-0.4 -0.4 ${W + 0.8} ${H + 0.8}`}
        className="block w-full touch-pan-y select-none"
        role="img"
        aria-label={`A ${W} by ${H} pixel grid with a triangle covering ${covered.size} pixels`}
        onPointerMove={(e) => dragging == null && probeAt(e)}
        onPointerDown={(e) => e.pointerType !== "mouse" && probeAt(e)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setProbe(null)}
      >
        <defs>
          <pattern id={patternId} width="0.3" height="0.3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="0.3" stroke="#E4E4E7" strokeOpacity="0.35" strokeWidth="0.07" />
          </pattern>
        </defs>

        <rect x={0} y={0} width={W} height={H} fill="#111114" />
        {cells}

        <g stroke="#232327" strokeWidth="0.035">
          {Array.from({ length: W + 1 }, (_, x) => <line key={`v${x}`} x1={x} y1={0} x2={x} y2={H} />)}
          {Array.from({ length: H + 1 }, (_, y) => <line key={`h${y}`} x1={0} y1={y} x2={W} y2={y} />)}
        </g>

        {/* the rasterizer only tests pixels inside the bounding box */}
        {boxCells > 0 && (
          <rect
            x={box.x0}
            y={box.y0}
            width={boxW}
            height={box.y1 - box.y0 + 1}
            fill="none"
            stroke="#71717A"
            strokeWidth="0.05"
            strokeDasharray="0.2 0.16"
            opacity={scan != null || focus ? 0.9 : 0.35}
          />
        )}
        <g>
          {Array.from({ length: boxCells }, (_, n) => {
            const x = box.x0 + (n % boxW);
            const y = box.y0 + Math.floor(n / boxW);
            if (!visited(x, y)) return null;
            return <circle key={n} cx={x + 0.5} cy={y + 0.5} r={0.06} fill={covered.has(y * W + x) ? "#0c0c0e" : "#52525B"} />;
          })}
        </g>

        {showQuads && (
          <g fill="none" stroke="#E4E4E7" strokeOpacity="0.55" strokeWidth="0.06">
            {quads.map((q) => <rect key={`${q.x},${q.y}`} x={q.x + 0.04} y={q.y + 0.04} width={1.92} height={1.92} rx={0.12} />)}
          </g>
        )}

        {/* edges; any edge the probed pixel fails is called out */}
        {[0, 1, 2].map((k) => {
          const a = points[(k + 1) % 3];
          const b = points[(k + 2) % 3];
          const bad = failing.includes(k);
          return (
            <line
              key={k}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={bad ? PALETTE.bad : "#E4E4E7"}
              strokeOpacity={bad ? 1 : 0.85}
              strokeWidth={bad ? 0.1 : 0.055}
              strokeLinecap="round"
            />
          );
        })}

        {focus && (
          <g pointerEvents="none">
            <rect x={focus.x} y={focus.y} width={1} height={1} fill="none" stroke="#FAFAFA" strokeWidth="0.07" />
            {focusW &&
              points.map((v, k) => (
                <line key={k} x1={focus.x + 0.5} y1={focus.y + 0.5} x2={v.x} y2={v.y} stroke={COLORS[k]} strokeOpacity="0.45" strokeWidth="0.035" strokeDasharray="0.12 0.1" />
              ))}
          </g>
        )}

        {points.map((p, i) => {
          // put each label on the outside of its corner
          const cx = (points[0].x + points[1].x + points[2].x) / 3;
          const cy = (points[0].y + points[1].y + points[2].y) / 3;
          const len = Math.hypot(p.x - cx, p.y - cy) || 1;
          return (
          <Handle
            key={i}
            {...handleProps(i, `Vertex v${i}`)}
            x={p.x}
            y={p.y}
            r={0.28}
            color={COLORS[i]}
            hint={!touched && i === 1}
            active={dragging === i}
            label={`v${i}`}
            labelDx={((p.x - cx) / len) * 0.75 - 0.25}
            labelDy={((p.y - cy) / len) * 0.75 + 0.17}
            fontSize={0.5}
          />
          );
        })}
      </svg>

      <Strip readout={readout}>
        <Key k="q" on={showQuads} onClick={() => setShowQuads((v) => !v)}>Quads</Key>
        <Key k="s" onClick={startScan}>Scan</Key>
        <Key k="t" onClick={() => animateTo(TINY)}>Tiny</Key>
        <Key k="r" onClick={() => animateTo(START)}>Reset</Key>
      </Strip>
    </div>
  );
}
