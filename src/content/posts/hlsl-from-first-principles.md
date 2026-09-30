---
title: "HLSL From First Principles: What Shaders Actually Do"
date: "2025-01-30"
category: "Graphics"
tags: ["HLSL", "DirectX 11", "Tutorials"]
excerpt: "Most HLSL tutorials hand you a working triangle and call it done. This one explains the SIMT hardware: why branches aren't free, and what a shader runs on."
---

Most HLSL tutorials hand you a vertex shader, hand you a pixel shader, hand you a working triangle, and call it done. You get a result. You don't get an understanding.

This is the explanation I wish I'd had before I learned HLSL. It's not a tutorial in the "type this in" sense. It's the mental model of what a shader is, what it runs on, and what your code is actually doing.

## The Hardware You're Programming

A modern GPU is not a CPU with extra cores. The execution model is fundamentally different and you cannot write good shaders without understanding this.

When you draw a triangle, the GPU breaks it into pixels and runs your pixel shader on every one of them in parallel. Not "in parallel" in the loose CPU sense where threads might run at different times. In parallel in the sense that 32 or 64 pixel shader invocations execute the same instruction on the same clock cycle, on different data.

This is called SIMT (Single Instruction, Multiple Threads) and it has consequences you need to internalize. The most important one: branches in your shader are not free. If half your threads take one path and half take the other, both paths execute on all threads, with the results masked. A divergent branch costs you the sum of both branches, not the slower of them.

This is why "if (something)" in shader code can be much more expensive than it looks.

## What a Vertex Shader Actually Is

A vertex shader is a function that runs once per vertex. It reads attributes (position, normal, uv) from a buffer, transforms them somehow, and writes output that gets interpolated across the triangle's pixels.

```hlsl
struct VSInput {
    float3 position : POSITION;
    float3 normal   : NORMAL;
    float2 uv       : TEXCOORD0;
};

struct VSOutput {
    float4 svPos    : SV_Position;
    float3 worldPos : POSITION;
    float3 normal   : NORMAL;
    float2 uv       : TEXCOORD0;
};

cbuffer FrameData : register(b0) {
    float4x4 worldMat;
    float4x4 viewProjMat;
};

VSOutput VS(VSInput input) {
    VSOutput o;
    float4 worldPos = mul(float4(input.position, 1.0), worldMat);
    o.svPos    = mul(worldPos, viewProjMat);
    o.worldPos = worldPos.xyz;
    o.normal   = mul(float4(input.normal, 0.0), worldMat).xyz;
    o.uv       = input.uv;
    return o;
}
```

Every output marked SV_Position is the position in clip space, which the rasterizer needs to figure out where to put the triangle on screen. Every other output is interpolated across the triangle when the pixel shader runs. The interpolation is hardware, automatic, and free.

Most of what beginners struggle with in vertex shaders is matrix math. The trick is to remember the transformation chain: model space, then world space, then view space, then clip space, then screen space. Each space is just the same data transformed by a different matrix. If your geometry is in the wrong place on screen, you've messed up one of those transforms.

## What a Pixel Shader Actually Is

A pixel shader runs once per pixel covered by your triangle. Its job is to compute a color (and optionally a depth) for that pixel.

```hlsl
Texture2D    diffuseTex : register(t0);
SamplerState linearSamp : register(s0);

cbuffer LightData : register(b0) {
    float3 lightDir;
    float3 lightColor;
};

float4 PS(VSOutput input) : SV_Target {
    float3 albedo = diffuseTex.Sample(linearSamp, input.uv).rgb;
    float3 N      = normalize(input.normal);
    float  NdotL  = saturate(dot(N, -lightDir));
    float3 lit    = albedo * lightColor * NdotL;
    return float4(lit, 1.0);
}
```

That's a textbook diffuse lighting shader. Sample the diffuse texture, compute Lambertian lighting from the light direction and the surface normal, multiply, return.

The thing nobody tells you up front: input.normal here is the interpolated normal from the vertex shader. After interpolation across a triangle, it's no longer unit length. That's why you call normalize. Forgetting this is a common bug that produces lighting that's almost right but subtly wrong.

The other thing: every pixel shader invocation does this work. If your triangle covers a million pixels, this shader runs a million times. If you have ten lights, you do this work ten times per pixel. That's why pixel shader optimization is the bulk of real-time rendering performance work.

## What Texture Sampling Actually Does

When you call diffuseTex.Sample(...), you're doing more than reading a texture. The hardware computes which mip level to read based on the screen-space derivative of the UV coordinates, samples four texels (for bilinear filtering), interpolates them, and hands you the result.

The mip selection requires looking at neighboring pixel shader threads to compute the UV gradient. This is why texture sampling cannot happen inside divergent branches without weirdness. The hardware needs all four threads in a 2x2 quad to be active and reading texture coordinates. If they're not, you get artifacts at the divergence boundary.

This is one of those details that's almost always glossed over in tutorials. The tutorial says "you can sample textures in shaders". Yes. With caveats that matter when you start writing real code.

## What a Constant Buffer Actually Is

A constant buffer is memory uploaded from the CPU that the shader reads. It's called "constant" because it doesn't change during a single draw call, not because it's globally constant.

```hlsl
cbuffer FrameData : register(b0) {
    float4x4 viewProj;
    float3   cameraPos;
    float    time;
};
```

The register(b0) is the slot number. On the C++ side, you bind your buffer to slot 0. The shader reads from slot 0. If you bind the wrong thing or skip a slot, the shader reads garbage and you get a visual bug that's often hard to track down.

Constant buffer layout has a 16-byte alignment rule that surprises everyone the first time. Members are packed into 16-byte vectors and a single member cannot straddle a vector boundary. If you have a float, then a float3, the float3 starts on the next 16-byte boundary, leaving 12 bytes of padding. Get the layout wrong on the C++ side and your shader sees the wrong data.

I've debugged this exact problem more times than I'd like.

## What's Missing From Most Tutorials

Tutorials usually skip the things you actually hit on day three of writing real shaders:

The hardware execution model and why it matters for branching.

How interpolation works between vertex and pixel shaders.

Why texture sampling has specific rules around divergence.

Constant buffer alignment quirks.

The relationship between draw calls, pipeline state, and shader compilation.

These aren't edge cases. They're the things that block you when you go from textbook examples to a real renderer. Understanding them upfront saves you weeks of "why doesn't this work and what is the GPU doing".

## The Practical Path

If you're starting with shaders today, write three things in order.

A solid color triangle, where the only thing happening is vertex transformation.

A textured quad with simple bilinear sampling.

A diffuse-lit cube with one light.

Each of those teaches a specific thing. The triangle teaches the transformation pipeline. The quad teaches texture sampling and UVs. The cube teaches lighting math and normal handling. After you've written those and you understand each line, the rest of HLSL is variations on the same patterns.

The goal of learning shaders is not to memorize the syntax. The goal is to understand what the GPU is doing on every line of code. Once you have that, the syntax is the easy part.
