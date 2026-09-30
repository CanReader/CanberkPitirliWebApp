---
title: "Why I Started Writing Rust"
date: "2025-09-14"
category: "Systems"
tags: ["Rust", "C++"]
excerpt: "I spent two years telling people Rust was solving a problem I didn't have. Then I used it on a real project and changed my mind faster than I expected."
---

I spent two years telling people Rust was solving a problem I didn't have. I wrote C++ for a living, ran ASAN on debug builds, kept smart pointers consistent, and hadn't shipped a use-after-free in a long time. The borrow checker felt like a compiler that didn't trust me.

Then I used it on an actual project, and my opinion shifted faster than I expected.

## What Actually Changed My Mind

It wasn't safety. That's what everyone leads with, but it's not what got me.

It was cargo. After years of C++ with CMake, vcpkg, Conan, custom build scripts, and FindPackage hell, running cargo add and having a dependency just work was a genuine shock. No linker flags to figure out. No ABI mismatch. No transitive header dependency that needs an obscure preprocessor define to compile correctly.

The toolchain ships complete. cargo fmt, cargo clippy, cargo test, cargo bench. In C++ each of those is a separate project you choose, configure, and fight to integrate. In Rust they're already there when you install the language.

That alone changed how fast I could start something.

## Then the Borrow Checker Started Helping

I said safety wasn't what convinced me. That's true. But once I was past the initial friction and writing real code, I stopped viewing the borrow checker as a nanny and started reading what it was actually telling me.

Every error it generates is a question: who owns this, when does this reference expire, is this safe to send across a thread? Those are questions I've been writing in code review for years. In C++ the answer is a comment and a convention. In Rust it's a compile error.

I caught a real ownership bug in a parser I was writing because the borrow checker refused to compile a pattern I hadn't thought through. In C++ I would have shipped it, it would have worked in testing, and surfaced under a specific input months later.

## Where C++ Is Still the Right Call

Unreal Engine is C++, full stop. SleakEngine is C++. When I'm writing code that calls into DX11, Vulkan, or any C ABI, C++ is what I reach for. The FFI boundary in Rust works, but it's not free, and for engine code in the hot path that matters.

Anything involving heavy SIMD, tight platform-specific intrinsics, or codebases with years of institutional investment stays in C++.

## Where I Use Rust Now

CLI tools, build tooling, language servers, anything I'd have previously written as a Python script but actually wanted to be fast. Network utilities where I want a single binary I can ship to a Linux server with no runtime dependencies. Parser and compiler work where the type system pays for itself.

The single static binary story is genuinely good. Cross-compile with CARGO_TARGET set and you get a Linux binary from your Windows machine in seconds. I've shipped tools that I built locally to servers I don't control and they ran first try.

## The Learning Curve

The first few weeks are harder than people admit. The borrow checker rejects things that feel correct, and you spend time on "why won't this compile" instead of "what am I building". Lifetime annotations look intimidating before they make sense.

After about a month of real use it clicked. The compiler errors are the most helpful I've seen in any language. They tell you exactly what's wrong and usually suggest the fix. That's the opposite of a C++ template error generating 200 lines of noise.

A year in, going back to C++ occasionally makes me miss having the compiler ask the ownership questions I'd otherwise hold in my head.
