---
title: "GLSL to HLSL: The Conversion Cheat Sheet"
date: "2026-10-04"
category: "Graphics"
tags: ["HLSL", "GLSL", "Shaders", "Tutorials"]
excerpt: "Every GLSL to HLSL mapping in one place, plus the six that silently change your math. Checked against real compilers, which disagreed twice."
---

Porting a shader from GLSL to HLSL is 90% renaming. `vec3` becomes `float3`, `mix` becomes `lerp`, done. That part is boring and every list on the internet covers it.

The other 10% compiles fine and gives you the wrong picture. A matrix multiply that turns into a per-element multiply. A modulo that flips sign on negative numbers. A matrix that comes out transposed. No error, no warning, just a shader that's subtly broken in a way that looks like a bug somewhere else.

My engine runs on four graphics backends, so its shaders travel between HLSL, SPIR-V, and GLSL all the time. This is the sheet I wish I'd had when I built that pipeline. To make sure every row is right, I compiled both sides with three compilers: glslang for GLSL, plus glslang's HLSL mode and vkd3d for HLSL. On two of the six traps below, the two HLSL compilers **disagreed with each other**. Microsoft's documentation settled both, and I'll show you which compiler got it wrong.

Traps first. Then the full reference tables.

## The six that silently change your math

### 1. `*` between matrices is not a matrix multiply

In GLSL, `A * B` with two matrices is a real matrix product. In HLSL, `*` is **always per component**, matrices included. Matrix multiplication is the `mul()` function.

```glsl
mat2 p = a * b;              // GLSL: matrix product
```

```hlsl
float2x2 p = mul(a, b);      // HLSL: matrix product
float2x2 q = a * b;          // HLSL: element by element, NOT a product
```

I tested `mat2(1,2,3,4) * mat2(1,2,3,4)`. GLSL gives the product: 7, 10, 15, 22. vkd3d gives the per-element result: 1, 4, 9, 16. glslang's HLSL mode gave 7, 10, 15, 22, which is wrong. Microsoft's operator docs are explicit that operators like `*` "work per component." Don't validate HLSL semantics with glslang alone.

The reverse direction catches people too: GLSL's `matrixCompMult(a, b)` is just `a * b` in HLSL.

### 2. Matrix constructors fill in opposite directions

GLSL fills matrices **column by column**. HLSL fills them **row by row**. Same numbers in the same order give you transposed matrices.

```glsl
mat2 m = mat2(1.0, 2.0, 3.0, 4.0);
vec2 r = m * vec2(1.0, 0.0);              // (1, 2): first two numbers are column 0
```

```hlsl
float2x2 m = float2x2(1.0, 2.0, 3.0, 4.0);
float2 r = mul(m, float2(1.0, 0.0));      // (1, 3): first two numbers are row 0
```

Indexing follows the same split. In GLSL `m[1]` is the second **column**. In HLSL `m[1]` is the second **row**.

The good news: matrices that come from a buffer don't have this problem. HLSL's default packing for cbuffer matrices is `column_major`, the same memory layout as GLSL's default. So for the same bytes on the CPU side, GLSL `M * v` becomes HLSL `mul(M, v)`, and `v * M` becomes `mul(v, M)`. The transpose only bites when you **build** a matrix in shader code.

A lot of Direct3D code writes `mul(v, M)` everywhere. That's a convention from DirectXMath's row-vector matrices, not a rule of the language. Match whatever your CPU side uploads.

### 3. `mod` and `fmod` disagree on negative numbers

GLSL's `mod(x, y)` is `x - y * floor(x / y)`. HLSL's `fmod(x, y)` keeps **the sign of x**.

| | Result |
|---|---|
| GLSL `mod(-0.3, 1.0)` | `0.7` |
| HLSL `fmod(-0.3, 1.0)` | `-0.3` |

Anything that wraps a UV, a hue, or an angle works perfectly for positive inputs and breaks the moment one goes negative. If you want GLSL's behavior, write it out:

```hlsl
float glslMod(float x, float y) { return x - y * floor(x / y); }
```

Here glslang's HLSL mode got it wrong again: it returned 0.7 for `fmod(-0.3, 1.0)`. vkd3d returned -0.3, which matches Microsoft's docs: the result "has the same sign as x."

For wrapping into `[0, 1)` specifically, both languages agree: `fract(x)` in GLSL and `frac(x)` in HLSL both return 0.7 for -0.3.

### 4. Your pixel position has a different origin and a different w

`gl_FragCoord` and HLSL's `SV_Position` (as a pixel shader input) both hold the pixel's position, but two details differ:

- **Origin.** OpenGL puts (0, 0) at the **bottom**-left of the screen. Direct3D puts it at the **top**-left. Vulkan GLSL already uses top-left, so this one only applies when you're porting from OpenGL.
- **The w component.** `gl_FragCoord.w` is `1 / w`. In Direct3D, `SV_Position.w` is plain clip-space `w`. DXC has a flag, `-fvk-use-dx-position-w`, purely to paper over this when compiling HLSL for Vulkan.

Clip space differs too: OpenGL's depth runs from -1 to 1 after the perspective divide, Direct3D's runs from 0 to 1. That one lives in your projection matrix, not the shader, but it's the same porting job.

### 5. Textures and samplers are separate objects

GLSL usually bundles them into one `sampler2D`. HLSL keeps the texture and the sampler apart, and you call methods on the texture:

```glsl
layout(binding = 1) uniform sampler2D albedoTex;
vec4 c = texture(albedoTex, uv);
```

```hlsl
Texture2D albedoTex : register(t1);
SamplerState albedoSampler : register(s1);
float4 c = albedoTex.Sample(albedoSampler, uv);
```

It's more typing, but it's also better design: one sampler can serve every texture that wants the same filtering.

### 6. A global `const` in HLSL is a constant buffer variable

This one has no GLSL equivalent to warn you. In HLSL, a global variable without `static` is a **uniform**. It goes into the default constant buffer and the application is expected to set it.

```hlsl
const float weights[3] = { 0.25, 0.5, 0.25 };          // uniform, probably 0 at runtime
static const float weights[3] = { 0.25, 0.5, 0.25 };   // an actual constant
```

Port a GLSL `const` table without `static` and you get a shader that compiles, reads zeros, and makes you doubt your blur math.

Bonus trap: **HLSL has no `inverse()`.** GLSL does. If your shader inverts a matrix, compute the inverse on the CPU and upload it, which is the faster choice anyway.

## Types

| GLSL | HLSL |
|---|---|
| `float`, `int`, `uint`, `bool` | same |
| `vec2`, `vec3`, `vec4` | `float2`, `float3`, `float4` |
| `ivec3`, `uvec3`, `bvec3` | `int3`, `uint3`, `bool3` |
| `dvec3` | `double3` |
| `mat4` | `float4x4` |
| `mat3x4` (3 columns, 4 rows) | `float4x3` (4 rows, 3 columns) |
| `float a[3] = float[](1.0, 2.0, 3.0);` | `static const float a[3] = { 1.0, 2.0, 3.0 };` |
| `highp`, `mediump`, `lowp` | delete them (or `min16float` if you really want half precision) |

Note the `mat3x4` row. GLSL names matrices columns-first, HLSL names them rows-first, so the same shape swaps its numbers.

## Math functions

| GLSL | HLSL | Notes |
|---|---|---|
| `mix(a, b, t)` | `lerp(a, b, t)` | |
| `fract(x)` | `frac(x)` | |
| `mod(x, y)` | `x - y * floor(x / y)` | `fmod` differs on negatives, see trap 3 |
| `inversesqrt(x)` | `rsqrt(x)` | |
| `atan(y, x)` | `atan2(y, x)` | Same argument order |
| `fma(a, b, c)` | `mad(a, b, c)` | |
| `dFdx`, `dFdy`, `fwidth` | `ddx`, `ddy`, `fwidth` | |
| `dFdxFine`, `dFdxCoarse` | `ddx_fine`, `ddx_coarse` | Same pattern for y |
| `a * b` (two matrices) | `mul(a, b)` | See trap 1 |
| `M * v` | `mul(M, v)` | For buffer-fed matrices, see trap 2 |
| `matrixCompMult(a, b)` | `a * b` | |
| `inverse(m)` | none | Do it on the CPU |
| `transpose`, `determinant` | same | |
| `clamp`, `min`, `max`, `step`, `smoothstep`, `pow`, `exp`, `log`, `sqrt`, `abs`, `sign`, `floor`, `ceil`, `round` | same | |
| `normalize`, `length`, `distance`, `dot`, `cross`, `reflect`, `refract` | same | |

## Comparisons and booleans

| GLSL | HLSL |
|---|---|
| `lessThan(a, b)` | `a < b` |
| `greaterThanEqual(a, b)` | `a >= b` |
| `equal(a, b)` | `a == b` |
| `not(b)` | `!b` |
| `any(b)`, `all(b)` | same |
| `mix(a, b, bvec)` | `select(bvec, b, a)` in HLSL 2021 |

Both languages return a vector of bools when you compare vectors. HLSL just uses the operators instead of named functions. And just like GLSL, an `if` needs a single bool, so wrap a vector comparison in `any()` or `all()`.

## Textures and images

| GLSL | HLSL |
|---|---|
| `sampler2D t` | `Texture2D t` + `SamplerState s` |
| `texture(t, uv)` | `t.Sample(s, uv)` |
| `texture(t, uv, bias)` | `t.SampleBias(s, uv, bias)` |
| `textureLod(t, uv, lod)` | `t.SampleLevel(s, uv, lod)` |
| `textureGrad(t, uv, dx, dy)` | `t.SampleGrad(s, uv, dx, dy)` |
| `texelFetch(t, coord, lod)` | `t.Load(int3(coord, lod))` |
| `textureGather(t, uv)` | `t.Gather(s, uv)` |
| `textureSize(t, lod)` | `t.GetDimensions(lod, w, h, levels)`, results come back through out parameters |
| `sampler2DShadow` + `texture(t, vec3(uv, ref))` | `SamplerComparisonState` + `t.SampleCmp(s, uv, ref)` |
| `image2D` + `imageLoad(img, p)` | `RWTexture2D<float4> img` + `img[p]` |
| `imageStore(img, p, v)` | `img[p] = v;` |

## Shader inputs and outputs

GLSL declares loose `in` and `out` variables with locations. HLSL passes structs and tags each field with a semantic.

| GLSL | HLSL |
|---|---|
| `layout(location = 0) in vec2 vUV;` | a struct field `float2 uv : TEXCOORD0;` |
| `gl_Position` (vertex output) | `SV_Position` |
| `gl_FragCoord` (fragment input) | `SV_Position` (see trap 4) |
| `out vec4 outColor;` / `gl_FragColor` | return value `: SV_Target` |
| `layout(location = 1) out vec4` | `: SV_Target1` |
| `gl_FragDepth` | `SV_Depth` |
| `gl_VertexID`, `gl_InstanceID` (Vulkan: `gl_VertexIndex`, `gl_InstanceIndex`) | `SV_VertexID`, `SV_InstanceID` |
| `gl_FrontFacing` | `SV_IsFrontFace` |
| `gl_PrimitiveID` | `SV_PrimitiveID` |
| `gl_ClipDistance` | `SV_ClipDistance` |
| `discard;` | `discard;` or `clip(x)` |

## Buffers and compute

| GLSL | HLSL |
|---|---|
| `uniform Block { ... };` | `cbuffer Block : register(b0) { ... };` |
| `buffer Data { T items[]; };` (read only) | `StructuredBuffer<T> items;` |
| `buffer Data { T items[]; };` (read/write) | `RWStructuredBuffer<T> items;` |
| `layout(local_size_x = 8, local_size_y = 8) in;` | `[numthreads(8, 8, 1)]` on the entry point |
| `shared` | `groupshared` |
| `barrier()` | `GroupMemoryBarrierWithGroupSync()` |
| `gl_GlobalInvocationID` | `SV_DispatchThreadID` |
| `gl_LocalInvocationID` | `SV_GroupThreadID` |
| `gl_WorkGroupID` | `SV_GroupID` |
| `gl_LocalInvocationIndex` | `SV_GroupIndex` |
| `uint old = atomicAdd(x, v);` | `uint old; InterlockedAdd(x, v, old);` |

That last row is easy to miss. GLSL's atomics **return** the old value. HLSL's `Interlocked*` functions return nothing and hand the old value back through an optional third parameter.

## Bits and reinterpreting

| GLSL | HLSL |
|---|---|
| `floatBitsToInt`, `floatBitsToUint` | `asint`, `asuint` |
| `intBitsToFloat`, `uintBitsToFloat` | `asfloat` |
| `bitCount` | `countbits` |
| `findMSB`, `findLSB` | `firstbithigh`, `firstbitlow` |
| `bitfieldReverse` | `reversebits` |

## A full port, side by side

Here's a small but realistic fragment shader: scrolling UVs, alpha test, a screen-space stripe, distance fog. Both versions compile cleanly with glslang, and the HLSL one also with vkd3d.

```glsl
#version 450

layout(set = 0, binding = 0) uniform Frame {
    mat4 viewProj;
    vec3 fogColor;
    float time;
};
layout(set = 0, binding = 1) uniform sampler2D albedoTex;

layout(location = 0) in vec2 vUV;
layout(location = 1) in float vDepth;
layout(location = 0) out vec4 outColor;

void main() {
    vec2 uv = fract(vUV * 4.0 + vec2(time * 0.1, 0.0));
    vec4 albedo = texture(albedoTex, uv);
    if (albedo.a < 0.5) discard;
    float stripe = step(0.5, mod(gl_FragCoord.x, 8.0) / 8.0);
    float fog = smoothstep(10.0, 50.0, vDepth);
    vec3 color = mix(albedo.rgb * (0.8 + 0.2 * stripe), fogColor, fog);
    outColor = vec4(color, 1.0);
}
```

```hlsl
cbuffer Frame : register(b0)
{
    float4x4 viewProj;
    float3 fogColor;
    float time;
};
Texture2D albedoTex : register(t1);
SamplerState albedoSampler : register(s1);

struct PSInput
{
    float4 position : SV_Position;
    float2 uv       : TEXCOORD0;
    float  depth    : TEXCOORD1;
};

float4 main(PSInput input) : SV_Target
{
    float2 uv = frac(input.uv * 4.0 + float2(time * 0.1, 0.0));
    float4 albedo = albedoTex.Sample(albedoSampler, uv);
    clip(albedo.a - 0.5);
    float x = input.position.x;
    float stripe = step(0.5, (x - 8.0 * floor(x / 8.0)) / 8.0);
    float fog = smoothstep(10.0, 50.0, input.depth);
    float3 color = lerp(albedo.rgb * (0.8 + 0.2 * stripe), fogColor, fog);
    return float4(color, 1.0);
}
```

Look at what actually changed. The inputs moved into a struct with semantics. The sampler split off from the texture. `discard` became `clip`. And `mod` turned into the floor formula, even though `fmod` would have "worked" here, because the next person to touch that line might feed it a negative number.

## Should you just use a translator?

For a whole codebase, yes. glslang and SPIRV-Cross, or DXC's SPIR-V backend going the other way, will port thousands of shaders faster and more consistently than you will.

But they don't remove the need for this sheet. The day a translated shader renders slightly wrong, you're reading generated HLSL and you need to know which of these six traps you're looking at. And as I found while writing this, even the compilers don't fully agree on the rules.

If HLSL is the side you're less comfortable with, [HLSL Functions Explained](/blog/hlsl-functions-explained) goes deeper on every function in these tables, and [HLSL From First Principles](/blog/hlsl-from-first-principles) covers what the hardware is doing underneath both languages.
