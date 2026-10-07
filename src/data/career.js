// Career record: employment, shipped commercial products, teaching, education
// and personal facts a CV needs.
//
// Repositories live in repositories.json and are generated from the GitHub API.
// This file is the opposite: hand-maintained, because none of it is derivable
// from code. It is the highest-value data here, since employment history and
// shipped products outrank side projects on every CV.
//
// Sources of truth reconciled into this file: cv.md, src/components/Experience.jsx
// and the commercial entries in src/data/projects.js.
//
// `confidential: true` marks work that is real and verifiable but not yet
// publicly announced. `public_on_site: false` mirrors the `visible: false` flag
// in Experience.jsx, meaning the entry is deliberately hidden from the site's
// timeline. Both are advisory: the build currently publishes everything to
// /getprojects. Flip PUBLISH_CONFIDENTIAL in scripts/postbuild.js to change that.

export const career = {
  // ══════════════════════════════════════════════════════════════════════════
  // EMPLOYMENT
  // ══════════════════════════════════════════════════════════════════════════
  experience: [
    {
      id: "creatant",
      role: "Fullstack Software Engineer",
      company: "Creatant",
      employment_type: "full-time",
      location: "Remote",
      start: "2026-05",
      end: null,
      current: true,
      confidential: true,
      public_on_site: false,
      confidential_reason: "Product is unreleased. Most of the work is not public yet.",
      summary:
        "Fullstack engineer on a production web platform, owning features end to end across TypeScript and React on the front end and the backend and infrastructure behind them. The largest role of my career so far.",
      metrics: ["Shipping to production daily"],
      keywords: ["TypeScript", "React", "PostgreSQL", "Docker", "fullstack", "REST API", "production", "web platform", "SaaS", "agile"],
      role_relevance: { fullstack: 5, frontend: 5, backend: 5, devops: 3 },
      cv_bullets: [
        "Own features end to end on a production web platform, from React and TypeScript interfaces through the APIs and PostgreSQL data model behind them.",
        "Ship to production daily as part of a small team, taking features from specification through implementation, review and release without handoff.",
        "Work across time zones and cultures on a distributed product team.",
      ],
      transferable_framing: {
        backend: "Current commercial fullstack role: designing APIs and data models for a live product, not prototypes.",
        frontend: "Production React and TypeScript at daily release cadence, with ownership extending through the API layer rather than stopping at the component boundary.",
      },
      techs: ["TypeScript", "React", "PostgreSQL", "Docker"],
    },

    {
      id: "ursa-majeur",
      role: "C++ Developer (Freelance)",
      company: "Ursa Majeur",
      employment_type: "freelance",
      location: "Istanbul, Turkey (remote)",
      start: "2026-01",
      end: null,
      current: true,
      confidential: true,
      public_on_site: false,
      confidential_reason: "Slashbang is unannounced. Celestial Temple has not shipped.",
      summary:
        "Freelance C++ developer for an Istanbul game studio, building their procedural terrain generation plugin for Unreal Engine 5 from scratch and contributing to two titles.",
      metrics: ["Procedural terrain plugin built from scratch in C++ for UE5", "Deterministic from a seed and fast enough for runtime use", "Contributing to a title shipping on Steam in Q4 2026"],
      keywords: ["C++", "Unreal Engine 5", "procedural generation", "plugin development", "terrain generation", "freelance", "contract", "designer tooling", "game development"],
      role_relevance: { "game-dev": 5, "tooling-devex": 4, "engine-graphics": 3, systems: 3 },
      cv_bullets: [
        "Built a procedural terrain generation plugin for Unreal Engine 5 from scratch in C++ for a commercial game studio, deterministic from a seed and fast enough to run at runtime rather than bake offline.",
        "Designed the plugin so designers shape entire worlds without touching code, removing an engineering bottleneck from the studio's content pipeline.",
        "Deliver as an external contractor against studio deadlines, with the plugin generating the worlds of an unannounced roguelike and contributing to a title releasing on Steam in Q4 2026.",
      ],
      transferable_framing: {
        "tooling-devex": "Paid contract engagement delivering a tool that non-engineers operate independently, scoped, built and handed over to an external team.",
      },
      techs: ["C++", "Unreal Engine 5"],
      related_repos: ["ProcTile"],
    },

    {
      id: "reality-arts",
      role: "C++ Game Developer",
      company: "Reality Arts Studio",
      employment_type: "full-time",
      location: "Istanbul, Turkey",
      start: "2022-06",
      end: "2024-08",
      current: false,
      confidential: false,
      public_on_site: true,
      team_size: "10-15",
      summary:
        "Core C++ developer on two commercial Unreal Engine 5 titles: The Stranger (PC/VR, shipped on Steam) and Unawake (published by Toplitz Productions, shown at Gamescom 2024). Reality Arts is a member of the Unreal Developer Network and received three Epic Games grants.",
      metrics: [
        "20% rendering performance improvement from a custom occlusion culling system",
        "2 commercial titles shipped or shown at Gamescom",
        "Team of 10-15 across design, art, programming and QA",
        "3 Epic Games grants earned by the team",
        "Best Game, WN Unreal European Developer Contest",
      ],
      keywords: [
        "C++20", "Unreal Engine 5", "Blueprints", "HLSL", "DirectX 12", "Vulkan", "gameplay programming",
        "behavior trees", "AI", "state machines", "multithreading", "race conditions", "memory optimization",
        "RenderDoc", "Nsight", "GPU profiling", "occlusion culling", "shader programming", "engine migration",
        "Perforce", "Jira", "Agile", "code review", "tools development", "VR", "Steam",
      ],
      role_relevance: { "game-dev": 5, "engine-graphics": 5, gpu: 4, systems: 4, "tooling-devex": 4 },
      cv_bullets: [
        "Implemented a custom occlusion culling system that delivered a 20% rendering performance improvement, identified through targeted CPU and GPU profiling with RenderDoc and Nsight.",
        "Developed gameplay mechanics, player and combat systems, interaction systems and character controllers in C++ across full development cycles, from rapid prototyping through polish and ship on two commercial UE5 titles.",
        "Built AI behaviors using Behavior Trees, Blackboard and state machines, and delivered designer-facing tools and editor features that let content creators iterate without engineering bottlenecks.",
        "Led rendering and plugin compatibility work for the Unreal Engine 4.27 to 5.0 migration on Unawake, and debugged multithreading race conditions, shader compilation failures and cross-platform rendering bugs.",
        "Wrote and maintained HLSL shaders for visual effects and post-processing, working in Agile workflows with Jira and Perforce under team code review and strict coding standards.",
      ],
      transferable_framing: {
        backend: "Two years of commercial C++ in a 10-15 person engineering organization: code review, coding standards, Agile delivery, version control at scale with Perforce, and shipping to a public release deadline.",
        systems: "Diagnosed and fixed multithreading race conditions and platform-specific failures in a large production C++ codebase, and drove a major engine version migration to completion.",
        "performance-engineer": "Profiled a production real-time application with RenderDoc and Nsight, identified the bottleneck and implemented a targeted fix worth a measured 20% improvement.",
        "generic-software-engineer": "Shipped two commercial products to market in a cross-functional team, owning features from prototype through release and taking responsibility for performance regressions in production.",
      },
      recognition: [
        "The Stranger won Best Game at the WN Unreal European Developer Contest",
        "Partnerships secured with Microsoft, Nvidia and MSI",
        "Part of the team that earned 3 Epic Games grants (Unreal Dev Grant and Epic MegaGrants)",
        "Unawake published by Toplitz Productions and shown at Gamescom 2024",
      ],
      techs: ["C++20", "Unreal Engine 5", "Blueprints", "HLSL", "DirectX 12", "Vulkan", "RenderDoc", "Nsight", "Perforce", "Jira", "Git", "Windows", "Linux"],
      shipped: ["unawake", "the-stranger"],
    },

    {
      id: "udemy-instructor",
      role: "Independent Instructor",
      company: "Udemy (Self-employed)",
      employment_type: "self-employed",
      location: "Remote",
      start: "2023-01",
      end: null,
      current: true,
      confidential: false,
      public_on_site: true,
      summary:
        "Author and maintainer of two advanced technical courses: Advanced DirectX 11 Graphics Programming in C++ and HLSL, and Advanced WPF Application Development in C#. Ongoing content updates and student Q&A.",
      metrics: ["200+ enrolled students across 2 courses", "4.8/5 average rating", "Complete DirectX 11 rendering framework built as course material"],
      keywords: ["technical instruction", "curriculum design", "DirectX 11", "HLSL", "C++", "C#", "WPF", "MVVM", "SOLID", "graphics programming", "developer education", "technical communication", "mentoring", "documentation"],
      role_relevance: { teaching: 5, "engine-graphics": 4, desktop: 4, "tooling-devex": 3, frontend: 2 },
      cv_bullets: [
        "Authored and maintain two advanced technical courses reaching 200+ students at a 4.8/5 average rating, covering DirectX 11 graphics programming and advanced WPF desktop development.",
        "Built a complete DirectX 11 rendering framework from scratch as course material, teaching HLSL shader programming, multi-threaded rendering pipelines, GPU optimization and production engine architecture patterns.",
        "Teach MVVM architecture, data binding, custom controls and SOLID design patterns in C# and WPF, the same patterns that underpin professional desktop and editor tooling.",
        "Field ongoing student questions and ship content updates, turning complex low-level topics into explanations that hold up under scrutiny from a paying audience.",
      ],
      transferable_framing: {
        "generic-software-engineer": "Explaining hard technical material clearly to 200+ paying students is direct, rated evidence of the communication ability that senior and lead roles are actually gated on.",
        teaching: "Independent course author with measured student outcomes, responsible for curriculum design, production, and ongoing learner support.",
      },
      techs: ["C++", "DirectX 11", "HLSL", "C#", "WPF", "MVVM", "Visual Studio"],
      teaching_refs: ["advanced-directx-11", "advanced-wpf"],
    },

    {
      id: "freelance-2020",
      role: "Freelance Software Developer",
      company: "Self-employed",
      employment_type: "freelance",
      location: "Turkey",
      start: "2020-01",
      end: "2022-06",
      current: false,
      confidential: false,
      public_on_site: true,
      summary:
        "Built custom desktop and mobile applications for paying clients, including a full point of sale system for a restaurant business and a gamified productivity app published on Google Play.",
      metrics: ["7-module WPF application delivered to a commercial restaurant client", "Mobile title published to Google Play with real-time multiplayer"],
      keywords: ["C#", "WPF", "MVVM", "point of sale", "POS", "inventory", "Java", "Node.js", "PostgreSQL", "Socket.IO", "freelance", "client delivery", "full-stack", "Google Play"],
      role_relevance: { desktop: 4, fullstack: 4, backend: 3, mobile: 3 },
      cv_bullets: [
        "Delivered a complete restaurant point of sale and management system in C# and WPF as a seven-module MVVM application, covering sales, inventory and back-office operations for a commercial client.",
        "Built and published Focus Kingdom to Google Play, a cross-platform 3D game with real-time multiplayer over Socket.IO backed by a Node.js server.",
        "Owned full-stack delivery on every engagement: interface, backend, database schema and deployment, working directly with non-technical clients to scope and ship.",
      ],
      transferable_framing: {
        backend: "Two years of direct client delivery, scoping requirements with non-technical stakeholders and owning the entire stack through to deployment and handover.",
      },
      techs: ["C#", "WPF", "Java", "Node.js", "PostgreSQL", "Socket.IO"],
      related_repos: ["Ruby", "FocusKingdom", "FocusKingdomServer"],
    },

    {
      id: "fatalitech",
      role: "C++ Game Developer",
      company: "Fatalitech Game Studios",
      employment_type: "full-time",
      location: "Remote",
      start: "2014-03",
      end: "2016-11",
      current: false,
      confidential: false,
      public_on_site: true,
      team_size: "8",
      summary:
        "Shipped Endless Combat, a co-op multiplayer zombie survival game, to Steam. Joined at age 14 and worked in a distributed cross-functional team of 8.",
      metrics: ["18% frame time reduction from AI and game logic optimization", "Shipped a commercial Steam title at age 14", "Remote cross-functional team of 8", "Endless Combat is still on Steam today"],
      keywords: ["C++", "Unreal Engine", "Blueprints", "game AI", "state machines", "optimization", "profiling", "Perforce", "Agile", "remote work", "Steam", "multiplayer"],
      role_relevance: { "game-dev": 4, systems: 2 },
      cv_bullets: [
        "Shipped Endless Combat to Steam as a C++ gameplay and AI developer, building gameplay features and AI systems in Unreal Engine and iterating on mechanics directly with the design team.",
        "Reduced frame time by 18% through algorithmic improvements to AI routines and game logic, identified by profiling rather than guesswork.",
        "Worked remotely in a cross-functional team of 8 across design, art and programming using Agile workflows, self-directing priorities and driving features to completion. Started at age 14.",
      ],
      transferable_framing: {
        "generic-software-engineer": "Ten years of shipping software, beginning with a commercial release at 14. Long track record of remote, cross-functional delivery.",
      },
      techs: ["C++", "Unreal Engine", "Blueprints", "Perforce", "Git", "Visual Studio"],
      shipped: ["endless-combat"],
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // SHIPPED COMMERCIAL PRODUCTS
  // ══════════════════════════════════════════════════════════════════════════
  shipped_products: [
    {
      id: "unawake",
      title: "Unawake",
      kind: "game",
      platform: ["Steam", "Windows"],
      role: "Core C++ Developer",
      company: "Reality Arts Studio",
      publisher: "Toplitz Productions",
      years: "2022-2024",
      status: "released",
      url: "https://store.steampowered.com/app/1722610/Unawake/",
      summary:
        "Action-adventure title published by Toplitz Productions and shown at Gamescom 2024. Built gameplay systems, AI behaviors and engine-level optimizations in Unreal Engine 5.",
      metrics: ["Published by Toplitz Productions", "Shown at Gamescom 2024", "Unreal Engine 4.27 to 5.0 migration delivered"],
      keywords: ["Unreal Engine 5", "C++", "gameplay systems", "AI", "engine optimization", "Gamescom", "commercial release", "publisher"],
      cv_bullets: [
        "Core C++ developer on a commercially published action-adventure title, shown at Gamescom 2024 and published by Toplitz Productions.",
        "Delivered gameplay systems, AI behaviors and engine-level optimizations in Unreal Engine 5, including the 4.27 to 5.0 engine migration.",
      ],
    },
    {
      id: "the-stranger",
      title: "The Stranger",
      kind: "game",
      platform: ["Steam", "PC VR"],
      role: "Core C++ Developer",
      company: "Reality Arts Studio",
      years: "2022-2024",
      status: "released",
      award: "Best Game, WN Unreal European Developer Contest",
      summary:
        "VR horror experience shipped on Steam. Implemented a custom occlusion culling system worth a 20% rendering performance improvement, wrote HLSL shaders for VFX and post-processing, and built AI behaviors on Behavior Trees and Blackboard.",
      metrics: ["Best Game at the WN Unreal European Developer Contest", "20% rendering performance improvement", "Partnerships with Microsoft, Nvidia and MSI"],
      keywords: ["VR", "Unreal Engine 5", "C++", "HLSL", "occlusion culling", "performance optimization", "behavior trees", "post-processing", "Steam", "award-winning"],
      cv_bullets: [
        "Shipped an award-winning VR horror title to Steam that won Best Game at the WN Unreal European Developer Contest.",
        "Implemented the custom occlusion culling system responsible for a 20% rendering performance gain, critical for hitting VR frame budget.",
        "Wrote HLSL shaders for visual effects and post-processing and built enemy AI on Behavior Trees and Blackboard.",
      ],
    },
    {
      id: "endless-combat",
      title: "Endless Combat",
      kind: "game",
      platform: ["Steam", "Windows"],
      role: "C++ Gameplay and AI Developer",
      company: "Fatalitech Game Studios",
      years: "2014-2016",
      status: "released",
      url: "https://store.steampowered.com/app/690350/Endless_Combat/",
      summary:
        "Co-op multiplayer zombie survival game with PvP modes for up to 8 players, released on Steam. My first shipped title, built at age 14. Still available on Steam today.",
      metrics: ["First shipped Steam title, at age 14", "8-player co-op and PvP", "18% frame time reduction from AI optimization"],
      keywords: ["Unreal Engine", "C++", "multiplayer", "co-op", "PvP", "game AI", "optimization", "Steam"],
      cv_bullets: [
        "Shipped a co-op multiplayer zombie survival game to Steam supporting up to 8 players, building gameplay features and AI systems in C++.",
        "Cut frame time by 18% through profiling-driven optimization of AI routines and game logic.",
      ],
    },
    {
      id: "focus-kingdom",
      title: "Focus Kingdom",
      kind: "game",
      platform: ["Google Play", "Android", "iOS", "Desktop", "Web"],
      role: "Solo Developer",
      company: "Self-employed",
      years: "2024-present",
      status: "released",
      summary:
        "Cross-platform 3D kingdom-building game with real-time multiplayer, published on Google Play. Built solo on libGDX targeting four platforms from one Gradle build, with a TypeScript backend running in production.",
      metrics: ["4 target platforms from one codebase", "Published to Google Play", "Live TypeScript backend with Socket.IO multiplayer"],
      keywords: ["libGDX", "Java", "Android", "Google Play", "Socket.IO", "multiplayer", "TypeScript", "Node.js", "solo developer", "cross-platform", "AdMob"],
      cv_bullets: [
        "Designed, built and published a cross-platform 3D multiplayer game to Google Play as a solo developer, spanning the libGDX client, GLSL shaders, and a production TypeScript backend on Node and PostgreSQL.",
        "Operated the live service in production with PM2 and Sentry, handling real-time multiplayer, authentication and transactional email.",
      ],
      related_repos: ["FocusKingdom", "FocusKingdomServer"],
    },
    {
      id: "brew-focus-product",
      title: "Brew Focus",
      kind: "software",
      platform: ["macOS", "Windows", "Linux", "Google Play"],
      role: "Solo Developer",
      company: "Sleak Software",
      years: "2026-present",
      status: "in testing",
      summary:
        "Commercial cross-platform productivity product spanning a Tauri desktop app, a React Native mobile app, a marketing site and a Supabase backend, all built solo. Mobile is on the Google Play Internal Testing track.",
      metrics: ["4 platforms: macOS, Windows, Linux and Android", "7 languages with full RTL support", "Account-based sync across desktop and mobile"],
      keywords: ["Tauri", "Rust", "React", "React Native", "Expo", "TypeScript", "Supabase", "PostgreSQL", "cross-platform", "product development", "i18n", "auto-update", "Play Store"],
      cv_bullets: [
        "Built and shipped a commercial cross-platform productivity product solo, spanning a Rust and Tauri desktop app on three operating systems, a React Native mobile client, a marketing site and a Supabase backend.",
        "Implemented account-based sync so tasks, projects and history stay consistent across devices, with seven-language RTL-capable localization and auto-updates.",
      ],
      related_repos: ["brew-focus", "brew-focus-mobile", "brew-focus-web", "brewfocus-legal"],
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // TEACHING
  // ══════════════════════════════════════════════════════════════════════════
  teaching: [
    {
      id: "advanced-directx-11",
      title: "Advanced Game Programming with DirectX 11",
      platform: "Udemy",
      language_of_instruction: "English",
      years: "2024-present",
      status: "active",
      url: "https://www.udemy.com/course/advanced-game-programming-with-directx-11/",
      summary:
        "Graphics programming course teaching the full DirectX 11 pipeline from the ground up: rasterization, deferred shading, shadow mapping, tessellation and post-processing, with a complete rendering framework built from scratch as course material.",
      metrics: ["Complete DX11 rendering framework built as course material", "Part of a 200+ student, 4.8/5 rated catalogue"],
      keywords: ["DirectX 11", "HLSL", "C++", "deferred shading", "shadow mapping", "tessellation", "post-processing", "rasterization", "graphics programming", "curriculum design"],
      role_relevance: { teaching: 5, "engine-graphics": 4, gpu: 3 },
      cv_bullets: [
        "Author of a published graphics programming course covering the complete DirectX 11 pipeline, including deferred shading, shadow mapping, tessellation and post-processing, taught through a rendering framework built from scratch on camera.",
      ],
      techs: ["C++", "DirectX 11", "HLSL"],
    },
    {
      id: "advanced-wpf",
      title: "Advanced WPF Application Development",
      platform: "Udemy",
      language_of_instruction: "Turkish",
      years: "2022-present",
      status: "active",
      url: "https://www.udemy.com/course/uzman-wpf-egitim/",
      summary:
        "Desktop application development course covering XAML, data binding, custom controls, templates, styles, MVVM architecture and SOLID design patterns, aimed at professional tooling work.",
      metrics: ["4.8/5 rating", "Part of a 200+ student catalogue"],
      keywords: ["WPF", "C#", ".NET", "XAML", "MVVM", "data binding", "custom controls", "SOLID", "desktop development", "design patterns", "curriculum design"],
      role_relevance: { teaching: 5, desktop: 5, "tooling-devex": 4 },
      cv_bullets: [
        "Author of a published WPF course covering XAML, data binding, custom controls, MVVM and SOLID design patterns, the same architecture that underpins professional editor and tooling development.",
      ],
      techs: ["C#", "WPF", "MVVM", ".NET"],
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // EDUCATION
  // ══════════════════════════════════════════════════════════════════════════
  education: [
    {
      id: "balikesir-programming",
      degree: "Associate Degree in Programming",
      institution: "Balıkesir University",
      location: "Balıkesir, Turkey",
      start: "2019",
      end: "2021",
      status: "completed",
      summary:
        "Associate degree in Programming, studied while already working professionally. Entered the programme having shipped a commercial Steam title, and worked freelance throughout, delivering a restaurant point of sale system and publishing a game to Google Play before graduating.",
      metrics: ["Studied while working freelance on paid client projects", "Entered with a commercially shipped Steam title already behind me"],
      keywords: ["programming", "computer science", "software development", "associate degree", "Balıkesir University", "algorithms", "databases", "object-oriented programming"],
      role_relevance: { "generic-software-engineer": 2 },
      cv_bullets: [
        "Associate Degree in Programming, Balıkesir University (2019-2021), completed alongside paid freelance work delivering commercial desktop and mobile software.",
      ],
      techs: ["C#", "Java", "C++", "SQL"],
    },
    {
      id: "luleburgaz-web-development",
      degree: "Web Development",
      institution: "Lüleburgaz Vocational and Technical High School",
      location: "Lüleburgaz, Kırklareli, Turkey",
      start: "2015",
      end: "2019",
      status: "completed",
      summary:
        "Vocational secondary education specialising in Web Development. Overlapped with the first professional role at Fatalitech Game Studios, where a commercial Steam title shipped during these years.",
      metrics: ["Shipped a commercial Steam title during secondary education"],
      keywords: ["web development", "HTML", "CSS", "JavaScript", "vocational education", "technical high school"],
      cv_bullets: [
        "Vocational and Technical High School diploma in Web Development (2015-2019), during which I shipped my first commercial title to Steam with Fatalitech Game Studios.",
      ],
      techs: ["HTML", "CSS", "JavaScript"],
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // CERTIFICATIONS
  // ══════════════════════════════════════════════════════════════════════════
  // `kind` separates a proctored professional certification from a course
  // completion certificate. Both are real, but they do not carry equal weight
  // on a CV, and listing a dozen course completions under one "Certifications"
  // heading reads as padding. Filter by kind when generating.
  //   professional-certification  independently assessed credential
  //   course-completion           certificate issued for finishing a course
  //
  // `date_placeholder: true` marks a date I estimated from surrounding work
  // rather than one that was supplied. Replace before sending anything out.
  certifications: [
    {
      id: "understanding-typescript",
      title: "Understanding TypeScript",
      issuer: "Udemy",
      kind: "course-completion",
      issued: "2026-04",
      date_placeholder: true,
      url: "https://www.udemy.com/course/understanding-typescript/",
      keywords: ["TypeScript", "type system", "generics", "decorators", "frontend", "Node.js"],
      role_relevance: { frontend: 3, fullstack: 3, backend: 2 },
    },
    {
      id: "designing-restful-apis",
      title: "Designing RESTful APIs",
      issuer: "LinkedIn Learning",
      kind: "course-completion",
      issued: "2024-09",
      skills: ["REST APIs"],
      keywords: ["REST API", "API design", "HTTP", "backend", "web services"],
      role_relevance: { backend: 3, fullstack: 3 },
    },
    {
      id: "nodejs-essential-training",
      title: "Node.js Essential Training",
      issuer: "LinkedIn Learning",
      kind: "course-completion",
      issued: "2024-09",
      skills: ["Node.js"],
      keywords: ["Node.js", "JavaScript", "backend", "server-side", "npm"],
      role_relevance: { backend: 3, fullstack: 3 },
    },
    {
      id: "reactjs-essential-training",
      title: "React.js Essential Training",
      issuer: "LinkedIn Learning",
      kind: "course-completion",
      issued: "2024-09",
      skills: ["React.js"],
      keywords: ["React", "JavaScript", "frontend", "components", "hooks"],
      role_relevance: { frontend: 3, fullstack: 3 },
    },
    {
      id: "miuul-data-science-ai",
      title: "Introduction to Data Science and Artificial Intelligence",
      issuer: "Miuul",
      kind: "course-completion",
      issued: "2024-09",
      credential_id: "5u1dsrwixa",
      keywords: ["data science", "artificial intelligence", "machine learning", "Python", "analytics"],
      role_relevance: { "ml-ai": 2 },
    },
    {
      id: "web-development-bootcamp",
      title: "The Complete Web Development Bootcamp",
      issuer: "Udemy",
      kind: "course-completion",
      issued: "2024-07",
      date_placeholder: true,
      url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/",
      keywords: ["web development", "HTML", "CSS", "JavaScript", "React", "Node.js", "Express", "MongoDB", "fullstack"],
      role_relevance: { fullstack: 3, frontend: 3, backend: 2 },
    },
    {
      id: "cpp-professional",
      title: "C++ Programming Professional",
      issuer: "C++ Institute",
      kind: "professional-certification",
      issued: "2024",
      keywords: ["C++", "CppInstitute", "systems programming", "professional certification"],
      role_relevance: { systems: 4, "engine-graphics": 3, "game-dev": 3, backend: 2 },
    },
    {
      id: "ue-cpp-shooter",
      title: "Unreal Engine C++ Shooter Game",
      issuer: "Stephen Ulibarri",
      kind: "course-completion",
      issued: "2022",
      keywords: ["Unreal Engine", "C++", "gameplay programming", "multiplayer"],
      role_relevance: { "game-dev": 2 },
      related_repos: ["UE5LearnPath"],
    },
    {
      id: "global-ai-hub-ml",
      title: "Introduction to Machine Learning",
      issuer: "Global AI Hub",
      kind: "course-completion",
      issued: "2022-01",
      keywords: ["machine learning", "AI", "supervised learning", "Python"],
      role_relevance: { "ml-ai": 2 },
    },
    {
      id: "numpy-stack-python",
      title: "Deep Learning Prerequisites: The Numpy Stack in Python",
      issuer: "Udemy",
      kind: "course-completion",
      issued: "2021-12",
      credential_id: "UC-7eaf0379-5e5e-4022-93b8-bb06b6ee93cb",
      keywords: ["NumPy", "Python", "Pandas", "Matplotlib", "SciPy", "deep learning", "data science"],
      role_relevance: { "ml-ai": 2 },
    },
    {
      id: "ai-deep-learning-tensorflow",
      title: "Artificial Intelligence and Deep Learning A-Z: TensorFlow",
      issuer: "Udemy",
      kind: "course-completion",
      issued: "2021-10",
      credential_id: "UC-a6775943-2000-40e3-ad10-4047ac8d7627",
      keywords: ["TensorFlow", "deep learning", "neural networks", "Keras", "Python", "AI"],
      role_relevance: { "ml-ai": 3 },
      related_repos: ["MnistPY"],
    },
    {
      id: "100-days-of-code-python",
      title: "100 Days of Code: The Complete Python Pro Bootcamp",
      issuer: "Udemy",
      kind: "course-completion",
      issued: "2021-07",
      date_placeholder: true,
      url: "https://www.udemy.com/course/100-days-of-code/",
      keywords: ["Python", "automation", "web scraping", "Flask", "Selenium", "data science", "APIs"],
      role_relevance: { backend: 2, "ml-ai": 1 },
    },
    {
      id: "ms-career-essentials",
      title: "Career Essentials in Software Development",
      issuer: "Microsoft",
      kind: "course-completion",
      issued: "2020",
      keywords: ["software development", "Microsoft", "programming fundamentals"],
      role_relevance: {},
    },
  ],

  // ══════════════════════════════════════════════════════════════════════════
  // PERSONAL
  // ══════════════════════════════════════════════════════════════════════════
  personal: {
    location: "Kırklareli, Turkey",
    relocation:
      "Open to relocation worldwide. Family in Berlin, Germany.",
    work_modes: ["on-site", "hybrid", "remote"],
    spoken_languages: [
      { language: "Turkish", level: "Native" },
      { language: "English", level: "Fluent" },
      { language: "German", level: "Intermediate" },
      { language: "French", level: "Beginner" },
    ],
    years_experience: 10,
    professional_since: 2014,
    career_highlights: [
      "Shipped a commercial Steam title at age 14 and has been shipping software ever since",
      "Core developer on two commercial Unreal Engine 5 titles, one award-winning, one published by Toplitz Productions and shown at Gamescom 2024",
      "Built a complete cross-platform game engine from scratch in C++23 with four graphics backends, and shipped a real game on it",
      "Implemented a deep learning framework, a Raft consensus store, a Vulkan renderer and a software rasterizer entirely from first principles",
      "Teaches advanced DirectX 11 and WPF to 200+ students at a 4.8/5 rating",
      "Currently a fullstack engineer on a production web platform",
    ],
  },
};
