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
// `caption` is either a string or a function of the flags.
export const demos = {
  rasterizer: {
    title: "Rasterizing a triangle",
    variants: ["", "quads"],
    caption: (flags) =>
      flags.has("quads")
        ? "Hatched pixels are helper lanes: shaded only so their quad can compute derivatives, then thrown away. Try the tiny triangle."
        : "Drag a corner. Point at any pixel to see its three edge weights; it's drawn only when none of them is negative. Scan replays the test pixel by pixel.",
    component: lazy(() => import("./RasterizerDemo")),
  },
  floor: {
    title: "Texturing a floor",
    variants: ["", "affine", "mips"],
    caption: (flags) =>
      flags.has("mips")
        ? "Each color is a mip level, chosen per 2x2 quad from how fast the UVs change between neighbors. Drag to turn the floor, and turn filtering off to see why it matters."
        : "Drag to turn the floor. With perspective correction off, the checkers bend along the diagonal where the two triangles meet.",
    component: lazy(() => import("./FloorDemo")),
  },
  "dot-product": {
    title: "The dot product",
    variants: [""],
    caption: "Drag either tip. The tinted half is everything in front of a: the dot product is positive there, zero on the dashed line, negative behind it.",
    component: lazy(() => import("./DotProductDemo")),
  },
  matrix: {
    title: "A matrix is its basis vectors",
    variants: [""],
    caption: "Drag the tips of the two basis vectors and the whole plane follows. The determinant is the area of the shaded cell, and goes negative when the F flips.",
    component: lazy(() => import("./MatrixDemo")),
  },
  gamma: {
    title: "Blending in sRGB vs linear",
    variants: [""],
    caption: "The same two colors mixed two ways. Mixing the stored sRGB values goes dark and muddy in the middle; mixing in linear light and converting back does not.",
    component: lazy(() => import("./GammaDemo")),
  },
};

export function parseDemoSpec(spec) {
  const [name, ...flags] = spec.trim().split(/\s+/);
  return { name, flags: new Set(flags) };
}

export function DemoFrame({ title, caption, children }) {
  return (
    <Reveal as="figure" className="wide my-12">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0c0e] font-sans shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
        {children}
      </div>
      {(title || caption) && (
        <figcaption className="mx-auto mt-4 max-w-[65ch] font-serif text-[0.95rem] leading-relaxed text-zinc-400">
          {title && <span className="font-semibold text-zinc-200">{title}. </span>}
          {caption}
        </figcaption>
      )}
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
    <DemoFrame title={demo.title} caption={typeof demo.caption === "function" ? demo.caption(flags) : demo.caption}>
      <Suspense fallback={<div className="aspect-[5/3] animate-pulse bg-zinc-900/60" />}>
        <Component flags={flags} />
      </Suspense>
    </DemoFrame>
  );
}
