import { useRef, useState } from "react";
import { Key, PALETTE, Strip, useDemoKeys } from "./DemoKit";

// A deferred frame's render target traffic. Only reads and writes of render
// targets are counted: no textures, vertex data, shadow maps or overdraw,
// and no framebuffer compression. Every target is touched once per pixel
// unless a fraction says otherwise. MB and GB are decimal, like bandwidth
// specs. "Tiled" assumes depth, G-buffer, lighting and transparents share
// one render pass on a tile-based GPU: depth is never stored, the G-buffer
// is read back from tile memory, blending happens on chip, and only the
// finished HDR target goes out to memory.

const BYTES = { RGBA8: 4, RGBA16F: 8, R11G11B10F: 4, D32: 4 };
const RES = [
  { name: "720p", w: 1280, h: 720 },
  { name: "1080p", w: 1920, h: 1080 },
  { name: "1440p", w: 2560, h: 1440 },
  { name: "4K", w: 3840, h: 2160 },
];
const FPS = [30, 60, 120, 144];
const GPUS = {
  desktop: { name: "desktop GPU", gbs: 500 },
  mobile: { name: "mobile GPU", gbs: 50 },
};

// Each entry: target, format, "r" or "w", touches per pixel, and whether a
// tiled GPU can keep it on chip.
const PASSES = [
  { name: "Depth pre-pass", io: [["depth", "D32", "w", 1, true]] },
  {
    name: "G-buffer",
    io: [
      ["depth", "D32", "r", 1, true],
      ["albedo", "RGBA8", "w", 1, true],
      ["normal", "RGBA16F", "w", 1, true],
      ["material", "RGBA8", "w", 1, true],
      ["emissive", "R11G11B10F", "w", 1, true],
    ],
  },
  {
    name: "Lighting",
    io: [
      ["depth", "D32", "r", 1, true],
      ["albedo", "RGBA8", "r", 1, true],
      ["normal", "RGBA16F", "r", 1, true],
      ["material", "RGBA8", "r", 1, true],
      ["emissive", "R11G11B10F", "r", 1, true],
      ["HDR color", "RGBA16F", "w", 1, false],
    ],
  },
  {
    // blended over about half the screen
    name: "Transparent",
    io: [
      ["depth", "D32", "r", 0.5, true],
      ["HDR color", "RGBA16F", "r", 0.5, true],
      ["HDR color", "RGBA16F", "w", 0.5, true],
    ],
  },
  {
    // a half-res and smaller mip chain, down and back up: about 2/3 of a
    // screen written and read
    name: "Bloom",
    io: [
      ["HDR color", "RGBA16F", "r", 1, false],
      ["bloom mips", "R11G11B10F", "w", 0.67, false],
      ["bloom mips", "R11G11B10F", "r", 0.67, false],
    ],
  },
  {
    name: "Tonemap",
    io: [
      ["HDR color", "RGBA16F", "r", 1, false],
      ["bloom", "R11G11B10F", "r", 0.25, false],
      ["back buffer", "RGBA8", "w", 1, false],
    ],
  },
].map((p) => ({ ...p, io: p.io.map(([rt, f, rw, n, tile]) => ({ rt, f, rw, n, tile, bpp: BYTES[f] * n })) }));

const SCALE = 34; // bytes per pixel that fill a pass row
const START = { res: 1, fps: 1, mobile: true, tiled: false, on: PASSES.map(() => true) };

const cost = (io, tiled) => (tiled && io.tile ? 0 : io.bpp);
const passBpp = (p, tiled) => p.io.reduce((s, io) => s + cost(io, tiled), 0);
const fmtMB = (b) => (b / 1e6 >= 100 ? (b / 1e6).toFixed(0) : (b / 1e6).toFixed(1));
const fmtGB = (b) => (b / 1e9 >= 100 ? (b / 1e9).toFixed(0) : (b / 1e9).toFixed(1));
const fmtBpp = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const touches = (n) => (n === 1 ? "once" : `${n} per pixel`);

function Stepper({ label, value, onPrev, onNext }) {
  const btn =
    "grid h-[22px] w-[22px] place-items-center rounded-[5px] border border-zinc-700 bg-zinc-900 font-mono text-[12px] text-zinc-400 shadow-[inset_0_-2px_0_rgba(0,0,0,0.45)] outline-none ring-accent transition-[transform,color] hover:text-zinc-200 focus-visible:ring-1 active:translate-y-px active:shadow-none";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-zinc-500">{label}</span>
      <button type="button" className={btn} onClick={onPrev} aria-label={`Previous ${label}`}>
        ‹
      </button>
      <span className="min-w-[4.5ch] text-center text-zinc-100">{value}</span>
      <button type="button" className={btn} onClick={onNext} aria-label={`Next ${label}`}>
        ›
      </button>
    </span>
  );
}

export default function BandwidthDemo() {
  const rootRef = useRef(null);
  const [s, setS] = useState(START);
  const [hover, setHover] = useState(null); // { pass, io }

  const res = RES[s.res];
  const fps = FPS[s.fps];
  const gpu = s.mobile ? GPUS.mobile : GPUS.desktop;
  const px = res.w * res.h;
  const live = PASSES.map((p, i) => (s.on[i] ? passBpp(p, s.tiled) * px : 0));
  const untiled = PASSES.map((p, i) => (s.on[i] ? passBpp(p, false) * px : 0));
  const frame = live.reduce((a, b) => a + b, 0);
  const frameUntiled = untiled.reduce((a, b) => a + b, 0);
  const perSec = frame * fps;
  const budget = gpu.gbs * 1e9;
  const pct = (perSec / budget) * 100;
  const saved = frameUntiled ? 1 - frame / frameUntiled : 0;

  const step = (key, n, d) => setS((v) => ({ ...v, [key]: (v[key] + d + n) % n }));
  const toggle = (key) => setS((v) => ({ ...v, [key]: !v[key] }));
  const togglePass = (i) => setS((v) => ({ ...v, on: v.on.map((o, j) => (j === i ? !o : o)) }));

  useDemoKeys(rootRef, {
    s: () => step("res", RES.length, 1),
    f: () => step("fps", FPS.length, 1),
    m: () => toggle("mobile"),
    t: () => toggle("tiled"),
    r: () => setS(START),
    ...Object.fromEntries(PASSES.map((_, i) => [String(i + 1), () => togglePass(i)])),
  });

  // The bottom bar runs to whichever is bigger, the budget or the traffic.
  const span = Math.max(budget, frameUntiled * fps) * 1.08;
  const pctOf = (b) => `${(b / span) * 100}%`;
  let x = 0;
  const stacked = live.map((b, i) => {
    const seg = { i, left: x * fps, width: b * fps };
    x += b;
    return seg;
  });

  let detail;
  if (hover) {
    const { pass, io } = hover;
    const onChip = s.tiled && io.tile;
    detail = (
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">
          {PASSES[pass].name}: {io.rt}
        </span>
        <span>
          {io.f} {io.rw === "w" ? "written" : "read"} {touches(io.n)}, {fmtBpp(io.bpp)} B/px
        </span>
        <span style={{ color: onChip ? PALETTE.green : undefined }}>{onChip ? `${fmtMB(io.bpp * px)} MB stays on chip` : `${fmtMB(io.bpp * px)} MB`}</span>
      </span>
    );
  } else if (s.tiled) {
    detail = (
      <span className="flex flex-wrap gap-x-4">
        <span style={{ color: PALETTE.green }}>tiled: {fmtMB(frameUntiled - frame)} MB per frame stays on chip</span>
        <span>{Math.round(saved * 100)}% less traffic</span>
      </span>
    );
  } else {
    detail = <span className="text-zinc-500">render target reads and writes only: no textures, geometry, shadow maps or overdraw</span>;
  }

  const readout = (
    <span className="flex flex-col">
      <span className="flex flex-wrap gap-x-4">
        <span className="whitespace-nowrap text-zinc-200">{fmtMB(frame)} MB per frame</span>
        <span className="whitespace-nowrap">
          {fmtGB(perSec)} GB/s at {fps} fps
        </span>
        <span className="whitespace-nowrap" style={{ color: pct > 100 ? PALETTE.bad : PALETTE.green }}>
          {pct < 10 ? pct.toFixed(1) : Math.round(pct)}% of a {gpu.gbs} GB/s {gpu.name}
        </span>
      </span>
      {detail}
    </span>
  );

  return (
    <div ref={rootRef}>
      <div className="bg-[#111114] font-mono text-[12px]" onPointerLeave={() => setHover(null)}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-[#232327] px-4 py-3">
          <Stepper label="resolution" value={res.name} onPrev={() => step("res", RES.length, -1)} onNext={() => step("res", RES.length, 1)} />
          <Stepper label="frame rate" value={`${fps}`} onPrev={() => step("fps", FPS.length, -1)} onNext={() => step("fps", FPS.length, 1)} />
          <span className="text-zinc-500">
            {(px / 1e6).toFixed(2)}M pixels
          </span>
        </div>

        <div className="py-2">
          {PASSES.map((p, i) => {
            const on = s.on[i];
            const writes = p.io.filter((io) => io.rw === "w");
            const reads = p.io.filter((io) => io.rw === "r");
            const list = (ios) => ios.map((io) => (io.n === 1 ? io.f : `${io.f} ×${io.n}`)).join(", ");
            return (
              <div key={p.name} className="px-4 py-2">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                  <Key k={String(i + 1)} on={on} onClick={() => togglePass(i)}>
                    {p.name}
                  </Key>
                  <span className={`tabular-nums ${on ? "text-zinc-400" : "text-zinc-600"}`}>
                    {s.tiled && passBpp(p, true) === 0 ? (
                      <span style={{ color: on ? PALETTE.green : undefined }}>all on chip</span>
                    ) : (
                      <>
                        {fmtBpp(passBpp(p, s.tiled))} B/px <span className={on ? "text-zinc-100" : ""}>{fmtMB(passBpp(p, s.tiled) * px)} MB</span>
                      </>
                    )}
                  </span>
                </div>
                <div className={`mt-2 flex h-2.5 gap-px border-b border-zinc-800 pb-px transition-opacity ${on ? "" : "opacity-25"}`}>
                  {p.io.map((io, k) => {
                    const chip = s.tiled && io.tile;
                    const color = io.rw === "w" ? PALETTE.green : PALETTE.blue;
                    const lit = hover && hover.pass === i && hover.io === io;
                    return (
                      <span
                        key={k}
                        className="block h-full shrink-0 cursor-default rounded-[2px] transition-[background-color,border-color] duration-150"
                        style={{
                          width: `${(io.bpp / SCALE) * 100}%`,
                          background: chip ? "transparent" : color,
                          opacity: chip ? (lit ? 0.9 : 0.5) : lit ? 1 : 0.8,
                          border: chip ? `1px dashed ${color}99` : lit ? "1px solid #FAFAFA" : undefined,
                        }}
                        onPointerEnter={(e) => e.pointerType === "mouse" && setHover({ pass: i, io })}
                        onPointerDown={() => setHover({ pass: i, io })}
                      />
                    );
                  })}
                </div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {writes.length > 0 && (
                    <span className="mr-3">
                      <span style={{ color: PALETTE.green }}>writes</span> {list(writes)}
                    </span>
                  )}
                  {reads.length > 0 && (
                    <span>
                      <span style={{ color: PALETTE.blue }}>reads</span> {list(reads)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-[#232327] px-4 pb-5 pt-3">
          <div className="flex flex-wrap justify-between gap-x-4 text-zinc-500">
            <span>
              per second, {fmtGB(perSec)} GB/s
            </span>
            <span>
              budget <span className="text-zinc-300">{gpu.gbs} GB/s</span> {gpu.name}
            </span>
          </div>
          <div className="relative mt-3 h-4">
            <span className="absolute inset-x-0 bottom-0 h-px bg-zinc-700" />
            {s.tiled && frameUntiled > frame && (
              <span
                className="absolute bottom-0 top-0 rounded-[2px] border border-dashed border-zinc-600"
                style={{ left: pctOf(frame * fps), width: pctOf((frameUntiled - frame) * fps) }}
              />
            )}
            {stacked.map(
              (seg) =>
                seg.width > 0 && (
                  <span
                    key={seg.i}
                    className="absolute bottom-0 top-0 border-r border-[#111114]"
                    style={{
                      left: pctOf(seg.left),
                      width: pctOf(seg.width),
                      background: PALETTE.green,
                      opacity: seg.i % 2 ? 0.6 : 0.9,
                    }}
                  />
                ),
            )}
            {perSec > budget && (
              <span className="absolute bottom-0 top-0" style={{ left: pctOf(budget), width: pctOf(perSec - budget), background: PALETTE.bad, opacity: 0.75 }} />
            )}
            <span className="absolute -bottom-1 -top-1.5 w-px bg-zinc-200" style={{ left: pctOf(budget) }} />
          </div>
        </div>
      </div>

      <Strip readout={readout}>
        <Key k="s" onClick={() => step("res", RES.length, 1)}>Resolution</Key>
        <Key k="f" onClick={() => step("fps", FPS.length, 1)}>Frame rate</Key>
        <Key k="m" on={s.mobile} onClick={() => toggle("mobile")}>Mobile GPU</Key>
        <Key k="t" on={s.tiled} onClick={() => toggle("tiled")}>Tiled</Key>
        <Key k="r" onClick={() => setS(START)}>Reset</Key>
      </Strip>
    </div>
  );
}
