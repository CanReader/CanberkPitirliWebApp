import { useCallback, useEffect, useRef, useState } from "react";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Draggable points inside an SVG, in the SVG's own (viewBox) units. Works
// with mouse, touch and pen through pointer capture, and with the keyboard:
// a focused handle moves with the arrow keys (shift for bigger steps).
// `touched` stays false until the reader first grabs a handle, so demos can
// hint that the handles move.
export function useDragPoints(initial, { clamp, step = 0.25 } = {}) {
  const [points, setPoints] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [dragging, setDragging] = useState(null);
  const svgRef = useRef(null);
  const tween = useRef(0);
  const clampRef = useRef(clamp);
  clampRef.current = clamp;
  const pointsRef = useRef(points);
  pointsRef.current = points;

  useEffect(() => () => cancelAnimationFrame(tween.current), []);

  const toSvg = useCallback((e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  }, []);

  const move = useCallback((i, p) => {
    cancelAnimationFrame(tween.current);
    const c = clampRef.current;
    setPoints((prev) => prev.map((q, j) => (j === i ? (c ? c(p) : p) : q)));
  }, []);

  // Glide to a new set of points (presets, reset). Instant with reduced motion.
  const animateTo = useCallback((target, ms = 420) => {
    cancelAnimationFrame(tween.current);
    if (reducedMotion()) return setPoints(target);
    const from = pointsRef.current;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      setPoints(from.map((p, i) => ({ x: p.x + (target[i].x - p.x) * e, y: p.y + (target[i].y - p.y) * e })));
      if (t < 1) tween.current = requestAnimationFrame(tick);
    };
    tween.current = requestAnimationFrame(tick);
  }, []);

  const handleProps = (i, label) => ({
    tabIndex: 0,
    role: "slider",
    "aria-label": label,
    "aria-valuetext": `${points[i].x.toFixed(1)}, ${points[i].y.toFixed(1)}`,
    style: { touchAction: "none", cursor: dragging === i ? "grabbing" : "grab" },
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setDragging(i);
      setTouched(true);
    },
    onPointerMove: (e) => {
      if (dragging === i) move(i, toSvg(e));
    },
    onPointerUp: () => setDragging(null),
    onPointerCancel: () => setDragging(null),
    onKeyDown: (e) => {
      const d = e.shiftKey ? step * 4 : step;
      const delta = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
      if (!delta) return;
      e.preventDefault();
      setTouched(true);
      move(i, { x: points[i].x + delta[0], y: points[i].y + delta[1] });
    },
  });

  return { points, setPoints, animateTo, svgRef, toSvg, handleProps, touched, dragging };
}
