---
title: "Pixel Shading Happens in 2x2 Quads (and Why Tiny Triangles Hurt)"
date: "2026-10-03"
category: "Graphics"
tags: ["GPU", "Foundations", "Shaders"]
excerpt: "GPUs never shade a single pixel. They shade 2x2 blocks so they can compute derivatives, which is how texture filtering picks a mip level. The side effect: a one-pixel triangle costs four pixels of work."
---

Here's a fact that surprises almost everyone the first time: a GPU never runs your pixel shader on just one pixel. The smallest unit of pixel shading is a 2x2 block, a quad. Even if a triangle covers exactly one pixel, four shader invocations run.

That sounds wasteful, and sometimes it is. But it exists for a very good reason.

## The problem: which mip level?

When you sample a texture, the GPU has to decide how much of the texture lands on one screen pixel. Up close, one texel might cover ten pixels. Far away, ten texels might squeeze into one pixel, and if you just picked one of them you'd get shimmering noise as the camera moves. Mipmaps fix that: smaller, pre-filtered copies of the texture, and the GPU picks the one whose texel size matches the pixel size.

But to know "how much texture per pixel", the GPU needs to know how fast the texture coordinate changes from one pixel to the next. That's a derivative: the change in UV per pixel step, in x and in y.

You can't get that from a single pixel. One pixel only knows its own UV.

## The solution: shade neighbors together

So the GPU shades pixels in 2x2 quads, with all four lanes sitting next to each other in the same wave. Any value in the shader can be compared across the quad:

- difference with the pixel to the right gives the x derivative
- difference with the pixel below gives the y derivative

Texture sampling does this automatically on the UVs you pass in, and uses the result to pick the mip level and the filtering footprint. You can also do it yourself on any value: `ddx`/`ddy` in HLSL, `dFdx`/`dFdy` in GLSL, `dfdx`/`dfdy` in Metal and WGSL. It's cheap because the neighbor's value is already sitting in the same wave. It's an approximation (one-pixel finite differences, shared within the quad), but it's what every texture lookup in a pixel shader relies on.

Here it is on a real surface. Every 2x2 quad on this floor picks its own mip level from the UV differences between its pixels. Hover a pixel to see its quad and its level:

```demo
floor mips
```

Useful tricks that fall out of this:

- **Flat normals for free**: the cross product of the derivatives of world position gives the face normal, no vertex normals needed.
- **Anti-aliased edges in shaders**: scale a hard step by the derivative of its input (`fwidth`) and you get a one-pixel soft edge at any zoom level.

## Helper lanes

Now the catch. What happens at the edge of a triangle, where only some pixels of a 2x2 block are inside?

The quad still runs all four lanes. The pixels outside the triangle become **helper lanes**: they execute the shader so their neighbors can compute derivatives, but their results are thrown away. They never write to the framebuffer.

For big triangles that's a thin border of waste along the edges, no big deal. For small triangles it's brutal:

- a triangle covering 1 pixel runs 4 lanes: 75% wasted
- a long thin triangle can touch many quads while covering only a few pixels in each

Here's the same rasterizer from the last post, now showing quads. The hatched pixels are helper lanes. Hit "Tiny triangle" and look at the percentage:

```demo
rasterizer quads
```

This is the main reason dense geometry gets expensive faster than triangle count suggests. Once triangles shrink to a few pixels each, a large share of your pixel shading is helper lanes. It's a big part of why LODs exist, why very dense meshes are often rasterized in compute shaders by modern engines instead of the hardware path, and why "just add more triangles" eventually stops being free.

## Discard and derivatives

One more interaction worth knowing: what happens to a lane that discards. This is one of the few places where the APIs genuinely differ. In HLSL, `discard` demotes the lane to a helper: it stops writing, but keeps running so its neighbors' derivatives stay valid. In classic GLSL, `discard` could terminate the lane outright, which left derivatives after it undefined for the rest of the quad. That gap is exactly why Vulkan and SPIR-V later added an explicit "demote to helper" operation. The safe habit everywhere: don't rely on derivatives after a discard.

The other place you get in trouble is computing derivatives, or sampling textures with automatic mip selection, inside a branch that some lanes of the quad don't take. The neighbor value you'd subtract doesn't exist, the result is undefined, and you get sparkly garbage along certain edges. The fix is usually to compute the UV derivatives (or sample) before the branch, or use the explicit "sample with gradient" or "sample at level" variants inside it.

## Interpolation, briefly

The values your vertex shader outputs (UVs, normals, colors) arrive at each pixel interpolated across the triangle, using the weights the rasterizer computed. And that interpolation is **perspective-correct**: it's done in a way that accounts for depth, otherwise textures on a floor would visibly bend as the camera moved. It's done by interpolating value/w and 1/w linearly and dividing at each pixel. You get it for free, but you'll implement it yourself if you ever write a software rasterizer, and it's a great "aha" moment when you do.

Turn perspective correction off below and watch the checkers bend along the diagonal where the floor's two triangles meet. That wobble is exactly what PlayStation 1 games looked like, because that hardware interpolated affinely:

```demo
floor affine
```

Next: what happens after the pixel shader. The depth test, blending, and the output stage that can throw away your work before it even starts.
