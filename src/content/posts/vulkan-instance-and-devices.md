---
title: "Vulkan from Scratch: Instance, Devices and Queues"
date: "2026-10-25"
category: "Graphics"
tags: ["Vulkan", "C++", "Tutorials"]
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
*"The impediment to action advances action. What stands in the way becomes the way."*\
**Marcus Aurelius**
:::

## Before we start

This series is for people who know C++ or at least any programming languages. You don't need to know any graphics programming 
stuffs already since we will start learning in here. If you already have some basic knowledge from other graphics APIs, I already 
wrote about that in [What Makes Vulkan Different from Every Other Graphics API](/blog/vulkan-vs-other-graphics-apis/).

We'll build a small Vulkan renderer from an empty folder, one piece of the API at a time, and every part will end with code that compiles and runs. This first part doesn't draw anything yet. We'll create the instance, turn on the validation layers, create a window surface, pick a GPU, and then create the logical device with the queues we'll send work to. Every Vulkan program starts with these steps, and almost everything you create later depends on them, so it's worth understanding them properly instead of copying them from somewhere.

All the code in this series is written in C++26, the newest version of C++. Compilers are still adding its features, so I only use the ones that already work, and I explain every newer feature the first time it shows up, so you don't need to know them already. That goes for the C++20 and C++23 parts too.

The diagram below shows every object we're going to make in this part, and what each one needs. Step through it once now, and come back to it whenever you get lost in the code.

```demo
vulkan-setup
```

## What you need

You need the [Vulkan SDK from LunarG](https://vulkan.lunarg.com/), [SDL3](https://libsdl.org/) for the window, CMake 3.25 or newer, and a compiler with C++26 support. I'm using GCC 16, because right now it's the only compiler with C++26 reflection, and I also tested everything with Clang 23. I haven't tried Visual Studio, and its C++26 support is behind, so on Windows I'd use GCC or Clang for this series. The Vulkan SDK is important, because it comes with the validation layers (on Linux, your distro's validation layers package works too). Without them, creating the instance with validation turned on fails with `VK_ERROR_LAYER_NOT_PRESENT`.

For SDL, make sure you get SDL3 and not SDL2, because the Vulkan functions changed between the two versions. I'm using SDL 3.4.18.

I use Vulkan's C API in this series, not `vulkan.hpp`. The spec, the validation messages and almost every example online use the C names, so it's better to learn those first. Once you know them, the C++ wrapper is easy to pick up. Everything around the Vulkan calls is modern C++26.

The CMake file is short:

```cmake
cmake_minimum_required(VERSION 3.25)
project(VulkanFromScratch CXX)

set(CMAKE_CXX_STANDARD 26)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Vulkan REQUIRED)
find_package(SDL3 REQUIRED CONFIG)

add_executable(app main.cpp)
target_link_libraries(app PRIVATE Vulkan::Vulkan SDL3::SDL3)

# C++26 reflection is still behind a flag in GCC 16.
target_compile_options(app PRIVATE $<$<CXX_COMPILER_ID:GNU>:-freflection>)
```

`CMAKE_CXX_STANDARD 26` asks for C++26, and CMake understands that value since version 3.25. `CMAKE_CXX_STANDARD_REQUIRED ON` makes CMake stop with an error if your compiler can't do it, instead of quietly falling back to an older version. `find_package` finds Vulkan and SDL3 on your machine, and `target_link_libraries` links both into our program.

The last line turns on reflection, which GCC 16 still keeps behind the `-freflection` flag. The `$<$<CXX_COMPILER_ID:GNU>:...>` part is a generator expression: it adds the flag only when the compiler is GCC, because other compilers don't know it.

## Error checking first

We start `main.cpp` with the includes, a function that turns enum values into their names, and two small functions that check for errors:

```cpp
// vulkan.h has to come before SDL_vulkan.h, so SDL uses the real Vulkan types.
#include <vulkan/vulkan.h>
#include <SDL3/SDL.h>
#include <SDL3/SDL_vulkan.h>

#include <algorithm>
#include <array>
#include <cstdint>
#include <cstdlib>
#include <expected>
#include <optional>
#include <print>
#include <ranges>
#include <set>
#include <source_location>
#include <span>
#include <string>
#include <string_view>
#include <type_traits>
#include <utility>
#include <vector>

#ifdef __cpp_impl_reflection
#include <meta>
#endif

// The name of an enum value, like "VK_ERROR_LAYER_NOT_PRESENT".
template <typename E>
    requires std::is_enum_v<E>
std::string enumName(E value)
{
#ifdef __cpp_impl_reflection
    template for (constexpr auto e : std::define_static_array(std::meta::enumerators_of(^^E))) {
        if (value == [:e:])
            return std::string{std::meta::identifier_of(e)};
    }
#endif
    return std::to_string(std::to_underlying(value));
}

void vkCheck(VkResult result, std::source_location where = std::source_location::current())
{
    if (result == VK_SUCCESS)
        return;
    std::println(stderr, "{}:{}: Vulkan call failed with {}", where.file_name(), where.line(), enumName(result));
    std::abort();
}

void sdlCheck(bool ok, std::source_location where = std::source_location::current())
{
    if (ok)
        return;
    std::println(stderr, "{}:{}: {}", where.file_name(), where.line(), SDL_GetError());
    std::abort();
}
```

Woow, okay. I know what you're going to say if you're new to modern C++: what the hell is this? Alright my friend, no worries. This is what C++26 looks like, so let's break it down line by line.

### The new `<meta>` header

```cpp
#ifdef __cpp_impl_reflection
#include <meta>
#endif
```

`<meta>` is a brand new header in C++26, and it has everything for reflection: the `std::meta::info` type and functions like `std::meta::enumerators_of` and `std::meta::identifier_of`, which we use in a second. Not every compiler supports reflection yet, so we include it only when we can use it. `__cpp_impl_reflection` is a feature test macro: the compiler defines it only when it supports reflection. So these three lines mean "if this compiler has reflection, include its header". GCC 16 defines it when you pass `-freflection`, which is exactly the flag our CMake file adds. Clang 23 doesn't define it, so it skips these lines.

### enumName, the C++26 part

```cpp
template <typename E>
    requires std::is_enum_v<E>
std::string enumName(E value)
```

This is a function template. `template <typename E>` means `E` can be any type, and the compiler fills it in when you call the function. When we call `enumName(result)` with a `VkResult`, `E` becomes `VkResult`. Later we call it with a `VkPhysicalDeviceType`, and the compiler makes a second version of the function where `E` is `VkPhysicalDeviceType`.

`requires std::is_enum_v<E>` is a constraint, and constraints came in C++20. It says `E` has to be an enum. If you try `enumName(42)`, the compiler stops and tells you the constraints are not satisfied, instead of giving you a long list of confusing errors from inside the function. The function returns a `std::string` with the name.

```cpp
template for (constexpr auto e : std::define_static_array(std::meta::enumerators_of(^^E))) {
```

This one line has four new things in it, so let's read it from the inside out.

`^^E` is the reflection operator. Two carets in front of a type give you a value that describes that type: its name, what's inside it, and so on. The type of that value is `std::meta::info`.

`std::meta::enumerators_of(^^E)` asks that description for all the values of the enum. For `VkResult` that's `VK_SUCCESS`, `VK_NOT_READY`, `VK_TIMEOUT` and all the others, in the order they're declared in `vulkan_core.h`. In the Vulkan headers on my machine, that's 62 names. It gives them back as a `std::vector`, but that vector only exists while the program is being compiled.

`std::define_static_array(...)` copies that list into an array that's baked into the program, so the loop can walk over it.

`template for` is called an expansion statement, and it's new in C++26 too. It looks like a normal `for` loop, but it isn't one. A normal loop runs the same code many times while the program runs. `template for` makes the compiler copy the body of the loop once for every element, while it compiles. That's why `e` can be `constexpr`: in every copy, it's a different constant that's known at compile time.

```cpp
if (value == [:e:])
    return std::string{std::meta::identifier_of(e)};
```

`[:e:]` is called a splice, and it does the opposite of `^^`. It turns the reflection back into the real thing it describes, here the actual enum value. So in the copy of the body made for `VK_ERROR_LAYER_NOT_PRESENT`, `[:e:]` simply is `VK_ERROR_LAYER_NOT_PRESENT`.

`std::meta::identifier_of(e)` gives you the name of that value as a `std::string_view`, and we turn it into a `std::string` to return it.

So for `VkResult`, once the compiler is done, the function is the same as if you had written this by hand:

```cpp
if (value == VK_SUCCESS) return "VK_SUCCESS";
if (value == VK_NOT_READY) return "VK_NOT_READY";
if (value == VK_TIMEOUT) return "VK_TIMEOUT";
// ... and one line for every other value in VkResult
```

Before reflection, that's exactly what people did: a giant `switch` or a table you had to keep up to date by hand, or a script that generated it. Now the compiler writes it for us, and it stays correct when a new Vulkan SDK adds new values. Some values also have an older second name, like `VK_ERROR_OUT_OF_POOL_MEMORY_KHR`, which is the same number as `VK_ERROR_OUT_OF_POOL_MEMORY`. The first match wins, and that's always the main name, because it's declared first. It's a lot of comparisons, but this code only runs after something has already failed, so the speed doesn't matter.

```cpp
#endif
    return std::to_string(std::to_underlying(value));
```

If the compiler has no reflection, everything between `#ifdef` and `#endif` disappears, and only this line is left. `std::to_underlying` came in C++23, and it turns an enum into the integer behind it. `std::to_string` turns that integer into text. So with Clang you get `-6` instead of a name. It's less friendly, but the program still works the same way.

### vkCheck

```cpp
void vkCheck(VkResult result, std::source_location where = std::source_location::current())
```

Almost every Vulkan function returns a `VkResult`. `VK_SUCCESS` means it worked, and a negative value is an error. `vkCheck` takes that result, plus a second parameter that you never pass yourself.

That second parameter is the clever part, and to see why, let's look at how this was done before C++20. C has two special macros, `__FILE__` and `__LINE__`. Wherever you write them, the preprocessor replaces them with the current file name and line number. So your first idea might be to use them inside a normal function:

```cpp
void badCheck(VkResult result)
{
    if (result != VK_SUCCESS)
        std::println(stderr, "{}:{}: failed", __FILE__, __LINE__);
}
```

This doesn't work the way you want. `__LINE__` is replaced with the line where it's written, which is inside `badCheck`. So no matter which Vulkan call failed, it always prints the same line number, the one in the middle of `badCheck`, and you have no idea which call it was.

That's why older Vulkan code, including a lot of tutorials, uses a macro instead of a function:

```cpp
#define VK_CHECK(x)                                                              \
    do {                                                                         \
        VkResult r = (x);                                                        \
        if (r != VK_SUCCESS) {                                                   \
            std::fprintf(stderr, "%s:%d: %s failed\n", __FILE__, __LINE__, #x);  \
            std::abort();                                                        \
        }                                                                        \
    } while (0)
```

A macro isn't called like a function. The preprocessor copies its text into every place you use it, before the compiler even sees the code. So when you write `VK_CHECK(vkCreateInstance(...));` on line 166, the whole block gets pasted onto line 166, and `__LINE__` becomes 166. It works, but it's ugly. You need the `do { ... } while (0)` trick so it behaves like one statement, a backslash at the end of every line, and because it's only copied text, the compiler can't check its types and debuggers can't step into it properly.

`std::source_location` gives us the same information in a normal function. `std::source_location::current()` works like `__FILE__` and `__LINE__` together, and the trick is that it's used as a default argument. Default arguments are filled in at the place where you call the function, not where the function is written. So when you write `vkCheck(vkCreateInstance(...))` on line 166, the compiler fills in `where` with line 166 of your file, just like the macro did, but without any macro. `where.file_name()` and `where.line()` read those values back. It can even tell you the function you were in, with `where.function_name()`.

The only thing the macro could do that we lose is `#x`, which turns the code inside the macro into text, so it could print the whole call that failed. We don't really miss it, because the line number takes you straight to that call anyway.

```cpp
if (result == VK_SUCCESS)
    return;
```

If everything is fine, we do nothing and go back.

```cpp
std::println(stderr, "{}:{}: Vulkan call failed with {}", where.file_name(), where.line(), enumName(result));
```

`std::println` came in C++23. The first argument, `stderr`, sends the text to the error output instead of the normal one. Then comes the text, where each `{}` is replaced by the next argument, in order: the file name, the line number, and the name of the error from `enumName`. It works with any type, so unlike `printf` there's no `%d` or `%s` to get wrong. It also adds a new line at the end for you, that's the "ln" in `println`.

```cpp
std::abort();
```

This stops the program immediately. If you run it in a debugger, the debugger stops right here, and one step up the call stack is the exact Vulkan call that failed.

### sdlCheck

```cpp
void sdlCheck(bool ok, std::source_location where = std::source_location::current())
```

The same idea for SDL. Most SDL3 functions return a `bool`, which is `true` when they worked. When something fails, `SDL_GetError()` gives you a message that explains what went wrong, so we print that instead of a number. The `std::source_location` trick works exactly the same way here.

### What it looks like when something fails

To see all of this working, I changed the layer name in our code to one that doesn't exist. With GCC 16, the program stops with:

```
main.cpp:166: Vulkan call failed with VK_ERROR_LAYER_NOT_PRESENT
```

And with Clang 23, which doesn't have reflection yet:

```
main.cpp:166: Vulkan call failed with -6
```

You can still look up -6 in `vulkan_core.h`, but I think you'll agree the first one is much nicer. And that's the whole error checking part! From now on, every Vulkan call that returns a `VkResult` goes inside `vkCheck`, and every SDL call that can fail goes inside `sdlCheck`.

## Opening the window

Now the start of `main`. Every snippet after this one goes inside `main`, in order, unless I say it goes above it:

```cpp
int main()
{
    sdlCheck(SDL_Init(SDL_INIT_VIDEO));

    SDL_Window* window = SDL_CreateWindow("Vulkan from Scratch", 1280, 720, SDL_WINDOW_VULKAN);
    sdlCheck(window != nullptr);

    // everything below goes here
}
```

`SDL_Init(SDL_INIT_VIDEO)` starts SDL's video system, which we need for windows. `SDL_CreateWindow` takes a title, a width, a height and some flags. The `SDL_WINDOW_VULKAN` flag tells SDL that we'll render into this window with Vulkan, so SDL loads the Vulkan loader when it creates the window. If there's no working Vulkan driver, this is where it fails. It returns a null pointer on failure, so that's what we check.

## The instance

The instance is the connection between your program and the Vulkan loader. The loader is the library you link against (`vulkan-1.dll` on Windows, `libvulkan.so.1` on Linux). It finds the drivers installed on the machine and sends your calls to the right one. You can't do anything in Vulkan before you have an instance.

To create it, you tell Vulkan two things: which version of the API your program is written for, and which instance extensions and layers you want.

```cpp
const VkApplicationInfo appInfo{
    .sType              = VK_STRUCTURE_TYPE_APPLICATION_INFO,
    .pApplicationName   = "Vulkan from Scratch",
    .applicationVersion = VK_MAKE_API_VERSION(0, 1, 0, 0),
    .pEngineName        = "No Engine",
    .engineVersion      = VK_MAKE_API_VERSION(0, 1, 0, 0),
    .apiVersion         = VK_API_VERSION_1_3,
};

Uint32 sdlCount = 0;
const char* const* sdlExtensions = SDL_Vulkan_GetInstanceExtensions(&sdlCount);
sdlCheck(sdlExtensions != nullptr);

const auto extensions = std::views::concat(std::span(sdlExtensions, sdlCount),
                                           std::array{VK_EXT_DEBUG_UTILS_EXTENSION_NAME})
                      | std::ranges::to<std::vector>();

constexpr std::array layers = { "VK_LAYER_KHRONOS_validation" };

const VkInstanceCreateInfo instanceInfo{
    .sType                   = VK_STRUCTURE_TYPE_INSTANCE_CREATE_INFO,
    .pApplicationInfo        = &appInfo,
    .enabledLayerCount       = static_cast<std::uint32_t>(layers.size()),
    .ppEnabledLayerNames     = layers.data(),
    .enabledExtensionCount   = static_cast<std::uint32_t>(extensions.size()),
    .ppEnabledExtensionNames = extensions.data(),
};

VkInstance instance = VK_NULL_HANDLE;
vkCheck(vkCreateInstance(&instanceInfo, nullptr, &instance));
```

You'll see this shape in almost every Vulkan call. You fill a `CreateInfo` struct and pass it to a `vkCreate` function, which writes the new handle into its last argument. `VK_NULL_HANDLE` is Vulkan's "no object" value. I start every handle with it, so a handle never holds garbage.

Every Vulkan struct starts with `sType`, which tells the driver what kind of struct it's reading. That matters because structs can be linked to each other through a `pNext` pointer, and the driver needs a way to know what's at the other end.

The `.name = value` syntax is called designated initializers, and it came in C++20. To be honest, it's the nicest way to fill Vulkan structs. You can see which field gets which value, and every field you don't name is set to zero, so `pNext` is null and `flags` is 0 without writing them. The only rule is that the fields have to appear in the same order as they do in the struct. If you compile with `-Wextra`, GCC and Clang warn about the fields you skip, even though skipping them is fine. `-Wno-missing-field-initializers` turns that warning off.

`apiVersion` is the highest Vulkan version your program wants to use. I'm using 1.3, because every desktop GPU from the last several years supports it with current drivers.

`SDL_Vulkan_GetInstanceExtensions` gives us the instance extensions SDL needs to draw into a window, as a pointer and a count. `VK_KHR_surface` is always one of them, and the second one depends on the platform, for example `VK_KHR_win32_surface` on Windows or `VK_KHR_wayland_surface` on Wayland. We also need `VK_EXT_debug_utils` for the debug messenger in the next section, so we build one list with all of them. `std::span` (C++20) wraps SDL's pointer and count into one range. `std::views::concat` is new in C++26, and it joins several ranges into one, here SDL's extensions followed by a small array with our own. Then `std::ranges::to` (C++23) collects the result into a `std::vector`. You don't even have to write the element type, the compiler works it out. Since we never change the list after that, it can be `const`.

`std::array layers = { ... }` lets the compiler work out the type and the size from the values, so `layers` becomes a `std::array<const char*, 1>`. `.size()` and `.data()` give Vulkan the count and the pointer it asks for. The `static_cast` is needed because `.size()` returns a `size_t` and Vulkan wants a 32-bit count. Inside braces, the compiler refuses to shrink a number like that quietly, so we have to convert it ourselves.

If you're on macOS, you also need `VK_KHR_portability_enumeration` and the `VK_INSTANCE_CREATE_ENUMERATE_PORTABILITY_BIT_KHR` flag, otherwise the loader won't show you the MoltenVK device.

## Validation layers

Vulkan drivers do very little error checking. They expect your calls to be correct, and if they aren't, the result is undefined behavior. Sometimes that means a crash, sometimes a black screen, and sometimes it works fine on your GPU and breaks on someone else's.

The validation layer sits between your program and the driver and checks every call against the spec. When something is wrong, it tells you what you did and which rule you broke. To be honest, I wouldn't write a single line of Vulkan without it. Just leave the layer and the debug extension out of release builds, because checking every call makes everything slower.

The layer needs a place to send its messages. That's what the debug messenger is for: a callback that gets every message the layer produces.

```cpp
static VKAPI_ATTR VkBool32 VKAPI_CALL debugCallback(
    VkDebugUtilsMessageSeverityFlagBitsEXT,
    VkDebugUtilsMessageTypeFlagsEXT,
    const VkDebugUtilsMessengerCallbackDataEXT* data,
    void*)
{
    std::println(stderr, "[vulkan] {}", data->pMessage);
    return VK_FALSE;
}
```

This function goes above `main`, under the two check functions. `VKAPI_ATTR` and `VKAPI_CALL` make sure it uses the calling convention Vulkan expects, which matters on some platforms like 32-bit Windows. We don't use the severity, the type and the user data yet, so those parameters have no names. That's also how you tell the compiler you're ignoring them on purpose, so it doesn't warn you. `data->pMessage` is the text of the message. Always return `VK_FALSE` from it. `VK_TRUE` is meant for people who develop layers, not for applications.

Creating the messenger is a bit different from the other calls. `vkCreateDebugUtilsMessengerEXT` belongs to an extension, so the loader doesn't export it like the core functions, and you have to ask the instance for its address first:

```cpp
const VkDebugUtilsMessengerCreateInfoEXT debugInfo{
    .sType           = VK_STRUCTURE_TYPE_DEBUG_UTILS_MESSENGER_CREATE_INFO_EXT,
    .messageSeverity = VK_DEBUG_UTILS_MESSAGE_SEVERITY_WARNING_BIT_EXT |
                       VK_DEBUG_UTILS_MESSAGE_SEVERITY_ERROR_BIT_EXT,
    .messageType     = VK_DEBUG_UTILS_MESSAGE_TYPE_GENERAL_BIT_EXT |
                       VK_DEBUG_UTILS_MESSAGE_TYPE_VALIDATION_BIT_EXT |
                       VK_DEBUG_UTILS_MESSAGE_TYPE_PERFORMANCE_BIT_EXT,
    .pfnUserCallback = debugCallback,
};

const auto createMessenger = reinterpret_cast<PFN_vkCreateDebugUtilsMessengerEXT>(
    vkGetInstanceProcAddr(instance, "vkCreateDebugUtilsMessengerEXT"));

VkDebugUtilsMessengerEXT messenger = VK_NULL_HANDLE;
vkCheck(createMessenger(instance, &debugInfo, nullptr, &messenger));
```

`messageSeverity` and `messageType` are bit flags, so we combine them with `|`. I only ask for warnings and errors. The layer can also send verbose and info messages, but those are mostly noise in the beginning.

`vkGetInstanceProcAddr` returns a generic function pointer. `reinterpret_cast` turns it into the real function type, `PFN_vkCreateDebugUtilsMessengerEXT`, which the Vulkan headers already define for us, and `auto` saves us from writing that long type twice.

One more thing: the messenger only exists after the instance exists, so it can't report problems inside `vkCreateInstance` or `vkDestroyInstance`. If you want those too, move `debugInfo` above `instanceInfo` and add `.pNext = &debugInfo,` right after `.sType` in `instanceInfo`. That's the `pNext` chain I mentioned earlier.

## The window surface

A `VkSurfaceKHR` is Vulkan's handle to the window we'll draw into. We don't present anything in this part, but we need the surface now, because when we pick a queue in the next sections we have to ask the GPU whether that queue can present to this window. SDL creates it for us from the window and the instance:

```cpp
VkSurfaceKHR surface = VK_NULL_HANDLE;
sdlCheck(SDL_Vulkan_CreateSurface(window, instance, nullptr, &surface));
```

It returns a `bool` like the other SDL functions, so we check it with `sdlCheck`. The `nullptr` is for a custom memory allocator, which we don't use. You've already seen the same `nullptr` in `vkCreateInstance`, and you'll see it in almost every create and destroy call.

## Physical devices

A physical device is a GPU that Vulkan can see. On a desktop that's usually one card, but a laptop with an integrated and a dedicated GPU shows both. On Linux you might also see lavapipe, Mesa's Vulkan implementation that runs on the CPU.

Getting the list uses a pattern you'll see everywhere in Vulkan. You call the function twice. The first call only gets the count, then you make an array of that size, and the second call fills it. Written out by hand, it looks like this:

```cpp
std::uint32_t count = 0;
vkEnumeratePhysicalDevices(instance, &count, nullptr);
std::vector<VkPhysicalDevice> gpus(count);
vkEnumeratePhysicalDevices(instance, &count, gpus.data());
```

Layers, extensions, queue families, surface formats and swapchain images all come back the same way, so instead of repeating these four lines everywhere, let's write them once as a template. This one goes above `main` too:

```cpp
template <typename T, typename Fn, typename... Args>
std::vector<T> enumerate(Fn fn, Args... args)
{
    std::uint32_t count = 0;
    fn(args..., &count, nullptr);
    std::vector<T> items(count);
    fn(args..., &count, items.data());
    return items;
}
```

`T` is the type of the items we want back, and `Fn` is the Vulkan function. `Args...` is a parameter pack, which means any number of extra arguments that go in front of the count, and `args...` expands them back out in the call. So `enumerate<VkPhysicalDevice>(vkEnumeratePhysicalDevices, instance)` runs exactly the four lines above. We only write `T` ourselves. The compiler works out `Fn` and `Args` from the arguments.

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

For now we need two things: a family that can do graphics, and a family that can present to our surface. On almost every desktop GPU that's the same family, but the spec doesn't promise it, so we look for both and handle the case where they're different. This goes above `main`:

```cpp
struct QueueFamilies {
    std::optional<std::uint32_t> graphics;
    std::optional<std::uint32_t> present;

    bool complete() const { return graphics && present; }
};

QueueFamilies findQueueFamilies(VkPhysicalDevice gpu, VkSurfaceKHR surface)
{
    const auto families = enumerate<VkQueueFamilyProperties>(vkGetPhysicalDeviceQueueFamilyProperties, gpu);

    QueueFamilies result;
    for (const auto [index, family] : std::views::enumerate(families)) {
        const auto i = static_cast<std::uint32_t>(index);
        const bool graphics = family.queueFlags & VK_QUEUE_GRAPHICS_BIT;
        VkBool32 present = VK_FALSE;
        vkGetPhysicalDeviceSurfaceSupportKHR(gpu, i, surface, &present);

        // One family that does both is the best case.
        if (graphics && present)
            return { i, i };
        if (graphics && !result.graphics) result.graphics = i;
        if (present && !result.present) result.present = i;
    }
    return result;
}
```

`std::optional` holds either a value or nothing, which is exactly what we need, because we might not find a family at all. In `complete()`, an optional counts as `true` when it holds a value.

`std::views::enumerate` came in C++23. It walks over a range and gives you the index together with each element, so you don't need a separate counter. `const auto [index, family]` splits each pair into two names, and that's called a structured binding. The index comes out as a signed number while Vulkan wants a `uint32_t`, so we convert it once at the top of the loop.

`family.queueFlags & VK_QUEUE_GRAPHICS_BIT` checks a single bit, and `vkGetPhysicalDeviceSurfaceSupportKHR` tells us whether this family can present to our surface. `return { i, i };` builds a `QueueFamilies` with both fields set to `i`.

## Choosing the GPU

Now we can pick one. A GPU is usable for this series if it supports Vulkan 1.3, has the queue families we need, and supports `VK_KHR_swapchain`, the device extension we'll use to show images in the window. If more than one GPU passes, we prefer a dedicated card over an integrated one. Both functions go above `main`, under `findQueueFamilies`:

```cpp
bool supportsSwapchain(VkPhysicalDevice gpu)
{
    const auto extensions = enumerate<VkExtensionProperties>(vkEnumerateDeviceExtensionProperties, gpu, nullptr);
    return std::ranges::contains(extensions, std::string_view{VK_KHR_SWAPCHAIN_EXTENSION_NAME},
                                 [](const VkExtensionProperties& ext) { return std::string_view{ext.extensionName}; });
}

std::expected<VkPhysicalDevice, std::string> pickGpu(VkInstance instance, VkSurfaceKHR surface)
{
    std::optional<VkPhysicalDevice> best;
    for (VkPhysicalDevice gpu : enumerate<VkPhysicalDevice>(vkEnumeratePhysicalDevices, instance)) {
        VkPhysicalDeviceProperties props;
        vkGetPhysicalDeviceProperties(gpu, &props);

        if (props.apiVersion < VK_API_VERSION_1_3) continue;
        if (!findQueueFamilies(gpu, surface).complete()) continue;
        if (!supportsSwapchain(gpu)) continue;

        best = gpu;
        if (props.deviceType == VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU) break;
    }

    if (!best)
        return std::unexpected("No GPU with Vulkan 1.3, a graphics queue and a swapchain");
    return *best;
}
```

`std::ranges::contains` is another C++23 addition, and it tells you whether a range contains a value. Extension names are stored as fixed-size `char` arrays, so `ext.extensionName == VK_KHR_SWAPCHAIN_EXTENSION_NAME` would compare two addresses, not the text. That's what the third argument is for. It's called a projection: a small lambda that turns each `VkExtensionProperties` into a `std::string_view` of its name before the comparison, and `std::string_view` compares the actual text.

`pickGpu` returns `std::expected`, which also came in C++23. It holds either the value we wanted, a `VkPhysicalDevice`, or an error, here a `std::string` that says why we couldn't find one. `return *best;` returns the GPU, and `return std::unexpected(...)` returns the error. This way `pickGpu` doesn't stop the program itself, and the caller decides what to do.

Inside, we go through every GPU the instance can see, using our `enumerate` template. `continue` skips the ones that don't have what we need. Every usable GPU replaces `best`, and as soon as we find a dedicated card we stop looking, so a dedicated card always wins over an integrated one.

Back in `main`, we call it and print the name of the GPU we got:

```cpp
const auto picked = pickGpu(instance, surface);
if (!picked) {
    std::println(stderr, "{}", picked.error());
    return EXIT_FAILURE;
}
VkPhysicalDevice gpu = *picked;

VkPhysicalDeviceProperties props;
vkGetPhysicalDeviceProperties(gpu, &props);
std::println("Using {} ({})", std::string_view{props.deviceName}, enumName(props.deviceType));
```

`if (!picked)` is true when it holds an error, and `picked.error()` gives us the message. Otherwise `*picked` is the GPU. `deviceName` is another fixed-size `char` array, so we wrap it in a `std::string_view` for `std::println` too. And since `deviceType` is an enum, our `enumName` from the beginning can print it for free. Reflection works on any enum, not only `VkResult`.

## The logical device

The physical device is the GPU. The logical device, `VkDevice`, is your program's connection to it, and you'll use it for almost everything from now on. Buffers, images, pipelines and command buffers are all created from the device, not from the instance.

When you create it, you tell Vulkan which queues you want, which device extensions you need, and which optional features you want to turn on:

```cpp
const QueueFamilies families = findQueueFamilies(gpu, surface);
const std::set uniqueFamilies = { *families.graphics, *families.present };

const float priority = 1.0f;
const auto queueInfos = uniqueFamilies
    | std::views::transform([&](std::uint32_t family) {
          return VkDeviceQueueCreateInfo{
              .sType            = VK_STRUCTURE_TYPE_DEVICE_QUEUE_CREATE_INFO,
              .queueFamilyIndex = family,
              .queueCount       = 1,
              .pQueuePriorities = &priority,
          };
      })
    | std::ranges::to<std::vector>();

constexpr std::array deviceExtensions = { VK_KHR_SWAPCHAIN_EXTENSION_NAME };

const VkDeviceCreateInfo deviceInfo{
    .sType                   = VK_STRUCTURE_TYPE_DEVICE_CREATE_INFO,
    .queueCreateInfoCount    = static_cast<std::uint32_t>(queueInfos.size()),
    .pQueueCreateInfos       = queueInfos.data(),
    .enabledExtensionCount   = static_cast<std::uint32_t>(deviceExtensions.size()),
    .ppEnabledExtensionNames = deviceExtensions.data(),
};

VkDevice device = VK_NULL_HANDLE;
vkCheck(vkCreateDevice(gpu, &deviceInfo, nullptr, &device));
```

`*families.graphics` takes the value out of the optional. That's safe here, because `pickGpu` only accepted a GPU where both families were found.

A `std::set` keeps each value only once, and that's why it's here. Each queue family can only appear once in `pQueueCreateInfos`. When graphics and present are the same family, which is almost always, the set ends up with one element and we ask for one queue from it. Without the set we'd list the same family twice and the validation layer would complain. Notice that we don't have to write `std::set<std::uint32_t>`, the compiler works it out from the values.

Then we turn every family in the set into a `VkDeviceQueueCreateInfo`. `std::views::transform` runs the lambda on each element, and `std::ranges::to<std::vector>()` collects the results into a vector again. The lambda captures `priority` by reference with `[&]`, because Vulkan gets a pointer to it, so it has to stay alive until `vkCreateDevice` has read it.

The priority is a number between 0 and 1 that tells the driver which queues are more important when it schedules work between them. With one queue it doesn't change anything, but you still have to give it.

If you follow older tutorials, you'll see validation layers set on the device as well. That's deprecated. Device layers are ignored now, and the layer you turned on for the instance already covers the device.

Optional features are also turned on here, with the `pEnabledFeatures` field and the `pNext` chain. We don't need any yet, so I left them out, and designated initializers set them to null for us. Later in the series we'll come back to this struct and add the ones we need.

## Getting the queues

The queues are created together with the device, so you only need to ask for their handles:

```cpp
VkQueue graphicsQueue = VK_NULL_HANDLE;
VkQueue presentQueue = VK_NULL_HANDLE;
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

const auto destroyMessenger = reinterpret_cast<PFN_vkDestroyDebugUtilsMessengerEXT>(
    vkGetInstanceProcAddr(instance, "vkDestroyDebugUtilsMessengerEXT"));
destroyMessenger(instance, messenger, nullptr);

vkDestroyInstance(instance, nullptr);
SDL_DestroyWindow(window);
SDL_Quit();
```

`SDL_PollEvent` fills `event` with the next event from the window and returns `false` when there are none left. `SDL_EVENT_QUIT` arrives when you close the window, and then the loop ends. Destroying the messenger is another extension function, so we look it up with `vkGetInstanceProcAddr` the same way we did for creating it.

The device goes before the instance because it was created from it, and the surface and the messenger belong to the instance too. SDL also wants the surface destroyed before the window it belongs to. If you get the order wrong, or forget to destroy something, the validation layer tells you which object is still alive when you destroy its parent. Actually, it's a good idea to break this on purpose once, just to see what the message looks like. When I removed the `SDL_Vulkan_DestroySurface` line, I got this:

```
Validation Error: [ VUID-vkDestroyInstance-instance-00629 ]
vkDestroyInstance(): VkInstance 0x5576a8815e70 has 1 leaked objects that have not been destroyed.
VkSurfaceKHR 0x20000000002
```

Most validation errors come with a VUID like this one. If you search for it in the spec, it takes you to the exact rule you broke.

## What we have now

If you run it, you get an empty window, one line with your GPU's name, and nothing else in the terminal. That's the correct result. Nothing from the validation layer means it didn't find anything wrong.

My laptop has two GPUs, an Intel Iris Xe and the RTX 4050, and Vulkan sees both. The program prints `Using NVIDIA GeForce RTX 4050 Laptop GPU (VK_PHYSICAL_DEVICE_TYPE_DISCRETE_GPU)`, so preferring the dedicated card works. Built with Clang, the type shows up as `2` instead, because there's no reflection there yet.

In the next part we'll create the swapchain. That's the set of images we render into and hand to the window, one after another. If you want to know what happens to those images after we give them away, and why there's more than one, [Your Monitor Reads Memory 60 Times a Second](/blog/pixels-framebuffers-and-scanout/) explains it from the hardware side.
