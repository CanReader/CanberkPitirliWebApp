---
title: "Blender's Triangle Fan Costs Your GPU 40% More (Here's the Fix)"
date: "2026-10-12"
category: "Graphics"
tags: ["GPU", "Blender", "Performance", "Shaders"]
excerpt: "I measured a 64-sided cap: Triangle Fan fill shades about 40% more than an N-gon cap triangulated by Blender's own modifier. Interactive demo inside."
---

A few days ago someone on r/blender asked a good question: [why does modern 3D art tolerate the fan pattern?](https://www.reddit.com/r/blender/comments/1x3a38s/why_does_modern_3d_art_tolerate_the_fan_pattern/) And someone in the thread answered it by linking my post on [why pixel shading happens in 2x2 quads](/blog/pixel-shading-in-2x2-quads/).

That's the right answer, but it's half of one. So I measured it.

I took the same circle, filled it in different ways, and ran every version through a small rasterizer that follows the same rules the GPU does. Then I did the same thing with the exact triangles Blender 5.2 produces. Short version: on a 64-sided cap, Blender's **Triangle Fan** fill makes the GPU do about **40% more pixel shading** than the alternative sitting right next to it in the same dropdown. On a fan with fewer sides, it costs nothing at all.

Here's why, and when it actually matters.

## The 30-second version of 2x2 quads

A GPU never shades one pixel. It shades 2x2 blocks, because it needs neighboring pixels to work out how fast your texture coordinates change, which is how it picks a mip level. If a triangle covers one pixel of a block, all four still run. The other three are helper lanes: they do the work, then get thrown away.

And the part that matters here: **every triangle runs its own quads.** If three triangles each cover one pixel of the same 2x2 block, that block gets shaded three times. Twelve lanes of work for four pixels.

## Why a fan is the worst case

Look at what a fan does. Every triangle starts at the center. With 64 sides, that's 64 long, thin slivers all meeting at one point.

So near the center, every quad is crossed by several thin triangles, and each one runs its own copy of that quad. Along their whole length, the slivers are narrow enough that most quads they touch are only partly covered. The waste isn't at the rim, where you'd expect it. It's spread along every edge, and edges are all a fan has.

The fix is to make triangles as fat as possible. The best known layout for a circle is "max area": start with the biggest triangle that fits, then keep filling each gap with the biggest triangle that fits in it. Emil Persson [measured exactly this back in 2009](https://www.humus.name/index.php?page=News&ID=228) and called it a perimeter versus area problem: with fat triangles, the waste stays on the outer edge of the circle, and the inside gets shaded once no matter how many triangles you add.

Try it. Both versions cover exactly the same pixels. Watch where the red quads are:

```demo
fan
```

Press N to step through the side counts and you'll see the whole story:

| Sides | Fan | Max area | Fan vs max area |
|---|---|---|---|
| 8 | 880 lanes | 940 lanes | 6% cheaper |
| 16 | 1,096 lanes | 1,064 lanes | 3% more |
| 32 | 1,420 lanes | 1,176 lanes | 21% more |
| 64 | 1,956 lanes | 1,184 lanes | **65% more** |

Look at the max area column. It barely moves: going from 16 sides to 64 adds 11% more work. The fan's cost grows with every side you add, because every new side is another sliver running back to the center.

## How big is the circle on screen?

The demo's disk is 32 pixels across. Here's the same comparison at other sizes, for a 64-sided and a 256-sided disk:

| Disk diameter on screen | 64 sides: fan vs max area | 256 sides: fan vs max area |
|---|---|---|
| 16 px | 82% more | 139% more |
| 64 px | 43% more | 144% more |
| 256 px | 13% more | 60% more |

The pattern: **the more sides, and the smaller it is on screen, the worse the fan gets.** A big, simple fan barely matters. A dense one on something small, like a bolt head, a button, or the end of a pipe in the distance, can more than double its pixel shading.

## What Blender actually gives you

The tables above use idealized layouts, so I checked what Blender really produces. I made a 64-sided circle with each Fill Type, triangulated it with Blender 5.2's Triangulate modifier, and rasterized the exact triangles it output. At 64 pixels across:

| How the cap was made | Pixel shading | Useful work |
|---|---|---|
| Fill Type: **Triangle Fan** | 5,744 lanes | 56% |
| Fill Type: **N-Gon**, Triangulate set to **Beauty** | 4,144 lanes | 77% |
| Fill Type: **N-Gon**, Triangulate set to **Clip** | 4,088 lanes | 79% |
| Ideal max area, for reference | 4,028 lanes | 80% |

Triangle Fan costs 39% more than the Beauty result. And both of Blender's own N-gon methods land within 3% of the ideal layout. You don't need a special algorithm. You just need to not hand the GPU a fan.

So the practical fix:

- **For caps, use N-Gon fill instead of Triangle Fan**, as long as you don't need the center vertex for modeling.
- **Triangulate it yourself before export** with the Triangulate modifier, Beauty or Clip. If you export the N-gon untouched, the exporter or the engine decides how to cut it, and you don't control what you get.
- **If you do need edges running to the center**, for a bevel or a subdivision setup, that's fine on the high-poly mesh. Just don't ship the dense fan as the game mesh.

## So why does modern 3D art tolerate it?

Because a lot of the time, it honestly doesn't matter. The numbers above say when:

- **Few sides, big on screen: free.** At 8 sides the fan was actually cheaper. A 16-sided cap 256 pixels across costs exactly the same either way.
- **Cheap shaders hide it.** All of this is extra pixel shader work. If the material is simple, 40% more of almost nothing is still almost nothing. With a heavy material, or MSAA, which Persson found makes the fan's edges hurt even more, it adds up.
- **LODs usually remove it.** The dense fan on the hero mesh becomes an 8-sided cap by the time it's 20 pixels wide.
- **Some engines skip the quad problem for tiny triangles.** Unreal's Nanite rasterizes very small triangles in a compute shader instead of the hardware path, so they don't pay for 2x2 quads at all.

So "tolerate" is fair. It's not a crime, it's a cost, and it only gets big in one specific situation: lots of sides, small on screen, expensive shader. That's exactly the kind of thing that never shows up in a profiler as "your fan," just as a frame that's slower than it should be.

## What I measured, and what I didn't

To be precise about it:

- **Lanes means pixel shader invocations**, helper lanes included. That's the cost quads add. Vertex work is the same for every layout here, since they all have nearly the same triangle count.
- **The rasterizer** samples pixel centers and uses a top-left fill rule like Direct3D's, so no pixel is ever covered twice. Every layout covers the same number of pixels, each exactly once.
- **Real GPUs** have more going on: coarse rasterization tiles, compression, different wave sizes. But the 2x2 quad is universal across desktop and mobile hardware, and it's the whole reason the fan costs more.

If you missed the post that started this, [Pixel Shading Happens in 2x2 Quads](/blog/pixel-shading-in-2x2-quads/) has the full explanation, with a demo where you can make a triangle tiny and watch the waste climb.
