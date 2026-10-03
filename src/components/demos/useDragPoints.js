import { useCallback, useRef, useState } from "react";

// Draggable points inside an SVG, in the SVG's own (viewBox) units. Works
// with mouse, touch and pen through pointer capture, and with the keyboard:
// a focused handle moves with the arrow keys (shift for bigger steps).
export function useDragPoints(initial, { clamp, step = 0.25 } = {}) {
  const [points, setPoints] = useState(initial);
  const svgRef = useRef(null);
  const dragging = useRef(null);

  const toSvg = useCallback((e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: p.y };
  }, []);

  const move = useCallback(
    (i, p) => setPoints((prev) => prev.map((q, j) => (j === i ? (clamp ? clamp(p) : p) : q))),
    [clamp],
  );

  const handleProps = (i) => ({
    tabIndex: 0,
    role: "slider",
    "aria-valuetext": `${points[i].x.toFixed(1)}, ${points[i].y.toFixed(1)}`,
    style: { touchAction: "none", cursor: "grab" },
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = i;
    },
    onPointerMove: (e) => {
      if (dragging.current === i) move(i, toSvg(e));
    },
    onPointerUp: () => (dragging.current = null),
    onPointerCancel: () => (dragging.current = null),
    onKeyDown: (e) => {
      const d = e.shiftKey ? step * 4 : step;
      const delta = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
      if (!delta) return;
      e.preventDefault();
      move(i, { x: points[i].x + delta[0], y: points[i].y + delta[1] });
    },
  });

  return { points, setPoints, svgRef, handleProps };
}
