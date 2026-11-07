import { useEffect, useRef, useState } from "react";
import { Key, PALETTE, Strip, useDemoKeys } from "./DemoKit";

// A swapchain of three images in slow motion. The GPU draws frames into
// free images, the present mode decides when a finished frame reaches the
// screen, and the screen is painted row by row by the scanout. A frame that
// changes while the scanout is halfway down the screen leaves a tear.

const REFRESH = 1000; // ms of demo time per screen refresh
const FAST = 280; // ms to draw a frame: about 3.5 frames per refresh
const SLOW = 1400; // longer than a refresh
const ROWS = 60;
const IMAGES = 3;
const STEP = 4;

const MODES = {
  fifo: { label: "FIFO", key: "1" },
  mailbox: { label: "MAILBOX", key: "2" },
  immediate: { label: "IMMEDIATE", key: "3" },
};

const hue = (frame) => (frame * 47) % 360;
const frameColor = (frame) => `hsl(${hue(frame)} 62% 52%)`;

function createSim(mode, drawTime) {
  return {
    mode,
    drawTime,
    t: 0,
    images: Array.from({ length: IMAGES }, () => ({ frame: null, state: "free" })),
    queue: [],
    shown: null,
    drawing: null,
    next: 1,
    scan: 0,
    rows: Array(ROWS).fill(null),
    painted: new Set(),
    drawn: 0,
    dropped: 0,
    idle: 0,
    total: 0,
  };
}

function present(sim) {
  const { img } = sim.drawing;
  sim.drawing = null;
  sim.drawn++;
  const image = sim.images[img];
  if (sim.mode === "fifo") {
    image.state = "queued";
    sim.queue.push(img);
  } else if (sim.mode === "mailbox") {
    // Only one frame may wait. A newer one pushes the waiting one out.
    if (sim.queue.length) {
      sim.images[sim.queue[0]].state = "free";
      sim.dropped++;
    }
    image.state = "queued";
    sim.queue = [img];
  } else {
    // Straight to the screen, wherever the scanout is right now.
    if (sim.shown !== null) {
      const old = sim.images[sim.shown];
      if (!sim.painted.has(old.frame)) sim.dropped++;
      old.state = "free";
    }
    sim.shown = img;
    image.state = "shown";
  }
}

function vsync(sim) {
  if (sim.mode === "immediate" || !sim.queue.length) return;
  const img = sim.queue.shift();
  if (sim.shown !== null) sim.images[sim.shown].state = "free";
  sim.shown = img;
  sim.images[img].state = "shown";
}

function paint(sim, from, to) {
  const frame = sim.shown === null ? null : sim.images[sim.shown].frame;
  for (let r = Math.floor(from); r < Math.min(ROWS, Math.floor(to)); r++) {
    sim.rows[r] = frame;
    if (frame !== null) sim.painted.add(frame);
  }
}

function advance(sim, dt) {
  for (let left = dt; left > 0; left -= STEP) {
    const h = Math.min(STEP, left);
    if (sim.drawing && sim.t >= sim.drawing.end) present(sim);
    if (!sim.drawing) {
      const free = sim.images.findIndex((im) => im.state === "free");
      if (free >= 0) {
        sim.images[free] = { frame: sim.next++, state: "drawing" };
        sim.drawing = { img: free, start: sim.t, end: sim.t + sim.drawTime };
      }
    }
    if (!sim.drawing) sim.idle += h;
    sim.total += h;

    const from = sim.scan * ROWS;
    sim.scan += h / REFRESH;
    if (sim.scan >= 1) {
      paint(sim, from, ROWS);
      vsync(sim);
      sim.scan -= 1;
      paint(sim, 0, sim.scan * ROWS);
    } else {
      paint(sim, from, sim.scan * ROWS);
    }
    sim.t += h;
  }
}

// Contiguous runs of rows showing the same frame.
function bands(rows) {
  const out = [];
  for (let r = 0; r < rows.length; r++) {
    const last = out.at(-1);
    if (last && last.frame === rows[r]) last.end = r + 1;
    else out.push({ frame: rows[r], start: r, end: r + 1 });
  }
  return out;
}

const STATE_TEXT = { shown: "on screen", queued: "waiting", drawing: "being drawn", free: "free" };
const STATE_COLOR = { shown: PALETTE.green, queued: PALETTE.blue, drawing: "#F5B454", free: "#71717A" };

const LAYOUTS = {
  wide: {
    w: 640,
    h: 300,
    screen: { x: 30, y: 34, w: 300, h: 220 },
    font: 13,
    cards: [0, 1, 2].map((i) => ({ x: 380, y: 34 + i * 78, w: 230, h: 64 })),
  },
  narrow: {
    w: 360,
    h: 380,
    screen: { x: 20, y: 24, w: 320, h: 220 },
    font: 12,
    cards: [0, 1, 2].map((i) => ({ x: 20 + i * 110, y: 270, w: 100, h: 92 })),
  },
};

function Scene({ sim, layout, className }) {
  const { w, h, screen, font, cards } = LAYOUTS[layout];
  const rowH = screen.h / ROWS;
  const scanY = screen.y + sim.scan * screen.h;
  const narrow = layout === "narrow";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`block w-full select-none ${className}`} role="img" aria-label="Three swapchain images and the screen they are shown on">
      <rect width={w} height={h} fill="#111114" />

      <rect x={screen.x - 8} y={screen.y - 8} width={screen.w + 16} height={screen.h + 16} rx="10" fill="#18181B" stroke="#3F3F46" />
      <rect x={screen.x} y={screen.y} width={screen.w} height={screen.h} fill="#09090B" />
      {bands(sim.rows).map((b) =>
        b.frame === null ? null : (
          <g key={`${b.start}-${b.frame}`}>
            <rect x={screen.x} y={screen.y + b.start * rowH} width={screen.w} height={(b.end - b.start) * rowH} fill={frameColor(b.frame)} />
            {(b.end - b.start) * rowH > font * 1.6 && (
              <text
                x={screen.x + screen.w / 2}
                y={screen.y + ((b.start + b.end) / 2) * rowH}
                dy="0.35em"
                textAnchor="middle"
                fontSize={font * 1.25}
                fill="#0c0c0e"
                fillOpacity="0.75"
                className="font-mono"
              >
                frame {b.frame}
              </text>
            )}
          </g>
        ),
      )}
      <line x1={screen.x - 4} x2={screen.x + screen.w + 4} y1={scanY} y2={scanY} stroke="#FAFAFA" strokeWidth="2" />
      <text x={screen.x} y={screen.y - 14} fontSize={font} fill="#A1A1AA" className="font-sans">
        Screen (the white line is the scanout)
      </text>

      {!narrow && (
        <text x={cards[0].x} y={cards[0].y - 14} fontSize={font} fill="#A1A1AA" className="font-sans">
          Swapchain images
        </text>
      )}
      {sim.images.map((im, i) => {
        const c = cards[i];
        const color = STATE_COLOR[im.state];
        const progress = im.state === "drawing" && sim.drawing ? Math.min(1, (sim.t - sim.drawing.start) / sim.drawTime) : null;
        const swatch = narrow ? { x: c.x + 8, y: c.y + 8, w: c.w - 16, h: 30 } : { x: c.x + 8, y: c.y + 8, w: 48, h: c.h - 16 };
        const textX = narrow ? c.x + 8 : c.x + 68;
        const line1 = narrow ? c.y + 54 : c.y + 26;
        const line2 = narrow ? c.y + 74 : c.y + 46;
        return (
          <g key={i}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="8" fill="#151518" stroke={im.state === "free" ? "#3F3F46" : color} strokeWidth={im.state === "free" ? 1 : 1.6} />
            <rect x={swatch.x} y={swatch.y} width={swatch.w} height={swatch.h} rx="4" fill={im.frame === null ? "#27272A" : frameColor(im.frame)} />
            {progress !== null && (
              <rect x={swatch.x} y={swatch.y} width={swatch.w} height={swatch.h * (1 - progress)} rx="4" fill="#151518" fillOpacity="0.8" />
            )}
            <text x={textX} y={line1} fontSize={font} fill="#E4E4E7" className="font-mono">
              {narrow ? `image ${i}` : `image ${i}${im.frame === null ? "" : `, frame ${im.frame}`}`}
            </text>
            <text x={textX} y={line2} fontSize={font} fill={color} className="font-sans">
              {STATE_TEXT[im.state]}
              {im.state === "queued" && sim.mode === "fifo" ? (narrow ? ` #${sim.queue.indexOf(i) + 1}` : ` (#${sim.queue.indexOf(i) + 1} in line)`) : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PresentModesDemo() {
  const rootRef = useRef(null);
  const [mode, setMode] = useState("fifo");
  const [slow, setSlow] = useState(false);
  const [paused, setPaused] = useState(false);
  const simRef = useRef(createSim("fifo", FAST));
  const [, setTick] = useState(0);

  // Start paused for people who asked for less motion.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  // Run only while the demo is on screen and not paused.
  useEffect(() => {
    let visible = false;
    let raf = 0;
    let last = 0;
    const loop = (now) => {
      const dt = Math.min(100, now - (last || now));
      last = now;
      advance(simRef.current, dt);
      setTick((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && visible && !paused) {
        last = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [paused]);

  const restart = (nextMode, nextSlow) => {
    simRef.current = createSim(nextMode, nextSlow ? SLOW : FAST);
    setTick((n) => n + 1);
  };
  const pickMode = (m) => {
    setMode(m);
    restart(m, slow);
  };
  const toggleSlow = () => {
    setSlow(!slow);
    restart(mode, !slow);
  };

  useDemoKeys(rootRef, {
    1: () => pickMode("fifo"),
    2: () => pickMode("mailbox"),
    3: () => pickMode("immediate"),
    s: toggleSlow,
    p: () => setPaused((p) => !p),
  });

  const sim = simRef.current;
  const idle = sim.total ? Math.round((sim.idle / sim.total) * 100) : 0;
  const readout = (
    <span className="flex flex-wrap gap-x-4">
      <span className="text-zinc-100">{MODES[mode].label}</span>
      <span>drawn {sim.drawn}</span>
      <span>shown {sim.painted.size}</span>
      <span className={sim.dropped ? "text-[#F2735E]" : undefined}>thrown away {sim.dropped}</span>
      <span>GPU waiting {idle}%</span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <Scene sim={sim} layout="wide" className="hidden sm:block" />
      <Scene sim={sim} layout="narrow" className="sm:hidden" />
      <Strip readout={readout}>
        {Object.entries(MODES).map(([m, { label, key }]) => (
          <Key key={m} k={key} on={mode === m} onClick={() => pickMode(m)}>
            {label}
          </Key>
        ))}
        <Key k="s" on={slow} onClick={toggleSlow}>Slow GPU</Key>
        <Key k="p" on={paused} onClick={() => setPaused((p) => !p)}>Pause</Key>
      </Strip>
    </div>
  );
}
