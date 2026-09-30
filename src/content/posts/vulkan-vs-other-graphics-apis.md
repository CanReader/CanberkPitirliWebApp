---
title: "What Makes Vulkan Different from Every Other Graphics API"
date: "2025-07-22"
category: "Graphics"
tags: ["Vulkan", "DirectX 11"]
excerpt: "The first Vulkan hello triangle example I read was 700 lines. OpenGL's is 50. That gap isn't bloat. It's everything the driver was hiding from you."
---

The first Vulkan hello triangle I found was 700 lines of code. OpenGL's is 50. That gap is not bloat, not academic overengineering, not a committee making things complicated for fun. Every one of those lines is explicit control over something the OpenGL driver was handling for you, through heuristics you had no visibility into. Whether you need that control depends on what you're building.

## What OpenGL Was Actually Doing

OpenGL is a state machine designed in the early 1990s. You bind things, set state, draw. The driver handles memory allocation, decides when to synchronize the CPU and GPU, compiles shader variants on demand, and manages resource lifetimes based on patterns it recognizes.

The problem is the driver has to be conservative. It doesn't know if you'll modify a buffer before the GPU finishes reading it, so it stalls. It doesn't know which pipeline state combinations you'll hit, so it compiles them lazily and you get stutters the first time a new combination appears. It doesn't know your memory access patterns, so it places resources in heap types that might not match your workload.

The driver is doing its best. But it can't make better decisions than you, because it doesn't have your application's context. Vulkan gives that context back.

## The Explicit Model

In Vulkan you create resources with explicit usage flags, allocate memory from specific heap types, manage layout transitions, and record command buffers yourself.

```cpp
VkBufferCreateInfo bufInfo{};
bufInfo.sType       = VK_STRUCTURE_TYPE_BUFFER_CREATE_INFO;
bufInfo.size        = sizeof(vertices);
bufInfo.usage       = VK_BUFFER_USAGE_VERTEX_BUFFER_BIT | VK_BUFFER_USAGE_TRANSFER_DST_BIT;
bufInfo.sharingMode = VK_SHARING_MODE_EXCLUSIVE;

vkCreateBuffer(device, &bufInfo, nullptr, &vertexBuffer);

VkMemoryRequirements memReqs;
vkGetBufferMemoryRequirements(device, vertexBuffer, &memReqs);

VkMemoryAllocateInfo allocInfo{};
allocInfo.sType           = VK_STRUCTURE_TYPE_MEMORY_ALLOCATE_INFO;
allocInfo.allocationSize  = memReqs.size;
allocInfo.memoryTypeIndex = findMemoryType(memReqs.memoryTypeBits, VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT);

vkAllocateMemory(device, &allocInfo, nullptr, &vertexBufferMemory);
vkBindBufferMemory(device, vertexBuffer, vertexBufferMemory, 0);
```

In OpenGL that was glBufferData. In Vulkan it's 20 lines. But now you chose the heap type, you know exactly where in GPU memory this lives, and you can reuse that allocation block for other resources. The driver is not guessing.

## How DX11 Compares

I've written a lot of DX11 code and I teach it on Udemy. It sits between OpenGL and Vulkan on the explicitness spectrum in a way that works well for most projects.

DX11 replaced OpenGL's state machine with a cleaner object model. You create typed resource objects, bind them through context slots, and the driver handles synchronization. It's more predictable than OpenGL because the API design is better, not because you have more explicit control.

For getting a solid renderer working without spending three weeks on infrastructure, DX11 is still what I'd recommend. The learning curve is reasonable, PIX and RenderDoc are excellent on Windows, and the API design doesn't constantly fight you. That's why I built it into SleakEngine first and why I teach it.

What DX11 doesn't give you: control over command buffer recording, visibility into the synchronization model, fine-grained pipeline barriers, or multi-threaded rendering that correctly leverages the hardware. At the performance ceiling, that costs you.

DX12 is Microsoft's answer to Vulkan. Explicit command lists, descriptor heaps, pipeline state objects compiled upfront, resource barriers you manage yourself. The APIs solve the same problems differently. Vulkan has a slight edge for cross-platform coverage (Linux, Android, macOS via MoltenVK) and DX12 has a slight edge on Windows tooling with PIX.

## Synchronization Is Where It Actually Gets Hard

The verbosity of resource creation is just typing. You learn it once and it becomes mechanical.

Synchronization is the real difficulty. The GPU runs asynchronously. Writing to a buffer on the CPU and reading it on the GPU in the next draw call without a barrier is undefined behavior, and Vulkan will not tell you at runtime that you did something wrong. You get corruption or a crash with no explanation.

```cpp
VkImageMemoryBarrier barrier{};
barrier.sType               = VK_STRUCTURE_TYPE_IMAGE_MEMORY_BARRIER;
barrier.oldLayout           = VK_IMAGE_LAYOUT_UNDEFINED;
barrier.newLayout           = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL;
barrier.srcQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
barrier.dstQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED;
barrier.image               = textureImage;
barrier.srcAccessMask       = 0;
barrier.dstAccessMask       = VK_ACCESS_TRANSFER_WRITE_BIT;

vkCmdPipelineBarrier(
    cmdBuffer,
    VK_PIPELINE_STAGE_TOP_OF_PIPE_BIT,
    VK_PIPELINE_STAGE_TRANSFER_BIT,
    0, 0, nullptr, 0, nullptr,
    1, &barrier
);
```

Pipeline stages, access masks, image layout transitions. Understanding these requires actually knowing how GPU hardware executes work, not just learning API syntax. The Vulkan spec is the reference and you do need to read it.

Enable the validation layers in development and Vulkan will catch most synchronization mistakes at runtime. Ship without them and they're zero overhead. That's a good deal.

## When It's Worth It

Vulkan makes sense when you need the performance ceiling, when you're targeting multiple platforms including Linux or Android, or when you want to understand what modern GPU hardware actually does rather than what the driver decides to do for you.

For a prototype, a tool, or anything where shipping matters more than squeezing the last 15% of GPU performance, DX11 or even OpenGL will get you there faster and be easier to debug when things go wrong.

I'm building both backends in SleakEngine, DX11 and Vulkan. DX11 for rapid iteration on Windows, Vulkan for performance and Linux. Running them in parallel makes the tradeoffs very concrete very fast. The same render pass in DX11 is half the code. The Vulkan version gives me synchronization control and profiling depth I can't get any other way.

Neither is the wrong choice. They're different points on a tradeoff curve.
