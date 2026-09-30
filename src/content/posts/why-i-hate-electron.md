---
title: "Why I Hate Electron"
date: "2026-05-10"
category: "Performance"
tags: ["Electron", "Desktop"]
excerpt: "Electron ships 120MB of Chromium so your app can render a button. I've had enough of pretending this is acceptable."
---

I've been watching this happen for years and I'm done being polite about it. Electron is a bad technology choice that the industry has normalized because it's convenient for developers, and the people paying the price are users.

Every Electron app is a website wearing a coat and pretending to be software. I don't think that's a harsh take. I think it's an accurate one.

## What Electron Actually Is

Electron bundles Chromium and Node.js into every application that uses it. Not a shared system library, not a cached runtime the OS provides. A full copy of Chrome, per app, on your disk.

Open Discord. Open Slack. Open VS Code. Open Notion. That's four copies of Chrome sitting on your machine simultaneously. Each one eating memory. Each one with its own update cycle. Each one consuming CPU cycles to render text.

Discord on my machine right now: around 350MB on disk, 400MB+ RAM at idle. Idle. I haven't sent a message, I haven't loaded an image. The app is just sitting there, doing nothing, consuming half a gigabyte of memory. For a chat app.

Slack is similar. I know people who have disabled Slack's background activity entirely because it was measurably affecting the performance of other software on the same machine.

VS Code is the one exception I'll grant. Microsoft has invested enormous engineering effort into making VS Code fast, and it shows. It is genuinely a well-built piece of software. But VS Code is the exception that proves the rule. It required years of performance work by a dedicated team to make Electron acceptable for that use case. Most Electron apps are not VS Code. Most Electron apps are built by teams that don't have that capacity, don't prioritize it, and ship the defaults.

## Startup Time

Native apps start in milliseconds. Cold start for a well-written native utility: under 200ms. Often under 100ms. You click the icon and the window is there.

Electron apps take 2-3 seconds to start cold. Sometimes more. That delay is not your code. That delay is Chromium initializing, V8 warming up, Node bootstrapping. You could write the most optimized JavaScript in the world and you'd still wait for all of that before your first line runs.

This is a 2-3 second tax that every user pays, every time they open the app, every day. Multiply that by all the Electron apps on someone's machine. It adds up. Users notice. They just don't know why their computer feels slow.

## The IPC Architecture Is a Structural Tax

Electron has two processes: a main process running Node.js and a renderer process running in Chromium. They cannot share memory. They communicate through IPC, serialized messages passed between processes.

This is the fundamental design. It's not a configuration option you can tune. It's not a tradeoff you get to make per-feature. Every interaction between your app's system-level code and your UI goes through serialization and deserialization, across a process boundary, every single time.

Want to read a file when the user clicks a button? The renderer sends an IPC message to main. Main reads the file. Main serializes the result. Main sends it back. Renderer deserializes and updates the UI.

In any native framework that's: open file, read bytes, update UI. Three operations. In Electron those same three operations have four IPC round trips wrapped around them.

For anything that does real work: reading a directory tree, processing files, talking to a local database. This overhead accumulates into something users feel as sluggishness. The UI isn't blocked, technically. But the time between "user action" and "visible result" is longer than it needs to be by design.

## The Cross-Platform Promise Is Partly Fiction

The pitch is: write once, run on Windows, Mac, Linux. And it's technically true. The app runs. But "runs" and "feels native" are different things, and Electron apps rarely feel native on any platform.

Windows and macOS have different conventions for where settings live, how menu bars are structured, how system tray integration works, how notifications behave, how window chrome looks. Keyboard shortcuts that feel natural on one platform feel wrong on another. Right-click context menus have different norms. File picker dialogs have different behaviors.

If you actually want your app to feel right on each platform, you end up writing platform-specific code to handle all of this. Which is the work you were supposedly avoiding by choosing Electron.

You write the platform-specific code anyway. You just also shipped 120MB of Chromium on top of it.

## Security Surface

Chromium is a massive attack surface. It has a security team and a serious patch cadence, but it is also one of the most complex pieces of software in existence, and complex software has bugs.

Every Electron app ships its own Chromium version. When a Chromium security vulnerability is found, your app is vulnerable until you update your Electron dependency, rebuild, and ship a new release. If your release cadence is slow, or your auto-update is unreliable, your users are running a known-vulnerable version of Chrome as a core dependency of your app.

This is a real problem. It's not theoretical. There have been multiple exploits targeting Electron's node integration specifically, the fact that renderer-side JavaScript can, by default or misconfiguration, access Node.js APIs. That's a web app being handed the ability to access the filesystem, spawn processes, and make arbitrary system calls. The default Electron security settings have historically been loose on this.

## The Update Experience

Electron apps update themselves, but not through the OS's package manager or update infrastructure. Each app maintains its own update system. On macOS this means Squirrel. On Windows it's often Squirrel.Windows or something custom.

The result is that every Electron app on your machine is independently downloading, verifying, and installing its own updates on its own schedule. No coordination. No unified update UI. No differential patching. Most Electron updaters ship full binaries because diffing the Chromium bundle is genuinely difficult. A "minor update" to an Electron app can be 80-100MB because the Chromium version bumped.

That's 80MB per app per update. On a machine with five Electron apps, you're downloading 400MB+ of updates whenever there's a wave of dependency bumps.

## Why Developers Keep Choosing It

I understand why. I actually do.

Web developers significantly outnumber native developers. JavaScript skills are widely distributed. The npm ecosystem is enormous. If you need any functionality at all, there's a package for it. The tooling around web development (React DevTools, hot reload, browser-based debugging) is genuinely excellent.

If your team knows JavaScript and not C++, not Swift, not Python with Qt bindings, then Electron means you can ship a desktop app without retraining anyone. That's a real business consideration.

The hiring pool is also much larger. You can hire a React developer and they can contribute to an Electron app with minimal ramp-up. You can't do that with a C++ or Qt codebase.

These are legitimate reasons. I'm not pretending they don't exist.

But they are reasons of developer convenience, not user benefit. And at some point someone has to say that out loud.

## What Actually Works

Tauri solves most of the technical problems with Electron while keeping the web tech stack for the UI. Instead of bundling Chromium, Tauri uses the OS's native WebView: WKWebView on macOS, WebView2 on Windows, WebKitGTK on Linux. The installer for a Tauri app is typically 5-10MB instead of 80-120MB. Memory usage is a fraction of Electron's. Startup is fast.

You still write your UI in JavaScript/TypeScript. You still use React or Vue or Svelte or whatever framework the team knows. You get Rust on the backend for anything system-facing, which has its own learning curve, but the payoff in performance and safety is real. For new projects where web tech makes sense for the UI, Tauri is strictly better than Electron and I don't see a strong counter-argument.

Qt is the other answer. It's been the answer for native cross-platform desktop software for decades. The licensing has changed over the years in ways that made the commercial tiers annoying, but Qt 6 open source is production-capable for most use cases. The learning curve is real. The C++ requirement means your hiring pool is narrower. But you get genuine native performance, actual OS integration, and an application that respects the machine it's running on.

For smaller tools and utilities, native Win32, Cocoa, or a minimal framework like Dear ImGui with a windowing layer is often the right call. The binary is tiny, the startup is instant, and the overhead is zero.

## The Part That Bothers Me Most

Software has gotten slower over the last decade at a rate that has nothing to do with what software is being asked to do. Computers are faster. Storage is faster. RAM is faster. And yet applications feel slower, heavier, and more resource-intensive than they did ten years ago.

Electron is part of that story. Not all of it, web-based architecture at the application layer is a broader trend, but a significant part. We've taken the performance wins from hardware improvements and spent them on developer convenience, and then shipped that to users as if it were progress.

A chat app should not need 400MB of RAM. An email client should not take three seconds to open. A note-taking app should not spin up three processes on launch.

These are choices. Bad ones. And the fact that they've become industry standard doesn't make them good choices. It just makes them normal ones.

I'll take weird and native over normal and bloated.
