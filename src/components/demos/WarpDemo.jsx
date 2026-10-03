import { useEffect, useMemo, useRef, useState } from "react";
import { Handle, Key, PALETTE, Strip, useDemoKeys } from "./DemoKit";

// One wave of 32 lanes running a small branchy shader. Every lane has its
// own x; lanes above the threshold take the if, the rest take the else.
// The grid under the bars is the wave's issue log: one row per instruction
// issued, one column per lane, lit where that lane was switched on. Each
// line of code counts as one instruction and one cycle, a simplification
// that keeps the arithmetic readable.
// With the "latency" flag it shows latency hiding instead.

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const LANES = 32;
const IF_C = PALETTE.green;
const ELSE_C = PALETTE.blue;

const CODE = [
  { text: () => "float x = dot(n, l);", side: "all" },
  { text: (t) => `if (x > ${t.toFixed(2)}) {`, side: "all" },
  { text: () => "    float s = pow(x, k);", side: "if" },
  { text: () => "    float3 c = s * lightColor;", side: "if" },
  { text: () => "    c += diffuse * x;", side: "if" },
  { text: () => "    color = c;", side: "if" },
  { text: () => "} else {", side: null },
  { text: () => "    float3 a = sh0 + sh1 * n.y;", side: "else" },
  { text: () => "    a *= ao;", side: "else" },
  { text: () => "    color = a;", side: "else" },
  { text: () => "}", side: null },
  { text: () => "out = color * albedo;", side: "all" },
];
const PATH_LEN = {
  if: CODE.filter((c) => c.side === "all" || c.side === "if").length,
  else: CODE.filter((c) => c.side === "all" || c.side === "else").length,
};

const wobble = (i) => 0.07 * Math.sin(i * 2.37 + 1.1);
const clamp1 = (v) => Math.min(0.98, Math.max(-0.98, v));
const lanes = (f) => Array.from({ length: LANES }, (_, i) => clamp1(f(i)));
// A light's terminator crossing the wave: a coherent run on each side.
const EDGE = lanes((i) => 0.82 * Math.cos(((i + 0.5) / LANES) * Math.PI * 1.1 - 0.05) + wobble(i));
const COHERENT = lanes((i) => 0.5 + 0.22 * Math.sin(i * 0.45) + wobble(i));
const ALTERNATING = lanes((i) => (i % 2 ? -0.45 : 0.55) + wobble(i));

// Layout, in viewBox units.
const PITCH = 20;
const X0 = 10;
const ZERO = 58;
const AMP = 44;
const GRID_Y = 120;
const ROW = 13;
const MAX_ROWS = PATH_LEN.if + PATH_LEN.else - 3; // both sides plus the shared lines
const VW = X0 + LANES * PITCH + 36;
const VH = GRID_Y + MAX_ROWS * ROW + 8;
const T_MAX = 0.95;

function schedule(values, t) {
  const takeIf = values.map((v) => v > t);
  const nIf = takeIf.filter(Boolean).length;
  const nElse = LANES - nIf;
  const issued = [];
  CODE.forEach((c, line) => {
    if (c.side === "all") issued.push({ line, mask: takeIf.map(() => true) });
    // a side with no lanes on it is jumped over entirely
    else if (c.side === "if" && nIf) issued.push({ line, mask: takeIf });
    else if (c.side === "else" && nElse) issued.push({ line, mask: takeIf.map((b) => !b) });
  });
  const active = issued.reduce((s, r) => s + r.mask.filter(Boolean).length, 0);
  const best = Math.max(nIf ? PATH_LEN.if : 0, nElse ? PATH_LEN.else : 0);
  return { takeIf, nIf, nElse, issued, util: active / (issued.length * LANES), best };
}

function DivergenceDemo() {
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const [values, setValues] = useState(EDGE);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(() => !reduced());
  const [pc, setPc] = useState(() => (reduced() ? Infinity : 0));
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  const { takeIf, nIf, nElse, issued, util, best } = useMemo(() => schedule(values, t), [values, t]);
  const len = issued.length;
  const cur = Math.min(pc, len); // len means "all done, show the whole log"
  const lenRef = useRef(len);
  lenRef.current = len;
  const pcRef = useRef(cur);
  pcRef.current = cur;

  // Plays one instruction at a time, holds on the finished log, loops.
  // Stops off screen; never starts with reduced motion.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let visible = false;
    let last = 0;
    const tick = (now) => {
      if (!last) last = now;
      const hold = pcRef.current >= lenRef.current ? 1600 : 480;
      if (now - last > hold) {
        last = now;
        setPc((p) => (p >= lenRef.current ? 0 : p + 1));
      }
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
  }, [playing]);

  const step = () => {
    setPlaying(false);
    setPc((p) => (Math.min(p, lenRef.current) >= lenRef.current ? 0 : Math.min(p, lenRef.current) + 1));
  };
  const togglePlay = () => {
    if (reduced()) return step();
    setPlaying((v) => !v);
  };
  const preset = (v) => {
    setValues(v);
    setT(0);
    setTouched(true);
  };
  const reset = () => {
    setValues(EDGE);
    setT(0);
    setPc(reduced() ? Infinity : 0);
    setPlaying(!reduced());
  };

  useDemoKeys(rootRef, {
    p: togglePlay,
    s: step,
    c: () => preset(COHERENT),
    a: () => preset(ALTERNATING),
    r: reset,
  });

  const toY = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse()).y;
  };
  const setFromY = (y) => setT(Math.min(T_MAX, Math.max(-T_MAX, (ZERO - y) / AMP)));

  const running = cur < len ? issued[cur] : null;
  const thrY = ZERO - t * AMP;
  const handleX = X0 + LANES * PITCH + 18;
  const activeHere = running ? running.mask.filter(Boolean).length : 0;
  const rowsShown = running ? cur + 1 : len;

  const readout = (
    <span className="flex flex-col">
      <span className="flex flex-wrap gap-x-4">
        <span style={{ color: IF_C }}>{nIf} lanes take the if</span>
        <span style={{ color: ELSE_C }}>{nElse} take the else</span>
        {running ? (
          <span className="text-zinc-200">
            line {running.line + 1}: {activeHere}/{LANES} lanes on
          </span>
        ) : (
          !touched && <span className="text-zinc-500">drag the dashed line</span>
        )}
      </span>
      <span className="flex flex-wrap gap-x-4">
        <span className="text-zinc-200">{len} cycles issued</span>
        <span>{best} without divergence</span>
        <span style={{ color: util < 0.75 ? PALETTE.coral : PALETTE.green }}>{Math.round(util * 100)}% lane utilization</span>
      </span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <div className="bg-[#111114] md:grid md:grid-cols-[auto_1fr] md:items-center">
        <ol className="border-b border-[#232327] px-4 py-3 font-mono text-[12px] leading-[1.6rem] md:border-b-0 md:border-r" aria-label="Shader listing">
          {CODE.map((c, i) => {
            const runs = issued.find((r) => r.line === i);
            const on = running?.line === i;
            const skipped = c.side && !runs;
            const count = runs ? runs.mask.filter(Boolean).length : 0;
            const color = c.side === "if" ? IF_C : c.side === "else" ? ELSE_C : "#E4E4E7";
            return (
              <li
                key={i}
                className={`grid grid-cols-[1.6rem_1fr_3.2rem] items-center rounded-[4px] pr-1 transition-colors duration-150 ${on ? "bg-white/[0.06]" : ""}`}
              >
                <span className={`select-none pl-1 ${on ? "text-zinc-300" : "text-zinc-600"}`}>{i + 1}</span>
                <span className={`whitespace-pre ${skipped ? "text-zinc-600 line-through decoration-zinc-700" : on ? "text-zinc-100" : "text-zinc-400"}`}>
                  {c.text(t)}
                </span>
                <span className="text-right text-[11px]" style={{ color: skipped ? "#52525B" : runs ? color : "transparent" }}>
                  {skipped ? "skip" : runs ? `${count}/${LANES}` : ""}
                </span>
              </li>
            );
          })}
        </ol>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="block w-full touch-pan-y select-none"
          role="img"
          aria-label={`A wave of ${LANES} lanes: ${nIf} take the if, ${nElse} take the else, ${len} cycles issued`}
        >
          <rect x={0} y={0} width={VW} height={VH} fill="#111114" />
          <g stroke="#232327" strokeWidth="1">
            <line x1={X0} y1={ZERO - AMP} x2={X0 + LANES * PITCH} y2={ZERO - AMP} />
            <line x1={X0} y1={ZERO + AMP} x2={X0 + LANES * PITCH} y2={ZERO + AMP} />
            {[8, 16, 24].map((i) => (
              <line key={i} x1={X0 + i * PITCH} y1={ZERO - AMP} x2={X0 + i * PITCH} y2={GRID_Y + MAX_ROWS * ROW} />
            ))}
          </g>
          <line x1={X0} y1={ZERO} x2={X0 + LANES * PITCH} y2={ZERO} stroke="#3F3F46" strokeWidth="1" />

          {/* each lane's x, colored by the side of the branch it takes */}
          {values.map((v, i) => {
            const lit = running ? running.mask[i] : true;
            const y = ZERO - v * AMP;
            return (
              <rect
                key={i}
                x={X0 + i * PITCH + 4}
                y={Math.min(y, ZERO)}
                width={PITCH - 8}
                height={Math.max(1, Math.abs(y - ZERO))}
                rx={1.5}
                fill={takeIf[i] ? IF_C : ELSE_C}
                fillOpacity={lit ? 0.9 : 0.18}
                style={{ transition: "fill-opacity 150ms" }}
              />
            );
          })}

          {/* the issue log: one row per instruction the wave issued */}
          {Array.from({ length: len }, (_, r) => {
            const row = issued[r];
            const y = GRID_Y + r * ROW;
            const side = CODE[row.line].side;
            if (r >= rowsShown) {
              return <rect key={r} x={X0 + 2} y={y} width={LANES * PITCH - 4} height={ROW - 3} rx={2} fill="none" stroke="#232327" />;
            }
            return (
              <g key={r}>
                {row.mask.map((on, i) => (
                  <rect
                    key={i}
                    x={X0 + i * PITCH + 2}
                    y={y}
                    width={PITCH - 4}
                    height={ROW - 3}
                    rx={1.5}
                    fill={on ? (side === "all" ? "#A1A1AA" : takeIf[i] ? IF_C : ELSE_C) : "#1C1C20"}
                    fillOpacity={on ? (side === "all" ? 0.55 : 0.85) : 1}
                  />
                ))}
                {r === cur && (
                  <rect x={X0} y={y - 1.5} width={LANES * PITCH} height={ROW} rx={3} fill="none" stroke="#FAFAFA" strokeOpacity="0.6" />
                )}
              </g>
            );
          })}

          {/* threshold: grab the line anywhere, or the handle */}
          <g
            tabIndex={0}
            role="slider"
            aria-label="Branch threshold"
            aria-valuemin={-T_MAX}
            aria-valuemax={T_MAX}
            aria-valuenow={Number(t.toFixed(2))}
            className="group outline-none"
            style={{ touchAction: "none", cursor: dragging ? "grabbing" : "ns-resize" }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              setDragging(true);
              setTouched(true);
              setFromY(toY(e));
            }}
            onPointerMove={(e) => dragging && setFromY(toY(e))}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
            onKeyDown={(e) => {
              const d = { ArrowUp: 0.05, ArrowDown: -0.05, ArrowRight: 0.05, ArrowLeft: -0.05 }[e.key];
              if (!d) return;
              e.preventDefault();
              setTouched(true);
              setT((v) => Math.min(T_MAX, Math.max(-T_MAX, v + d)));
            }}
          >
            <rect x={0} y={thrY - 9} width={VW} height={18} fill="transparent" />
            <line x1={X0} y1={thrY} x2={handleX} y2={thrY} stroke="#FAFAFA" strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="5 4" />
            <Handle x={handleX} y={thrY} r={5.5} color={PALETTE.ink} hint={!touched} active={dragging} />
          </g>
        </svg>
      </div>

      <Strip readout={readout}>
        <Key k="p" on={playing} onClick={togglePlay}>Play</Key>
        <Key k="s" onClick={step}>Step</Key>
        <Key k="c" onClick={() => preset(COHERENT)}>Coherent</Key>
        <Key k="a" onClick={() => preset(ALTERNATING)}>Alternating</Key>
        <Key k="r" onClick={reset}>Reset</Key>
      </Strip>
    </div>
  );
}

// Latency hiding. One scheduler with a 64 KB register file: 16,384 32-bit
// registers, the size of one of the four partitions of a 64K-register SM.
// A wave of 32 lanes needs 32 x registers-per-thread of them, so the
// register count decides how many waves can be resident, capped at 16 by
// the scheduler. Each wave loops: a burst of ALU work, then a memory read
// that takes a few hundred cycles. The scheduler issues one instruction per
// cycle from any ready wave (keep going with the same wave, else take the
// oldest ready one). The view is a window in steady state, after warm-up.

const REG_FILE = 16384;
const WAVE = 32;
const MAX_WAVES = 16;
const REG_MIN = 16;
const REG_MAX = 255;
const SIM = 3000;
const SHOW = 1500;
const START_REGS = 64;

function hash(a, b) {
  let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 7, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const burstOf = (w, i) => 24 + Math.floor(hash(w, i * 2) * 17); // 24 to 40 ALU cycles
const latencyOf = (w, i) => 260 + Math.floor(hash(w, i * 2 + 1) * 121); // 260 to 380 cycles
const AVG_SOLO = 32 / (32 + 320); // one wave alone keeps the ALU this busy

const wavesFor = (regs) => Math.min(MAX_WAVES, Math.floor(REG_FILE / (WAVE * regs)));

function runsOf(arr, value, from, to) {
  const runs = [];
  let start = -1;
  for (let c = from; c <= to; c++) {
    const hit = c < to && arr[c] === value;
    if (hit && start < 0) start = c;
    if (!hit && start >= 0) {
      runs.push([start - from, c - from]);
      start = -1;
    }
  }
  return runs;
}

function simulate(n) {
  const st = Array.from({ length: n }, (_, w) => ({ left: burstOf(w, 0), iter: 0, readyAt: 0 }));
  const alu = new Uint8Array(SIM); // 1 where an instruction issued
  const state = Array.from({ length: n }, () => new Uint8Array(SIM)); // 0 ready, 1 issuing, 2 waiting on memory
  let cur = -1;
  for (let c = 0; c < SIM; c++) {
    for (let w = 0; w < n; w++) if (st[w].readyAt > c) state[w][c] = 2;
    let pick = cur >= 0 && st[cur].readyAt <= c ? cur : -1;
    if (pick < 0) for (let w = 0; w < n && pick < 0; w++) if (st[w].readyAt <= c) pick = w;
    cur = -1;
    if (pick < 0) continue;
    alu[c] = 1;
    state[pick][c] = 1;
    const s = st[pick];
    if (--s.left === 0) {
      s.iter += 1;
      s.readyAt = c + 1 + latencyOf(pick, s.iter);
      s.left = burstOf(pick, s.iter);
    } else cur = pick;
  }
  const from = SIM - SHOW;
  let busy = 0;
  for (let c = from; c < SIM; c++) busy += alu[c];
  return {
    busy: busy / SHOW,
    alu: runsOf(alu, 1, from, SIM),
    idle: runsOf(alu, 0, from, SIM),
    waves: state.map((s) => ({ issue: runsOf(s, 1, from, SIM), wait: runsOf(s, 2, from, SIM), ready: runsOf(s, 0, from, SIM) })),
  };
}

const LW = 640;
const LX = 6;
const ALU_Y = 8;
const ALU_H = 16;
const WAVE_Y = 36;
const WAVE_PITCH = 11;
const WAVE_H = 7;
const LVW = LW + LX * 2;
const LVH = WAVE_Y + MAX_WAVES * WAVE_PITCH + 4;
const sx = (c) => LX + (c / SHOW) * LW;

function LatencyDemo() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const dragging = useRef(false);
  const [regs, setRegs] = useState(START_REGS);
  const waves = wavesFor(regs);
  const sim = useMemo(() => simulate(waves), [waves]);

  useDemoKeys(rootRef, {
    1: () => setRegs(32),
    2: () => setRegs(64),
    3: () => setRegs(128),
    4: () => setRegs(REG_MAX),
  });

  const setFromEvent = (e) => {
    const r = trackRef.current.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setRegs(Math.round(REG_MIN + f * (REG_MAX - REG_MIN)));
  };
  const f = (regs - REG_MIN) / (REG_MAX - REG_MIN);
  const busy = Math.round(sim.busy * 100);
  const capped = Math.floor(REG_FILE / (WAVE * regs)) > MAX_WAVES;

  const readout = (
    <span className="flex flex-col">
      <span className="flex flex-wrap gap-x-4">
        <span className="whitespace-nowrap">
          {regs} regs × {WAVE} lanes = {regs * WAVE} per wave
        </span>
        <span className="whitespace-nowrap text-zinc-200">
          {waves} wave{waves === 1 ? "" : "s"} resident
        </span>
        <span className="whitespace-nowrap text-zinc-500">{capped ? `scheduler limit is ${MAX_WAVES}` : `${REG_FILE} registers in the file`}</span>
      </span>
      <span className="flex flex-wrap gap-x-4">
        <span style={{ color: PALETTE.green }}>ALU busy {busy}%</span>
        <span style={{ color: busy < 100 ? PALETTE.coral : undefined }}>idle {100 - busy}%</span>
        <span className="text-zinc-500">one wave alone: {Math.round(AVG_SOLO * 100)}%</span>
      </span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <div className="bg-[#111114]">
        <div className="flex items-center gap-x-4 px-4 pt-4 font-mono text-[12px] text-zinc-400">
          <span>registers per thread</span>
          <div
            ref={trackRef}
            role="slider"
            tabIndex={0}
            aria-label="Registers per thread"
            aria-valuemin={REG_MIN}
            aria-valuemax={REG_MAX}
            aria-valuenow={regs}
            className="relative h-7 min-w-[5rem] flex-1 cursor-ew-resize touch-pan-y outline-none ring-accent focus-visible:ring-1"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              dragging.current = true;
              setFromEvent(e);
            }}
            onPointerMove={(e) => dragging.current && setFromEvent(e)}
            onPointerUp={() => (dragging.current = false)}
            onPointerCancel={() => (dragging.current = false)}
            onKeyDown={(e) => {
              const d = { ArrowLeft: -8, ArrowRight: 8, ArrowDown: -8, ArrowUp: 8 }[e.key];
              if (!d) return;
              e.preventDefault();
              setRegs((v) => Math.min(REG_MAX, Math.max(REG_MIN, v + d)));
            }}
          >
            <span className="absolute inset-x-0 top-1/2 h-px bg-zinc-700" />
            <span className="absolute left-0 top-1/2 h-px bg-accent" style={{ width: `${f * 100}%` }} />
            <span
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-[#0c0c0e]"
              style={{ left: `${f * 100}%` }}
            />
          </div>
          <span className="w-[3ch] text-right text-zinc-100">{regs}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 px-4 pt-2 font-mono text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2 w-3 rounded-sm" style={{ background: PALETTE.green }} /> issuing
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-0.5 w-3" style={{ background: PALETTE.blue }} /> waiting on memory
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-0.5 w-3 bg-zinc-500" /> ready, waiting for the ALU
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2 w-3 rounded-sm" style={{ background: PALETTE.coral, opacity: 0.55 }} /> ALU idle
          </span>
        </div>

        <svg viewBox={`0 0 ${LVW} ${LVH}`} className="block w-full select-none" role="img" aria-label={`${waves} waves resident, ALU busy ${busy}% of the time`}>
          <rect x={0} y={0} width={LVW} height={LVH} fill="#111114" />
          <g stroke="#232327" strokeWidth="1">
            {Array.from({ length: SHOW / 100 + 1 }, (_, i) => (
              <line key={i} x1={sx(i * 100)} y1={ALU_Y} x2={sx(i * 100)} y2={LVH - 4} />
            ))}
          </g>

          {/* the ALU: one row, busy or idle every cycle */}
          {sim.alu.map(([a, b]) => (
            <rect key={`a${a}`} x={sx(a)} y={ALU_Y} width={sx(b) - sx(a)} height={ALU_H} fill={PALETTE.green} fillOpacity="0.85" />
          ))}
          {sim.idle.map(([a, b]) => (
            <rect key={`i${a}`} x={sx(a)} y={ALU_Y} width={sx(b) - sx(a)} height={ALU_H} fill={PALETTE.coral} fillOpacity="0.45" />
          ))}

          {Array.from({ length: MAX_WAVES }, (_, w) => {
            const y = WAVE_Y + w * WAVE_PITCH;
            const lane = sim.waves[w];
            if (!lane) {
              // a slot the register file has no room for
              return <rect key={w} x={LX} y={y} width={LW} height={WAVE_H} rx={2} fill="none" stroke="#232327" strokeDasharray="3 3" />;
            }
            return (
              <g key={w}>
                {lane.wait.map(([a, b]) => (
                  <rect key={`w${a}`} x={sx(a)} y={y + WAVE_H / 2 - 0.75} width={sx(b) - sx(a)} height={1.5} fill={PALETTE.blue} fillOpacity="0.7" />
                ))}
                {lane.ready.map(([a, b]) => (
                  <rect key={`r${a}`} x={sx(a)} y={y + WAVE_H / 2 - 0.75} width={sx(b) - sx(a)} height={1.5} fill="#71717A" />
                ))}
                {lane.issue.map(([a, b]) => (
                  <rect key={`x${a}`} x={sx(a)} y={y} width={Math.max(0.8, sx(b) - sx(a))} height={WAVE_H} rx={1} fill={PALETTE.green} fillOpacity="0.85" />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <Strip readout={readout}>
        <Key k="1" onClick={() => setRegs(32)}>32 regs</Key>
        <Key k="2" onClick={() => setRegs(64)}>64</Key>
        <Key k="3" onClick={() => setRegs(128)}>128</Key>
        <Key k="4" onClick={() => setRegs(REG_MAX)}>255</Key>
      </Strip>
    </div>
  );
}

export default function WarpDemo({ flags }) {
  return flags?.has("latency") ? <LatencyDemo /> : <DivergenceDemo />;
}
