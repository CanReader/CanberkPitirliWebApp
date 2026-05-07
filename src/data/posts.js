export const categories = ["All", "Graphics", "Game Dev", "Career", "Engineering", "Tutorials"];

export const posts = [
  {
    slug: "why-cpp-is-still-king",
    title: "Why C++ Is Still Irreplaceable in Game Development",
    date: "2026-05-07",
    category: "Engineering",
    featured: true,
    tags: ["C++", "Game Dev", "Engineering"],
    excerpt:
      "Every few years someone declares C++ dead and points to Rust, Zig, or some managed language as its replacement. They're wrong — and here's why it matters for game development specifically.",
    content: `Every few years someone declares C++ dead. The arguments are always the same: memory safety, undefined behavior, arcane syntax, "just use Rust." And every time, the game industry quietly ships another AAA title built entirely in C++.

I've spent years writing C++ for Unreal Engine, building rendering systems, and teaching DirectX 11. Here's my honest take on why C++ isn't going anywhere for real-time game development.

## Performance Is Non-Negotiable

A game running at 60fps has 16.6ms per frame. At 120fps, you get 8.3ms. That budget covers physics, AI, animation, audio, rendering — everything. Any language overhead that isn't absolutely zero is a tax you pay on every single frame, forever.

C++ gives you:

- **Zero-cost abstractions** — templates and inlining let you write clean code that compiles to the same assembly as hand-written C
- **Deterministic memory layout** — you decide exactly where your data sits in memory, which matters enormously for cache performance
- **No runtime** — no GC pauses, no JIT warmup, no hidden allocations

Rust gets close on most of these. Go and C# have GC. Python doesn't belong in this conversation.

## The Ecosystem Is Decades Deep

Unreal Engine is ~4 million lines of C++. The PhysX, Havok, Wwise, and Fmod SDKs are C and C++ with thin C headers. DirectX, Vulkan, Metal, and OpenGL all have C APIs with well-established C++ wrappers. Every major profiler, sanitizer, and debugger on the planet is built around C++ workflows.

When I'm debugging a crash in a shipped Unreal build, I get a full callstack with symbols. When I profile a draw call bottleneck with PIX or RenderDoc, I'm reading C++ source. The tooling assumes C++, and it's extraordinary tooling.

Rebuilding this ecosystem in another language isn't a two-year project. It's a generational one.

## Unreal Is the Standard

If you're making games professionally — especially on console or PC — you're almost certainly touching Unreal Engine. Unreal is C++. Not "you can optionally use C++"; the engine *is* C++. Blueprints compile to C++ bytecode. GAS (Gameplay Ability System) is C++. The renderer, the physics, the networking stack — all C++.

Choosing a different language for a game studio means forking yourself away from the largest, most capable engine on the market. That's a serious competitive disadvantage.

## What Rust Actually Gets Right

I want to be fair. Rust's ownership model genuinely solves a class of bugs that C++ developers deal with through discipline and tooling:

- Use-after-free
- Data races
- Null pointer dereferences

These are real problems. In my experience they're manageable in C++ with ASAN, proper review culture, and smart pointers — but Rust makes them *impossible* at the type system level, which is a real win.

Rust will likely become the second language of systems programming. It's already there for OS and embedded work. In games, it's making inroads in tooling and server-side game logic. Full engine adoption is years away.

## The Bottom Line

C++ isn't the *best* language. It has real footguns. The build times are painful. The error messages are infamous. But for real-time interactive software that has to extract every microsecond from the hardware — it's still the standard, and the ecosystem makes it irreplaceable for now.

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
      "Shadow mapping is one of those techniques that looks simple on paper and punishes you the moment you go off-script. Here's the full picture — depth bias, PCF, and the math that actually makes it work.",
    content: `Shadow mapping is deceptively simple to describe: render the scene from the light's point of view, store depths, then compare in the main pass. In practice, it's one of the first places beginners hit a wall — acne, peter-panning, precision artifacts — and the fixes aren't obvious unless you understand what's actually happening at the hardware level.

This is the writeup I wish I had when I first implemented shadows in my DX11 renderer.

## The Two-Pass Setup

The core idea: two render passes, one shadow map texture, one matrix.

**Pass 1 — Shadow pass:** Render the scene from the light's perspective using an orthographic (directional light) or perspective (spot/point light) projection. Write only depth to a depth-stencil texture. No color output needed.

\`\`\`hlsl
// Shadow pass vertex shader — transform to light space
float4 VS_Shadow(float3 pos : POSITION) : SV_Position
{
    return mul(float4(pos, 1.0), lightViewProj);
}
\`\`\`

**Pass 2 — Main pass:** For each fragment, transform its world position into light clip space, divide by w to get NDC, map to UV space, sample the shadow map, and compare depths.

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

SampleCmpLevelZero with a SamplerComparisonState (LESS_EQUAL) lets the hardware do the depth comparison and bilinear filter the result — you get 4 comparisons for the price of one sample.

## Resolution and Cascade Tradeoffs

A 1024x1024 shadow map covers the entire scene with one texel per ~5cm at typical ranges. A 4096x4096 map costs 64MB of VRAM. For production you want Cascaded Shadow Maps (CSM): 3-4 shadow maps covering exponentially larger fractions of the view frustum. Near cascade is small and high-res; far cascade is large and low-res. The transition is hidden by blending.

That's a longer topic — but the foundation above is what every cascade builds on.`,
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
    content: `I shipped Endless Combat on Steam when I was 16, built with a small team at FataliTech Game Studios. The second shipped title was The Stranger — a VR experience that went on to win Best Game at the WN Unreal European Developer Contest. Two very different games, two very different lessons.

Here's what actually stayed with me.

## Version 1.0 Is a Lie

Nobody ships a finished game. You ship the version you can no longer improve before running out of time or money. The Endless Combat launch build had bugs I knew about and chose to ship with because fixing them would have taken two more months and the scope would have kept expanding.

That's not laziness — that's the reality of game development. The question is which bugs you can live with and which ones will destroy your review score overnight.

For Endless Combat: a memory leak that surfaced after 90+ minutes of continuous play. We shipped it. Most sessions were under 30 minutes. It never appeared in a review.

## Players Don't Care About Your Architecture

I spent weeks on a clean ECS-adjacent component system for the combat entities in Endless Combat. Zero players ever noticed. What they noticed: the hit feedback felt weak. Two days of polish on camera shake, screen flash, and audio had more impact on review sentiment than the entire architecture effort.

The architecture matters to you, for maintainability and iteration speed. But it's invisible to the player. Spend your polish time on what players feel.

## Performance Trumps Features

For The Stranger (VR), hitting a stable 90fps was not optional — it was the whole product. A dropped frame in VR doesn't just hurt performance metrics, it causes physical discomfort. I rewrote the occlusion culling system twice chasing that 20% render time reduction that finally got us there.

In flat games you can often negotiate with performance. In VR you cannot. But the lesson generalizes: a fast, stable game with fewer features will always outscore a feature-rich game that hitches on loading.

## Steam Wishlists Are Your Real Metric

Before launch, the number that matters is wishlists, not follows, not Discord members, not trailer views. Wishlists convert to purchases at a predictable rate (~10-20% on launch day sales). If you don't have enough wishlists, no amount of launch day marketing compensates.

For a small indie game, getting to ~1000 wishlists before launch is the threshold where the Steam algorithm starts doing any meaningful work for you.

## Ship Earlier Than You're Comfortable With

The single biggest mistake first-time developers make is waiting until the game feels "ready." It never feels ready. The feedback you get from 100 real players in the first week of Early Access is worth more than another 3 months of internal iteration.

Ship something real. Fix it publicly. That loop — if you stay honest and responsive — builds more goodwill than a polished-looking trailer with no substance behind it.`,
  },
];
