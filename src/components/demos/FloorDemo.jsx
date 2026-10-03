import { useEffect, useRef, useState } from "react";
import { Key, PALETTE, Strip, num, useDemoKeys } from "./DemoKit";

// A checkered floor drawn by a small software rasterizer at 240x136, so the
// pixels stay visible. Two triangles, UVs interpolated either affinely or
// perspective-correctly, and mip levels picked per 2x2 quad from the UV
// differences between neighboring pixels, the way GPUs do it.

const W = 240;
const H = 136;
const F = W * 0.62; // focal length in pixels
const HORIZON = H * 0.16;
const HALF = 1.6; // floor half size
const DIST = 2.75; // floor center distance (nearest corner stays in front)
const TEX = 256; // pretend texture size, for mip selection
const CHECKS = 8;
const START = { yaw: 0.55, height: 0.55 };
const MIP_COLORS = [PALETTE.green, PALETTE.blue, "#E5C07B", PALETTE.coral, "#F472B6", "#A1A1AA", "#71717A"].map((h) =>
  [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)),
);
const LIGHT = [216, 216, 220];
const DARK = [36, 36, 42];
const BG = [17, 17, 20];

function project({ yaw, height }) {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  const local = [
    [-HALF, -HALF, 0, 0],
    [HALF, -HALF, 1, 0],
    [HALF, HALF, 1, 1],
    [-HALF, HALF, 0, 1],
  ];
  return local.map(([lx, lz, u, v]) => {
    const x = lx * c - lz * s;
    const z = DIST + lx * s + lz * c;
    return { x: W / 2 + (F * x) / z, y: HORIZON + (F * height) / z, iz: 1 / z, u, v };
  });
}

const TRIS = [
  [0, 1, 2],
  [0, 2, 3],
];

function edge(a, b, px, py) {
  return (b.x - a.x) * (py - a.y) - (b.y - a.y) * (px - a.x);
}

function render(ctx, image, verts, opts, buf) {
  const data = image.data;
  const tris = TRIS.map(([i, j, k]) => {
    const t = [verts[i], verts[j], verts[k]];
    return { t, area: edge(t[0], t[1], t[2].x, t[2].y) };
  });
  const bary = (tri, px, py) => {
    const [a, b, c] = tri.t;
    return [edge(b, c, px, py) / tri.area, edge(c, a, px, py) / tri.area, edge(a, b, px, py) / tri.area];
  };
  const uvAt = (tri, w) => {
    const [a, b, c] = tri.t;
    if (!opts.perspective) return [w[0] * a.u + w[1] * b.u + w[2] * c.u, w[0] * a.v + w[1] * b.v + w[2] * c.v];
    const iz = w[0] * a.iz + w[1] * b.iz + w[2] * c.iz;
    return [
      (w[0] * a.u * a.iz + w[1] * b.u * b.iz + w[2] * c.u * c.iz) / iz,
      (w[0] * a.v * a.iz + w[1] * b.v * b.iz + w[2] * c.v * c.iz) / iz,
    ];
  };
  const lanes = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];
  let maxLod = 0;
  for (let qy = 0; qy < H; qy += 2) {
    for (let qx = 0; qx < W; qx += 2) {
      const cover = [-1, -1, -1, -1];
      const ws = [];
      for (let l = 0; l < 4; l++) {
        const px = qx + lanes[l][0] + 0.5;
        const py = qy + lanes[l][1] + 0.5;
        for (let ti = 0; ti < 2; ti++) {
          const w = bary(tris[ti], px, py);
          if (w[0] >= 0 && w[1] >= 0 && w[2] >= 0) {
            cover[l] = ti;
            ws[l] = w;
            break;
          }
        }
      }
      const first = cover.find((c) => c >= 0);
      if (first === undefined) {
        for (let l = 0; l < 4; l++) {
          const i = (qy + lanes[l][1]) * W + qx + lanes[l][0];
          buf.lod[i] = -1;
          data.set(BG, i * 4);
        }
        continue;
      }
      // Derivatives across the quad, using one triangle for all four lanes
      // (helper lanes extrapolate past the edge, as on real hardware).
      const tri = tris[first];
      const uv = lanes.map(([dx, dy]) => uvAt(tri, bary(tri, qx + dx + 0.5, qy + dy + 0.5)));
      const rho = Math.max(
        Math.hypot((uv[1][0] - uv[0][0]) * TEX, (uv[1][1] - uv[0][1]) * TEX),
        Math.hypot((uv[2][0] - uv[0][0]) * TEX, (uv[2][1] - uv[0][1]) * TEX),
      );
      const lod = Math.max(0, Math.log2(Math.max(rho, 1e-6)));
      for (let l = 0; l < 4; l++) {
        const i = (qy + lanes[l][1]) * W + qx + lanes[l][0];
        if (cover[l] < 0) {
          buf.lod[i] = -1;
          data.set(BG, i * 4);
          continue;
        }
        const [u, v] = uvAt(tris[cover[l]], ws[l]);
        const cu = Math.min(CHECKS - 1, Math.max(0, Math.floor(u * CHECKS)));
        const cv = Math.min(CHECKS - 1, Math.max(0, Math.floor(v * CHECKS)));
        let t = (cu + cv) & 1;
        if (opts.filter) {
          // A mip of a checkerboard fades toward gray once a texel of that
          // level is bigger than a check.
          const footprint = 2 ** lod / (TEX / CHECKS);
          const k = Math.min(1, Math.max(0, 1.3 - footprint));
          t = 0.5 + (t - 0.5) * k;
        }
        let r = DARK[0] + (LIGHT[0] - DARK[0]) * t;
        let g = DARK[1] + (LIGHT[1] - DARK[1]) * t;
        let b = DARK[2] + (LIGHT[2] - DARK[2]) * t;
        if (opts.mips) {
          const m = MIP_COLORS[Math.min(MIP_COLORS.length - 1, Math.floor(lod))];
          r = r * 0.35 + m[0] * 0.65;
          g = g * 0.35 + m[1] * 0.65;
          b = b * 0.35 + m[2] * 0.65;
        }
        data[i * 4] = r;
        data[i * 4 + 1] = g;
        data[i * 4 + 2] = b;
        buf.lod[i] = lod;
        buf.u[i] = u;
        buf.v[i] = v;
        if (lod > maxLod) maxLod = lod;
      }
    }
  }
  ctx.putImageData(image, 0, 0);
  return maxLod;
}

export default function FloorDemo({ flags }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const buf = useRef({ lod: new Float32Array(W * H), u: new Float32Array(W * H), v: new Float32Array(W * H) });
  const [view, setView] = useState(START);
  const [perspective, setPerspective] = useState(!flags.has("affine"));
  const [mips, setMips] = useState(flags.has("mips"));
  const [filter, setFilter] = useState(true);
  const [touched, setTouched] = useState(false);
  const [probe, setProbe] = useState(null);
  const [maxLod, setMaxLod] = useState(0);
  const drag = useRef(null);

  const verts = project(view);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!ctxRef.current) {
      const ctx = canvas.getContext("2d");
      ctxRef.current = { ctx, image: ctx.createImageData(W, H) };
      ctxRef.current.image.data.fill(255);
    }
    const { ctx, image } = ctxRef.current;
    setMaxLod(render(ctx, image, verts, { perspective, mips, filter }, buf.current));
  }, [view, perspective, mips, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Until someone grabs it, the floor turns slowly so the effect is visible
  // without doing anything. Stops off screen and with reduced motion.
  useEffect(() => {
    if (touched || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    const tick = () => {
      setView((v) => ({ ...v, yaw: v.yaw + 0.0035 }));
      if (visible) raf = requestAnimationFrame(tick);
    };
    io.observe(rootRef.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [touched]);

  useDemoKeys(rootRef, {
    p: () => setPerspective((v) => !v),
    m: () => setMips((v) => !v),
    f: () => setFilter((v) => !v),
    r: () => {
      setTouched(true);
      setView(START);
    },
  });

  const toPixel = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: Math.floor(((e.clientX - r.left) / r.width) * W), y: Math.floor(((e.clientY - r.top) / r.height) * H) };
  };

  let readout;
  const pi = probe && probe.y * W + probe.x;
  if (probe && buf.current.lod[pi] >= 0) {
    readout = (
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">pixel ({probe.x}, {probe.y})</span>
        <span>uv {num(buf.current.u[pi])}, {num(buf.current.v[pi])}</span>
        <span>mip {num(buf.current.lod[pi], 1)}</span>
      </span>
    );
  } else {
    readout = (
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">{perspective ? "perspective-correct" : "affine"}</span>
        <span>{perspective ? "u/w, v/w and 1/w interpolated" : "u and v interpolated directly"}</span>
        {mips && <span>mip 0 to {Math.floor(maxLod)} on screen</span>}
        {!touched && <span className="text-zinc-500">drag to turn</span>}
      </span>
    );
  }

  // Outline of the floor's two triangles, drawn over the pixels.
  const outline = verts.map((v) => `${v.x},${v.y}`).join(" ");

  return (
    <div ref={rootRef}>
      <div
        className="relative cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY };
          setTouched(true);
        }}
        onPointerMove={(e) => {
          if (drag.current) {
            const dx = e.clientX - drag.current.x;
            const dy = e.clientY - drag.current.y;
            drag.current = { x: e.clientX, y: e.clientY };
            setView((v) => ({ yaw: v.yaw + dx * 0.006, height: Math.min(1.4, Math.max(0.18, v.height + dy * 0.004)) }));
          } else {
            const p = toPixel(e);
            setProbe(p.x >= 0 && p.x < W && p.y >= 0 && p.y < H ? p : null);
          }
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onPointerLeave={() => setProbe(null)}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block w-full"
          style={{ imageRendering: "pixelated", aspectRatio: `${W} / ${H}` }}
          role="img"
          aria-label="A checkered floor rendered by a small software rasterizer"
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full">
          <polygon points={outline} fill="none" stroke="#FAFAFA" strokeOpacity="0.25" strokeWidth="0.5" />
          <line
            x1={verts[0].x}
            y1={verts[0].y}
            x2={verts[2].x}
            y2={verts[2].y}
            stroke="#FAFAFA"
            strokeOpacity={perspective ? 0.18 : 0.5}
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />
          {probe && buf.current.lod[pi] >= 0 && (
            <rect x={probe.x & ~1} y={probe.y & ~1} width={2} height={2} fill="none" stroke="#FAFAFA" strokeWidth="0.35" />
          )}
        </svg>
      </div>

      <Strip readout={readout}>
        <Key k="p" on={perspective} onClick={() => setPerspective((v) => !v)}>Perspective</Key>
        <Key k="m" on={mips} onClick={() => setMips((v) => !v)}>Mip levels</Key>
        <Key k="f" on={filter} onClick={() => setFilter((v) => !v)}>Filtering</Key>
        <Key
          k="r"
          onClick={() => {
            setTouched(true);
            setView(START);
          }}
        >
          Reset
        </Key>
      </Strip>
    </div>
  );
}
