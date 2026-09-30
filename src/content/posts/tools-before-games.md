---
title: "Why I Write Tools Before I Write Games"
date: "2024-10-15"
category: "Game Dev"
tags: ["Tools"]
excerpt: "The first thing I do on any new game project is not build the game. It's build the tools I'll use to build the game. Three shipped titles later, I'm more convinced this is correct than when I started."
---

The first thing I do on any new game project is not build the game. It's build the tools I'll use to build the game. This sounds like procrastination disguised as engineering. People have told me as much.

Three shipped titles later, I'm more convinced it's correct than I was when I started doing it.

## The Trap of Starting With the Game

When you start with the game, your iteration loop looks like this: change something in code, recompile, launch, navigate to the part of the game where the change matters, observe, decide if it's right, repeat.

If your recompile takes 30 seconds and your "navigate to the right part" takes 60 seconds, every iteration costs you 90 seconds. You'll make hundreds of changes during a project. That's hours of waiting per week, easily.

The trap is that those 90 seconds feel cheap each time. You don't notice them. You're "working". You're "iterating". Look at it across a project and you've spent multiple weeks on launch-and-navigate time.

Tools collapse that loop. A level editor that lets you tweak values and see results instantly is not a luxury. It's the difference between iterating once a minute and iterating ten times a minute. Across a year, that's the difference between a good game and a great one.

## What I Mean by Tools

Specific examples from things I've shipped.

For The Stranger, I built a level scripting tool that let our designers place trigger volumes and write simple state machines without writing C++. Before this tool, every encounter design required an engineer to implement it. After the tool, designers could prototype encounters end-to-end and engineers got involved only for things the tool couldn't express.

For Endless Combat, I built a wave editor that let us tune zombie spawn patterns by dragging timeline blocks. Tuning waves was previously a code change followed by a build. Afterward, it was real-time. We tuned three months of wave content in two weeks.

For SleakEngine, I built an asset cooker that watches the source asset directory and automatically reimports anything that changes. Before this, every texture change required manually running a tool. After, the engine just sees the new asset.

None of these tools are products. They're specific to the project they were built for. They collectively saved us thousands of hours.

## The Counterargument

The argument against tools-first is that you're optimizing for iteration speed before you know what you'll be iterating on. You build a level editor optimized for the kind of levels you imagine, then you discover the actual game wants something different, and your tool is solving the wrong problem.

This is real. I've done it. The first version of the wave editor for Endless Combat was wrong because we hadn't actually figured out what made waves fun yet, and the tool encoded assumptions that turned out to be limitations.

The fix is to build tools incrementally. The first version of any tool should be the simplest thing that helps. A spreadsheet that reads into the game. A JSON file that hot-reloads. A command-line script that does one specific thing. As you learn what you need, the tool grows. The mistake is building a complete tool upfront before you know what the game actually wants.

## How I Actually Do It

The first week of any project, I write three tools, in order.

A hot-reloader for game data. Whatever your game's content is (levels, enemies, items, dialogue), it should live in files the game can re-read at runtime without restarting. The day I get hot reloading working, the rest of development gets faster.

A scratch tweaker UI. Any value the designer might want to change ends up in a debug menu (I use ImGui for this) where it can be adjusted at runtime. The first time you tune a difficulty curve interactively instead of through file edit, recompile, restart, you understand why this is essential.

A logging and replay system. The ability to record a play session and replay it deterministically is the foundation of every other debugging tool. Bug reports become reproducible. Performance regressions become measurable. AI behavior issues become visible.

Three tools, maybe a week of work depending on the engine. Every project I've built that started with these has shipped faster than projects that didn't. I'm not aware of an exception in my experience.

## The Studio Lesson

At Reality Arts I learned something deeper. The studios that ship reliably have engineers dedicated to tools, not to gameplay or rendering. The output of a good tools engineer is the productivity of every other person on the team.

If your tools engineer makes the level designer 30% faster, and you have eight level designers, that engineer's work is functionally producing the output of 2.4 designers. This math compounds. A studio with strong internal tooling outproduces a studio with weak tooling at every level of staffing.

The reason most indie studios don't think this way is that they don't have the headcount to assign someone to tools. Fair. But you can still do this if you're working alone. You can be your own tools engineer for the first week of every project. The discipline is recognizing that it's a different mode of work, and a productive one, even when nothing visible to a player has been built yet.

## When It's the Wrong Call

Game jams. If you have 48 hours, build the game. Tools take time you don't have.

Very small prototypes. If you're testing whether a single mechanic is fun, you can probably get away with hardcoded values and a quick rebuild. Tools are overkill for proving a single idea.

Engines you don't own. If you're working in Unreal or Unity, you have most of the tools already. Your job is to extend them when needed, not build a new editor.

Anywhere else, in my experience, tools first wins.
