import { useEffect, useRef, useState } from "react";
import { Handle, Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// Depth precision. Top: the view frustum from the side, camera on the left.
// Bottom: the depth value a standard perspective projection stores for each
// distance. Convention: view space looks down -z, z here is the positive
// distance in front of the camera, and depth runs 0..1 (D3D, Vulkan, Metal):
//
//   standard  D(z) = far (z - near) / (z (far - near))   near -> 0, far -> 1
//   reversed  D(z) = near (far - z) / (z (far - near))   near -> 1, far -> 0
//
// A real buffer has far too many values to draw, so the ticks are a coarse
// stand-in with the same spacing pattern: every Nth integer value, or for
// float a toy float with 2 mantissa bits. The numbers in the readout use the
// real format.

const W = 640;
const H = 392;
const X0 = 46;
const X1 = 620;
const DMAX = 100;
const CY = 80; // frustum center line
const SLOPE = 0.64; // frustum half height per unit of distance, in svg units
const HANDLE_Y = 152;
const GY1 = 184; // depth 1
const GY0 = 354; // depth 0
const GAP = 0.05;
const START = { near: 1, far: 80, s: 60 };
const FORMATS = [{ bits: 8 }, { bits: 16 }, { bits: 24 }, { float: true }];
const NEAR_C = PALETTE.green;
const FAR_C = PALETTE.blue;

const xOf = (d) => X0 + (d / DMAX) * (X1 - X0);
const dOf = (x) => ((x - X0) / (X1 - X0)) * DMAX;
const yOf = (D) => GY0 + (GY1 - GY0) * D;
const hh = (d) => d * SLOPE;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const depth = (z, n, f, rev) => (rev ? (n * (f - z)) / (z * (f - n)) : (f * (z - n)) / (z * (f - n)));
// Distance that a stored depth value comes from.
const distance = (D, n, f, rev) => (rev ? (n * f) / (n + D * (f - n)) : (n * f) / (f - D * (f - n)));
// |dD/dz|, the same for both directions.
const slope = (z, n, f) => (f * n) / (z * z * (f - n));

// Spacing between neighboring float32 values at x (x >= 0).
const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);
function ulp32(x) {
  f32[0] = x;
  const v = f32[0];
  u32[0] += 1;
  return f32[0] - v;
}

const stepAt = (D, fmt) => (fmt.float ? ulp32(D) : 1 / (2 ** fmt.bits - 1));

// Depth values drawn as ticks.
function levels(fmt) {
  if (fmt.float) {
    const out = [0, 1];
    for (let e = -1; e >= -14; e--) for (let m = 0; m < 4; m++) out.push(2 ** e * (1 + m / 4));
    return out;
  }
  const n = 2 ** fmt.bits - 1;
  const k = 2 ** (fmt.bits - 5);
  return [...Array.from({ length: 32 }, (_, j) => (j * k) / n), 1];
}

const grouped = (n) => n.toLocaleString("en-US");
function len(v) {
  if (v >= 0.1) return `${v.toFixed(v >= 10 ? 1 : 2)} m`;
  if (v >= 0.001) return `${v.toFixed(4)} m`;
  return `${v.toExponential(1).replace("-", "−")} m`;
}

// Labels in the SVG scale with its width; on a phone they need a boost.
function useLabelScale(ref) {
  const [k, setK] = useState(1);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setK(e.contentRect.width < 560 ? 1.45 : 1));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return k;
}

export default function DepthDemo() {
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const [vals, setVals] = useState(START);
  const [fmtIndex, setFmtIndex] = useState(1);
  const [reversed, setReversed] = useState(false);
  const [drag, setDrag] = useState(null);
  const [touched, setTouched] = useState(false);
  const fs = useLabelScale(rootRef);

  const fmt = FORMATS[fmtIndex];
  const { near: n, far: f } = vals;
  const s = clamp(vals.s, n + 1, f - 1);

  const cycleFormat = () => setFmtIndex((i) => (i + 1) % FORMATS.length);
  const reset = () => {
    setVals(START);
    setFmtIndex(1);
    setReversed(false);
  };
  useDemoKeys(rootRef, {
    b: cycleFormat,
    z: () => setReversed((v) => !v),
    r: reset,
  });

  const setValue = (which, d) =>
    setVals((v) => {
      if (which === "near") return { ...v, near: Math.round(clamp(d, 0.1, 10) * 20) / 20 };
      if (which === "far") return { ...v, far: Math.round(clamp(d, 20, DMAX)) };
      return { ...v, s: Math.round(clamp(d, v.near + 1, v.far - 1) * 2) / 2 };
    });

  const svgX = (e) => {
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse()).x;
  };

  const handle = (which, label) => ({
    tabIndex: 0,
    role: "slider",
    "aria-label": label,
    "aria-valuetext": `${which === "near" ? n : which === "far" ? f : s}`,
    style: { touchAction: "none", cursor: drag === which ? "grabbing" : "grab" },
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDrag(which);
      setTouched(true);
    },
    onPointerMove: (e) => drag === which && setValue(which, dOf(svgX(e))),
    onPointerUp: () => setDrag(null),
    onPointerCancel: () => setDrag(null),
    onKeyDown: (e) => {
      const dir = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      setTouched(true);
      const cur = which === "near" ? n : which === "far" ? f : s;
      // near is the sensitive one, so it moves by ratios
      const next = which === "near" ? cur * (e.shiftKey ? 1.5 : 1.12) ** dir : cur + dir * (e.shiftKey ? 5 : 1);
      setValue(which, next);
    },
  });

  // Precision at the two surfaces.
  const D1 = depth(s, n, f, reversed);
  const D2 = depth(s + GAP, n, f, reversed);
  const stepD = stepAt(D1, fmt);
  const stepZ = stepD / slope(s, n, f);
  const apart = Math.abs(D2 - D1) / stepD;
  const fight = apart < 1;

  // Ticks, projected back to distances.
  const ticks = levels(fmt)
    .map((D) => ({ D, z: distance(D, n, f, reversed) }))
    .filter((t) => t.z >= n - 1e-9 && t.z <= f + 1e-9);

  // The curve, sampled densely near the camera where it bends hardest.
  const curve = Array.from({ length: 160 }, (_, i) => {
    const z = n * (f / n) ** (i / 159);
    return `${i ? "L" : "M"}${xOf(z).toFixed(2)},${yOf(depth(z, n, f, reversed)).toFixed(2)}`;
  }).join(" ");

  const xs = xOf(s);
  const hs = hh(s);
  const fightColor = PALETTE.coral;

  const tickNote = fmt.float
    ? "ticks: a toy float, 2 mantissa bits"
    : `ticks: every ${grouped(2 ** (fmt.bits - 5))}th of ${grouped(2 ** fmt.bits)}`;

  let why;
  if (!fmt.float && !reversed) why = `${fmt.bits}-bit integer: evenly spaced in depth, so bunched up near the camera in distance`;
  else if (!fmt.float) why = "reversing an integer buffer changes nothing: the steps are still even in depth";
  else if (!reversed) why = "float32 is densest near 0, which is the near plane, where there was already plenty";
  else why = "float32 is densest near 0, now the far plane: that cancels the 1/z and keeps the relative error about constant";

  const readout = (
    <span className="flex flex-col">
      <span className="flex flex-wrap gap-x-4">
        <span style={{ color: NEAR_C }}>near {num(n)}</span>
        <span style={{ color: FAR_C }}>far {num(f, 0)}</span>
        <span className="text-zinc-200">
          step at {num(s, 1)} m: {len(stepZ)}
        </span>
        <span>gap {num(GAP)} m</span>
        <span style={{ color: fight ? fightColor : PALETTE.green }}>{fight ? "z-fighting" : "separable"}</span>
        <span className="text-zinc-500">{apart >= 1000 ? apart.toExponential(1).replace("+", "") : num(apart, apart < 10 ? 2 : 0)} steps apart</span>
      </span>
      <span className="text-zinc-500">{why}</span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-pan-y select-none"
        role="img"
        aria-label={`Depth precision with near ${num(n)} and far ${num(f, 0)}: ${fight ? "the two surfaces z-fight" : "the two surfaces are separable"}`}
      >
        <rect width={W} height={H} fill="#111114" />
        <g stroke="#232327" strokeWidth="1">
          {[0, 25, 50, 75, 100].map((d) => (
            <line key={d} x1={xOf(d)} y1={GY1} x2={xOf(d)} y2={GY0} />
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((D) => (
            <line key={D} x1={X0} y1={yOf(D)} x2={X1} y2={yOf(D)} />
          ))}
        </g>

        {/* frustum, side view */}
        <polygon
          points={`${xOf(n)},${CY - hh(n)} ${xOf(f)},${CY - hh(f)} ${xOf(f)},${CY + hh(f)} ${xOf(n)},${CY + hh(n)}`}
          fill={PALETTE.ink}
          fillOpacity="0.035"
        />
        <g stroke="#A1A1AA" strokeOpacity="0.4" strokeWidth="1">
          <line x1={X0} y1={CY} x2={xOf(f)} y2={CY - hh(f)} />
          <line x1={X0} y1={CY} x2={xOf(f)} y2={CY + hh(f)} />
        </g>
        <path d={`M${X0},${CY} L${X0 - 14},${CY - 8} L${X0 - 14},${CY + 8} Z`} fill="#A1A1AA" />
        <rect x={X0 - 30} y={CY - 7} width={16} height={14} rx={2} fill="#A1A1AA" />

        {/* representable depths as slices through the frustum */}
        <g stroke={PALETTE.ink} strokeOpacity="0.3" strokeWidth="1">
          {ticks.map((t, i) => (
            <line key={i} x1={xOf(t.z)} y1={CY - hh(t.z)} x2={xOf(t.z)} y2={CY + hh(t.z)} />
          ))}
        </g>

        <line x1={xOf(n)} y1={CY - hh(n) - 3} x2={xOf(n)} y2={CY + hh(n) + 3} stroke={NEAR_C} strokeWidth="2" />
        <line x1={xOf(f)} y1={CY - hh(f)} x2={xOf(f)} y2={CY + hh(f)} stroke={FAR_C} strokeWidth="2" />

        {/* two surfaces, a hair apart; where they overlap, the depth test decides */}
        <g strokeWidth="4" strokeLinecap="butt">
          <line x1={xs} y1={CY - hs * 0.85} x2={xs} y2={CY - hs * 0.25} stroke={PALETTE.ink} />
          <line x1={xs} y1={CY + hs * 0.25} x2={xs} y2={CY + hs * 0.85} stroke={PALETTE.blue} />
          {fight ? (
            <>
              <line x1={xs} y1={CY - hs * 0.25} x2={xs} y2={CY + hs * 0.25} stroke={fightColor} />
              <line x1={xs} y1={CY - hs * 0.25} x2={xs} y2={CY + hs * 0.25} stroke={PALETTE.blue} strokeDasharray="3 4" />
            </>
          ) : (
            <line x1={xs} y1={CY - hs * 0.25} x2={xs} y2={CY + hs * 0.25} stroke={PALETTE.ink} />
          )}
        </g>
        <g fontSize={13 * fs} className="font-mono">
          <text x={xs - 8} y={CY - hs * 0.55} textAnchor="end" fill={PALETTE.ink}>A</text>
          <text x={xs - 8} y={CY + hs * 0.6} textAnchor="end" fill={PALETTE.blue}>B</text>
          {fight && (
            <text x={xs + 14} y={CY + 4} fill={fightColor}>z-fighting</text>
          )}
        </g>

        {/* the graph: stored depth against distance */}
        <g stroke={PALETTE.ink} strokeOpacity="0.14" strokeWidth="1">
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={X0} y1={yOf(t.D)} x2={xOf(t.z)} y2={yOf(t.D)} />
              <line x1={xOf(t.z)} y1={yOf(t.D)} x2={xOf(t.z)} y2={GY0} />
            </g>
          ))}
        </g>
        <g stroke={PALETTE.ink} strokeOpacity="0.75" strokeWidth="1">
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={X0 - 6} y1={yOf(t.D)} x2={X0} y2={yOf(t.D)} />
              <line x1={xOf(t.z)} y1={GY0} x2={xOf(t.z)} y2={GY0 + 6} />
            </g>
          ))}
        </g>
        <line x1={xs} y1={GY1} x2={xs} y2={GY0} stroke={fight ? fightColor : PALETTE.ink} strokeOpacity="0.5" strokeDasharray="3 4" />
        <path d={curve} fill="none" stroke={PALETTE.green} strokeWidth="2" strokeLinejoin="round" />
        <circle cx={xs} cy={yOf(D1)} r="3.5" fill={fight ? fightColor : PALETTE.ink} />

        <g stroke="#52525B" strokeWidth="1">
          <line x1={X0} y1={GY1} x2={X0} y2={GY0} />
          <line x1={X0} y1={GY0} x2={X1} y2={GY0} />
        </g>
        <g fill="#71717A" fontSize={13 * fs} className="font-mono">
          <text x={X0 - 10} y={yOf(1) + 4} textAnchor="end">1</text>
          <text x={X0 - 10} y={yOf(0) + 4} textAnchor="end">0</text>
          <text x={14} y={(GY0 + GY1) / 2} transform={`rotate(-90 14 ${(GY0 + GY1) / 2})`} textAnchor="middle" dominantBaseline="middle">
            depth
          </text>
          {[0, 25, 50, 75, 100].map((d) => (
            <text key={d} x={xOf(d)} y={GY0 + 22} textAnchor={d === 0 ? "start" : d === 100 ? "end" : "middle"}>
              {d === 100 ? "100 m" : d}
            </text>
          ))}
          <text x={X1} y={GY1 - 8} textAnchor="end">{tickNote}</text>
        </g>

        <Handle {...handle("near", "Near plane distance")} x={xOf(n)} y={HANDLE_Y} r={6} color={NEAR_C} hint={!touched} active={drag === "near"} label="near" labelDx={9} labelDy={4} fontSize={13 * fs} />
        <Handle {...handle("far", "Far plane distance")} x={xOf(f)} y={HANDLE_Y} r={6} color={FAR_C} active={drag === "far"} label="far" labelDx={f > 88 ? -(24 * fs + 10) : 9} labelDy={4} fontSize={13 * fs} />
        <Handle {...handle("s", "Distance of the two surfaces")} x={xs} y={CY - hs * 0.85 - 12} r={6} color={fight ? fightColor : PALETTE.ink} active={drag === "s"} />
      </svg>

      <Strip readout={readout}>
        <Key k="b" onClick={cycleFormat}>{fmt.float ? "32-bit float" : `${fmt.bits}-bit`}</Key>
        <Key k="z" on={reversed} onClick={() => setReversed((v) => !v)}>Reversed Z</Key>
        <Key k="r" onClick={reset}>Reset</Key>
      </Strip>
    </div>
  );
}
