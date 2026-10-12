---
title: "Blender's Triangle Fan Costs Your GPU 40% More (Here's the Fix)"
date: "2026-10-12"
category: "Graphics"
tags: ["GPU", "Blender", "Performance", "Shaders"]
excerpt: "I measured a 64-sided cap: Triangle Fan fill shades about 40% more than an N-gon cap triangulated by Blender's own modifier. Interactive demo inside."
---

A few days ago someone on r/blender asked a good question: [why does modern 3D art tolerate the fan pattern?](https://www.reddit.com/r/blender/comments/1x3a38s/why_does_modern_3d_art_tolerate_the_fan_pattern/) And someone in the thread answered it by linking my post on [why pixel shading happens in 2x2 quads](/blog/pixel-shading-in-2x2-quads/).

That was a nice surprise to see, and it's a good answer. But it made me curious how much the fan actually costs, so I measured it.

I filled the same circle in different ways and ran each version through a small rasterizer that follows the GPU's rules. Then I did the same with the exact triangles Blender 5.2 outputs. On a 64-sided cap, Blender's **Triangle Fan** fill turned out to cost about **40% more pixel shading** than the N-Gon fill from the same dropdown. With only a few sides though, the fan costs nothing extra.

In this post I go through why that happens and when it actually matters.

## The 30-second version of 2x2 quads

A GPU never shades a single pixel. It shades 2x2 blocks, because it needs the neighboring pixels to see how fast your texture coordinates change, and that's how it picks a mip level. If a triangle covers only one pixel of a block, all four pixels still run the shader. The other three are called helper lanes. They do the work and the result is thrown away.

For fans, this is the important bit: **each triangle shades its own quads.** If three triangles each cover one pixel of the same 2x2 block, that block is shaded three times, which means 12 shader runs for 4 pixels.

## Why a fan is the worst case

In a fan, every triangle starts at the center. With 64 sides you get 64 long, thin triangles that all meet at one point.

Near the center, each quad is crossed by several of these thin triangles, and each of them shades that quad again. Further out it's still bad, because the triangles are so narrow that most quads they touch are only partly covered. So the waste isn't only at the outer rim, it's along every edge, and a fan is basically all edges.

What helps is making the triangles as wide as possible. The best known layout for a circle is "max area": start with the biggest triangle that fits, then keep filling each gap with the biggest triangle that fits in it. Emil Persson [measured exactly this back in 2009](https://www.humus.name/index.php?page=News&ID=228) and called it a perimeter versus area problem: with fat triangles, the waste stays on the outer edge of the circle, and the inside gets shaded once no matter how many triangles you add.

You can try it below. Both versions cover exactly the same pixels, so keep an eye on where the red quads show up:

```demo
fan
```

Press N to change the number of sides. These are the numbers the demo shows:

| Sides | Fan | Max area | Fan vs max area |
|---|---|---|---|
| 8 | 880 lanes | 940 lanes | 6% cheaper |
| 16 | 1,096 lanes | 1,064 lanes | 3% more |
| 32 | 1,420 lanes | 1,176 lanes | 21% more |
| 64 | 1,956 lanes | 1,184 lanes | **65% more** |

The max area column barely changes, going from 16 sides to 64 only adds 11% more work. The fan gets more expensive with every side, because each new side is one more thin triangle going back to the center.

## How big is the circle on screen?

The demo's disk is 32 pixels across. Here's the same comparison at other sizes, for a 64-sided and a 256-sided disk:

| Disk diameter on screen | 64 sides: fan vs max area | 256 sides: fan vs max area |
|---|---|---|
| 16 px | 82% more | 139% more |
| 64 px | 43% more | 144% more |
| 256 px | 13% more | 60% more |

So **more sides and a smaller size on screen both make the fan worse.** A big, simple fan barely matters. A dense fan on something small, like a bolt head, a button or the end of a pipe in the distance, can more than double the pixel shading for that object.

## What Blender actually gives you

The tables above use idealized layouts, so I checked what Blender really produces. I made a 64-sided circle with each Fill Type, triangulated it with Blender 5.2's Triangulate modifier, and rasterized the exact triangles it output. At 64 pixels across:

| How the cap was made | Pixel shading | Useful work |
|---|---|---|
| Fill Type: **Triangle Fan** | 5,744 lanes | 56% |
| Fill Type: **N-Gon**, Triangulate set to **Beauty** | 4,144 lanes | 77% |
| Fill Type: **N-Gon**, Triangulate set to **Clip** | 4,088 lanes | 79% |
| Ideal max area, for reference | 4,028 lanes | 80% |

Triangle Fan costs 39% more than Beauty. Both of Blender's N-gon methods are within 3% of the ideal layout, so you don't need any special tool for this, Blender's own modifier already does a good job as long as you don't start from a fan.

What I'd do in practice:

- **For caps, use N-Gon fill instead of Triangle Fan**, as long as you don't need the center vertex for modeling.
- **Triangulate it yourself before export** with the Triangulate modifier, Beauty or Clip. If you export the N-gon untouched, the exporter or the engine decides how to cut it, and you don't control what you get.
- **If you do need edges running to the center**, for a bevel or a subdivision setup, that's fine on the high-poly mesh. Just don't ship the dense fan as the game mesh.

## So why does modern 3D art tolerate it?

To be honest, most of the time it doesn't matter much. The numbers above show when it does and when it doesn't:

- **With few sides and a big size on screen, there's no extra cost.** At 8 sides the fan was actually cheaper, and a 16-sided cap 256 pixels across costs the same either way.
- **A cheap shader makes it hard to notice.** All of this is extra pixel shader work, so with a simple material 40% more is still very little. With a heavy material it adds up, and Persson found MSAA makes the fan even worse.
- **LODs usually take care of it.** The dense fan on the close-up mesh is usually an 8-sided cap by the time the object is 20 pixels wide.
- **Some engines avoid quads for tiny triangles.** Unreal's Nanite draws very small triangles with a compute shader instead of the hardware rasterizer, so they don't pay the 2x2 quad cost at all.

So I think tolerating it is fair. It's a real cost, but it only gets big when a fan has lots of sides, is small on screen and uses an expensive shader. The tricky part is that a profiler won't point at your fan, you'll just see a frame that's a bit slower than it should be.

## What I measured, and what I didn't

A few notes on how I measured this:

- **Lanes means pixel shader runs**, helper lanes included, since that's the cost quads add. Vertex work is about the same for every layout, because they all have nearly the same number of triangles.
- **The rasterizer** samples pixel centers and uses a top-left fill rule like Direct3D's, so no pixel is ever covered twice. Every layout covers the same number of pixels, each exactly once.
- **Real GPUs** do more than this, like coarse rasterization tiles, compression and different wave sizes. But every desktop and mobile GPU shades in 2x2 quads, and that's where the fan's extra cost comes from.

If you haven't read the post that started all this, [Pixel Shading Happens in 2x2 Quads](/blog/pixel-shading-in-2x2-quads/) explains quads in more detail, and has a demo where you can shrink a triangle and see how much work gets wasted.
