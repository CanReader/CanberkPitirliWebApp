---
title: "Pixels, Framebuffers and Scanout: Where a Frame Actually Lives"
date: "2026-10-03"
category: "Graphics"
tags: ["GPU", "Foundations", "Rendering"]
excerpt: "Before shaders, before triangles, there's a block of memory and a display controller reading it 60 times a second. That relationship explains tearing, vsync and most of what a swap chain is for."
visible: false
---

Every graphics tutorial starts with a triangle. I want to start one step earlier, because the triangle has to end up somewhere, and that somewhere explains a surprising amount of what you'll fight with later: tearing, vsync, input lag, and why every API makes you deal with something called a swap chain.

## A frame is just memory

A framebuffer is a block of GPU memory laid out as a 2D grid of pixels. Nothing more magical than that. At 1920x1080 with 4 bytes per pixel (red, green, blue, alpha, 8 bits each) that's 2,073,600 pixels times 4 bytes, so 8,294,400 bytes. About 8 MB for one frame.

Each pixel is a number with a format. The common one is 8 bits per channel, unsigned, normalized: the byte 0 means 0.0 and 255 means 1.0. Your shader writes floats, the hardware converts them into whatever format the target uses. Some targets store 16-bit floats per channel instead, which matters a lot once we get to HDR. And the channel order isn't always RGBA. Plenty of displays want BGRA, which is why you'll see both formats offered for the final image in every API.

The point to hold on to: rendering is writing numbers into this grid. Everything else in the pipeline exists to decide which numbers.

## Scanout: the part nobody tells you about

Something has to get those numbers onto the screen. That's the display controller, a fixed-function part of the GPU that does one job: read the framebuffer, row by row, top to bottom, and stream it out over the cable at the monitor's refresh rate.

At 60 Hz it does this every 16.67 ms. At 144 Hz every 6.94 ms. It doesn't care what your program is doing. It just reads whatever memory it's pointed at, on schedule, forever.

Between two refreshes there's a short gap called the vertical blank, when the controller has finished the last row and hasn't started the next frame yet. Keep that gap in mind, it's the whole trick behind vsync.

## Why you can't draw into the buffer being displayed

Imagine rendering directly into the framebuffer the display controller is reading. Halfway through your frame, the controller reaches the middle of the screen. The top half it already sent shows your new frame, the bottom half shows the old one, and if anything moved between them you see a horizontal break. That's tearing.

So nobody renders into the visible buffer. You use at least two:

- the **front buffer**, which the display controller is reading
- the **back buffer**, which you're drawing into

When the frame is done you swap them. Swapping doesn't copy 8 MB, it just changes which address the display controller reads from. A pointer flip.

That pair (or set, there can be three) is what the APIs call a swap chain. Different names, same idea: a small ring of framebuffers you rotate through.

## Vsync is just "flip during the gap"

Double buffering alone doesn't fix tearing. If you flip the pointer while the controller is in the middle of the screen, the rows above came from one buffer and the rows below from the other. Same tear, different cause.

Vsync means waiting for the vertical blank before flipping. The flip happens in the gap, the next refresh reads one whole consistent frame, no tear.

The cost is waiting. If your frame takes 17 ms on a 60 Hz display, you just missed the gap, and with plain double buffering you sit idle until the next one. Your 17 ms frame effectively costs 33.3 ms, and the frame rate drops from 60 straight to 30. That cliff is the classic vsync complaint, and it's why the 16.6 ms budget feels like a religion to game developers.

The workarounds you'll meet:

- **Triple buffering**: a third buffer so the GPU can keep drawing while one finished frame waits for the gap. Fewer stalls, slightly more latency.
- **Mailbox / fast-sync style presentation**: keep rendering, and at each vertical blank show the newest finished frame, throwing the stale ones away. Low latency, no tearing, but you burn work on frames nobody sees.
- **Variable refresh rate** (G-Sync, FreeSync, VRR in general): the monitor waits for you instead of you waiting for the monitor. The refresh happens when your frame is ready, within a range. This is the real fix and why it's everywhere now.

## What this means when you write a renderer

Three things carry forward from here into everything else in this series:

1. **The frame budget is real.** Refresh rate sets a deadline. 60 Hz gives you 16.67 ms, 120 Hz gives you 8.33 ms, and missing it isn't a small penalty, it can be a whole extra refresh.
2. **Presenting is a handoff, not a draw.** When you call your API's present function, you're not drawing anything. You're queueing "flip to this buffer when it's ready", and the presentation mode decides when that flip actually happens.
3. **Formats matter from the very first pixel.** The format of that back buffer, 8-bit or 16-bit float, linear or sRGB, decides how your colors look. We'll spend a whole section on it, because it's the single most common thing beginners get wrong.

Next we'll go backwards from the framebuffer to where the work starts: what actually happens on the CPU side when you issue a draw call.
