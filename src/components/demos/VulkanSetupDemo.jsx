import { useId, useRef, useState } from "react";
import { Key, PALETTE, Strip, useDemoKeys } from "./DemoKit";

// Every object the first Vulkan post makes, and what each one needs. An arrow
// points from what a call needs to what it makes. Solid boxes are objects you
// create and destroy yourself; dashed ones are handles you only look up.
// Step through the setup, or switch to the teardown order.

const NODES = {
  window: { label: "SDL window", owned: true },
  instance: { label: "VkInstance", owned: true },
  messenger: { label: "Debug messenger", owned: true },
  surface: { label: "VkSurfaceKHR", owned: true },
  gpu: { label: "VkPhysicalDevice", owned: false },
  families: { label: "Queue families", owned: false },
  device: { label: "VkDevice", owned: true },
  graphics: { label: "Graphics queue", owned: false },
  present: { label: "Present queue", owned: false },
};

const EDGES = [
  ["window", "surface"],
  ["instance", "surface"],
  ["instance", "messenger"],
  ["instance", "gpu"],
  ["gpu", "families"],
  ["surface", "families"],
  ["gpu", "device"],
  ["families", "device"],
  ["device", "graphics"],
  ["device", "present"],
];

const CREATE = [
  { nodes: ["window"], call: "SDL_CreateWindow(..., SDL_WINDOW_VULKAN)", note: "A window SDL can hand to Vulkan." },
  { nodes: ["instance"], call: "vkCreateInstance(&instanceInfo, ...)", note: "Our connection to the Vulkan loader. Everything else comes from here." },
  { nodes: ["messenger"], call: "vkCreateDebugUtilsMessengerEXT(instance, ...)", note: "Sends the validation layer's messages to our callback." },
  { nodes: ["surface"], call: "SDL_Vulkan_CreateSurface(window, instance, ...)", note: "Vulkan's handle to the window. It needs both." },
  { nodes: ["gpu"], call: "vkEnumeratePhysicalDevices(instance, ...)", note: "Lists the GPUs. Nothing is created here, we just pick one." },
  { nodes: ["families"], call: "vkGetPhysicalDeviceQueueFamilyProperties(gpu, ...)", note: "Which families can do graphics, and which can present to the surface." },
  { nodes: ["device"], call: "vkCreateDevice(gpu, &deviceInfo, ...)", note: "Our connection to that GPU, created with the queues we asked for." },
  { nodes: ["graphics", "present"], call: "vkGetDeviceQueue(device, family, 0, ...)", note: "Handles to queues that already exist. Usually both are the same queue." },
];

const DESTROY = [
  { nodes: ["device", "graphics", "present"], call: "vkDestroyDevice(device, ...)", note: "The queues go away with it." },
  { nodes: ["surface"], call: "SDL_Vulkan_DestroySurface(instance, surface, ...)", note: "Before the instance and the window it belongs to." },
  { nodes: ["messenger"], call: "vkDestroyDebugUtilsMessengerEXT(instance, messenger, ...)", note: "The last object made from the instance." },
  { nodes: ["instance", "gpu", "families"], call: "vkDestroyInstance(instance, ...)", note: "The physical device was never created, so it just goes away with the instance." },
  { nodes: ["window"], call: "SDL_DestroyWindow(window)", note: "Then SDL_Quit() and we're done." },
];

// Two layouts: a wide one, and a narrow one for phones. Positions are box
// centers in each layout's own viewBox units.
const LAYOUTS = {
  wide: {
    w: 900,
    h: 410,
    box: { w: 152, h: 50 },
    font: 14,
    pos: {
      window: [90, 80],
      instance: [90, 240],
      surface: [280, 80],
      gpu: [280, 240],
      messenger: [280, 355],
      families: [460, 160],
      device: [640, 240],
      graphics: [815, 180],
      present: [815, 300],
    },
  },
  narrow: {
    w: 360,
    h: 440,
    box: { w: 104, h: 40 },
    font: 11,
    pos: {
      window: [62, 34],
      instance: [180, 34],
      surface: [62, 124],
      gpu: [180, 124],
      messenger: [298, 124],
      families: [62, 214],
      device: [180, 304],
      graphics: [110, 398],
      present: [250, 398],
    },
  },
};

const BASE = "#52525B";
const FAINT = "#27272A";

const stepOf = (steps, id) => steps.findIndex((s) => s.nodes.includes(id));

// Where the line between two box centers leaves box a and enters box b.
function clip([ax, ay], [bx, by], { w, h }, gap) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  const t = Math.min(w / 2 / Math.abs(dx || 1e-9), h / 2 / Math.abs(dy || 1e-9));
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: ax + dx * t,
    y1: ay + dy * t,
    x2: bx - dx * t - ux * gap,
    y2: by - dy * t - uy * gap,
  };
}

function Diagram({ layout, mode, step, onPick, className }) {
  const id = useId().replace(/:/g, "");
  const { w, h, box, font, pos } = LAYOUTS[layout];
  const steps = mode === "create" ? CREATE : DESTROY;
  const accent = mode === "create" ? PALETTE.green : PALETTE.coral;

  const status = (nodeId) => {
    const s = stepOf(steps, nodeId);
    if (s === step) return "current";
    if (mode === "create") return s < step ? "done" : "future";
    return s < step ? "gone" : "alive";
  };
  const hidden = (st) => st === "future" || st === "gone";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`block w-full select-none ${className}`} role="img" aria-label="The Vulkan objects created in this post, and what each one is made from">
      <defs>
        {[
          ["base", BASE],
          ["faint", FAINT],
          ["accent", accent],
        ].map(([name, color]) => (
          <marker key={name} id={`${id}-${name}`} viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={color} />
          </marker>
        ))}
      </defs>
      <rect width={w} height={h} fill="#111114" />

      {EDGES.map(([from, to]) => {
        const a = status(from);
        const b = status(to);
        // While building, the arrows into the current box are its inputs.
        // While tearing down, the arrows touching the current box are the
        // links that made it wait for its children.
        const lit = mode === "create" ? b === "current" : a === "current" || b === "current";
        const dim = !lit && (hidden(a) || hidden(b));
        const kind = lit ? "accent" : dim ? "faint" : "base";
        const { x1, y1, x2, y2 } = clip(pos[from], pos[to], box, 7);
        return (
          <line
            key={`${from}-${to}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={lit ? accent : dim ? FAINT : BASE}
            strokeWidth={lit ? 2.2 : 1.5}
            markerEnd={`url(#${id}-${kind})`}
            style={{ transition: "stroke 200ms" }}
          />
        );
      })}

      {Object.entries(NODES).map(([nodeId, node]) => {
        const st = status(nodeId);
        const [cx, cy] = pos[nodeId];
        const s = stepOf(steps, nodeId);
        const current = st === "current";
        // In the teardown, only the boxes you destroy yourself get a number.
        const badge = mode === "create" || node.owned ? s + 1 : null;
        const r = font * 0.72;
        return (
          <g
            key={nodeId}
            role="button"
            tabIndex={0}
            aria-label={`${node.label}, step ${s + 1}`}
            onClick={() => onPick(s)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPick(s);
              }
            }}
            className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-accent"
            style={{ opacity: hidden(st) ? 0.28 : 1, transition: "opacity 200ms" }}
          >
            <rect
              x={cx - box.w / 2}
              y={cy - box.h / 2}
              width={box.w}
              height={box.h}
              rx={box.h * 0.22}
              fill={current ? accent : "#151518"}
              fillOpacity={current ? 0.14 : 1}
              stroke={current ? accent : BASE}
              strokeWidth={current ? 2.2 : 1.4}
              strokeDasharray={node.owned ? undefined : "5 4"}
              style={{ transition: "stroke 200ms, fill 200ms" }}
            />
            <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontSize={font} fill={current ? "#FAFAFA" : "#D4D4D8"} className="pointer-events-none font-sans">
              {node.label}
            </text>
            {badge && (
              <g className="pointer-events-none">
                <circle cx={cx - box.w / 2 + 2} cy={cy - box.h / 2 + 2} r={r} fill={current ? accent : "#27272A"} />
                <text x={cx - box.w / 2 + 2} y={cy - box.h / 2 + 2} dy="0.35em" textAnchor="middle" fontSize={font * 0.78} fill={current ? "#0c0c0e" : "#A1A1AA"} className="font-mono">
                  {badge}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function VulkanSetupDemo() {
  const rootRef = useRef(null);
  const [mode, setMode] = useState("create");
  const [step, setStep] = useState(0);
  const steps = mode === "create" ? CREATE : DESTROY;
  const last = steps.length - 1;

  const next = () => setStep((s) => Math.min(last, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const toggle = () => {
    setMode((m) => (m === "create" ? "destroy" : "create"));
    setStep(0);
  };
  const restart = () => setStep(0);

  useDemoKeys(rootRef, { n: next, arrowright: next, b: back, arrowleft: back, d: toggle, r: restart });

  const current = steps[step];
  const readout = (
    <span className="flex flex-col">
      <span>
        <span className="text-zinc-500">
          {mode === "create" ? "Create" : "Destroy"} {step + 1}/{steps.length}
        </span>{" "}
        <span className="text-zinc-100">{current.call}</span>
      </span>
      <span className="font-sans text-[13px] text-zinc-400">{current.note}</span>
    </span>
  );

  return (
    <div ref={rootRef}>
      <Diagram layout="wide" mode={mode} step={step} onPick={setStep} className="hidden sm:block" />
      <Diagram layout="narrow" mode={mode} step={step} onPick={setStep} className="sm:hidden" />

      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-zinc-800/80 px-4 py-2 text-[12px] text-zinc-500">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded-[3px] border border-zinc-500" /> you create and destroy it
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-5 rounded-[3px] border border-dashed border-zinc-500" /> you only get a handle
        </span>
      </div>

      <Strip readout={readout}>
        <Key k="b" onClick={back}>Back</Key>
        <Key k="n" onClick={next}>Next</Key>
        <Key k="d" on={mode === "destroy"} onClick={toggle}>Teardown order</Key>
        <Key k="r" onClick={restart}>Restart</Key>
      </Strip>
    </div>
  );
}
