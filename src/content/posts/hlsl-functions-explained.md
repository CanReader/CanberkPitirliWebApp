---
title: "HLSL Functions Explained: lerp, step, and Everything the Docs Don't Tell You"
date: "2026-09-28"
category: "Graphics"
tags: ["HLSL", "DirectX 11", "Tutorials"]
excerpt: "Every HLSL function reference tells you the syntax. This one covers lerp, step, clip, reflect, and the gotchas that actually bite you in production."
---

Microsoft's HLSL reference is accurate and useless in the same sentence. One line per function, a return type, no intuition, no example that survives contact with a real shader. I teach this material every week in my DirectX 11 course and I watch the same functions trip up every single cohort, not because the functions are hard, but because nobody tells you the one detail that actually matters, where you'll actually use it, and what it looks like when it goes wrong.

So here's the reference I actually hand my students. Every function gets a real example, the use case you'll actually reach for it in, and the gotcha the docs leave out. Twenty-eight functions, semantics, and modifiers, grouped by what they're actually for instead of dumped alphabetically, everything I consider load-bearing for writing HLSL that isn't copy-pasted from a tutorial you don't understand.

One thing before we start: almost everything here operates component-wise on vectors. `lerp(float3, float3, float)` blends each channel independently. `max(float4, float4)` takes the max of each component separately. If a function works on a `float`, assume it works the same way on a `float2`, `float3`, or `float4` unless I say otherwise.

## Quick reference

Jump to whichever one is actually biting you right now.

| Function | What it does | Reach for it when |
|---|---|---|
| `mul()` | Matrix/vector multiplication | Transforming a position, normal, or anything through a matrix |
| `dot()` | Dot product | Lighting cosine terms, NdotL, NdotV, angle-between checks |
| `normalize()` | Rescale to unit length | Any direction vector before it goes into lighting math |
| `lerp()` | Linear interpolation | Blending colors, positions, or any two values over `t` |
| `saturate()` | Clamp to `[0, 1]` | Keeping a lighting result in displayable range |
| `step()` | Hard threshold, branchless | A mask without an `if` |
| `smoothstep()` | Soft threshold | Fog falloff, soft particle edges, a glow that fades |
| `clip()` | Discard the pixel | Alpha-tested cutouts, foliage, fences |
| `any()` / `all()` | Vector boolean reduction | A bounds check before a sample or discard |
| `reflect()` | Mirror a vector | Environment mapping, specular highlights |
| `refract()` | Bend a vector through a surface | Glass, water |
| `cross()` | Cross product | Building a tangent/bitangent basis for normal mapping |
| `rcp()` | Fast approximate reciprocal | Tight loops where a little precision is an acceptable trade |
| `max()` / `min()` / `clamp()` | Range control | Clamping a dot product, an exposure value, anything bounded |
| `pow()` | Exponentiation | Specular highlights, gamma correction |
| `length()` / `distance()` | Vector magnitude | Falloff, nearest-of-several checks |
| `switch` / `if` | Branching | Anywhere, just know the SIMT cost first |
| `sign()` | `-1`, `0`, or `1` | Flipping a normal to face the camera, branchless logic |
| `SV_Position` | Position semantic | Every vertex output and pixel input, means different things in each |
| `struct` | Grouped, semantic-tagged I/O | Passing data between shader stages |
| `nointerpolation` | Disable interpolation | Passing an int, or any per-primitive flat value |
| `precise` | Force evaluation order | Tessellation seams, matching results across triangles |
| `Sample()` | Filtered texture read | Standard texture lookups in a pixel shader |
| `SampleLevel()` | Explicit-mip texture read | Compute shaders, divergent branches, vertex shaders |
| `Load()` | Point-sampled texel read | Reading a G-Buffer by integer pixel coordinate |
| `ddx()` / `ddy()` | Screen-space derivatives | Flat per-triangle normals, understanding mip selection |
| `frac()` | Fractional part, always positive | Tiling a UV coordinate |
| `fmod()` | Remainder, sign of the dividend | Wrapping a value where GLSL's `mod()` would disagree |

## The math you'll use in literally every shader

### mul()

`mul(a, b)` is the one function that shows up in every single shader you will ever write, and it's also the one nobody explains properly. It's matrix multiplication, vector-times-matrix or matrix-times-matrix, and which one you get depends on the argument order.

**Common uses:**
- Transforming a local-space position into world space, then clip space
- Transforming a normal by the inverse-transpose of the world matrix
- Chaining transforms: `mul(mul(local, world), viewProj)`

```hlsl
float4 worldPos = mul(float4(localPos, 1.0), world);       // vector as a row, on the left
float4 clipPos  = mul(viewProj, worldPos);                 // vector as a column, on the right
```

A second, equally common shape, collapsing the whole chain into one matrix on the CPU side and doing a single `mul()` per vertex on the GPU:

```hlsl
float4 clipPos = mul(float4(localPos, 1.0), worldViewProj); // precomputed on the CPU, one mul per vertex
```

**The gotcha:** `mul(vector, matrix)` treats the vector as a row vector and multiplies on the left. `mul(matrix, vector)` treats it as a column vector and multiplies on the right. These are mathematically different operations, row-vector-times-matrix is not the same as matrix-times-column-vector unless the matrix happens to be symmetric. Get the order backwards and you don't get a compile error, you get a silently transposed transform: geometry that's subtly skewed, lighting that points the wrong way, nothing that screams "you multiplied in the wrong order" until you've spent an hour suspecting your matrix math instead. Whichever convention your engine uses, row-major or column-major, pick one order and stay consistent across every shader.

### dot()

`dot(a, b)` sums the component-wise products: `a.x*b.x + a.y*b.y + a.z*b.z`. Geometrically that's `|a| * |b| * cos(angle between them)`, which is the whole reason it's everywhere in lighting math. For two unit vectors, `dot()` hands you the cosine of the angle between them directly, no trig function required.

**Common uses:**
- `NdotL`, the cosine term behind Lambertian diffuse lighting
- `NdotV`, view-dependent effects like rim lighting or Fresnel
- Checking whether two vectors point the same general direction (`dot(a, b) > 0`)

```hlsl
float NdotL = dot(normalize(normal), normalize(lightDir)); // cosine of the angle to the light
float3 diffuse = albedo * max(NdotL, 0.0) * lightColor;
```

A second use, a cheap facing check without any trig at all:

```hlsl
bool facingCamera = dot(normal, viewDir) > 0.0;
```

That's the entire mechanism behind Lambertian diffuse lighting: light falls off as the cosine of the incidence angle, and `dot()` on two unit vectors computes exactly that cosine for free. Every "NdotL" or "NdotV" variable name you'll ever see in someone else's shader is this.

### normalize()

`normalize(x)` is `x / length(x)`, rescaling a vector to length 1 while keeping its direction. You'll call it on nearly every direction vector before you use it in a lighting calculation, because the math above only works cleanly on unit vectors.

**Common uses:**
- Normals coming out of interpolation (they drift off unit length across a triangle)
- Light and view direction vectors before any `dot()` or `reflect()` call
- Tangent-space basis vectors after building them from `cross()`

```hlsl
float3 N = normalize(input.normal);
float3 L = normalize(lightPos - worldPos);
float3 V = normalize(cameraPos - worldPos);
```

**The gotcha:** normalizing a zero-length vector divides by zero and hands you back `NaN`, not an error. This happens more often than it sounds like it should: an interpolated normal that got zeroed by bad vertex data, a light direction where the fragment sits exactly at the light's position, or a tangent built from `cross()` of two parallel vectors, which degenerates to a zero vector before it ever reaches `normalize()`. A `NaN` pixel doesn't crash anything, it just quietly turns black or white and looks like a completely unrelated bug.

## Interpolation and thresholds

### lerp()

`lerp(a, b, t)` returns `a + (b - a) * t`. That's the whole function. You'll use it constantly: fading between two colors, blending two positions, mixing two normals.

**Common uses:**
- Fading between two colors, textures, or lighting states over time
- Blending two positions or normals, like a walk-to-run animation weight
- Any "mix these two values by some 0 to 1 amount" problem

```hlsl
float3 finalColor = lerp(fogColor, surfaceColor, visibility);
```

A second use, blending between two full material results rather than raw values:

```hlsl
float3 wetSurface = lerp(dryAlbedo, wetAlbedo, rainAmount);
```

**The gotcha:** unlike some engines' lerp, HLSL does not clamp `t` to `[0, 1]`. Feed it 1.5 and you get extrapolation past `b`, not a clamped result. I've debugged more than one "why is this color blowing out past white" bug that was just an unclamped `t` sneaking past 1.0 somewhere upstream. If you need the safe version, clamp `t` yourself or use `saturate()` on it first.

### saturate()

`saturate(x)` is `clamp(x, 0.0, 1.0)`, and it exists as its own function because it's cheap enough that it's often folded into the previous instruction as a free output modifier rather than costing a separate op. You'll see it at the end of almost every lighting calculation.

**Common uses:**
- Clamping a final lighting result before it hits the render target
- Guarding `pow()`'s base so it never goes negative (see `pow()` below)
- Clamping a blend or mask value that a designer-exposed parameter could push out of range

```hlsl
float3 litColor = saturate(diffuse + specular + ambient); // keep the sum in displayable range
```

The use case that actually matters beyond "clamp to displayable range": `saturate()` shows up right before `pow()` in almost every specular calculation you'll ever read, and that's not a style choice, it's there specifically to keep the base non-negative. More on exactly why when we get to `pow()`.

### step()

`step(edge, x)` returns `0` if `x < edge`, and `1` otherwise, per component. Read that order carefully: the threshold comes first, the value comes second. I still see people flip this.

**Common uses:**
- Building a hard-edged mask without a branch
- Procedural patterns: stripes, checkerboards, any binary on/off region
- The building block underneath a lot of branchless shader code

```hlsl
float mask = step(0.5, uv.x); // 0 for the left half, 1 for the right half
```

A second, very common shape, thresholding a scalar to gate an effect on or off:

```hlsl
float rimEnabled = step(0.01, rimStrength); // skip the rim term entirely when it's ~0
float3 finalColor = baseColor + rim * rimEnabled;
```

Why does this exist when you could just write an `if`? Because `step()` compiles to arithmetic, not a branch. If you've read my piece on what SIMT does to branches, you already know why that matters: a divergent `if` makes every thread in the group pay for both paths, masked. `step()` sidesteps that entirely by turning a conditional into a comparison instruction.

### smoothstep()

`smoothstep(edge0, edge1, x)` is `step()`'s smoother sibling: `0` below `edge0`, `1` above `edge1`, and a smooth S-curve (Hermite interpolation, `3t² - 2t³`) in between instead of a hard cutoff.

**Common uses:**
- Fog that fades in with distance instead of snapping on
- Soft edges on particles, decals, or vignettes
- Any glow or highlight that should ramp instead of pop

```hlsl
float fogFactor = smoothstep(fogStart, fogEnd, distanceToCamera);
float3 finalColor = lerp(surfaceColor, fogColor, fogFactor);
```

A second use, a soft circular mask instead of a hard-edged one:

```hlsl
float dist = length(uv - 0.5);
float circle = 1.0 - smoothstep(0.3, 0.32, dist); // soft edge instead of a jagged step
```

**The gotcha:** `edge0` has to be less than `edge1`. Flip them, even by accident because a designer-exposed variable went negative, and the result is undefined instead of just inverted, which means it's a hardware-dependent bug that looks fine on your GPU and breaks on someone else's.

## Discarding and masking pixels

### clip()

`clip(x)` discards the current pixel if any component of `x` is negative. No return value, it just kills the pixel outright.

**Common uses:**
- Alpha-tested cutouts: foliage, chain-link fences, hard-edged transparency
- Manually discarding pixels outside some custom region, like a decal projection
- Anywhere you'd reach for `discard` in GLSL

```hlsl
float alpha = tex.Sample(samp, uv).a;
clip(alpha - alphaThreshold); // discard if alpha < threshold
```

A second use, discarding based on a computed condition rather than a texture read:

```hlsl
clip(dot(normal, viewDir)); // backface cull in the pixel shader, discard if facing away
```

**The gotcha:** once you call `clip()` in a shader, the GPU can no longer rely on early-Z rejection for that draw, because it doesn't know whether a pixel survives until after your pixel shader has already run. A cheap-looking cutout material can quietly cost more than an opaque one for exactly this reason. Fine for foliage, worth remembering before you sprinkle `clip()` across a whole scene.

### any() and all()

`any(x)` is true if at least one component of `x` is nonzero. `all(x)` is true only if every component is.

**Common uses:**
- Bounds-checking a UV coordinate before sampling or discarding
- Validating a decoded value (like a normal) has every channel in range
- Cheap early-outs before an expensive branch of code runs

```hlsl
if (any(uv < 0.0) || any(uv > 1.0))
{
    clip(-1); // outside the atlas tile, kill it
}
```

`all()` shows up on the other side of the same coin:

```hlsl
bool validNormal = all(abs(decodedNormal) <= 1.0001); // sanity check after decoding
```

## Reflection, refraction, and building a basis

### reflect() and refract()

`reflect(i, n)` mirrors an incoming vector `i` around a normal `n`: `i - 2 * dot(i, n) * n`. Standard use is a reflection vector for environment mapping or specular highlights.

`refract(i, n, eta)` bends the vector through the surface instead of bouncing off it, using Snell's law, where `eta` is the ratio of refractive indices.

**Common uses:**
- `reflect()`: environment/cubemap reflections, mirror surfaces, Blinn-Phong specular
- `refract()`: glass, water, any transparent, light-bending material

```hlsl
float3 reflectedDir = reflect(-viewDir, normal);
float3 envColor = envMap.Sample(envSampler, reflectedDir).rgb;
```

```hlsl
float3 refracted = refract(incident, normal, 1.0 / 1.33); // air into water
if (dot(refracted, refracted) < 0.0001) {
    refracted = reflect(incident, normal); // fall back to reflection
}
```

**The gotcha:** this is the one that actually bites people. When the incident angle is steep enough to cause total internal reflection, `refract()` returns a zero vector, not an error, not a fallback, just `float3(0, 0, 0)`. If you don't check for that, your glass or water shader gets a patch of solid black at grazing angles and you'll spend an hour assuming it's a sampling bug before you realize the vector is just zero.

### cross()

`cross(a, b)` is only defined for `float3`, there's no `float2` or `float4` overload because the cross product itself is a 3D-specific operation.

**Common uses:**
- Building a tangent/bitangent/normal (TBN) basis for normal mapping
- Computing a flat face normal from two triangle edges
- Anywhere you need a vector perpendicular to two others

```hlsl
float3 T = normalize(input.tangent);
float3 N = normalize(input.normal);
float3 B = cross(N, T); // bitangent, completes the TBN basis
float3x3 TBN = float3x3(T, B, N);
```

A second use, computing a flat normal directly from triangle edges instead of stored vertex data:

```hlsl
float3 edge1 = p1 - p0;
float3 edge2 = p2 - p0;
float3 faceNormal = normalize(cross(edge1, edge2));
```

**The gotcha:** watch what feeds this. If your tangent and normal end up parallel or nearly parallel, which happens with bad UV unwraps or degenerate triangles, `cross()` degenerates toward a zero vector, and that zero vector goes straight into a `normalize()` next, which is exactly the `NaN` trap described above.

## Range control and precision

### rcp()

`rcp(x)` is the hardware's fast approximate reciprocal, `1 / x` computed with a cheaper instruction and slightly less precision than a real division.

**Common uses:**
- Normalizing many vectors in a tight loop, like a particle system, where a little precision loss is fine
- Any inverse you compute a lot of and don't need bit-exact

```hlsl
float invLen = rcp(length(v)); // faster than 1.0 / length(v), less precise
float3 n = v * invLen;
```

That's roughly what `normalize()` is doing under the hood when you want more control over the speed-versus-precision tradeoff yourself. Most shader compilers will quietly turn `1.0 / x` into `rcp(x)` for you anyway when it's safe to do so, so you rarely need to call it explicitly. Don't use it in anything where precision actually matters, like projecting a matrix.

### max(), min(), and clamp()

`max(a, b)` and `min(a, b)` do what they say, per component. `clamp(x, lo, hi)` is both of them stacked: `max(min(x, hi), lo)`.

**Common uses:**
- Clamping a dot product before it feeds into lighting
- Picking the nearer of two distances or the brighter of two colors
- Keeping a designer-exposed value inside a sane range

```hlsl
float NdotL = max(dot(normal, lightDir), 0.0);          // negative light contribution makes no physical sense
float nearestDist = min(distToLightA, distToLightB);    // cheapest way to pick the closer of two
float exposure = clamp(userExposure, 0.1, 8.0);          // stop a UI slider from producing nonsense
```

Skip the `max` in that first line and surfaces facing away from a light will subtract light instead of contributing none, which looks like a black halo around anything backlit.

### pow()

`pow(x, y)` is `x` raised to the power `y`. You'll meet it constantly in specular highlights and gamma correction.

**Common uses:**
- Specular highlights: `pow(NdotH, shininess)`
- Gamma correction: `pow(color, 1.0 / 2.2)`
- Any curve that needs to sharpen or soften with an exponent

```hlsl
float specular = pow(saturate(dot(N, H)), shininess);
```

A second use, the gamma correction pass you'll write at least once per project:

```hlsl
float3 gammaCorrected = pow(linearColor, 1.0 / 2.2);
```

**The gotcha, and the actual reason that `saturate()` is sitting right there in the first example:** `pow()` with a negative base and a non-integer exponent is undefined in HLSL, because under the hood it's implemented as `exp(y * log(x))`, and the log of a negative number doesn't exist. `NdotH` can go slightly negative at grazing angles due to interpolation, and `shininess` is almost always a fractional exponent. Skip the `saturate()` and you get sporadic `NaN` pixels that only show up at certain viewing angles, which is a miserable thing to debug if you don't already know `pow()` is the culprit.

### length() and distance()

`length(x)` is `sqrt(dot(x, x))`, the magnitude of a vector. `distance(a, b)` is just `length(a - b)`.

**Common uses:**
- Light attenuation, falloff based on distance
- Finding the nearest of several points or lights
- Any radius or range check

```hlsl
float d = distance(worldPos, lightPos);
float attenuation = 1.0 / (1.0 + d * d);
```

**The performance tip that actually matters here:** if you only need to compare distances, say, finding the nearest of several lights, skip `length()` entirely and compare `dot(x, x)` instead:

```hlsl
float distSqA = dot(toLightA, toLightA);
float distSqB = dot(toLightB, toLightB);
float3 nearestLightDir = (distSqA < distSqB) ? toLightA : toLightB; // no sqrt needed to compare
```

Squaring preserves ordering, and you avoid a square root you didn't actually need. `sqrt()` isn't free, and this trick shows up constantly in anything culling or sorting by distance.

## Control flow and branchless tricks

### switch and if: the real cost is the same as a branch

There's no free lunch hiding in `switch`.

```hlsl
// Uniform across the draw call: the compiler can often turn this into a genuinely cheap static branch
if (materialType == MAT_METAL) { ... }

// Varies per pixel: every thread in the group pays for every branch any thread in it takes
if (vertexColor.r > 0.5) { ... }
```

On a compile-time constant or a value that's uniform across the draw call, the compiler can turn either an `if` chain or a `switch` into a genuinely cheap static branch, sometimes even eliminating dead branches entirely. On a value that varies per pixel, both `if` and `switch` pay the same SIMT divergence cost: every code path any thread in the group takes gets executed by the whole group, with the irrelevant results masked off. `switch` doesn't become a jump table the way it might on a CPU. If you're branching on material type per pixel and the types vary across a triangle, you're paying for every branch that shows up anywhere in that group, not just the one each pixel needed.

### sign()

`sign(x)` returns `-1`, `0`, or `1` per component, matching the sign of the input. It's part of the same branchless toolkit as `step()`, a comparison you can multiply by instead of branching on.

**Common uses:**
- Flipping a normal to face the camera on double-sided materials
- Mirroring UVs or geometry based on which side of an axis something's on
- Branchless "which direction" logic in general

```hlsl
float facing = sign(dot(viewDir, geometricNormal));
float3 N = normal * facing; // flip the normal to face the camera, no branch
```

That pattern, flipping a normal for double-sided materials based on which side the camera is looking from, is the single most common use I see for `sign()` outside of pure math utility code.

## Semantics and modifiers: the stuff that isn't a function call

### SV_Position means two different things

This one catches almost everyone once. `SV_Position` is a system-value semantic, but what it actually contains depends entirely on which stage you're reading it in.

```hlsl
float4 VS_Main(float3 pos : POSITION) : SV_Position
{
    return mul(float4(pos, 1.0), worldViewProj); // clip-space position, required output
}

float4 PS_Main(float4 screenPos : SV_Position) : SV_Target
{
    // screenPos here is screen-space: .xy in pixels, .z is depth, .w is clip-space w
    return float4(screenPos.xy / screenResolution, 0, 1);
}
```

As a vertex shader output, it's the clip-space position the rasterizer needs. As a pixel shader input, the hardware has already done the divide and viewport transform for you, and you're holding actual pixel coordinates. Same semantic name, completely different space, and the compiler will not warn you if you write code that assumes one when you're in the other.

### struct, for organizing what actually crosses stages

Vertex-to-pixel data almost always goes through a struct rather than a pile of loose parameters, because that's how you attach semantics to each field cleanly.

```hlsl
struct VSOutput
{
    float4 position : SV_Position;
    float3 normal   : NORMAL;
    float2 uv       : TEXCOORD0;
};
```

Every field needs its own semantic. The order of fields in the struct doesn't need to match anything on the C++ side, only the semantic names do, which is the part that trips people coming from a language where struct layout is load-bearing.

### nointerpolation

If you're passing an integer from a vertex shader to a pixel shader, HLSL will not let you do it without this modifier, it's a compile error, not a warning.

```hlsl
struct VSOutput
{
    float4 position                 : SV_Position;
    nointerpolation int materialID  : MATERIALID; // ints must be flat, no exceptions
    float3 normal                   : NORMAL;
};
```

The reason is physical: the hardware's interpolator only knows how to blend floating point values across a triangle, so an unmarked int has no sane interpolated value at the corners. `nointerpolation` tells the compiler to just take the value from one vertex, provoking vertex, flat, and skip interpolation entirely. Same modifier is what you want for anything that shouldn't blend across a triangle in the first place, like a material ID or a flat face normal for hard-edged shading.

### precise

`precise` stops the compiler from reordering or fusing floating point operations for that value, even when the reordering would normally be a safe optimization.

```hlsl
precise float3 displacedPos = basePos + normal * heightSample * displacementScale;
```

You almost never need it. The one place it earns its keep: tessellation and displacement, where two adjacent triangles compute a shared edge vertex from slightly different starting data, and if the compiler optimizes the two computations differently, you get a visible crack at the seam. `precise` forces bit-identical evaluation order so both triangles agree.

## Reading textures

### Sample(), SampleLevel(), and Load(): three ways to read a texture

`Sample(sampler, uv)` is the one everyone learns first: filtered, mip-mapped, does the right thing by default.

**Common uses:**
- `Sample()`: standard texture lookups in a pixel shader, the default choice
- `SampleLevel()`: compute shaders, divergent branches, vertex shaders, anywhere derivatives aren't available
- `Load()`: reading a G-Buffer or any data texture where you want the exact stored texel, not a filtered blend

```hlsl
float4 color = albedoTex.Sample(linearSampler, uv);
```

The gotcha lives in how it picks a mip level: it computes screen-space derivatives of `uv` across the current 2x2 pixel quad, which means it needs all four threads in that quad active and running the same code. Call `Sample()` inside dynamically divergent control flow, an `if` that some threads in the quad take and others don't, and you get a compiler warning at best and wrong mip selection at worst. Compute shaders don't have quads at all, so `Sample()` isn't valid there either.

`SampleLevel(sampler, uv, mipLevel)` sidesteps the whole problem by taking the mip level explicitly instead of computing it from derivatives:

```hlsl
float4 color = albedoTex.SampleLevel(linearSampler, uv, 0); // safe in compute shaders and divergent branches
```

`Load(intCoord, mipLevel)` skips filtering entirely: you hand it literal integer texel coordinates, not normalized UVs, and get back exactly what's stored there, point-sampled, no interpolation.

```hlsl
int3 texelCoord = int3(pixelPos.xy, 0);
float4 gbufferAlbedo = gbufferAlbedoTex.Load(texelCoord);
```

If you haven't read [my piece on forward versus deferred rendering](/blog/deferred-vs-forward-rendering), this `Load()` call is exactly what's happening in the second pass of a deferred renderer: walking the G-Buffer pixel by pixel with integer coordinates, not sampling it like a regular texture.

### ddx() and ddy()

`ddx(x)` and `ddy(x)` return the rate of change of `x` between neighboring pixels in the same 2x2 quad, horizontally and vertically. This is the exact mechanism `Sample()` uses internally to pick a mip level, and you can call it directly for your own purposes.

**Common uses:**
- Flat, faceted per-triangle normals without precomputed vertex data
- Wireframe or triangle-edge effects
- Understanding why `Sample()` has the divergence restriction above

```hlsl
float3 dx = ddx(worldPos);
float3 dy = ddy(worldPos);
float3 faceNormal = normalize(cross(dx, dy)); // flat per-triangle normal, no vertex data needed
```

That pattern gives you a hard, faceted normal straight from screen-space derivatives, no precomputed vertex normals required, useful for flat-shaded or low-poly looks. Same restriction as `Sample()` applies here and for the same reason: this only works in a pixel shader, and only in non-divergent control flow, because it needs the full quad. It's the identical SIMT constraint from the hardware model piece, just showing up in a second place.

## Wrapping and remainder

### frac()

`frac(x)` returns the fractional part: `x - floor(x)`.

**Common uses:**
- Tiling a UV coordinate across a surface
- Procedural patterns that need to repeat
- Extracting just the fractional component of a value for noise or animation

```hlsl
float2 tiledUV = frac(uv * tileCount); // repeats the texture tileCount times
```

A second use, driving a repeating scroll or animation:

```hlsl
float scrollOffset = frac(time * scrollSpeed); // wraps back to 0 smoothly, no reset pop
```

The detail worth knowing, especially right after reading about `fmod` below: `frac()` always returns a value in `[0, 1)`, even for negative input, because `floor()` rounds toward negative infinity. `frac(-0.3)` is `0.7`, not `-0.3`. That's the GLSL `mod()`-style wrapping behavior, and it's the opposite of what `fmod` does. Mixing the two up is exactly how a UV wrap looks correct for positive coordinates and breaks the moment a coordinate goes negative.

### fmod(): the modulo you actually want, and it's not the same as GLSL's mod

The `%` operator in HLSL only works on integer types. For floats, you want `fmod(x, y)`.

**Common uses:**
- Wrapping a value with a divisor other than 1 (where `frac()` doesn't apply)
- Porting shader math from GLSL, where `mod()` behaves differently on negatives
- Repeating patterns with a custom period

The part that actually matters if you're porting a shader from GLSL: HLSL's `fmod` takes the sign of `x`, while GLSL's `mod` takes the sign of `y`. Feed `fmod(-0.3, 1.0)` and you get `-0.3`, not `0.7`. If you're wrapping a UV coordinate or a hue value and expecting it to always land positive, `fmod` alone will hand you a negative number and everything downstream that assumes `[0, 1]` breaks in a way that looks like a sampling bug. If you want `frac()`'s always-positive behavior but with a divisor other than 1, that's the actual fix:

```hlsl
float wrapped = fmod(x, 1.0);
wrapped = wrapped < 0.0 ? wrapped + 1.0 : wrapped; // force it positive, GLSL-style
```

## The rest

### There is no printf

First time I went looking for one, I assumed I'd missed something obvious. There isn't one. The GPU has no console, no stdout, nowhere for a shader to print a value while it runs.

**What people actually do instead:**
- Write the value you care about into a spare render target channel and inspect it visually
- Write it into a `RWStructuredBuffer` and read the buffer back on the CPU after the dispatch
- Use a graphics debugger like PIX or RenderDoc to inspect the exact input and output values of a single pixel, which is worth more than any print statement would have been anyway

### PI is not built in

HLSL has no predefined `PI` constant.

```hlsl
static const float PI = 3.14159265359f;
```

You either hardcode `3.14159265f` inline, which is fine once and awful the third time you do it, or you define it once yourself and put it in a shared `.hlsli` header along with any other constants you reuse across shaders, rather than redefining it in every file. That's what `.hlsli` files are for: the same header-include pattern C and C++ use, just for shader code you want to share between multiple `.hlsl` entry points.

### float4 and swizzling

A `float4` is four packed floats, constructible from smaller pieces: `float4(rgb, 1.0)` builds one from a `float3` and a scalar. Swizzling lets you read or write any combination of components by name.

```hlsl
float4 color = float4(1, 0, 0, 1);
float3 rgb = color.rgb;      // same data as color.xyz
float4 bgra = color.bgra;    // reordered, still the same four values
```

`.xyzw` and `.rgba` are the exact same four slots under two different naming conventions, purely there so position math reads as `.xyz` and color math reads as `.rgb` without you thinking about it. You can swizzle on the left side of an assignment too: `color.rgb = newColor;` writes three of the four channels and leaves alpha untouched.

## Why none of this is actually hard

Every function above is one or two lines to explain correctly. What the official docs strip out isn't the syntax, it's the one sentence that tells you why `refract` returns zero, why `mul`'s argument order silently transposes your transform, why `pow` needs that `saturate` in front of it, or why `fmod` bit you on a UV wrap. That sentence, plus knowing where you'll actually reach for each one, is the entire difference between reading the reference and actually knowing the language.

If you want the hardware model underneath all of this, [why branches aren't free and what a vertex shader actually outputs](/blog/hlsl-from-first-principles) is the piece that explains the SIMT execution model these functions, and their quad-dependent cousins like `Sample()` and `ddx()`, are built around. And if you want the from-scratch version, writing every one of these into a real rendering pipeline instead of a code snippet, that's what I actually teach in my DirectX 11 course.
