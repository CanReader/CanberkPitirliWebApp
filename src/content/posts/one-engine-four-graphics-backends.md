---
title: "One Engine, Four Graphics Backends: What I'd Do Differently"
date: "2025-10-05"
category: "Graphics"
tags: ["Engine Dev", "C++", "Vulkan"]
excerpt: "SleakEngine runs DirectX 11, DirectX 12, Vulkan, and OpenGL behind one abstraction layer. Building that taught me exactly why nobody should build that. A postmortem in advance."
---

SleakEngine, my from scratch C++23 engine, renders through four backends: DirectX 11, DirectX 12, Vulkan, and OpenGL, all behind a single RHI, one rendering interface the rest of the engine talks to. It works. A real voxel game runs on it. And if I started over tomorrow, I would not build it this way. This is the postmortem I'm writing before the project is dead, which feels efficient.

![What one innocent Draw call costs on each backend](/images/RHIBackends.webp)

## Why four backends is a trap with great marketing

On paper it's beautiful: write the renderer once, run anywhere, learn every API deeply. The last part came true, and I recommend it as an education. The first part is where the trap lives, because these four APIs disagree about the fundamental shape of the world.

DX11 and OpenGL are state machines: bind things, draw, the driver does heroic work behind your back. DX12 and Vulkan are explicit: you build pipeline state objects up front, record command buffers, manage descriptor memory, and schedule synchronization yourself, because the driver has resigned from hero duty.

An abstraction over all four must pick a personality, and every choice betrays someone. Mine looked like DX11, because that's what I knew best when I started. The DX11 and GL backends were thin and happy. The DX12 and Vulkan backends became emulators, reconstructing pipelines and barriers at runtime from state-machine-style calls, caching PSOs behind the API's back, guessing synchronization conservatively. Conservative barriers are correct and slow, which means my most modern backends ran with the least modern performance. The abstraction didn't hide complexity. It relocated it into the two places least able to afford it.

## The costs nobody prices in

Shaders multiply. One RHI means one shader story across HLSL and GLSL dialects, so you either write everything twice or build a cross compilation pipeline. I did the pipeline, HLSL through SPIR-V and back out. It works and it is its own small project with its own bug tracker in my heart.

Testing multiplies harder. Four backends times features times GPU vendors is a matrix you cannot actually cover alone. My honest confidence was always: two backends well tested, two backends probably fine. "Probably fine" is engine speak for "broken on AMD".

And the feature floor sinks to the weakest API. Bindless resources, mesh shaders, modern synchronization: available in Vulkan and DX12, and unusable in the common interface, because the interface must also be implementable on the APIs from 2009. The lowest common denominator isn't a compromise, it's a ceiling.

## What I'd actually do now

Two backends, not four. Vulkan and DX12 only, and design the RHI in their image: explicit pipelines, explicit barriers as first class citizens, descriptor sets as the native binding model. Old APIs emulate the modern shape far more gracefully than modern APIs emulate the old one, and if I truly needed a legacy path later, that's the direction to bridge.

A render graph from day one. Declare passes and their resource dependencies, and let the graph derive barriers, layouts, and transient memory. Synchronization stops being a thousand hand-placed decisions and becomes one algorithm. Every hour I spent hand-debugging a missing Vulkan barrier was an hour arguing for this, and it took me too long to listen.

And honestly: for anyone whose goal is shipping a game rather than learning APIs, one backend. Vulkan plus one good compatibility layer, or just DX12 on PC. The multi-backend engine is a graduate program disguised as an architecture decision. I'm glad I attended. I graduated with opinions and I'm never enrolling again.
