import { lazy, Suspense } from "react";
import Reveal from "../Reveal";

// Interactive figures a post can embed with a fenced block:
//
//   ```demo
//   rasterizer quads
//   ```
//
// The first word picks the demo, the rest are flags passed to it. Each demo
// is its own chunk, so posts without one never download any of this.
export const demos = {
  rasterizer: {
    title: "Rasterizer",
    caption: (flags) =>
      flags.has("quads")
        ? "Hatched pixels are helper lanes: shaded so their quad can compute derivatives, then thrown away."
        : "Drag the corners. A pixel is drawn when its center is inside all three edges.",
    component: lazy(() => import("./RasterizerDemo")),
  },
  "dot-product": {
    title: "Dot product",
    caption: "Drag either arrow. The dot product is the length of one projected onto the other, times the other's length.",
    component: lazy(() => import("./DotProductDemo")),
  },
};

export function parseDemoSpec(spec) {
  const [name, ...flags] = spec.trim().split(/\s+/);
  return { name, flags: new Set(flags) };
}

export function DemoFrame({ caption, children }) {
  return (
    <Reveal as="figure" className="wide my-10">
      <div className="overflow-hidden rounded-xl border border-border bg-[#0f0f12] font-sans">{children}</div>
      {caption && <figcaption className="mt-3 text-center text-sm text-muted">{caption}</figcaption>}
    </Reveal>
  );
}

export default function Demo({ spec }) {
  const { name, flags } = parseDemoSpec(spec);
  const demo = demos[name];
  if (!demo) {
    if (import.meta.env.DEV) {
      return <p className="wide my-6 rounded-lg border border-red-500/40 p-4 text-sm text-red-300">Unknown demo "{name}"</p>;
    }
    return null;
  }
  const Component = demo.component;
  return (
    <DemoFrame caption={typeof demo.caption === "function" ? demo.caption(flags) : demo.caption}>
      <Suspense fallback={<div className="aspect-[5/3] animate-pulse bg-surface/40" />}>
        <Component flags={flags} />
      </Suspense>
    </DemoFrame>
  );
}
