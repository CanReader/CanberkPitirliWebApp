// CV layer: how each repository gets sold, as opposed to what it is.
//
// scripts/repo-annotations.js answers "what is this project". This file answers
// "which jobs does it help me win, and what exactly do I put on the page".
// Kept separate because the two change for different reasons: annotations
// change when the code changes, this file changes when the job hunt changes.
//
// Every number in `metrics` and every claim in `cv_bullets` traces to something
// real in the repository. Nothing here is estimated, rounded up, or inferred.
// If a metric is not measured, it is not listed.
//
// cv_tier          headline  | supporting | omit   (default: omit)
//                  headline    goes on a one-page CV for a matching role
//                  supporting  goes in the portfolio appendix / long CV
//                  omit        never appears on a CV
//
// role_relevance   0-5 per role family. Only non-zero entries are listed.
//                  Roles: game-dev, engine-graphics, systems, backend,
//                  fullstack, frontend, distributed, ml-ai, gpu, devops,
//                  mobile, desktop, tooling-devex, embedded, teaching
//
// cv_bullets       Drop-in CV lines. Action verb first, specific, quantified
//                  where a real number exists. Written to be pasted verbatim.
//
// transferable_framing
//                  Rewrites of the same work for an audience that does not
//                  care about the original domain. Present only where the
//                  reframing genuinely changes how the work reads.

export const cv = {
  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE, GRAPHICS AND GAME
  // ══════════════════════════════════════════════════════════════════════════

  SleakEngine: {
    cv_tier: "headline",
    role_relevance: { "engine-graphics": 5, "game-dev": 5, systems: 5, gpu: 4, "tooling-devex": 3, desktop: 2 },
    metrics: [
      "4 graphics backends (DirectX 11, DirectX 12, Vulkan, OpenGL) behind one interface",
      "C++23, ~25 MB source tree",
      "3 platforms: Windows, Linux, macOS",
      "Zero external package managers: every dependency vendored",
    ],
    keywords: ["C++23", "game engine", "DirectX 12", "Vulkan", "OpenGL", "ECS", "entity component system", "CMake", "SDL3", "rendering", "graphics programming", "cross-platform", "abstraction layer", "software architecture"],
    cv_bullets: [
      "Architected a cross-platform 3D game engine in C++23 with four interchangeable graphics backends (DirectX 11, DirectX 12, Vulkan, OpenGL) selected at runtime through a single abstract rendering interface.",
      "Designed the engine around a component-based ECS with lifecycle hooks, parent-child hierarchies and tag-based queries, plus state-driven scene management and fixed-timestep physics at 60 Hz.",
      "Built a deferred command queue that batches draw submission into order-independent passes, keeping the renderer decoupled from backend-specific command semantics.",
      "Implemented the supporting layer from scratch, including custom smart pointers, containers and math, and vendored every dependency so the engine builds from a clean clone with CMake alone.",
    ],
    transferable_framing: {
      backend: "Designed a plugin architecture where four incompatible third-party implementations are swapped at runtime behind one stable interface, a pattern that maps directly to storage, payment or messaging provider abstraction.",
      systems: "Owned a 25 MB C++23 codebase end to end: memory ownership model, container library, build system and public API surface, with no framework doing the hard parts.",
      "tooling-devex": "Removed the entire dependency-management burden from consumers by vendoring and wiring every third-party library, so a new developer goes from clone to running build with one CMake command.",
    },
  },

  SleakCraft: {
    cv_tier: "headline",
    role_relevance: { "game-dev": 5, "engine-graphics": 5, gpu: 4, systems: 4, backend: 1 },
    metrics: [
      "16x16x16 chunk streaming on background worker threads",
      "6 procedurally generated biomes from continental noise",
      "15 block types in a runtime-built texture atlas",
      "MSAA up to 8x, PCF shadow mapping",
      "RLE-compressed binary save format",
    ],
    keywords: ["voxel", "procedural generation", "multithreading", "C++23", "shaders", "HLSL", "GLSL", "chunk streaming", "Perlin noise", "collision detection", "AABB", "graphics optimization", "texture atlas", "benchmarking"],
    cv_bullets: [
      "Built a voxel sandbox game on a custom C++23 engine, with multi-threaded chunk streaming that generates, meshes and uploads 16x16x16 terrain chunks on background workers without stalling the render thread.",
      "Implemented procedural world generation from continental noise producing six distinct biomes with oceans, rivers, lakes, beaches and mountains, all reproducible from a seed.",
      "Wrote a physically motivated water renderer combining Gerstner wave displacement, Fresnel reflection and Beer-Lambert depth absorption, rendered in a separate alpha-blended pass.",
      "Cut draw call volume by meshing only air-to-solid boundary faces, and shipped a built-in benchmark recorder that emits frame time statistics for regression tracking.",
    ],
    transferable_framing: {
      backend: "Built a producer-consumer pipeline where background worker threads generate and publish data to a renderer thread under strict latency constraints, with foreground synchronization on user interaction.",
      systems: "Profiled and optimized a soft-real-time C++ application to a 16 ms frame budget, including memory layout, threading model and a custom RLE binary serialization format.",
    },
  },

  Tactix: {
    cv_tier: "headline",
    role_relevance: { "game-dev": 5, "engine-graphics": 2, systems: 4, "ml-ai": 2, "tooling-devex": 4 },
    metrics: [
      "5 AI paradigms in one plugin: Utility AI, GOAP, HTN, influence maps, squad coordination",
      "4 strictly layered modules with one-way dependencies",
      "Zero Unreal headers in the core public API",
      "Unit tested under Google Test with no editor process",
    ],
    keywords: ["Unreal Engine 5", "C++", "game AI", "GOAP", "HTN", "utility AI", "behavior trees", "EQS", "influence maps", "pathfinding", "plugin development", "unit testing", "Google Test", "memory pooling", "API design"],
    cv_bullets: [
      "Designed and shipped a tactical AI plugin for Unreal Engine 5 unifying Utility AI, GOAP, HTN planning, cover reasoning, influence maps and squad formations under one coherent architecture.",
      "Isolated the entire decision-making core behind zero Unreal dependencies so it compiles standalone and runs under Google Test without launching the editor, making game AI genuinely unit-testable.",
      "Engineered for frame budget using pooled and arena allocation, handle-based agent references, no UObject in the hot path, and a frame-budgeted scheduler that amortizes planning across ticks.",
      "Exposed the system to designers through data assets and drop-in Behavior Tree and EQS nodes, with debug overlays, a profiler, a decision recorder and a custom Gameplay Debugger tab.",
    ],
    transferable_framing: {
      backend: "Built a rules and planning engine with pluggable strategies, decoupled from its host runtime by a strict layering rule, and covered by a unit test suite that runs headless in CI.",
      systems: "Eliminated allocation from the hot path using pooled and arena memory with handle-based indirection, and enforced a frame-time budget through cooperative scheduling.",
      "tooling-devex": "Turned a system that previously required engineer time into a designer-facing toolkit, with data-asset configuration, visual debugging and a decision recorder for postmortem analysis.",
    },
  },

  StealthDemo: {
    cv_tier: "headline",
    role_relevance: { "game-dev": 5, "ml-ai": 1, systems: 2 },
    metrics: [
      "8-state enemy awareness model",
      "3 mission levels with escalating AI difficulty",
      "Sight and hearing perception via UE AI Perception",
    ],
    keywords: ["Unreal Engine 5.5", "C++", "Blueprint", "behavior trees", "blackboard", "EQS", "AI perception", "state machine", "gameplay programming", "Enhanced Input", "stealth mechanics"],
    cv_bullets: [
      "Built a third-person stealth game in Unreal Engine 5.5 and C++ with an eight-state enemy awareness model spanning Unaware, Suspicious, Investigating, Alerted, Engaging, LostTarget, Searching and ReturningToPatrol.",
      "Implemented reactive AI using Behavior Tree decorators with observer aborts, so enemies interrupt and re-plan mid-action instead of finishing a stale task before reacting.",
      "Wrote the performance-sensitive AI logic as native C++ Behavior Tree tasks with blackboard-monitoring services, keeping per-agent tick cost predictable across three levels of increasing enemy density.",
      "Integrated sight and hearing through UE AI Perception, driving security cameras with independent sweep, investigate and alert states alongside patrolling robots.",
    ],
  },

  RustVK: {
    cv_tier: "headline",
    role_relevance: { "engine-graphics": 5, gpu: 5, systems: 4, "game-dev": 3 },
    metrics: [
      "Raw Vulkan via ash, no wgpu or vulkano abstraction",
      "4x MSAA through a 3-attachment render pass",
      "2 frames in flight with per-frame command and uniform buffers",
      "GLSL to SPIR-V compiled at build time from build.rs",
    ],
    keywords: ["Vulkan", "Rust", "ash", "SPIR-V", "GLSL", "MSAA", "render pass", "swapchain", "semaphores", "synchronization", "Blinn-Phong", "staging buffer", "RAII", "graphics programming", "validation layers"],
    cv_bullets: [
      "Wrote a Vulkan renderer in Rust directly against raw ash bindings with no intermediate abstraction, giving every Vulkan object a typed owner destroyed deterministically through Drop.",
      "Diagnosed and fixed a GPU fault caused by indexing render_finished semaphores per frame rather than per swapchain image, resolving VUID-vkQueueSubmit-pSignalSemaphores-00067 once image count exceeded frames in flight.",
      "Implemented 4x MSAA across a three-attachment render pass, staging-buffer uploads into DEVICE_LOCAL memory, swapchain recreation on resize and automatic validation layers in debug builds.",
      "Compiled GLSL to SPIR-V at build time from build.rs while checking in prebuilt artifacts, so contributors can build without installing the Vulkan SDK.",
    ],
    transferable_framing: {
      systems: "Debugged a class of failure that only appears under specific hardware configurations, tracing a GPU fault to an incorrect synchronization primitive lifetime and proving the fix against the specification.",
    },
  },

  ASCIIRenderer: {
    cv_tier: "headline",
    role_relevance: { "engine-graphics": 5, systems: 4, backend: 3, fullstack: 4, frontend: 3 },
    metrics: [
      "Full software rasterizer: no GPU, no OpenGL, no WebGL",
      "30 FPS streamed to the browser over WebSocket",
      "7 shading modes, 6 charsets, 6 color profiles",
      "4 model formats: OBJ, glTF, GLB, FBX",
    ],
    keywords: ["Rust", "software rasterizer", "3D graphics", "z-buffer", "barycentric interpolation", "Blinn-Phong", "perspective projection", "WebSocket", "Axum", "tokio", "React", "TypeScript", "HTML5 Canvas", "real-time streaming"],
    cv_bullets: [
      "Implemented a complete 3D software rasterizer from scratch in Rust including perspective projection, z-buffering, barycentric attribute interpolation and Blinn-Phong shading, with no GPU involved at any stage.",
      "Streamed rendered frames to the browser as per-character RGB ASCII at 30 FPS over WebSocket, rendered onto an HTML5 canvas with drag-to-rotate and a live control panel.",
      "Built the backend as a single Axum binary on tokio that also serves the Vite-built React frontend as static assets, making deployment one artifact with no separate web server.",
      "Shared Rust types with the TypeScript frontend through ts-rs so the wire protocol cannot drift between client and server.",
    ],
    transferable_framing: {
      backend: "Built a low-latency WebSocket streaming service in Rust on Axum and tokio, holding per-connection state in DashMap and sustaining 30 messages per second per client.",
      fullstack: "Owned the entire stack: Rust rendering core, Axum WebSocket transport, generated TypeScript bindings and a React control surface, deployed as a single binary.",
    },
  },

  Brokeout: {
    cv_tier: "supporting",
    role_relevance: { "game-dev": 3, "engine-graphics": 3, gpu: 2 },
    metrics: ["3 levels, 5x combo multiplier", "Cross-platform on Linux, macOS and Windows"],
    keywords: ["OpenGL", "C++", "GLFW", "GLM", "Assimp", "CMake", "game physics", "collision detection", "texture mapping", "cross-platform"],
    cv_bullets: [
      "Built a 3D Breakout game in C++ and OpenGL with angle-based ball deflection driven by paddle contact point, a combo multiplier reaching 5x and drop-based power-ups.",
      "Implemented two-stage brick destruction with crack-then-break animation states and cross-platform builds via CMake across Linux, macOS and Windows.",
    ],
  },

  "DX11-TerrainTesellatorDemo": {
    cv_tier: "supporting",
    role_relevance: { "engine-graphics": 4, gpu: 4, "game-dev": 3 },
    metrics: ["Hardware tessellation via Hull and Domain shader stages", "Dual build: Visual Studio solution and CMake"],
    keywords: ["DirectX 11", "HLSL", "tessellation", "hull shader", "domain shader", "heightmap", "terrain rendering", "DirectXTK", "GPU pipeline"],
    cv_bullets: [
      "Generated high-detail terrain from heightmaps using DirectX 11 hardware tessellation, driving the Hull and Domain shader stages directly from HLSL.",
      "Separated the codebase into a reusable engine layer and a terrain application layer, buildable from either a Visual Studio solution or CMake.",
    ],
  },

  ProjectDX: {
    cv_tier: "supporting",
    role_relevance: { "engine-graphics": 3, "game-dev": 2 },
    metrics: ["Engine and application layers separated across a Visual Studio solution"],
    keywords: ["DirectX", "C++", "MSBuild", "Visual Studio", "engine architecture"],
    cv_bullets: [
      "Prototyped a DirectX rendering engine in C++ with a deliberate split between reusable engine code and the consuming application layer.",
    ],
  },

  Shotia: {
    cv_tier: "supporting",
    role_relevance: { "game-dev": 3, distributed: 1 },
    metrics: ["31 commits within a single month of development"],
    keywords: ["Unreal Engine", "C++", "multiplayer", "online sessions", "weapon systems", "HUD"],
    cv_bullets: [
      "Built a multiplayer shooter in Unreal Engine and C++ with primary and secondary weapon slots, a grenade system with HUD counters and online matchmaking through the MultiplayerSessions plugin.",
    ],
  },

  ProcTile: {
    cv_tier: "headline",
    role_relevance: { "game-dev": 5, "tooling-devex": 4, "engine-graphics": 3 },
    metrics: ["Delivered as a packaged .uplugin with Source, Docs and Resources", "Deterministic generation from a seed"],
    keywords: ["Unreal Engine 5", "C++", "procedural generation", "plugin development", "contract work", "terrain generation", "designer tooling"],
    cv_bullets: [
      "Delivered a procedural tile and terrain generation plugin for Unreal Engine 5 as contract work for a commercial game studio, built from scratch in C++.",
      "Made generation deterministic from a seed and fast enough for runtime use, so designers shape worlds directly without touching code.",
      "Packaged the work as a distributable .uplugin with documentation and editor resources, shipped to the client for integration into an unannounced title.",
    ],
    transferable_framing: {
      "tooling-devex": "Delivered a paid engineering tool to an external client on their timeline, designed so non-programmers operate it independently and documented for handover.",
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // AI, MACHINE LEARNING AND GPU
  // ══════════════════════════════════════════════════════════════════════════

  FastNN: {
    cv_tier: "headline",
    role_relevance: { "ml-ai": 5, gpu: 5, systems: 5, backend: 2 },
    metrics: [
      "Hand-written CUDA kernels with cuBLAS SGEMM on TF32 tensor cores",
      "15+ layer types including LSTM, GRU, multi-head attention and Transformer encoder",
      "Supports Volta through Hopper GPU architectures",
      "Published to crates.io with CUDA behind an optional feature flag",
    ],
    keywords: ["Rust", "CUDA", "deep learning", "cuBLAS", "automatic differentiation", "autograd", "GPU programming", "tensor cores", "TF32", "neural networks", "transformer", "LSTM", "Adam", "safetensors", "high performance computing"],
    cv_bullets: [
      "Built a deep learning framework from scratch in Rust with hand-written CUDA kernels, implementing tape-based reverse-mode automatic differentiation and automatic CPU/GPU device dispatch.",
      "Accelerated matrix operations through cuBLAS SGEMM on TF32 tensor cores with RAII-managed device memory, supporting GPU architectures from Volta through Hopper.",
      "Implemented over fifteen layer types including conv2d, LSTM, GRU, multi-head attention and a full Transformer encoder, alongside SGD/Adam/AdamW optimizers, LR schedulers and a DataLoader.",
      "Designed the API so a complete training loop needs no gradient-mode flags and no borrow-checker workarounds around the optimizer, and shipped it on crates.io with CUDA optional so CPU users need no toolkit.",
    ],
    transferable_framing: {
      systems: "Wrote GPU kernels and a memory ownership model in Rust interoperating with C and CUDA through FFI, with RAII guaranteeing device memory is never leaked across an unwind.",
      backend: "Published and versioned a public Rust crate with feature-gated optional dependencies, so consumers compile only the backend they need.",
    },
  },

  tinylm: {
    cv_tier: "headline",
    role_relevance: { "ml-ai": 5, backend: 3, systems: 3, "tooling-devex": 3 },
    metrics: [
      "Byte-level GPTs from ~1M to ~11M parameters",
      "256-token fixed vocabulary, so any file round-trips losslessly",
      "Single binary: train, generate and serve, with zero Python",
    ],
    keywords: ["Rust", "large language models", "LLM", "GPT", "transformer", "tokenization", "model serving", "HTTP API", "CUDA", "checkpointing", "inference", "CLI"],
    cv_bullets: [
      "Built an end-to-end language model toolchain in Rust that trains, samples and serves transformer models from a single binary with no Python runtime anywhere in the stack.",
      "Implemented a causal pre-norm transformer over a byte-level tokenizer, fixing the vocabulary at 256 so any input file round-trips losslessly and no vocabulary artifact needs versioning.",
      "Made training interruption-safe by checkpointing weights, architecture and full optimizer state separately, so a resumed run costs at most a few hundred steps and never emits an oversized first update.",
      "Exposed inference over an HTTP endpoint with temperature, top-k and top-p sampling controls, returning structured 400 responses on invalid parameters rather than failing the process.",
    ],
    transferable_framing: {
      backend: "Shipped a self-contained inference service with a JSON HTTP API, explicit input validation and structured error responses, deployable as one binary with no runtime dependencies.",
    },
  },

  "fastnn-visualizer": {
    cv_tier: "headline",
    role_relevance: { "ml-ai": 4, fullstack: 4, frontend: 3, backend: 3 },
    metrics: [
      "Trains and serves inside one Rust process, no Python and no inference server",
      "Renders the 200 strongest weight-times-activation edges live",
      "Hot model swap with zero prediction downtime",
    ],
    keywords: ["Rust", "machine learning", "MNIST", "data visualization", "neural network", "web application", "Axum", "HTML5 Canvas", "data augmentation", "model serving", "real-time inference"],
    cv_bullets: [
      "Built a web application that trains an MNIST classifier and visualizes the live network graph as it predicts, with node brightness mapped to activation magnitude and the 200 strongest contributions drawn as signed edges.",
      "Ran training with live augmentation and inference inside a single Rust process, eliminating Python, external ML backends and any separate inference server from the deployment.",
      "Implemented hot model swapping so users retrain with a new architecture from the browser while the previous model keeps serving predictions until the replacement atomically takes over.",
      "Diagnosed a systematic misclassification by replicating MNIST preprocessing exactly: bounding-box crop, scale to a 20 pixel longest side, then center-of-mass alignment inside the 28x28 frame.",
    ],
    transferable_framing: {
      backend: "Implemented zero-downtime model deployment through atomic hot swap, keeping the previous version serving traffic until the replacement is fully warm.",
    },
  },

  "tinyml-rs": {
    cv_tier: "headline",
    role_relevance: { "ml-ai": 4, embedded: 5, systems: 5, gpu: 2 },
    metrics: [
      "no_std with zero heap allocation at inference time",
      "14 operators including Conv2d, DepthwiseConv2d and GlobalAvgPool2d",
      "4 target families: ARM thumbv7em, RISC-V, WASM and CUDA",
      "INT8 affine quantization with zero-copy weight loading",
    ],
    keywords: ["Rust", "no_std", "embedded systems", "TinyML", "edge AI", "quantization", "INT8", "ARM Cortex-M", "RISC-V", "WebAssembly", "CUDA", "arena allocator", "inference engine", "microcontroller", "IoT"],
    cv_bullets: [
      "Built a no_std machine learning inference runtime for microcontrollers that performs zero heap allocation at inference time, using a static arena bump allocator sized at compile time.",
      "Implemented INT8 affine quantization and zero-copy weight loading from a compact custom binary format, so models map straight out of flash with no deserialization pass.",
      "Targeted ARM thumbv7em, RISC-V, WebAssembly and CUDA from a single codebase, with fourteen operators covering convolution, depthwise convolution, pooling and the standard activation set.",
      "Dual-licensed under MIT and Apache-2.0 to match Rust ecosystem convention and remove adoption friction for commercial users.",
    ],
    transferable_framing: {
      systems: "Engineered under hard memory constraints where dynamic allocation is unavailable, using arena allocation and NHWC layout chosen specifically for cache behavior on cacheless targets.",
    },
  },

  "Evo-Engine": {
    cv_tier: "headline",
    role_relevance: { "ml-ai": 4, systems: 3, backend: 1 },
    metrics: [
      "5 algorithms: GA, 3 Differential Evolution strategies, CMA-ES, NSGA-II, island model",
      "6 crossover, 4 mutation and 3 selection operators, all interchangeable",
      "3 genome representations: real, binary and permutation",
    ],
    keywords: ["Rust", "genetic algorithm", "evolutionary computation", "CMA-ES", "NSGA-II", "multi-objective optimization", "differential evolution", "Rayon", "parallel computing", "optimization", "benchmarking", "Serde"],
    cv_bullets: [
      "Designed an evolutionary computation framework in Rust implementing genetic algorithms, three Differential Evolution strategies, CMA-ES, NSGA-II multi-objective optimization and an island model with ring migration.",
      "Built a fully pluggable operator system where six crossover, four mutation and three selection strategies compose freely across real, binary and permutation genomes.",
      "Parallelized population evaluation behind a Rayon feature flag and validated convergence against a standard benchmark suite covering Rastrigin, Rosenbrock, TSP and Knapsack.",
    ],
    transferable_framing: {
      backend: "Designed a strategy-pattern library where algorithms and operators compose without modification, with optional parallelism gated behind a feature flag so single-threaded consumers pay nothing.",
    },
  },

  SimpleCNN: {
    cv_tier: "supporting",
    role_relevance: { "ml-ai": 3, gpu: 4, systems: 3 },
    metrics: ["Identical CPU and GPU implementations validated element-wise against each other", "CUDA unified memory via cudaMallocManaged"],
    keywords: ["C++", "CUDA", "neural networks", "GPU acceleration", "unified memory", "atomic operations", "CMake", "unit testing"],
    cv_bullets: [
      "Built a C++ neural network library with native CUDA acceleration, shipping identical CPU and GPU implementations of every module so results can be validated element-wise against each other.",
      "Used CUDA unified memory and atomic operations in custom kernels, backed by a unit test suite that diffs CPU against GPU output to catch numerical divergence.",
    ],
  },

  TensorBench: {
    cv_tier: "headline",
    role_relevance: { gpu: 5, "ml-ai": 3, systems: 4, devops: 2 },
    metrics: [
      "6 benchmark suites including a roofline model analysis",
      "Stress tested to 12288x12288 matrices",
      "Reports mean, standard deviation and percentile statistics per run",
      "Mixed precision FP16/FP32 comparison against a cuBLAS baseline",
    ],
    keywords: ["CUDA", "cuBLAS", "GPU benchmarking", "performance analysis", "mixed precision", "FP16", "roofline model", "memory bandwidth", "strong scaling", "thermal throttling", "profiling", "C++"],
    cv_bullets: [
      "Built a CUDA benchmarking suite for GPU tensor operations spanning six test classes, from a cuBLAS baseline and naive kernel comparison through mixed precision analysis to roofline modeling.",
      "Stress tested GPU throughput up to 12288x12288 matrices with strong scaling analysis across batched operations, emitting CSV reports carrying mean, standard deviation and percentile statistics.",
      "Instrumented the suite to surface thermal throttling risk scores, cache miss estimates and measured memory bandwidth, so results distinguish real algorithmic gains from thermal artifacts.",
    ],
    transferable_framing: {
      devops: "Built a reproducible performance measurement harness emitting machine-readable CSV with statistical rigor, suitable for tracking regressions across hardware and driver versions in CI.",
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // BACKEND, DISTRIBUTED SYSTEMS AND NETWORKING
  // ══════════════════════════════════════════════════════════════════════════

  "raft-kv": {
    cv_tier: "headline",
    role_relevance: { distributed: 5, backend: 5, systems: 5, devops: 2 },
    metrics: [
      "Raft consensus implemented from scratch, no third-party consensus crate",
      "5-crate workspace with an I/O-free core",
      "3-node cluster with durable RocksDB state",
      "Chunked InstallSnapshot RPC for log compaction",
    ],
    keywords: ["Rust", "Raft", "consensus", "distributed systems", "gRPC", "tonic", "protobuf", "RocksDB", "tokio", "leader election", "log replication", "snapshotting", "fault tolerance", "replication", "CAP theorem"],
    cv_bullets: [
      "Implemented the Raft consensus algorithm from scratch in Rust, covering leader election with randomized timeouts and pre-vote, log replication with fast term-skipping backtracking, and automatic snapshotting with log compaction.",
      "Architected the system as a five-crate workspace where the consensus core carries zero I/O dependencies, making the protocol logic deterministically testable without network or disk.",
      "Built durable state on RocksDB with bincode serialization and transferred snapshots through chunked InstallSnapshot RPCs over tonic gRPC, keeping memory bounded regardless of log size.",
      "Added pre-vote to prevent partitioned nodes from triggering disruptive elections on rejoin, and shipped a CLI client with get, put, delete, status and benchmark commands against a live 3-node cluster.",
    ],
    transferable_framing: {
      backend: "Built a fault-tolerant replicated data store with durable storage, gRPC transport and a protocol core designed for deterministic testing, demonstrating the failure reasoning that production distributed systems require.",
    },
  },

  "titan-server": {
    cv_tier: "headline",
    role_relevance: { backend: 5, distributed: 4, "game-dev": 3, devops: 3 },
    metrics: [
      "7 services under a clean architecture",
      "20 Hz authoritative WebSocket game loop",
      "PostgreSQL 16, Redis 7 and NATS 2 in one Docker Compose stack",
      "O(log N) leaderboard ranking on Redis sorted sets",
    ],
    keywords: ["Go", "backend", "microservices", "WebSocket", "PostgreSQL", "Redis", "NATS", "pub/sub", "JWT", "bcrypt", "Prometheus", "observability", "concurrency", "goroutines", "worker pool", "Docker Compose", "clean architecture", "matchmaking", "ELO"],
    cv_bullets: [
      "Built a production-shaped game backend in Go with seven services under a clean architecture: authentication, matchmaking, game sessions, leaderboards, inventory, chat and metrics.",
      "Implemented a 20 Hz authoritative game loop over WebSocket using sync.Map, buffered channels and time.Ticker, alongside ELO matchmaking on a fan-out/fan-in worker pool with time-decay tolerance.",
      "Eliminated deadlocks in concurrent item trading through ordered lock acquisition and SELECT FOR UPDATE inside PostgreSQL transactions.",
      "Instrumented the service with Prometheus metrics, pprof endpoints and health probes, backed by Redis sessions and rate limiting plus NATS pub/sub for chat with asynchronous persistence.",
    ],
    transferable_framing: {
      backend: "Delivered a multi-service Go backend integrating PostgreSQL, Redis and NATS with JWT dual-token authentication, Prometheus observability and full Docker Compose infrastructure.",
      devops: "Containerized a seven-service stack with database migrations, health probes, Prometheus scraping and pprof profiling wired in from the start rather than retrofitted.",
    },
  },

  Flux: {
    cv_tier: "headline",
    role_relevance: { backend: 5, systems: 4, distributed: 2 },
    metrics: [
      "Built directly on hyper 1.x, tokio and tower with no framework underneath",
      "HTTP/1.1 and HTTP/2 support via hyper-util",
      "3 built-in middleware layers: Logger, CORS and Timeout",
    ],
    keywords: ["Rust", "HTTP framework", "hyper", "tokio", "tower", "middleware", "REST API", "type safety", "extractors", "async", "HTTP/2", "graceful shutdown", "serde", "API design"],
    cv_bullets: [
      "Built a type-safe HTTP framework for Rust directly on hyper, tokio and tower, implementing extractors for JSON, path parameters, query strings and shared state with compile-time guarantees.",
      "Designed an IntoResponse trait so handlers return arbitrary types, and integrated first-class tower middleware for logging, CORS and timeouts without a bespoke middleware system.",
      "Implemented named path parameters, wildcard matching, sub-router nesting, dependency-injected shared state and graceful shutdown, with structured errors serializing to consistent JSON.",
    ],
    transferable_framing: {
      backend: "Implemented the request routing, extraction, middleware and error-serialization layers that most engineers only consume, giving working knowledge of what happens beneath Express, FastAPI or Axum.",
    },
  },

  "product-catalog": {
    cv_tier: "headline",
    role_relevance: { backend: 5, distributed: 3, devops: 2 },
    metrics: [
      "All 4 gRPC patterns in one service: unary, server streaming, client streaming, bidirectional",
      "FieldMask partial updates with pagination",
      "JWT authentication via interceptors",
    ],
    keywords: ["Go", "gRPC", "protobuf", "Buf", "microservices", "streaming", "JWT", "interceptors", "slog", "FieldMask", "pagination", "clean architecture", "API design", "pub/sub"],
    cv_bullets: [
      "Built a Go gRPC microservice exercising all four RPC patterns: unary CRUD with FieldMask partial updates and pagination, server-streaming change notifications, client-streaming batch inventory updates and bidirectional streaming search.",
      "Implemented JWT authentication as gRPC interceptors alongside panic recovery middleware and structured logging through slog, keeping cross-cutting concerns out of handler code.",
      "Managed protobuf schemas with the Buf CLI under a layered architecture separating transport, service and repository concerns.",
    ],
  },

  "todo-api": {
    cv_tier: "headline",
    role_relevance: { backend: 5, fullstack: 3, devops: 3 },
    metrics: [
      "Go 1.25 with PostgreSQL 17 and multi-stage Docker builds",
      "Full-text search with multi-column sorting and pagination",
      "Unit tests against mock repositories plus httptest integration tests",
      "Swagger UI generated from source annotations",
    ],
    keywords: ["Go", "REST API", "PostgreSQL", "pgx", "JWT", "chi", "golang-migrate", "Swagger", "OpenAPI", "Docker", "Docker Compose", "clean architecture", "dependency injection", "integration testing", "full-text search", "pagination"],
    cv_bullets: [
      "Built a production-grade REST API in Go with JWT authentication, paginated listing, PostgreSQL full-text search, multi-column sorting and bulk operations.",
      "Structured the service under clean architecture with repository interfaces, a service layer, DTOs and constructor dependency injection, enabling unit tests against mocks and integration tests through httptest.",
      "Shipped versioned database migrations with golang-migrate, request validation through go-playground/validator, Swagger UI generated from source annotations and multi-stage Docker builds.",
    ],
  },

  p2pFileShare: {
    cv_tier: "headline",
    role_relevance: { distributed: 5, backend: 4, systems: 3 },
    metrics: [
      "Kademlia DHT with a 160-bit ID space and K=20 buckets",
      "256 KB chunked transfers with SHA-256 verification per chunk",
      "Java 21 virtual threads (Project Loom) for concurrent downloads",
    ],
    keywords: ["Java 21", "peer-to-peer", "P2P", "Kademlia", "DHT", "distributed hash table", "Project Loom", "virtual threads", "SHA-256", "Javalin", "REST API", "Gradle", "concurrency", "file transfer", "XOR distance"],
    cv_bullets: [
      "Built a decentralized peer-to-peer file sharing system in Java 21 with peer discovery over a Kademlia DHT using a 160-bit ID space, XOR distance metric and K=20 routing buckets.",
      "Implemented chunked file transfer at 256 KB granularity with per-chunk SHA-256 integrity verification, so corrupted segments are detected and refetched without restarting the transfer.",
      "Parallelized downloads on Project Loom virtual threads, scaling concurrent chunk fetches well past what a bounded thread pool allows.",
      "Separated the system into a dependency-free core library and a Javalin REST API module, so any language can drive a node over HTTP.",
    ],
    transferable_framing: {
      backend: "Designed a decentralized system with no coordinating server, requiring routing, integrity verification and failure handling to be solved in the protocol itself.",
    },
  },

  GoChat: {
    cv_tier: "headline",
    role_relevance: { backend: 5, distributed: 3, mobile: 4, fullstack: 4, systems: 2 },
    metrics: [
      "3 clients across 3 languages: Go server, Rust TUI, Kotlin Android",
      "WebSocket with typing indicators, presence tracking and rate limiting",
      "Exponential backoff reconnection on mobile",
    ],
    keywords: ["Go", "WebSocket", "real-time", "PostgreSQL", "JWT", "Rust", "ratatui", "Kotlin", "Jetpack Compose", "MVVM", "OkHttp", "Retrofit", "broadcasting", "presence", "rate limiting", "cross-platform"],
    cv_bullets: [
      "Built a real-time chat platform with a Go WebSocket server handling JWT authentication, PostgreSQL persistence, broadcast fan-out, typing indicators, presence tracking and rate limiting.",
      "Wrote two native clients against the same protocol: a Rust terminal UI on ratatui and crossterm, and an Android client in Jetpack Compose following MVVM.",
      "Implemented resilient mobile connectivity with OkHttp WebSocket reconnection under exponential backoff, plus Retrofit for the REST authentication flow.",
    ],
    transferable_framing: {
      fullstack: "Delivered one backend protocol consumed by three independently written clients in Go, Rust and Kotlin, proving the API contract holds across languages and platforms.",
    },
  },

  FocusKingdomServer: {
    cv_tier: "headline",
    role_relevance: { backend: 5, fullstack: 4, devops: 3, "game-dev": 2 },
    metrics: [
      "TypeScript on Node 20 with PM2 process management in production",
      "Socket.IO real-time multiplayer alongside an Express REST layer",
      "Sentry error reporting and versioned PostgreSQL migrations",
    ],
    keywords: ["TypeScript", "Node.js", "Express", "Socket.IO", "PostgreSQL", "JWT", "bcrypt", "nodemailer", "Sentry", "PM2", "REST API", "real-time", "migrations", "backend", "production deployment"],
    cv_bullets: [
      "Rewrote a live game backend in TypeScript on Node 20, serving real-time multiplayer over Socket.IO alongside an Express REST API against PostgreSQL with versioned migrations.",
      "Implemented JWT and bcrypt authentication, transactional email through nodemailer and server-side image processing with Jimp.",
      "Operated the service in production with PM2 process management and Sentry error reporting, taking it public alongside the game's alpha release.",
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // DESKTOP, TOOLING AND PRODUCTS
  // ══════════════════════════════════════════════════════════════════════════

  "brew-focus": {
    cv_tier: "headline",
    role_relevance: { desktop: 5, fullstack: 5, frontend: 4, backend: 3, "tooling-devex": 2 },
    metrics: [
      "3 platforms from one codebase: macOS, Windows and Linux",
      "7 languages with full RTL support",
      "6 accent themes, 5 project views (board, calendar, graph, weekly plan, detail)",
      "Supabase-backed accounts syncing with a separate mobile client",
    ],
    keywords: ["Tauri", "Rust", "React", "TypeScript", "Zustand", "Tailwind CSS", "Framer Motion", "Supabase", "PostgreSQL", "cross-platform", "desktop application", "i18n", "internationalization", "RTL", "auto-update", "system tray", "state management"],
    cv_bullets: [
      "Shipped a cross-platform desktop productivity application on Tauri 2 and React, running on macOS, Windows and Linux from a single Rust and TypeScript codebase.",
      "Built full internationalization across seven languages including complete right-to-left layout support, alongside six accent themes and a custom window chrome with system tray persistence.",
      "Implemented account-backed sync on Supabase so tasks, projects, settings and history stay consistent between the desktop app and a separate React Native mobile client.",
      "Delivered five distinct project views (board, calendar, graph, weekly plan and detail) with drag-and-drop ordering, task dependencies, Markdown notes with wiki-link resolution and auto-updates from the GitHub releases channel.",
    ],
    transferable_framing: {
      fullstack: "Owned a commercial product end to end: Rust backend, React frontend, PostgreSQL schema on Supabase, authentication, cross-device sync, release packaging and auto-update infrastructure.",
      frontend: "Built a complex React application with Zustand state management, Framer Motion animation, seven-locale i18n with RTL, six runtime themes and five distinct data views over shared state.",
    },
  },

  "brew-focus-mobile": {
    cv_tier: "headline",
    role_relevance: { mobile: 5, fullstack: 4, frontend: 3 },
    metrics: [
      "Published to the Google Play Internal Testing track",
      "Wall-clock anchored timer, accurate across backgrounding",
      "7 languages with RTL, shared account with the desktop app",
    ],
    keywords: ["React Native", "Expo", "TypeScript", "EAS Build", "Supabase", "Android", "mobile development", "Play Store", "offline support", "i18n", "cross-platform", "haptics"],
    cv_bullets: [
      "Built and published an Android application with Expo and React Native, sharing accounts, tasks and projects with an existing desktop product through Supabase.",
      "Anchored the timer to wall-clock time so sessions stay accurate through backgrounding and process suspension, rather than drifting with a paused JS interval.",
      "Shipped to the Google Play Internal Testing track via EAS Build, with seven-language RTL support and one-handed navigation patterns throughout.",
    ],
  },

  ZipRS: {
    cv_tier: "headline",
    role_relevance: { desktop: 5, systems: 4, "tooling-devex": 5, fullstack: 3 },
    metrics: [
      "5 archive formats: ZIP, TAR, TAR.GZ, TAR.BZ2, TAR.ZST",
      "15 CLI subcommands sharing the GUI's Rust core",
      "Zstd level 19 compression",
    ],
    keywords: ["Rust", "Tauri", "Svelte", "TailwindCSS", "Tokio", "clap", "Zstd", "compression", "archive", "CLI", "desktop application", "drag and drop", "CRC-32", "cross-platform", "NSIS"],
    cv_bullets: [
      "Built a desktop archive manager in Rust on Tauri 2 and Svelte 5, supporting ZIP, TAR, TAR.GZ, TAR.BZ2 and TAR.ZST with full browse, extract, add, delete, create and integrity-test operations.",
      "Shared one Rust core between the GUI and a fifteen-subcommand CLI, so scripted and interactive workflows cannot diverge in behavior.",
      "Implemented bidirectional drag and drop including drag-out extraction into the host file manager, with live progress reporting and a properties panel exposing CRC-32, compression ratio and method.",
    ],
    transferable_framing: {
      "tooling-devex": "Designed a tool with parity between its interactive and scriptable interfaces by sharing a single core, a pattern that keeps CI usage and human usage permanently consistent.",
    },
  },

  rustfm: {
    cv_tier: "headline",
    role_relevance: { "tooling-devex": 5, systems: 4, desktop: 3 },
    metrics: [
      "Multiple independent panels, each with its own location, cursor, filter and selection",
      "Image preview across Kitty, iTerm2 and Sixel protocols with a halfblocks fallback",
      "Background worker thread for all file operations, so the UI never blocks",
    ],
    keywords: ["Rust", "TUI", "terminal", "ratatui", "syntect", "git integration", "file manager", "syntax highlighting", "fuzzy search", "concurrency", "clipboard", "Sixel", "developer tools"],
    cv_bullets: [
      "Built a terminal file manager in Rust with multiple independent panels, a live preview pane handling syntax-highlighted code, images, PDFs and git diffs, and a three-pane task and metadata footer.",
      "Integrated git deeply: per-entry index and worktree status propagated to parent directories, branch and ahead/behind summaries, and a menu for stage, unstage, discard, commit and raw commands.",
      "Ran every file operation on a background worker with live progress reporting, keeping the interface responsive during large transfers and auto-resolving paste collisions.",
      "Designed destructive actions to be unreachable by accident: permanent deletion is available only through the command palette, so a habitual keypress can never hard-wipe files.",
    ],
    transferable_framing: {
      "tooling-devex": "Made a safety-critical design decision explicit by putting irreversible operations behind a deliberate interaction, a principle that transfers directly to any destructive API or admin tool.",
    },
  },

  "ViewCam-Desktop": {
    cv_tier: "headline",
    role_relevance: { desktop: 5, systems: 5, "engine-graphics": 3, gpu: 3, backend: 2 },
    metrics: [
      "Registers a real OS camera device via v4l2loopback on Linux and DirectShow on Windows",
      "Zero-config pairing through local network device announcement",
      "CUDA and Vulkan GPU processing paths",
      "Packaged for Windows with Inno Setup",
    ],
    keywords: ["C++17", "Qt 6", "QML", "Qt Quick", "CUDA", "Vulkan", "v4l2loopback", "DirectShow", "video streaming", "virtual camera", "CMake", "Linux", "Windows", "networking", "device drivers", "installer packaging"],
    cv_bullets: [
      "Built the desktop half of a wireless webcam product in C++17 and Qt 6, registering a genuine operating system camera device through v4l2loopback on Linux and DirectShow on Windows so every webcam-capable application sees the stream natively.",
      "Implemented zero-configuration pairing where phones announce themselves on the local network and surface as live device cards, removing IP entry and manual setup entirely.",
      "Accelerated the video processing path with CUDA and Vulkan, and built the interface in Qt Quick and QML around a dark-first viewfinder design.",
      "Packaged and shipped Windows installers with Inno Setup alongside Linux builds, driven by a CMake build supporting both platforms.",
    ],
    transferable_framing: {
      systems: "Integrated at the operating system level on two platforms with different device models, writing to kernel-backed virtual devices rather than working around them in userspace.",
    },
  },

  "ViewCam-Mobile": {
    cv_tier: "headline",
    role_relevance: { mobile: 5, systems: 3, frontend: 2 },
    metrics: [
      "Kotlin Multiplatform with Compose Multiplatform, iOS-ready from one codebase",
      "CameraX and Camera2 capture, Android 26+",
      "Embedded streaming server running on the device",
    ],
    keywords: ["Kotlin", "Kotlin Multiplatform", "Compose Multiplatform", "CameraX", "Camera2", "Android", "iOS", "video streaming", "network discovery", "mobile development", "real-time"],
    cv_bullets: [
      "Built the capture side of a wireless webcam product in Kotlin Multiplatform, running an embedded streaming server on the phone that broadcasts itself on the local network and streams live camera frames to a desktop receiver.",
      "Implemented the camera pipeline on CameraX and Camera2 with a full-screen viewfinder and a minimal HUD showing live state, session timer and connection status.",
      "Structured the app with Compose Multiplatform so the iOS port becomes a platform layer rather than a rewrite.",
    ],
  },

  CoDo: {
    cv_tier: "supporting",
    role_relevance: { desktop: 3, "engine-graphics": 3, systems: 4 },
    metrics: ["Written in pure C with OpenGL rendering, no UI framework", "Binary .dat serialization"],
    keywords: ["C", "OpenGL", "GLFW", "immediate mode GUI", "hardware acceleration", "binary serialization", "desktop application"],
    cv_bullets: [
      "Built a hardware-accelerated desktop task manager in pure C, rendering the entire interface through OpenGL with an immediate-mode UI library and no application framework underneath.",
      "Implemented binary serialization of task state to a custom .dat format with priority levels and clipboard integration.",
    ],
  },

  TUImer: {
    cv_tier: "supporting",
    role_relevance: { "tooling-devex": 4, systems: 2 },
    metrics: ["Flexible duration parsing across ss, mm:ss and hh:mm:ss", "Feature-gated audio to keep the default build dependency-light"],
    keywords: ["Rust", "TUI", "ratatui", "crossterm", "clap", "TOML", "CLI", "terminal", "desktop notifications"],
    cv_bullets: [
      "Built a keyboard-first terminal Pomodoro timer in Rust with ratatui, supporting countdown and work/break cycle modes, persistent settings, session logging and desktop notifications.",
      "Gated audio support behind a Cargo feature so the default build stays free of system audio dependencies.",
    ],
  },

  TodoCLI: {
    cv_tier: "supporting",
    role_relevance: { "tooling-devex": 3, backend: 2 },
    metrics: ["SQLite-backed persistence, cross-platform across Linux, macOS and Windows"],
    keywords: ["Rust", "SQLite", "rusqlite", "CLI", "cross-platform", "persistence"],
    cv_bullets: [
      "Built a cross-platform CLI task manager in Rust backed by SQLite, with color-coded output and platform-correct home directory resolution across Linux, macOS and Windows.",
    ],
  },

  SnakeTermRS: {
    cv_tier: "supporting",
    role_relevance: { "tooling-devex": 3, "game-dev": 2 },
    metrics: ["Deterministic replay from recorded games via seeded RNG", "TOML configuration with CLI overrides"],
    keywords: ["Rust", "terminal", "game loop", "clap", "TOML", "replay system", "deterministic", "local multiplayer"],
    cv_bullets: [
      "Built a terminal game in Rust with local two-player support, game recording and deterministic replay driven by a seeded RNG, plus TOML configuration overridable from CLI flags.",
    ],
  },

  DataStructuresCpp: {
    cv_tier: "headline",
    role_relevance: { systems: 5, "engine-graphics": 3, backend: 3, "game-dev": 3 },
    metrics: [
      "18 container types and 30+ algorithms, written with no STL, no Boost and no libc",
      "Robin Hood open addressing, AVL trees and 4-ary heaps chosen over standard alternatives",
      "Exception-free: Optional<T> is the sole error channel",
      "1.5x array growth factor instead of the conventional 2x",
    ],
    keywords: ["C++20", "data structures", "algorithms", "Robin Hood hashing", "AVL tree", "segment tree", "Fenwick tree", "trie", "union-find", "Dijkstra", "KMP", "suffix array", "cache optimization", "SIMD", "header-only", "CMake", "zero dependencies"],
    cv_bullets: [
      "Implemented a complete C++20 data structures and algorithms library with zero dependencies, writing eighteen container types and over thirty algorithms without the standard library, Boost or libc.",
      "Chose implementations on measured tradeoffs rather than convention: Robin Hood open addressing over chaining, AVL over red-black for lookup-heavy workloads, 4-ary heaps to reduce cache misses, and 1.5x array growth to cut allocation waste.",
      "Eliminated exceptions entirely in favor of Optional<T> as the single error channel, and used __builtin_memcpy and memset so the compiler auto-vectorizes bulk memory operations.",
      "Covered graph algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal, Prim), string algorithms (KMP, Rabin-Karp, Z-algorithm, suffix arrays) and number theory (Miller-Rabin, matrix exponentiation) alongside the containers.",
    ],
    transferable_framing: {
      backend: "Demonstrates first-principles command of the data structures behind every database index and cache: hash table probing strategies, balanced trees, tries and segment trees, implemented rather than merely used.",
      systems: "Wrote the entire allocation, growth and memory-movement layer by hand, making the cache and allocator behavior of every container an explicit design decision.",
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // WEB, FULLSTACK AND CLIENT WORK
  // ══════════════════════════════════════════════════════════════════════════

  CreatantOnboardingPrototype: {
    cv_tier: "headline",
    role_relevance: { frontend: 5, fullstack: 4, "tooling-devex": 3 },
    metrics: [
      "4 independently swappable layers: content, theme, tour engine, persistence",
      "4 interchangeable visual themes with identical flow logic",
      "Flow order defined by a single array, so reordering screens changes no logic",
      "Vitest suite across flow, engine and persistence",
    ],
    keywords: ["React", "TypeScript", "Vite", "Vitest", "driver.js", "Framer Motion", "onboarding", "UX engineering", "component architecture", "state machine", "testing", "design systems", "prototyping"],
    cv_bullets: [
      "Designed and built a production onboarding system in React and TypeScript spanning a branching segmentation questionnaire and an interactive in-product guided tour.",
      "Architected four strictly independent layers (step content, visual theme, tour engine and persistence) so a new visual identity is one theme file and reordering a screen is a data edit, not a logic change.",
      "Made branch targets resolve by key rather than index so conditional flows survive arbitrary reordering, and covered the flow, engine and persistence layers with Vitest.",
      "Built the tour against a workspace mock so integration with the production interface reduces to a selector swap, decoupling delivery from the main codebase's release schedule.",
    ],
    transferable_framing: {
      frontend: "Delivered a configuration-driven UI system where product managers change flow, copy and branching without engineering involvement, and four complete visual skins share one logic layer.",
    },
  },

  CreatantOnboard: {
    cv_tier: "supporting",
    role_relevance: { frontend: 4, fullstack: 2 },
    metrics: ["Every visual token measured from the live product rather than invented"],
    keywords: ["React", "TypeScript", "Vite", "design systems", "UI prototyping", "Framer Motion", "onboarding"],
    cv_bullets: [
      "Prototyped a first-run onboarding concept in React and TypeScript, deriving every spacing, color and type value by measuring the live product so the prototype was visually indistinguishable from production.",
    ],
  },

  CanberkPitirliWebApp: {
    cv_tier: "headline",
    role_relevance: { frontend: 5, fullstack: 4, devops: 3, "tooling-devex": 3 },
    metrics: [
      "Build-time prerendering of every route with per-page meta and JSON-LD",
      "Generated sitemap, RSS feed and branded Open Graph cards per page",
      "Ships a public JSON API at /getprojects with CORS and cache headers",
    ],
    keywords: ["React 18", "Vite", "Tailwind CSS", "Framer Motion", "React Router", "SEO", "JSON-LD", "structured data", "Open Graph", "prerendering", "RSS", "sitemap", "static hosting", "Apache", "CI/CD", "KaTeX", "accessibility"],
    cv_bullets: [
      "Built and operate a production React and Vite site with a custom build-time SEO pipeline that prerenders every route with correct meta tags and JSON-LD structured data, since a client-rendered SPA serves crawlers an empty shell.",
      "Generated branded Open Graph cards, an XML sitemap and an RSS feed at build time, and exposed a public JSON API endpoint with CORS and cache-control headers configured at the Apache layer.",
      "Implemented a technical blog with Markdown rendering, syntax highlighting and LaTeX math through remark-math and KaTeX, alongside a command palette and reduced-motion support throughout.",
    ],
    transferable_framing: {
      devops: "Own the full deployment pipeline: build, postbuild asset generation, Apache rewrite and cache-header configuration, and automated SFTP release to production hosting.",
    },
  },

  FocusKingdom: {
    cv_tier: "headline",
    role_relevance: { "game-dev": 4, mobile: 5, "engine-graphics": 3, fullstack: 2 },
    metrics: [
      "4 target platforms from one Gradle multi-module build: Android, iOS, desktop and HTML5",
      "Real-time multiplayer over Socket.IO",
      "Published to Google Play",
    ],
    keywords: ["Java", "libGDX", "Android", "OpenGL ES", "GLSL", "Gradle", "Socket.IO", "multiplayer", "mobile game", "heightmap terrain", "AdMob", "cross-platform", "Google Play"],
    cv_bullets: [
      "Built and published a cross-platform 3D game on libGDX and Java targeting Android, iOS, desktop and HTML5 from a single Gradle multi-module build.",
      "Implemented real-time multiplayer over Socket.IO, custom GLSL shaders, heightmap-based terrain generation and building placement mechanics.",
      "Shipped to Google Play with AdMob monetization and lifecycle-aware audio that correctly pauses and resumes across the Android activity lifecycle.",
    ],
  },

  Ruby: {
    cv_tier: "headline",
    role_relevance: { desktop: 4, backend: 3, fullstack: 3 },
    metrics: ["7-module Visual Studio solution: Common, Database, Model, Setup, Resources, Serialization, Presentation", "Delivered to a commercial restaurant client"],
    keywords: ["C#", ".NET", "WPF", "MVVM", "point of sale", "POS", "inventory management", "desktop application", "database", "multi-project solution", "business software"],
    cv_bullets: [
      "Delivered a commercial cafe and restaurant management suite in C# and .NET covering point of sale, inventory tracking and back-office management.",
      "Structured the application as a seven-module Visual Studio solution with clean separation between database, domain model, serialization and presentation layers.",
    ],
    transferable_framing: {
      backend: "Delivered line-of-business software to a paying commercial client, owning the data model, persistence layer and transactional workflows that a real business ran its daily operations on.",
    },
  },

  byatalay: {
    cv_tier: "supporting",
    role_relevance: { frontend: 3 },
    keywords: ["JavaScript", "HTML", "CSS", "responsive design", "client work", "web development"],
    cv_bullets: ["Designed and delivered a business website for a restaurant client, handling the project end to end from layout through deployment."],
  },

  PirayeGuzellikSalonu: {
    cv_tier: "supporting",
    role_relevance: { frontend: 3 },
    keywords: ["React", "JavaScript", "HTML", "CSS", "client work", "web development"],
    cv_bullets: ["Built a React business website for a beauty salon client, delivered end to end."],
  },

  WindowFramework: {
    cv_tier: "supporting",
    role_relevance: { systems: 3, desktop: 3 },
    metrics: ["Reusable Win32 abstraction shared across multiple downstream projects"],
    keywords: ["C++", "Win32 API", "Windows", "desktop", "abstraction layer", "reusable library"],
    cv_bullets: [
      "Built a reusable C++ windowing framework over the raw Win32 API, designed as a shared foundation for multiple downstream Windows applications.",
    ],
  },

  // ── Explicitly excluded from any CV ────────────────────────────────────────
  // Present so the decision is recorded rather than implied by absence.
  MnistPY: { cv_tier: "omit", omit_reason: "Tutorial-level. Superseded by FastNN, which is the same domain done properly." },
  PythonGeneticAlgorithms: { cv_tier: "omit", omit_reason: "Single-file learning exercise. Superseded by Evo-Engine." },
  JavaGeneticAlgorithms: { cv_tier: "omit", omit_reason: "Single-file learning exercise. Superseded by Evo-Engine." },
  ReactFlix: { cv_tier: "omit", omit_reason: "Clone project. Signals tutorial-following next to production work." },
  "reactive-calculator": { cv_tier: "omit", omit_reason: "Trivial scope." },
  LeetCodeSolutions: { cv_tier: "omit", omit_reason: "Practice repository. DataStructuresCpp demonstrates the same ability at far greater depth." },
  UE5LearnPath: { cv_tier: "omit", omit_reason: "Course follow-along. Shipped UE5 titles cover this ground with real evidence." },
  SnakeTerm: { cv_tier: "omit", omit_reason: "Superseded by SnakeTermRS." },
  "Window-project": { cv_tier: "omit", omit_reason: "First exploration, superseded by WindowFramework." },
  ToMakeDesktop: { cv_tier: "omit", omit_reason: "Incomplete." },
  ToMakeMobile: { cv_tier: "omit", omit_reason: "Scaffold only, no implementation." },
  CameraApp: { cv_tier: "omit", omit_reason: "Prototype, superseded by the ViewCam Studio products." },
  ViewCam: { cv_tier: "omit", omit_reason: "Superseded by ViewCam-Desktop and ViewCam-Mobile." },
  NiBase: { cv_tier: "omit", omit_reason: "Client work from 2020, thin and long superseded. Ruby is the stronger example." },
  CanReader: { cv_tier: "omit", omit_reason: "Profile README." },
  MyObsidianNotes: { cv_tier: "omit", omit_reason: "Personal notes." },
  "DX11-TUTS-NOTES": { cv_tier: "omit", omit_reason: "Personal notes." },
  hyprlandConfig: { cv_tier: "omit", omit_reason: "Dotfiles." },
  "brew-focus-legal": { cv_tier: "omit", omit_reason: "Legal pages, superseded by brewfocus-legal." },
  "brewfocus-legal": { cv_tier: "omit", omit_reason: "Static legal pages. Product credit belongs to brew-focus." },
  "brew-focus-web": { cv_tier: "supporting", role_relevance: { frontend: 3, fullstack: 2 }, keywords: ["React", "TypeScript", "Vite", "marketing site", "Framer Motion", "design tokens"], cv_bullets: ["Built the marketing site for a commercial desktop product in React and TypeScript, with a live product demo running in the hero rather than a looping animation, and download links driven from a single data file."] },
  "SleakEngine-Empty": { cv_tier: "supporting", role_relevance: { "tooling-devex": 4, "game-dev": 3 }, metrics: ["GitHub template repository with vendored dependencies"], keywords: ["C++23", "CMake", "git submodule", "project template", "developer experience"], cv_bullets: ["Built and maintain the official starter template for a custom C++23 game engine, published as a GitHub template so new projects start with clean history and a working build in one command."] },
  "SleakEngine-FPP": { cv_tier: "omit", omit_reason: "Engine demo. SleakCraft is the stronger showcase." },
  SleakSims: { cv_tier: "omit", omit_reason: "Engine demo. SleakCraft is the stronger showcase." },
  SleakRoller: { cv_tier: "omit", omit_reason: "Engine demo. SleakCraft is the stronger showcase." },
  excalidraw: { cv_tier: "omit", omit_reason: "Upstream fork, no original work." },
  renderdoc: { cv_tier: "omit", omit_reason: "Upstream fork, no original work." },
  "SPIRV-Tools": { cv_tier: "omit", omit_reason: "Upstream fork, no original work." },
  LLGL: { cv_tier: "omit", omit_reason: "Upstream fork, no original work." },
  "unreal-mcp": { cv_tier: "omit", omit_reason: "Upstream fork, no original work." },
  "github-readme-stats": { cv_tier: "omit", omit_reason: "Upstream copy deployed for the profile README." },
  "github-profile-trophy": { cv_tier: "omit", omit_reason: "Upstream copy deployed for the profile README." },
  "Numpy-Tutorial-SciPyConf-2019": { cv_tier: "omit", omit_reason: "Upstream fork of tutorial material." },
};
