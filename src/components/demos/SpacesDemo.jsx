import { useCallback, useEffect, useRef, useState } from "react";
import { Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// One cube followed through every space a vertex passes through: model,
// world, view, clip, NDC and screen. Conventions: right-handed world with
// y up, the camera looks down -z in view space, and the projection maps
// view depth near..far to 0..1 (the D3D, Vulkan and Metal range; OpenGL
// uses -1..1). The diagram is drawn by a fixed orthographic observer, so
// the only perspective you see is the projection's own.
//
// Clip space and NDC have +z pointing away from the camera, the opposite
// of view space. They're drawn with that axis pointing into the picture
// so the scene doesn't flip over in the middle of the animation.

const W = 640;
const H = 380;
const NEAR = 1;
const FAR = 6;
const FOV = (50 * Math.PI) / 180; // vertical
const ASPECT = 16 / 9;
const SY = 1 / Math.tan(FOV / 2);
const SX = SY / ASPECT;
const VW = 640; // viewport, pixels
const VH = 360;
const CUBE_POS = [1.0, 0.6, 0.2];
const TARGET = [0.7, 0.45, 0.1];
const CAM_AZ = 0.55; // camera orbit around TARGET
const CAM_EL = 0.36;
const DISTS = [2.8, 3.8, 5.2];
const START_ROT = { yaw: 0.5, pitch: 0.25 };
const OBS = { az: -0.75, el: 0.42 };
const FRONT = { az: 0, el: 0 };
const STAGES = ["model", "world", "view", "clip", "ndc", "screen"];
const LABELS = ["Model", "World", "View", "Clip", "NDC", "Screen"];
const TITLES = ["model space", "world space", "view space", "clip space, before the divide", "normalized device coordinates", "screen space, in pixels"];
const AXIS = [PALETTE.coral, PALETTE.green, PALETTE.blue];
const FRAME = "#A1A1AA";

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function rotX(a, [x, y, z]) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}
function rotY(a, [x, y, z]) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

// Unit cube corners: bit 0 is x, bit 1 is y, bit 2 is z. Corner 7 is the
// tracked (+x, +y, +z) one.
const CORNERS = Array.from({ length: 8 }, (_, i) => [i & 1 ? 0.5 : -0.5, i & 2 ? 0.5 : -0.5, i & 4 ? 0.5 : -0.5]);
const MARK = 7;
// Faces as corner cycles, flipped where needed so every face winds
// counterclockwise seen from outside.
const FACES = [
  [0, 2, 6, 4],
  [1, 3, 7, 5],
  [0, 1, 5, 4],
  [2, 3, 7, 6],
  [0, 1, 3, 2],
  [4, 5, 7, 6],
].map((f) => {
  const [a, b, c] = f.map((i) => CORNERS[i]);
  const center = f.reduce((s, i) => add(s, CORNERS[i]), [0, 0, 0]);
  return dot(cross(sub(b, a), sub(c, a)), center) > 0 ? f : [...f].reverse();
});
const EDGES = [];
for (let i = 0; i < 8; i++) {
  for (let j = i + 1; j < 8; j++) {
    const d = i ^ j;
    if (d === 1 || d === 2 || d === 4) EDGES.push({ i, j, faces: FACES.map((f, k) => (f.includes(i) && f.includes(j) ? k : -1)).filter((k) => k >= 0) });
  }
}

const eyeAt = (d) => add(TARGET, [d * Math.cos(CAM_EL) * Math.sin(CAM_AZ), d * Math.sin(CAM_EL), d * Math.cos(CAM_EL) * Math.cos(CAM_AZ)]);

// The view matrix is Rx(el) Ry(-az) T(-eye). Scaling every part by t gives a
// rigid motion at every step, so the world glides into view space in one piece.
const viewT = (p, t, eye) => rotX(CAM_EL * t, rotY(-CAM_AZ * t, sub(p, mul(eye, t))));
const invView = (p, eye) => add(eye, rotY(CAM_AZ, rotX(-CAM_EL, p)));

// View space to clip space. Depth: z = -near gives 0, z = -far gives 1.
function project([x, y, z]) {
  return [SX * x, SY * y, (FAR * z + NEAR * FAR) / (NEAR - FAR), -z];
}

// Where a view-space point is drawn for pipeline position p in 2..5.
function fromView(pv, p) {
  if (p <= 3) {
    const [xc, yc, zc] = project(pv);
    return mix(pv, [xc, yc, -zc], p - 2);
  }
  const [xc, yc, zc, w] = project(pv);
  if (p <= 4) {
    // Lerp the homogeneous point from (x, y, -z, 1) to (x, y, w - 2z, w) and
    // divide: the divide by w happens gradually, and planes stay planes.
    const t = p - 3;
    const ww = 1 + t * (w - 1);
    return [xc / ww, yc / ww, ((1 - t) * -zc + t * (w - 2 * zc)) / ww];
  }
  // NDC (drawn with z 0..1 stretched to 1..-1 so the box is a cube) to screen.
  const t = p - 4;
  return [(xc / w) * (1 + t * (ASPECT - 1)), yc / w, 1 - (2 * zc) / w];
}

function display(pw, p, eye) {
  if (p <= 1) return pw;
  if (p <= 2) return viewT(pw, p - 1, eye);
  return fromView(viewT(pw, 1, eye), p);
}

const obs = (p, ang) => rotX(ang.el, rotY(-ang.az, p));
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const anglesAt = (p) => {
  if (p <= 4) return OBS;
  const t = ease(clamp01(p - 4));
  return { az: OBS.az + (FRONT.az - OBS.az) * t, el: OBS.el + (FRONT.el - OBS.el) * t };
};

// Fit the important points of a stage into the picture.
function fitStage(i, eye) {
  const ang = i === 5 ? FRONT : OBS;
  let pts;
  let margin;
  if (i === 0) {
    pts = [[0, 0, 0]];
    margin = 1.15;
  } else if (i <= 2) {
    pts = [[0, 0, 0], CUBE_POS, eye, [1.3, 0, 0], [0, 1.3, 0], [0, 0, 1.3]].map((p) => (i === 2 ? viewT(p, 1, eye) : p));
    margin = 0.95;
  } else if (i === 3) {
    const c = viewT(CUBE_POS, 1, eye);
    const [, , zc, w] = project(c);
    pts = [
      [0, 0, (NEAR * FAR) / (FAR - NEAR)],
      [w, w, -zc],
      [-w, -w, -zc],
      [1, 1, 0],
      [-1, -1, 0],
    ];
    margin = 0.4;
  } else if (i === 4) {
    pts = CORNERS.map((c) => mul(c, 2));
    margin = 0.2;
  } else {
    pts = [
      [-ASPECT, -1, 1],
      [ASPECT, 1, 1],
    ];
    margin = 0.22;
  }
  const q = pts.map((p) => obs(p, ang));
  const xs = q.map((p) => p[0]);
  const ys = q.map((p) => p[1]);
  const x0 = Math.min(...xs) - margin;
  const x1 = Math.max(...xs) + margin;
  const y0 = Math.min(...ys) - margin;
  const y1 = Math.max(...ys) + margin;
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, s: Math.min((W - 40) / (x1 - x0), (H - 64) / (y1 - y0)) };
}

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// A number that glides to its new value. Instant with reduced motion.
function useTween(initial) {
  const [value, setValue] = useState(initial);
  const ref = useRef(initial);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const to = useCallback((target, ms) => {
    cancelAnimationFrame(raf.current);
    const from = ref.current;
    if (reduced() || from === target) {
      ref.current = target;
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - start) / ms);
      const v = from + (target - from) * ease(k);
      ref.current = v;
      setValue(v);
      if (k < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, []);
  return [value, to, ref];
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

const tuple = (vals, d = 2) => `(${vals.map((v) => (typeof v === "string" ? v : num(v, d))).join(", ")})`;

export default function SpacesDemo({ flags }) {
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const flagged = STAGES.findIndex((s) => flags.has(s));
  const initial = flagged >= 0 ? flagged : 1;
  const [stage, setStage] = useState(initial);
  const [p, tweenP, pRef] = useTween(initial);
  const [distIndex, setDistIndex] = useState(1);
  const [dist, tweenDist] = useTween(DISTS[1]);
  const [rot, setRot] = useState(START_ROT);
  const [touched, setTouched] = useState(false);
  const fs = useLabelScale(rootRef);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);

  const go = (i) => {
    setStage(i);
    tweenP(i, Math.min(1500, 320 + 300 * Math.abs(i - pRef.current)));
  };
  const cycleDistance = () => {
    const i = (distIndex + 1) % DISTS.length;
    setDistIndex(i);
    tweenDist(DISTS[i], 520);
  };
  const reset = () => {
    setTouched(true);
    setRot(START_ROT);
    setDistIndex(1);
    tweenDist(DISTS[1], 520);
    go(initial);
  };

  // The cube turns slowly until someone grabs it. Stops off screen and
  // with reduced motion.
  useEffect(() => {
    if (touched || reduced()) return;
    let raf = 0;
    let visible = false;
    const tick = () => {
      setRot((r) => ({ ...r, yaw: r.yaw + 0.004 }));
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
  }, [touched]);

  useDemoKeys(rootRef, {
    1: () => go(0),
    2: () => go(1),
    3: () => go(2),
    4: () => go(3),
    5: () => go(4),
    6: () => go(5),
    d: cycleDistance,
    r: reset,
  });

  const eye = eyeAt(dist);
  const R = (v) => rotY(rot.yaw, rotX(rot.pitch, v));
  // Points attached to the cube, given in model space.
  const place = (v) => (p < 1 ? add(mul(CUBE_POS, p), R(v)) : display(add(CUBE_POS, R(v)), p, eye));

  // Framing and observer for the current (possibly in-between) position.
  const i0 = Math.min(4, Math.floor(p));
  const ft = p - i0;
  const fa = fitStage(i0, eye);
  const fb = fitStage(i0 + 1, eye);
  const fit = {
    cx: fa.cx + (fb.cx - fa.cx) * ft,
    cy: fa.cy + (fb.cy - fa.cy) * ft,
    s: Math.exp(Math.log(fa.s) + (Math.log(fb.s) - Math.log(fa.s)) * ft),
  };
  const ang = anglesAt(p);
  const to3 = (d) => obs(d, ang);
  const toSvg = (q) => ({ x: W / 2 + (q[0] - fit.cx) * fit.s, y: H / 2 + 14 - (q[1] - fit.cy) * fit.s, z: q[2] });
  const P = (d) => toSvg(to3(d));
  const seg = (a, b) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });

  // Opacities: what belongs to which stage fades in and out with p.
  const near = (i, k = 2) => clamp01(1 - Math.abs(p - i) * k);
  const worldOp = p < 1 ? p : p <= 2 ? 1 : clamp01(3 - p);
  const camOp = clamp01(p);

  // The tracked corner through every space, for the readout.
  const vW = add(CUBE_POS, R(CORNERS[MARK]));
  const vV = viewT(vW, 1, eye);
  const vC = project(vV);
  const vN = [vC[0] / vC[3], vC[1] / vC[3], vC[2] / vC[3]];
  const vS = [((vN[0] + 1) / 2) * VW, ((1 - vN[1]) / 2) * VH];
  const inside = Math.abs(vC[0]) <= vC[3] && Math.abs(vC[1]) <= vC[3] && vC[2] >= 0 && vC[2] <= vC[3];

  // Cube in the observer's frame, with faces sorted back to front.
  const cube3 = CORNERS.map((c) => to3(place(c)));
  const cube = cube3.map(toSvg);
  const facing = FACES.map((f) => {
    const [a, b, c] = f.map((i) => cube3[i]);
    return cross(sub(b, a), sub(c, a))[2] > 0;
  });
  const faceOrder = FACES.map((f, k) => ({ k, z: f.reduce((s, i) => s + cube3[i][2], 0) })).sort((a, b) => a.z - b.z);
  const markHidden = FACES.every((f, k) => !f.includes(MARK) || !facing[k]);
  const center = P(place([0, 0, 0]));

  // Camera frustum, defined in view space.
  const ty = 1 / SY;
  const tx = ty * ASPECT;
  const rect = (d) => [
    [-d * tx, -d * ty, -d],
    [d * tx, -d * ty, -d],
    [d * tx, d * ty, -d],
    [-d * tx, d * ty, -d],
  ];
  const toDisp = (pv) => (p < 2 ? display(invView(pv, eye), p, eye) : fromView(pv, p));
  const nearR = rect(NEAR).map((v) => P(toDisp(v)));
  const farR = rect(FAR).map((v) => P(toDisp(v)));
  const apex = p < 3 ? P(toDisp([0, 0, 0])) : null;
  const poly = (pts) => pts.map((q) => `${q.x},${q.y}`).join(" ");

  // The clip-space test at the tracked corner: the square |x|, |y| <= w at
  // its depth. In view space that's the frustum's cross-section there.
  const wSquare = p > 2.5 && p < 3.5 ? rect(-vV[2]).map((v) => P(fromView(v, p))) : null;

  // The axes of the current space, at that space's origin.
  const gizmos = [
    null,
    { o: [0, 0, 0], tips: [[1.2, 0, 0], [0, 1.2, 0], [0, 0, 1.2]], names: ["x", "y", "z"] },
    { o: [0, 0, 0], tips: [[1.2, 0, 0], [0, 1.2, 0], [0, 0, 1.2]], names: ["x", "y", "z"] },
    { o: [0, 0, 0], tips: [[1.4, 0, 0], [0, 1.4, 0], [0, 0, -1.4]], names: ["x", "y", "z"] },
    { o: [0, 0, 1], tips: [[1, 0, 1], [0, 1, 1], [0, 0, -1]], names: ["x", "y", "z"] },
    { o: [-ASPECT, 1, 1], tips: [[-ASPECT + 0.45, 1, 1], [-ASPECT, 0.55, 1]], names: ["x", "y"] },
  ];

  // Pixel grid for the screen stage, every 40 pixels.
  const px = (x, y) => P([x / 180 - ASPECT, 1 - y / 180, 1]);
  const screenOp = near(5);
  const pixelGrid = [];
  if (screenOp > 0) {
    for (let x = 40; x < VW; x += 40) pixelGrid.push(seg(px(x, 0), px(x, VH)));
    for (let y = 40; y < VH; y += 40) pixelGrid.push(seg(px(0, y), px(VW, y)));
  }

  const grid = [];
  if (worldOp > 0) {
    for (let k = -3; k <= 3; k++) {
      grid.push(seg(P(display([k, 0, -3], p, eye)), P(display([k, 0, 3], p, eye))));
      grid.push(seg(P(display([-3, 0, k], p, eye)), P(display([3, 0, k], p, eye))));
    }
  }

  const mark = cube[MARK];
  const accent = (s) => <span style={{ color: PALETTE.green }}>{s}</span>;
  const lines = [
    [
      <>{accent("model")} {tuple([...CORNERS[MARK], "1"])}</>,
      <>{touched ? "turning the cube changes the model matrix, not these numbers" : "drag to turn the cube; these numbers never change"}</>,
    ],
    [<>{accent("world")} {tuple([...vW, "1"])}</>, <>world = model matrix × model</>],
    [
      <>{accent("view")} {tuple([...vV, "1"])}</>,
      <>view = view matrix × world; camera at the origin looking down −z, {num(dist, 1)} from its target</>,
    ],
    [
      <>
        {accent("clip")} ({num(vC[0])}, {num(vC[1])}, {num(vC[2])}, <span style={{ color: PALETTE.ink }}>w {num(vC[3])}</span>)
      </>,
      <>
        clip = projection × view; visible when |x|, |y| ≤ w and 0 ≤ z ≤ w:{" "}
        <span style={{ color: inside ? PALETTE.green : PALETTE.bad }}>{inside ? "inside" : "outside"}</span>
      </>,
    ],
    [
      <>{accent("ndc")} {tuple(vN)}</>,
      <>
        clip ÷ w; depth {num(vN[2])} at {Math.round(((-vV[2] - NEAR) / (FAR - NEAR)) * 100)}% of the way from near to far
      </>,
    ],
    [
      <>
        {accent("pixel")} ({num(vS[0], 1)}, {num(vS[1], 1)}) <span className="text-zinc-500">depth</span> {num(vN[2], 3)}
      </>,
      <>
        x = (ndc.x + 1) × {VW / 2}, y = (1 − ndc.y) × {VH / 2}; y points down
      </>,
    ],
  ];
  const readout = (
    <span className="flex flex-col">
      <span className="text-zinc-200">{lines[stage][0]}</span>
      <span className="text-zinc-500">{lines[stage][1]}</span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-pan-y select-none outline-none"
        style={{ cursor: dragging ? "grabbing" : "grab" }}
        tabIndex={0}
        role="img"
        aria-label={`A cube and its tracked corner in ${TITLES[stage]}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, mouse: e.pointerType === "mouse" };
          setDragging(true);
          setTouched(true);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const r = svgRef.current.getBoundingClientRect();
          const k = (W / r.width) * 0.0085;
          const dx = e.clientX - drag.current.x;
          const dy = drag.current.mouse ? e.clientY - drag.current.y : 0;
          drag.current = { ...drag.current, x: e.clientX, y: e.clientY };
          setRot((v) => ({ yaw: v.yaw + dx * k, pitch: v.pitch + dy * k }));
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onKeyDown={(e) => {
          const d = e.shiftKey ? 0.4 : 0.1;
          const delta = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
          if (!delta) return;
          e.preventDefault();
          setTouched(true);
          setRot((v) => ({ yaw: v.yaw + delta[0], pitch: v.pitch + delta[1] }));
        }}
      >
        <rect width={W} height={H} fill="#111114" />

        {/* the world's ground plane, y = 0 */}
        {worldOp > 0 && (
          <g stroke="#2E2E35" strokeWidth="1" opacity={worldOp}>
            {grid.map((l, k) => <line key={k} {...l} />)}
          </g>
        )}

        {/* the viewport's pixels */}
        {screenOp > 0 && (
          <g opacity={screenOp}>
            <g stroke="#26262C" strokeWidth="1">
              {pixelGrid.map((l, k) => <line key={k} {...l} />)}
            </g>
            <g fill="#71717A" fontSize={13 * fs} className="font-mono">
              <text x={px(0, 0).x} y={px(0, 0).y - 8}>0</text>
              <text x={px(VW, 0).x} y={px(VW, 0).y - 8} textAnchor="end">{VW}</text>
              <text x={px(0, VH).x - 6} y={px(0, VH).y + 4} textAnchor="end">{VH}</text>
            </g>
          </g>
        )}

        {/* camera frustum; in clip space it straightens, in NDC it is the box */}
        {camOp > 0 && (
          <g opacity={camOp} fill="none" strokeLinejoin="round">
            <polygon points={poly(farR)} stroke={FRAME} strokeOpacity={p > 3.5 ? 0.6 : 0.3} strokeWidth="1" />
            {nearR.map((q, k) => (
              <line key={k} {...seg(q, farR[k])} stroke={FRAME} strokeOpacity={p > 3.5 ? 0.6 : 0.3} strokeWidth="1" />
            ))}
            {apex &&
              nearR.map((q, k) => (
                <line key={`a${k}`} {...seg(apex, q)} stroke={FRAME} strokeOpacity={0.5 * clamp01(3 - p)} strokeWidth="1" strokeDasharray="3 3" />
              ))}
            <polygon points={poly(nearR)} stroke={FRAME} strokeOpacity="0.8" strokeWidth="1.2" />
            {apex && (
              <g opacity={clamp01(3 - p)}>
                <circle cx={apex.x} cy={apex.y} r="4" fill={FRAME} />
                <text x={apex.x + 8} y={apex.y + 18} fill={FRAME} fontSize={13 * fs} className="font-mono">camera</text>
              </g>
            )}
          </g>
        )}

        {wSquare && (
          <g opacity={near(3)}>
            <polygon points={poly(wSquare)} fill={PALETTE.ink} fillOpacity="0.04" stroke={PALETTE.ink} strokeOpacity="0.55" strokeWidth="1" strokeDasharray="5 4" />
            <text x={wSquare[2].x + 6} y={wSquare[2].y + 4} fill={PALETTE.ink} fillOpacity="0.8" fontSize={13 * fs} className="font-mono">
              |x|, |y| ≤ w
            </text>
          </g>
        )}

        {/* NDC labels on the box */}
        {near(4) > 0 && (
          <g opacity={near(4)} fill="#A1A1AA" fontSize={13 * fs} className="font-mono">
            <text x={nearR[0].x - 6} y={nearR[0].y + 16} textAnchor="end">z 0</text>
            <text x={farR[1].x + 6} y={farR[1].y + 4}>z 1</text>
          </g>
        )}

        {gizmos.map((g, i) => {
          const op = g ? near(i) : 0;
          if (!op) return null;
          const o = P(g.o);
          return (
            <g key={i} opacity={op}>
              {g.tips.map((t, k) => {
                const q = P(t);
                return (
                  <g key={k}>
                    <line {...seg(o, q)} stroke={AXIS[k]} strokeWidth="1.6" strokeLinecap="round" />
                    <text x={q.x + (q.x >= o.x ? 5 : -12)} y={q.y + (q.y > o.y ? 14 : -4)} fill={AXIS[k]} fontSize={14 * fs} className="font-mono">
                      {g.names[k]}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* the cube: faint fill on faces turned toward us, hidden edges dashed */}
        {faceOrder.map(({ k }) =>
          facing[k] ? <polygon key={k} points={poly(FACES[k].map((i) => cube[i]))} fill={PALETTE.ink} fillOpacity="0.07" /> : null,
        )}
        {EDGES.map(({ i, j, faces }) => {
          const hidden = faces.every((k) => !facing[k]);
          return (
            <line
              key={`${i}-${j}`}
              {...seg(cube[i], cube[j])}
              stroke={PALETTE.ink}
              strokeOpacity={hidden ? 0.28 : 0.9}
              strokeWidth={hidden ? 1 : 1.5}
              strokeDasharray={hidden ? "3 3" : undefined}
              strokeLinecap="round"
            />
          );
        })}

        {/* the cube's own axes */}
        {[0, 1, 2].map((k) => {
          const tip = P(place([0, 0, 0].map((_, j) => (j === k ? 0.8 : 0))));
          return (
            <g key={k}>
              <line {...seg(center, tip)} stroke={AXIS[k]} strokeWidth={p < 0.5 ? 1.6 : 1.1} strokeOpacity={p < 0.5 ? 1 : 0.75} strokeLinecap="round" />
              {near(0) > 0 && (
                <text x={tip.x + 5} y={tip.y - 4} fill={AXIS[k]} fontSize={14 * fs} opacity={near(0)} className="font-mono">
                  {"xyz"[k]}
                </text>
              )}
            </g>
          );
        })}

        <circle cx={mark.x} cy={mark.y} r="5.5" fill={markHidden ? "#111114" : PALETTE.green} stroke={PALETTE.green} strokeWidth="2" />

        <text x="14" y="24" fill="#A1A1AA" fontSize={14 * fs} className="font-mono">
          {TITLES[stage]}
        </text>
      </svg>

      <Strip readout={readout}>
        {LABELS.map((label, i) => (
          <Key key={i} k={String(i + 1)} on={stage === i} onClick={() => go(i)}>
            {label}
          </Key>
        ))}
        <Key k="d" onClick={cycleDistance}>Distance</Key>
        <Key k="r" onClick={reset}>Reset</Key>
      </Strip>
    </div>
  );
}
