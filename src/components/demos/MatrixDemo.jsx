import { useRef } from "react";
import { useDragPoints } from "./useDragPoints";
import { Handle, Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// A 2x2 matrix shown as what it does: drag where the x axis (i) and the
// y axis (j) land, and the grid, the unit cell and an F shape follow. The F
// is there because it isn't symmetric, so a flip is obvious. SVG y points
// down; the math uses y up.

const R = 6;
const V = 3.4;
const UNIT = 1.8; // one math unit in svg units, so the grid has room
const I = PALETTE.green;
const J = PALETTE.blue;
const IDENTITY = [
  { x: UNIT, y: 0 },
  { x: 0, y: -UNIT },
];
// The letter F as a polygon in unit coordinates.
const F_SHAPE = [
  [0.15, 0.1],
  [0.35, 0.1],
  [0.35, 0.5],
  [0.65, 0.5],
  [0.65, 0.65],
  [0.35, 0.65],
  [0.35, 0.8],
  [0.8, 0.8],
  [0.8, 0.95],
  [0.15, 0.95],
];

const clamp = (p) => ({ x: Math.min(R - 0.3, Math.max(-R + 0.3, p.x)), y: Math.min(V - 0.3, Math.max(-V + 0.3, p.y)) });

function rotate(points, deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  // rotating counterclockwise in math space is clockwise in svg space
  return points.map((p) => ({ x: p.x * c + p.y * s, y: -p.x * s + p.y * c }));
}

export default function MatrixDemo() {
  const rootRef = useRef(null);
  const { points, animateTo, svgRef, handleProps, touched, dragging } = useDragPoints(
    [
      { x: UNIT * 1.1, y: -UNIT * 0.35 },
      { x: UNIT * 0.4, y: -UNIT * 0.95 },
    ],
    { clamp },
  );
  const [pi, pj] = points;
  // math-space columns of the matrix
  const a = pi.x / UNIT;
  const b = -pi.y / UNIT;
  const c = pj.x / UNIT;
  const d = -pj.y / UNIT;
  const det = a * d - b * c;
  const map = (x, y) => ({ x: pi.x * x + pj.x * y, y: pi.y * x + pj.y * y });

  useDemoKeys(rootRef, {
    i: () => animateTo(IDENTITY),
    o: () => animateTo(rotate(points, 30)),
    s: () => animateTo([{ x: UNIT, y: 0 }, { x: UNIT * 0.8, y: -UNIT }]),
    f: () => animateTo([{ x: -pi.x, y: -pi.y }, pj]),
  });

  const lines = [];
  for (let k = -8; k <= 8; k++) {
    const p0 = map(k, -8);
    const p1 = map(k, 8);
    const q0 = map(-8, k);
    const q1 = map(8, k);
    lines.push(<line key={`a${k}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} />, <line key={`b${k}`} x1={q0.x} y1={q0.y} x2={q1.x} y2={q1.y} />);
  }
  const cell = [map(0, 0), map(1, 0), map(1, 1), map(0, 1)];
  const fShape = F_SHAPE.map(([x, y]) => map(x, y));
  const flipped = det < -0.005;
  const flat = Math.abs(det) <= 0.005;

  const readout = (
    <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
      <span className="inline-grid grid-cols-2 gap-x-3 border-x border-zinc-600 px-2 leading-5">
        <span style={{ color: I }}>{num(a)}</span>
        <span style={{ color: J }}>{num(c)}</span>
        <span style={{ color: I }}>{num(b)}</span>
        <span style={{ color: J }}>{num(d)}</span>
      </span>
      <span className="text-zinc-200">det {num(det)}</span>
      <span className="text-zinc-500">{flat ? "squashed flat, no inverse" : flipped ? "flipped: winding reverses" : "keeps orientation"}</span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <svg ref={svgRef} viewBox={`${-R} ${-V} ${2 * R} ${2 * V}`} className="block w-full touch-pan-y select-none" role="img" aria-label={`A 2 by 2 matrix with determinant ${num(det)}`}>
        <rect x={-R} y={-V} width={2 * R} height={2 * V} fill="#111114" />
        {/* the untouched grid, faint, for reference */}
        <g stroke="#1E1E22" strokeWidth="0.025">
          {Array.from({ length: 17 }, (_, k) => (k - 8) * UNIT).map((v) => (
            <g key={v}>
              <line x1={v} y1={-V} x2={v} y2={V} />
              <line x1={-R} y1={v} x2={R} y2={v} />
            </g>
          ))}
        </g>
        <g stroke="#3F3F46" strokeWidth="0.03">{lines}</g>
        <polygon points={cell.map((p) => `${p.x},${p.y}`).join(" ")} fill={flipped ? PALETTE.coral : I} fillOpacity="0.14" />
        <polygon points={fShape.map((p) => `${p.x},${p.y}`).join(" ")} fill="#E4E4E7" fillOpacity="0.9" />

        <line x1={0} y1={0} x2={pi.x} y2={pi.y} stroke={I} strokeWidth="0.07" strokeLinecap="round" />
        <line x1={0} y1={0} x2={pj.x} y2={pj.y} stroke={J} strokeWidth="0.07" strokeLinecap="round" />
        <Handle {...handleProps(0, "Where the x axis lands")} x={pi.x} y={pi.y} r={0.14} color={I} hint={!touched} active={dragging === 0} label="i" labelDx={0.24} labelDy={-0.2} fontSize={0.42} />
        <Handle {...handleProps(1, "Where the y axis lands")} x={pj.x} y={pj.y} r={0.14} color={J} active={dragging === 1} label="j" labelDx={0.24} labelDy={-0.2} fontSize={0.42} />
      </svg>

      <Strip readout={readout}>
        <Key k="o" onClick={() => animateTo(rotate(points, 30))}>Rotate 30°</Key>
        <Key k="s" onClick={() => animateTo([{ x: UNIT, y: 0 }, { x: UNIT * 0.8, y: -UNIT }])}>Shear</Key>
        <Key k="f" onClick={() => animateTo([{ x: -pi.x, y: -pi.y }, pj])}>Flip</Key>
        <Key k="i" onClick={() => animateTo(IDENTITY)}>Identity</Key>
      </Strip>
    </div>
  );
}
