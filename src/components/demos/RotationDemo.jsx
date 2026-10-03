import { useCallback, useEffect, useRef, useState } from "react";
import { Handle, Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// Euler angles on a gimbal, and why we interpolate quaternions instead.
// Right-handed, y up. The plane's nose is +z, its fin points up +y.
// Euler order: yaw about y, then pitch about the new x, then roll about the
// newest z, so R = Ry(yaw) Rx(pitch) Rz(roll). The outer ring is yaw, the
// middle ring pitch, the inner ring roll, colored by their axes.
// With the "slerp" flag: two orientations A and B, and the plane in between
// at t, once by lerping the three Euler angles and once by slerping
// quaternions. The trails are the path of the nose on a unit sphere.

const S = 128;
// Sliders sit beside the sphere when there's room, under it when not.
const WIDE = { W: 640, H: 380, GX: 200, GY: 194, TX0: 426, TX1: 606, sliders: [106, 176, 246], notes: [300, 320], legend: [160, 186, 226], ab: [268, 288, 308] };
const NARROW = { W: 400, H: 600, GX: 200, GY: 184, TX0: 40, TX1: 360, sliders: [410, 470, 530], notes: [568, 588], legend: [452, 478, 504], ab: [540, 560, 580] };
const RAD = Math.PI / 180;
const START = { yaw: 35, pitch: 20, roll: -15 };
const GIMBAL_VIEW = { az: -0.62, el: 0.36 };
// The pairs face away from +z, so the sphere is seen from behind.
const SPHERE_VIEW = { az: Math.PI - 0.5, el: 0.38 };
const RINGS = [
  { r: 1, color: PALETTE.green, name: "yaw" },
  { r: 0.84, color: PALETTE.coral, name: "pitch" },
  { r: 0.68, color: PALETTE.blue, name: "roll" },
];
const PAIRS = [
  { name: "the long way round", a: { yaw: 150, pitch: 20, roll: 0 }, b: { yaw: -150, pitch: -10, roll: 30 } },
  { name: "over the top", a: { yaw: 120, pitch: -60, roll: 0 }, b: { yaw: 240, pitch: -60, roll: 180 } },
  { name: "a single axis", a: { yaw: 130, pitch: 0, roll: 0 }, b: { yaw: 235, pitch: 0, roll: 0 } },
];

// Plane: nose +z, fin +y.
const PLANE = {
  nose: [0, 0, 0.55],
  tail: [0, 0, -0.4],
  left: [-0.45, 0, -0.25],
  right: [0.45, 0, -0.25],
  finTop: [0, 0.22, -0.4],
  finFront: [0, 0, -0.14],
};
const PLANE_FACES = [
  { pts: ["nose", "left", "tail"], color: PALETTE.ink },
  { pts: ["nose", "tail", "right"], color: PALETTE.ink },
  { pts: ["finFront", "finTop", "tail"], color: PALETTE.green },
];

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
function rotZ(a, [x, y, z]) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [x * c - y * s, x * s + y * c, z];
}
const euler = (e, v) => rotY(e.yaw * RAD, rotX(e.pitch * RAD, rotZ(e.roll * RAD, v)));

// Quaternions as [w, x, y, z].
const qAxis = (axis, deg) => {
  const h = (deg * RAD) / 2;
  const s = Math.sin(h);
  return [Math.cos(h), axis[0] * s, axis[1] * s, axis[2] * s];
};
const qMul = ([aw, ax, ay, az], [bw, bx, by, bz]) => [
  aw * bw - ax * bx - ay * by - az * bz,
  aw * bx + ax * bw + ay * bz - az * by,
  aw * by - ax * bz + ay * bw + az * bx,
  aw * bz + ax * by - ay * bx + az * bw,
];
const qDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
const qNorm = (q) => {
  const l = Math.hypot(...q);
  return q.map((v) => v / l);
};
const qFromEuler = (e) => qMul(qMul(qAxis([0, 1, 0], e.yaw), qAxis([1, 0, 0], e.pitch)), qAxis([0, 0, 1], e.roll));
// v' = v + 2w (u x v) + 2 u x (u x v)
function qRotate([w, x, y, z], [vx, vy, vz]) {
  const tx = 2 * (y * vz - z * vy);
  const ty = 2 * (z * vx - x * vz);
  const tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
}
function slerp(a, b, t) {
  let d = qDot(a, b);
  // q and -q are the same rotation; take the one on a's side for the short arc
  const bb = d < 0 ? b.map((v) => -v) : b;
  d = Math.abs(d);
  if (d > 0.9995) return qNorm(a.map((v, i) => v + (bb[i] - v) * t));
  const th = Math.acos(d);
  const sa = Math.sin((1 - t) * th) / Math.sin(th);
  const sb = Math.sin(t * th) / Math.sin(th);
  return a.map((v, i) => v * sa + bb[i] * sb);
}
const qAngle = (a, b) => (2 * Math.acos(Math.min(1, Math.abs(qDot(a, b))))) / RAD;
const lerpEuler = (a, b, t) => ({ yaw: a.yaw + (b.yaw - a.yaw) * t, pitch: a.pitch + (b.pitch - a.pitch) * t, roll: a.roll + (b.roll - a.roll) * t });

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const deg = (v) => `${num(v, 0)}°`;

// Split a closed or open 3D polyline (already in the observer's frame) into
// the part in front of the center plane and the part behind it.
function splitPath(pts, closed) {
  let front = "";
  let back = "";
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const s = `M${a.x.toFixed(1)},${a.y.toFixed(1)}L${b.x.toFixed(1)},${b.y.toFixed(1)}`;
    if (a.z + b.z >= 0) front += s;
    else back += s;
  }
  return { front, back };
}

export default function RotationDemo({ flags }) {
  const slerpMode = flags.has("slerp");
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const [angles, setAngles] = useState(START);
  const anglesRef = useRef(START);
  anglesRef.current = angles;
  const startView = slerpMode ? SPHERE_VIEW : GIMBAL_VIEW;
  const [view, setView] = useState(startView);
  const [pairIndex, setPairIndex] = useState(0);
  const [t, setT] = useState(0.35);
  const [playing, setPlaying] = useState(() => slerpMode && !reduced());
  const [drag, setDrag] = useState(null);
  const [touched, setTouched] = useState(false);
  const orbit = useRef(null);
  const tween = useRef(0);

  const [narrow, setNarrow] = useState(false);
  const L = narrow ? NARROW : WIDE;
  const { W, H, GX, GY, TX0, TX1 } = L;

  useEffect(() => () => cancelAnimationFrame(tween.current), []);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 560));
    ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, []);

  const animateTo = useCallback((target) => {
    cancelAnimationFrame(tween.current);
    if (reduced()) return setAngles(target);
    const from = anglesRef.current;
    const start = performance.now();
    const tick = (now) => {
      const k = Math.min(1, (now - start) / 600);
      const e = 1 - Math.pow(1 - k, 3);
      setAngles({
        yaw: from.yaw + (target.yaw - from.yaw) * e,
        pitch: from.pitch + (target.pitch - from.pitch) * e,
        roll: from.roll + (target.roll - from.roll) * e,
      });
      if (k < 1) tween.current = requestAnimationFrame(tick);
    };
    tween.current = requestAnimationFrame(tick);
  }, []);

  // t sweeps back and forth while playing. Stops off screen.
  useEffect(() => {
    if (!slerpMode || !playing || reduced()) return;
    let raf = 0;
    let visible = false;
    let last = 0;
    let dir = 1;
    const tick = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      setT((v) => {
        let n = v + dir * dt * 0.28;
        if (n >= 1) [n, dir] = [1, -1];
        if (n <= 0) [n, dir] = [0, 1];
        return n;
      });
      if (visible) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      last = 0;
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(rootRef.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [slerpMode, playing]);

  const lock = () => animateTo({ ...anglesRef.current, pitch: anglesRef.current.pitch < 0 ? -90 : 90 });
  const reset = () => {
    setView(startView);
    if (slerpMode) {
      setPairIndex(0);
      setT(0.35);
    } else animateTo(START);
  };
  const nextPair = () => setPairIndex((i) => (i + 1) % PAIRS.length);

  useDemoKeys(
    rootRef,
    slerpMode
      ? { p: () => setPlaying((v) => !v), n: nextPair, r: reset }
      : { l: lock, r: reset },
  );

  // Observer: orthographic, so the rings read like a technical drawing.
  const O = (v) => {
    const q = rotX(view.el, rotY(-view.az, v));
    return { x: GX + q[0] * S, y: GY - q[1] * S, z: q[2] };
  };
  const seg = (a, b) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });

  function planeShape(rot, scale = 1) {
    const p = {};
    for (const k in PLANE) p[k] = O(rot(PLANE[k].map((v) => v * scale)));
    return PLANE_FACES.map((f) => ({ ...f, q: f.pts.map((k) => p[k]), z: f.pts.reduce((s, k) => s + p[k].z, 0) }))
      .sort((a, b) => a.z - b.z)
      .concat([{ nose: p.nose }]);
  }
  const drawPlane = (shape, { outline, color, opacity = 1 } = {}) => (
    <g opacity={opacity}>
      {shape.slice(0, -1).map((f, i) => (
        <polygon
          key={i}
          points={f.q.map((q) => `${q.x},${q.y}`).join(" ")}
          fill={outline ? "none" : f.color}
          fillOpacity={outline ? 0 : f.color === PALETTE.green ? 0.55 : 0.32}
          stroke={color ?? f.color}
          strokeWidth="1.3"
          strokeLinejoin="round"
          strokeDasharray={outline ? "4 3" : undefined}
        />
      ))}
      <circle cx={shape.at(-1).nose.x} cy={shape.at(-1).nose.y} r="3.5" fill={color ?? PALETTE.blue} />
    </g>
  );

  // Sliders along the right side.
  const slider = (key, label, color, min, max, value, y, onValue) => {
    const x = TX0 + ((value - min) / (max - min)) * (TX1 - TX0);
    const fromEvent = (e) => {
      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const sx = pt.matrixTransform(svgRef.current.getScreenCTM().inverse()).x;
      return min + clamp((sx - TX0) / (TX1 - TX0), 0, 1) * (max - min);
    };
    return (
      <g key={key}>
        <text x={TX0} y={y - 16} fill={color} fontSize="14" className="font-mono">{label}</text>
        <text x={TX1} y={y - 16} fill="#E4E4E7" fontSize="14" textAnchor="end" className="font-mono">{typeof value === "number" && max > 1 ? deg(value) : num(value)}</text>
        <line x1={TX0} y1={y} x2={TX1} y2={y} stroke="#3F3F46" strokeWidth="2" strokeLinecap="round" />
        <line x1={TX0} y1={y} x2={x} y2={y} stroke={color} strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
        <rect
          x={TX0 - 10}
          y={y - 14}
          width={TX1 - TX0 + 20}
          height={28}
          fill="transparent"
          style={{ touchAction: "none", cursor: "pointer" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag(key);
            setTouched(true);
            onValue(fromEvent(e), true);
          }}
          onPointerMove={(e) => drag === key && onValue(fromEvent(e), true)}
          onPointerUp={() => setDrag(null)}
          onPointerCancel={() => setDrag(null)}
        />
        <Handle
          x={x}
          y={y}
          r={7}
          color={color}
          active={drag === key}
          hint={!touched && key === (slerpMode ? "t" : "pitch")}
          tabIndex={0}
          role="slider"
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={Math.round(value * 100) / 100}
          style={{ touchAction: "none", cursor: drag === key ? "grabbing" : "grab" }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.currentTarget.setPointerCapture(e.pointerId);
            setDrag(key);
            setTouched(true);
          }}
          onPointerMove={(e) => drag === key && onValue(fromEvent(e), true)}
          onPointerUp={() => setDrag(null)}
          onPointerCancel={() => setDrag(null)}
          onKeyDown={(e) => {
            const dir = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
            if (!dir) return;
            e.preventDefault();
            setTouched(true);
            const step = (max - min) / (max > 1 ? (e.shiftKey ? 18 : 180) : e.shiftKey ? 10 : 50);
            onValue(clamp(value + dir * step, min, max), false);
          }}
        />
      </g>
    );
  };

  const setAngle = (k) => (v, fromDrag) => {
    cancelAnimationFrame(tween.current);
    let a = Math.round(v);
    // make the end stops easy to hit with a finger
    if (k === "pitch" && fromDrag && Math.abs(a) >= 87) a = Math.sign(a) * 90;
    setAngles((cur) => ({ ...cur, [k]: a }));
  };

  // Background drag turns the observer, not the object.
  const orbitHandlers = {
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      orbit.current = { x: e.clientX, y: e.clientY, mouse: e.pointerType === "mouse" };
      setTouched(true);
    },
    onPointerMove: (e) => {
      if (!orbit.current) return;
      const r = svgRef.current.getBoundingClientRect();
      const k = (W / r.width) * 0.008;
      const dx = e.clientX - orbit.current.x;
      const dy = orbit.current.mouse ? e.clientY - orbit.current.y : 0;
      orbit.current = { ...orbit.current, x: e.clientX, y: e.clientY };
      setView((v) => ({ az: v.az - dx * k, el: clamp(v.el + dy * k, -1.3, 1.3) }));
    },
    onPointerUp: () => (orbit.current = null),
    onPointerCancel: () => (orbit.current = null),
  };

  let body;
  let sliders;
  let readout;

  if (!slerpMode) {
    const { yaw, pitch, roll } = angles;
    const outer = (v) => rotY(yaw * RAD, v);
    const middle = (v) => rotY(yaw * RAD, rotX(pitch * RAD, v));
    const inner = (v) => euler(angles, v);
    const frames = [outer, middle, inner];
    // Ring 0 lies in its xy plane, ring 1 in xz, ring 2 in yz: each ring
    // contains its own pivot axis, and at zero they're all perpendicular.
    const circle = (i, th) => {
      const r = RINGS[i].r;
      return i === 0 ? [r * Math.cos(th), r * Math.sin(th), 0] : i === 1 ? [r * Math.cos(th), 0, r * Math.sin(th)] : [0, r * Math.cos(th), r * Math.sin(th)];
    };
    const rings = RINGS.map((_, i) => splitPath(Array.from({ length: 96 }, (_, k) => O(frames[i](circle(i, (k / 96) * 2 * Math.PI)))), true));

    // Pivot axes: yaw about world y, pitch about the outer ring's x, roll
    // about the middle ring's z.
    const yawAxis = [0, 1, 0];
    const rollAxis = middle([0, 0, 1]);
    const apartDeg = Math.acos(Math.min(1, Math.abs(rollAxis[1]))) / RAD;
    const locked = apartDeg < 0.5;
    const axisLine = (dir, len) => seg(O(dir.map((v) => -v * len)), O(dir.map((v) => v * len)));
    const axles = [
      [O([0, 1, 0]), O([0, 1.18, 0])],
      [O([0, -1, 0]), O([0, -1.18, 0])],
      [O(outer([0.84, 0, 0])), O(outer([1, 0, 0]))],
      [O(outer([-0.84, 0, 0])), O(outer([-1, 0, 0]))],
      [O(middle([0, 0, 0.68])), O(middle([0, 0, 0.84]))],
      [O(middle([0, 0, -0.68])), O(middle([0, 0, -0.84]))],
    ];
    const axleColor = [PALETTE.green, PALETTE.green, PALETTE.coral, PALETTE.coral, PALETTE.blue, PALETTE.blue];

    body = (
      <g pointerEvents="none">
        <line {...axisLine(yawAxis, 1.32)} stroke={PALETTE.green} strokeOpacity="0.4" strokeDasharray="4 4" />
        <line {...axisLine(outer([1, 0, 0]), 1.15)} stroke={PALETTE.coral} strokeOpacity="0.3" strokeDasharray="4 4" />
        <line {...axisLine(rollAxis, 1.15)} stroke={PALETTE.blue} strokeOpacity="0.4" strokeDasharray="4 4" />
        {locked && <line {...axisLine(yawAxis, 1.32)} stroke={PALETTE.coral} strokeWidth="3" strokeOpacity="0.85" />}
        <rect x={GX - 26} y={O([0, -1.18, 0]).y} width={52} height={4} rx={2} fill="#52525B" opacity={view.el > -0.2 ? 1 : 0.4} />

        {RINGS.map((ring, i) => (
          <g key={i}>
            {locked && i < 2 && <path d={rings[i].back} stroke={PALETTE.coral} strokeOpacity="0.18" strokeWidth="9" fill="none" />}
            <path d={rings[i].back} stroke={ring.color} strokeOpacity="0.32" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        ))}
        {drawPlane(planeShape(inner))}
        {RINGS.map((ring, i) => (
          <g key={i}>
            {locked && i < 2 && <path d={rings[i].front} stroke={PALETTE.coral} strokeOpacity="0.25" strokeWidth="11" fill="none" />}
            <path d={rings[i].front} stroke={ring.color} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        ))}
        {axles.map(([a, b], i) => (
          <line key={i} {...seg(a, b)} stroke={axleColor[i]} strokeWidth="5" strokeLinecap="round" />
        ))}
        {locked && (
          <text x={O([0, 1.32, 0]).x + 8} y={O([0, 1.32, 0]).y + 4} fill={PALETTE.coral} fontSize="14" className="font-mono">
            yaw axis = roll axis
          </text>
        )}
      </g>
    );

    sliders = (
      <>
        {slider("yaw", "yaw", PALETTE.green, -180, 180, yaw, L.sliders[0], setAngle("yaw"))}
        {slider("pitch", "pitch", PALETTE.coral, -90, 90, pitch, L.sliders[1], setAngle("pitch"))}
        {slider("roll", "roll", PALETTE.blue, -180, 180, roll, L.sliders[2], setAngle("roll"))}
        <text x={TX0} y={L.notes[0]} fill="#71717A" fontSize="13" className="font-mono">R = Ry · Rx · Rz</text>
        <text x={TX0} y={L.notes[1]} fill="#71717A" fontSize="13" className="font-mono">yaw, pitch, then roll</text>
      </>
    );

    readout = (
      <span className="flex flex-col">
        <span className="flex flex-wrap gap-x-4">
          <span style={{ color: PALETTE.green }}>yaw {deg(yaw)}</span>
          <span style={{ color: PALETTE.coral }}>pitch {deg(pitch)}</span>
          <span style={{ color: PALETTE.blue }}>roll {deg(roll)}</span>
          {locked ? (
            <span style={{ color: PALETTE.coral }}>gimbal lock</span>
          ) : (
            <span className="text-zinc-200">yaw and roll axes {num(apartDeg, 1)}° apart</span>
          )}
        </span>
        <span className="text-zinc-500">
          {locked
            ? `one degree of freedom lost: yaw and roll now turn the plane around the same axis, only yaw ${pitch > 0 ? "−" : "+"} roll (${deg(pitch > 0 ? yaw - roll : yaw + roll)}) matters`
            : apartDeg < 20
              ? "close to lock: yaw and roll are starting to do the same thing"
              : touched
                ? "drag the background to look around the gimbal"
                : "drag pitch toward 90° and watch two rings fold together"}
        </span>
      </span>
    );
  } else {
    const pair = PAIRS[pairIndex];
    const qa = qFromEuler(pair.a);
    const qb = qFromEuler(pair.b);
    const qt = slerp(qa, qb, t);
    const et = lerpEuler(pair.a, pair.b, t);
    const nose = [0, 0, 1];
    const N = 120;
    const sTrail = Array.from({ length: N + 1 }, (_, i) => O(qRotate(slerp(qa, qb, i / N), nose)));
    const eTrail = Array.from({ length: N + 1 }, (_, i) => O(euler(lerpEuler(pair.a, pair.b, i / N), nose)));
    const sPath = splitPath(sTrail, false);
    const ePath = splitPath(eTrail, false);
    // How far each path turns in total.
    let eTurn = 0;
    let prev = qa;
    for (let i = 1; i <= N; i++) {
      const q = qFromEuler(lerpEuler(pair.a, pair.b, i / N));
      eTurn += qAngle(prev, q);
      prev = q;
    }
    const total = qAngle(qa, qb);
    const scale = 0.62 / 0.55;
    const c = O([0, 0, 0]);
    const sphere = (f) => splitPath(Array.from({ length: 96 }, (_, k) => O(f((k / 96) * 2 * Math.PI))), true);
    const equator = sphere((th) => [Math.cos(th), 0, Math.sin(th)]);
    const meridian = sphere((th) => [0, Math.cos(th), Math.sin(th)]);
    const marks = Array.from({ length: 11 }, (_, i) => i / 10);
    const ePt = O(euler(et, nose));
    const sPt = O(qRotate(qt, nose));
    const aPt = O(euler(pair.a, nose));
    const bPt = O(euler(pair.b, nose));

    body = (
      <g pointerEvents="none">
        <circle cx={GX} cy={GY} r={S} fill={PALETTE.ink} fillOpacity="0.025" stroke="#3F3F46" strokeWidth="1" />
        <path d={equator.back + meridian.back} stroke="#3F3F46" strokeOpacity="0.5" strokeDasharray="3 4" fill="none" />
        <path d={equator.front + meridian.front} stroke="#3F3F46" fill="none" />

        <path d={ePath.back} stroke={PALETTE.coral} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <path d={sPath.back} stroke={PALETTE.green} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="4 4" fill="none" />

        <line {...seg(c, ePt)} stroke={PALETTE.coral} strokeOpacity="0.5" strokeDasharray="2 3" />
        <line {...seg(c, sPt)} stroke={PALETTE.green} strokeOpacity="0.5" strokeDasharray="2 3" />
        {drawPlane(planeShape((v) => euler(et, v), scale), { outline: true, color: PALETTE.coral, opacity: 0.9 })}
        {drawPlane(planeShape((v) => qRotate(qt, v), scale))}

        <path d={ePath.front} stroke={PALETTE.coral} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d={sPath.front} stroke={PALETTE.green} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* equal steps in t: even on the slerp path, uneven on the Euler one */}
        {marks.map((m) => {
          const e = eTrail[Math.round(m * N)];
          const s = sTrail[Math.round(m * N)];
          return (
            <g key={m}>
              <circle cx={e.x} cy={e.y} r="2.2" fill={PALETTE.coral} opacity={e.z >= 0 ? 1 : 0.4} />
              <circle cx={s.x} cy={s.y} r="2.2" fill={PALETTE.green} opacity={s.z >= 0 ? 1 : 0.4} />
            </g>
          );
        })}
        <circle cx={ePt.x} cy={ePt.y} r="6" fill="#111114" stroke={PALETTE.coral} strokeWidth="2.5" />
        <circle cx={sPt.x} cy={sPt.y} r="6" fill="#111114" stroke={PALETTE.green} strokeWidth="2.5" />
        <g fontSize="14" className="font-mono" fill="#E4E4E7">
          <text x={aPt.x + 9} y={aPt.y - 8}>A</text>
          <text x={bPt.x + 9} y={bPt.y - 8}>B</text>
        </g>
      </g>
    );

    sliders = (
      <>
        {slider("t", "t", PALETTE.ink, 0, 1, t, L.sliders[0], (v) => {
          setPlaying(false);
          setT(v);
        })}
        <g fontSize="13" className="font-mono">
          <line x1={TX0} y1={L.legend[0]} x2={TX0 + 22} y2={L.legend[0]} stroke={PALETTE.green} strokeWidth="2.5" />
          <text x={TX0 + 30} y={L.legend[0] + 4} fill={PALETTE.green}>slerp</text>
          <text x={TX1} y={L.legend[0] + 4} fill="#A1A1AA" textAnchor="end">{num(total, 0)}°</text>
          <line x1={TX0} y1={L.legend[1]} x2={TX0 + 22} y2={L.legend[1]} stroke={PALETTE.coral} strokeWidth="2.5" />
          <text x={TX0 + 30} y={L.legend[1] + 4} fill={PALETTE.coral}>Euler lerp</text>
          <text x={TX1} y={L.legend[1] + 4} fill="#A1A1AA" textAnchor="end">{num(eTurn, 0)}°</text>
          <text x={TX0} y={L.legend[2]} fill="#71717A">total turn along each path</text>
          <text x={TX0} y={L.ab[0]} fill="#71717A">A ({num(pair.a.yaw, 0)}, {num(pair.a.pitch, 0)}, {num(pair.a.roll, 0)})</text>
          <text x={TX0} y={L.ab[1]} fill="#71717A">B ({num(pair.b.yaw, 0)}, {num(pair.b.pitch, 0)}, {num(pair.b.roll, 0)})</text>
          <text x={TX0} y={L.ab[2]} fill="#52525B">yaw, pitch, roll</text>
        </g>
      </>
    );

    readout = (
      <span className="flex flex-col">
        <span className="flex flex-wrap gap-x-4">
          <span className="text-zinc-200">
            q(t) = ({num(qt[0], 3)}, {num(qt[1], 3)}, {num(qt[2], 3)}, {num(qt[3], 3)})
          </span>
          <span>A to B {num(total, 1)}°</span>
        </span>
        <span className="text-zinc-500">
          {Math.abs(eTurn - total) < 0.5
            ? `${pair.name}: only yaw changes, so lerping that one angle already is a slerp`
            : `${pair.name}: slerp takes the shortest arc at constant speed; lerping the angles turns ${num(eTurn, 0)}° in all`}
        </span>
      </span>
    );
  }

  return (
    <div ref={rootRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full touch-pan-y select-none"
        role="img"
        aria-label={slerpMode ? "Two ways to interpolate between orientations A and B" : `A gimbal at yaw ${num(angles.yaw, 0)}, pitch ${num(angles.pitch, 0)}, roll ${num(angles.roll, 0)} degrees`}
      >
        <rect width={W} height={H} fill="#111114" style={{ cursor: "move" }} {...orbitHandlers} />
        {body}
        {sliders}
      </svg>

      <Strip readout={readout}>
        {slerpMode ? (
          <>
            <Key k="p" on={playing} onClick={() => setPlaying((v) => !v)}>Play</Key>
            <Key k="n" onClick={nextPair}>Next pair</Key>
            <Key k="r" onClick={reset}>Reset</Key>
          </>
        ) : (
          <>
            <Key k="l" onClick={lock}>Gimbal lock</Key>
            <Key k="r" onClick={reset}>Reset</Key>
          </>
        )}
      </Strip>
    </div>
  );
}
