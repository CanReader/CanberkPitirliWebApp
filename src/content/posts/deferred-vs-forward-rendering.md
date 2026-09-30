---
title: "Forward vs Deferred Rendering: What Actually Decides It"
date: "2026-01-11"
category: "Graphics"
tags: ["Rendering", "DirectX 11"]
excerpt: "I've shipped both, including a VR title where MSAA made the call before I touched a profiler. Not a rule of thumb: it's G-Buffer bandwidth versus overdraw."
---

Deferred versus forward is the first real architecture decision in any renderer, and it gets discussed like a religious war when it's actually one accounting question: when do you pay for lighting, and what do you multiply it by? I've implemented both, I teach both in my DirectX 11 course, and here's the version of this discussion that fits in one honest post.

## Forward: shade while you draw

Forward rendering is the obvious approach. For every object, run the vertex shader, and in the pixel shader compute the final color right there, looping over the lights that affect it. Cost scales with objects times lights, and pixels behind other pixels can pay full lighting cost for the privilege of being overwritten a millisecond later. Overdraw plus many lights is where forward goes to die.

But forward keeps three superpowers everyone forgets while dunking on it. Hardware MSAA just works, which is why VR titles love it. Transparency just works, because there's a real blend into a real framebuffer. And every material can use a completely different shading model, because nothing forces your surface data through a shared format.

## Deferred: shade once you know what's visible

Deferred splits the frame in two. First pass, draw all geometry but compute no lighting; instead write surface properties, albedo, normal, roughness, depth, into a set of screen-sized textures called the G-Buffer. Second pass, walk the screen once and light only what actually survived the depth test.

![A G-Buffer, laid open: albedo, normals, depth, and the lighting pass that combines them.](/images/GBufferBreakdown.webp) Lighting cost stops caring about scene complexity entirely: it's pixels times lights, and with light volumes it's not even all pixels per light.

That's the whole trick, and it's a great trick. A thousand torches in a night scene stops being a joke budget item. Every serious dynamic-light-heavy game of the last fifteen years leaned on some version of this.

The bill arrives in bandwidth. A fat G-Buffer at 4K is a lot of gigabytes per second of writing and re-reading, and mobile GPUs in particular respond to that the way you'd respond to a rent increase. MSAA becomes somewhere between painful and fictional, so you buy TAA and its smearing artifacts instead. Transparency doesn't fit at all, which is why every deferred renderer contains a small guilty forward renderer for glass and particles. And all materials must squeeze through the same G-Buffer channels, so exotic shading models cost encoding gymnastics.

## The actual decision procedure

Forget the discourse and ask three questions about your content.

How many dynamic lights genuinely matter per frame? A handful: forward is simpler and faster. Dozens to hundreds: deferred, or at least clustered forward.

Do you need MSAA? VR says yes, in which case forward, full stop, this is why UE's VR template ships a forward renderer. Flat screen with TAA acceptable: deferred stays on the table.

How wild are your materials? Stylized projects with a rainbow of custom shading models fight the G-Buffer forever. Physically based and uniform: the G-Buffer fits like it was made for you, because it was.

## The modern footnote

Forward+ and clustered forward split the screen into tiles or 3D clusters, build per-cluster light lists in a compute pass, and then shade forward style but looping only over each pixel's relevant lights. You keep MSAA, transparency, and material freedom, and you scale to many lights. It costs implementation complexity, but it's telling that a lot of new engines start there: the old binary has become a spectrum, and the right answer for a new renderer in 2026 is usually somewhere in the middle of it.

If you want the from scratch version of both pipelines with real HLSL, that's several hours of my DirectX 11 course, but the mental model above is the part that transfers to every engine you'll ever touch.
