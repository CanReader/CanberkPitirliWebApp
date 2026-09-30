---
title: "ViewCam Devlog: Chasing Milliseconds from Phone Camera to Zoom"
date: "2026-08-10"
category: "Performance"
tags: ["ViewCam", "C++", "Kotlin"]
excerpt: "A virtual webcam that lags is worse than no webcam at all. Here's the latency budget of ViewCam's pipeline, where the milliseconds actually hide, and the embarrassingly analog way I measure them."
---

ViewCam turns your phone into a wireless webcam, microphone, and speaker for your PC. The whole product lives or dies on one number: how long a frame takes to travel from the phone's camera sensor to the video call on your monitor. Get that under roughly 150 milliseconds and nobody notices anything. Miss it and your lips move like a badly dubbed movie.

This post is the actual pipeline and where the time goes.

![The ViewCam pipeline](/images/ViewCam2.webp)

## The budget

A frame passes through five stages, and every one of them wants a piece of your latency budget:

- **Capture.** CameraX hands you frames on Android. You don't control the sensor timing; at 30fps you already ate up to 33ms just waiting for the next frame to exist.
- **Encode.** Hardware H.264 via MediaCodec. Fast, but only if you use it asynchronously and never, ever wait on it. The synchronous API is a latency trap with friendly documentation.
- **Network.** Local Wi-Fi is quick but moody. The transit itself is a few milliseconds; the variance is what kills you.
- **Decode.** FFmpeg on the desktop side, in C++. Cheap for 1080p on any modern machine, single digit milliseconds.
- **Handoff.** The decoded frame goes into the virtual camera device, DirectShow on Windows and v4l2loopback on Linux, and then the video app consumes it on its own schedule, which you do not control and which will hurt you.

Notice that the two biggest items, capture cadence and consumer timing, are the two you can't optimize. Welcome to latency work: most of your budget is spent by other people.

## Buffering, the seductive enemy

Every buffering decision is the same trade: smoothness now, latency forever. A jitter buffer of three frames makes shaky Wi-Fi look silky and adds 100ms at 30fps. That is your entire budget spent on insurance.

ViewCam's rule is aggressive: buffer as close to zero as survivable, and when the network hiccups, drop frames instead of queueing them. A dropped frame is invisible, a growing queue is lag that compounds. The corollary rule matters even more: when frames arrive late and a queue forms anyway, skip to the newest frame. Real time beats complete. Nobody on a call has ever complained that they missed frame 4571.

## Measuring glass to glass

You cannot trust internal timestamps, because they conveniently omit everything outside your process, which includes the phone's camera stack and the video app's own rendering. So I measure the honest way: put a millisecond stopwatch on a screen, point the phone at it, join a call, and photograph both screens together. The difference between the two clocks in one photo is the true glass to glass number. It is analog, slightly ridiculous, and it does not lie.

If you're building anything real time, build this measurement first, before optimizing anything. My internal numbers said one thing; the stopwatch said 60ms more. The missing time lived in places no profiler I had could see.

## The part nobody warned me about

Reconnection is a latency feature. When Wi-Fi drops for two seconds and comes back, the amateur version dutifully delivers two seconds of stale frames before showing you the present. The correct behavior is brutal: throw away everything, resynchronize on the newest keyframe, act like the past never happened. Users experience a brief freeze and then normality. The alternative is a call where you're permanently two seconds in the past like a badly configured time traveler.

Since launch, most of my update time has gone into exactly these unglamorous edges: reconnects, frame pacing, encoder quality settings. It turns out shipping the pipeline is the easy part. Making it boring and reliable is the product. ViewCam is at viewcam.tech if you want to see how boring and reliable feels in practice.
