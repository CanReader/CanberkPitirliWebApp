---
title: "Hand-Written CUDA vs PyTorch: Honest Benchmarks from Building FastNN"
date: "2026-04-29"
category: "AI & ML"
tags: ["Rust", "CUDA", "Performance"]
excerpt: "I wrote a deep learning framework from scratch in Rust with hand-tuned CUDA kernels, benchmarked it against PyTorch, and I'm publishing the numbers including the ones that don't flatter me."
---

FastNN is my deep learning framework: Rust on the outside, hand-written CUDA on the inside, no PyTorch or TensorFlow anywhere underneath. Define-by-run autodiff, RAII GPU memory, layers up to full Transformers. I built it to find out what the big frameworks actually cost you, and this post is the honest scorecard.

Spoiler for the impatient: on raw matrix operations FastNN lands within about 15% of PyTorch while using roughly 40% less VRAM. Both halves of that sentence deserve scrutiny, so here's the scrutiny.

## Benchmark honestly or don't bother

Most framework benchmarks on the internet are broken in one of three ways, and I know because I committed all three before building TensorBench, my benchmarking suite, specifically to stop myself:

- **No warmup.** The first CUDA call pays for context setup and kernel compilation. Time it and you're measuring initialization, not compute. Warm up for dozens of iterations, then measure.
- **No synchronization.** CUDA launches are asynchronous. Timing a launch without `cudaDeviceSynchronize` measures how fast the CPU can ask for work, which is a very impressive number that means nothing.
- **One run, no variance.** GPU clocks move with temperature. TensorBench runs everything repeatedly and reports confidence intervals, because a single number without spread is a mood, not a measurement.

Every number below survived those three rules.

![The headline numbers: close on big matmuls, honest gap on small ones, and the VRAM win.](/images/FastNNBench.webp)

## Where I get close to PyTorch

Large dense matmuls. This sounds like a win until you know the secret: for big GEMMs, everybody, including me, calls cuBLAS, because NVIDIA's own kernels are effectively unbeatable by mortals. With TF32 tensor cores enabled on Ampere and later, my matmul path sits close enough to PyTorch that the difference is scheduling overhead and my thinner dispatch layer. A framework that stays out of cuBLAS's way inherits most of its speed for free.

The memory result is the part I'm actually proud of. PyTorch is generous with workspace allocations and its caching allocator holds memory optimistically. FastNN's RAII approach frees exactly when tensors die and preallocates exactly what the graph needs. Same models, roughly 40% less VRAM. On a consumer GPU that's the difference between a batch size that trains and an OOM at 3am.

## Where PyTorch quietly destroys me

Everything fused. A chain like bias add, GELU, dropout is three separate kernel launches in naive FastNN, three round trips through global memory. PyTorch's compiled paths fuse them into one kernel. On memory-bound layer stacks that's not a 15% gap, it's 2x or worse, in their favor. I've hand-fused my most common sequences, but they have compiler infrastructure and a decade of engineers; I have evenings.

Also convolutions with weird shapes. cuDNN carries a lookup of algorithms per shape and picks the winner. My conv2d has a handful of code paths chosen by rules I wrote after a weekend of profiling. On common shapes I'm respectable. On odd strides and tiny channels, cuDNN laughs at me.

## What I actually learned

The big frameworks are not slow, and anyone selling you "10x faster than PyTorch" is benchmarking wrong, usually via one of the three sins above. What the big frameworks are is general, and generality has a memory bill and a dispatch bill. If you control your architecture, a specialized stack claws back real VRAM and real predictability.

But the deepest lesson: writing the framework taught me more about why PyTorch makes its choices than five years of using it did. Every "why is this API like this" now has an answer, and the answer is usually a wall I also hit, two weeks later, at higher speed. The code is on my GitHub if you want to check my homework.
