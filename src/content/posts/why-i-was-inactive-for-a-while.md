---
title: "Why I Was Inactive for a While"
date: "2026-08-06"
category: "Career"
tags: ["Freelance", "ViewCam", "Unreal Engine"]
excerpt: "The blog went quiet for three months and a few people actually checked if I was okay. I was okay. I was just buried under two jobs, a product launch, a Play Store approval, and a suitcase I need to pack for Japan. Let me explain."
featured: true
---

The last post on this blog is from May. Three months of silence. A couple of people actually messaged me to ask if everything was alright, which was sweet, and also slightly insulting, because apparently my baseline is "posts constantly about shadow mapping" and the moment I stop, people assume something broke.

Nothing broke. The opposite happened. So much shipped in these three months that when I sat down and listed it all out, I had to double-check the dates because it didn't seem physically possible. Inactive is the last word I'd use. I just made the classic developer mistake: I was so busy doing the things that I never wrote about the things.

So here's everything, in roughly the order it hit me.

## A Terrain Plugin for Ursa Majeur

In May I picked up a freelance contract with Ursa Majeur, an Istanbul based game studio. The brief sounded simple the way all dangerous briefs sound simple: build a procedural terrain generation plugin for Unreal Engine, in C++.

Terrain generation is one of those problems that looks like a solved textbook exercise. Slap some noise on a heightmap, add octaves, done, right? Then you try to ship it inside someone else's production pipeline and discover the textbook conveniently skipped every chapter that matters. The terrain can't just look good. It has to generate fast, regenerate deterministically from a seed, cooperate with the engine's tooling, and be usable by designers who see a C++ file and close the tab. If a designer needs me in the room to make a mountain, I have not built a tool, I have built a dependency on my calendar.

I'm happy to report the plugin is done and it works exactly as intended. Mountains appear where mountains should appear. Designers drag sliders and landscapes obey. It's going into an unannounced 3D roguelike the studio is building, which means I legally cannot show you a single screenshot, and yes, that is exactly as frustrating for me as it is for you. But seeing a system you built from scratch become the literal ground another team's game stands on is a special kind of satisfaction. I'm excited to see it in production, at which point I will absolutely be writing about it.

## Creatant

While the terrain work was in full swing, another door opened. Creatant reached out. And this is, without exaggeration, the most important opportunity I've ever gotten. I've shipped Steam games, won a contest, taught a few hundred students, and none of it made my phone shake in my hand the way that first conversation did.

Here's the part where I tell you all about what we're building. Except I won't, because I can't, and honestly there's something enjoyable about being the guy who says "I could tell you, but then I'd have to ask legal." What I can say: I joined as a fullstack software engineer, and after a decade of identifying as a C++ engine person, I now ship across the entire stack every single day. The morning-to-evening context switch is real. Before lunch I'm thinking in heightfields and cache lines. After dinner I'm in a production web platform wondering why a div is 3 pixels to the left. Both problems get the same brain. The brain is coping.

And one more thing: in September I'm going to Japan for Creatant. A serious chunk of these three months went into getting ready for that, which is its own part-time job. Documents, logistics, and a growing collection of browser tabs about how to not embarrass myself in a Japanese office. More on all of this when it happens.

## ViewCam Is Live on Google Play

Between the two jobs, because sleep is apparently negotiable, my own product shipped. ViewCam is finally released on the Google Play Store. Not "released" as in I uploaded an APK and walked away. Released as in production started, real users showed up, and I've been shipping new versions ever since.

ViewCam turns your phone into a wireless webcam, microphone, and speaker for your PC. The pitch writes itself: the phone in your pocket has a better camera than any webcam you'd reasonably buy, so why is it sitting in your pocket during meetings? The mobile app is Kotlin Multiplatform with a Compose UI, streaming H.264 over Wi-Fi or USB with automatic discovery, so you never type an IP address like it's 2009. On the desktop side there's a Qt 6 / C++17 receiver that decodes the stream and registers a native virtual camera: DirectShow on Windows, v4l2loopback on Linux. Meet, Zoom, OBS, Discord, they all just see a webcam and ask no questions.

Launching taught me the lesson every solo dev learns the hard way: release day is not the finish line, it's the starting gun. Since launch it's been performance passes, reconnection handling, quality settings, and reading user feedback with one eye closed. I'm working harder on ViewCam after release than I did before it, and weirdly, I'm enjoying it more. If you want to try it, it's at viewcam.tech.

## Brew Focus Is Approved

And because the universe decided this quarter needed one more thing: Brew Focus, my coffee-themed Pomodoro timer built with Tauri 2 and React, got approved by Google Play and is releasing soon. It started as a weekend project, became my daily driver for deep work sessions, and is now turning into a real product. There's a decent chance every feature in it was planned during a break that Brew Focus itself timed. The tool is building itself. I try not to think about it too hard.

## The Stack, or: An Identity Crisis in Twenty-Two Technologies

Someone asked me recently what I've been writing lately. I started answering, kept going, watched their face change, and kept going anyway.

The game side is the familiar territory: **C++** and **Unreal Engine** for the terrain plugin, **CMake** holding the builds together, and enough editor tooling that designers never have to see any of it.

ViewCam is its own small civilization. **Kotlin Multiplatform** and **Compose** on the mobile app, with some **Java** surviving in the corners like it always does. **CameraX** for capture, **H.264** encoding, **mDNS** for discovery so devices find each other like civilized machines. Then the desktop receiver: **C++17**, **Qt 6**, **QML** for the interface, **FFmpeg** doing the decoding, and **DirectShow** on Windows plus **v4l2loopback** on Linux convincing the OS that a webcam exists. There's a **Gradle** build on one side, **CMake** on the other, and an **Inno Setup** installer because Windows users deserve a Next button.

Brew Focus adds **Rust** and **Tauri 2** with a **React** and **TypeScript** front end, which means my Pomodoro timer has a memory-safe backend. Priorities.

And around all of that, the fullstack months piled on **TypeScript**, **React**, **Svelte**, **PostgreSQL**, **Docker**, and an amount of glue code between everything that I refuse to count as a technology, even though at this point it deserves its own name.

For years my answer to "what do you write" was two words: "C++, engines." That's still the core of who I am as an engineer, and nobody is taking manual memory management away from me. But shipping across this many layers in one stretch does something to how you see the boundaries. The web stack stopped being "that other world" and became just another set of constraints. A frame budget and a page load budget are the same conversation with different units.

## The Takeaway

Silence on a blog says nothing about output. My commit history from these three months is the loudest it has ever been, even if half the messages are "fix", "actual fix", and "fix for real this time".

Two studios trusted me with their work, and one of those turned into the biggest role of my career. One product is live on Google Play with real users. Another is approved and on the way. There's a flight to Japan on the horizon and a checklist that keeps growing.

I'm proud of this stretch. Genuinely, unashamedly proud. And now that I've remembered the blog exists, I have about six drafts worth of technical material from these months alone.

Back to writing.
