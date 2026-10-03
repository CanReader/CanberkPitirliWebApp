import { useRef, useState } from "react";
import { useDragPoints } from "./useDragPoints";
import { Handle, Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// Two vectors from the origin. The half of the plane "in front of" a is
// tinted, b's shadow on a is drawn, and the readout writes out the actual
// arithmetic. SVG y points down, so math y is the negated SVG y.

const R = 6; // half width
const V = 3.4; // half height
const START = [{ x: 3.5, y: -0.8 }, { x: 1.2, y: -2.3 }];
const A = PALETTE.green;
const B = PALETTE.ink;

function Arrow({ to, color, width = 0.07 }) {
  const full = Math.hypot(to.x, to.y);
  if (full < 0.3) return null;
  // stop short of the tip so the head doesn't hide the handle
  const len = full - 0.16;
  const ux = to.x / full;
  const uy = to.y / full;
  const tip = { x: ux * len, y: uy * len };
  const head = Math.min(0.32, len * 0.4);
  const bx = tip.x - ux * head;
  const by = tip.y - uy * head;
  return (
    <g>
      <line x1={0} y1={0} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <path d={`M${tip.x},${tip.y} L${bx - uy * head * 0.55},${by + ux * head * 0.55} L${bx + uy * head * 0.55},${by - ux * head * 0.55} Z`} fill={color} />
    </g>
  );
}

export default function DotProductDemo() {
  const rootRef = useRef(null);
  const [snap, setSnap] = useState(false);
  const [unit, setUnit] = useState(false);
  const clamp = (p) => {
    const q = snap ? { x: Math.round(p.x * 2) / 2, y: Math.round(p.y * 2) / 2 } : p;
    return { x: Math.min(R - 0.3, Math.max(-R + 0.3, q.x)), y: Math.min(V - 0.3, Math.max(-V + 0.3, q.y)) };
  };
  const { points, animateTo, svgRef, handleProps, touched, dragging } = useDragPoints(START, { clamp });

  useDemoKeys(rootRef, {
    n: () => setUnit((v) => !v),
    g: () => setSnap((v) => !v),
    r: () => animateTo(START),
  });

  const [ra, pb] = points;
  const raLen = Math.hypot(ra.x, ra.y);
  // With "unit" on, a is drawn and used at length 1 but the handle stays put.
  const pa = unit && raLen > 0 ? { x: ra.x / raLen, y: ra.y / raLen } : ra;
  const a = { x: pa.x, y: -pa.y };
  const b = { x: pb.x, y: -pb.y };
  const dot = a.x * b.x + a.y * b.y;
  const la = Math.hypot(a.x, a.y);
  const lb = Math.hypot(b.x, b.y);
  const cos = la && lb ? Math.max(-1, Math.min(1, dot / (la * lb))) : 0;
  const angle = (Math.acos(cos) * 180) / Math.PI;
  const t = la ? dot / (la * la) : 0;
  const proj = { x: pa.x * t, y: pa.y * t };
  const facing = Math.abs(cos) < 0.02 ? "perpendicular" : dot > 0 ? "in front of a" : "behind a";

  // Angle arc from a to b, drawn the short way round.
  const angA = Math.atan2(pa.y, pa.x);
  const angB = Math.atan2(pb.y, pb.x);
  let sweep = angB - angA;
  if (sweep > Math.PI) sweep -= 2 * Math.PI;
  if (sweep < -Math.PI) sweep += 2 * Math.PI;
  const arcR = Math.min(0.9, la * 0.6, lb * 0.6);
  const arcEnd = { x: Math.cos(angA + sweep) * arcR, y: Math.sin(angA + sweep) * arcR };
  const arcMid = { x: Math.cos(angA + sweep / 2) * (arcR + 0.45), y: Math.sin(angA + sweep / 2) * (arcR + 0.45) };

  // The half-plane where dot(a, p) > 0, as a big polygon clipped by the svg.
  const nx = -pa.y;
  const ny = pa.x;
  const nl = Math.hypot(nx, ny) || 1;
  const far = 20;
  const half = [
    { x: (nx / nl) * far, y: (ny / nl) * far },
    { x: (nx / nl) * far + (pa.x / (la || 1)) * far, y: (ny / nl) * far + (pa.y / (la || 1)) * far },
    { x: (-nx / nl) * far + (pa.x / (la || 1)) * far, y: (-ny / nl) * far + (pa.y / (la || 1)) * far },
    { x: (-nx / nl) * far, y: (-ny / nl) * far },
  ];

  const readout = (
    <span className="flex flex-col">
      <span>
        <span className="text-zinc-500">a·b = </span>
        <span style={{ color: A }}>{num(a.x)}</span>×<span style={{ color: B }}>{num(b.x)}</span> +{" "}
        <span style={{ color: A }}>{num(a.y)}</span>×<span style={{ color: B }}>{num(b.y)}</span> ={" "}
        <span className="text-zinc-100">{num(dot)}</span>
      </span>
      <span className="flex flex-wrap gap-x-4">
        <span className="whitespace-nowrap">
          <span className="text-zinc-500">|a||b| cos θ = </span>
          {num(la)} × {num(lb)} × {num(cos)}
        </span>
        <span className="whitespace-nowrap text-zinc-200">θ {angle.toFixed(1)}°</span>
        <span className="whitespace-nowrap text-zinc-500">b is {facing}</span>
      </span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <svg ref={svgRef} viewBox={`${-R} ${-V} ${2 * R} ${2 * V}`} className="block w-full touch-pan-y select-none" role="img" aria-label={`Vectors a and b, dot product ${num(dot)}`}>
        <rect x={-R} y={-V} width={2 * R} height={2 * V} fill="#111114" />
        <polygon points={half.map((p) => `${p.x},${p.y}`).join(" ")} fill={A} fillOpacity="0.05" />
        <g stroke="#232327" strokeWidth="0.025">
          {Array.from({ length: 2 * R + 1 }, (_, i) => i - R).map((v) => <line key={`v${v}`} x1={v} y1={-V} x2={v} y2={V} />)}
          {Array.from({ length: 7 }, (_, i) => i - 3).map((v) => <line key={`h${v}`} x1={-R} y1={v} x2={R} y2={v} />)}
        </g>
        <g stroke="#3F3F46" strokeWidth="0.035">
          <line x1={-R} y1={0} x2={R} y2={0} />
          <line x1={0} y1={-V} x2={0} y2={V} />
        </g>

        {/* the line a lies on, and the boundary between front and behind */}
        <line x1={-pa.x * 20} y1={-pa.y * 20} x2={pa.x * 20} y2={pa.y * 20} stroke={A} strokeOpacity="0.18" strokeWidth="0.035" />
        <line x1={(-nx / nl) * 20} y1={(-ny / nl) * 20} x2={(nx / nl) * 20} y2={(ny / nl) * 20} stroke={A} strokeOpacity="0.22" strokeWidth="0.03" strokeDasharray="0.15 0.12" />

        {/* b's shadow on a */}
        <line x1={pb.x} y1={pb.y} x2={proj.x} y2={proj.y} stroke="#A1A1AA" strokeDasharray="0.1 0.09" strokeWidth="0.035" />
        <line x1={0} y1={0} x2={proj.x} y2={proj.y} stroke={dot >= 0 ? A : PALETTE.bad} strokeOpacity="0.45" strokeWidth="0.26" strokeLinecap="round" />

        {arcR > 0.15 && (
          <g>
            <path
              d={`M${Math.cos(angA) * arcR},${Math.sin(angA) * arcR} A${arcR},${arcR} 0 0 ${sweep > 0 ? 1 : 0} ${arcEnd.x},${arcEnd.y}`}
              fill="none"
              stroke="#A1A1AA"
              strokeWidth="0.035"
            />
            <text x={arcMid.x} y={arcMid.y} fontSize="0.32" fill="#A1A1AA" textAnchor="middle" dominantBaseline="middle" className="font-mono">
              θ
            </text>
          </g>
        )}

        <Arrow to={pa} color={A} />
        <Arrow to={pb} color={B} />

        {unit && raLen > 1.05 && <circle cx={ra.x} cy={ra.y} r={0.08} fill={A} fillOpacity="0.5" />}
        {points.map((p, i) => (
          <Handle
            key={i}
            {...handleProps(i, i === 0 ? "Tip of a" : "Tip of b")}
            x={i === 0 && unit ? pa.x : p.x}
            y={i === 0 && unit ? pa.y : p.y}
            r={0.13}
            color={i === 0 ? A : B}
            hint={!touched && i === 1}
            active={dragging === i}
            label={i === 0 ? "a" : "b"}
            labelDx={0.24}
            labelDy={-0.22}
            fontSize={0.42}
          />
        ))}
      </svg>

      <Strip readout={readout}>
        <Key k="n" on={unit} onClick={() => setUnit((v) => !v)}>Unit a</Key>
        <Key k="g" on={snap} onClick={() => setSnap((v) => !v)}>Snap</Key>
        <Key k="r" onClick={() => animateTo(START)}>Reset</Key>
      </Strip>
    </div>
  );
}
