---
title: "What a Draw Call Really Sends to the GPU"
date: "2026-10-03"
category: "Graphics"
tags: ["GPU", "Foundations", "Performance"]
excerpt: "A draw call doesn't draw anything. It's a few bytes in a command buffer that the GPU will read later. Understanding that delay explains draw call cost, CPU-GPU sync, and why newer APIs look the way they do."
visible: false
---

When you call draw in any graphics API, nothing gets drawn. Not right then, anyway. The function returns in microseconds, long before a single pixel exists. What you actually did was append a small record to a list that the GPU will get around to reading later.

That gap between "I asked" and "it happened" is the most important thing to understand about the CPU side of rendering.

## Two processors, one queue

The CPU and GPU are separate processors with separate clocks, running at the same time. They don't call each other. They communicate through memory, mostly through one structure: a **command buffer**.

A command buffer is a chunk of memory filled with packets in a format only the GPU understands. Things like:

- set this pipeline state (shaders, blend mode, depth test)
- bind this buffer at this slot
- set this constant to this value
- draw 36 indices starting at index 0

The CPU writes packets. The GPU reads and executes them, in order, whenever it reaches them. In between there's a queue, and that queue is usually a frame or two deep.

## The trip a draw call takes

Here's the path, roughly the same on every desktop API:

1. **Your code** calls draw.
2. **The user-mode driver** (a library loaded into your process) checks the current state, figures out what the hardware needs, and encodes it into command packets. This is where most of the CPU cost of a draw call lives.
3. **The kernel-mode driver** and the OS scheduler take finished command buffers and hand them to the GPU, deciding the order when several programs share it.
4. **The GPU's command processor** fetches the packets and starts executing.

Step 2 is the expensive one. In older-style APIs (OpenGL, Direct3D 11) the driver tracks all state for you: which resources are bound, whether a texture you're reading was just written, whether shaders need patching for the current state. That tracking runs on the CPU on every draw. It's why "too many draw calls" is a CPU problem, not a GPU problem, and why a few thousand small draws can bottleneck a frame while the GPU sits half idle.

Newer explicit APIs (Vulkan, Direct3D 12, Metal) move that work to you. You record command buffers yourself, you declare when a resource changes from "being written" to "being read", you build pipeline state up front. More code, but the driver does almost nothing per draw, and you can record command buffers on several threads at once.

## The CPU is ahead of the GPU

Because of the queue, the CPU is normally working on a frame the GPU hasn't started yet. A typical setup:

```
CPU:  [ frame 3 ][ frame 4 ][ frame 5 ]
GPU:        [ frame 2 ][ frame 3 ][ frame 4 ]
```

This is good. Neither side waits for the other, both stay busy. But it has consequences:

- **Latency.** What's on screen is a frame or more behind what the CPU just simulated. Every frame of queue depth is input lag. Most drivers and presentation systems cap how many frames can queue, often around 2 to 3.
- **You can't read results immediately.** Ask the GPU for a value it computed this frame and the CPU has to stop and wait for the GPU to catch up. That's a sync point, and it destroys the overlap. Readbacks have to be delayed a frame or two.
- **You can't overwrite data the GPU still needs.** If the CPU updates a buffer the GPU hasn't consumed yet, one of them has to wait.

That last one is why per-frame data is usually kept in several copies, one per frame in flight. The CPU writes copy N while the GPU reads copy N-1. Older APIs do this behind your back when you map a buffer with a "discard" flag. Explicit APIs make you do it with fences, small markers the GPU signals when it finishes a piece of work, so the CPU knows when a copy is safe to reuse.

## What actually makes draws expensive

Not the draw itself. On the GPU, an individual draw packet is cheap. The costs are:

- **State changes between draws.** Switching shaders or blend modes can force the GPU to drain work in flight before reconfiguring. Sorting draws by state matters.
- **Driver work per draw** (older APIs), mostly validation and hazard tracking.
- **Tiny draws.** A draw of 12 triangles can't fill a GPU with thousands of lanes. There's a fixed overhead per draw that small draws never amortize.

Which is why the standard answers are instancing (one draw, many copies), merging meshes that share materials, and on explicit APIs, indirect draws where the GPU itself generates the draw parameters.

## The mental model to keep

Think of the GPU as a very fast worker on the far side of a mailbox. You don't call it, you leave it instructions. It reads them in order, later. Fast rendering code is mostly about two things: leaving fewer, better instructions, and never standing at the mailbox waiting for a reply.

Next, we follow those packets inside the GPU: what the command processor does with them, and how vertices get fetched before a single shader runs.
