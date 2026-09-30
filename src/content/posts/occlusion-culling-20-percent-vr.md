---
title: "Occlusion Culling: How I Got 20% of the Frame Back in a Shipped VR Game"
date: "2025-05-20"
category: "Performance"
tags: ["Graphics", "VR", "Unreal Engine"]
excerpt: "The fastest draw call is the one you never make. On The Stranger, a VR horror game, culling what the player provably couldn't see bought us back a fifth of the frame. Here's how that works and why VR makes it hard."
---

On a flat screen game, a dropped frame is a stutter. In VR, it's a stomach event. The Stranger was a VR horror title, which meant we had to render every scene twice, once per eye, at 90 frames per second, on hardware our players actually owned. The frame budget wasn't tight, it was hostile. The single biggest win we found was a custom occlusion culling system, worth roughly 20% of rendering time. This post is the thinking behind it.

## The fastest work is no work

Frustum culling everyone knows: don't draw what's outside the camera's view cone. Occlusion culling is the harder sibling: don't draw what's inside the view cone but hidden behind other things. In an indoor game, that's most of the level. The player stands in a corridor; the eight rooms behind these walls are inside the frustum and completely invisible.

![Left: the frame. Right: overdraw heat. Everything yellow and red behind the wall was shaded for nothing.](/images/OcclusionOverdraw.webp)

Without occlusion culling, all of that geometry gets vertex shaded, rasterized, and then murdered by the depth test, pixel by pixel, after the GPU already paid for it. The depth buffer makes the image correct. It does not make it cheap. The goal is for hidden objects to never enter the pipeline at all: no draw call, no state changes, no vertex work, nothing.

## Why the built-in tools weren't enough for VR

Unreal ships hardware occlusion queries: render conservative bounding boxes against last frame's depth, ask the GPU what survived, skip those objects next frame. It's a genuinely good general solution with two problems that VR turns from footnotes into headlines.

First, latency. Query results arrive a frame late, so visibility is always slightly stale. Turn your head fast, and an object that just became visible hasn't been drawn yet: a pop. On a monitor you barely register it. In a headset, where your brain treats the image as reality, a wall blinking into existence is exactly the kind of thing horror games want to do on purpose and absolutely not by accident.

Second, the queries themselves cost GPU time per frame, per eye, in the exact frames you're trying to rescue. Paying rendering time to learn what not to render is a fine trade until the margin is thin, and at 90hz times two eyes, the margin is always thin.

## Precomputed visibility: pay at build time, not at runtime

Our layout was the classic horror setup, rooms, corridors, doorways, and that structure is a gift. When the level is made of enclosed spaces connected by small openings, visibility barely depends on the exact camera position, it depends on which space you're in. So you move the expensive question offline: divide the level into cells, compute ahead of time which cells can possibly be seen from each cell, and store the answers.

At runtime the algorithm becomes almost embarrassing: look up the current cell, draw its visible set, done. Costs nanoseconds, works identically for both eyes, and never pops, because the answer was computed conservatively before the player ever put on the headset. The precomputation errs on the side of "might be visible", so the worst case is drawing slightly too much, never drawing too little. In VR that asymmetry is everything: too much is a few wasted draw calls, too little is a hole in reality.

That's the shape of what shipped, tuned and special-cased around our levels' geometry, with the doorways doing the heavy lifting as natural portals between spaces.

## What it bought and what it cost

Around 20% of rendering time back, which at our budget was the difference between holding the headset's native rate and living in reprojection. The cost was honesty about constraints: this approach works because the levels are rooms and corridors. An open field would have laughed at our cells. Level designers also had to live with light rules about what counts as an occluder, because the precomputation trusted walls to be walls.

The transferable lesson isn't the specific technique, it's the priority order. Before optimizing any shader, ask what you're rendering that nobody can see. The fastest draw call is the one that never happens, and in most indoor scenes, that's a shockingly large fraction of everything.
