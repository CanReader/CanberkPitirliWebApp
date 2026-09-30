---
title: "CMake for Game Developers Who Hate CMake"
date: "2025-12-13"
category: "Game Dev"
tags: ["C++", "CMake", "Tooling", "Tutorials"]
excerpt: "You don't need to like CMake. You need the 20% of it that makes C++ builds boring and reliable, and permission to ignore the rest. This is that 20%, learned from building an engine with it."
---

Nobody loves CMake. You learn CMake the way you learn tax law: reluctantly, under threat, and only the parts that apply to you. I've built SleakEngine and a pile of C++ projects with it, and the honest secret is that modern CMake is fine if you follow a few rules and treat everything written before 2018 as a hazard. Tutorials from the old era teach patterns that actively hurt you.

Here is the entire useful core.

## Rule one: targets, not variables

Old CMake was people mutating global variables like `CMAKE_CXX_FLAGS` and praying. Modern CMake has one idea worth learning: everything hangs off a target.

```cmake
add_library(engine_core STATIC ${CORE_SOURCES})
target_include_directories(engine_core PUBLIC include)
target_compile_features(engine_core PUBLIC cxx_std_23)
target_link_libraries(engine_core PRIVATE spdlog::spdlog)

add_executable(game ${GAME_SOURCES})
target_link_libraries(game PRIVATE engine_core)
```

Every property attaches to a specific target, and the magic word is the visibility keyword. PRIVATE: I use this, my consumers don't inherit it. PUBLIC: I use it and so does everyone linking me. INTERFACE: only my consumers get it. Get these right and dependencies flow through your project automatically; `game` up there gets `engine_core`'s include path and C++23 requirement without asking. Get them wrong, or use the ancient keyword-less form, and you're back to global soup where touching one flag rebuilds the universe and nobody knows why.

If you take a single thing from this post: never set a global when a `target_*` command exists. That's 60% of CMake competence in one sentence.

![How PUBLIC flows through the graph and PRIVATE doesn't](/images/CMakeVisibility.webp)

## Rule two: FetchContent ends the dependency saga

Third party libraries used to mean git submodules, vendored zip archives, or a wiki page titled "Setting Up Your Machine, 14 Steps". Modern answer:

```cmake
include(FetchContent)
FetchContent_Declare(glfw
  GIT_REPOSITORY https://github.com/glfw/glfw.git
  GIT_TAG 3.4)
FetchContent_MakeAvailable(glfw)
target_link_libraries(game PRIVATE glfw)
```

Clone, configure, build. On any machine, including CI, including your teammate's laptop, including yours after the reinstall. For bigger dependency graphs vcpkg or Conan earn their complexity, but FetchContent covers the typical game project with zero extra tooling, and pinning a tag means builds stay reproducible.

## Rule three: presets end the README incantations

The `CMakePresets.json` file replaces the folk knowledge of which flags to configure with:

```json
{
  "version": 6,
  "configurePresets": [
    { "name": "dev",  "generator": "Ninja",
      "binaryDir": "build/dev",
      "cacheVariables": { "CMAKE_BUILD_TYPE": "Debug" } },
    { "name": "ship", "generator": "Ninja",
      "binaryDir": "build/ship",
      "cacheVariables": { "CMAKE_BUILD_TYPE": "Release" } }
  ]
}
```

Now the entire onboarding document is `cmake --preset dev`. Your IDE reads the same file. CI reads the same file. When the flags change, they change in one place, instead of in six READMEs and one person's memory.

## The permitted ignorance list

Part of hating CMake less is knowing what you're allowed to skip. You do not need generator expressions beyond maybe `$<CONFIG:Debug>`. You do not need to write find modules. You do not need install rules or CPack until you ship an SDK to strangers. You especially do not need the macro metaprogramming you saw in that one repository; whoever wrote it is either a genius or being punished, and from outside you can't tell.

Targets with correct visibility, FetchContent with pinned tags, presets for the flags. That's the whole religion. It won't make you love CMake, but it will make your builds so boring you forget CMake exists, and boring is the highest compliment a build system can earn.
