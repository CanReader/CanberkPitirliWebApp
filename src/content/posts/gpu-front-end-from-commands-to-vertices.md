---
title: "Inside the GPU Front End: From Commands to Vertices"
date: "2026-10-03"
category: "Graphics"
tags: ["GPU", "Foundations", "Rendering"]
excerpt: "Before a vertex shader runs, the GPU has to parse your commands, read your index buffer, and decide which vertices actually need shading. Index order turns out to matter more than most people expect."
---

Last time we ended at the mailbox: the CPU writes command packets, the GPU reads them later. Now let's go inside and watch what happens to a draw packet before any of your shader code runs. This part of the GPU is called the front end, and it's mostly fixed-function hardware you don't program but very much influence.

## The command processor

The first stop is the command processor. It's a small, fairly ordinary processor whose only job is to read the command stream and turn it into work for the rest of the chip.

Most packets just change state. "Use this blend mode" or "this texture lives at this address" ends up written into registers that the rest of the pipeline reads. The command processor keeps that state, and when it hits a draw packet it takes a snapshot of the current state and launches the draw with it.

This is also where some of the cost of state changes shows up. Certain changes can't be applied while earlier draws are still running with the old state, so the front end has to let the pipeline drain before continuing. On most modern hardware many states are versioned and can overlap, but switching the shaders themselves or the render targets is still a classic place to lose time.

## Primitive and index fetch

A draw says "draw N indices starting here". So the first real work is reading the **index buffer**: a list of integers, each one pointing at a vertex.

```
vertices: [ v0, v1, v2, v3 ]
indices:  [ 0, 1, 2,   2, 1, 3 ]   // two triangles sharing an edge
```

The input assembly stage reads these indices in order and groups them into primitives, three at a time for a triangle list. The two triangles above share vertices 1 and 2, which raises the question that makes index buffers worth having at all: does the GPU shade vertex 1 twice?

## The post-transform vertex cache

Ideally not. GPUs keep the results of recently shaded vertices around, keyed by index. If index 2 shows up again soon after it was shaded, the GPU reuses the output instead of running the vertex shader again. This is usually called the post-transform vertex cache, and how it's implemented differs a lot between vendors, but the behavior you can rely on is the same: **reuse only works if the repeat is close by.**

That's why index order matters. Two meshes with the exact same triangles can cost very different amounts of vertex work depending on whether triangles that share vertices sit next to each other in the index buffer. A well-ordered mesh shades each vertex roughly once. A badly ordered one can shade most vertices two or three times.

You don't need to reorder by hand. Mesh optimization libraries do it at build time (meshoptimizer is the common one), and running your meshes through one is one of the cheapest wins in rendering.

The general rule: a vertex is shared by about six triangles in a typical closed mesh, so a perfect cache would shade roughly 0.5 vertices per triangle. Real numbers land somewhat above that, but well below the 3 per triangle you'd pay with no reuse at all.

## Vertex fetch

Once the GPU knows which vertices need shading, it has to read their data: position, normal, UV, whatever your vertex layout declares. The layout you describe to the API (this attribute is three floats at offset 0, this one is two floats at offset 12, stride 32) is exactly what this stage uses.

On a lot of modern hardware there isn't a separate fixed-function unit for this anymore. The driver compiles a small prologue into your vertex shader that loads the attributes with ordinary memory reads. Either way the consequences are the same:

- **Smaller vertices fetch faster.** Packing normals into 8 or 10 bits per component, or UVs into 16-bit values, cuts memory traffic for every vertex every frame.
- **Layout affects caching.** Interleaved data (all attributes of one vertex together) is usually good for the main pass. Splitting position into its own stream can win for depth-only passes like shadow maps, which only read positions.

## Launching the vertex shader

Finally the front end gathers vertices that need shading into batches and hands them to the shader cores. Not one at a time: in groups of 32 or 64, because that's the width the shader hardware executes at.

That batching is the bridge to the next post. Everything up to here was fixed hardware reading your data. From here on it's your code, running in a way that looks nothing like a CPU running a function. Next: how shaders actually run, warps and wavefronts, and why one slow lane holds back all of its neighbors.
