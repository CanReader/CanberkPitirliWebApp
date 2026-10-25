---
title: "Vulkan from Scratch: Instance, Devices and Queues"
date: "2026-10-25"
category: "Graphics"
tags: ["vulkan", "tutorial", "c++", "graphics"]
slugs: ["vulkan-instance-and-devices"]
excerpt: "The first introduction to game engine development with vulkan!"
visible: true
---

Hello and welcome, everyone! It's a great pleasure to see all of you again! I hope you guys are having a wonderful weekend.

As for me? meh, could be better... My work at CREATANT allows me to focus on other things instead of personal problems. I am still working at CREATANT most of the time, as a full-stack developer. To be honest, and I think I'm doing a great job there since my whole team is happy to work with me, and I love everything about my job.

Besides my work, I've been trying to find some time for my personal projects and writing here. And while I was coding my game engine, the hard reality of Vulkan slapped on my face again.

![How the heck Vulkan slaps on my face](https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbG5qNmVkbXBpcW8xM241YXNuYnFmZ3N2MDRkN2V2NGRsYWExcnBzcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JXuGatu6v9pUA/giphy.gif)

## It all started with a childhood dream

If you've read my previous posts, You already know I've been working on a game engine project called Sleak Engine. I still remember how it all started...

I told you, my first curiosity with programming has been started with curiosity of how games work (As I wrote in my webpage which shows like a slogan) I learned that they are 
actually crafted by a special software called **Game Engine**. I learned about Game Maker, Unity, Cry Engine and Unreal Engine, experienced them for few years, however, I never 
questioned about how game engines work behind the scenes. I was always questioning how they are working so I found myself leaving my first work at Fatalitech and learn to make my own 
game engine. And so I learned game engines works by something called graphics APIs. 

:::center
*And later time, I learned all programming things working by movement of electrons on motherboard..*\
No no, I'm just joking :D 
:::

## The story behind my game engine

I didn't want to learn anything about OpenGL. Sure, it was the better choice for cross-platform development, and it wasn't tied to
Microslop, but DirectX 11 was the most modern API at the time, and that was all I cared about. Yeah, I was pretty naive back then.
I definitely don't think that way anymore.

My dream was to make my own Minecraft clone, so you could say this project really goes back to my childhood! It started as 
DXCraft, and I just kept adding things on it: the first one color triangle then turn it to a rectangle, add index buffer, turn 
it into a cube, making a chunk, generating more chunks, coding a chunk generator and procedural world generation etc. It almost
took my several years to make something like this I always dreamed of in the most basic way.

At university, I already had some knowledge, so I improved it even more, added OpenGL then Vulkan. At some point, the project
became huge so I cannot control it anymore and as I professional developer, I started to think with architectural way. I divided 
the all game engine code into its own module. That's how my child [SleakEngine](http://github.com/CanReader/SleakEngine) was born! 
My greatest project ever! and [SleakCraft](http://github.com/CanReader/SleakCraft), the Minecraft clone I'd always dreamed of! 

Graphics programming was already hard enough, but do you want to know what the hardest part was? Let me tell you, my friend: Vulkan. Implementing it really made me sweat all the time! At one point I seriously thought about giving up on the repo and just enjoying my life. A little voice in my head kept saying: "I don't know, just go back to your retail job, or go play some video games. Life is too short to worry about Vulkan frame optimizations!"

The timing didn't help either. It was the dawn of LLMs, ChatGPT had just come out, and it really looked like AI was about to take this job anyway. So why should I even care?

But I cared, I cared to improve this project and that's how I pop up to here right now, with my own experiences, with my own 
creativity and knowledge! 

My dear friend, at least we are here currently to learn everything in a best way! Never forget that: 

:::center
*"The impediment to actio advances action. What stands in the way becomes the way."*\
** Marcus Aurelius **
:::

## Before we start
This series is for people who know C++ or at least any programming languages. You don't need to know any graphics programming 
stuffs already since we will start learning in here. If you already have some basic knowledge from other graphics APIs, I already 
wrote abour that in [What Makes Vulkan Different from Every Other Graphics API](/blog/vulkan-vs-other-graphics-apis/)

e'll build a small Vulkan renderer from an empty folder, one piece of the API at a time, and every part will end with code that compiles and runs. This first part doesn't draw anything yet. We'll create the instance, turn on the validation layers, create a window surface, pick a GPU, and then create the logical device with the queues we'll send work to. Every Vulkan program starts with these steps, and almost everything you create later depends on them, so it's worth understanding them properly instead of copying them from somewhere.

## What you need

You need the [Vulkan SDK from LunarG](https://vulkan.lunarg.com/), [SDL3](https://libsdl.org/) for the window, CMake, and a C++20 compiler. The Vulkan SDK is important, because it comes with the validation layers (on Linux, your distro's validation layers package works too). Without them, creating the instance with validation turned on fails with `VK_ERROR_LAYER_NOT_PRESENT`.

For SDL, make sure you get SDL3 and not SDL2, because the Vulkan functions changed between the two versions. I'm using SDL 3.4.18.

I use the C API in this series, not `vulkan.hpp`. The spec, the validation messages and almost every example online use the C names, so it's better to learn those first. Once you know them, the C++ wrapper is easy to pick up.

The CMake file is short:

```cmake
cmake_minimum_required(VERSION 3.20)
project(VulkanFromScratch CXX)

set(CMAKE_CXX_STANDARD 20)

find_package(Vulkan REQUIRED)
find_package(SDL3 REQUIRED CONFIG)

add_executable(app main.cpp)
target_link_libraries(app PRIVATE Vulkan::Vulkan SDL3::SDL3)
```

And this is the start of `main.cpp`. The `SDL_WINDOW_VULKAN` flag tells SDL that we'll render into this window with Vulkan, so SDL loads the Vulkan loader when it creates the window. If there's no working Vulkan driver, `SDL_CreateWindow` fails right here. I include `vulkan.h` before `SDL_vulkan.h`, so SDL uses the real Vulkan types instead of declaring its own.

In SDL3 most functions return a `bool`, `true` on success, and `SDL_GetError()` tells you what went wrong. Vulkan functions return a `VkResult` instead, and the `VK_CHECK` macro stops the program when one of them fails, which is what you want while learning.

```cpp
#include <vulkan/vulkan.h>
#include <SDL3/SDL.h>
#include <SDL3/SDL_vulkan.h>

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <optional>
#include <set>
#include <vector>

#define VK_CHECK(x)                                              \
    do {                                                         \
        VkResult r = (x);                                        \
        if (r != VK_SUCCESS) {                                   \
            std::fprintf(stderr, "%s failed: %d\n", #x, r);      \
            std::abort();                                        \
        }                                                        \
    } while (0)

int main()
{
    if (!SDL_Init(SDL_INIT_VIDEO)) {
        std::fprintf(stderr, "SDL_Init failed: %s\n", SDL_GetError());
        return 1;
    }

    SDL_Window* window = SDL_CreateWindow("Vulkan from Scratch", 1280, 720, SDL_WINDOW_VULKAN);
    if (!window) {
        std::fprintf(stderr, "SDL_CreateWindow failed: %s\n", SDL_GetError());
        return 1;
    }

    // everything below goes here
}
```

## The instance

The instance is the connection between your program and the Vulkan loader. The loader is the library you link against (`vulkan-1.dll` on Windows, `libvulkan.so.1` on Linux). It finds the drivers installed on the machine and sends your calls to the right one. You can't do anything in Vulkan before you have an instance.

To create it, you tell Vulkan two things: which version of the API your program is written for, and which instance extensions and layers you want.

```cpp
VkApplicationInfo appInfo{};
appInfo.sType              = VK_STRUCTURE_TYPE_APPLICATION_INFO;
appInfo.pApplicationName   = "Vulkan from Scratch";
appInfo.applicationVersion = VK_MAKE_API_VERSION(0, 1, 0, 0);
appInfo.pEngineName        = "No Engine";
appInfo.engineVersion      = VK_MAKE_API_VERSION(0, 1, 0, 0);
appInfo.apiVersion         = VK_API_VERSION_1_3;

Uint32 sdlCount = 0;
const char* const* sdlExtensions = SDL_Vulkan_GetInstanceExtensions(&sdlCount);
std::vector<const char*> extensions(sdlExtensions, sdlExtensions + sdlCount);
extensions.push_back(VK_EXT_DEBUG_UTILS_EXTENSION_NAME);

const char* layers[] = { "VK_LAYER_KHRONOS_validation" };

VkInstanceCreateInfo instanceInfo{};
instanceInfo.sType                   = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO;
instanceInfo.pApplicationInfo        = &appInfo;
instanceInfo.enabledExtensionCount   = static_cast<uint32_t>(extensions.size());
instanceInfo.ppEnabledExtensionNames = extensions.data();
instanceInfo.enabledLayerCount       = 1;
instanceInfo.ppEnabledLayerNames     = layers;

VkInstance instance;
VK_CHECK(vkCreateInstance(&instanceInfo, nullptr, &instance));
```

You'll see this shape in almost every Vulkan call. You fill a `CreateInfo` struct and pass it to a `vkCreate` function. Every struct starts with `sType`, which tells the driver what kind of struct it's reading. That matters because structs can be linked to each other through the `pNext` pointer, and the driver needs a way to know what is at the other end. The `{}` at the end of each declaration sets everything to zero, so `pNext` starts as null and the fields you don't set don't contain garbage.

`apiVersion` is the highest Vulkan version your program wants to use. I'm using 1.3, because every desktop GPU from the last several years supports it with current drivers.

The extensions SDL asks for are the ones needed to draw into a window. `VK_KHR_surface` is always one of them, and the second one depends on the platform, for example `VK_KHR_win32_surface` on Windows or `VK_KHR_wayland_surface` on Wayland. We add `VK_EXT_debug_utils` ourselves for the debug messenger in the next section. If you're on macOS, you also need `VK_KHR_portability_enumeration` and the `VK_INSTANCE_CREATE_ENUMERATE_PORTABILITY_BIT_KHR` flag, otherwise the loader won't show you the MoltenVK device.

## Validation layers

Vulkan drivers do very little error checking. They expect your calls to be correct, and if they aren't, the result is undefined behavior. Sometimes that means a crash, sometimes a black screen, and sometimes it works fine on your GPU and breaks on someone else's.

The validation layer sits between your program and the driver and checks every call against the spec. When something is wrong, it tells you what you did and which rule you broke. To be honest, I wouldn't write a single line of Vulkan without it. Just leave the layer and the debug extension out of release builds, because checking every call makes everything slower.

The layer needs a place to send its messages. That's what the debug messenger is for: a callback that gets every message the layer produces.

```cpp
static VKAPI_ATTR VkBool32 VKAPI_CALL debugCallback(
    VkDebugUtilsMessageSeverityFlagBitsEXT severity,
    VkDebugUtilsMessageTypeFlagsEXT type,
    const VkDebugUtilsMessengerCallbackDataEXT* data,
    void* userData)
{
    std::fprintf(stderr, "[vulkan] %s\n", data->pMessage);
    return VK_FALSE;
}
```

This function goes above `main`. Always return `VK_FALSE` from it. `VK_TRUE` is meant for people who develop layers, not for applications.

Creating the messenger is a bit different from the other calls. `vkCreateDebugUtilsMessengerEXT` belongs to an extension, so the loader doesn't export it like the core functions, and you have to ask the instance for its address first:

```cpp
VkDebugUtilsMessengerCreateInfoEXT debugInfo{};
debugInfo.sType           = VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT;
debugInfo.messageSeverity = VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT |
                            VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT;
debugInfo.messageType     = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT |
                            VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT |
                            VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT;
debugInfo.pfnUserCallback = debugCallback;

auto createMessenger = reinterpret_cast<PFN_vkCreateDebugUtilsMessengerEXT>(
    vkGetInstanceProcAddr(instance, "vkCreateDebugUtilsMessengerEXT"));

VkDebugUtilsMessengerEXT messenger;
VK_CHECK(createMessenger(instance, &debugInfo, nullptr, &messenger));
```

I only ask for warnings and errors. The layer can also send verbose and info messages, but those are mostly noise in the beginning.

One more thing: the messenger only exists after the instance exists, so it can't report problems inside `vkCreateInstance` or `vkDestroyInstance`. If you want those too, set `instanceInfo.pNext = &debugInfo;` before creating the instance. That's the `pNext` chain I mentioned earlier.

## The window surface

A `VkSurfaceKHR` is Vulkan's handle to the window we'll draw into. We don't present anything in this part, but we need the surface now, because when we pick a queue in the next sections we have to ask the GPU whether that queue can present to this window. SDL creates it for us. It returns a `bool` instead of a `VkResult`, so `VK_CHECK` doesn't work here:

```cpp
VkSurfaceKHR surface;
if (!SDL_Vulkan_CreateSurface(window, instance, nullptr, &surface)) {
    std::fprintf(stderr, "SDL_Vulkan_CreateSurface failed: %s\n", SDL_GetError());
    return 1;
}
```

## Physical devices

A physical device is a GPU that Vulkan can see. On a desktop that's usually one card, but a laptop with an integrated and a dedicated GPU shows both. On Linux you might also see lavapipe, Mesa's Vulkan implementation that runs on the CPU.

Getting the list uses a pattern you'll see everywhere in Vulkan, so it's worth learning once. You call the function twice. The first call gets only the count, then you make an array of that size, and the second call fills it:

```cpp
uint32_t gpuCount = 0;
vkEnumeratePhysicalDevices(instance, &gpuCount, nullptr);
std::vector<VkPhysicalDevice> gpus(gpuCount);
vkEnumeratePhysicalDevices(instance, &gpuCount, gpus.data());
```

Layers, extensions, queue families, surface formats and swapchain images all come back in exactly the same way.

A `VkPhysicalDevice` isn't something you create or destroy. It's a handle the instance gives you so you can ask questions about the GPU: its name and type, which Vulkan version it supports, its limits, its features and its queue families. We need the queue families before we can choose, so let's look at those first.

## Queue families

In Vulkan you don't call draw functions that run right away. You record commands into a command buffer and submit it to a queue, and the GPU works through the queue on its own. A GPU has several queues, and they're grouped into families. Every queue in a family can do the same kinds of work, which the family reports as flags: graphics, compute, transfer, and a few others.

Most desktop GPUs have one big family that can do everything, plus smaller ones for only compute or only transfer. This is what `vulkaninfo` shows for the RTX 4050 in my laptop:

| Family | Queues | What it can do |
|---|---|---|
| 0 | 16 | Graphics, compute, transfer |
| 1 | 2 | Transfer only |
| 2 | 8 | Compute and transfer |
| 3 | 1 | Video decode |
| 4 | 1 | Video encode |
| 5 | 1 | Optical flow (NVIDIA only) |

Family 0 can do everything, so that's the one we'll end up using. The transfer-only family usually maps to a separate copy engine on the GPU, which is useful later for uploading data while rendering. If you want to see what your own GPU has, run `vulkaninfo` from the SDK and look for `VkQueueFamilyProperties`.

For now we need two things: a family that can do graphics, and a family that can present to our surface. On almost every desktop GPU that's the same family, but the spec doesn't promise it, so we look for both and handle the case where they're different:

```cpp
struct QueueFamilies {
    std::optional<uint32_t> graphics;
    std::optional<uint32_t> present;

    bool complete() const { return graphics && present; }
};

QueueFamilies findQueueFamilies(VkPhysicalDevice gpu, VkSurfaceKHR surface)
{
    uint32_t count = 0;
    vkGetPhysicalDeviceQueueFamilyProperties(gpu, &count, nullptr);
    std::vector<VkQueueFamilyProperties> families(count);
    vkGetPhysicalDeviceQueueFamilyProperties(gpu, &count, families.data());

    QueueFamilies result;
    for (uint32_t i = 0; i < count; ++i) {
        bool graphics = families[i].queueFlags & VK_QUEUE_GRAPHICS_BIT;
        VkBool32 present = VK_FALSE;
        vkGetPhysicalDeviceSurfaceSupportKHR(gpu, i, surface, &present);

        // One family that does both is the best case.
        if (graphics && present) return { i, i };
        if (graphics && !result.graphics) result.graphics = i;
        if (present && !result.present) result.present = i;
    }
    return result;
}
```

## Choosing the GPU

Now we can pick one. A GPU is usable for this series if it supports Vulkan 1.3, has the queue families we need, and supports `VK_KHR_swapchain`, the device extension we'll use to show images in the window. If more than one GPU passes, we prefer a dedicated card over an integrated one.

The swapchain check uses the same call-twice pattern:

```cpp
bool supportsSwapchain(VkPhysicalDevice gpu)
{
    uint32_t count = 0;
    vkEnumerateDeviceExtensionProperties(gpu, nullptr, &count, nullptr);
    std::vector<VkExtensionProperties> extensions(count);
    vkEnumerateDeviceExtensionProperties(gpu, nullptr, &count, extensions.data());

    for (const VkExtensionProperties& ext : extensions) {
        if (std::strcmp(ext.extensionName, VK_KHR_SWAPCHAIN_EXTENSION_NAME) == 0)
            return true;
    }
    return false;
}

VkPhysicalDevice pickGpu(const std::vector<VkPhysicalDevice>& gpus, VkSurfaceKHR surface)
{
    VkPhysicalDevice best = VK_NULL_HANDLE;
    for (VkPhysicalDevice gpu : gpus) {
        VkPhysicalDeviceProperties props;
        vkGetPhysicalDeviceProperties(gpu, &props);

        if (props.apiVersion < VK_API_VERSION_1_3) continue;
        if (!findQueueFamilies(gpu, surface).complete()) continue;
        if (!supportsSwapchain(gpu)) continue;

        best = gpu;
        if (props.deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU) break;
    }
    return best;
}
```

Both functions go above `main`, under `findQueueFamilies`. Back in `main`, we pick the GPU and print its name, so you can see which one Vulkan chose:

```cpp
VkPhysicalDevice gpu = pickGpu(gpus, surface);
if (gpu == VK_NULL_HANDLE) {
    std::fprintf(stderr, "No GPU with Vulkan 1.3 and a swapchain\n");
    return 1;
}

VkPhysicalDeviceProperties props;
vkGetPhysicalDeviceProperties(gpu, &props);
std::printf("Using %s\n", props.deviceName);
```

## The logical device

The physical device is the GPU. The logical device, `VkDevice`, is your program's connection to it, and you'll use it for almost everything from now on. Buffers, images, pipelines and command buffers are all created from the device, not from the instance.

When you create it, you tell Vulkan which queues you want, which device extensions you need, and which optional features you want to turn on:

```cpp
QueueFamilies families = findQueueFamilies(gpu, surface);
std::set<uint32_t> uniqueFamilies = { *families.graphics, *families.present };

float priority = 1.0f;
std::vector<VkDeviceQueueCreateInfo> queueInfos;
for (uint32_t family : uniqueFamilies) {
    VkDeviceQueueCreateInfo info{};
    info.sType            = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO;
    info.queueFamilyIndex = family;
    info.queueCount       = 1;
    info.pQueuePriorities = &priority;
    queueInfos.push_back(info);
}

const char* deviceExtensions[] = { VK_KHR_SWAPCHAIN_EXTENSION_NAME };

VkDeviceCreateInfo deviceInfo{};
deviceInfo.sType                   = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO;
deviceInfo.queueCreateInfoCount    = static_cast<uint32_t>(queueInfos.size());
deviceInfo.pQueueCreateInfos       = queueInfos.data();
deviceInfo.enabledExtensionCount   = 1;
deviceInfo.ppEnabledExtensionNames = deviceExtensions;

VkDevice device;
VK_CHECK(vkCreateDevice(gpu, &deviceInfo, nullptr, &device));
```

The `std::set` is there because each queue family can only appear once in `pQueueCreateInfos`. When graphics and present are the same family, which is almost always, we ask for one queue from it. Without the set we'd list the same family twice and the validation layer would complain.

The priority is a number between 0 and 1 that tells the driver which queues are more important when it schedules work between them. With one queue it doesn't change anything, but you still have to give it.

If you follow older tutorials, you'll see validation layers set on the device as well. That's deprecated. Device layers are ignored now, and the layer you turned on for the instance already covers the device.

Optional features are also turned on here. We don't need any yet, so I left them out. Later in the series we'll come back to this struct and add the ones we need through its `pNext` chain.

## Getting the queues

The queues are created together with the device, so you only need to ask for their handles:

```cpp
VkQueue graphicsQueue;
VkQueue presentQueue;
vkGetDeviceQueue(device, *families.graphics, 0, &graphicsQueue);
vkGetDeviceQueue(device, *families.present, 0, &presentQueue);
```

The `0` is the index of the queue inside its family. We asked for one queue per family, so it's always 0. When both families are the same, both variables get the same handle, and that's fine. You also never destroy queues yourself. They go away with the device.

## Cleaning up

Add an event loop that runs until you close the window, and then destroy everything in the reverse order you created it:

```cpp
bool running = true;
while (running) {
    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        if (event.type == SDL_EVENT_QUIT)
            running = false;
    }
}

vkDestroyDevice(device, nullptr);
SDL_Vulkan_DestroySurface(instance, surface, nullptr);

auto destroyMessenger = reinterpret_cast<PFN_vkDestroyDebugUtilsMessengerEXT>(
    vkGetInstanceProcAddr(instance, "vkDestroyDebugUtilsMessengerEXT"));
destroyMessenger(instance, messenger, nullptr);

vkDestroyInstance(instance, nullptr);
SDL_DestroyWindow(window);
SDL_Quit();
```

The device goes before the instance because it was created from it, and the surface and the messenger belong to the instance too. SDL also wants the surface destroyed before the window it belongs to. If you get the order wrong, or forget to destroy something, the validation layer tells you which object is still alive when you destroy its parent. Actually, it's a good idea to break this on purpose once, just to see what the message looks like. When I removed the `SDL_Vulkan_DestroySurface` line, I got this:

```
Validation Error: [ VUID-vkDestroyInstance-instance-00629 ]
vkDestroyInstance(): VkInstance 0x5576a8815e70 has 1 leaked objects that have not been destroyed.
VkSurfaceKHR 0x20000000002
```

Most validation errors come with a VUID like this one. If you search for it in the spec, it takes you to the exact rule you broke.

## What we have now

If you run it, you get an empty window, one line with your GPU's name, and nothing else in the terminal. That's the correct result. Nothing from the validation layer means it didn't find anything wrong.

My laptop has two GPUs, an Intel Iris Xe and the RTX 4050, and Vulkan sees both. The program prints `Using NVIDIA GeForce RTX 4050 Laptop GPU`, so preferring the dedicated card works.

In the next part we'll create the swapchain. That's the set of images we render into and hand to the window, one after another. If you want to know what happens to those images after we give them away, and why there's more than one, [Your Monitor Reads Memory 60 Times a Second](/blog/pixels-framebuffers-and-scanout/) explains it from the hardware side.
