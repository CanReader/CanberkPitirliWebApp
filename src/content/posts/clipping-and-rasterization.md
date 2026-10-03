---
title: "Clipping and Rasterization: Turning Triangles into Pixels"
date: "2026-10-03"
category: "Graphics"
tags: ["GPU", "Foundations", "Rendering"]
excerpt: "Between the vertex shader and the pixel shader sits fixed hardware that clips triangles, culls the ones facing away, and decides exactly which pixels each triangle covers. It all comes down to three edge functions."
---

Your vertex shader outputs three positions. Your pixel shader runs on pixels. Something in between has to answer a very precise question: given this triangle, which pixels does it cover? That something is the rasterizer, and the steps leading into it are worth knowing, because they explain a lot of strange artifacts you'll eventually hit.

## Clip space and clipping

The position your vertex shader writes isn't a screen position yet. It's in **clip space**, a 4D coordinate (x, y, z, w). The visible region is everything where x, y and z are within plus or minus w (with a slightly different range for z depending on the API's depth convention). The math series covers where that comes from. For now, the rule is just "inside these bounds is visible".

Triangles fully outside get thrown away early, cheap. Triangles fully inside pass straight through. The awkward case is a triangle crossing the boundary.

Real clipping, cutting the triangle along the boundary and making new vertices, is relatively expensive, so GPUs avoid it where they can. Most hardware rasterizes a much larger area than the screen, called a guard band, and simply doesn't generate pixels outside the viewport. A triangle that crosses the screen edge never gets clipped, the extra pixels are just skipped.

The one boundary you really can't cheat is the **near plane**. Vertices behind the camera have w at or below zero, and dividing by that flips or explodes the coordinates. Triangles crossing the near plane have to be truly clipped. That's why near-plane intersections are the case that shows bugs first in every software rasterizer people write.

## The perspective divide and the viewport

Surviving vertices get divided by w: (x/w, y/w, z/w). That's the perspective divide, it's what makes distant things smaller, and the result is called normalized device coordinates (NDC), where the visible region is a fixed box.

Then the viewport transform maps NDC to actual pixel coordinates: x from -1..1 to 0..width, y to 0..height. Now we have three points on the screen, in pixels, with a depth value each.

## Backface culling

Before spending any time on pixels, the GPU can check which way the triangle faces. The signed area of a 2D triangle tells you whether its vertices go clockwise or counterclockwise on screen:

```cpp
float signedArea(Vec2 a, Vec2 b, Vec2 c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
```

In a closed mesh, triangles facing away from the camera appear with the opposite winding. If you tell the pipeline "cull back faces", every triangle with the wrong sign is dropped here, roughly half the triangles of any solid object, before a single pixel is touched. Getting the winding order of your meshes consistent is what makes this work, and getting it wrong is what makes your model look inside out.

## Edge functions: the heart of the rasterizer

Here's the core idea, and it's beautifully simple. That same signed-area formula, used with one edge of the triangle and a test point, tells you which side of the edge the point is on:

```cpp
float edge(Vec2 a, Vec2 b, Vec2 p) {
    return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
}

bool inside(Vec2 v0, Vec2 v1, Vec2 v2, Vec2 p) {
    return edge(v0, v1, p) >= 0 &&
           edge(v1, v2, p) >= 0 &&
           edge(v2, v0, p) >= 0;
}
```

A pixel is inside the triangle when it's on the inner side of all three edges. The GPU evaluates this at the **center** of each pixel, (x + 0.5, y + 0.5), not at its corner.

Try it. This is that exact test running on a small grid; drag the corners around and watch which centers make it in:

```demo
rasterizer
```

Hardware doesn't loop over pixels one by one, though. Edge functions are linear, so stepping one pixel to the right just adds a constant. That makes them perfect for testing whole blocks at once: the rasterizer first checks coarse tiles (say 8x8 pixels) against the triangle, throws away tiles that are fully outside, accepts tiles that are fully inside, and only does per-pixel tests on tiles cut by an edge.

## The fill rule

What about a pixel center that lands exactly on an edge shared by two triangles? If both triangles claimed it, it would be drawn twice (visible with transparency). If neither did, you'd get a crack.

GPUs settle it with a fixed tie-break called the **top-left rule**: a pixel exactly on an edge belongs to the triangle only if that edge is a top edge or a left edge. Every shared edge is top-left for exactly one of its two triangles, so every pixel gets drawn exactly once. Small detail, and the reason meshes don't show seams between triangles.

## What comes out

The rasterizer's output is coverage: for each pixel, whether the triangle covers it, plus the information needed to interpolate vertex outputs across the triangle. Those three edge function values are, scaled, exactly the barycentric weights used for interpolation, which we'll come back to in the geometry series.

And it doesn't output pixels one at a time. It outputs them in 2x2 blocks, which is next post's topic, and the reason tiny triangles are so much more expensive than they look.
