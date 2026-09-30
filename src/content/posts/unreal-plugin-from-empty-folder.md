---
title: "Building an Unreal Engine Plugin in C++, From Empty Folder to Distributable"
date: "2026-02-21"
category: "Game Dev"
tags: ["Unreal Engine", "C++", "Tooling", "Tutorials"]
excerpt: "Everything reusable I write for Unreal now starts life as a plugin, not a project. Here's the anatomy of one: modules, Build.cs, export macros, editor-only code, and the packaging step everyone gets wrong first."
---

At some point every Unreal developer writes something worth reusing, copies the folder into the next project, and creates a maintenance problem with a two year fuse. The fix is to build reusable code as a plugin from day one. It costs an hour of setup and pays for itself the first time a second project needs the thing.

Here's the whole anatomy, with the sharp edges labeled.

## The skeleton

A plugin is a folder in `Plugins/` with a `.uplugin` manifest and one or more modules:

```json
{
  "FileVersion": 3,
  "FriendlyName": "MyTools",
  "Version": 1,
  "Modules": [
    { "Name": "MyTools", "Type": "Runtime", "LoadingPhase": "Default" },
    { "Name": "MyToolsEditor", "Type": "Editor", "LoadingPhase": "PostEngineInit" }
  ]
}
```

Two modules, and this split is the single most important decision in the file. `Runtime` is what ships in the game. `Editor` is the tooling: details panel customizations, editor buttons, asset actions. Mix them into one module and your packaged build will fail late, at the worst time, with linker errors about UnrealEd, because editor modules simply do not exist in shipped games.

![The dependency rules in one picture. The dashed red arrow is the Friday linker error.](/images/PluginModules.webp)

## Build.cs, where dependencies live

Each module gets a `Build.cs` declaring what it uses:

```cpp
public class MyTools : ModuleRules
{
    public MyTools(ReadOnlyTargetRules Target) : base(Target)
    {
        PublicDependencyModuleNames.AddRange(new string[]
            { "Core", "CoreUObject", "Engine" });
        PrivateDependencyModuleNames.AddRange(new string[]
            { "Projects" });
    }
}
```

The Public versus Private distinction is not decoration. Public dependencies leak into everyone who depends on you; Private stays internal. Keep the public list minimal like you keep a header's includes minimal, and for the same reason: everything you expose becomes someone else's rebuild time.

The error you will meet first: unresolved external symbol for some engine class. Ninety percent of the time the fix is adding that class's module to this list. Learn to read which module owns a type from the docs header path, and `Build.cs` errors become five second fixes instead of forum expeditions.

## The export macro nobody explains

Classes and functions used from outside your module need the module API macro:

```cpp
class MYTOOLS_API FMyThing
{
public:
    void DoUsefulWork();
};
```

`MYTOOLS_API` expands to dllexport or dllimport depending on who's compiling. Forget it and everything works fine right up until another module calls your code, at which point the linker delivers the news. The macro name is always your module name, uppercased, plus `_API`. Unreal generates it; you just have to remember it exists.

## Packaging, the part everyone fails once

A plugin that compiles inside your project is not yet distributable. The real test:

```
RunUAT.bat BuildPlugin -Plugin="MyTools.uplugin" -Package="C:/Out/MyTools" -TargetPlatforms=Win64
```

This compiles your plugin against a clean engine, outside your project, exactly the way another team would consume it. It will find every sin: the editor include inside a runtime file that happened to work because of unity builds, the dependency you use but never declared because some other module dragged it in, the header that includes the world. Run it early, run it often. A plugin that has never survived BuildPlugin is a plugin that works on your machine, which is a sentence with a famous ending.

## Small habits that separate real plugins from folders with a manifest

Namespace your console variables and log categories with the plugin name, because in a real project there are forty plugins and grep is the debugger of last resort. Keep a tiny example map or test in the plugin so a stranger can verify it works in five minutes. Version the `.uplugin` honestly. None of this is glamorous. All of it is the difference between a tool other people adopt and a zip file you email around with instructions.
