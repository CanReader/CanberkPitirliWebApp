export const langLogos = {
  "C++": "/images/Cpp Logo.svg",
  "C#": "/images/Cs Logo.svg",
  Rust: "/images/RustLogo1.svg",
  Kotlin: "/images/Kotlin Logo.svg",
  TypeScript: "/images/TypeScript Logo.svg",
  Java: "/images/Java Logo.svg",
  JavaScript: "/images/JS Logo.svg",
  Python: "/images/Python Logo.svg",
  Go: "/images/GoLogo.svg",
};

export const techLogos = {
  "Unreal Engine": "/images/UE Logo2.svg",
  "DirectX 11": "/images/DirectX Logo.svg",
  "DirectX 11/12": "/images/DirectX Logo.svg",
  OpenGL: "/images/GL Logo.svg",
  Vulkan: "/images/GL Logo.svg",
  Unity: "/images/Unity Logo.svg",
  "Visual Studio": "/images/VS Logo.svg",
  WPF: "/images/WPF Logo.svg",
  LibGDX: "/images/LibGDX Logo.svg",
  "Node.js": "/images/Node Logo.svg",
  MySQL: "/images/MySQL Logo.svg",
  PostgreSQL: "/images/PostgreSQL Logo.svg",
  React: "/images/React Logo.svg",
};

// ── Ordered by importance / interest. Image-less projects at the bottom. ──
const rawProjects = [
  // ===== FEATURED (top 3) =====
  {
    title: "Unawake",
    description:
      "Action-adventure title published by Toplitz Productions, shown at Gamescom 2024. As a core C++ developer at Reality Arts, I built gameplay systems, AI behaviors, and engine-level optimizations in UE5. The studio received 3 Epic Games grants and is a member of the Unreal Developer Network.",
    date: "2022–2024",
    categories: ["Game Dev"],
    languages: ["C++"],
    techs: ["Unreal Engine", "Visual Studio"],
    platforms: ["Windows"],
    status: "Released",
    featured: true,
    store: "https://store.steampowered.com/app/1722610/Unawake/",
    preview:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1722610/header.jpg?t=1755195743",
    images: [
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1722610/ss_43f264bf3aa087154bc70cb5b111e733bb7dc94c.1920x1080.jpg?t=1755195743",
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1722610/ss_9f81660b7801a9b18d015b8b792bbb4540a71b2e.1920x1080.jpg?t=1755195743",
    ],
  },
  {
    title: "The Stranger",
    description:
      "VR horror experience shipped on Steam. Won Best Game at the WN Unreal European Developer Contest. I implemented a custom occlusion culling system that delivered a 20% rendering performance improvement, wrote HLSL shaders for VFX and post-processing, and built AI behaviors using Behavior Trees and Blackboard. Part of the team that secured Microsoft, Nvidia, and MSI partnerships.",
    date: "2022–2024",
    categories: ["Game Dev"],
    languages: ["C++"],
    techs: ["Unreal Engine", "Visual Studio"],
    platforms: ["Windows"],
    status: "Released",
    featured: true,
    store:
      "https://store.steampowered.com/app/828640/The_Stranger_VR/?l=turkish&curator_clanid=35141205",
    preview:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/828640/header.jpg?t=1600535189",
    images: [
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/828640/ss_41de877f48eef10affbc17b47c614aa89b7e9159.1920x1080.jpg?t=1600535189",
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/828640/ss_9a7c4de1a78abe1c99bde14273cb87f14e09ac9b.1920x1080.jpg?t=1600535189",
    ],
  },
  {
    title: "Endless Combat",
    description:
      "My first shipped title, built at age 14 at Fatalitech Game Studios, released on Steam. Co-op multiplayer zombie survival with PvP modes for up to 8 players. I built gameplay features and AI systems in C++, optimized AI routines reducing frame time by 18%. Remote team of 8. Still available on Steam today.",
    date: "2014–2016",
    categories: ["Game Dev"],
    languages: ["C++"],
    techs: ["Unreal Engine", "PostgreSQL"],
    platforms: ["Windows"],
    status: "Released",
    featured: true,
    store: "https://store.steampowered.com/app/690350/Endless_Combat/",
    preview:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_45f4c133cff300ca2d16e390727b781b15404fd7.600x338.jpg?t=1624199444",
    images: [
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_d85a06ac754e699fb2b361cb519a30e9b235645a.1920x1080.jpg?t=1624199444",
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/690350/ss_d7592531721a18d17f1e2df8f6847ed74c19809e.600x338.jpg?t=1624199444",
    ],
  },

  // ===== WITH IMAGES — ordered by importance =====
  {
    title: "Celestial Temple",
    visible: false, // set to true (or remove) to publish
    description:
      "Narrative action-adventure from Ursa Majeur, coming to Steam in Q4 2026. You play as Curiosity, working out who and where you are across a dreamlike mythic odyssey, fighting enemies that wear your own face. I'm on the project as a freelance C++ developer, writing gameplay and engine-side systems in Unreal Engine 5.",
    date: "2026",
    categories: ["Game Dev"],
    languages: ["C++"],
    techs: ["Unreal Engine"],
    platforms: ["Windows"],
    status: "In Progress",
    store: "https://store.steampowered.com/app/4636850/Celestial_Temple/",
    preview:
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4636850/e8fbda74411404b47f01f2c46765e8c371cf9b8a/header.jpg?t=1779448016",
    images: [
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4636850/7379781f1d01beae1762316309a174ac8f118dca/ss_7379781f1d01beae1762316309a174ac8f118dca.1920x1080.jpg?t=1779448016",
      "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4636850/a7b61c72bc7e1bc99c9194a91f7e4705c06d6e95/capsule_616x353.jpg?t=1779448016",
    ],
  },
  {
    title: "Slashbang",
    visible: false, // set to true (or remove) to publish
    description:
      "First person roguelike hack and slash, in development at Ursa Majeur and not announced yet, so this card stays vague on purpose. What I can say: it runs on Unreal Engine 5, it's written in C++, and the procedural terrain plugin I built for the studio generates its worlds. The rest waits for the reveal.",
    date: "2026",
    categories: ["Game Dev"],
    languages: ["C++"],
    techs: ["Unreal Engine"],
    platforms: ["Windows"],
    status: "In Progress",
    preview: "/images/Slashbang1.webp",
    images: ["/images/Slashbang1.webp"],
  },
  {
    title: "Sleak Engine",
    description:
      "Custom game engine built entirely from scratch in C++. No Unity, no Unreal, no shortcuts. Supports four graphics backends (DirectX 11, DX12, Vulkan, OpenGL) behind a single abstraction layer. Features a component-based ECS, frame budget manager, custom actor pooling, and hot-reloadable assets. The engine powers SleakCraft, a voxel sandbox I use as a testbed.",
    date: "2024–Present",
    categories: ["Engine Dev", "Game Dev"],
    languages: ["C++"],
    techs: ["DirectX 11/12", "Vulkan", "OpenGL"],
    platforms: ["Windows"],
    status: "In Progress",
    git: "https://github.com/CanReader/SleakEngine",
    preview: "/images/SleakCraft1.webp",
    images: ["/images/SleakCraft1.webp", "/images/SleakCraft2.webp", "/images/SleakCraft3.webp"],
  },
  {
    title: "ViewCam",
    description:
      "Turn your phone into a wireless webcam, microphone, and speaker for your PC. The Kotlin Multiplatform app (Compose UI, CameraX) streams H.264 over Wi-Fi or USB with mDNS auto-discovery to a Qt 6 / C++17 desktop receiver, which decodes via FFmpeg and registers a native virtual camera: DirectShow on Windows, v4l2loopback on Linux. It works out of the box in Meet, Zoom, OBS, and Discord.",
    date: "2023–Present",
    categories: ["Mobile", "Desktop"],
    languages: ["C++", "Kotlin", "Java"],
    techs: ["Qt", "Compose Multiplatform"],
    platforms: ["Android", "Windows", "Linux"],
    status: "Released",
    website: "https://viewcam.tech",
    store: "https://play.google.com/store/apps/details?id=com.sleak.vcam",
    preview: "/images/ViewCam1.webp",
    images: ["/images/ViewCam1.webp", "/images/ViewCam2.webp", "/images/ViewCam3.webp"],
  },
  {
    title: "Creatant",
    visible: false, // set to true (or remove) to publish
    description:
      "Creatant is a visual content network: a browser based platform where creatives collect, organize, and share visual work in an interface that looks nothing like traditional software. No tracking, no ads, nothing to install. I work on it full time as a fullstack software engineer, TypeScript and React in production, shipping daily.",
    date: "2026–Present",
    categories: ["Full Stack"],
    languages: ["TypeScript"],
    techs: ["React"],
    platforms: ["Web"],
    status: "In Progress",
    website: "https://www.creatant.com",
    preview: "/images/Creatant2.webp",
    images: [
      "/images/Creatant2.webp",
      "/images/Creatant6.webp",
      "/images/Creatant7.webp",
      "/images/Creatant4.webp",
      "/images/Creatant3.webp",
      "/images/Creatant5.webp",
    ],
  },
  {
    title: "Adv. DirectX 11 Course",
    description:
      "Udemy course teaching 3D graphics programming from the ground up with DirectX 11 and HLSL. Covers the full pipeline: rasterization, deferred shading, shadow mapping, tessellation, and post-processing. Built a complete DX11 rendering framework as course material. 200+ students, 4.8/5 rating.",
    date: "2024–Present",
    categories: ["Education"],
    languages: ["C++"],
    techs: ["DirectX 11"],
    platforms: ["Windows"],
    status: "In Progress",
    store: "https://www.udemy.com/course/advanced-game-programming-with-directx-11/",
    preview: "/images/DXCourse1.webp",
    images: ["/images/DXCourse1.webp", "/images/DXCourse2.webp", "/images/DXCourse3.webp"],
  },
  {
    title: "Brokeout",
    description:
      "3D Breakout game built with raw OpenGL and GLFW. No engine, just math and draw calls. Minecraft-inspired voxel aesthetic with real-time lighting, texture mapping, and physics-driven ball movement. Built as a learning project to understand the graphics pipeline from vertex to fragment.",
    date: "2020",
    categories: ["Game Dev"],
    languages: ["C++"],
    techs: ["OpenGL", "GLFW"],
    platforms: ["Windows"],
    status: "Completed",
    git: "https://github.com/CanReader/Brokeout",
    preview: "/images/Brokeout1.webp",
    images: ["/images/Brokeout1.webp", "/images/Brokeout2.webp", "/images/Brokeout3.webp"],
  },
  {
    title: "Focus Kingdom",
    description:
      "Gamified productivity app that turns study sessions into an RTS game. Build your kingdom by focusing. Cross-platform via LibGDX (Android, iOS, Desktop, Web), custom GLSL shaders, heightmap terrain generation. Real-time multiplayer via Socket.IO, Node.js backend. Published on Google Play.",
    date: "2023–2024",
    categories: ["Mobile", "Full Stack"],
    languages: ["Java", "JavaScript"],
    techs: ["LibGDX", "Node.js", "MySQL"],
    platforms: ["Android", "iOS"],
    status: "Completed",
    git: "https://github.com/CanReader/FocusKingdomServer",
    store: "https://play.google.com/store/apps/details?id=com.focus.kingdom.release",
    preview: "/images/FK_Ad1.webp",
    images: ["/images/FK_Ad1.webp", "/images/FK_Ad2.webp", "/images/FK_Ad3.webp"],
  },
  {
    title: "The Dummy Bird",
    description:
      "3D reimagining of Flappy Bird built in Unreal Engine 5 for mobile. Took a simple mechanic and wrapped it in Nanite-quality environments, dynamic lighting, and polished physics. Published on Google Play. Built in 2 weeks as a proof of concept for mobile UE5 pipelines.",
    date: "2024",
    categories: ["Game Dev", "Mobile"],
    languages: ["C++"],
    techs: ["Unreal Engine"],
    platforms: ["Android", "iOS"],
    status: "Completed",
    store: "https://play.google.com/store/apps/details?id=com.sleaksoft.dummybird.release",
    preview: "/images/DummyBird1.webp",
    images: ["/images/DummyBird1.webp", "/images/DummyBird2.webp", "/images/DummyBird3.webp"],
  },
  {
    title: "WPF Course",
    description:
      "Udemy course on Advanced WPF development. Covers XAML, data binding, custom controls, MVVM architecture, SOLID design patterns, and professional desktop tooling patterns. 4.8/5 rating. Teaches patterns directly applicable to game editor development.",
    date: "2022",
    categories: ["Education"],
    languages: ["C#"],
    techs: ["WPF"],
    platforms: ["Windows"],
    status: "Completed",
    store: "https://www.udemy.com/course/uzman-wpf-egitim/",
    preview: "/images/WPFCourse1.webp",
    images: ["/images/WPFCourse1.webp", "/images/WPFCourse2.webp"],
  },
  {
    title: "Ruby",
    description:
      "Comprehensive restaurant POS and management system. Multi-module WPF architecture (Common, Database, Model, Setup, Resources, Serialization, Presentation) with MVVM and SOLID principles. Handles POS, inventory tracking, and management tools. One of the rare portfolio pieces showing deep WPF expertise, directly applicable to game editor tooling.",
    date: "2021",
    categories: ["Desktop", "Backend"],
    languages: ["C#"],
    techs: ["WPF", "PostgreSQL"],
    platforms: ["Windows"],
    status: "Completed",
    git: "https://github.com/CanReader/Ruby",
    preview: "/images/Rubycafe1.webp",
    images: ["/images/Rubycafe1.webp", "/images/Rubycafe2.webp"],
  },

  // ===== WITHOUT IMAGES (GitHub socialify) — ordered by importance =====
  {
    title: "FastNN",
    description:
      "Deep learning framework written from scratch in Rust with hand-tuned CUDA kernels. No PyTorch, no TensorFlow under the hood. Tape-based autodiff, cuBLAS with TF32 tensor cores, RAII GPU memory. Supports dense, conv2d, LSTM, GRU, multi-head attention, and full Transformer layers. Benchmarks within 15% of PyTorch on matrix ops while using 40% less VRAM.",
    date: "2025–2026",
    categories: ["AI/ML"],
    languages: ["Rust"],
    techs: ["CUDA"],
    platforms: ["Windows", "Linux"],
    status: "Completed",
    git: "https://github.com/CanReader/FastNN",
    preview:
      "https://socialify.git.ci/CanReader/FastNN/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "Tactix",
    description:
      "Game AI plugin for Unreal Engine 5 that goes beyond stock Behavior Trees: Utility AI scoring, GOAP and HTN planners, a dynamic cover system, influence maps, and squad formations in one modular C++ toolkit for tactical enemy behavior.",
    date: "2026",
    categories: ["Game Dev", "AI/ML"],
    languages: ["C++"],
    techs: ["Unreal Engine"],
    platforms: ["Windows"],
    status: "In Progress",
    git: "https://github.com/CanReader/Tactix",
    preview:
      "https://socialify.git.ci/CanReader/Tactix/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "RustVK",
    description:
      "Vulkan renderer written in Rust on raw ash bindings. No wgpu, no vulkano. Every Vulkan object is owned by a typed Rust struct and cleaned up through Drop. Blinn-Phong lighting, 4x MSAA with a multi-attachment render pass, staging-buffer uploads to device-local memory, two frames in flight, and GLSL compiled to SPIR-V at build time.",
    date: "2026",
    categories: ["Graphics"],
    languages: ["Rust"],
    techs: ["Vulkan"],
    platforms: ["Windows", "Linux"],
    status: "In Progress",
    git: "https://github.com/CanReader/RustVK",
    preview:
      "https://socialify.git.ci/CanReader/RustVK/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "ASCIIRenderer",
    description:
      "Real-time 3D software rasterizer that renders everything as ASCII art in the browser. Built the entire pipeline from scratch in Rust: perspective projection, z-buffering, Blinn-Phong shading. Streams frames over WebSocket at 30+ FPS. Supports 7 shading modes, OBJ/glTF/FBX loading, and per-character RGB texture mapping on Canvas.",
    date: "2026",
    categories: ["Graphics", "Full Stack"],
    languages: ["Rust", "JavaScript"],
    techs: ["Axum", "React", "WebSocket"],
    platforms: ["Windows", "Linux"],
    status: "Completed",
    git: "https://github.com/CanReader/ASCIIRenderer",
    preview:
      "https://socialify.git.ci/CanReader/ASCIIRenderer/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "raft-kv",
    description:
      "Distributed key-value store implementing the Raft consensus protocol from scratch in Rust. Leader election, log replication with backtracking, automatic snapshotting, and RocksDB persistence. Architected as a 5-crate workspace with a zero-I/O core. Every state transition is deterministically testable without network mocks.",
    date: "2026",
    categories: ["Backend", "Distributed"],
    languages: ["Rust"],
    techs: ["RocksDB"],
    platforms: ["Windows", "Linux"],
    status: "Completed",
    git: "https://github.com/CanReader/raft-kv",
    preview:
      "https://socialify.git.ci/CanReader/raft-kv/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "Evo-Engine",
    description:
      "Evolutionary computation framework in Rust implementing GA, Differential Evolution, CMA-ES, and NSGA-II with an island model, a rich operator library, and a benchmark suite for optimization research.",
    date: "2026",
    categories: ["AI/ML"],
    languages: ["Rust"],
    techs: [],
    platforms: ["Windows", "Linux"],
    status: "Completed",
    git: "https://github.com/CanReader/Evo-Engine",
    preview:
      "https://socialify.git.ci/CanReader/Evo-Engine/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "Flux",
    description:
      "Fast, type-safe HTTP framework for Rust with a focus on compile-time guarantees and ergonomic routing. Built to explore what a minimal, zero-magic web framework should feel like.",
    date: "2026",
    categories: ["Backend"],
    languages: ["Rust"],
    techs: [],
    platforms: ["Windows", "Linux"],
    status: "Completed",
    git: "https://github.com/CanReader/Flux",
    preview:
      "https://socialify.git.ci/CanReader/Flux/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "ZipRS",
    description:
      "Cross-platform archive manager built with Rust + Tauri v2 + Svelte 5. Handles ZIP, TAR, GZ, BZ2, ZST with drag-and-drop, sortable file tables, and real-time progress. Also ships 15 CLI subcommands for headless use. ~2MB binary, instant startup, zero Electron bloat.",
    date: "2026",
    categories: ["Desktop", "CLI"],
    languages: ["Rust", "JavaScript"],
    techs: ["Tauri", "Svelte"],
    platforms: ["Windows", "Linux", "macOS"],
    status: "Completed",
    git: "https://github.com/CanReader/ZipRS",
    preview:
      "https://socialify.git.ci/CanReader/ZipRS/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "brew-focus",
    description:
      "Coffee-themed Pomodoro timer built with Tauri 2 + React. Fullscreen focus overlay, drag-and-drop task management, daily tracking, system tray support, 6 themes. Fully offline, ~3MB binary. Built in a weekend as a Tauri learning project. Now my daily driver for deep work sessions.",
    date: "2026",
    categories: ["Desktop", "Full Stack"],
    languages: ["Rust", "JavaScript"],
    techs: ["Tauri", "React"],
    platforms: ["Windows", "Linux", "macOS"],
    status: "Completed",
    git: "https://github.com/CanReader/brew-focus",
    preview:
      "https://socialify.git.ci/CanReader/brew-focus/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "Rustfm",
    description:
      "Fast, modern terminal file manager written in Rust: sidebar with pinned directories and disks, multiple file panels, live syntax-highlighted preview, and task, info, and clipboard panes. Ships with a Catppuccin-on-black default theme, transparency support, and full keyboard-driven navigation.",
    date: "2026",
    categories: ["CLI"],
    languages: ["Rust"],
    techs: [],
    platforms: ["Windows", "Linux"],
    status: "Completed",
    git: "https://github.com/CanReader/rustfm",
    preview:
      "https://socialify.git.ci/CanReader/rustfm/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "SimpleCNN",
    description:
      "Convolutional neural network implemented from scratch. Just Python and NumPy, no PyTorch/TensorFlow. Every layer (conv, pool, dense), every gradient, every backprop step is hand-written. Built to prove I understood deep learning at the math level, not just the API level. Achieves 97% on MNIST.",
    date: "2024",
    categories: ["AI/ML"],
    languages: ["Python"],
    techs: ["NumPy"],
    platforms: ["Windows"],
    status: "Completed",
    git: "https://github.com/CanReader/SimpleCNN",
    preview:
      "https://socialify.git.ci/CanReader/SimpleCNN/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "TensorBench",
    description:
      "Benchmarking suite that pits deep learning frameworks against each other on raw tensor operations (matmul, conv2d, activations) across different hardware. Statistical analysis with confidence intervals. Built to inform FastNN's optimization targets and validate its performance claims.",
    date: "2024",
    categories: ["AI/ML"],
    languages: ["Python"],
    techs: [],
    platforms: ["Windows"],
    status: "Completed",
    git: "https://github.com/CanReader/TensorBench",
    preview:
      "https://socialify.git.ci/CanReader/TensorBench/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "SnakeTerm",
    description:
      "Classic Snake game in the terminal using Rust. Smooth gameplay, score tracking, increasing difficulty, responsive controls in a text-based interface.",
    date: "2024",
    categories: ["CLI", "Game Dev"],
    languages: ["Rust"],
    techs: [],
    platforms: ["Windows"],
    status: "Completed",
    git: "https://github.com/CanReader/SnakeTermRS",
    preview:
      "https://socialify.git.ci/CanReader/SnakeTerm/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "TUImer",
    description:
      "Terminal-based timer and stopwatch in Rust with a polished TUI. Countdown, stopwatch, Pomodoro modes. Lightweight, responsive, distraction-free.",
    date: "2024",
    categories: ["CLI"],
    languages: ["Rust"],
    techs: [],
    platforms: ["Windows"],
    status: "Completed",
    git: "https://github.com/CanReader/TUImer",
    preview:
      "https://socialify.git.ci/CanReader/TUImer/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
  {
    title: "TodoCLI",
    description:
      "Minimalist command-line todo manager in Rust. Adding, completing, deleting, listing tasks. Persistent storage, clean output, fast performance.",
    date: "2024",
    categories: ["CLI"],
    languages: ["Rust"],
    techs: [],
    platforms: ["Windows"],
    status: "Completed",
    git: "https://github.com/CanReader/TodoCLI",
    preview:
      "https://socialify.git.ci/CanReader/TodoCLI/image?description=1&font=Jost&language=1&name=1&owner=1&pattern=Solid&theme=Dark",
    images: [],
  },
];

// URL slug for /projects/:slug pages, derived from the title.
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Entries with visible:false stay in the data but are excluded everywhere:
// the projects grid, command palette, detail routes, prerender, and sitemap.
export const projects = rawProjects
  .filter((p) => p.visible !== false)
  .map((p) => ({ slug: slugify(p.title), ...p }));

export const allCategories = [
  "All",
  "Game Dev",
  "Engine Dev",
  "Graphics",
  "AI/ML",
  "Backend",
  "Distributed",
  "Full Stack",
  "Desktop",
  "Mobile",
  "CLI",
  "Education",
];

export const allLanguages = [...new Set(projects.flatMap((p) => p.languages))];
