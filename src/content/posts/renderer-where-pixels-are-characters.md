---
title: "I Built a 3D Renderer Where Every Pixel Is a Character"
date: "2026-08-14"
category: "Graphics"
tags: ["Rust", "Rendering", "Web"]
excerpt: "ASCIIRenderer is a full 3D pipeline, perspective projection, z-buffer, Blinn-Phong lighting, that refuses to output pixels. It outputs characters, in color, to your browser, at 30 frames per second. Building it taught me more about GPUs than the GPU ever did."
---

Every graphics programmer eventually asks a cursed question. Mine was: what is the worst possible display device I could target with a real 3D pipeline?

The answer is text. So I built ASCIIRenderer, a from-scratch software rasterizer in Rust where the framebuffer is a grid of characters. Perspective projection, z-buffering, Blinn-Phong shading, model loading for OBJ, glTF, and FBX, all of it fully real, and then at the very last step, instead of writing pixels, it picks letters. The frames stream over WebSocket to a browser at 30+ fps.

![The same scene, rendered normally and rendered as text. Both outputs are real.](/images/AsciiRenderPipeline.webp)

## The pipeline doesn't care what a pixel is

Here's the insight that makes the whole project click: a renderer is a machine for answering two questions per screen cell. What surface is visible here, and how much light does it receive? Nothing in that machine knows or cares that the answer will be displayed as a pixel.

So the pipeline is completely ordinary. Vertices get transformed by a model-view-projection matrix. Triangles get clipped and rasterized. A z-buffer resolves visibility, one depth value per cell, exactly like the hardware version. Blinn-Phong computes brightness from normals, light direction, and the half vector. Up to this point, ASCIIRenderer is just a tiny GPU implemented on the CPU.

The only exotic part is the last centimeter: the shading result maps into a character ramp.

```rust
const RAMP: &[u8] = b" .:-=+*#%@";

fn shade_to_glyph(luminance: f32) -> u8 {
    let idx = (luminance * (RAMP.len() - 1) as f32) as usize;
    RAMP[idx.min(RAMP.len() - 1)]
}
```

That ramp is doing something graphics people will recognize immediately: it's quantization. Ten glyphs means ten brightness levels, a 3.3-bit framebuffer. A space is black, an at-sign is white, and everything between is chosen by how much ink each character puts on screen. It is the same idea as ordered dithering on a 1-bit display, except my dither pattern went to school and learned the alphabet.

Color rides on top: each character keeps the RGB of the surface it represents and gets drawn tinted on a Canvas. Brightness lives in the glyph, hue lives in the fill color. Two channels of information per cell, carried by completely different mechanisms.

## The display was never the bottleneck

The part that surprised people most: 30fps of animated ASCII is not remotely hard for the renderer. A 200 by 80 character screen is 16,000 cells. My laptop rasterizes that faster than the browser can blink. The actual engineering was everywhere else.

Streaming was the first lesson. Sixteen thousand colored cells per frame, thirty times a second, adds up, so frames get packed into a compact binary format before hitting the WebSocket. The second lesson was rendering the text on the other end: the DOM died instantly (sixteen thousand spans, thirty times a second, is a crime against the layout engine), so it draws to a Canvas like every sane real-time thing on the web eventually does.

If you've ever wondered why game streaming services obsess over encoders, congratulations, I now understand it in miniature. The renderer was free. Moving the picture was the product.

## Why bother

Because a software rasterizer is the single best graphics education that exists, and making the output absurd keeps you honest. When your framebuffer is text, there's no driver to blame and no shader compiler to hide behind. Perspective-correct interpolation is your bug. The z-fighting is your bug. Every wrong-looking frame is a question with exactly one culprit.

GPU APIs abstract the pipeline so well that you can ship games for years without ever knowing what a rasterizer actually does. Then you write one, and suddenly Vulkan's weird ceremony looks less like bureaucracy and more like an honest description of the machine you've been ignoring.

The repo is on my GitHub. Fair warning: after staring at it for a while, regular pixels start to feel like they have no personality.
