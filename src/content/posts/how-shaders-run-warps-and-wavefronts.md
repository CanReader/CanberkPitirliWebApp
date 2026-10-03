---
title: "How Shaders Run: Warps, Wavefronts and Hiding Latency"
date: "2026-10-03"
category: "Graphics"
tags: ["GPU", "Foundations", "Shaders"]
excerpt: "A GPU doesn't run your shader thousands of times in parallel the way a CPU runs threads. It runs it in lockstep groups of 32 or 64, and it hides memory latency by juggling those groups. Both facts shape how fast your shaders are."
---

Your shader looks like a function that runs once per vertex or once per pixel. That's the right way to write it and the wrong way to picture it running. To reason about shader performance you need the real picture, and it's surprisingly simple once you see it.

## Lanes, not threads

A GPU is built from many identical blocks. NVIDIA calls them streaming multiprocessors, AMD calls them compute units, mobile vendors have their own names. Inside each block are a lot of very simple arithmetic units.

Those units don't run independent threads. They're grouped, and every unit in a group executes **the same instruction at the same time**, each on its own data. One instruction, many lanes. NVIDIA calls a group of 32 lanes a warp. AMD calls a group a wavefront, 64 lanes on older hardware and 32 or 64 on newer ones. I'll just say wave.

So when your pixel shader runs on a triangle, the GPU packs 32 or 64 pixels into a wave and steps them through your code together. Instruction 1 for all of them, then instruction 2 for all of them, and so on. This is SIMT: single instruction, multiple threads.

Why build it this way? Because the expensive part of a processor isn't the math, it's the control: fetching instructions, decoding them, scheduling them. Sharing that control across 32 or 64 lanes makes each lane tiny, so you can fit thousands of them on a chip.

## The price: divergence

Lockstep has a catch. What happens when lanes in the same wave disagree on an `if`?

```
if (n_dot_l > 0.0)
    color = expensiveLighting();
else
    color = ambient;
```

If every lane goes the same way, great, only one side runs. But if some lanes take the `if` and some take the `else`, the wave can't split. It runs the `if` side with the other lanes switched off, then runs the `else` side with the first group switched off. The wave pays for both paths.

That's divergence, and it's why "branches are slow on GPUs" is half true. Branches are cheap when they're coherent, meaning neighboring pixels or vertices usually take the same path. They're expensive when the decision flickers from lane to lane. A branch on a value that's constant across a draw is basically free. A branch on per-pixel noise is not.

Here's one wave of 32 lanes running a branch like the one above. Each row of the grid is one instruction the wave issued, and the dark cells are lanes that sat it out.

```demo
warp
```

## The real trick: hiding latency

Here's the part most explanations skip, and it's the more important one.

Reading memory is slow. A texture fetch that misses the caches can take hundreds of cycles. A CPU fights that with big caches and clever prediction. A GPU mostly doesn't bother. It does something blunter: **it keeps many waves loaded at once and switches between them.**

When wave A issues a texture read and has to wait, the scheduler doesn't stall. It picks wave B, which is ready, and runs its next instruction. Then wave C. By the time it comes back around, wave A's data has arrived. Switching is essentially free because every resident wave already has its own registers sitting on the chip. Nothing gets saved or restored.

So a GPU doesn't make memory fast. It makes waiting cheap, as long as there's other work to do in the meantime.

## Occupancy and register pressure

That only works if enough waves fit on the block at once. The number that fit is called occupancy, and the usual limit is registers.

Each block has a fixed register file shared by all its resident waves. If your shader needs a lot of registers per lane (big structs, long-lived temporaries, unrolled loops), fewer waves fit. Fewer waves means less to switch to while waiting on memory, and the latency starts to show.

That's the real reason a shader can get slower when you add code that never even runs: the compiler had to reserve more registers, occupancy dropped, and every texture fetch in the shader now hurts more. You don't need to count registers by hand, every vendor's profiler shows them, but you should know that "use fewer registers" and "fetch memory less often" are the same goal from two directions.

Here's that trade in one place. The register count decides how many waves fit, and the top row shows whether the ALU has anything to do while they wait on memory.

```demo
warp latency
```

## How to write shaders with this in mind

- **Keep branches coherent.** Branch on things that are the same across large regions of the screen or the whole draw.
- **Don't fear math, respect memory.** Arithmetic is cheap and plentiful. Memory reads are what the whole architecture is built around hiding.
- **Watch register count on hot shaders.** If a full-screen shader got slower after a small change, check occupancy before anything else.

I went deeper on the HLSL side of this in [HLSL From First Principles](/blog/hlsl-from-first-principles). Next in this series we leave the shader cores and go back to fixed hardware: clipping, triangle setup and the rasterizer, the part that turns three shaded vertices into a set of pixels.
