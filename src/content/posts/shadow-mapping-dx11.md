---
title: "Shadow Mapping from Scratch in DirectX 11"
date: "2026-04-18"
category: "Graphics"
tags: ["DirectX 11", "HLSL", "Tutorials"]
excerpt: "Shadow mapping is one of those techniques that looks simple on paper and punishes you the moment you go off-script. Here's the full picture: depth bias, PCF, and the math that actually makes it work."
---

Shadow mapping is deceptively simple to describe: render the scene from the light's point of view, store depths, then compare in the main pass. In practice, it's one of the first places beginners hit a wall: acne, peter-panning, precision artifacts. The fixes aren't obvious unless you understand what's actually happening at the hardware level.

This is the writeup I wish I had when I first implemented shadows in my DX11 renderer.

## The Two-Pass Setup

The core idea: two render passes, one shadow map texture, one matrix.

**Pass 1: Shadow pass:** Render the scene from the light's perspective using an orthographic (directional light) or perspective (spot/point light) projection. Write only depth to a depth-stencil texture. No color output needed.

```hlsl
// Shadow pass vertex shader: transform to light space
float4 VS_Shadow(float3 pos : POSITION) : SV_Position
{
    return mul(float4(pos, 1.0), lightViewProj);
}
```

**Pass 2: Main pass:** For each fragment, transform its world position into light clip space, divide by w to get NDC, map to UV space, sample the shadow map, and compare depths.

```hlsl
float SampleShadow(float4 posLightSpace, Texture2D shadowMap, SamplerState ss)
{
    float3 proj = posLightSpace.xyz / posLightSpace.w;
    float2 uv   = proj.xy * 0.5 + 0.5;
    uv.y        = 1.0 - uv.y; // DX11: Y axis is flipped

    float shadowDepth = shadowMap.Sample(ss, uv).r;
    return (proj.z - 0.001 > shadowDepth) ? 0.0 : 1.0;
}
```

That 0.001 is the depth bias. Get it wrong and you get shadow acne. Too aggressive and geometry floats above its shadow (peter-panning).

## Shadow Acne and Depth Bias

Shadow acne happens because the depth stored in the shadow map is slightly imprecise compared to the depth computed in the main pass. The surface ends up shadowing itself.

The bias should be proportional to the angle between the surface normal and the light direction:

```hlsl
float bias = max(0.005 * (1.0 - dot(normal, lightDir)), 0.0005);
float shadow = (proj.z - bias > shadowDepth) ? 0.0 : 1.0;
```

DX11 also exposes hardware depth bias through the rasterizer state, applied during the shadow pass itself:

```cpp
D3D11_RASTERIZER_DESC rsd = {};
rsd.DepthBias            = 1000;
rsd.DepthBiasClamp       = 0.0f;
rsd.SlopeScaledDepthBias = 1.0f;
rsd.FillMode             = D3D11_FILL_SOLID;
rsd.CullMode             = D3D11_CULL_BACK;
device->CreateRasterizerState(&rsd, &shadowRasterState);
```

## PCF for Soft Edges

Hard shadows look bad. Percentage Closer Filtering (PCF) averages multiple shadow map samples around the lookup point to produce a soft penumbra. It's cheap and looks good.

```hlsl
float PCF(float4 posLS, Texture2D shadowMap, SamplerComparisonState cmpSampler)
{
    float3 proj = posLS.xyz / posLS.w;
    float2 uv   = proj.xy * 0.5 + 0.5;
    uv.y        = 1.0 - uv.y;
    float  d    = proj.z;

    float shadow = 0.0;
    float2 texelSize = 1.0 / float2(2048, 2048);

    [unroll] for (int x = -1; x <= 1; ++x)
    [unroll] for (int y = -1; y <= 1; ++y)
    {
        shadow += shadowMap.SampleCmpLevelZero(
            cmpSampler, uv + float2(x, y) * texelSize, d
        );
    }
    return shadow / 9.0;
}
```

SampleCmpLevelZero with a SamplerComparisonState (LESS_EQUAL) lets the hardware do the depth comparison and bilinear filter the result. You get 4 comparisons for the price of one sample.

## Resolution and Cascade Tradeoffs

A 1024x1024 shadow map covers the entire scene with one texel per ~5cm at typical ranges. A 4096x4096 map costs 64MB of VRAM. For production you want Cascaded Shadow Maps (CSM): 3-4 shadow maps covering exponentially larger fractions of the view frustum. Near cascade is small and high-res; far cascade is large and low-res. The transition is hidden by blending.

That's a longer topic, but the foundation above is what every cascade builds on.
