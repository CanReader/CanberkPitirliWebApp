---
title: "Depth, Blending and the Last Stage of the Pipeline"
date: "2026-10-03"
category: "Graphics"
tags: ["GPU", "Foundations", "Rendering"]
excerpt: "The depth test can run before your pixel shader and skip it entirely, or after it and waste the work. Which one you get depends on things like discard and depth writes. Plus how blending works and why transparency is hard."
---

After the pixel shader produces a color, there's still one stage before anything lands in the framebuffer. It does the depth and stencil tests, blends the new color with what's already there, and writes the result. Different APIs give it different names (output merger, raster operations, per-fragment operations). The hardware units doing the work are usually called ROPs.

It sounds like bookkeeping, but this stage decides how much of your pixel shading was wasted.

## The depth buffer, quickly

Alongside the color target sits a depth buffer: one depth value per pixel, the distance of the closest thing drawn there so far. For each new pixel the GPU compares its depth to the stored one. Closer wins and overwrites the stored depth; farther loses and is thrown away.

That's how 3D scenes sort themselves without you sorting a single triangle. Draw in any order, the closest surface ends up visible.

## The waste problem

Here's the catch. If depth is tested *after* the pixel shader, every pixel of every hidden surface still gets fully shaded, and then thrown away. A scene where each screen pixel is covered by four surfaces would shade four times the pixels it actually needs. That ratio is called overdraw, and it's pure waste.

So GPUs test depth **before** the pixel shader whenever they're allowed to. This is early-Z: the rasterizer produces a pixel, the depth test runs immediately, and pixels that are already hidden never launch a shader at all.

On top of that, most GPUs keep a coarse version of the depth buffer (hierarchical Z, or Hi-Z): roughly the farthest depth per tile. A whole tile of an incoming triangle can be rejected with one comparison, before per-pixel testing even starts.

## What breaks early-Z

"Whenever they're allowed to" is the key phrase. Early-Z is only correct if the pixel shader can't change the outcome of the depth test. Things that can:

- **Writing depth from the shader.** If the shader outputs its own depth, the GPU can't know the depth before running it. Early-Z is off for that draw.
- **Discard / alpha test.** The shader might throw the pixel away, so the GPU can't write its depth early. Depth *testing* can often still happen early, but the depth *write* has to wait, which weakens the optimization for everything drawn after.
- **Some state combinations** depending on the hardware.

That's why alpha-tested foliage is so expensive, and why the practical advice is the same on every API:

- draw opaque geometry roughly **front to back**, so the closest surfaces fill the depth buffer first and early-Z rejects the rest
- keep alpha-tested materials in their own pass, after the solid stuff
- or render a **depth pre-pass**: draw everything once with a trivial shader to fill depth, then shade with depth test set to "equal", so each pixel is shaded exactly once

The pre-pass costs an extra geometry pass, so it wins when pixel shading is expensive and loses when the scene is geometry-heavy. Measure, don't assume.

## Blending

When blending is enabled, the new color isn't simply written. The GPU reads the color already in the framebuffer and combines them with a fixed formula you configure, typically:

```
result = src * srcFactor + dst * dstFactor
```

Standard transparency is src times alpha plus dst times (1 - alpha). Additive blending (fire, glows) is src plus dst.

Two things make blending expensive. It's a read-modify-write on the framebuffer for every pixel, doubling memory traffic. And it has to happen in submission order: when two triangles overlap, the result must be as if they were drawn in the order you issued them. The ROPs enforce that ordering, so blended pixels can't be freely reordered.

## Why transparency is genuinely hard

Depth testing sorts opaque things for free because the closest one simply wins. Transparent surfaces don't work that way: you need to see all of them, combined in back-to-front order, and "over" blending gives different results in different orders.

So the depth buffer can't help. The classic approach: draw all opaque geometry first, then sort transparent objects by distance and draw them back to front with depth testing on but depth writing off. Sorting per object breaks down for intersecting or self-overlapping geometry, which is why order-independent transparency is still an active topic. For most games, per-object sorting plus some artist discipline is what ships.

## Compression

One last thing happening quietly in this stage: modern GPUs compress render targets. Many tiles of a framebuffer are uniform or nearly so (a clear color, flat sky, depth that varies smoothly across a plane), and the hardware stores them in compressed form transparently. You never see it, but it's one of the reasons clearing render targets at the start of a frame is cheap and recommended: a cleared tile is almost free to store.

Which leads nicely into the last post of this section, and the thing almost everything here has been quietly about: memory bandwidth.
