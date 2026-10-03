import { useId } from "react";
import { useDragPoints } from "./useDragPoints";

// Two vectors from the origin. Shows a · b, the angle between them, and b
// projected onto a. SVG y points down, so math y is the negated SVG y.

const R = 5; // half width
const V = 3; // half height
const clamp = (p) => ({ x: Math.min(R - 0.2, Math.max(-R + 0.2, p.x)), y: Math.min(V - 0.2, Math.max(-V + 0.2, p.y)) });
const fmt = (n) => (Math.abs(n) < 0.005 ? "0.00" : n.toFixed(2));

function Arrow({ to, color, markerId }) {
  return (
    <line x1={0} y1={0} x2={to.x} y2={to.y} stroke={color} strokeWidth="0.08" markerEnd={`url(#${markerId})`} />
  );
}

export default function DotProductDemo() {
  const { points, svgRef, handleProps } = useDragPoints([{ x: 3.5, y: -0.8 }, { x: 1.2, y: -2.3 }], { clamp });
  const id = useId().replace(/:/g, "");
  const [pa, pb] = points;
  const a = { x: pa.x, y: -pa.y };
  const b = { x: pb.x, y: -pb.y };

  const dot = a.x * b.x + a.y * b.y;
  const la = Math.hypot(a.x, a.y);
  const lb = Math.hypot(b.x, b.y);
  const cos = la && lb ? Math.max(-1, Math.min(1, dot / (la * lb))) : 0;
  const angle = (Math.acos(cos) * 180) / Math.PI;
  // b projected onto a's direction (in SVG coordinates for drawing).
  const t = la ? dot / (la * la) : 0;
  const proj = { x: pa.x * t, y: pa.y * t };
  const sign = dot > 0.005 ? "positive" : dot < -0.005 ? "negative" : "zero";

  return (
    <div>
      <svg ref={svgRef} viewBox={`${-R} ${-V} ${2 * R} ${2 * V}`} className="block w-full select-none" role="img"
        aria-label={`Vector a and vector b, dot product ${fmt(dot)}`}
      >
        <defs>
          {[["a", "#34D399"], ["b", "#E4E4E7"]].map(([k, c]) => (
            <marker key={k} id={`${id}-${k}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={c} />
            </marker>
          ))}
        </defs>
        <g>
          <g stroke="#27272A" strokeWidth="0.02">
            {Array.from({ length: 2 * R + 1 }, (_, i) => i - R).map((v) => <line key={`v${v}`} x1={v} y1={-V} x2={v} y2={V} />)}
            {Array.from({ length: 2 * V + 1 }, (_, i) => i - V).map((v) => <line key={`h${v}`} x1={-R} y1={v} x2={R} y2={v} />)}
          </g>
          <g stroke="#3F3F46" strokeWidth="0.04">
            <line x1={-R} y1={0} x2={R} y2={0} />
            <line x1={0} y1={-V} x2={0} y2={V} />
          </g>

          {/* the line through a, and b's shadow on it */}
          <line x1={-pa.x * 10} y1={-pa.y * 10} x2={pa.x * 10} y2={pa.y * 10} stroke="#34D399" strokeOpacity="0.15" strokeWidth="0.04" />
          <line x1={pb.x} y1={pb.y} x2={proj.x} y2={proj.y} stroke="#A1A1AA" strokeDasharray="0.12 0.1" strokeWidth="0.04" />
          <line x1={0} y1={0} x2={proj.x} y2={proj.y} stroke={dot >= 0 ? "#34D399" : "#F87171"} strokeOpacity="0.6" strokeWidth="0.22" strokeLinecap="round" />

          <Arrow to={pa} color="#34D399" markerId={`${id}-a`} />
          <Arrow to={pb} color="#E4E4E7" markerId={`${id}-b`} />

          <text x={pa.x + 0.25} y={pa.y - 0.25} fontSize="0.45" fill="#34D399" className="font-mono">a</text>
          <text x={pb.x + 0.25} y={pb.y - 0.25} fontSize="0.45" fill="#E4E4E7" className="font-mono">b</text>

          {points.map((p, i) => (
            <g key={i} {...handleProps(i)} aria-label={i === 0 ? "Tip of a" : "Tip of b"} className="group outline-none">
              <circle cx={p.x} cy={p.y} r={0.6} fill="transparent" />
              <circle cx={p.x} cy={p.y} r={0.16} fill="#0f0f12" stroke={i === 0 ? "#34D399" : "#E4E4E7"} strokeWidth="0.06"
                className="transition-[r] group-hover:[r:0.24] group-focus-visible:[r:0.24]" />
            </g>
          ))}
        </g>
      </svg>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-t border-border/70 px-5 py-4 font-mono text-sm sm:grid-cols-4">
        <div>
          <dt className="font-sans text-xs text-muted">a</dt>
          <dd className="text-accent">({fmt(a.x)}, {fmt(a.y)})</dd>
        </div>
        <div>
          <dt className="font-sans text-xs text-muted">b</dt>
          <dd className="text-zinc-200">({fmt(b.x)}, {fmt(b.y)})</dd>
        </div>
        <div>
          <dt className="font-sans text-xs text-muted">a · b ({sign})</dt>
          <dd className="text-lg text-text">{fmt(dot)}</dd>
        </div>
        <div>
          <dt className="font-sans text-xs text-muted">angle</dt>
          <dd className="text-lg text-text">{angle.toFixed(1)}°</dd>
        </div>
      </dl>
    </div>
  );
}
