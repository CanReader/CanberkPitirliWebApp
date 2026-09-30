---
title: "The Rendering Equation, From Scary Integral to HLSL"
date: "2026-08-11"
category: "Graphics"
tags: ["HLSL", "PBR", "Math", "Tutorials"]
excerpt: "Every PBR shader you've ever written is one integral wearing a trench coat. Here's the rendering equation term by term, the Cook-Torrance BRDF that lives inside it, and the exact HLSL each symbol turns into."
---

Every semester, the same thing happens in my DirectX course. We get to physically based rendering, I put one equation on the screen, and I watch people who write template metaprogramming for fun quietly close their laptops. So this post does the thing I do in class: walk through the math slowly, then show that the terrifying integral compiles down to about fifteen lines of HLSL you have probably already written without knowing it.

## The one equation that runs the entire industry

Everything in rendering, rasterized, raytraced, realtime or offline, is an attempt to solve this:

$$
L_o(\mathbf{x}, \omega_o) = L_e(\mathbf{x}, \omega_o) + \int_{\Omega} f_r(\mathbf{x}, \omega_i, \omega_o)\, L_i(\mathbf{x}, \omega_i)\,(\omega_i \cdot \mathbf{n})\, d\omega_i
$$

Kajiya wrote this down in 1986 and rendering has been footnotes ever since. Read it as a sentence, not as symbols: the light leaving point $\mathbf{x}$ toward your eye ($L_o$) is whatever the surface emits itself ($L_e$), plus every bit of light arriving from every direction on the hemisphere ($\Omega$), where each arriving direction $\omega_i$ contributes its incoming light $L_i$, scaled by how much this surface reflects light from that direction toward you ($f_r$, the BRDF), and dimmed by the angle it lands at ($\omega_i \cdot \mathbf{n}$, plain Lambert cosine).

That's it. The whole equation is "add up all the light, weighted by the material." The reason it's hard is one word: the integral is over infinitely many directions, and $L_i$ itself depends on every other surface in the scene solving the same equation. It's recursive. Offline path tracers spend minutes per frame sampling their way through that recursion.

## The realtime cheat

Realtime rendering makes one brutal simplification: light only arrives from your $N$ analytic lights, and the rest of the hemisphere contributes nothing (until we sneak it back in later). An integral over a hemisphere of mostly-zero becomes a sum:

$$
L_o \approx L_e + \sum_{k=1}^{N} f_r(\omega_k, \omega_o)\, L_k\,(\omega_k \cdot \mathbf{n})
$$

And a sum over lights is just a for loop. Congratulations: that for loop over your point lights you wrote in your first shader was a numerical approximation of an infinite-dimensional integral. You were doing calculus. Nobody told you.

## The BRDF: where the material lives

All the personality of a surface, metal versus plastic, rough versus polished, hides in $f_r$. The industry standard is Cook-Torrance with a Lambertian diffuse term:

$$
f_r = k_d\, \frac{c_{\text{albedo}}}{\pi} \; + \; \frac{D(h)\, F(\omega_o, h)\, G(\omega_i, \omega_o)}{4\,(\omega_o \cdot \mathbf{n})(\omega_i \cdot \mathbf{n})}
$$

The left term is diffuse: albedo divided by $\pi$, and if you've ever wondered why the $\pi$ is there, it's energy conservation, integrating the cosine over the hemisphere produces exactly $\pi$, so we divide it back out. The right term is the specular microfacet model, built from three functions with day jobs. All three work on the half vector $h = \frac{\omega_i + \omega_o}{\|\omega_i + \omega_o\|}$, the direction a perfect mirror would need to face to bounce this light into your eye.

**D, the normal distribution function**, answers: what fraction of the microscopic surface actually faces along $h$? GGX is the modern answer:

$$
D_{GGX}(h) = \frac{\alpha^2}{\pi\left((\mathbf{n} \cdot h)^2(\alpha^2 - 1) + 1\right)^2}
$$

where $\alpha$ is roughness squared. This one function is the shape of your highlight:

![The same formula, three roughness values, evaluated for real](/images/GGXDistribution.webp)

Low roughness piles all the microfacets into a tight spike, a small blinding highlight. High roughness spreads the same total energy across a wide dim lobe. The area under those curves is conserved; the shape is the material.

**F, the Fresnel term**, answers: how mirror-like does this surface get at grazing angles? Everything becomes a mirror at the horizon, look down a wet road at sunset. Schlick's approximation is unreasonably good for one line of math:

$$
F(\omega_o, h) = F_0 + (1 - F_0)\left(1 - (h \cdot \omega_o)\right)^5
$$

$F_0$ is the reflectance looking straight on: about 0.04 for basically every dielectric, and the actual surface color for metals. That single number is most of what "metalness" means.

**G, the geometry term**, answers: how much of the microsurface is shadowing or masking itself? Rough surfaces self-occlude. The Smith form with Schlick-GGX:

$$
G(\omega_i, \omega_o) = G_1(\omega_i)\, G_1(\omega_o), \qquad G_1(\omega) = \frac{\mathbf{n} \cdot \omega}{(\mathbf{n} \cdot \omega)(1 - k) + k}, \qquad k = \frac{(\alpha + 1)^2}{8}
$$

## The part where the integral becomes shader code

Here is the entire equation stack, symbol by symbol, as it ships:

```hlsl
float3 CookTorrance(float3 N, float3 V, float3 L,
                    float3 albedo, float roughness, float metallic)
{
    float3 H = normalize(V + L);
    float NdotL = saturate(dot(N, L));   // the Lambert cosine from the integral
    float NdotV = saturate(dot(N, V));
    float NdotH = saturate(dot(N, H));

    // D: GGX normal distribution
    float a  = roughness * roughness;
    float a2 = a * a;
    float dDenom = NdotH * NdotH * (a2 - 1.0) + 1.0;
    float D = a2 / (PI * dDenom * dDenom);

    // F: Schlick fresnel
    float3 F0 = lerp(0.04.xxx, albedo, metallic);
    float3 F  = F0 + (1.0 - F0) * pow(1.0 - saturate(dot(H, V)), 5.0);

    // G: Smith, Schlick-GGX
    float k  = (roughness + 1.0) * (roughness + 1.0) / 8.0;
    float g1 = NdotV / (NdotV * (1.0 - k) + k);
    float g2 = NdotL / (NdotL * (1.0 - k) + k);
    float G  = g1 * g2;

    float3 specular = (D * F * G) / max(4.0 * NdotV * NdotL, 1e-4);
    float3 kd = (1.0 - F) * (1.0 - metallic);   // energy conservation
    return (kd * albedo / PI + specular) * NdotL;
}
```

Multiply by the light's color and sum over your lights: that's the sum from earlier, which was the integral from earlier. Note the two places conservation shows up in code: the `1e-4` clamp keeping the specular denominator from exploding at grazing angles, and `kd` shrinking the diffuse term by whatever Fresnel already claimed, because a photon reflected specularly is not available to be reflected diffusely. Skip that line and your materials glow with free energy, which artists will describe as "looks kind of wrong" and physics would describe as a crime.

## The integral always comes back

One loose end: we threw away the rest of the hemisphere, and the rest of the hemisphere is why realtime scenes used to look like plastic in a cave. Image-based lighting sneaks it back in: environment maps get prefiltered offline by, and I want you to act surprised, evaluating that same integral per roughness level and caching the results in mip levels. The split-sum approximation your engine uses for reflections is the rendering equation again, factored into two precomputable pieces.

So no, you never escape the integral. You just keep meeting it in better disguises. Learn to recognize it once and every rendering technique for the rest of your career becomes "ah, it's you again."
