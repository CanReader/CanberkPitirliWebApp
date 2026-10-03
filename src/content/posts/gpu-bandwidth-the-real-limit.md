---
title: "Bandwidth Is the Real Limit: Memory, Caches and Tiled GPUs"
date: "2026-10-03"
category: "Graphics"
tags: ["GPU", "Foundations", "Performance"]
excerpt: "GPUs can do far more math than they can feed with data. Most rendering performance work is really about moving fewer bytes, and on mobile GPUs the whole architecture is built around that idea."
---

If you take one idea away from this section of the series, make it this one: a GPU can compute far faster than it can move data. Math is cheap. Bytes are expensive. Most of the optimizations you'll ever make in a renderer are really ways of reading and writing less memory.

## The imbalance

A modern desktop GPU can do tens of trillions of floating point operations per second. Its memory delivers somewhere in the hundreds of gigabytes per second, around a terabyte per second on the high end. Divide one by the other and you get a ratio of dozens of arithmetic operations for every single float it can fetch from memory.

That ratio is why everything we've covered looks the way it does:

- shader cores hide memory latency by juggling waves, because waiting on memory is the normal case
- depth testing runs early, so hidden pixels never read their textures
- render targets get compressed, because writing them is a major cost
- textures have mipmaps, partly for quality but also because a distant object sampling a tiny mip touches far less memory than sampling the full-size image

## Where the bytes go in a frame

A rough mental budget for what reads and writes memory every frame:

1. **Vertex data**: positions, normals, UVs for every vertex shaded.
2. **Textures**: every sample that misses the caches.
3. **Render targets**: every pixel written, and read again if blended.
4. **Intermediate passes**: shadow maps, G-buffers, post-processing targets, each written once and read at least once.

Number 4 is the one that quietly dominates in modern renderers. A full-screen pass at 1080p touches about 2 million pixels. Read one 16-byte value and write one per pixel and you've moved roughly 66 MB. Ten such passes is most of a gigabyte per frame, before any actual scene rendering. This is the bandwidth argument at the center of [forward vs deferred rendering](/blog/deferred-vs-forward-rendering): a G-buffer is a lot of bytes written and read back.

## Caches help, within limits

GPUs have caches (per-core caches, a larger shared L2, and more on recent designs), but they're small relative to the data a frame touches, and they're tuned for locality, not for big re-use. They work beautifully when neighboring pixels read neighboring texels, which is exactly what rasterizing triangles and sampling mipmapped textures produces. They work badly for random access: dependent texture reads with scattered coordinates, or large buffers indexed unpredictably.

Rule of thumb: coherent access is nearly free, scattered access is where frames go to die.

## Tiled GPUs: built around bandwidth

Mobile GPUs live with a fraction of desktop bandwidth, and moving data costs battery as well as time. So most of them (Apple, Arm Mali, Qualcomm Adreno, Imagination PowerVR) use a different rendering architecture: **tile-based rendering**.

Instead of drawing each triangle straight into the framebuffer in memory, the GPU works in two phases:

1. **Binning**: run vertex shading for the whole render pass and sort the resulting triangles into screen tiles (small blocks, often 16x16 or 32x32 pixels).
2. **Tile rendering**: for each tile, load it into fast on-chip memory, rasterize and shade only the triangles in that tile, do depth testing and blending entirely on-chip, then write the finished tile to memory once.

The depth buffer, the blending, all the overdraw happen inside a tiny on-chip buffer. Main memory only sees the final pixels. That's a huge bandwidth saving, and it's why the explicit APIs expose concepts that look odd on desktop:

- **load and store actions** for render targets: "don't load the old contents" and "don't store the depth buffer" tell a tiled GPU it can skip reading or writing a whole attachment
- **transient or memoryless attachments**: a depth buffer that lives only on-chip and never gets memory at all
- **subpasses / tile memory reads**: reading the previous pass's result for the same pixel without a round trip to memory

On desktop these are mostly no-ops. On mobile, setting load and store actions correctly is often the single biggest performance win available, and getting them wrong can quietly double your memory traffic.

Here's a typical deferred frame added up. It only counts render targets, so the real number is higher, but it's enough to see how resolution and frame rate multiply, and how much a tiled GPU keeps off the bus.

```demo
bandwidth
```

## How to think about it

When a frame is slow, ask "how many bytes did that cost?" before "how many instructions?". Smaller formats, fewer full-screen passes, fewer render target reads, coherent access patterns, correct load and store actions on tiled hardware. Those are where real time comes back.

That wraps up how a GPU actually renders a frame, from command buffer to final pixel. Next we step back to the math every one of these stages was quietly using: vectors, matrices, and the chain of coordinate spaces that takes a vertex from a model file to a pixel on screen.
