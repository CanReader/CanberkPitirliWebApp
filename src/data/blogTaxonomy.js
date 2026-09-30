// Topics shown in the blog index. Every post's `category` must be one of these
// names. `slug` is the URL segment: /blog/topic/<slug>.
export const topics = [
  { name: "Graphics", slug: "graphics", blurb: "Shaders, graphics APIs, and how real-time rendering actually works." },
  { name: "Game Dev", slug: "game-dev", blurb: "Unreal Engine, engine tooling, and gameplay systems." },
  { name: "Performance", slug: "performance", blurb: "Frame budgets, profiling, memory, and getting milliseconds back." },
  { name: "Systems", slug: "systems", blurb: "C++, Rust, Go, and the layer between your code and the OS." },
  { name: "AI & ML", slug: "ai-ml", blurb: "Neural nets from scratch, GPU compute, and working with LLMs." },
  { name: "Career", slug: "career", blurb: "Shipping games, teaching, and what the work looks like from inside." },
];

export const categories = ["All", ...topics.map((t) => t.name)];

export const topicPath = (name) => {
  const t = topics.find((x) => x.name === name);
  return t ? `/blog/topic/${t.slug}` : "/blog";
};

// Posts meant to be read in order. `slugs` is the reading order.
export const series = [
  {
    id: "hlsl",
    title: "HLSL in depth",
    slugs: ["hlsl-from-first-principles", "hlsl-functions-explained", "rendering-equation-to-hlsl"],
  },
  {
    id: "viewcam",
    title: "Building ViewCam",
    slugs: ["viewcam-devlog-chasing-milliseconds", "virtual-camera-directshow-vs-v4l2loopback"],
  },
];

export const seriesFor = (slug) => series.find((s) => s.slugs.includes(slug)) ?? null;
