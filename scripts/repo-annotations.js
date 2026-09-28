// Hand-written curation for every repository on github.com/CanReader.
//
// Everything factual (dates, languages, license, stars, size, visibility) is
// pulled live from the GitHub API by scripts/sync-github.mjs. This file holds
// only the things an API cannot tell you: what the project actually is, why it
// exists, and what is interesting about it.
//
// Keys must match the repository name exactly. A repo with no entry here still
// ends up in the output, just with the GitHub description as its summary and
// "uncategorized" as its type, so nothing silently disappears.
//
// type      one of: game, game-engine, engine-plugin, library, framework,
//                   application, desktop-app, mobile-app, web-app, cli, tui,
//                   backend-service, website, template, benchmark, demo,
//                   notes, config, profile, study, fork
// status    active | maintained | complete | prototype | early | dormant
// role      personal | contract | learning | fork

export const annotations = {
  // ── Graphics, engines and games ───────────────────────────────────────────

  SleakEngine: {
    type: "game-engine",
    categories: ["game engine", "graphics", "systems"],
    status: "active",
    role: "personal",
    tech_stack: ["C++23", "CMake", "SDL3", "DirectX 11", "DirectX 12", "Vulkan", "OpenGL", "HLSL", "GLSL", "Dear ImGui", "glm", "spdlog", "nlohmann/json", "yaml-cpp", "glad"],
    summary:
      "Open source modular 3D game engine library written in C++23. Four graphics backends (DirectX 11, DirectX 12, OpenGL, Vulkan) sit behind a single abstract rendering interface, selected at runtime through a factory. Ships a full entity-component system with lifecycle hooks and parent-child hierarchies, state-driven scene management, fixed-timestep physics, SDL3 windowing, an ImGui debug overlay, and its own smart pointers and containers. Every dependency is vendored, so a clone plus CMake is the whole setup.",
    highlights: [
      "Runtime-swappable DX11 / DX12 / Vulkan / OpenGL backends behind one interface",
      "Deferred command queue for batched, order-independent submission",
      "Component-based ECS with tag queries and hierarchy support",
      "Zero package manager: all third-party code vendored in-tree",
    ],
    related: ["SleakEngine-Empty", "SleakCraft", "SleakEngine-FPP", "SleakSims", "SleakRoller"],
  },

  SleakCraft: {
    type: "game",
    categories: ["game development", "graphics", "procedural generation"],
    status: "active",
    role: "personal",
    tech_stack: ["SleakEngine", "C++23", "CMake", "HLSL", "GLSL", "DirectX 11", "DirectX 12", "Vulkan", "OpenGL"],
    summary:
      "A voxel sandbox game built on SleakEngine and the largest proof that the engine works. Terrain is chunked at 16x16x16 and streamed by background worker threads, generated from continental noise that produces oceans, coasts, rivers, lakes, beaches and mountains across six biomes. Water uses Gerstner waves, Fresnel reflections and Beer-Lambert absorption. Fifteen block types share a runtime texture atlas, with breaking and placing animations, AABB physics against the voxel field, PCF shadow mapping, MSAA up to 8x, an RLE-compressed binary save format and a built-in benchmark recorder.",
    highlights: [
      "Multi-threaded chunk streaming with foreground sync on player interaction",
      "Face culling at mesh time so only air-to-solid boundaries are drawn",
      "Gerstner-wave water with Fresnel and volumetric scattering",
      "Runs on any of the four SleakEngine backends via a CLI flag",
    ],
    related: ["SleakEngine"],
  },

  "SleakEngine-Empty": {
    type: "template",
    categories: ["game engine", "tooling"],
    status: "maintained",
    role: "personal",
    tech_stack: ["C++23", "CMake 3.31+", "SleakEngine (git submodule)"],
    summary:
      "The official starter template for SleakEngine games. Gives you a thin Client entry point, an example Game module showing scenes, objects and components, the engine as a git submodule, build helper scripts and debug/release CMake presets. Marked as a GitHub template repository, so new games start from a clean history rather than a fork.",
    highlights: ["GitHub template repo, not a fork, so each game owns its history", "Engine pulled as a submodule and updatable with one command"],
    related: ["SleakEngine"],
  },

  "SleakEngine-FPP": {
    type: "game",
    categories: ["game development", "graphics"],
    status: "maintained",
    role: "personal",
    tech_stack: ["SleakEngine", "C++23", "CMake"],
    summary:
      "A first-person perspective game built from the SleakEngine template. Exercises first-person camera control and movement inside the engine's ECS and scene system, and doubles as a reference for how a real game project consumes the engine submodule.",
    related: ["SleakEngine", "SleakEngine-Empty"],
  },

  SleakSims: {
    type: "game",
    categories: ["game development", "simulation"],
    status: "dormant",
    role: "personal",
    tech_stack: ["SleakEngine", "C++23", "CMake"],
    summary:
      "A simulation game built on SleakEngine, started from the empty template. One of several small projects used to push the engine against genres beyond voxel sandboxes and first-person movement.",
    related: ["SleakEngine", "SleakEngine-Empty"],
  },

  SleakRoller: {
    type: "game",
    categories: ["game development", "graphics"],
    status: "dormant",
    role: "personal",
    tech_stack: ["SleakEngine", "C++23", "CMake"],
    summary:
      "A rolling-ball game built from the SleakEngine starter template. A small physics and camera exercise against the engine rather than a full title.",
    related: ["SleakEngine", "SleakEngine-Empty"],
  },

  Tactix: {
    type: "engine-plugin",
    categories: ["game AI", "game development", "Unreal Engine"],
    status: "active",
    role: "personal",
    tech_stack: ["Unreal Engine 5", "C++", "Google Test", "Behavior Trees", "EQS", "Gameplay Debugger"],
    summary:
      "A tactical game AI plugin for Unreal Engine 5, published under Sleak Software. Bundles Utility AI, GOAP, HTN planning, a cover system, influence maps, perception memory, squads and formations into one coherent toolbox and wires them into Behavior Trees and EQS through drop-in tasks and decorators. The decision-making core has zero Unreal dependency, so it compiles standalone and runs under Google Test with no editor. Built for frame budget: pooled and arena memory, handle-based agent references, no UObject in the hot path, and a budgeted scheduler. Currently v0.1.0.",
    highlights: [
      "Four strictly layered modules (Core, Systems, UE, Debug) with one-way dependencies",
      "Engine-free reasoning core that unit-tests without launching the editor",
      "Designer-facing data assets plus BT/EQS nodes, no C++ required to tune",
      "Debug overlays, profiler, decision recorder and a Gameplay Debugger tab",
    ],
  },

  StealthDemo: {
    type: "game",
    categories: ["game development", "game AI", "Unreal Engine"],
    status: "maintained",
    role: "personal",
    tech_stack: ["Unreal Engine 5.5", "C++", "Blueprint", "Behavior Trees", "EQS", "AI Perception", "Enhanced Input"],
    summary:
      "A third-person stealth action game and game AI showcase in Unreal Engine 5.5 and C++. Three mission levels escalate from camera-only detection to armed patrol robots. Enemies run a multi-state awareness model (Unaware, Suspicious, Investigating, Alerted, Engaging, LostTarget, Searching, ReturningToPatrol) driven by UE's sight and hearing perception. The interesting engineering is in the Behavior Tree work: decorators with observer aborts for reactive interrupts, services monitoring the blackboard, and C++ BT tasks for the performance-sensitive logic.",
    highlights: [
      "Observer-abort decorators for genuinely reactive Attack / Search / Patrol switching",
      "Security cameras with sweep, investigate and alert states",
      "Crouch and cover stealth mechanics with HitScan combat",
    ],
  },

  RustVK: {
    type: "application",
    categories: ["graphics", "systems"],
    status: "maintained",
    role: "personal",
    tech_stack: ["Rust", "ash (raw Vulkan)", "GLSL", "SPIR-V", "glslc", "winit"],
    summary:
      "A Vulkan renderer in Rust built on raw ash bindings with no wgpu or vulkano in between. Every Vulkan object is owned by a typed Rust struct and torn down through Drop. Renders a lit rotating cube with Blinn-Phong shading, a quadratic-attenuation point light, 4x MSAA through a three-attachment render pass, two frames in flight, staging-buffer uploads to device-local memory, swapchain recreation on resize, and validation layers enabled automatically in debug builds. Shaders compile to SPIR-V at build time from build.rs.",
    highlights: [
      "render_finished semaphores indexed by swapchain image, not frame, avoiding VUID-vkQueueSubmit-pSignalSemaphores-00067",
      "Pre-compiled .spv checked in so it builds without the Vulkan SDK",
      "RAII ownership of every Vulkan handle",
    ],
  },

  ASCIIRenderer: {
    type: "application",
    categories: ["graphics", "web", "tooling"],
    status: "maintained",
    role: "personal",
    tech_stack: ["Rust", "Axum", "tokio", "hyper", "DashMap", "ts-rs", "React 18", "Vite", "TypeScript", "tobj", "fbxcel-dom", "WebSocket", "HTML5 Canvas"],
    summary:
      "A real-time 3D software rasterizer that streams rendered frames to the browser as ASCII art over WebSocket, written from scratch in Rust. Implements perspective projection, z-buffering, barycentric interpolation and Blinn-Phong shading with no GPU involved. Offers 7 shading modes, 6 character sets and 6 color profiles, loads OBJ, glTF, GLB and FBX models, and draws per-character RGB text onto an HTML5 canvas at 30 FPS with drag-to-rotate, auto-rotate and a live control panel. The backend is a single Axum binary that also serves the built React frontend.",
    highlights: ["CPU rasterizer: no OpenGL, Vulkan or WebGL anywhere in the pipeline", "Rust types shared with the TypeScript frontend via ts-rs", "Single binary deploy, frontend served as static files by Axum"],
  },

  ProjectDX: {
    type: "demo",
    categories: ["graphics", "game development"],
    status: "dormant",
    role: "learning",
    tech_stack: ["C++", "DirectX", "MSBuild", "Visual Studio"],
    summary:
      "A C++ DirectX exploration split into an Engine layer and a ProjectDX application layer, built with a Visual Studio solution. An early structural experiment in separating engine code from game code before SleakEngine existed.",
  },

  "DX11-TerrainTesellatorDemo": {
    type: "demo",
    categories: ["graphics", "game development"],
    status: "dormant",
    role: "learning",
    tech_stack: ["DirectX 11", "DirectXTK", "HLSL", "C++", "CMake", "Visual Studio"],
    summary:
      "A demo that generates highly detailed terrain from height maps using DirectX 11 hardware tessellation. Drives the Hull and Domain shader stages from HLSL, and is structured as a TheEngine layer plus a TheTerrain project buildable from either the Visual Studio solution or CMake.",
  },

  Brokeout: {
    type: "game",
    categories: ["game development", "graphics"],
    status: "maintained",
    role: "learning",
    tech_stack: ["C++", "OpenGL", "GLFW", "GLM", "Assimp", "glad", "stb_image", "CMake"],
    summary:
      "A 3D Breakout game written to learn OpenGL properly. Three levels with distinct brick layouts, three lives, a combo multiplier up to 5x, angle-based ball deflection driven by paddle hit position, power-up drops (wide paddle, extra life, ball speed), two-stage crack-then-break brick animation with Minecraft-styled block textures, and pause/resume. Cross-platform across Linux, macOS and Windows.",
  },

  Shotia: {
    type: "game",
    categories: ["game development", "networking"],
    status: "dormant",
    role: "learning",
    tech_stack: ["Unreal Engine", "C++", "Blueprint", "Multiplayer Sessions plugin", "Visual Studio"],
    summary:
      "A multiplayer shooter built with Unreal Engine and C++. Has a primary/secondary weapon system, a grenade system with HUD counter, and online sessions through the MultiplayerSessions plugin. Thirty-one commits inside a single month of concentrated development.",
  },

  UE5LearnPath: {
    type: "study",
    categories: ["game development", "learning"],
    status: "dormant",
    role: "learning",
    tech_stack: ["Unreal Engine 5", "C++", "Blueprint"],
    summary:
      "A worked-through Unreal Engine 5 C++ curriculum following Stephen Ulibarri's course and other material. Kept public as a record of the learning path rather than as a shippable project.",
  },

  ProcTile: {
    type: "engine-plugin",
    categories: ["procedural generation", "Unreal Engine", "tooling"],
    status: "active",
    role: "contract",
    tech_stack: ["Unreal Engine", "C++", "C#", "Python"],
    summary:
      "A procedural tile generation plugin for Unreal Engine, delivered as contract work for Ursa Majeur (Slashbang). Packaged as a proper .uplugin with Source, Resources, Docs and Extras. Copyright Canberk Pitirli.",
    client: "Ursa Majeur (Slashbang)",
  },

  // ── AI and machine learning ───────────────────────────────────────────────

  FastNN: {
    type: "library",
    categories: ["AI / deep learning", "GPU computing", "systems"],
    status: "active",
    role: "personal",
    tech_stack: ["Rust", "CUDA 12.x", "cuBLAS", "cuRAND", "nvcc", "safetensors"],
    summary:
      "A deep learning library written from scratch in Rust, with hand-written CUDA kernels for the parts that matter. Tape-based reverse-mode autograd, dual CPU/GPU tensors with automatic device dispatch, cuBLAS SGEMM with TF32 tensor cores, and RAII GPU memory management. Layers cover dense, conv2d, LSTM, GRU, multi-head attention, Transformer encoder, embedding, batch/layer/RMS norm, dropout and pooling; plus SGD/Adam/AdamW, cosine and OneCycle schedulers, a DataLoader, KV-cached text generation, safetensors interchange and a binary .fdl checkpoint format. Supports Volta through Hopper.",
    highlights: [
      "Training loop with no gradient-mode flags and no borrow dance around the optimizer",
      "Published to crates.io with CUDA behind an optional feature, so CPU users need no toolkit",
      "Worked examples from XOR up to a GPT-style transformer trained from scratch",
    ],
    related: ["tinylm", "fastnn-visualizer"],
  },

  tinylm: {
    type: "cli",
    categories: ["AI / deep learning", "tooling"],
    status: "active",
    role: "personal",
    tech_stack: ["Rust", "FastNN", "CUDA (optional)"],
    summary:
      "Train, sample and serve tiny language models on your own text from a single binary, with no Python anywhere. Built on FastNN. Produces byte-level GPTs from roughly 1M to 11M parameters that learn the shape of a specific corpus (a writing style, a log format, a naming scheme) in minutes on CPU, faster with a CUDA build. Three commands: train, generate, serve. Training checkpoints as it goes and resumes with optimizer state intact, so an interrupt costs a few hundred steps at most.",
    highlights: [
      "Byte tokenizer: vocabulary is always 256, every file round-trips, no vocab artifact to manage",
      "Checkpoints write weights, a JSON architecture description and a resumable optimizer state separately",
      "serve exposes one /generate endpoint that returns 400 with a message on bad parameters instead of dying",
    ],
    related: ["FastNN"],
  },

  "fastnn-visualizer": {
    type: "web-app",
    categories: ["AI / machine learning", "web", "visualization"],
    status: "maintained",
    role: "personal",
    tech_stack: ["Rust", "FastNN", "Axum", "HTML5 Canvas", "JavaScript"],
    summary:
      "A web app that trains an MNIST digit classifier and then lets you draw a digit and watch the network light up as it predicts. Both training (with live data augmentation) and inference run inside one Rust process on FastNN, with no Python, no external ML backend and no inference server. The middle panel renders the network graph with node brightness as activation magnitude and the 200 strongest weight-times-activation edges colored green for excitatory and red for inhibitory. Architecture, activation function, epochs and augmentation can be changed and retrained live, with the old model serving predictions until the new one atomically swaps in.",
    highlights: [
      "Shows the preprocessed 28x28 that actually reaches the model (bounding-box crop, 20px longest side, center-of-mass alignment)",
      "Hot model swap: retrain from the browser without dropping a single prediction",
    ],
    related: ["FastNN"],
  },

  "tinyml-rs": {
    type: "library",
    categories: ["AI / machine learning", "embedded", "edge computing"],
    status: "maintained",
    role: "personal",
    tech_stack: ["Rust (no_std)", "cudarc (optional)", "arena allocator"],
    summary:
      "A no_std machine learning inference runtime for microcontrollers and edge devices, with optional CUDA acceleration. Uses a static arena bump allocator so it never touches the heap, loads weights zero-copy from a binary buffer, keeps tensors in NHWC layout, and quantizes to INT8 with affine scaling. Operators cover Dense, Conv2d, DepthwiseConv2d, ReLU/ReLU6, Sigmoid, Softmax, MaxPool2d, AvgPool2d, GlobalAvgPool2d, Reshape, Flatten, Add, Mul and Tanh. Targets ARM thumbv7em, RISC-V, WASM and CUDA from one codebase.",
    highlights: ["Zero heap allocation at inference time", "Dual MIT / Apache-2.0 licensed", "Compact custom binary model format"],
  },

  "Evo-Engine": {
    type: "framework",
    categories: ["AI / machine learning", "optimization", "algorithms"],
    status: "maintained",
    role: "personal",
    tech_stack: ["Rust 2021", "Rayon", "Serde"],
    summary:
      "An evolutionary computation framework in pure Rust. Implements genetic algorithms, three Differential Evolution strategies, CMA-ES, NSGA-II multi-objective optimization and an island model with ring migration. Crossover (SBX, BLX-alpha, arithmetic, UNDX, OX, PMX), mutation (polynomial, Gaussian, Cauchy, adaptive) and selection (tournament, SUS, rank-based) operators are pluggable across real, binary and permutation genomes. Ships a benchmark suite (Rastrigin, Rosenbrock, TSP, Knapsack), CSV/JSON export and callback hooks. Parallel evaluation is behind a Rayon feature flag.",
  },

  SimpleCNN: {
    type: "library",
    categories: ["AI / machine learning", "GPU computing"],
    status: "complete",
    role: "learning",
    tech_stack: ["C++14", "CUDA Toolkit 13.0+", "CMake 3.18+", "unified memory"],
    summary:
      "A small C++ neural network library with native CUDA acceleration. Linear, ReLU, Sequential and MSE Loss modules each ship identical CPU and GPU implementations so the two can be validated element-wise against each other. Uses cudaMallocManaged for unified memory and atomics inside the kernels. Comes with unit tests that diff CPU against GPU results.",
  },

  TensorBench: {
    type: "benchmark",
    categories: ["GPU computing", "AI / machine learning", "performance"],
    status: "complete",
    role: "personal",
    tech_stack: ["CUDA 12.0+", "cuBLAS", "C++", "CMake 3.18+", "Python (plotting)"],
    summary:
      "A CUDA benchmarking suite for GPU tensor operations. Six tests: cuBLAS baseline, naive kernel comparison, mixed precision FP16/FP32 analysis, strong scaling with batched operations, a stress test up to 12288x12288 matrices, and a multi-algorithm comparison with roofline analysis. Emits CSV reports carrying mean, standard deviation and percentile statistics alongside thermal throttling risk scores, cache miss estimates and measured memory bandwidth.",
  },

  MnistPY: {
    type: "study",
    categories: ["AI / machine learning", "learning"],
    status: "complete",
    role: "learning",
    tech_stack: ["Python", "TensorFlow", "Keras"],
    summary:
      "The first AI model I trained: a handwritten digit classifier on MNIST with TensorFlow and Keras. Kept as the starting point of a line that eventually leads to FastNN.",
    related: ["FastNN"],
  },

  PythonGeneticAlgorithms: {
    type: "study",
    categories: ["AI / algorithms", "learning"],
    status: "complete",
    role: "learning",
    tech_stack: ["Python"],
    summary:
      "A genetic algorithm implemented in a single Python file (CGAPY.py). An early exploration of evolutionary computation that Evo-Engine later revisits properly.",
    related: ["Evo-Engine", "JavaGeneticAlgorithms"],
  },

  JavaGeneticAlgorithms: {
    type: "study",
    categories: ["AI / algorithms", "learning"],
    status: "complete",
    role: "learning",
    tech_stack: ["Java", "Eclipse"],
    summary:
      "A Java genetic algorithm that evolves a candidate path toward a target value, laid out as a standard Eclipse project under com.universe.world. One of the oldest repositories on the account.",
    related: ["PythonGeneticAlgorithms", "Evo-Engine"],
  },

  // ── Systems, backend and distributed ──────────────────────────────────────

  "raft-kv": {
    type: "application",
    categories: ["distributed systems", "backend"],
    status: "complete",
    role: "personal",
    tech_stack: ["Rust 2021", "tokio", "tonic (gRPC)", "prost", "RocksDB", "bincode", "clap v4", "tracing"],
    summary:
      "A distributed key-value store implementing the Raft consensus algorithm from scratch in Rust. Covers leader election with randomized timeouts and pre-vote, log replication with fast term-skipping backtracking, automatic snapshotting and log compaction through chunked InstallSnapshot RPCs, and durable RocksDB-backed state. Laid out as a five-crate workspace where the pure Raft core has zero I/O dependencies and is therefore deterministically testable. Runs a three-node cluster with a CLI client for get, put, delete, status and bench.",
    highlights: ["I/O-free consensus core, so the tricky logic is deterministic under test", "Pre-vote to stop disruptive elections from partitioned nodes"],
  },

  Flux: {
    type: "framework",
    categories: ["backend", "web framework"],
    status: "complete",
    role: "personal",
    tech_stack: ["Rust", "hyper 1.x", "hyper-util", "tokio", "tower", "serde", "tracing"],
    summary:
      "A type-safe HTTP framework for Rust built directly on hyper, tokio and tower. Provides extractors (Json<T>, Path<T>, Query<T>, State<T>), an IntoResponse trait for flexible return types, first-class tower middleware (Logger, CORS, Timeout), named path parameters and wildcards, sub-router nesting, shared state injection and graceful shutdown. Structured errors serialize to consistent JSON. HTTP/1.1 and HTTP/2 both supported through hyper-util.",
  },

  "titan-server": {
    type: "backend-service",
    categories: ["backend", "game development", "networking"],
    status: "complete",
    role: "personal",
    tech_stack: ["Go 1.22+", "chi", "pgx", "PostgreSQL 16", "Redis 7", "NATS 2", "nhooyr/websocket", "golang-jwt", "Prometheus", "Docker Compose"],
    summary:
      "A game backend in Go built to exercise the language's concurrency toolkit properly. Seven services under a clean architecture: JWT dual-token auth with bcrypt and Redis sessions, ELO matchmaking with time-decay tolerance on a fan-out/fan-in worker pool, a WebSocket hub running a 20Hz tick loop over sync.Map and buffered channels, Redis sorted-set leaderboards with O(log N) ranking, deadlock-safe inventory trading via SELECT FOR UPDATE with ordered locking, NATS pub/sub chat with async persistence, and Prometheus metrics with pprof and health probes.",
    highlights: ["Ordered lock acquisition to make concurrent item trades deadlock-free", "20Hz authoritative game loop over WebSocket", "Generics used for the Redis helper layer"],
  },

  "product-catalog": {
    type: "backend-service",
    categories: ["backend", "networking"],
    status: "complete",
    role: "personal",
    tech_stack: ["Go 1.21+", "gRPC", "Protobuf", "Buf CLI", "JWT", "slog"],
    summary:
      "A Go gRPC microservice that demonstrates all four RPC patterns in one codebase: unary CRUD with FieldMask partial updates and pagination, server streaming for real-time product change notifications over pub/sub, client streaming for batch inventory updates, and bidirectional streaming for search queries with per-query results. JWT auth runs through interceptors, alongside structured slog logging and panic recovery middleware.",
  },

  "todo-api": {
    type: "backend-service",
    categories: ["backend", "web development"],
    status: "complete",
    role: "personal",
    tech_stack: ["Go 1.25", "chi", "PostgreSQL 17", "pgx", "golang-jwt", "golang-migrate", "go-playground/validator", "swaggo", "Docker", "Docker Compose"],
    summary:
      "A production-shaped Todo REST API in Go. JWT authentication, paginated listing with full-text search, completion filtering, multi-column sorting, bulk delete, Swagger UI docs and multi-stage Docker builds. Follows clean architecture with repository interfaces, a service layer, DTOs and dependency injection, and is covered by both unit tests against mock repositories and integration tests through httptest.",
  },

  p2pFileShare: {
    type: "application",
    categories: ["networking", "distributed systems", "backend"],
    status: "complete",
    role: "personal",
    tech_stack: ["Java 21", "Javalin", "Kademlia DHT", "Gradle", "Shadow plugin", "Project Loom"],
    summary:
      "A decentralized peer-to-peer file sharing system in Java 21. Peer discovery runs on a Kademlia DHT (160-bit ID space, XOR distance, K=20 buckets), files transfer in 256 KB chunks with SHA-256 integrity verification, and downloads run asynchronously on Project Loom virtual threads. A Javalin REST layer sits on top of the pure-Java core so any language can drive a node over HTTP.",
    highlights: ["Split into a dependency-free core library and a separate API server module", "Virtual threads instead of a thread pool for concurrent chunk fetches"],
  },

  GoChat: {
    type: "application",
    categories: ["networking", "real-time", "cross-platform"],
    status: "complete",
    role: "personal",
    tech_stack: ["Go", "nhooyr.io/websocket", "PostgreSQL", "JWT", "Rust", "ratatui", "crossterm", "tokio", "Kotlin", "Jetpack Compose", "OkHttp", "Retrofit"],
    summary:
      "A real-time chat system written three times over: a Go WebSocket server, a Rust terminal client and an Android client. The server handles JWT auth, PostgreSQL persistence for users, rooms and messages, broadcast fan-out, typing indicators, presence tracking and rate limiting. The Rust TUI uses ratatui and crossterm with keyboard-driven navigation. The Android client is Jetpack Compose and MVVM, with OkHttp WebSocket reconnection under exponential backoff and Retrofit for REST auth.",
  },

  DataStructuresCpp: {
    type: "library",
    categories: ["algorithms & data structures", "systems"],
    status: "active",
    role: "personal",
    tech_stack: ["C++20", "CMake", "header-only"],
    summary:
      "A zero-dependency C++20 data structures and algorithms library with no standard library, no Boost and no libc behind it. Containers include dynamic arrays (1.5x growth), linked lists, stacks, queues, deques, Robin Hood open-addressing hash maps and sets, AVL tree maps and sets, 4-ary heaps, tries, bitsets, union-find, segment trees, Fenwick trees, skip lists and sparse sets. Over 30 algorithms cover sorting (introsort, merge, radix), searching, graphs (BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal, Prim), strings (KMP, Rabin-Karp, Z-algorithm, suffix array), math (GCD, Miller-Rabin, matrix exponentiation, combinatorics) and sequence operations.",
    highlights: [
      "No exceptions anywhere: Optional<T> is the error channel",
      "FNV-1a hashing with Fibonacci mixing, 4-ary heaps chosen for cache behavior",
      "__builtin_memcpy / memset so the compiler auto-vectorizes memory operations",
    ],
  },

  WindowFramework: {
    type: "library",
    categories: ["desktop", "Win32"],
    status: "complete",
    role: "learning",
    tech_stack: ["C++", "Win32 API", "Visual Studio 2019"],
    summary:
      "A reusable C++ windowing framework over the Win32 API, written to be shared across projects. The oldest public repository on the account and the foundation layer that the early Windows desktop work sat on.",
    related: ["Window-project"],
  },

  "Window-project": {
    type: "study",
    categories: ["desktop", "Win32", "learning"],
    status: "complete",
    role: "learning",
    tech_stack: ["C++", "Win32 API"],
    summary:
      "The oldest repository on the account, from 2019. A first WIN32 API exploration that led directly to the public WindowFramework.",
    related: ["WindowFramework"],
  },

  // ── Desktop, mobile and productivity products ─────────────────────────────

  "brew-focus": {
    type: "desktop-app",
    categories: ["productivity", "product"],
    status: "active",
    role: "personal",
    tech_stack: ["Tauri 2", "Rust", "React 18", "TypeScript", "Zustand", "Tailwind CSS", "Framer Motion", "Supabase", "PostgreSQL"],
    summary:
      "A coffee-themed Pomodoro timer and task manager for macOS, Windows and Linux, shipped under Sleak Software as Brew Focus. An animated coffee cup fills as you work and a break starts when it is full. Beyond the timer it carries configurable work and break phases, per-task durations, a fullscreen focus overlay and compact widget mode, drag-and-drop tasks grouped into color-coded projects with board, calendar, graph and weekly-plan views, Markdown notes with wiki-link rendering, task dependencies, a daily focus goal ring and an activity timeline. Ships with 6 accent themes, 7 languages including full RTL, a system tray that keeps the timer alive, auto-updates from GitHub releases, and Supabase-backed accounts that sync with the mobile app.",
    highlights: ["Cross-device sync with brew-focus-mobile through one Supabase account", "7 languages with real RTL support, not just translated strings"],
    related: ["brew-focus-mobile", "brew-focus-web", "brewfocus-legal"],
    product: "Brew Focus",
  },

  "brew-focus-mobile": {
    type: "mobile-app",
    categories: ["productivity", "mobile", "product"],
    status: "active",
    role: "personal",
    tech_stack: ["Expo", "React Native", "TypeScript", "Supabase", "EAS Build"],
    summary:
      "The Android companion to Brew Focus, built with Expo and React Native, sharing the same account, tasks and projects as the desktop app. The timer is wall-clock anchored so it stays accurate when the app is backgrounded, and per-task durations, haptics, a daily focus ring, an activity timeline and weekly/monthly reports all carry over. Currently v0.1.0 on the Play Store Internal Testing track, with iOS planned.",
    related: ["brew-focus"],
    product: "Brew Focus",
  },

  "brew-focus-web": {
    type: "website",
    categories: ["web development", "marketing", "product"],
    status: "active",
    role: "personal",
    tech_stack: ["React", "TypeScript", "Vite", "Framer Motion"],
    summary:
      "The marketing site for Brew Focus. Static React and TypeScript on Vite with no backend, no analytics and no tracking. Download links and feature copy live in single data files so store URLs change in one place, and the palette mirrors the app's Fresh Roast design tokens. The hero cup runs a real 25-minute pomodoro rather than a looping animation, with query flags to freeze every section or preload the cup at any fill level for screenshots.",
    related: ["brew-focus"],
    product: "Brew Focus",
  },

  "brewfocus-legal": {
    type: "website",
    categories: ["web development", "legal", "product"],
    status: "maintained",
    role: "personal",
    tech_stack: ["GitHub Pages", "Jekyll", "Markdown"],
    summary:
      "Privacy policy, terms of service and support pages for BrewFocus by Sleak Software, served from GitHub Pages. The store-facing legal requirement for the app listings.",
    related: ["brew-focus", "brew-focus-legal"],
    product: "Brew Focus",
  },

  "brew-focus-legal": {
    type: "website",
    categories: ["legal", "product"],
    status: "dormant",
    role: "personal",
    tech_stack: ["Markdown"],
    summary:
      "The first attempt at hosting Brew Focus legal pages, superseded by brewfocus-legal.",
    related: ["brewfocus-legal"],
    product: "Brew Focus",
  },

  ZipRS: {
    type: "desktop-app",
    categories: ["tooling", "productivity"],
    status: "active",
    role: "personal",
    tech_stack: ["Rust", "Tauri 2", "Svelte 5", "TailwindCSS 4", "Tokio", "clap", "Zstd", "Vite 7", "NSIS"],
    summary:
      "A desktop archive manager in the spirit of WinRAR, written entirely in Rust. Handles ZIP, TAR, TAR.GZ, TAR.BZ2 and TAR.ZST with open, browse, extract, add, delete, create and test operations, including ZIP with Zstd level 19. The Tauri 2 and Svelte 5 GUI has breadcrumb navigation with history, a sortable multi-select file table, drag-and-drop in and drag-out extraction, right-click actions, keyboard shortcuts, live progress and a properties panel showing CRC-32, ratio and compression method. A ziprs CLI covers the same ground plus convert, diff, stats and tree.",
    highlights: ["Same Rust core drives both the GUI and a 15-subcommand CLI", "Drag files out of the window straight into the file manager"],
  },

  rustfm: {
    type: "tui",
    categories: ["tooling", "terminal", "productivity"],
    status: "active",
    role: "personal",
    tech_stack: ["Rust", "ratatui", "syntect", "poppler", "git2"],
    summary:
      "A terminal file manager in Rust with a sidebar of pinned directories and disks, multiple independent file panels, a live preview pane and a three-pane footer. Preview handles syntax-highlighted code via syntect, images through Kitty, iTerm2 and Sixel protocols with a halfblocks fallback, PDFs page by page, directories and git diffs. Git integration goes deep: per-entry index and worktree status letters propagated to parent directories, branch and ahead/behind summaries, and a menu for stage, unstage, discard, commit and raw git commands. File operations run on a background worker with live progress, and both vim-flavored and ctrl-based keybindings work everywhere.",
    highlights: [
      "Permanent deletion is reachable only from the command palette, so a habitual D can never hard-wipe files",
      "Copied files land on the OS clipboard as text/uri-list, pasteable into graphical file managers",
      "Catppuccin Black theme with optional background transparency",
    ],
  },

  TodoCLI: {
    type: "cli",
    categories: ["productivity", "tooling"],
    status: "complete",
    role: "personal",
    tech_stack: ["Rust 1.70+", "rusqlite (SQLite)", "console", "dialoguer", "lazy_static"],
    summary:
      "A cross-platform command line to-do manager in Rust backed by SQLite. Supports add, list, toggle, remove, sort by status and reset, with color-coded terminal output and the database stored in the home directory. Runs on Linux, macOS and Windows.",
  },

  TUImer: {
    type: "tui",
    categories: ["productivity", "terminal", "tooling"],
    status: "complete",
    role: "personal",
    tech_stack: ["Rust", "ratatui", "crossterm", "clap", "TOML"],
    summary:
      "A keyboard-first terminal Pomodoro timer and focus companion. Countdown and Pomodoro work/pause modes, flexible duration parsing (ss, mm:ss, hh:mm:ss), optional decisecond display, desktop notifications, feature-gated sound alerts, persistent settings, session logs and configurable display styles.",
  },

  CoDo: {
    type: "desktop-app",
    categories: ["productivity", "graphics", "tooling"],
    status: "complete",
    role: "learning",
    tech_stack: ["Pure C", "OpenGL", "GLFW", "leif (cococry)", "cglm", "glad", "libclipboard", "stb_image"],
    summary:
      "A hardware-accelerated task manager written in pure C with OpenGL doing the rendering, using cococry's leif immediate-mode UI library as the backbone. Tasks serialize to and from a binary .dat file and carry priority levels. An exercise in building real UI without a framework.",
  },

  ToMakeDesktop: {
    type: "desktop-app",
    categories: ["productivity"],
    status: "dormant",
    role: "personal",
    tech_stack: ["C", "CMake"],
    summary: "A desktop planning and organization application, the desktop half of the ToMake pair.",
    related: ["ToMakeMobile"],
  },

  ToMakeMobile: {
    type: "mobile-app",
    categories: ["productivity", "mobile"],
    status: "dormant",
    role: "personal",
    tech_stack: [],
    summary: "The mobile companion to ToMakeDesktop. Never got past the initial scaffold.",
    related: ["ToMakeDesktop"],
  },

  // ── ViewCam ───────────────────────────────────────────────────────────────

  "ViewCam-Desktop": {
    type: "desktop-app",
    categories: ["networking", "tooling", "video", "product"],
    status: "active",
    role: "personal",
    tech_stack: ["Qt 6", "Qt Quick / QML", "C++17", "CMake", "CUDA", "Vulkan", "v4l2loopback", "DirectShow", "Inno Setup"],
    summary:
      "The desktop half of ViewCam Studio, which turns a phone into a wireless studio-grade webcam. Receives the phone's live stream over Wi-Fi and exposes it to the operating system as a genuine camera device (v4l2loopback on Linux, DirectShow on Windows), so OBS, Zoom, Meet and Discord all see it as a normal webcam. Zero-config pairing: phones announce themselves on the local network and appear as live device cards. GPU paths through CUDA and Vulkan handle the processing, and the QML interface is dark-first and viewfinder-shaped by design. Proprietary license, packaged with Inno Setup on Windows.",
    highlights: ["Real OS camera device, not a browser or app-specific hack", "No cables, no capture card, no dedicated hardware"],
    related: ["ViewCam-Mobile", "ViewCam"],
    product: "ViewCam Studio",
  },

  "ViewCam-Mobile": {
    type: "mobile-app",
    categories: ["mobile", "networking", "video", "product"],
    status: "active",
    role: "personal",
    tech_stack: ["Kotlin Multiplatform", "Compose Multiplatform", "CameraX", "Camera2", "Android 26+", "Swift (iOS scaffolding)"],
    summary:
      "The capture half of ViewCam Studio. Runs a small streaming server on the phone, announces itself on the local network, and sends a live camera feed to the desktop app the moment you tap record. A full CameraX preview fills the screen with a minimal HUD showing live state, session timer and connection. Built as Kotlin Multiplatform with Compose Multiplatform so the iOS port is a platform layer rather than a rewrite. Proprietary license.",
    related: ["ViewCam-Desktop", "ViewCam"],
    product: "ViewCam Studio",
  },

  ViewCam: {
    type: "application",
    categories: ["networking", "tooling", "mobile"],
    status: "dormant",
    role: "personal",
    tech_stack: ["Java", "Android", "C++", "C#"],
    summary:
      "The original 2023 ViewCam: an interface between Android and PC that displays the phone camera for people with no physical webcam. Later superseded by the ViewCam Studio split into ViewCam-Mobile and ViewCam-Desktop.",
    related: ["ViewCam-Desktop", "ViewCam-Mobile"],
  },

  CameraApp: {
    type: "mobile-app",
    categories: ["mobile"],
    status: "complete",
    role: "learning",
    tech_stack: ["Java", "Android"],
    summary: "An early Android camera application, the prototype that preceded ViewCam.",
    related: ["ViewCam"],
  },

  // ── FocusKingdom ──────────────────────────────────────────────────────────

  FocusKingdom: {
    type: "game",
    categories: ["game development", "mobile", "cross-platform"],
    status: "active",
    role: "personal",
    tech_stack: ["libGDX", "Java", "Gradle", "Socket.IO", "OpenGL ES", "GLSL", "AdMob"],
    summary:
      "A cross-platform 3D kingdom-building game on libGDX and Java, targeting Android, iOS, desktop and HTML5 from one Gradle multi-module build. Features real-time multiplayer over Socket.IO, custom GLSL shaders, heightmap terrain generation, building placement mechanics, lifecycle-aware environment audio and AdMob integration.",
    related: ["FocusKingdomServer"],
  },

  FocusKingdomServer: {
    type: "backend-service",
    categories: ["backend", "game development", "networking"],
    status: "active",
    role: "personal",
    tech_stack: ["TypeScript", "Node.js 20+", "Express", "Socket.IO", "PostgreSQL", "JWT", "bcrypt", "nodemailer", "Jimp", "Sentry", "PM2"],
    summary:
      "The backend for FocusKingdom, rewritten in TypeScript on Node 20. Handles real-time multiplayer over Socket.IO alongside an Express REST layer, PostgreSQL persistence with migrations, JWT and bcrypt authentication, transactional email through nodemailer, image processing with Jimp, error reporting to Sentry, and PM2 process management in production. Went public alongside the alpha.",
    related: ["FocusKingdom"],
  },

  // ── Web and client work ───────────────────────────────────────────────────

  CanberkPitirliWebApp: {
    type: "website",
    categories: ["web development", "portfolio"],
    status: "active",
    role: "personal",
    tech_stack: ["React 18", "Vite", "Tailwind CSS", "Framer Motion", "React Router", "EmailJS", "KaTeX"],
    summary:
      "This site. A personal portfolio and technical blog at canberkpitirli.com covering graphics programming, game development, C++, Rust and systems design. Built on React and Vite with a build-time SEO pass that prerenders per-route meta and JSON-LD, generates a sitemap and RSS feed, and renders branded Open Graph cards for every page. Also serves the /getprojects JSON endpoint this document comes from.",
    homepage_note: "https://canberkpitirli.com",
  },

  CreatantOnboardingPrototype: {
    type: "web-app",
    categories: ["web development", "UI/UX", "prototype"],
    status: "active",
    role: "contract",
    tech_stack: ["React", "TypeScript", "Vite", "Vitest", "driver.js", "Framer Motion"],
    summary:
      "CREATANT's first-run onboarding in two connected parts: a signup segmentation flow (context, discipline, team size with an enterprise branch, invites, attribution, interests, workspace naming) and an interactive in-platform guided tour. Because the production codebase is not wired in yet, the tour runs against a stand-in workspace mock, so pointing it at the live interface is a selector swap rather than a rewrite. Four independent layers (step content, theme, tour engine, persistence) never reach into each other, so reordering screens is a data edit and a new visual skin is one theme file. Four themes ship: console, drawer, aurora and stage.",
    highlights: [
      "Flow order is one array, so inserting or reordering a screen changes no logic",
      "Branch targets resolved by key so they survive reordering",
      "Vitest suite over the flow, engine and persistence layers",
    ],
    client: "CREATANT",
    related: ["CreatantOnboard"],
  },

  CreatantOnboard: {
    type: "web-app",
    categories: ["web development", "UI/UX", "prototype"],
    status: "complete",
    role: "contract",
    tech_stack: ["React", "TypeScript", "Vite", "Framer Motion"],
    summary:
      "The first concept prototype of CREATANT's first-run experience: onboarding as a compact console floating over the dimmed, blurred canvas, six questions with an enterprise branch, then a game-style guided first run on the canvas itself. Every visual value was measured out of the real logged-in product rather than invented, down to the 31px bars, the electric cyan accent used in 26 places across the app, and the sloped parallelogram tabs taken from the SELECTION tab. All state is in memory, with no backend, auth or localStorage.",
    client: "CREATANT",
    related: ["CreatantOnboardingPrototype"],
  },

  byatalay: {
    type: "website",
    categories: ["web development", "client work"],
    status: "complete",
    role: "contract",
    tech_stack: ["JavaScript", "HTML", "CSS"],
    summary: "A business website built for the restaurant La Casa De Pasta.",
    client: "La Casa De Pasta",
  },

  PirayeGuzellikSalonu: {
    type: "website",
    categories: ["web development", "client work"],
    status: "complete",
    role: "contract",
    tech_stack: ["React", "JavaScript", "HTML", "CSS"],
    summary: "A React website designed for a beauty salon business.",
  },

  ReactFlix: {
    type: "mobile-app",
    categories: ["mobile", "web development", "learning"],
    status: "complete",
    role: "learning",
    tech_stack: ["React Native"],
    summary: "A Netflix clone built with React Native to learn the framework.",
  },

  "reactive-calculator": {
    type: "application",
    categories: ["mobile", "web development", "learning"],
    status: "complete",
    role: "learning",
    tech_stack: ["JavaScript", "React"],
    summary: "A cross-platform calculator app modeled on the iOS calculator layout.",
  },

  Ruby: {
    type: "desktop-app",
    categories: ["business software", "desktop"],
    status: "complete",
    role: "contract",
    tech_stack: ["C#", ".NET Framework", "WPF", "Visual Studio"],
    summary:
      "A cafe and restaurant management suite in C# and .NET, covering point of sale, inventory tracking and back-office management. Structured as a multi-project Visual Studio solution split into Common, Database, Model, Setup, Resources, Serialization and Presentation layers. The largest early piece of business software on the account.",
  },

  NiBase: {
    type: "desktop-app",
    categories: ["business software", "desktop", "database"],
    status: "complete",
    role: "contract",
    tech_stack: ["C#", ".NET Framework"],
    summary: "A custom desktop database management system built for a client, Nilgün Irmak.",
    client: "Nilgün Irmak",
  },

  // ── Terminal games ────────────────────────────────────────────────────────

  SnakeTermRS: {
    type: "game",
    categories: ["terminal", "game development", "tooling"],
    status: "complete",
    role: "personal",
    tech_stack: ["Rust 1.70+", "clap", "TOML"],
    summary:
      "A feature-heavy terminal Snake in Rust. Singleplayer and local two-player on one keyboard, colored rendering, progressive speed, bonus food, random obstacles, shrinking-border and wrap-around modes, a death animation, game recording and replay, a TOML config file and persistent high scores. Glyphs, speed, RNG seed and map size are all configurable from CLI flags.",
    related: ["SnakeTerm"],
  },

  SnakeTerm: {
    type: "game",
    categories: ["terminal", "game development"],
    status: "complete",
    role: "learning",
    tech_stack: ["C++", "CMake", "terminal I/O"],
    summary:
      "A compact configurable terminal Snake in C++, with WASD and arrow controls, runtime settings through CLI flags for speed, glyphs, map size and border behavior, and wrap-around mode. The C++ original that SnakeTermRS later reimplements in Rust.",
    related: ["SnakeTermRS"],
  },

  // ── Notes, config and profile ─────────────────────────────────────────────

  CanReader: {
    type: "profile",
    categories: ["personal"],
    status: "maintained",
    role: "personal",
    tech_stack: ["Markdown", "GitHub Actions"],
    summary: "The GitHub profile README: bio, skills, badges and project highlights.",
  },

  MyObsidianNotes: {
    type: "notes",
    categories: ["personal", "knowledge base"],
    status: "dormant",
    role: "personal",
    tech_stack: ["Obsidian", "Markdown"],
    summary: "Personal Obsidian vault kept in the cloud as a backup.",
  },

  "DX11-TUTS-NOTES": {
    type: "notes",
    categories: ["learning", "graphics"],
    status: "complete",
    role: "learning",
    tech_stack: ["Obsidian", "Markdown", "DirectX 11"],
    summary: "DirectX 11 tutorial notes written in Obsidian while learning the API.",
  },

  hyprlandConfig: {
    type: "config",
    categories: ["devtools", "Linux"],
    status: "maintained",
    role: "personal",
    tech_stack: ["Hyprland", "Shell", "Lua", "Vim Script", "Go templates"],
    summary: "Backup of the personal Hyprland Wayland compositor configuration, kept so it cannot be lost.",
  },

  LeetCodeSolutions: {
    type: "study",
    categories: ["algorithms & data structures", "learning"],
    status: "dormant",
    role: "learning",
    tech_stack: ["C++", "Python", "Shell"],
    summary: "Personal LeetCode solutions, mostly in C++.",
  },

  // ── Forks (upstream code, kept for reference or local patches) ────────────

  excalidraw: { type: "fork", categories: ["tooling"], status: "dormant", role: "fork", summary: "Fork of excalidraw/excalidraw, the hand-drawn style virtual whiteboard.", upstream: "excalidraw/excalidraw" },
  renderdoc: { type: "fork", categories: ["graphics", "tooling"], status: "dormant", role: "fork", summary: "Fork of baldurk/renderdoc, the stand-alone graphics debugger.", upstream: "baldurk/renderdoc" },
  "SPIRV-Tools": { type: "fork", categories: ["graphics", "tooling"], status: "dormant", role: "fork", summary: "Fork of KhronosGroup/SPIRV-Tools, the SPIR-V assembler, validator and optimizer.", upstream: "KhronosGroup/SPIRV-Tools" },
  LLGL: { type: "fork", categories: ["graphics"], status: "dormant", role: "fork", summary: "Fork of LukasBanana/LLGL, a thin abstraction over OpenGL, Direct3D, Vulkan and Metal.", upstream: "LukasBanana/LLGL" },
  "unreal-mcp": { type: "fork", categories: ["tooling", "Unreal Engine", "AI"], status: "dormant", role: "fork", summary: "Fork of a Model Context Protocol server that lets AI assistants drive Unreal Engine in natural language.", upstream: "chongdashu/unreal-mcp" },
  "github-readme-stats": { type: "fork", categories: ["tooling"], status: "dormant", role: "fork", summary: "A private copy of anuraghazra/github-readme-stats, deployed to Vercel so the profile README renders its stat cards off a personal instance rather than the shared one.", upstream: "anuraghazra/github-readme-stats", related: ["CanReader"] },
  "github-profile-trophy": { type: "fork", categories: ["tooling"], status: "dormant", role: "fork", summary: "A private copy of ryo-ma/github-profile-trophy, deployed to Vercel to render the trophy row on the profile README.", upstream: "ryo-ma/github-profile-trophy", related: ["CanReader"] },
  "Numpy-Tutorial-SciPyConf-2019": { type: "fork", categories: ["learning", "AI / machine learning"], status: "dormant", role: "fork", summary: "Fork of the SciPy 2019 NumPy tutorial material.", upstream: "enthought/Numpy-Tutorial-SciPyConf-2019" },
};
