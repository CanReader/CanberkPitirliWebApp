---
title: "Welcome to Computer Science"
date: "2026-10-03"
category: "Systems"
tags: ["Computer Science", "Foundations"]
excerpt: "The start of a new series: the parts of computer science I lean on every day, explained the way I wish someone had explained them to me. What it covers, who it's for, and why I'm writing it."
visible: false
---

Hi, and welcome.

This is the first post of a series I've wanted to write for a long time. It's about computer science, but not the version that lives in exam halls and interview prep. It's about the ideas running underneath every program you write, whether you think about them or not.

I want to start with something honest. I didn't learn most of this in the order a textbook teaches it. I learned it out of order, and mostly when something broke. A game that stuttered for no obvious reason. A crash that only showed up in release builds. A frame that was a few milliseconds too slow and wouldn't tell me why. Almost every time, the answer wasn't in the code I was staring at. It was one level below it: in how the data sat in memory, in what the operating system was doing behind my back, in an algorithm I'd picked without really thinking about it. One of those moments turned into the [occlusion culling post](/blog/occlusion-culling-20-percent-vr), where understanding what the machine was actually doing got a shipped VR game 20% of its frame back.

And every time I fixed one of those, I had the same thought: I wish I'd understood this earlier. Not because it's hard. Most of it isn't. It's just usually explained in one of two ways. Either too abstractly, as math with no machine attached, or too shallowly, as "just use a hash map". This series is my attempt at the middle. Real explanations, tied to real hardware, from someone who uses this every day to ship things.

## Who this is for

If you're just starting out, you're very welcome here. You don't need a degree, and you don't need to already know the vocabulary. I'll define things as we go, and nothing assumes you've seen it before. If a sentence makes you feel like you should already know something, that's my mistake, not yours.

If you're self-taught and already writing code, this might be the series for you most of all. You know how to make things work. This is about why they work, and why they sometimes don't.

And if you studied all this years ago, I hope you'll find a different angle on it. Fewer proofs, more "what does this actually cost on a real machine?"

## How it's organized

The series has six sections. You can read them in order, or jump to whatever you need right now.

**Introduction** is where you are. Next comes a short post on what computer science actually is, and a walk through everything that happens between writing code and seeing it run.

**The Data & Data Structures** starts at the very bottom: how numbers, text and everything else become bits, and then the shapes we arrange those bits into, from arrays to hash tables to graphs.

**Memory & Data Storage** is about where data lives, from registers and caches down to the disk, and why "where" matters as much as "what". This is the section I most wish I'd read early.

**Operating Systems** covers the program that runs your programs: processes, threads, virtual memory, and what really happens when two threads touch the same data.

**Networking** explains how two machines talk to each other, one layer at a time, ending with what changes when the other side is a game server across the world.

**Algorithms** is about how to think about problems: how to tell a fast solution from a slow one before you write it, and the handful of techniques that keep coming back.

The series page shows a difficulty level for each section, and it lists the parts I haven't written yet too, so you can always see where things are heading.

## A few promises

I'll keep it practical. Every idea should come with a reason you'd care about it.

I'll show things, not just describe them. Where it helps, there will be small interactive demos you can poke at, like the ones in the graphics series. Sometimes dragging a slider teaches more than a page of text.

And I won't pretend anything is obvious. If something took me a while to understand, I'll say so, and I'll try to explain it the way it finally made sense to me.

## One small request

Tell me when something isn't clear. There are reactions at the bottom of every post, and you can always reach me through the [contact form](/#contact). If a part loses you, that's something for me to fix, and I'd genuinely like to know.

That's it for the welcome. Next up is what computer science actually is, and what it isn't. I'm glad you're here.
