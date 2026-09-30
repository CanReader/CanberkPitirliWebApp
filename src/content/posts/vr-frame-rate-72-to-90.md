---
title: "How I Optimized a VR Frame Rate from 72fps to Stable 90"
date: "2025-02-15"
category: "Performance"
tags: ["VR", "Graphics", "Unreal Engine"]
excerpt: "In a flat game, dropping from 90fps to 70fps for a few frames is a minor visual hiccup. In VR, the same drop will make someone reach for a trash can. Here's how we closed that gap on The Stranger."
---

In a flat game, dropping from 90fps to 70fps for a few frames is a minor visual hiccup. Most players won't even notice. In VR, the same drop will make someone reach for a trash can.

This is the story of how I dragged The Stranger from 72fps to a stable 90, what actually moved the needle, and what I wasted a week on that didn't.

## The Setting

The Stranger is a VR experience we built at Reality Arts Studio. It later won Best Game at the WN Unreal European Developer Contest. Before that, it had a problem: on the recommended hardware spec it was running at 72fps with regular dips into the 60s. For a flat game that's fine. For a VR title that's unshippable.

We had two months. Performance was the entire job.

## What I Tried First (Wrong Move)

The instinct most engineers have when a game is slow is to look at the hottest function in the profiler and start optimizing it. I did this. I spent four days rewriting a particle update system in pure C++ instead of Blueprint, shaving roughly 0.4ms off our frame time.

We needed to find about 5ms. I'd just spent four days for less than 10% of the gap.

Lesson: when you're way off a perf target, bottleneck-by-bottleneck optimization is a losing strategy. You need to find the thing that's wasting frames in bulk, not the thing that's slightly inefficient.

## What Actually Moved the Needle

Three things gave us almost all the win.

**Custom occlusion culling.** Unreal's default occlusion system is good but conservative. It's designed to never produce a popping artifact, which means it draws things that are technically visible from one pixel that isn't fully occluded. In a forest scene with thousands of trees and rocks, that conservatism costs you. I wrote a per-frame visibility system using a smaller proxy mesh hierarchy that culled aggressively. Lost a few rare popping cases. Gained 2.8ms of GPU time.

**Aggressive LOD bias.** VR has a quirk: because the screen is split between two eyes, geometric detail beyond a certain distance is genuinely invisible. The engine doesn't know this. I built a custom LOD selector that ran the calculation against the per-eye projection, not the camera's full field of view. We dropped polygon counts in the distance significantly without a perceptible visual change.

**Shadow simplification.** This one hurt. Dynamic shadows at the visual quality our art team wanted were eating roughly 1.8ms. I cut them, replaced them with baked shadows on static geometry plus a simple contact shadow under the character. The art team initially fought me on it. We A/B tested it in a build. Nobody could tell which was which once the lighting was set up properly.

Total: about 4.6ms. That, plus the 0.4ms from the particles I'd already done, got us to a stable 90 with headroom for stress moments.

## What I Wasted Time On

A week on draw call batching that turned out to be irrelevant. The GPU wasn't bottlenecked on draw calls, it was bottlenecked on shader complexity and overdraw. Reducing draw calls from 800 to 600 saved us almost nothing.

Two days investigating whether to switch from forward to deferred rendering. We were on forward, which is the right call for VR because of MSAA support and the aliasing situation, but I had to actually rule out deferred to be sure.

## What I'd Do Differently

I'd have profiled with the per-eye render breakdown from day one. Unreal has tools for this and I didn't use them properly until week three. Most of my early optimization was based on flat-game intuition, not VR-specific data.

I'd also have started with the cuts the art team would hate, not the ones that were "safe". The shadow change was the highest impact and the one I deferred longest because I knew it would be a fight. Should have been first.

## The Lesson

VR perf is a different sport from flat-game perf. Most of the standard advice still applies, but the priorities reorder. Overdraw matters more. Shader complexity matters more. Draw call counts matter less because you're already paying for the doubled scene cost. Geometric LOD matters more because per-eye coverage is smaller than you think.

When the gap is large, look for the thing that's causing the entire renderer to do extra work, not the thing in the profiler that's slightly hot.
