export const categories = ["All", "Graphics", "Game Dev", "Career", "Engineering", "Tutorials"];

export const posts = [
  {
    slug: "why-i-was-inactive-for-a-while",
    title: "Why I Was Inactive for a While",
    date: "2026-08-06",
    category: "Career",
    featured: false,
    tags: ["Career", "Freelance", "ViewCam", "Unreal Engine"],
    excerpt:
      "The blog went quiet for three months and a few people actually checked if I was okay. I was okay. I was just buried under two jobs, a product launch, a Play Store approval, and a suitcase I need to pack for Japan. Let me explain.",
    content: `The last post on this blog is from May. Three months of silence. A couple of people actually messaged me to ask if everything was alright, which was sweet, and also slightly insulting, because apparently my baseline is "posts constantly about shadow mapping" and the moment I stop, people assume something broke.

Nothing broke. The opposite happened. So much shipped in these three months that when I sat down and listed it all out, I had to double-check the dates because it didn't seem physically possible. Inactive is the last word I'd use. I just made the classic developer mistake: I was so busy doing the things that I never wrote about the things.

So here's everything, in roughly the order it hit me.

## A Terrain Plugin for Ursa Majeur

In May I picked up a freelance contract with Ursa Majeur, an Istanbul based game studio. The brief sounded simple the way all dangerous briefs sound simple: build a procedural terrain generation plugin for Unreal Engine, in C++.

Terrain generation is one of those problems that looks like a solved textbook exercise. Slap some noise on a heightmap, add octaves, done, right? Then you try to ship it inside someone else's production pipeline and discover the textbook conveniently skipped every chapter that matters. The terrain can't just look good. It has to generate fast, regenerate deterministically from a seed, cooperate with the engine's tooling, and be usable by designers who see a C++ file and close the tab. If a designer needs me in the room to make a mountain, I have not built a tool, I have built a dependency on my calendar.

I'm happy to report the plugin is done and it works exactly as intended. Mountains appear where mountains should appear. Designers drag sliders and landscapes obey. It's going into an unannounced 3D roguelike the studio is building, which means I legally cannot show you a single screenshot, and yes, that is exactly as frustrating for me as it is for you. But seeing a system you built from scratch become the literal ground another team's game stands on is a special kind of satisfaction. I'm excited to see it in production, at which point I will absolutely be writing about it.

## Creatant

While the terrain work was in full swing, another door opened. Creatant reached out. And this is, without exaggeration, the most important opportunity I've ever gotten. I've shipped Steam games, won a contest, taught a few hundred students, and none of it made my phone shake in my hand the way that first conversation did.

Here's the part where I tell you all about what we're building. Except I won't, because I can't, and honestly there's something enjoyable about being the guy who says "I could tell you, but then I'd have to ask legal." What I can say: I joined as a fullstack software engineer, and after a decade of identifying as a C++ engine person, I now ship across the entire stack every single day. The morning-to-evening context switch is real. Before lunch I'm thinking in heightfields and cache lines. After dinner I'm in a production web platform wondering why a div is 3 pixels to the left. Both problems get the same brain. The brain is coping.

And one more thing: in September I'm going to Japan for Creatant. A serious chunk of these three months went into getting ready for that, which is its own part-time job. Documents, logistics, and a growing collection of browser tabs about how to not embarrass myself in a Japanese office. More on all of this when it happens.

## ViewCam Is Live on Google Play

Between the two jobs, because sleep is apparently negotiable, my own product shipped. ViewCam is finally released on the Google Play Store. Not "released" as in I uploaded an APK and walked away. Released as in production started, real users showed up, and I've been shipping new versions ever since.

ViewCam turns your phone into a wireless webcam, microphone, and speaker for your PC. The pitch writes itself: the phone in your pocket has a better camera than any webcam you'd reasonably buy, so why is it sitting in your pocket during meetings? The mobile app is Kotlin Multiplatform with a Compose UI, streaming H.264 over Wi-Fi or USB with automatic discovery, so you never type an IP address like it's 2009. On the desktop side there's a Qt 6 / C++17 receiver that decodes the stream and registers a native virtual camera: DirectShow on Windows, v4l2loopback on Linux. Meet, Zoom, OBS, Discord, they all just see a webcam and ask no questions.

Launching taught me the lesson every solo dev learns the hard way: release day is not the finish line, it's the starting gun. Since launch it's been performance passes, reconnection handling, quality settings, and reading user feedback with one eye closed. I'm working harder on ViewCam after release than I did before it, and weirdly, I'm enjoying it more. If you want to try it, it's at viewcam.tech.

## Brew Focus Is Approved

And because the universe decided this quarter needed one more thing: Brew Focus, my coffee-themed Pomodoro timer built with Tauri 2 and React, got approved by Google Play and is releasing soon. It started as a weekend project, became my daily driver for deep work sessions, and is now turning into a real product. There's a decent chance every feature in it was planned during a break that Brew Focus itself timed. The tool is building itself. I try not to think about it too hard.

## The Stack, or: An Identity Crisis in Twenty-Two Technologies

Someone asked me recently what I've been writing lately. I started answering, kept going, watched their face change, and kept going anyway.

The game side is the familiar territory: **C++** and **Unreal Engine** for the terrain plugin, **CMake** holding the builds together, and enough editor tooling that designers never have to see any of it.

ViewCam is its own small civilization. **Kotlin Multiplatform** and **Compose** on the mobile app, with some **Java** surviving in the corners like it always does. **CameraX** for capture, **H.264** encoding, **mDNS** for discovery so devices find each other like civilized machines. Then the desktop receiver: **C++17**, **Qt 6**, **QML** for the interface, **FFmpeg** doing the decoding, and **DirectShow** on Windows plus **v4l2loopback** on Linux convincing the OS that a webcam exists. There's a **Gradle** build on one side, **CMake** on the other, and an **Inno Setup** installer because Windows users deserve a Next button.

Brew Focus adds **Rust** and **Tauri 2** with a **React** and **TypeScript** front end, which means my Pomodoro timer has a memory-safe backend. Priorities.

And around all of that, the fullstack months piled on **TypeScript**, **React**, **Svelte**, **PostgreSQL**, **Docker**, and an amount of glue code between everything that I refuse to count as a technology, even though at this point it deserves its own name.

For years my answer to "what do you write" was two words: "C++, engines." That's still the core of who I am as an engineer, and nobody is taking manual memory management away from me. But shipping across this many layers in one stretch does something to how you see the boundaries. The web stack stopped being "that other world" and became just another set of constraints. A frame budget and a page load budget are the same conversation with different units.

## The Takeaway

Silence on a blog says nothing about output. My commit history from these three months is the loudest it has ever been, even if half the messages are "fix", "actual fix", and "fix for real this time".

Two studios trusted me with their work, and one of those turned into the biggest role of my career. One product is live on Google Play with real users. Another is approved and on the way. There's a flight to Japan on the horizon and a checklist that keeps growing.

I'm proud of this stretch. Genuinely, unashamedly proud. And now that I've remembered the blog exists, I have about six drafts worth of technical material from these months alone.

Back to writing.`,
  },
  {
    slug: "why-cpp-is-still-king",
    title: "Why C++ Is Still Irreplaceable in Game Development",
    date: "2026-05-07",
    category: "Engineering",
    featured: true,
    tags: ["C++", "Game Dev", "Engineering"],
    excerpt:
      "Every few years someone declares C++ dead and points to Rust, Zig, or some managed language as its replacement. They're wrong, and here's why it matters for game development specifically.",
    content: `Every few years someone declares C++ dead. The arguments are always the same: memory safety, undefined behavior, arcane syntax, "just use Rust." And every time, the game industry quietly ships another AAA title built entirely in C++.

I've spent years writing C++ for Unreal Engine, building rendering systems, and teaching DirectX 11. Here's my honest take on why C++ isn't going anywhere for real-time game development.

## Performance Is Non-Negotiable

A game running at 60fps has 16.6ms per frame. At 120fps, you get 8.3ms. That budget covers physics, AI, animation, audio, rendering. Everything. Any language overhead that isn't absolutely zero is a tax you pay on every single frame, forever.

C++ gives you:

- **Zero-cost abstractions**: templates and inlining let you write clean code that compiles to the same assembly as hand-written C
- **Deterministic memory layout**: you decide exactly where your data sits in memory, which matters enormously for cache performance
- **No runtime**: no GC pauses, no JIT warmup, no hidden allocations

Rust gets close on most of these. Go and C# have GC. Python doesn't belong in this conversation.

![Every 16ms, without fail](/images/CppPerformance.webp)

## The Ecosystem Is Decades Deep

Unreal Engine is ~4 million lines of C++. The PhysX, Havok, Wwise, and Fmod SDKs are C and C++ with thin C headers. DirectX, Vulkan, Metal, and OpenGL all have C APIs with well-established C++ wrappers. Every major profiler, sanitizer, and debugger on the planet is built around C++ workflows.

When I'm debugging a crash in a shipped Unreal build, I get a full callstack with symbols. When I profile a draw call bottleneck with PIX or RenderDoc, I'm reading C++ source. The tooling assumes C++, and it's extraordinary tooling.

Rebuilding this ecosystem in another language isn't a two-year project. It's a generational one.

## Unreal Is the Standard

If you're making games professionally, especially on console or PC, you're almost certainly touching Unreal Engine. Unreal is C++. Not "you can optionally use C++"; the engine *is* C++. Blueprints compile to C++ bytecode. GAS (Gameplay Ability System) is C++. The renderer, the physics, the networking stack, all C++.

Choosing a different language for a game studio means forking yourself away from the largest, most capable engine on the market. That's a serious competitive disadvantage.

## What Rust Actually Gets Right

I want to be fair. Rust's ownership model genuinely solves a class of bugs that C++ developers deal with through discipline and tooling:

- Use-after-free
- Data races
- Null pointer dereferences

These are real problems. In my experience they're manageable in C++ with ASAN, proper review culture, and smart pointers, but Rust makes them *impossible* at the type system level, which is a real win.

![Rust evangelists showing up to every C++ thread](/images/RustVSCPPMeme.gif)

Rust will likely become the second language of systems programming. It's already there for OS and embedded work. In games, it's making inroads in tooling and server-side game logic. Full engine adoption is years away.

## The Bottom Line

C++ isn't the *best* language. It has real footguns. The build times are painful. The error messages are infamous. But for real-time interactive software that has to extract every microsecond from the hardware, it's still the standard, and the ecosystem makes it irreplaceable for now.

The day I can write a production Unreal plugin in another language with zero FFI overhead and full engine integration, I'll reconsider. Until then, write better C++.`,
  },
  {
    slug: "shadow-mapping-dx11",
    title: "Shadow Mapping from Scratch in DirectX 11",
    date: "2026-04-18",
    category: "Graphics",
    featured: false,
    tags: ["DirectX 11", "HLSL", "Graphics"],
    excerpt:
      "Shadow mapping is one of those techniques that looks simple on paper and punishes you the moment you go off-script. Here's the full picture: depth bias, PCF, and the math that actually makes it work.",
    content: `Shadow mapping is deceptively simple to describe: render the scene from the light's point of view, store depths, then compare in the main pass. In practice, it's one of the first places beginners hit a wall: acne, peter-panning, precision artifacts. The fixes aren't obvious unless you understand what's actually happening at the hardware level.

This is the writeup I wish I had when I first implemented shadows in my DX11 renderer.

## The Two-Pass Setup

The core idea: two render passes, one shadow map texture, one matrix.

**Pass 1: Shadow pass:** Render the scene from the light's perspective using an orthographic (directional light) or perspective (spot/point light) projection. Write only depth to a depth-stencil texture. No color output needed.

\`\`\`hlsl
// Shadow pass vertex shader: transform to light space
float4 VS_Shadow(float3 pos : POSITION) : SV_Position
{
    return mul(float4(pos, 1.0), lightViewProj);
}
\`\`\`

**Pass 2: Main pass:** For each fragment, transform its world position into light clip space, divide by w to get NDC, map to UV space, sample the shadow map, and compare depths.

\`\`\`hlsl
float SampleShadow(float4 posLightSpace, Texture2D shadowMap, SamplerState ss)
{
    float3 proj = posLightSpace.xyz / posLightSpace.w;
    float2 uv   = proj.xy * 0.5 + 0.5;
    uv.y        = 1.0 - uv.y; // DX11: Y axis is flipped

    float shadowDepth = shadowMap.Sample(ss, uv).r;
    return (proj.z - 0.001 > shadowDepth) ? 0.0 : 1.0;
}
\`\`\`

That 0.001 is the depth bias. Get it wrong and you get shadow acne. Too aggressive and geometry floats above its shadow (peter-panning).

## Shadow Acne and Depth Bias

Shadow acne happens because the depth stored in the shadow map is slightly imprecise compared to the depth computed in the main pass. The surface ends up shadowing itself.

The bias should be proportional to the angle between the surface normal and the light direction:

\`\`\`hlsl
float bias = max(0.005 * (1.0 - dot(normal, lightDir)), 0.0005);
float shadow = (proj.z - bias > shadowDepth) ? 0.0 : 1.0;
\`\`\`

DX11 also exposes hardware depth bias through the rasterizer state, applied during the shadow pass itself:

\`\`\`cpp
D3D11_RASTERIZER_DESC rsd = {};
rsd.DepthBias            = 1000;
rsd.DepthBiasClamp       = 0.0f;
rsd.SlopeScaledDepthBias = 1.0f;
rsd.FillMode             = D3D11_FILL_SOLID;
rsd.CullMode             = D3D11_CULL_BACK;
device->CreateRasterizerState(&rsd, &shadowRasterState);
\`\`\`

## PCF for Soft Edges

Hard shadows look bad. Percentage Closer Filtering (PCF) averages multiple shadow map samples around the lookup point to produce a soft penumbra. It's cheap and looks good.

\`\`\`hlsl
float PCF(float4 posLS, Texture2D shadowMap, SamplerComparisonState cmpSampler)
{
    float3 proj = posLS.xyz / posLS.w;
    float2 uv   = proj.xy * 0.5 + 0.5;
    uv.y        = 1.0 - uv.y;
    float  d    = proj.z;

    float shadow = 0.0;
    float2 texelSize = 1.0 / float2(2048, 2048);

    [unroll] for (int x = -1; x <= 1; ++x)
    [unroll] for (int y = -1; y <= 1; ++y)
    {
        shadow += shadowMap.SampleCmpLevelZero(
            cmpSampler, uv + float2(x, y) * texelSize, d
        );
    }
    return shadow / 9.0;
}
\`\`\`

SampleCmpLevelZero with a SamplerComparisonState (LESS_EQUAL) lets the hardware do the depth comparison and bilinear filter the result. You get 4 comparisons for the price of one sample.

## Resolution and Cascade Tradeoffs

A 1024x1024 shadow map covers the entire scene with one texel per ~5cm at typical ranges. A 4096x4096 map costs 64MB of VRAM. For production you want Cascaded Shadow Maps (CSM): 3-4 shadow maps covering exponentially larger fractions of the view frustum. Near cascade is small and high-res; far cascade is large and low-res. The transition is hidden by blending.

That's a longer topic, but the foundation above is what every cascade builds on.`,
  },
  {
    slug: "lessons-from-shipping-on-steam",
    title: "What Shipping Two Steam Games Taught Me",
    date: "2026-03-22",
    category: "Career",
    featured: false,
    tags: ["Game Dev", "Steam", "Career"],
    excerpt:
      "I shipped my first Steam title at 16. By the time the second one launched, I had a completely different understanding of what 'done' means and what players actually care about.",
    content: `I shipped Endless Combat on Steam when I was 16, built with a small team at FataliTech Game Studios. The second shipped title was The Stranger, a VR experience that went on to win Best Game at the WN Unreal European Developer Contest. Two very different games, two very different lessons.

Here's what actually stayed with me.

## Version 1.0 Is a Lie

Nobody ships a finished game. You ship the version you can no longer improve before running out of time or money. The Endless Combat launch build had bugs I knew about and chose to ship with because fixing them would have taken two more months and the scope would have kept expanding.

That's not laziness, that's the reality of game development. The question is which bugs you can live with and which ones will destroy your review score overnight.

For Endless Combat: a memory leak that surfaced after 90+ minutes of continuous play. We shipped it. Most sessions were under 30 minutes. It never appeared in a review.

## Players Don't Care About Your Architecture

I spent weeks on a clean ECS-adjacent component system for the combat entities in Endless Combat. Zero players ever noticed. What they noticed: the hit feedback felt weak. Two days of polish on camera shake, screen flash, and audio had more impact on review sentiment than the entire architecture effort.

The architecture matters to you, for maintainability and iteration speed. But it's invisible to the player. Spend your polish time on what players feel.

## Performance Trumps Features

For The Stranger (VR), hitting a stable 90fps was not optional. It was the whole product. A dropped frame in VR doesn't just hurt performance metrics, it causes physical discomfort. I rewrote the occlusion culling system twice chasing that 20% render time reduction that finally got us there.

In flat games you can often negotiate with performance. In VR you cannot. But the lesson generalizes: a fast, stable game with fewer features will always outscore a feature-rich game that hitches on loading.

## Steam Wishlists Are Your Real Metric

Before launch, the number that matters is wishlists, not follows, not Discord members, not trailer views. Wishlists convert to purchases at a predictable rate (~10-20% on launch day sales). If you don't have enough wishlists, no amount of launch day marketing compensates.

For a small indie game, getting to ~1000 wishlists before launch is the threshold where the Steam algorithm starts doing any meaningful work for you.

## Ship Earlier Than You're Comfortable With

The single biggest mistake first-time developers make is waiting until the game feels "ready." It never feels ready. The feedback you get from 100 real players in the first week of Early Access is worth more than another 3 months of internal iteration.

Ship something real. Fix it publicly. That loop, if you stay honest and responsive, builds more goodwill than a polished-looking trailer with no substance behind it.`,
  },
  {
    slug: "why-i-started-writing-rust",
    title: "Why I Started Writing Rust",
    date: "2025-09-14",
    category: "Engineering",
    featured: false,
    tags: ["Rust", "C++", "Engineering"],
    excerpt:
      "I spent two years telling people Rust was solving a problem I didn't have. Then I used it on a real project and changed my mind faster than I expected.",
    content: `I spent two years telling people Rust was solving a problem I didn't have. I wrote C++ for a living, ran ASAN on debug builds, kept smart pointers consistent, and hadn't shipped a use-after-free in a long time. The borrow checker felt like a compiler that didn't trust me.

Then I used it on an actual project, and my opinion shifted faster than I expected.

## What Actually Changed My Mind

It wasn't safety. That's what everyone leads with, but it's not what got me.

It was cargo. After years of C++ with CMake, vcpkg, Conan, custom build scripts, and FindPackage hell, running cargo add and having a dependency just work was a genuine shock. No linker flags to figure out. No ABI mismatch. No transitive header dependency that needs an obscure preprocessor define to compile correctly.

The toolchain ships complete. cargo fmt, cargo clippy, cargo test, cargo bench. In C++ each of those is a separate project you choose, configure, and fight to integrate. In Rust they're already there when you install the language.

That alone changed how fast I could start something.

## Then the Borrow Checker Started Helping

I said safety wasn't what convinced me. That's true. But once I was past the initial friction and writing real code, I stopped viewing the borrow checker as a nanny and started reading what it was actually telling me.

Every error it generates is a question: who owns this, when does this reference expire, is this safe to send across a thread? Those are questions I've been writing in code review for years. In C++ the answer is a comment and a convention. In Rust it's a compile error.

I caught a real ownership bug in a parser I was writing because the borrow checker refused to compile a pattern I hadn't thought through. In C++ I would have shipped it, it would have worked in testing, and surfaced under a specific input months later.

## Where C++ Is Still the Right Call

Unreal Engine is C++, full stop. SleakEngine is C++. When I'm writing code that calls into DX11, Vulkan, or any C ABI, C++ is what I reach for. The FFI boundary in Rust works, but it's not free, and for engine code in the hot path that matters.

Anything involving heavy SIMD, tight platform-specific intrinsics, or codebases with years of institutional investment stays in C++.

## Where I Use Rust Now

CLI tools, build tooling, language servers, anything I'd have previously written as a Python script but actually wanted to be fast. Network utilities where I want a single binary I can ship to a Linux server with no runtime dependencies. Parser and compiler work where the type system pays for itself.

The single static binary story is genuinely good. Cross-compile with CARGO_TARGET set and you get a Linux binary from your Windows machine in seconds. I've shipped tools that I built locally to servers I don't control and they ran first try.

## The Learning Curve

The first few weeks are harder than people admit. The borrow checker rejects things that feel correct, and you spend time on "why won't this compile" instead of "what am I building". Lifetime annotations look intimidating before they make sense.

After about a month of real use it clicked. The compiler errors are the most helpful I've seen in any language. They tell you exactly what's wrong and usually suggest the fix. That's the opposite of a C++ template error generating 200 lines of noise.

A year in, going back to C++ occasionally makes me miss having the compiler ask the ownership questions I'd otherwise hold in my head.`,
  },
  {
    slug: "go-for-api-development",
    title: "Go Is the Right Tool for API Backends",
    date: "2025-11-03",
    category: "Engineering",
    featured: false,
    tags: ["Go", "Backend", "Engineering"],
    excerpt:
      "I've written backends in Node.js, Express, and FastAPI. They all work. But when I need something that will hold up under real load without babysitting it, I write Go.",
    content: `I've written backends in Node.js, Express, and FastAPI. They all work. The ecosystems are mature, the communities are large, and you can build something real with any of them.

But when I need a backend that holds up under actual load, that I can ship as a single binary and not think about again, Go is what I reach for. The reasons are specific.

## The Concurrency Model Is the Language

In Node.js, concurrency is a workaround. You're on a single thread, so async/await exists to let you pretend you're not. Once you need real CPU parallelism, or a third-party library doesn't play well with async, or you need to reason about what runs when, you're fighting the execution model instead of using it.

Go was designed around concurrency from the start. Goroutines are cheap, the runtime schedules them across OS threads, and channels give you a clean way to communicate between them.

\`\`\`go
func handleRequests(listener net.Listener) {
    for {
        conn, err := listener.Accept()
        if err != nil {
            continue
        }
        go handleConn(conn)
    }
}
\`\`\`

That go keyword is doing real work. The runtime handles the rest. You can spin up thousands of goroutines and the overhead stays manageable because they start with small stacks that grow on demand.

I've built services handling hundreds of concurrent connections where the implementation was straightforward because goroutines made it straightforward, not because I was clever about it.

## The Binary Ships Itself

Go compiles to a single static binary. You build it, copy it to a server, run it. No node_modules to install, no Python virtual environment to manage, no runtime version to pin.

Cross-compilation is also trivial. GOOS=linux GOARCH=amd64 go build on Windows produces a Linux binary in seconds with no additional setup. A Docker image with a Go binary is smaller and simpler than one carrying a Node.js runtime and a hundred megabytes of node_modules. Cold starts on serverless are faster because there's no interpreter to spin up.

## The Standard Library Is Enough

The Go standard library has a production-quality HTTP server built in. Not "good enough for demos", actually production-quality. The net/http package is what many real services run directly without any framework on top.

\`\`\`go
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /api/projects", getProjects)
    mux.HandleFunc("POST /api/contact", handleContact)

    log.Fatal(http.ListenAndServeTLS(":443", "cert.pem", "key.pem", mux))
}
\`\`\`

Go 1.22 added method and path parameter support to the standard router, which closes the last real gap where people were reaching for third-party routing libraries. I've built APIs with zero external packages except a database driver. The standard library handles JSON encoding, context propagation, TLS, and structured logging through slog. You need fewer dependencies than in most other ecosystems.

## What Go Gets Wrong

Error handling is verbose. You write if err != nil { return err } constantly, and there's no getting around it. The language made a deliberate choice here and the rationale is defensible, but it makes some functions tedious to read.

Generics landed in 1.18 and they work, but the constraint syntax has rough edges and the community was slow to adopt them. You'll find older libraries that duplicate code where generics would have cleaned things up.

These are real complaints. They don't change my answer for backend work. The concurrency model and deployment story are concrete wins that outweigh the verbosity for the kind of services I've been building.`,
  },
  {
    slug: "vulkan-vs-other-graphics-apis",
    title: "What Makes Vulkan Different from Every Other Graphics API",
    date: "2025-07-22",
    category: "Graphics",
    featured: false,
    tags: ["Vulkan", "DirectX 11", "Graphics"],
    excerpt:
      "The first Vulkan hello triangle example I read was 700 lines. OpenGL's is 50. That gap isn't bloat. It's everything the driver was hiding from you.",
    content: `The first Vulkan hello triangle I found was 700 lines of code. OpenGL's is 50. That gap is not bloat, not academic overengineering, not a committee making things complicated for fun. Every one of those lines is explicit control over something the OpenGL driver was handling for you, through heuristics you had no visibility into. Whether you need that control depends on what you're building.

## What OpenGL Was Actually Doing

OpenGL is a state machine designed in the early 1990s. You bind things, set state, draw. The driver handles memory allocation, decides when to synchronize the CPU and GPU, compiles shader variants on demand, and manages resource lifetimes based on patterns it recognizes.

The problem is the driver has to be conservative. It doesn't know if you'll modify a buffer before the GPU finishes reading it, so it stalls. It doesn't know which pipeline state combinations you'll hit, so it compiles them lazily and you get stutters the first time a new combination appears. It doesn't know your memory access patterns, so it places resources in heap types that might not match your workload.

The driver is doing its best. But it can't make better decisions than you, because it doesn't have your application's context. Vulkan gives that context back.

## The Explicit Model

In Vulkan you create resources with explicit usage flags, allocate memory from specific heap types, manage layout transitions, and record command buffers yourself.

\`\`\`cpp
VkBufferCreateInfo bufInfo{};
bufInfo.sType       = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
bufInfo.size        = sizeof(vertices);
bufInfo.usage       = VK_BUFFER_USAGE_VERTEX_BUFFER_BIT | VK_BUFFER_USAGE_TRANSFER_DST_BIT;
bufInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

vkCreateBuffer(device, &bufInfo, nullptr, &vertexBuffer);

VkMemoryRequirements memReqs;
vkGetBufferMemoryRequirements(device, vertexBuffer, &memReqs);

VkMemoryAllocateInfo allocInfo{};
allocInfo.sType           = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
allocInfo.allocationSize  = memReqs.size;
allocInfo.memoryTypeIndex = findMemoryType(memReqs.memoryTypeBits, VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT);

vkAllocateMemory(device, &allocInfo, nullptr, &vertexBufferMemory);
vkBindBufferMemory(device, vertexBuffer, vertexBufferMemory, 0);
\`\`\`

In OpenGL that was glBufferData. In Vulkan it's 20 lines. But now you chose the heap type, you know exactly where in GPU memory this lives, and you can reuse that allocation block for other resources. The driver is not guessing.

## How DX11 Compares

I've written a lot of DX11 code and I teach it on Udemy. It sits between OpenGL and Vulkan on the explicitness spectrum in a way that works well for most projects.

DX11 replaced OpenGL's state machine with a cleaner object model. You create typed resource objects, bind them through context slots, and the driver handles synchronization. It's more predictable than OpenGL because the API design is better, not because you have more explicit control.

For getting a solid renderer working without spending three weeks on infrastructure, DX11 is still what I'd recommend. The learning curve is reasonable, PIX and RenderDoc are excellent on Windows, and the API design doesn't constantly fight you. That's why I built it into SleakEngine first and why I teach it.

What DX11 doesn't give you: control over command buffer recording, visibility into the synchronization model, fine-grained pipeline barriers, or multi-threaded rendering that correctly leverages the hardware. At the performance ceiling, that costs you.

DX12 is Microsoft's answer to Vulkan. Explicit command lists, descriptor heaps, pipeline state objects compiled upfront, resource barriers you manage yourself. The APIs solve the same problems differently. Vulkan has a slight edge for cross-platform coverage (Linux, Android, macOS via MoltenVK) and DX12 has a slight edge on Windows tooling with PIX.

## Synchronization Is Where It Actually Gets Hard

The verbosity of resource creation is just typing. You learn it once and it becomes mechanical.

Synchronization is the real difficulty. The GPU runs asynchronously. Writing to a buffer on the CPU and reading it on the GPU in the next draw call without a barrier is undefined behavior, and Vulkan will not tell you at runtime that you did something wrong. You get corruption or a crash with no explanation.

\`\`\`cpp
VkImageMemoryBarrier barrier{};
barrier.sType               = VK_STRUCTURE_TYPE_IMAGE_MEMORY_BARRIER;
barrier.oldLayout           = VK_IMAGE_LAYOUT_UNDEFINED;
barrier.newLayout           = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL;
barrier.srcQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
barrier.dstQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
barrier.image               = textureImage;
barrier.srcAccessMask       = 0;
barrier.dstAccessMask       = VK_ACCESS_TRANSFER_WRITE_BIT;

vkCmdPipelineBarrier(
    cmdBuffer,
    VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT,
    VK_PIPELINE_STAGE_TRANSFER_BIT,
    0, 0, nullptr, 0, nullptr,
    1, &barrier
);
\`\`\`

Pipeline stages, access masks, image layout transitions. Understanding these requires actually knowing how GPU hardware executes work, not just learning API syntax. The Vulkan spec is the reference and you do need to read it.

Enable the validation layers in development and Vulkan will catch most synchronization mistakes at runtime. Ship without them and they're zero overhead. That's a good deal.

## When It's Worth It

Vulkan makes sense when you need the performance ceiling, when you're targeting multiple platforms including Linux or Android, or when you want to understand what modern GPU hardware actually does rather than what the driver decides to do for you.

For a prototype, a tool, or anything where shipping matters more than squeezing the last 15% of GPU performance, DX11 or even OpenGL will get you there faster and be easier to debug when things go wrong.

I'm building both backends in SleakEngine, DX11 and Vulkan. DX11 for rapid iteration on Windows, Vulkan for performance and Linux. Running them in parallel makes the tradeoffs very concrete very fast. The same render pass in DX11 is half the code. The Vulkan version gives me synchronization control and profiling depth I can't get any other way.

Neither is the wrong choice. They're different points on a tradeoff curve.`,
  },
  {
    slug: "custom-memory-allocators-cpp",
    title: "Custom Memory Allocators in C++: Pool, Arena, and When to Use Each",
    date: "2025-04-08",
    category: "Engineering",
    featured: false,
    tags: ["C++", "Performance", "Memory", "Engineering"],
    excerpt:
      "malloc isn't the bottleneck people think it is, until it is. Here's when you actually need to write your own allocator and which pattern fits which problem.",
    content: `The default allocator in C++ is excellent. malloc has been optimized for decades by people far smarter than most of us. For 90% of code you should not write your own. The performance difference between a custom allocator and malloc, on most workloads, is measurable but small.

But if you're writing a game engine, a high-frequency trading system, or anything that allocates and frees thousands of times per frame, that small difference becomes the entire frame budget. This is when custom allocators matter.

I've written three of these for SleakEngine. Here's when each one is the right call.

## What's Actually Wrong with malloc for Games

malloc has to handle everything. Tiny allocations, huge allocations, threaded allocations, allocations that live forever, allocations that die in microseconds. To do this it maintains complex internal data structures, locks for thread safety, and free lists for various size classes.

In a game engine you usually know more about your allocation patterns than malloc does. You know that all transient frame data can be freed at the end of the frame. You know that all entities in a level have similar sizes and lifetimes. You know that physics broadphase data is allocated and freed in lockstep with the simulation tick.

When you know your patterns, you can build allocators that are dramatically faster because they don't have to handle the general case. Order of magnitude faster, in some cases.

## The Linear Arena

Use case: anything allocated during a frame and freed all at once at the frame's end.

The implementation is almost embarrassingly simple. A block of memory and a pointer to the next free byte:

\`\`\`cpp
class LinearArena {
public:
    LinearArena(size_t size)
        : buffer_(static_cast<uint8_t*>(std::malloc(size)))
        , offset_(0)
        , capacity_(size)
    {}

    ~LinearArena() { std::free(buffer_); }

    void* allocate(size_t bytes, size_t align = alignof(std::max_align_t)) {
        size_t aligned = (offset_ + align - 1) & ~(align - 1);
        if (aligned + bytes > capacity_) return nullptr;
        offset_ = aligned + bytes;
        return buffer_ + aligned;
    }

    void reset() { offset_ = 0; }

private:
    uint8_t* buffer_;
    size_t   offset_;
    size_t   capacity_;
};
\`\`\`

That's the entire allocator. Allocation is two integer operations and a bounds check. There's no free function for individual allocations because you don't free individual things. You reset the whole arena at the end of the frame.

In SleakEngine I have a per-frame arena that gets reset after the render thread finishes. Anything that needs scratch memory during the frame allocates from it. The cost per allocation is a few CPU cycles. Compared to malloc, which can be hundreds of cycles for a small allocation, this is a meaningful win when you're allocating thousands of times per frame.

The cost is that you give up granular freeing. If something allocated from an arena escapes its lifetime, you have a use-after-free. Arenas work because their lifetime is well-defined.

## The Pool Allocator

Use case: many objects of the same size with unpredictable lifetimes.

If your game has 5000 entities, all 256 bytes each, and they get created and destroyed throughout the level's lifetime, a pool is what you want.

The pool pre-allocates a fixed array of slots, all the same size. A free list points to the next available slot. Allocation pops from the free list. Deallocation pushes back onto it.

\`\`\`cpp
template <typename T>
class PoolAllocator {
public:
    PoolAllocator(size_t count)
        : storage_(static_cast<Slot*>(std::malloc(sizeof(Slot) * count)))
        , freeList_(storage_)
    {
        for (size_t i = 0; i < count - 1; ++i) {
            storage_[i].next = &storage_[i + 1];
        }
        storage_[count - 1].next = nullptr;
    }

    T* allocate() {
        if (!freeList_) return nullptr;
        Slot* slot = freeList_;
        freeList_  = freeList_->next;
        return reinterpret_cast<T*>(slot);
    }

    void deallocate(T* obj) {
        Slot* slot = reinterpret_cast<Slot*>(obj);
        slot->next = freeList_;
        freeList_  = slot;
    }

private:
    union Slot {
        T    data;
        Slot* next;
    };

    Slot* storage_;
    Slot* freeList_;
};
\`\`\`

Allocation and deallocation are constant time, both are a handful of pointer operations. There's no fragmentation because every slot is the same size. Cache performance is excellent because objects sit contiguously in memory.

The cost is that the pool size is fixed at construction. You can grow it (add a new block when the free list is empty) but that complicates the implementation. You can't easily allocate variable-sized things from a pool either, so if your entity sizes vary you need either multiple pools (one per size class) or a different allocator.

## The Stack Allocator

Use case: scoped allocations within a function or system, freed in reverse order.

A stack allocator is a linear arena with the ability to mark a position and "rewind" to it. Useful for recursive algorithms where each level allocates scratch data and you want to free it on the way back up.

\`\`\`cpp
class StackAllocator {
public:
    StackAllocator(size_t size)
        : buffer_(static_cast<uint8_t*>(std::malloc(size)))
        , offset_(0)
        , capacity_(size)
    {}

    using Marker = size_t;
    Marker mark() const { return offset_; }
    void rewind(Marker m) { offset_ = m; }

    void* allocate(size_t bytes, size_t align = alignof(std::max_align_t)) {
        size_t aligned = (offset_ + align - 1) & ~(align - 1);
        if (aligned + bytes > capacity_) return nullptr;
        offset_ = aligned + bytes;
        return buffer_ + aligned;
    }

private:
    uint8_t* buffer_;
    size_t   offset_;
    size_t   capacity_;
};
\`\`\`

You take a marker before doing your allocations, then rewind to it when you're done. The pattern is similar to a function call stack: push, work, pop.

I use this in SleakEngine for things like physics broadphase queries. The query allocates scratch data, fills it, hands the result back, and the caller rewinds when done. No malloc calls during the query, no individual deallocations.

## Which One to Reach For

Frame-scoped scratch data: linear arena.

Many objects of one size with mixed lifetimes: pool allocator.

Scoped scratch within a function or call hierarchy: stack allocator.

Anything else: malloc, until you've profiled and shown malloc is the bottleneck.

The ordering matters. The single biggest mistake I see in custom allocator code is reaching for these patterns before they're justified. Custom allocators add complexity, fragmentation if you mix patterns wrong, and bugs that are particularly nasty to debug because you've stepped outside the standard library's safety nets.

## What I Don't Roll Myself

I don't write my own general-purpose allocator. mimalloc and tcmalloc exist and they're the work of teams of specialists. If I need a general allocator faster than the system one, I link against one of those.

I don't write my own thread-local allocator from scratch either. The interaction between thread-local storage, lock-free data structures, and memory fences is a research area, not a "I'll bang this out in a weekend" area.

The custom allocators I write are the ones above. Simple patterns for known workloads, where the entire implementation fits on a screen and the failure modes are obvious. Anything more complex than that, I use a battle-tested library.`,
  },
  {
    slug: "vr-frame-rate-72-to-90",
    title: "How I Optimized a VR Frame Rate from 72fps to Stable 90",
    date: "2025-02-15",
    category: "Graphics",
    featured: false,
    tags: ["VR", "Performance", "Graphics", "Unreal Engine"],
    excerpt:
      "In a flat game, dropping from 90fps to 70fps for a few frames is a minor visual hiccup. In VR, the same drop will make someone reach for a trash can. Here's how we closed that gap on The Stranger.",
    content: `In a flat game, dropping from 90fps to 70fps for a few frames is a minor visual hiccup. Most players won't even notice. In VR, the same drop will make someone reach for a trash can.

This is the story of how I dragged The Stranger from 72fps to a stable 90, what actually moved the needle, and what I wasted a week on that didn't.

## The Setting

The Stranger is a VR experience we built at Reality Arts Studio. It later won Best Game at the WN Unreal European Developer Contest. Before that, it had a problem: on the recommended hardware spec it was running at 72fps with regular dips into the 60s. For a flat game that's fine. For a VR title that's unshippable.

We had two months. Performance was the entire job.

## What I Tried First (Wrong Move)

The instinct most engineers have when a game is slow is to look at the hottest function in the profiler and start optimizing it. I did this. I spent four days rewriting a particle update system in pure C++ instead of Blueprint, shaving roughly 0.4ms off our frame time.

We needed to find about 5ms. I'd just spent four days for less than 10% of the gap.

Lesson: when you're way off a perf target, bottleneck-by-bottleneck optimization is a losing strategy. You need to find the thing that's wasting frames in bulk, not the thing that's slightly inefficient.

## What Actually Moved the Needle

Three things gave us almost all the win.

**Custom occlusion culling.** Unreal's default occlusion system is good but conservative. It's designed to never produce a popping artifact, which means it draws things that are technically visible from one pixel that isn't fully occluded. In a forest scene with thousands of trees and rocks, that conservatism costs you. I wrote a per-frame visibility system using a smaller proxy mesh hierarchy that culled aggressively. Lost a few rare popping cases. Gained 2.8ms of GPU time.

**Aggressive LOD bias.** VR has a quirk: because the screen is split between two eyes, geometric detail beyond a certain distance is genuinely invisible. The engine doesn't know this. I built a custom LOD selector that ran the calculation against the per-eye projection, not the camera's full field of view. We dropped polygon counts in the distance significantly without a perceptible visual change.

**Shadow simplification.** This one hurt. Dynamic shadows at the visual quality our art team wanted were eating roughly 1.8ms. I cut them, replaced them with baked shadows on static geometry plus a simple contact shadow under the character. The art team initially fought me on it. We A/B tested it in a build. Nobody could tell which was which once the lighting was set up properly.

Total: about 4.6ms. That, plus the 0.4ms from the particles I'd already done, got us to a stable 90 with headroom for stress moments.

## What I Wasted Time On

A week on draw call batching that turned out to be irrelevant. The GPU wasn't bottlenecked on draw calls, it was bottlenecked on shader complexity and overdraw. Reducing draw calls from 800 to 600 saved us almost nothing.

Two days investigating whether to switch from forward to deferred rendering. We were on forward, which is the right call for VR because of MSAA support and the aliasing situation, but I had to actually rule out deferred to be sure.

## What I'd Do Differently

I'd have profiled with the per-eye render breakdown from day one. Unreal has tools for this and I didn't use them properly until week three. Most of my early optimization was based on flat-game intuition, not VR-specific data.

I'd also have started with the cuts the art team would hate, not the ones that were "safe". The shadow change was the highest impact and the one I deferred longest because I knew it would be a fight. Should have been first.

## The Lesson

VR perf is a different sport from flat-game perf. Most of the standard advice still applies, but the priorities reorder. Overdraw matters more. Shader complexity matters more. Draw call counts matter less because you're already paying for the doubled scene cost. Geometric LOD matters more because per-eye coverage is smaller than you think.

When the gap is large, look for the thing that's causing the entire renderer to do extra work, not the thing in the profiler that's slightly hot.`,
  },
  {
    slug: "hlsl-from-first-principles",
    title: "HLSL From First Principles: What Shaders Actually Do",
    date: "2025-01-30",
    category: "Tutorials",
    featured: false,
    tags: ["HLSL", "DirectX 11", "Graphics", "Tutorials"],
    excerpt:
      "Most HLSL tutorials hand you a working triangle and call it done. You get a result. You don't get an understanding. This is the explanation I wish I'd had before I learned shaders.",
    content: `Most HLSL tutorials hand you a vertex shader, hand you a pixel shader, hand you a working triangle, and call it done. You get a result. You don't get an understanding.

This is the explanation I wish I'd had before I learned HLSL. It's not a tutorial in the "type this in" sense. It's the mental model of what a shader is, what it runs on, and what your code is actually doing.

## The Hardware You're Programming

A modern GPU is not a CPU with extra cores. The execution model is fundamentally different and you cannot write good shaders without understanding this.

When you draw a triangle, the GPU breaks it into pixels and runs your pixel shader on every one of them in parallel. Not "in parallel" in the loose CPU sense where threads might run at different times. In parallel in the sense that 32 or 64 pixel shader invocations execute the same instruction on the same clock cycle, on different data.

This is called SIMT (Single Instruction, Multiple Threads) and it has consequences you need to internalize. The most important one: branches in your shader are not free. If half your threads take one path and half take the other, both paths execute on all threads, with the results masked. A divergent branch costs you the sum of both branches, not the slower of them.

This is why "if (something)" in shader code can be much more expensive than it looks.

## What a Vertex Shader Actually Is

A vertex shader is a function that runs once per vertex. It reads attributes (position, normal, uv) from a buffer, transforms them somehow, and writes output that gets interpolated across the triangle's pixels.

\`\`\`hlsl
struct VSInput {
    float3 position : POSITION;
    float3 normal   : NORMAL;
    float2 uv       : TEXCOORD0;
};

struct VSOutput {
    float4 svPos    : SV_Position;
    float3 worldPos : POSITION;
    float3 normal   : NORMAL;
    float2 uv       : TEXCOORD0;
};

cbuffer FrameData : register(b0) {
    float4x4 worldMat;
    float4x4 viewProjMat;
};

VSOutput VS(VSInput input) {
    VSOutput o;
    float4 worldPos = mul(float4(input.position, 1.0), worldMat);
    o.svPos    = mul(worldPos, viewProjMat);
    o.worldPos = worldPos.xyz;
    o.normal   = mul(float4(input.normal, 0.0), worldMat).xyz;
    o.uv       = input.uv;
    return o;
}
\`\`\`

Every output marked SV_Position is the position in clip space, which the rasterizer needs to figure out where to put the triangle on screen. Every other output is interpolated across the triangle when the pixel shader runs. The interpolation is hardware, automatic, and free.

Most of what beginners struggle with in vertex shaders is matrix math. The trick is to remember the transformation chain: model space, then world space, then view space, then clip space, then screen space. Each space is just the same data transformed by a different matrix. If your geometry is in the wrong place on screen, you've messed up one of those transforms.

## What a Pixel Shader Actually Is

A pixel shader runs once per pixel covered by your triangle. Its job is to compute a color (and optionally a depth) for that pixel.

\`\`\`hlsl
Texture2D    diffuseTex : register(t0);
SamplerState linearSamp : register(s0);

cbuffer LightData : register(b0) {
    float3 lightDir;
    float3 lightColor;
};

float4 PS(VSOutput input) : SV_Target {
    float3 albedo = diffuseTex.Sample(linearSamp, input.uv).rgb;
    float3 N      = normalize(input.normal);
    float  NdotL  = saturate(dot(N, -lightDir));
    float3 lit    = albedo * lightColor * NdotL;
    return float4(lit, 1.0);
}
\`\`\`

That's a textbook diffuse lighting shader. Sample the diffuse texture, compute Lambertian lighting from the light direction and the surface normal, multiply, return.

The thing nobody tells you up front: input.normal here is the interpolated normal from the vertex shader. After interpolation across a triangle, it's no longer unit length. That's why you call normalize. Forgetting this is a common bug that produces lighting that's almost right but subtly wrong.

The other thing: every pixel shader invocation does this work. If your triangle covers a million pixels, this shader runs a million times. If you have ten lights, you do this work ten times per pixel. That's why pixel shader optimization is the bulk of real-time rendering performance work.

## What Texture Sampling Actually Does

When you call diffuseTex.Sample(...), you're doing more than reading a texture. The hardware computes which mip level to read based on the screen-space derivative of the UV coordinates, samples four texels (for bilinear filtering), interpolates them, and hands you the result.

The mip selection requires looking at neighboring pixel shader threads to compute the UV gradient. This is why texture sampling cannot happen inside divergent branches without weirdness. The hardware needs all four threads in a 2x2 quad to be active and reading texture coordinates. If they're not, you get artifacts at the divergence boundary.

This is one of those details that's almost always glossed over in tutorials. The tutorial says "you can sample textures in shaders". Yes. With caveats that matter when you start writing real code.

## What a Constant Buffer Actually Is

A constant buffer is memory uploaded from the CPU that the shader reads. It's called "constant" because it doesn't change during a single draw call, not because it's globally constant.

\`\`\`hlsl
cbuffer FrameData : register(b0) {
    float4x4 viewProj;
    float3   cameraPos;
    float    time;
};
\`\`\`

The register(b0) is the slot number. On the C++ side, you bind your buffer to slot 0. The shader reads from slot 0. If you bind the wrong thing or skip a slot, the shader reads garbage and you get a visual bug that's often hard to track down.

Constant buffer layout has a 16-byte alignment rule that surprises everyone the first time. Members are packed into 16-byte vectors and a single member cannot straddle a vector boundary. If you have a float, then a float3, the float3 starts on the next 16-byte boundary, leaving 12 bytes of padding. Get the layout wrong on the C++ side and your shader sees the wrong data.

I've debugged this exact problem more times than I'd like.

## What's Missing From Most Tutorials

Tutorials usually skip the things you actually hit on day three of writing real shaders:

The hardware execution model and why it matters for branching.

How interpolation works between vertex and pixel shaders.

Why texture sampling has specific rules around divergence.

Constant buffer alignment quirks.

The relationship between draw calls, pipeline state, and shader compilation.

These aren't edge cases. They're the things that block you when you go from textbook examples to a real renderer. Understanding them upfront saves you weeks of "why doesn't this work and what is the GPU doing".

## The Practical Path

If you're starting with shaders today, write three things in order.

A solid color triangle, where the only thing happening is vertex transformation.

A textured quad with simple bilinear sampling.

A diffuse-lit cube with one light.

Each of those teaches a specific thing. The triangle teaches the transformation pipeline. The quad teaches texture sampling and UVs. The cube teaches lighting math and normal handling. After you've written those and you understand each line, the rest of HLSL is variations on the same patterns.

The goal of learning shaders is not to memorize the syntax. The goal is to understand what the GPU is doing on every line of code. Once you have that, the syntax is the easy part.`,
  },
  {
    slug: "tools-before-games",
    title: "Why I Write Tools Before I Write Games",
    date: "2024-10-15",
    category: "Engineering",
    featured: false,
    tags: ["Game Dev", "Tools", "Engineering"],
    excerpt:
      "The first thing I do on any new game project is not build the game. It's build the tools I'll use to build the game. Three shipped titles later, I'm more convinced this is correct than when I started.",
    content: `The first thing I do on any new game project is not build the game. It's build the tools I'll use to build the game. This sounds like procrastination disguised as engineering. People have told me as much.

Three shipped titles later, I'm more convinced it's correct than I was when I started doing it.

## The Trap of Starting With the Game

When you start with the game, your iteration loop looks like this: change something in code, recompile, launch, navigate to the part of the game where the change matters, observe, decide if it's right, repeat.

If your recompile takes 30 seconds and your "navigate to the right part" takes 60 seconds, every iteration costs you 90 seconds. You'll make hundreds of changes during a project. That's hours of waiting per week, easily.

The trap is that those 90 seconds feel cheap each time. You don't notice them. You're "working". You're "iterating". Look at it across a project and you've spent multiple weeks on launch-and-navigate time.

Tools collapse that loop. A level editor that lets you tweak values and see results instantly is not a luxury. It's the difference between iterating once a minute and iterating ten times a minute. Across a year, that's the difference between a good game and a great one.

## What I Mean by Tools

Specific examples from things I've shipped.

For The Stranger, I built a level scripting tool that let our designers place trigger volumes and write simple state machines without writing C++. Before this tool, every encounter design required an engineer to implement it. After the tool, designers could prototype encounters end-to-end and engineers got involved only for things the tool couldn't express.

For Endless Combat, I built a wave editor that let us tune zombie spawn patterns by dragging timeline blocks. Tuning waves was previously a code change followed by a build. Afterward, it was real-time. We tuned three months of wave content in two weeks.

For SleakEngine, I built an asset cooker that watches the source asset directory and automatically reimports anything that changes. Before this, every texture change required manually running a tool. After, the engine just sees the new asset.

None of these tools are products. They're specific to the project they were built for. They collectively saved us thousands of hours.

## The Counterargument

The argument against tools-first is that you're optimizing for iteration speed before you know what you'll be iterating on. You build a level editor optimized for the kind of levels you imagine, then you discover the actual game wants something different, and your tool is solving the wrong problem.

This is real. I've done it. The first version of the wave editor for Endless Combat was wrong because we hadn't actually figured out what made waves fun yet, and the tool encoded assumptions that turned out to be limitations.

The fix is to build tools incrementally. The first version of any tool should be the simplest thing that helps. A spreadsheet that reads into the game. A JSON file that hot-reloads. A command-line script that does one specific thing. As you learn what you need, the tool grows. The mistake is building a complete tool upfront before you know what the game actually wants.

## How I Actually Do It

The first week of any project, I write three tools, in order.

A hot-reloader for game data. Whatever your game's content is (levels, enemies, items, dialogue), it should live in files the game can re-read at runtime without restarting. The day I get hot reloading working, the rest of development gets faster.

A scratch tweaker UI. Any value the designer might want to change ends up in a debug menu (I use ImGui for this) where it can be adjusted at runtime. The first time you tune a difficulty curve interactively instead of through file edit, recompile, restart, you understand why this is essential.

A logging and replay system. The ability to record a play session and replay it deterministically is the foundation of every other debugging tool. Bug reports become reproducible. Performance regressions become measurable. AI behavior issues become visible.

Three tools, maybe a week of work depending on the engine. Every project I've built that started with these has shipped faster than projects that didn't. I'm not aware of an exception in my experience.

## The Studio Lesson

At Reality Arts I learned something deeper. The studios that ship reliably have engineers dedicated to tools, not to gameplay or rendering. The output of a good tools engineer is the productivity of every other person on the team.

If your tools engineer makes the level designer 30% faster, and you have eight level designers, that engineer's work is functionally producing the output of 2.4 designers. This math compounds. A studio with strong internal tooling outproduces a studio with weak tooling at every level of staffing.

The reason most indie studios don't think this way is that they don't have the headcount to assign someone to tools. Fair. But you can still do this if you're working alone. You can be your own tools engineer for the first week of every project. The discipline is recognizing that it's a different mode of work, and a productive one, even when nothing visible to a player has been built yet.

## When It's the Wrong Call

Game jams. If you have 48 hours, build the game. Tools take time you don't have.

Very small prototypes. If you're testing whether a single mechanic is fun, you can probably get away with hardcoded values and a quick rebuild. Tools are overkill for proving a single idea.

Engines you don't own. If you're working in Unreal or Unity, you have most of the tools already. Your job is to extend them when needed, not build a new editor.

Anywhere else, in my experience, tools first wins.`,
  },
  {
    slug: "winning-best-game-contest",
    title: "What Winning a Game Dev Contest Actually Looks Like From the Inside",
    date: "2024-08-10",
    category: "Career",
    featured: false,
    tags: ["Game Dev", "Career", "Indie"],
    excerpt:
      "The press release is the part you see. Clean headline, photo of the team, link to the trailer. Here's what the actual experience looked like from inside the studio.",
    content: `The press release is the part you see. "Reality Arts Studio wins Best Game at WN Unreal European Developer Contest." Clean headline, photo of the team, link to the trailer. That's the version that goes on LinkedIn.

Here's what the actual experience looked like from inside the studio.

## The Decision to Submit

We almost didn't submit. The Stranger was in a weird state at the time: the core experience worked, but a third of the levels were rough, the menu system was a placeholder we hated, and we had a known crash on Quest 2 that only happened on cold boots.

Submitting meant freezing what we had, fixing what we could in two weeks, and accepting that judges would see the placeholder menu. The argument inside the studio was about whether that was worth the risk. The CEO and I were on the "submit" side. Two senior devs were on the "wait six months" side.

We submitted. The thing that pushed us over was a calendar reality. If we waited for the next round, our publisher timeline would shift and we'd lose three months of momentum. Better to ship something honest now than something polished later.

## The Crunch You Don't Talk About

The two weeks before the submission deadline were brutal. Not "team-building" brutal, the bad kind. I was working 12-hour days. My commit history from that period is a wall of "fix" "small fix" "another fix" with timestamps at 2am.

I'm not advocating for crunch. I'm telling you what happened. We made decisions about which bugs to fix and which to ship with based on what would be visible in a 15-minute judging session, not what mattered for a real player. There's a version of this story where someone burns out hard and quits afterward. We were lucky that didn't happen.

## What the Judging Actually Was

The judges were industry veterans, mostly from European studios. They got 15 to 20 minutes with each game. Some of them were in VR for the first time. Some had played hundreds of titles.

The thing that makes a game land in 15 minutes is not what makes a game last 20 hours. The opening matters disproportionately. The first locomotion experience needs to feel right. The first interactive object needs to be obviously interactive without a tutorial. We rewrote our opening twice in those two weeks because the first version had a 90-second exposition scene that was killing the energy.

I'm convinced that opening rewrite is what won us the prize. The rest of the game was good. The opening was the part that locked it in for the judges.

## The Email

We got the email at 3:47am Istanbul time. I was awake because of the time zones we were dealing with on the publisher side. I forwarded it to the team Slack and went to make coffee. By the time I came back, four people were already awake and replying.

That moment, between reading "we are pleased to inform you" and waking up the team, is the one I remember most clearly from the whole thing. Not the announcement at the conference. Not the photo. That email at 3:47.

## What Changed After

A lot, and not what I expected.

Inbound interest from publishers and partners increased, which we expected. Microsoft, Nvidia, and MSI partnerships came together over the next few months. Three Epic Games grants followed. Our recruitment pipeline opened up because suddenly we could hire people who would not have considered a small Turkish studio before.

What I didn't expect: the personal effect on the team was sharp and uneven. Two people on the team had been quietly carrying impostor syndrome for months and the win flipped that switch. One person, who had done excellent work but had been quiet about it, started speaking up in design meetings in a way they hadn't before. Another team member, who had been our rock, suddenly seemed less invested. I think for them the contest had been the carrot, and once we'd won, the daily grind of finishing the game was harder to face.

Wins change teams in ways you can't predict.

## What I Tell People Now

When a friend's studio asks me whether they should submit to a contest, I ask them three questions.

Is your build representative of the game you're trying to make? Not perfect, representative.

Are you ok with judges seeing the rough version? You will not get a chance to explain context. Whatever they see is the impression.

Can your team afford the two weeks before submission? If you're already burned out, do not do this.

If the answers are yes, submit. The lift from a real win is significant. Just go in knowing what you're trading for it.`,
  },
  {
    slug: "shipping-first-udemy-course",
    title: "How I Shipped My First Udemy Course and What the First Month Looked Like",
    date: "2024-04-20",
    category: "Career",
    featured: false,
    tags: ["Teaching", "Udemy", "DirectX 11", "Career"],
    excerpt:
      "Plenty of guides will tell you how to make a Udemy course. None of them tell you what the first month actually feels like after you publish. Here's mine.",
    content: `Plenty of guides will tell you how to make a Udemy course. They'll give you camera specs, microphone recommendations, a curriculum template. None of them tell you what the first month actually feels like after you publish.

Here's what mine looked like.

## What I Actually Built

The course is Advanced DirectX 11 Graphics Programming. C++ and HLSL. The pitch is that most DirectX 11 courses online are surface-level wrappers around Microsoft's tutorials. I wanted one that built a real rendering framework from scratch and went deep into the stuff people actually need: shadow mapping, deferred rendering, post-processing pipelines, custom material systems.

Recording took about three months of evenings and weekends while I was still working at Reality Arts Studio. 18 hours of video, a complete codebase that builds and runs, slides for the conceptual sections.

## The Day I Hit Publish

I'm not going to pretend I had a strategy. I had a course, a rough description, and a thumbnail I'd made in Photoshop in about four hours. I clicked publish on a Wednesday evening. Watched the page go live. Refreshed it. Refreshed it again.

Nothing happened.

I knew nothing was supposed to happen. New courses don't show up in search results immediately. There's a quality review period. Even after that, you're at the bottom of every category page. I knew this intellectually. I refreshed the analytics dashboard anyway, every hour, for the first three days.

## Week One

Three sales in the first week. All from the link I'd posted on LinkedIn. Two of them were people I knew personally who were just being supportive. One was an actual stranger.

I read the first stranger's enrollment notification probably 20 times. It still feels different from the others. Someone who had no reason to support me, who didn't know me, decided this was worth their money.

I also got my first review in week one. Three stars. The student liked the content but said the pacing in the early sections was too slow. I rewrote the first three lectures over the next two weekends.

## The Math Doesn't Work at First

This is the part nobody is honest about. Udemy takes a significant cut. Their organic discovery is real but slow. If you do the math on the first month's revenue and the hours spent recording, you're working for less than minimum wage by a wide margin.

The first month I made about $180. I had spent roughly 400 hours on the course. That's $0.45 per hour. If you started this for the money, you'd quit immediately.

The math gets better. By month six I was making meaningful revenue. By the end of the first year, the course was generating consistent monthly income that justified the time investment in retrospect. But you have to live through the early months when the data is bad and the only signal is reviews and enrollment numbers that are mostly noise.

## What I Did Differently for the Second Course

A year later I shipped the WPF course. Same general process but a few key differences.

Started with a single chapter as a free promo on my own site to validate the topic. The DirectX course had launched blind. The WPF course had a 200-person email list who'd already told me they wanted it.

Recorded all the audio in one go before doing the screen captures. The first course had inconsistent audio because I was recording over months and the room sounded different on different days.

Built the project we'd be making together first, complete and working, before recording the lectures. The first course had a few sections where I was figuring out the implementation while explaining it. Sometimes that's good pedagogy. Often it's just confusing.

## What Teaching Actually Did to My Code

The most surprising effect of teaching wasn't financial. It was on my own code at work.

When you're explaining a concept on camera, you can't hand-wave through the parts you don't fully understand. You have to actually know why you're doing what you're doing. That forced me to revisit assumptions I'd been operating on for years.

I refactored two systems at Reality Arts in the year after launching the course because preparing the lectures had made me realize how much of my "understanding" was pattern-matching to things that worked. Teaching forces you to convert pattern-matching into actual mental models. That's the real reason I'd recommend it to any senior developer.

## The Number That Matters

200+ students enrolled across both courses, 4.8/5 average rating. That's the line I put on resumes and bios. The truer number, the one that means more to me, is something different. I have students who message me a year later to tell me they shipped a project using something I taught them. That happens maybe once a month.

The first time it happened, I sat with the message for an hour before replying. That's the part nobody told me about either. The financial return is real but slow. The "someone built something they couldn't have built before" return is immediate and it doesn't go away.`,
  },
  {
    slug: "why-i-hate-electron",
    title: "Why I Hate Electron",
    date: "2026-05-10",
    category: "Engineering",
    featured: false,
    tags: ["Electron", "Desktop", "Performance", "Engineering"],
    excerpt:
      "Electron ships 120MB of Chromium so your app can render a button. I've had enough of pretending this is acceptable.",
    content: `I've been watching this happen for years and I'm done being polite about it. Electron is a bad technology choice that the industry has normalized because it's convenient for developers, and the people paying the price are users.

Every Electron app is a website wearing a coat and pretending to be software. I don't think that's a harsh take. I think it's an accurate one.

## What Electron Actually Is

Electron bundles Chromium and Node.js into every application that uses it. Not a shared system library, not a cached runtime the OS provides. A full copy of Chrome, per app, on your disk.

Open Discord. Open Slack. Open VS Code. Open Notion. That's four copies of Chrome sitting on your machine simultaneously. Each one eating memory. Each one with its own update cycle. Each one consuming CPU cycles to render text.

Discord on my machine right now: around 350MB on disk, 400MB+ RAM at idle. Idle. I haven't sent a message, I haven't loaded an image. The app is just sitting there, doing nothing, consuming half a gigabyte of memory. For a chat app.

Slack is similar. I know people who have disabled Slack's background activity entirely because it was measurably affecting the performance of other software on the same machine.

VS Code is the one exception I'll grant. Microsoft has invested enormous engineering effort into making VS Code fast, and it shows. It is genuinely a well-built piece of software. But VS Code is the exception that proves the rule. It required years of performance work by a dedicated team to make Electron acceptable for that use case. Most Electron apps are not VS Code. Most Electron apps are built by teams that don't have that capacity, don't prioritize it, and ship the defaults.

## Startup Time

Native apps start in milliseconds. Cold start for a well-written native utility: under 200ms. Often under 100ms. You click the icon and the window is there.

Electron apps take 2-3 seconds to start cold. Sometimes more. That delay is not your code. That delay is Chromium initializing, V8 warming up, Node bootstrapping. You could write the most optimized JavaScript in the world and you'd still wait for all of that before your first line runs.

This is a 2-3 second tax that every user pays, every time they open the app, every day. Multiply that by all the Electron apps on someone's machine. It adds up. Users notice. They just don't know why their computer feels slow.

## The IPC Architecture Is a Structural Tax

Electron has two processes: a main process running Node.js and a renderer process running in Chromium. They cannot share memory. They communicate through IPC, serialized messages passed between processes.

This is the fundamental design. It's not a configuration option you can tune. It's not a tradeoff you get to make per-feature. Every interaction between your app's system-level code and your UI goes through serialization and deserialization, across a process boundary, every single time.

Want to read a file when the user clicks a button? The renderer sends an IPC message to main. Main reads the file. Main serializes the result. Main sends it back. Renderer deserializes and updates the UI.

In any native framework that's: open file, read bytes, update UI. Three operations. In Electron those same three operations have four IPC round trips wrapped around them.

For anything that does real work: reading a directory tree, processing files, talking to a local database. This overhead accumulates into something users feel as sluggishness. The UI isn't blocked, technically. But the time between "user action" and "visible result" is longer than it needs to be by design.

## The Cross-Platform Promise Is Partly Fiction

The pitch is: write once, run on Windows, Mac, Linux. And it's technically true. The app runs. But "runs" and "feels native" are different things, and Electron apps rarely feel native on any platform.

Windows and macOS have different conventions for where settings live, how menu bars are structured, how system tray integration works, how notifications behave, how window chrome looks. Keyboard shortcuts that feel natural on one platform feel wrong on another. Right-click context menus have different norms. File picker dialogs have different behaviors.

If you actually want your app to feel right on each platform, you end up writing platform-specific code to handle all of this. Which is the work you were supposedly avoiding by choosing Electron.

You write the platform-specific code anyway. You just also shipped 120MB of Chromium on top of it.

## Security Surface

Chromium is a massive attack surface. It has a security team and a serious patch cadence, but it is also one of the most complex pieces of software in existence, and complex software has bugs.

Every Electron app ships its own Chromium version. When a Chromium security vulnerability is found, your app is vulnerable until you update your Electron dependency, rebuild, and ship a new release. If your release cadence is slow, or your auto-update is unreliable, your users are running a known-vulnerable version of Chrome as a core dependency of your app.

This is a real problem. It's not theoretical. There have been multiple exploits targeting Electron's node integration specifically, the fact that renderer-side JavaScript can, by default or misconfiguration, access Node.js APIs. That's a web app being handed the ability to access the filesystem, spawn processes, and make arbitrary system calls. The default Electron security settings have historically been loose on this.

## The Update Experience

Electron apps update themselves, but not through the OS's package manager or update infrastructure. Each app maintains its own update system. On macOS this means Squirrel. On Windows it's often Squirrel.Windows or something custom.

The result is that every Electron app on your machine is independently downloading, verifying, and installing its own updates on its own schedule. No coordination. No unified update UI. No differential patching. Most Electron updaters ship full binaries because diffing the Chromium bundle is genuinely difficult. A "minor update" to an Electron app can be 80-100MB because the Chromium version bumped.

That's 80MB per app per update. On a machine with five Electron apps, you're downloading 400MB+ of updates whenever there's a wave of dependency bumps.

## Why Developers Keep Choosing It

I understand why. I actually do.

Web developers significantly outnumber native developers. JavaScript skills are widely distributed. The npm ecosystem is enormous. If you need any functionality at all, there's a package for it. The tooling around web development (React DevTools, hot reload, browser-based debugging) is genuinely excellent.

If your team knows JavaScript and not C++, not Swift, not Python with Qt bindings, then Electron means you can ship a desktop app without retraining anyone. That's a real business consideration.

The hiring pool is also much larger. You can hire a React developer and they can contribute to an Electron app with minimal ramp-up. You can't do that with a C++ or Qt codebase.

These are legitimate reasons. I'm not pretending they don't exist.

But they are reasons of developer convenience, not user benefit. And at some point someone has to say that out loud.

## What Actually Works

Tauri solves most of the technical problems with Electron while keeping the web tech stack for the UI. Instead of bundling Chromium, Tauri uses the OS's native WebView: WKWebView on macOS, WebView2 on Windows, WebKitGTK on Linux. The installer for a Tauri app is typically 5-10MB instead of 80-120MB. Memory usage is a fraction of Electron's. Startup is fast.

You still write your UI in JavaScript/TypeScript. You still use React or Vue or Svelte or whatever framework the team knows. You get Rust on the backend for anything system-facing, which has its own learning curve, but the payoff in performance and safety is real. For new projects where web tech makes sense for the UI, Tauri is strictly better than Electron and I don't see a strong counter-argument.

Qt is the other answer. It's been the answer for native cross-platform desktop software for decades. The licensing has changed over the years in ways that made the commercial tiers annoying, but Qt 6 open source is production-capable for most use cases. The learning curve is real. The C++ requirement means your hiring pool is narrower. But you get genuine native performance, actual OS integration, and an application that respects the machine it's running on.

For smaller tools and utilities, native Win32, Cocoa, or a minimal framework like Dear ImGui with a windowing layer is often the right call. The binary is tiny, the startup is instant, and the overhead is zero.

## The Part That Bothers Me Most

Software has gotten slower over the last decade at a rate that has nothing to do with what software is being asked to do. Computers are faster. Storage is faster. RAM is faster. And yet applications feel slower, heavier, and more resource-intensive than they did ten years ago.

Electron is part of that story. Not all of it, web-based architecture at the application layer is a broader trend, but a significant part. We've taken the performance wins from hardware improvements and spent them on developer convenience, and then shipped that to users as if it were progress.

A chat app should not need 400MB of RAM. An email client should not take three seconds to open. A note-taking app should not spin up three processes on launch.

These are choices. Bad ones. And the fact that they've become industry standard doesn't make them good choices. It just makes them normal ones.

I'll take weird and native over normal and bloated.`,
  },
];
