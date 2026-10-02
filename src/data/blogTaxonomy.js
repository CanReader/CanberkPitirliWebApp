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

// Posts meant to be read in order. Series nest: a series can hold its own
// posts (`slugs`, in reading order), sub-series (`children`, in order), or
// both. Reading order is the series' own posts first, then each sub-series
// in turn. Every `id` becomes a page at /blog/series/<id>, so ids are unique
// across the whole tree, and a post belongs to at most one series.
//
//   {
//     id: "cpp",
//     title: "C++ Tutorials",
//     description: "One or two sentences for the series page.",
//     children: [
//       { id: "cpp-basics", title: "C++ Basics", slugs: ["cpp-hello", "cpp-types"] },
//       { id: "cpp-memory", title: "Memory", slugs: ["cpp-pointers", "cpp-raii"] },
//     ],
//   }
export const series = [
  {
    id: "graphics-programming",
    title: "Graphics Programming",
    description: "From how a shader runs on the GPU to the rendering techniques and APIs built on top of it.",
    children: [
      {
        id: "shaders",
        title: "Shaders",
        children: [
          {
            id: "hlsl",
            title: "HLSL in depth",
            description: "How shaders actually run on the GPU, the functions you reach for every day, and the math behind physically based lighting.",
            slugs: ["hlsl-from-first-principles", "hlsl-functions-explained", "rendering-equation-to-hlsl"],
          },
        ],
      },
      {
        id: "rendering-techniques",
        title: "Rendering techniques",
        slugs: ["shadow-mapping-dx11", "deferred-vs-forward-rendering", "occlusion-culling-20-percent-vr"],
      },
      {
        id: "graphics-apis",
        title: "Graphics APIs",
        slugs: ["vulkan-vs-other-graphics-apis", "one-engine-four-graphics-backends"],
      },
    ],
  },
  {
    id: "viewcam",
    title: "Building ViewCam",
    description: "Turning a phone into a wireless webcam: the latency budget, and the virtual camera on Windows and Linux.",
    slugs: ["viewcam-devlog-chasing-milliseconds", "virtual-camera-directshow-vs-v4l2loopback"],
  },
];

export const seriesUrl = (id) => `/blog/series/${id}`;

// Every series node, depth first, with its ancestors: [{ node, path }].
// `path` runs from the top-level series down to the node itself.
export function allSeries(nodes = series, parents = []) {
  return nodes.flatMap((node) => {
    const path = [...parents, node];
    return [{ node, path }, ...allSeries(node.children ?? [], path)];
  });
}

export function findSeries(id) {
  return allSeries().find((e) => e.node.id === id) ?? null;
}

// All posts of a series in reading order, sub-series included.
export function seriesSlugs(node) {
  return [...(node.slugs ?? []), ...(node.children ?? []).flatMap(seriesSlugs)];
}

// Where a post sits: the series that lists it directly (`leaf`), the path
// from the top-level series down to it, and its 0-based position in `leaf`.
export function seriesForPost(slug) {
  const hit = allSeries().find((e) => e.node.slugs?.includes(slug));
  if (!hit) return null;
  return {
    leaf: hit.node,
    root: hit.path[0],
    path: hit.path,
    index: hit.node.slugs.indexOf(slug),
  };
}

// The next post in the top-level series' reading order, crossing into the
// next sub-series when the current one ends. null at the very end.
export function nextInSeries(slug) {
  const at = seriesForPost(slug);
  if (!at) return null;
  const order = seriesSlugs(at.root);
  return order[order.indexOf(slug) + 1] ?? null;
}

// Authoring checks, run by the build: returns a list of problems (empty when
// the tree is valid). `postSlugs` are the published posts.
export function validateSeries(postSlugs) {
  const known = new Set(postSlugs);
  const problems = [];
  const ids = new Set();
  const used = new Map();
  for (const { node, path } of allSeries()) {
    const where = path.map((n) => n.id).join(" / ");
    if (!node.id || !/^[a-z0-9-]+$/.test(node.id)) problems.push(`${where}: id must be lowercase letters, digits, and dashes`);
    if (ids.has(node.id)) problems.push(`${where}: duplicate series id "${node.id}"`);
    ids.add(node.id);
    if (!node.title) problems.push(`${where}: missing title`);
    if (!node.slugs?.length && !node.children?.length) problems.push(`${where}: has no posts and no sub-series`);
    for (const slug of node.slugs ?? []) {
      if (!known.has(slug)) problems.push(`${where}: unknown or unpublished post "${slug}"`);
      if (used.has(slug)) problems.push(`${where}: "${slug}" is already in series "${used.get(slug)}"`);
      used.set(slug, node.id);
    }
  }
  return problems;
}
