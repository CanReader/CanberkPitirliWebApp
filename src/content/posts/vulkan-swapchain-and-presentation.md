---
title: "Vulkan from Scratch: Swapchains and Presentation"
date: "2026-11-08"
category: "Graphics"
tags: ["Vulkan", "C++", "Tutorials"]
excerpt: "Part two of my Vulkan series: a swapchain, present modes, our first command buffer, and real colors on the screen at last. Written in C++26."
visible: true
---

Hello again, my friend! Welcome back to the second part of Vulkan from Scratch. I hope you survived the first one.

Let's remember where we left off. In [the first part](/blog/vulkan-instance-and-devices/) we wrote about 250 lines of C++. We created an instance, turned on the validation layers, picked a GPU, created a logical device and got our queues. And the result of all that hard work was... an empty window. I'm pretty sure it's the most expensive empty window in the history of computers.

Today that changes. Today we put real colors on the screen! It's not a triangle yet, sorry, but it's a window that slowly cycles through colors like a gaming keyboard. To get there we need three new things: a swapchain, a command buffer, and a little bit of synchronization. And yes, Vulkan is going to make us write a few hundred lines of code to change the color of a window. That's Vulkan, my friend. We already made peace with it in part one.

![This is what we build today: a window that clears itself to a new color every frame, 144 times a second on my laptop.](/images/VulkanSwapchainFirstColor.webp)

We continue from the code of part one, in C++26 again, so keep that `main.cpp` open.

## What is a swapchain?

If you read [Your Monitor Reads Memory 60 Times a Second](/blog/pixels-framebuffers-and-scanout/), you already know the idea. The monitor reads an image from memory again and again at a fixed rate, and we never draw into the image it's reading right now, otherwise we see tearing. So we keep a few images and take turns: while the screen shows one of them, we draw into another one.

In Vulkan, that set of images is called a swapchain. The funny part is that the swapchain doesn't really belong to us. It belongs to the presentation engine, which is the part of the driver and the operating system that puts images on your screen. We can't just grab an image whenever we want. We have to ask for one, draw into it, and give it back.

So every frame has the same three steps. First we acquire an image, which means asking the swapchain for one we're allowed to draw into. Then we record commands that draw into it and submit them to the GPU. Finally we present it, which means giving the image back and asking for it to be shown on the screen. Acquire, draw, present, and again, and again, until you close the window.

## Two small changes to part one

Before we write anything new, we have to touch two places in the code from part one.

First the window. Until now it had a fixed size, but real people resize windows, maximize them, and drag them between monitors, and our swapchain has to survive all of that. So we add `SDL_WINDOW_RESIZABLE` to the window flags:

```cpp
SDL_Window* window = SDL_CreateWindow("Vulkan from Scratch", 1280, 720, SDL_WINDOW_VULKAN | SDL_WINDOW_RESIZABLE);
```

Second, the logical device. Do you remember this sentence from part one? "Later in the series we'll come back to this struct and add the ones we need." Well, that was fast. Today we need one feature, `synchronization2`, so replace the `deviceInfo` from part one with this:

```cpp
const VkPhysicalDeviceVulkan13Features features13{
    .sType            = VK_STRUCTURE_TYPE_PHYSICAL_DEVICE_VULKAN_1_3_FEATURES,
    .synchronization2 = VK_TRUE,
};

const VkDeviceCreateInfo deviceInfo{
    .sType                   = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO,
    .pNext                   = &features13,
    .queueCreateInfoCount    = static_cast<std::uint32_t>(queueInfos.size()),
    .pQueueCreateInfos       = queueInfos.data(),
    .enabledExtensionCount   = static_cast<std::uint32_t>(deviceExtensions.size()),
    .ppEnabledExtensionNames = deviceExtensions.data(),
};
```

`synchronization2` is a newer, cleaner version of Vulkan's functions for barriers and queue submits, the ones with a `2` at the end like `vkCmdPipelineBarrier2` and `vkQueueSubmit2`. It started as an extension, and it became part of core Vulkan in version 1.3. Being part of core doesn't mean it's switched on, though. You still have to ask for it when you create the device. Every GPU that supports Vulkan 1.3 must support it, and we only accept 1.3 GPUs, so we don't need to check first.

All the 1.3 features live in one struct, `VkPhysicalDeviceVulkan13Features`, and we connect it to `deviceInfo` with `.pNext = &features13`. Remember the `pNext` chain I talked about in part one? This is the first time we use it for real. Thanks to designated initializers, every other feature in that struct is set to zero, which means "off".

We also need four more headers at the top of `main.cpp`: `<chrono>`, `<cmath>`, `<format>` and `<limits>`.

## Asking the surface what it can do

Before we create a swapchain, we have to ask our surface three questions. Which image formats can it show? Which present modes does it support? And what are its limits, like the smallest and largest image size and how many images a swapchain can have? Each question gets its own small function, and they all go above `main`.

### The image format

```cpp
VkSurfaceFormatKHR chooseSurfaceFormat(VkPhysicalDevice gpu, VkSurfaceKHR surface)
{
    const auto formats = enumerate<VkSurfaceFormatKHR>(vkGetPhysicalDeviceSurfaceFormatsKHR, gpu, surface);
    const auto best = std::ranges::find_if(formats, [](const VkSurfaceFormatKHR& f) {
        return f.format == VK_FORMAT_B8G8R8A8_SRGB && f.colorSpace == VK_COLOR_SPACE_SRGB_NONLINEAR_KHR;
    });
    return best != formats.end() ? *best : formats.front();
}
```

A surface format is two things together: how each pixel is stored, and which color space the screen expects.

`VK_FORMAT_B8G8R8A8_SRGB` means blue, green, red and alpha, 8 bits each, in that order. The `SRGB` at the end is the important part. Our colors are calculated in linear light, but screens expect sRGB values. With an sRGB format, the GPU converts every color for us when it writes it to the image, so the colors look right without us doing any math. What if you pick `VK_FORMAT_B8G8R8A8_UNORM` instead? Then the GPU writes our numbers as they are, the screen still reads them as sRGB, and everything looks darker than it should. `VK_COLOR_SPACE_SRGB_NONLINEAR_KHR` says the screen expects normal sRGB, which is what almost every monitor uses.

`vkGetPhysicalDeviceSurfaceFormatsKHR` uses the same "call twice" pattern as everything else, so our `enumerate` template from part one handles it. `std::ranges::find_if` (C++20) goes through the list and returns the first format where the lambda says `true`, or `formats.end()` if there's none. If our favorite format isn't there, we just take the first one in the list. Every surface supports at least one, so there's always a first one.

### The present mode

This is where it gets interesting. The present mode decides what happens when we hand a finished image back to the swapchain. There are three that you'll see everywhere.

With `FIFO`, finished images wait in a queue, and at every refresh of the monitor the oldest one in the queue goes on the screen. FIFO means "first in, first out", like a queue in a bakery. It never tears, and if the queue is full, we wait. This is what games call V-Sync, and it's the only mode that every GPU has to support.

With `MAILBOX`, only one finished image can wait. When a new one is ready, it replaces the waiting one, and the old one goes straight to the trash. At every refresh, the newest image goes on the screen. It never tears, and we never wait, but we draw a lot of frames that nobody will ever see.

With `IMMEDIATE`, the image goes on the screen right away, even if the monitor is in the middle of drawing the previous one. It's the fastest, and it can tear.

Talk is cheap, so I measured all three on my laptop. Its screen runs at 144 Hz:

| Present mode | Frames per second |
|---|---|
| `FIFO` | about 145, the refresh rate of my screen |
| `MAILBOX` | between 1,200 and 2,900 |
| `IMMEDIATE` | between 1,100 and 1,400 |

So with `MAILBOX`, my laptop drew around 1,400 frames every second to show 144 of them. Nine out of ten frames went straight to the trash. My GPU worked like crazy to show the same colors I'd get with `FIFO`.

One funny thing happened while I was taking screenshots for this post. Some of them showed only 75 fps with `FIFO`, and for a second I thought my GPU got tired. It didn't. KDE opened the window on my external monitor, which runs at 75 Hz, and `FIFO` simply follows the refresh rate of the screen the window is on. `MAILBOX` doesn't care about that at all:

![The same program on the same GPU. Top: FIFO on my 144 Hz laptop screen. Middle: FIFO on my 75 Hz external monitor. Bottom: MAILBOX on that same 75 Hz monitor, drawing 1,368 frames a second anyway.](/images/VulkanPresentModeFps.webp)

You can see the difference in the demo below. It runs much slower than a real screen so you can follow every image:

```demo
present-modes
```

### Which one should you use?

If you're confused about `IMMEDIATE` right now, good, you're paying attention. If it can tear the picture, why does it even exist?

Because it has the lowest latency of the three. With `FIFO`, a finished frame waits in line, sometimes for two refreshes, so what you see on the screen is always a little bit old. With `IMMEDIATE`, it goes out right away. If you play competitive shooters, this is exactly what "V-Sync off" means in the settings menu, and a lot of players happily accept a bit of tearing for a game that reacts faster to their mouse. When a game runs at a few hundred frames per second, the frames above and below a tear are almost the same picture anyway, so the tear is hard to notice.

It's also the honest mode for measuring. `FIFO` limits you to the refresh rate, so a frame that takes 2 milliseconds and a frame that takes 6 milliseconds both show up as 144 fps. When you want to know how fast your renderer really is, turn V-Sync off and look at the real number.

And there's one more case. If your game can't keep up with the screen, `FIFO` makes every late frame wait for the next refresh, and the motion starts to stutter. Some players prefer a tear over a stutter, and `IMMEDIATE` gives them that choice.

One thing that might surprise you: in a normal window on a modern desktop, you'll probably never see `IMMEDIATE` tear. The compositor, which is the part of KDE, GNOME or Windows that puts all the windows together into one picture, does the final step itself. Tearing mostly shows up when a game runs in fullscreen. And if you have a variable refresh rate monitor (G-Sync or FreeSync), the monitor waits for your frame instead of the other way around, which takes most of the pain out of this whole choice. I wrote a bit about that in [the monitor post](/blog/pixels-framebuffers-and-scanout/).

So why not use `MAILBOX` for everything, since it doesn't tear and doesn't wait? Because it keeps the GPU busy all the time, which means more power, more heat and a louder laptop, and because not every GPU and platform offers it. Only `FIFO` is guaranteed, so you always need it as a fallback anyway.

| Mode | Pick it when | What game settings call it |
|---|---|---|
| `FIFO` | You don't have a reason to pick something else. Always available, never tears, keeps laptops cool. | V-Sync on |
| `MAILBOX` | You want low latency without tearing, and you don't mind the GPU working all the time. | Close to NVIDIA's Fast Sync |
| `IMMEDIATE` | You want the lowest latency and tearing is OK, or you're measuring how fast your renderer really is. | V-Sync off |

For this series I use `FIFO`. It works on every GPU, it never tears, and it doesn't make your laptop hot for nothing:

```cpp
// FIFO works everywhere. Try VK_PRESENT_MODE_MAILBOX_KHR or VK_PRESENT_MODE_IMMEDIATE_KHR here too.
constexpr VkPresentModeKHR preferredPresentMode = VK_PRESENT_MODE_FIFO_KHR;

VkPresentModeKHR choosePresentMode(VkPhysicalDevice gpu, VkSurfaceKHR surface)
{
    const auto modes = enumerate<VkPresentModeKHR>(vkGetPhysicalDeviceSurfacePresentModesKHR, gpu, surface);
    return std::ranges::contains(modes, preferredPresentMode) ? preferredPresentMode : VK_PRESENT_MODE_FIFO_KHR;
}
```

`preferredPresentMode` is a `constexpr` constant, so you can change that one line to try the other modes yourself and watch the frame rate in the window title. `vkGetPhysicalDeviceSurfacePresentModesKHR` gives us the list of present modes this surface supports. `std::ranges::contains` (C++23) checks if our favorite one is in that list, and if it isn't, we fall back to `FIFO`. The `? :` is the conditional operator: "if this is true, use the first value, otherwise use the second one".

By the way, my GPU also lists a newer mode called `VK_PRESENT_MODE_FIFO_LATEST_READY_KHR`. When I tried it, the validation layer stopped me right away, because it needs an extra extension and feature. So don't pick a mode just because it's in the list. Maybe we'll come back to that one later in the series.

### The image size

```cpp
VkExtent2D chooseExtent(const VkSurfaceCapabilitiesKHR& caps, SDL_Window* window)
{
    if (caps.currentExtent.width != std::numeric_limits<std::uint32_t>::max())
        return caps.currentExtent;

    int width = 0;
    int height = 0;
    SDL_GetWindowSizeInPixels(window, &width, &height);
    return {
        .width  = std::clamp(static_cast<std::uint32_t>(width), caps.minImageExtent.width, caps.maxImageExtent.width),
        .height = std::clamp(static_cast<std::uint32_t>(height), caps.minImageExtent.height, caps.maxImageExtent.height),
    };
}
```

Most of the time, the surface simply tells us its size in `currentExtent`, and we use exactly that. But some platforms let the swapchain decide the size of the window. On those, `currentExtent` is set to a special value: the biggest number a `uint32_t` can hold. My laptop runs Linux with Wayland, and when I printed it, I got a width of 4294967295 pixels. Bigger than any monitor you'll ever buy, my friend.

`std::numeric_limits<std::uint32_t>::max()` is that biggest number, so this `if` means "if the surface knows its size, use it". Otherwise we ask SDL how big the window is. `SDL_GetWindowSizeInPixels` returns the size in real pixels, which is different from the window size on high DPI screens. A window that's 1280 units wide at 200% scaling is 2560 pixels wide, and the swapchain needs pixels.

`std::clamp` (C++17) keeps a value between a minimum and a maximum, so the size never goes outside the limits the surface gave us. The `static_cast` is there because SDL gives us an `int` and Vulkan wants a `uint32_t`.

## Creating the swapchain

Now we put all three answers together. First a small struct to keep everything about the swapchain in one place, and then the function that creates it. Both go above `main`:

```cpp
struct Swapchain {
    VkSwapchainKHR handle = VK_NULL_HANDLE;
    VkFormat format = VK_FORMAT_UNDEFINED;
    VkExtent2D extent{};
    VkPresentModeKHR presentMode = VK_PRESENT_MODE_FIFO_KHR;
    std::vector<VkImage> images;
};

Swapchain createSwapchain(VkPhysicalDevice gpu, VkDevice device, VkSurfaceKHR surface, SDL_Window* window,
                          const QueueFamilies& families, VkSwapchainKHR old)
{
    VkSurfaceCapabilitiesKHR caps;
    vkCheck(vkGetPhysicalDeviceSurfaceCapabilitiesKHR(gpu, surface, &caps));

    const VkSurfaceFormatKHR format = chooseSurfaceFormat(gpu, surface);
    const VkPresentModeKHR presentMode = choosePresentMode(gpu, surface);
    const VkExtent2D extent = chooseExtent(caps, window);

    std::uint32_t imageCount = caps.minImageCount + 1;
    if (caps.maxImageCount != 0)
        imageCount = std::min(imageCount, caps.maxImageCount);

    const std::array familyIndices = { *families.graphics, *families.present };
    const bool shared = families.graphics != families.present;

    const VkSwapchainCreateInfoKHR info{
        .sType                 = VK_STRUCTURE_TYPE_SWAPCHAIN_CREATE_INFO_KHR,
        .surface               = surface,
        .minImageCount         = imageCount,
        .imageFormat           = format.format,
        .imageColorSpace       = format.colorSpace,
        .imageExtent           = extent,
        .imageArrayLayers      = 1,
        .imageUsage            = VK_IMAGE_USAGE_COLOR_ATTACHMENT_BIT | VK_IMAGE_USAGE_TRANSFER_DST_BIT,
        .imageSharingMode      = shared ? VK_SHARING_MODE_CONCURRENT : VK_SHARING_MODE_EXCLUSIVE,
        .queueFamilyIndexCount = shared ? 2u : 0u,
        .pQueueFamilyIndices   = shared ? familyIndices.data() : nullptr,
        .preTransform          = caps.currentTransform,
        .compositeAlpha        = VK_COMPOSITE_ALPHA_OPAQUE_BIT_KHR,
        .presentMode           = presentMode,
        .clipped               = VK_TRUE,
        .oldSwapchain          = old,
    };

    Swapchain swapchain{ .format = format.format, .extent = extent, .presentMode = presentMode };
    vkCheck(vkCreateSwapchainKHR(device, &info, nullptr, &swapchain.handle));
    swapchain.images = enumerate<VkImage>(vkGetSwapchainImagesKHR, device, swapchain.handle);
    return swapchain;
}
```

`vkGetPhysicalDeviceSurfaceCapabilitiesKHR` fills `caps` with the limits of our surface. Then we call our three helpers.

`minImageCount` is how many images we want. The surface tells us the minimum, and we ask for one more. With only the minimum, we'd sometimes have to wait for the driver to give an image back before we could start drawing. My GPU's minimum is 2, so we get 3 images, which is classic triple buffering. `maxImageCount` is the limit on the other side, and 0 is a special value that means there's no limit, so we only use `std::min` when there is one.

So why not ask for 8 images, if more images means less waiting? Because with `FIFO`, more images also means more finished frames waiting in line, so what you see on the screen gets older, and your game feels slower to react. Every image also costs memory: a 1920x1080 image with 4 bytes per pixel is about 8 MB. One more than the minimum is the usual sweet spot.

Most of the fields are simple once you know what they mean:

`imageExtent` and `imageFormat` are the size and format we picked. `imageArrayLayers` is 1. It's only more than 1 for things like VR, where one image has a layer for each eye.

`imageUsage` says what we're going to do with the images. `COLOR_ATTACHMENT` means we'll draw into them, which we'll do from the next part on. `TRANSFER_DST` means we can write into them with transfer commands, like the clear we use today. A surface lists the usages it allows in `caps.supportedUsageFlags`. My RTX 4050 allows both, like desktop GPUs in general, and the validation layer would tell us if yours doesn't.

`imageSharingMode` decides which queue families can use the images. If graphics and present are the same family, which they almost always are, `EXCLUSIVE` is the faster choice. If they're different, `CONCURRENT` lets both families use the images without us moving them between families by hand. `familyIndices` is only used in that case.

`preTransform` is for screens that can rotate, like on phones. `caps.currentTransform` means "keep whatever the screen is doing right now".

`compositeAlpha` decides whether our window can be see-through over other windows. `OPAQUE` means no, which is what we want.

`clipped` lets the driver skip pixels that are hidden behind other windows. We never read them back, so that's free performance.

`oldSwapchain` is for when we recreate the swapchain, for example after a resize. Passing the old one lets the driver reuse what it can. The first time there's no old swapchain, so we pass `VK_NULL_HANDLE`.

At the end we fill our own `Swapchain` struct with designated initializers. That works on our own structs too, not only on Vulkan's. Then we get the images with `vkGetSwapchainImagesKHR`, using `enumerate` again. These images belong to the swapchain, so we never destroy them ourselves. They go away together with it.

In `main`, right after we get the queues, we create the swapchain and print what we got:

```cpp
Swapchain swapchain = createSwapchain(gpu, device, surface, window, families, VK_NULL_HANDLE);
std::println("Swapchain: {}x{}, {} images, {}", swapchain.extent.width, swapchain.extent.height,
             swapchain.images.size(), enumName(swapchain.presentMode));
```

Look at the last argument there. `enumName` from part one prints the name of the present mode for free. I told you reflection works on any enum!

## Command buffers

In Vulkan you never draw anything directly. You record commands into a command buffer, and then you submit the whole buffer to a queue. The GPU runs it whenever it's ready. Command buffers get their memory from a command pool, so we create the pool first:

```cpp
const VkCommandPoolCreateInfo poolInfo{
    .sType            = VK_STRUCTURE_TYPE_COMMAND_POOL_CREATE_INFO,
    .flags            = VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT,
    .queueFamilyIndex = *families.graphics,
};
VkCommandPool commandPool = VK_NULL_HANDLE;
vkCheck(vkCreateCommandPool(device, &poolInfo, nullptr, &commandPool));

const VkCommandBufferAllocateInfo allocInfo{
    .sType              = VK_STRUCTURE_TYPE_COMMAND_BUFFER_ALLOCATE_INFO,
    .commandPool        = commandPool,
    .level              = VK_COMMAND_BUFFER_LEVEL_PRIMARY,
    .commandBufferCount = 1,
};
VkCommandBuffer cmd = VK_NULL_HANDLE;
vkCheck(vkAllocateCommandBuffers(device, &allocInfo, &cmd));
```

A command pool is tied to one queue family, because commands for one family can't run on another one. We're going to draw on the graphics queue, so we use the graphics family. `VK_COMMAND_POOL_CREATE_RESET_COMMAND_BUFFER_BIT` lets us reset and re-record a single command buffer from this pool every frame. Without this flag, you could only reset the whole pool at once.

Then we allocate one command buffer from the pool. We draw one frame at a time in this part, so one is enough. `PRIMARY` means it's a normal command buffer that we submit to a queue directly. There are also secondary ones that only run from inside a primary one, but we don't need those.

## Fences and semaphores

Synchronization is going to get a whole part later in this series, because it's the hardest part of Vulkan, to be honest. But we need a little bit of it today.

The CPU and the GPU run at the same time, and neither of them waits for the other unless we tell them to. Vulkan gives us two tools for that.

A fence is a signal from the GPU to the CPU. The GPU signals it when some work is done, and the CPU can wait for it. We use one fence, `frameDone`, so the CPU doesn't start recording the next frame into a command buffer the GPU is still running. That also means the CPU and the GPU take turns: while the GPU works on a frame, the CPU sits and waits. It's slower than it could be, and real engines keep two or three frames in flight so both of them stay busy. We'll do that in the synchronization part. For one clear per frame, it doesn't matter at all.

A semaphore is a signal between two jobs on the GPU. The CPU never waits for it, it only says "this job has to wait for that one". We need two kinds. `imageAvailable` is signaled when the swapchain image we acquired is really free to use, and our drawing waits for it. `renderFinished` is signaled when our drawing is done, and presenting waits for it, so the screen never shows a half-drawn image.

This is how one frame goes through the CPU, the GPU and the presentation engine. Come back to it whenever the code below gets confusing:

![One frame of our program. The dashed arrows are calls that ask for something, the blue ones are semaphores, and the orange one is the fence.](/images/VulkanFrameFlow.svg)

```cpp
const VkSemaphoreCreateInfo semaphoreInfo{ .sType = VK_STRUCTURE_TYPE_SEMAPHORE_CREATE_INFO };
const VkFenceCreateInfo fenceInfo{
    .sType = VK_STRUCTURE_TYPE_FENCE_CREATE_INFO,
    .flags = VK_FENCE_CREATE_SIGNALED_BIT,
};

VkSemaphore imageAvailable = VK_NULL_HANDLE;
VkFence frameDone = VK_NULL_HANDLE;
vkCheck(vkCreateSemaphore(device, &semaphoreInfo, nullptr, &imageAvailable));
vkCheck(vkCreateFence(device, &fenceInfo, nullptr, &frameDone));

auto createSemaphores = [&](std::size_t count) {
    std::vector<VkSemaphore> semaphores(count);
    for (VkSemaphore& semaphore : semaphores)
        vkCheck(vkCreateSemaphore(device, &semaphoreInfo, nullptr, &semaphore));
    return semaphores;
};
std::vector<VkSemaphore> renderFinished = createSemaphores(swapchain.images.size());
```

The fence starts out signaled thanks to `VK_FENCE_CREATE_SIGNALED_BIT`. At the start of every frame we wait for the previous frame's fence. On the very first frame there was no previous frame, and without this flag we'd wait forever for a frame that never existed. Not a great start for our program.

You might be wondering why there's a list of `renderFinished` semaphores, one for each swapchain image, but only one `imageAvailable`. Present doesn't tell us when it's done waiting for its semaphore, so we can't know when it's safe to use that semaphore again. But we do know that once the swapchain gives us the same image again, its previous present is finished. So if every image has its own `renderFinished` semaphore, we can always reuse it safely. If you use only one, newer validation layers will complain about it, and they're right.

`createSemaphores` is a lambda that creates `count` semaphores. `[&]` lets it use `device` and `semaphoreInfo` from `main`, and `VkSemaphore& semaphore` is a reference, so `vkCreateSemaphore` writes straight into the vector. We make it a lambda because we'll need it again when the window is resized.

## Image layouts and barriers

One more concept, and then we can draw, I promise.

GPUs don't always store an image as a simple grid of pixels. Depending on what you do with it, the driver can compress it or arrange the memory in a smarter way. In Vulkan, this arrangement is called the layout of the image, and we have to tell the GPU when an image changes from one layout to another. Today we need three layouts:

| Layout | When we use it |
|---|---|
| `UNDEFINED` | "I don't care what's in the image." Fine for us, because we overwrite all of it. |
| `TRANSFER_DST_OPTIMAL` | The best layout for writing into the image with a transfer command, like our clear. |
| `PRESENT_SRC_KHR` | The layout the presentation engine needs to show the image. |

We change layouts with a barrier. A barrier does two jobs at the same time. It changes the layout, and it says which work must be finished before it (the source) and which work must wait until after it (the destination). Both sides are described with a stage, which is a part of the GPU pipeline, and an access, which is the kind of memory access like reading or writing. This small helper does it, and it goes above `main` too:

```cpp
struct Transition {
    VkImageLayout from = VK_IMAGE_LAYOUT_UNDEFINED;
    VkImageLayout to = VK_IMAGE_LAYOUT_UNDEFINED;
    VkPipelineStageFlags2 srcStage = VK_PIPELINE_STAGE_2_NONE;
    VkAccessFlags2 srcAccess = VK_ACCESS_2_NONE;
    VkPipelineStageFlags2 dstStage = VK_PIPELINE_STAGE_2_NONE;
    VkAccessFlags2 dstAccess = VK_ACCESS_2_NONE;
};

void transition(VkCommandBuffer cmd, VkImage image, const Transition& t)
{
    const VkImageMemoryBarrier2 barrier{
        .sType               = VK_STRUCTURE_TYPE_IMAGE_MEMORY_BARRIER_2,
        .srcStageMask        = t.srcStage,
        .srcAccessMask       = t.srcAccess,
        .dstStageMask        = t.dstStage,
        .dstAccessMask       = t.dstAccess,
        .oldLayout           = t.from,
        .newLayout           = t.to,
        .srcQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED,
        .dstQueueFamilyIndex = VK_QUEUE_FAMILY_IGNORED,
        .image               = image,
        .subresourceRange    = { .aspectMask = VK_IMAGE_ASPECT_COLOR_BIT, .levelCount = 1, .layerCount = 1 },
    };
    const VkDependencyInfo dependency{
        .sType                   = VK_STRUCTURE_TYPE_DEPENDENCY_INFO,
        .imageMemoryBarrierCount = 1,
        .pImageMemoryBarriers    = &barrier,
    };
    vkCmdPipelineBarrier2(cmd, &dependency);
}
```

The `Transition` struct has a default value for every field, so we only have to write the ones we need. And because we can use designated initializers when we call the function, it looks like this later:

```cpp
transition(cmd, image, { .from = VK_IMAGE_LAYOUT_UNDEFINED, .to = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, ... });
```

Every value has a name at the call site. C++ doesn't have named arguments, but this is very close, and it makes calls like this much easier to read.

Inside, `VkImageMemoryBarrier2` is the barrier itself. `VK_QUEUE_FAMILY_IGNORED` on both sides means we aren't moving the image from one queue family to another. `subresourceRange` says which part of the image the barrier is about: the color data, 1 mip level and 1 layer, which is the whole image for us. `VkDependencyInfo` can carry many barriers at once, but we give it just one, and `vkCmdPipelineBarrier2` records it into the command buffer.

## Drawing a frame

Finally! Replace the event loop from part one with this one:

```cpp
bool running = true;
bool resized = false;
int frames = 0;
auto fpsTimer = std::chrono::steady_clock::now();

while (running) {
    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        if (event.type == SDL_EVENT_QUIT)
            running = false;
        if (event.type == SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED)
            resized = true;
    }
    if (SDL_GetWindowFlags(window) & SDL_WINDOW_MINIMIZED) {
        SDL_WaitEvent(nullptr);
        continue;
    }

    // drawing one frame goes here
}
```

`SDL_EVENT_WINDOW_PIXEL_SIZE_CHANGED` arrives when the window's size in pixels changes, and we remember it in `resized` to recreate the swapchain later. When the window is minimized, we don't draw at all. A minimized window can have a size of 0 by 0, and you can't create a swapchain with no pixels. `SDL_WaitEvent(nullptr)` puts the program to sleep until the next event arrives, so we don't burn the CPU for a window nobody can see.

Now let's fill in the frame, piece by piece. Every snippet from here goes where the comment is, in order.

### Getting an image

```cpp
vkCheck(vkWaitForFences(device, 1, &frameDone, VK_TRUE, std::numeric_limits<std::uint64_t>::max()));

std::uint32_t imageIndex = 0;
const VkResult acquired = vkAcquireNextImageKHR(device, swapchain.handle, std::numeric_limits<std::uint64_t>::max(),
                                                imageAvailable, VK_NULL_HANDLE, &imageIndex);
if (acquired == VK_ERROR_OUT_OF_DATE_KHR) {
    recreateSwapchain();
    continue;
}
if (acquired != VK_SUBOPTIMAL_KHR)
    vkCheck(acquired);
```

First we wait for `frameDone`, so the GPU is finished with the previous frame and its command buffer. `VK_TRUE` means "wait for all the fences in the list", which doesn't matter with one fence. The last argument is a timeout in nanoseconds, and the biggest `uint64_t` means "wait as long as it takes".

Then `vkAcquireNextImageKHR` asks the swapchain for an image. It writes the index of the image into `imageIndex`, and it signals `imageAvailable` when the image is really ready to use. That can happen later than the function returns, which is exactly why we need the semaphore.

The result can be two special values. `VK_ERROR_OUT_OF_DATE_KHR` means the swapchain doesn't match the window anymore, usually after a resize, and we can't use it at all. So we recreate it and start the frame again with `continue`. `VK_SUBOPTIMAL_KHR` means we got an image, but the swapchain doesn't match the window perfectly anymore. We can still draw this frame, and we'll fix the swapchain after we present it.

Notice that we reset the fence only after a successful acquire, in the next snippet. If we reset it first and then skipped the frame with `continue`, nobody would ever signal it again, and the next frame would wait for it forever. That kind of bug freezes your program with no error message at all, so the order matters.

### Recording the commands

```cpp
vkCheck(vkResetFences(device, 1, &frameDone));
vkCheck(vkResetCommandBuffer(cmd, 0));

const VkCommandBufferBeginInfo beginInfo{
    .sType = VK_STRUCTURE_TYPE_COMMAND_BUFFER_BEGIN_INFO,
    .flags = VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT,
};
vkCheck(vkBeginCommandBuffer(cmd, &beginInfo));

const VkImage image = swapchain.images[imageIndex];
transition(cmd, image, {
    .from      = VK_IMAGE_LAYOUT_UNDEFINED,
    .to        = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL,
    .srcStage  = VK_PIPELINE_STAGE_2_TRANSFER_BIT,
    .dstStage  = VK_PIPELINE_STAGE_2_TRANSFER_BIT,
    .dstAccess = VK_ACCESS_2_TRANSFER_WRITE_BIT,
});
```

`vkResetFences` sets the fence back to unsignaled, so the GPU can signal it again for this frame. `vkResetCommandBuffer` throws away last frame's commands. `VK_COMMAND_BUFFER_USAGE_ONE_TIME_SUBMIT_BIT` tells the driver we'll submit these commands only once before recording them again, which helps it optimize.

Then the first barrier. The image goes from `UNDEFINED` to `TRANSFER_DST_OPTIMAL`, so it's ready for our clear. The destination says that transfer writes, our clear, have to wait for this barrier. The source stage is transfer too, because it has to line up with the stage where we'll wait for `imageAvailable` when we submit. Together they make sure the layout change happens after the image is really free, and before we write into it.

```cpp
const float t = SDL_GetTicks() / 1000.0f;
const VkClearColorValue color{ .float32 = {
    0.5f + 0.5f * std::sin(t),
    0.5f + 0.5f * std::sin(t + 2.1f),
    0.5f + 0.5f * std::sin(t + 4.2f),
    1.0f,
} };
const VkImageSubresourceRange whole{ .aspectMask = VK_IMAGE_ASPECT_COLOR_BIT, .levelCount = 1, .layerCount = 1 };
vkCmdClearColorImage(cmd, image, VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL, &color, 1, &whole);
```

And this is our color! `SDL_GetTicks()` is the number of milliseconds since SDL started, so `t` is the time in seconds. Red, green and blue each follow a sine wave, and `0.5f + 0.5f * std::sin(...)` moves each one between 0 and 1. The three waves are 2.1 apart, which is about a third of a full circle, so the colors take turns and the window slowly goes through the whole rainbow.

`VkClearColorValue` is a union. It can hold four floats, four signed integers or four unsigned integers, and `.float32` says we fill the floats. Yes, designated initializers work on unions too. These colors are in linear light, and the sRGB format we picked converts them when they're written.

`vkCmdClearColorImage` fills the whole image with that color. The `VkImageSubresourceRange` says which part to clear, and it's the whole image again.

Why a clear and not a real draw? Because drawing needs shaders and a graphics pipeline, and that's the whole next part. A clear is the simplest command that writes pixels, so it's perfect for checking that our swapchain, our command buffer and our synchronization all work before we add anything else.

![Four screenshots of the same window, taken about 1.4 seconds apart. Three of them say 75 fps because they opened on my external monitor.](/images/VulkanClearColorCycle.webp)

```cpp
transition(cmd, image, {
    .from      = VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL,
    .to        = VK_IMAGE_LAYOUT_PRESENT_SRC_KHR,
    .srcStage  = VK_PIPELINE_STAGE_2_TRANSFER_BIT,
    .srcAccess = VK_ACCESS_2_TRANSFER_WRITE_BIT,
});

vkCheck(vkEndCommandBuffer(cmd));
```

The second barrier moves the image from `TRANSFER_DST_OPTIMAL` to `PRESENT_SRC_KHR`, the layout the presentation engine wants. The source says that our transfer write, the clear, has to be finished first. The destination is empty, because nothing else in our command buffer uses the image after this, and present waits for the `renderFinished` semaphore anyway. Then `vkEndCommandBuffer` finishes the recording.

You might be wondering what happens if you forget a barrier. I tried it for you: I removed the first one and ran the program. The window still changed colors on my GPU, but the validation layer complained on every single frame:

```
[vulkan] vkQueueSubmit2(): pSubmits[0] command buffer VkCommandBuffer 0x55b6d1298030 expects VkImage 0x40000000004 (subresource: aspectMask = VK_IMAGE_ASPECT_COLOR_BIT, mipLevel = 0, arrayLayer = 0) to be in layout VK_IMAGE_LAYOUT_TRANSFER_DST_OPTIMAL--instead, current layout is VK_IMAGE_LAYOUT_UNDEFINED.
```

And this is exactly the dangerous kind of bug. It works on my GPU, so it's easy to ignore, but another GPU that really compresses its images could show garbage or crash. Always fix what the validation layer says, even when everything looks fine. Funny detail: the second half of that message quoted a rule about descriptors, which has nothing to do with our code. The validation layer isn't perfect either, so read the first line first, that's where the real problem is.

### Submitting the work

```cpp
const VkSemaphoreSubmitInfo waitInfo{
    .sType     = VK_STRUCTURE_TYPE_SEMAPHORE_SUBMIT_INFO,
    .semaphore = imageAvailable,
    .stageMask = VK_PIPELINE_STAGE_2_TRANSFER_BIT,
};
const VkSemaphoreSubmitInfo signalInfo{
    .sType     = VK_STRUCTURE_TYPE_SEMAPHORE_SUBMIT_INFO,
    .semaphore = renderFinished[imageIndex],
    .stageMask = VK_PIPELINE_STAGE_2_ALL_COMMANDS_BIT,
};
const VkCommandBufferSubmitInfo cmdInfo{
    .sType         = VK_STRUCTURE_TYPE_COMMAND_BUFFER_SUBMIT_INFO,
    .commandBuffer = cmd,
};
const VkSubmitInfo2 submit{
    .sType                    = VK_STRUCTURE_TYPE_SUBMIT_INFO_2,
    .waitSemaphoreInfoCount   = 1,
    .pWaitSemaphoreInfos      = &waitInfo,
    .commandBufferInfoCount   = 1,
    .pCommandBufferInfos      = &cmdInfo,
    .signalSemaphoreInfoCount = 1,
    .pSignalSemaphoreInfos    = &signalInfo,
};
vkCheck(vkQueueSubmit2(graphicsQueue, 1, &submit, frameDone));
```

This is where all the synchronization from before comes together. `waitInfo` says our commands must wait for `imageAvailable`, but only at the transfer stage. Anything before that stage could already run, which doesn't matter much for us today, but it will once we have more work in a frame.

`signalInfo` says `renderFinished` for this image gets signaled when all our commands are done. `ALL_COMMANDS` is the safe choice here. The command buffer goes into `cmdInfo`, and `VkSubmitInfo2` puts the three together. `vkQueueSubmit2` sends it to the graphics queue, and the last argument, `frameDone`, gets signaled when the GPU has finished everything in this submit.

### Presenting

```cpp
const VkPresentInfoKHR presentInfo{
    .sType              = VK_STRUCTURE_TYPE_PRESENT_INFO_KHR,
    .waitSemaphoreCount = 1,
    .pWaitSemaphores    = &renderFinished[imageIndex],
    .swapchainCount     = 1,
    .pSwapchains        = &swapchain.handle,
    .pImageIndices      = &imageIndex,
};
const VkResult presented = vkQueuePresentKHR(presentQueue, &presentInfo);
if (presented == VK_ERROR_OUT_OF_DATE_KHR || presented == VK_SUBOPTIMAL_KHR || resized) {
    resized = false;
    recreateSwapchain();
} else {
    vkCheck(presented);
}
```

`vkQueuePresentKHR` gives the image back to the swapchain and asks for it to be shown. It waits for `renderFinished` of this image, so the screen never gets a half-cleared image. One present call could show images from several swapchains at once, for example one for each window, which is why it takes arrays. We have one of each.

If present tells us the swapchain is out of date or suboptimal, or if SDL told us the window was resized, we recreate the swapchain now. Why do we need our own `resized` flag? Because of that special size from before. On platforms like Wayland, the window's size is whatever our swapchain says it is, so the swapchain doesn't become out of date when you resize the window. Without SDL's event, we'd keep drawing 1280 by 720 pixels into a window of any size.

### Counting frames

```cpp
++frames;
const auto now = std::chrono::steady_clock::now();
if (now - fpsTimer >= std::chrono::seconds(1)) {
    SDL_SetWindowTitle(window, std::format("Vulkan from Scratch | {} fps", frames).c_str());
    frames = 0;
    fpsTimer = now;
}
```

Every frame we add one to `frames`. `std::chrono::steady_clock` is a clock that only goes forward, so it's the right one for measuring time, and once a second has passed, we put the number of frames into the window title and start counting again. `std::format` (C++20) builds the text the same way `std::println` does, and `.c_str()` turns it into the kind of string SDL wants. And if you see 145 on a 144 Hz screen, nothing is wrong. We only look at the clock once per frame, so our "one second" is always a tiny bit longer than a real second. That's our first profiler, my friend. Very humble, but it works.

## When the window changes size

This is the lambda we've been calling. It goes before the event loop, right after `renderFinished`:

```cpp
auto recreateSwapchain = [&] {
    vkCheck(vkDeviceWaitIdle(device));
    Swapchain fresh = createSwapchain(gpu, device, surface, window, families, swapchain.handle);
    vkDestroySwapchainKHR(device, swapchain.handle, nullptr);
    for (VkSemaphore semaphore : renderFinished)
        vkDestroySemaphore(device, semaphore, nullptr);
    swapchain = std::move(fresh);
    renderFinished = createSemaphores(swapchain.images.size());
};
```

`vkDeviceWaitIdle` waits until the GPU has finished everything. It's the simplest way to make sure nothing is using the old swapchain anymore. It isn't the fastest, but you don't resize a window every frame, so it's fine for now.

Then we create the new swapchain and pass the old one as `oldSwapchain`, destroy the old one, and create new `renderFinished` semaphores, because the new swapchain might have a different number of images. `std::move` moves the new swapchain into our variable instead of copying it, so the vector of images isn't copied for nothing.

## Cleaning up

Replace the cleanup from part one with this:

```cpp
vkCheck(vkDeviceWaitIdle(device));

for (VkSemaphore semaphore : renderFinished)
    vkDestroySemaphore(device, semaphore, nullptr);
vkDestroySemaphore(device, imageAvailable, nullptr);
vkDestroyFence(device, frameDone, nullptr);
vkDestroyCommandPool(device, commandPool, nullptr);
vkDestroySwapchainKHR(device, swapchain.handle, nullptr);

vkDestroyDevice(device, nullptr);
SDL_Vulkan_DestroySurface(instance, surface, nullptr);

const auto destroyMessenger = reinterpret_cast<PFN_vkDestroyDebugUtilsMessengerEXT>(
    vkGetInstanceProcAddr(instance, "vkDestroyDebugUtilsMessengerEXT"));
destroyMessenger(instance, messenger, nullptr);

vkDestroyInstance(instance, nullptr);
SDL_DestroyWindow(window);
SDL_Quit();
```

The `vkDeviceWaitIdle` at the top is very important. When you close the window, the GPU might still be working on the last frame. If we destroyed the command buffer or the semaphores while it's using them, the validation layer would be very, very upset with us, and it would be right.

Then the order. Everything we created from the device goes before the device. Destroying the command pool also frees the command buffers we allocated from it. The swapchain has to go before the surface, because it was created for that surface. And the rest is the same as in part one.

## What we have now

Run it, and finally, colors! The window slowly changes color, and the title shows the frame rate, about 145 on my laptop with `FIFO`. The terminal says:

```
Using NVIDIA GeForce RTX 4050 Laptop GPU (VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU)
Swapchain: 1280x720, 3 images, VK_PRESENT_MODE_FIFO_KHR
```

Resize the window, maximize it, minimize it, and nothing breaks, and the validation layer doesn't say a single word. Then change `preferredPresentMode` to `VK_PRESENT_MODE_MAILBOX_KHR` and watch the number in the title go crazy.

Our `main.cpp` is now about 540 lines long, and all it does is paint a window. If anyone ever asks you why game engines are so expensive to build, send them this post.

In the next part, we finally draw a triangle: shaders, a graphics pipeline, and our very first real draw call. See you there, my friend!
