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
  warp: {
    title: "Inside a wave",
    variants: ["", "latency"],
    caption: (flags) =>
      flags.has("latency")
        ? "Drag the register count. More registers per thread means fewer waves fit, and with fewer waves the top row fills with idle gaps while every wave waits on memory."
        : "Drag the dashed line to change which lanes take the if. Coherent sends all 32 lanes the same way. Alternating costs exactly as much as a single split, because the wave pays for both sides as soon as one lane disagrees.",
    component: lazy(() => import("./WarpDemo")),
  },
  blend: {
    title: "Blend order",
    variants: [""],
    caption: "Drag the panes in the draw order list, or press 1, 2 or 3 to draw one last. With over blending the overlaps change color when the order changes; switch to additive and they stop changing.",
    component: lazy(() => import("./BlendDemo")),
  },
  bandwidth: {
    title: "A frame's bandwidth budget",
    variants: [""],
    caption: "Change the resolution and frame rate, and switch passes on and off with 1 to 6. Then turn on Tiled: the dashed blocks are traffic that never leaves tile memory.",
    component: lazy(() => import("./BandwidthDemo")),
  },
  tonemap: {
    title: "Tone mapping a night street",
    variants: ["", "clip"],
    caption: (flags) =>
      flags.has("clip")
        ? "Coral pixels are values the operator pushed past 1.0, which the screen just cuts off. Drag the exposure and switch operators to see how much of the picture each one saves."
        : "The street is stored in linear light, with lamps around 60 and the neon sign near 9. Point at a pixel, then switch operators and drag the exposure: clamping turns the red sign yellow and flattens the lit road, while the curves roll the highlights off instead.",
    component: lazy(() => import("./ToneMapDemo")),
  },
  filter: {
    title: "Nearest vs bilinear filtering",
    variants: ["", "minify"],
    caption: (flags) =>
      flags.has("minify")
        ? "Here one screen pixel covers about three texels but reads only one, so the pattern turns to noise and crawls as it moves. Turn on mipmaps and each pixel reads a smaller copy that already averaged those texels."
        : "Each screen pixel samples the texture once. With bilinear on, the four nearest texel centers are blended by the weights shown below. Drag to pan, then zoom out past 1x and watch the detail fall apart until mipmaps step in.",
    component: lazy(() => import("./FilterDemo")),
  },
  dither: {
    title: "Banding and dithering",
    variants: [""],
    caption: "A soft light falloff stored at a few bits per channel. The left half just rounds and shows hard rings; the right half nudges each pixel by a small offset first, so single pixels are further off but any small patch averages out right, which is roughly what your eye does.",
    component: lazy(() => import("./DitherDemo")),
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
  spaces: {
    title: "Following one vertex through every space",
    variants: [""],
    caption: "Step through the spaces with the number keys and keep an eye on the green corner. Its model coordinates never change, but by the time it reaches NDC the cube has turned into a thin, perspective-squashed slab near the far plane.",
    component: lazy(() => import("./SpacesDemo")),
  },
  depth: {
    title: "Where depth precision goes",
    variants: [""],
    caption: "The two surfaces start out z-fighting at 16 bits. Drag the near plane out a little and they separate, and notice how much less the far plane matters. Then try a 32-bit float with reversed Z.",
    component: lazy(() => import("./DepthDemo")),
  },
  rotation: {
    title: "Euler angles and quaternions",
    variants: ["", "slerp"],
    caption: (flags) =>
      flags.has("slerp")
        ? "The green plane is slerped and the coral outline lerps the three Euler angles. The dots mark equal steps in t: evenly spaced on the slerp path, bunched and stretched on the other. Press N to try other pairs."
        : "Drag pitch all the way to 90 degrees. The outer and middle rings fold into one plane, and from then on yaw and roll spin the plane around the same axis.",
    component: lazy(() => import("./RotationDemo")),
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
