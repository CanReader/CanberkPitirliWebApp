import { Fragment, useEffect, useRef, useState } from "react";
import { Key, PALETTE, Strip, useDemoKeys } from "./DemoKit";

// Three translucent panes composited per pixel, in draw order, the way the
// output merger does it. "Over" is src * a + dst * (1 - a); additive is
// src * a + dst, clamped. The target is a plain 8-bit UNORM one, so values
// blend as stored with no sRGB conversion; the math runs in float and is
// rounded to 8 bits once, at the end. Edges get analytic coverage, which
// scales alpha the way antialiasing would.

const W = 480;
const H = 270;
const S = 2; // backing store scale, for crisp edges on dense screens
const ALPHA = 0.5;
const GRID_STEP = 24;
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const BG = rgb("#111114");
const GRID = rgb("#232327");
const PANES = [
  { name: "coral", hex: PALETTE.coral, cx: 190, cy: 108, r: 78 },
  { name: "green", hex: PALETTE.green, cx: 290, cy: 108, r: 78 },
  { name: "blue", hex: PALETTE.blue, cx: 240, cy: 182, r: 78 },
].map((p) => ({ ...p, rgb: rgb(p.hex) }));
const START = [0, 1, 2];
const TRIPLE = { x: 238, y: 134 };

const toHex = (c) => "#" + c.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("").toUpperCase();

// Color of one point after drawing every pane in `order`. `aa` is how many
// coverage steps per unit, so edges fade over about one device pixel.
function shade(x, y, order, additive, aa) {
  const onGrid = x % GRID_STEP < 1 / S || y % GRID_STEP < 1 / S;
  const c = [...(onGrid ? GRID : BG)];
  const covering = [];
  for (const i of order) {
    const p = PANES[i];
    const cov = Math.min(1, Math.max(0, (p.r - Math.hypot(x - p.cx, y - p.cy)) * aa + 0.5));
    if (cov <= 0) continue;
    if (cov >= 0.5) covering.push(i);
    const a = ALPHA * cov;
    for (let k = 0; k < 3; k++) c[k] = additive ? Math.min(1, p.rgb[k] * a + c[k]) : p.rgb[k] * a + c[k] * (1 - a);
  }
  return { c, covering };
}

// Same math as shade(), without allocations, for every backing pixel.
function render(ctx, image, order, additive) {
  const data = image.data;
  const panes = order.map((i) => PANES[i]);
  for (let py = 0; py < H * S; py++) {
    const y = (py + 0.5) / S;
    const rowGrid = y % GRID_STEP < 1 / S;
    for (let px = 0; px < W * S; px++) {
      const x = (px + 0.5) / S;
      const base = rowGrid || x % GRID_STEP < 1 / S ? GRID : BG;
      let r = base[0];
      let g = base[1];
      let b = base[2];
      for (const p of panes) {
        const cov = Math.min(1, Math.max(0, (p.r - Math.hypot(x - p.cx, y - p.cy)) * S + 0.5));
        if (cov <= 0) continue;
        const a = ALPHA * cov;
        if (additive) {
          r = Math.min(1, p.rgb[0] * a + r);
          g = Math.min(1, p.rgb[1] * a + g);
          b = Math.min(1, p.rgb[2] * a + b);
        } else {
          r = p.rgb[0] * a + r * (1 - a);
          g = p.rgb[1] * a + g * (1 - a);
          b = p.rgb[2] * a + b * (1 - a);
        }
      }
      const i = (py * W * S + px) * 4;
      data[i] = Math.round(r * 255);
      data[i + 1] = Math.round(g * 255);
      data[i + 2] = Math.round(b * 255);
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

const sameOrder = (a, b) => a.every((v, i) => v === b[i]);

export default function BlendDemo() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const listRef = useRef(null);
  const stopDrag = useRef(null);
  const [order, setOrder] = useState(START);
  const [additive, setAdditive] = useState(false);
  const [probe, setProbe] = useState(null);
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    if (!ctxRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctxRef.current = { ctx, image: ctx.createImageData(W * S, H * S) };
    }
    const { ctx, image } = ctxRef.current;
    render(ctx, image, order, additive);
  }, [order, additive]);

  useEffect(() => () => stopDrag.current?.(), []);

  const toTop = (i) => setOrder((o) => [...o.filter((j) => j !== i), i]);
  const reset = () => {
    setOrder(START);
    setAdditive(false);
  };

  useDemoKeys(rootRef, {
    1: () => toTop(0),
    2: () => toTop(1),
    3: () => toTop(2),
    v: () => setOrder((o) => [...o].reverse()),
    a: () => setAdditive((v) => !v),
    r: reset,
  });

  // Reordering by drag: the dragged pane goes after every other pane whose
  // center is left of the pointer.
  const moveTo = (i, clientX) => {
    const others = [...listRef.current.querySelectorAll("[data-pane]")].filter((el) => Number(el.dataset.pane) !== i);
    const pos = others.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2 < clientX;
    }).length;
    setOrder((o) => {
      const rest = o.filter((j) => j !== i);
      const next = [...rest.slice(0, pos), i, ...rest.slice(pos)];
      return sameOrder(next, o) ? o : next;
    });
  };
  // Listen on the window: reordering moves the item's DOM node, which would
  // drop pointer capture on the item itself.
  const startDrag = (i, e) => {
    e.preventDefault();
    stopDrag.current?.();
    setDragging(i);
    const move = (ev) => moveTo(i, ev.clientX);
    const end = (ev) => {
      if (ev?.type === "pointerup") moveTo(i, ev.clientX);
      setDragging(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      stopDrag.current = null;
    };
    stopDrag.current = end;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  };
  const nudge = (i, d) =>
    setOrder((o) => {
      const at = o.indexOf(i);
      const to = Math.min(o.length - 1, Math.max(0, at + d));
      if (to === at) return o;
      const next = [...o];
      next.splice(at, 1);
      next.splice(to, 0, i);
      return next;
    });

  const probeAt = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const y = ((e.clientY - r.top) / r.height) * H;
    setProbe(x >= 0 && x < W && y >= 0 && y < H ? { x, y } : null);
  };

  const at = probe ?? TRIPLE;
  const here = shade(at.x, at.y, order, additive, 64);
  const reversed = shade(at.x, at.y, [...order].reverse(), additive, 64);
  const hex = toHex(here.c);
  const revHex = toHex(reversed.c);

  const readout = (
    <span className="flex flex-col">
      <span className="flex flex-wrap gap-x-4">
        <span className="whitespace-nowrap text-zinc-200">{additive ? "dst = src × α + dst" : "dst = src × α + dst × (1 − α)"}</span>
        <span className="whitespace-nowrap">α = {ALPHA.toFixed(1)}</span>
        <span className="whitespace-nowrap" style={{ color: additive ? PALETTE.green : PALETTE.coral }}>
          {additive ? "order does not matter" : "order matters"}
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-x-4">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <i className="inline-block h-3 w-3 rounded-sm border border-white/10" style={{ background: hex }} />
          <span className="text-zinc-100">{hex}</span>
          <span className="text-zinc-500">{probe ? "under the pointer" : "triple overlap"}</span>
        </span>
        {here.covering.length > 1 && (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-zinc-500">reversed</span>
            <i className="inline-block h-3 w-3 rounded-sm border border-white/10" style={{ background: revHex }} />
            <span style={{ color: revHex === hex ? undefined : PALETTE.coral }}>{revHex}</span>
          </span>
        )}
        {here.covering.length === 0 && <span className="text-zinc-500">background only</span>}
      </span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <div className="bg-[#111114]">
        <div
          className="relative touch-pan-y select-none"
          onPointerMove={(e) => e.pointerType === "mouse" && probeAt(e)}
          onPointerDown={(e) => e.pointerType !== "mouse" && probeAt(e)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setProbe(null)}
        >
          <canvas
            ref={canvasRef}
            width={W * S}
            height={H * S}
            className="block w-full"
            style={{ aspectRatio: `${W} / ${H}` }}
            role="img"
            aria-label={`Three translucent panes blended in the order ${order.map((i) => PANES[i].name).join(", ")}, ${additive ? "additive" : "over"} blending`}
          />
          <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full">
            <g stroke="#FAFAFA" strokeWidth="1.2" fill="none">
              {probe ? (
                <circle cx={probe.x} cy={probe.y} r={5} strokeOpacity="0.8" />
              ) : (
                <>
                  <circle cx={TRIPLE.x} cy={TRIPLE.y} r={5} strokeOpacity="0.6" />
                  <circle cx={TRIPLE.x} cy={TRIPLE.y} r={1.2} fill="#FAFAFA" fillOpacity="0.6" stroke="none" />
                </>
              )}
            </g>
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#232327] px-4 py-3 font-mono text-[12px] text-zinc-500">
          <span>draw order</span>
          <div ref={listRef} className="flex items-center gap-2">
            {order.map((i, pos) => (
              <Fragment key={i}>
                {pos > 0 && (
                  <span aria-hidden="true" className="text-zinc-600">
                    →
                  </span>
                )}
                <div
                  data-pane={i}
                  role="button"
                  tabIndex={0}
                  aria-label={`${PANES[i].name} pane, drawn ${pos + 1} of 3. Arrow keys move it.`}
                  className={`flex select-none items-center gap-1.5 rounded-[5px] border bg-zinc-900 px-2 py-1 text-zinc-300 shadow-[inset_0_-2px_0_rgba(0,0,0,0.45)] outline-none ring-accent transition-colors focus-visible:ring-1 ${
                    dragging === i ? "cursor-grabbing border-zinc-400" : "cursor-grab border-zinc-700 hover:border-zinc-500"
                  }`}
                  style={{ touchAction: "none" }}
                  onPointerDown={(e) => startDrag(i, e)}
                  onKeyDown={(e) => {
                    const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
                    if (!d) return;
                    e.preventDefault();
                    nudge(i, d);
                  }}
                >
                  <i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: PANES[i].hex, opacity: 0.85 }} />
                  <span className="text-zinc-500">{pos + 1}</span>
                  {PANES[i].name}
                </div>
              </Fragment>
            ))}
          </div>
          <span className="text-zinc-600">last drawn lands on top</span>
        </div>
      </div>

      <Strip readout={readout}>
        <Key k="1" onClick={() => toTop(0)}>Coral last</Key>
        <Key k="2" onClick={() => toTop(1)}>Green last</Key>
        <Key k="3" onClick={() => toTop(2)}>Blue last</Key>
        <Key k="v" onClick={() => setOrder((o) => [...o].reverse())}>Reverse</Key>
        <Key k="a" on={additive} onClick={() => setAdditive((v) => !v)}>Additive</Key>
        <Key k="r" onClick={reset}>Reset</Key>
      </Strip>
    </div>
  );
}
