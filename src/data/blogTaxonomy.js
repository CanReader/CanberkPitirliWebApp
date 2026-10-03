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
//
// Optional per series: `level` ("beginner" | "intermediate" | "advanced")
// for a difficulty badge, and `planned: ["Title", ...]` for parts that aren't
// written yet, shown as "Coming soon" so the series reads as a roadmap.
//
// Series can also list draft posts (visible: false). In dev they show up
// normally. In a build they show as "Coming soon" with their title only, and
// they join the reading order once published. See usePublishedPosts below.
const allDefinedSeries = [
  {
    id: "graphics-programming",
    title: "Graphics Programming",
    description: "From how a shader runs on the GPU to the rendering techniques and APIs built on top of it.",
    children: [
      {
        id: "foundations",
        title: "Foundations",
        level: "beginner",
        description: "What every graphics programmer should know before the first triangle: how a GPU turns commands into pixels, the math under every transform, color, and geometry.",
        children: [
          {
            id: "how-gpus-render",
            title: "How GPUs render",
            description: "From a draw call on the CPU to a pixel on screen, one hardware stage at a time.",
            slugs: [
              "pixels-framebuffers-and-scanout",
              "what-a-draw-call-really-sends",
              "gpu-front-end-from-commands-to-vertices",
              "how-shaders-run-warps-and-wavefronts",
              "clipping-and-rasterization",
              "pixel-shading-in-2x2-quads",
              "depth-blending-and-the-output-merger",
              "gpu-bandwidth-the-real-limit",
            ],
          },
        ],
      },
      {
        id: "shaders",
        title: "Shaders",
        level: "intermediate",
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
        level: "intermediate",
        slugs: ["shadow-mapping-dx11", "deferred-vs-forward-rendering", "occlusion-culling-20-percent-vr"],
      },
      {
        id: "graphics-apis",
        title: "Graphics APIs",
        level: "advanced",
        slugs: ["vulkan-vs-other-graphics-apis", "one-engine-four-graphics-backends"],
      },
    ],
  },
  {
    id: "computer-science",
    title: "Computer Science",
    description: "The ideas running underneath every program you write: how data is represented and stored, what the operating system does for you, how machines talk, and how to think about algorithms. Explained with real hardware in mind.",
    children: [
      {
        id: "cs-introduction",
        title: "Introduction",
        level: "beginner",
        slugs: ["welcome-to-computer-science"],
        planned: ["A Short History of Computing", "How a Computer Runs Your Code, End to End"],
      },
      {
        id: "cs-data",
        title: "The Data & Data Structures",
        level: "beginner",
        description: "How everything turns into bits, and the shapes we arrange those bits in.",
        planned: [
          "Bits, Bytes and Binary",
          "Integers and Two's Complement",
          "Floating Point: Why 0.1 + 0.2 Isn't 0.3",
          "Text: ASCII, Unicode and UTF-8",
          "Arrays and Dynamic Arrays",
          "Linked Lists",
          "Stacks and Queues",
          "Hash Tables",
          "Trees and Binary Search Trees",
          "Heaps and Priority Queues",
          "Graphs",
        ],
      },
      {
        id: "cs-memory",
        title: "Memory & Data Storage",
        level: "intermediate",
        description: "Where data lives, from registers to disk, and why that matters more than most people think.",
        planned: [
          "The Memory Hierarchy: From Registers to Disk",
          "How CPU Caches Work",
          "The Stack and the Heap",
          "Pointers and Memory Addresses",
          "Memory Allocators",
          "How SSDs and Hard Drives Store Data",
          "File Systems",
        ],
      },
      {
        id: "cs-operating-systems",
        title: "Operating Systems",
        level: "intermediate",
        description: "The program that runs your programs.",
        planned: [
          "What an Operating System Actually Does",
          "Processes and Threads",
          "CPU Scheduling",
          "Virtual Memory and Paging",
          "System Calls",
          "Concurrency: Locks, Atomics and Data Races",
          "Deadlocks",
        ],
      },
      {
        id: "cs-networking",
        title: "Networking",
        level: "intermediate",
        description: "How two machines talk to each other, one layer at a time.",
        planned: [
          "How the Internet Works, One Layer at a Time",
          "IP Addresses and Routing",
          "TCP vs UDP",
          "DNS",
          "HTTP and What a Browser Does",
          "Sockets",
          "Networking for Games: Latency and Prediction",
        ],
      },
      {
        id: "cs-algorithms",
        title: "Algorithms",
        level: "intermediate",
        description: "How to think about solving problems, and how to tell a fast solution from a slow one before you write it.",
        planned: [
          "Big-O Notation, Honestly",
          "Searching: Linear and Binary",
          "Sorting Algorithms",
          "Recursion and Divide and Conquer",
          "Graph Search: BFS and DFS",
          "Shortest Paths: Dijkstra and A*",
          "Dynamic Programming",
          "Greedy Algorithms",
        ],
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

export const LEVELS = ["beginner", "intermediate", "advanced"];

// The tree the site actually shows. Each node gets `slugs` (readable posts,
// in reading order) and `upcoming` (titles of parts not out yet: drafts in a
// build, then `planned`). Series with neither, at any depth, are removed.
// Everything below reads this, never allDefinedSeries.
export let series = allDefinedSeries.map(function withUpcoming(n) {
  return { ...n, upcoming: n.planned ?? [], children: n.children?.map(withUpcoming) };
});

function prune(nodes, available, draftTitles) {
  return nodes
    .map((n) => ({
      ...n,
      slugs: n.slugs?.filter((s) => available.has(s)),
      upcoming: [
        ...(n.slugs ?? []).filter((s) => !available.has(s) && draftTitles[s]).map((s) => draftTitles[s]),
        ...(n.planned ?? []),
      ],
      children: n.children && prune(n.children, available, draftTitles),
    }))
    .filter((n) => (n.slugs?.length ?? 0) + n.upcoming.length + (n.children?.length ?? 0) > 0);
}

// Call once with the posts readable in this build (or dev session), plus
// { slug: title } for drafts that aren't, so they can be listed as upcoming.
export function usePublishedPosts(slugs, draftTitles = {}) {
  series = prune(allDefinedSeries, new Set(slugs), draftTitles);
}

// Upcoming parts of a series, sub-series included.
export function seriesUpcoming(node) {
  return [...(node.upcoming ?? []), ...(node.children ?? []).flatMap(seriesUpcoming)];
}

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
// the tree is valid). `postSlugs` are the published posts, `draftSlugs` the
// drafts; a series may list either, but nothing that doesn't exist.
export function validateSeries(postSlugs, draftSlugs = []) {
  const known = new Set([...postSlugs, ...draftSlugs]);
  const problems = [];
  const ids = new Set();
  const used = new Map();
  for (const { node, path } of allSeries(allDefinedSeries)) {
    const where = path.map((n) => n.id).join(" / ");
    if (!node.id || !/^[a-z0-9-]+$/.test(node.id)) problems.push(`${where}: id must be lowercase letters, digits, and dashes`);
    if (ids.has(node.id)) problems.push(`${where}: duplicate series id "${node.id}"`);
    ids.add(node.id);
    if (!node.title) problems.push(`${where}: missing title`);
    if (!node.slugs?.length && !node.children?.length && !node.planned?.length) {
      problems.push(`${where}: has no posts, planned parts, or sub-series`);
    }
    if (node.level !== undefined && !LEVELS.includes(node.level)) {
      problems.push(`${where}: level must be one of ${LEVELS.join(", ")}`);
    }
    if (node.planned !== undefined && (!Array.isArray(node.planned) || node.planned.some((t) => typeof t !== "string" || !t.trim()))) {
      problems.push(`${where}: planned must be a list of titles`);
    }
    for (const slug of node.slugs ?? []) {
      if (!known.has(slug)) problems.push(`${where}: no post or draft called "${slug}"`);
      if (used.has(slug)) problems.push(`${where}: "${slug}" is already in series "${used.get(slug)}"`);
      used.set(slug, node.id);
    }
  }
  return problems;
}
