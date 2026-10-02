---
title: "C++26 Static Reflection: Replacing Your Macros for Good"
date: "2026-10-02"
category: "Systems"
tags: ["C++", "C++26", "Reflection", "Metaprogramming"]
excerpt: "My engine has a 247-case switch that turns key codes into strings. C++26 reflection deletes it. Every example here compiled on GCC 16, with measured costs."
---

My engine has a function called `Key_toString`. It's a switch statement with 247 cases. Every single one was typed by hand.

```cpp
inline std::string Key_toString(KEY_CODE key) {
    switch (key) {
        case KEY_CODE::KEY__UNKNOWN: return "Unknown";
        case KEY_CODE::KEY__A: return "a";
        case KEY_CODE::KEY__B: return "b";
        case KEY_CODE::KEY__C: return "c";
        // ...243 more of these
```

Add a key to the enum, forget the switch, and the compiler says nothing. You find out three weeks later when a log line prints `Unknown` and you spend twenty minutes convinced your input system is broken. Every event class in the same engine also carries an `EVENT_CLASS_TYPE(KeyPressed)` macro, plus a hand-written `ToString()` that types the class name again as a string literal, because the language had no way to ask a type what it's called.

That's the tax. Every C++ codebase I've worked in pays it somewhere. And as of C++26, you can finally stop.

## The macro tax, and why we kept paying it

C++ has never been able to answer basic questions about its own code. What are the members of this struct? What's this enumerator called as a string? Which fields did I tag as saveable? The compiler knows all of it. It just never let you ask.

So we built workarounds, and every one of them has a cost.

**X-macros.** You define the list once inside a macro and expand it several times with different meanings. It works, and it keeps the enum and the strings in sync. It also turns your header into something nobody can read, breaks your IDE's go-to-definition, and produces error messages that point at line 1 of a macro expansion.

**Hand-written tables.** My 247-case switch. Readable, debuggable, and silently wrong the moment someone adds an enumerator.

**Library tricks.** `magic_enum` gets enum names by parsing `__PRETTY_FUNCTION__` output, which is genuinely clever and genuinely a hack. It only scans a fixed value range by default, -128 to 127, so an enum with a value outside that range quietly falls off the edge.

**A whole second compiler.** This is the industrial-strength version. Unreal Engine's `UPROPERTY()` and `UCLASS()` aren't really macros doing the work, they're markers for the Unreal Header Tool, a separate program that parses your headers before the C++ compiler ever sees them and generates the reflection code. I've written about [building Unreal plugins](/blog/unreal-plugin-from-empty-folder), and the `.generated.h` include you're forced to put last in every header exists for exactly this reason. Epic built a code generator because the language couldn't do the job.

All four approaches exist for the same reason. Now the reason is gone.

## What actually landed in C++26

The ISO committee voted reflection into C++26 at the Sofia meeting in June 2025. The core is P2996, and it came with the pieces that make it usable: expansion statements (P1306), annotations (P3394), and `std::define_static_array` and friends (P3491). GCC 16.1 shipped it in April 2026 behind a flag. Every example in this post was compiled and run with GCC 16.2 on my machine. Clang 23 on the same machine doesn't compile any of it yet.

```bash
g++ -std=c++26 -freflection main.cpp
```

You need to learn three pieces of syntax. That's it.

| Syntax | Name | What it does |
|---|---|---|
| `^^T` | Reflection operator | Turns a type, enum, member, or function into a value of type `std::meta::info` you can inspect at compile time |
| `[:r:]` | Splice | Turns a reflection back into real code: a type, a value, a member access |
| `template for` | Expansion statement | A loop the compiler unrolls at compile time, one copy per element |

Everyone calls `^^` the cat-ears operator. You'll stop noticing it after an hour.

The mental model: `^^` goes from code to data, `[: :]` goes from data back to code, and everything in between is ordinary `consteval` C++ operating on `std::meta::info` values. No new metaprogramming dialect, no template recursion tricks. Just functions.

## Example 1: enum to string, in 9 lines

Here's the function that replaces my 247-case switch, and every other enum-to-string switch I'll ever write:

```cpp
#include <meta>
#include <string_view>

template <typename E>
    requires std::is_enum_v<E>
constexpr std::string_view enum_to_string(E value) {
    template for (constexpr auto e : std::define_static_array(std::meta::enumerators_of(^^E))) {
        if (value == [:e:])
            return std::meta::identifier_of(e);
    }
    return "<unknown>";
}

enum class Weapon { Pistol, Shotgun, Railgun };

static_assert(enum_to_string(Weapon::Railgun) == "Railgun");
```

Read it once slowly. `^^E` reflects the enum type. `enumerators_of` returns every enumerator as a reflection. `template for` stamps out one `if` per enumerator. `[:e:]` splices each reflection back into an actual enum value to compare against, and `identifier_of` hands you the name as a `std::string_view`.

Add a new weapon and the function updates itself. There's nothing to forget. And because it's `constexpr`, that `static_assert` runs at compile time, so you can test it without ever launching anything.

**Where you'll actually use it:**
- Logging and debug overlays that print enum values
- Editor dropdowns built straight from an enum
- Config files that store enums as readable strings instead of magic numbers

## Example 2: serialize any struct, no macros, no registration

This is the one that used to need a code generator. Hand it any aggregate and get JSON back:

```cpp
template <typename T>
std::string to_json(const T& obj) {
    std::string out = "{";
    bool first = true;
    constexpr auto ctx = std::meta::access_context::unchecked();
    template for (constexpr auto m : std::define_static_array(std::meta::nonstatic_data_members_of(^^T, ctx))) {
        if (!first) out += ", ";
        first = false;
        out += std::format("\"{}\": {}", std::meta::identifier_of(m), obj.[:m:]);
    }
    return out + "}";
}

struct PlayerState {
    int health;
    float stamina;
    int ammo;
};

// to_json(PlayerState{87, 0.42f, 12})
// {"health": 87, "stamina": 0.42, "ammo": 12}
```

No `REGISTER_FIELD(health)`. No `BOOST_DESCRIBE_STRUCT`. No generated file. The struct is just a struct, and the serializer works on every struct in the codebase, including ones written before the serializer existed.

`obj.[:m:]` is the line that would have been impossible before. It's a member access where the member is chosen at compile time from a reflection. The compiler expands it to `obj.health`, `obj.stamina`, `obj.ammo`, exactly as if you'd typed them.

**The access context matters, so pay attention to that `ctx` line.** `access_context::unchecked()` gives you every member, private ones included. `access_context::current()` only gives you what's accessible from where you're calling. I checked: on a class with one public and one private member, `current()` returns 1 member and `unchecked()` returns 2. A generic serializer that silently dumps private fields into a save file is a bug waiting to happen, so pick deliberately.

## Example 3: annotations, the part that replaces UPROPERTY

Reflecting members is half of what engines need. The other half is tagging them. This field gets saved, this one doesn't. This one shows in the editor under a different name. That's what `UPROPERTY(SaveGame)` and its cousins exist for.

C++26 annotations do it in the language:

```cpp
struct Transient {};
struct Rename { const char* name; };

struct PlayerState {
    int health;
    [[=Rename{std::define_static_string("stam")}]] float stamina;
    [[=Transient{}]] int frameCounter;
};
```

`[[=value]]` attaches any constant value to a declaration, and you can query it during reflection. Here's the serializer, now respecting both tags:

```cpp
template <typename T>
std::string to_json(const T& obj) {
    std::string out = "{";
    bool first = true;
    constexpr auto ctx = std::meta::access_context::unchecked();
    template for (constexpr auto m : std::define_static_array(std::meta::nonstatic_data_members_of(^^T, ctx))) {
        if constexpr (std::meta::annotations_of_with_type(m, ^^Transient).empty()) {
            constexpr auto renames = std::define_static_array(std::meta::annotations_of_with_type(m, ^^Rename));
            constexpr std::string_view key = renames.empty()
                ? std::meta::identifier_of(m)
                : std::string_view{std::meta::extract<Rename>(renames[0]).name};
            if (!first) out += ", ";
            first = false;
            out += std::format("\"{}\": {}", key, obj.[:m:]);
        }
    }
    return out + "}";
}

// to_json(PlayerState{87, 0.42f, 99999})
// {"health": 87, "stam": 0.42}
```

`frameCounter` is gone, `stamina` is written as `stam`, and all of that decision making happened at compile time. There's no runtime check for a tag that doesn't exist.

**The gotcha that got me:** my first version was `[[=Rename{"stam"}]]`, a plain string literal. GCC rejected it:

```text
error: call to consteval function 'std::meta::extract<Rename>(...)' is not a constant expression
error: uncaught exception of type 'std::meta::exception'; 'what()': 'reflect_constant failed'
```

A pointer to a string literal isn't a valid structural constant, so it can't make the round trip through reflection. `std::define_static_string` promotes the string to static storage that can. You'll hit this the first time you put a string in an annotation, so now you know.

## Back to my 247 cases

My engine's strings don't even match the enumerator names. `KEY__A` prints as `"a"`, `KEY__ESCAPE` should print as `"Esc"`. So plain `identifier_of` isn't enough on its own. Annotations work on enumerators too, so the fix is to label only the ones that need a custom name and let everything else fall back:

```cpp
struct Label { const char* text; };

template <typename E>
constexpr std::string_view to_label(E value) {
    template for (constexpr auto e : std::define_static_array(std::meta::enumerators_of(^^E))) {
        if (value == [:e:]) {
            constexpr auto labels = std::define_static_array(std::meta::annotations_of_with_type(e, ^^Label));
            if constexpr (labels.empty())
                return std::meta::identifier_of(e);
            else
                return std::meta::extract<Label>(labels[0]).text;
        }
    }
    return "Unknown";
}

enum class KEY_CODE {
    KEY__UNKNOWN [[=Label{std::define_static_string("Unknown")}]],
    KEY__A       [[=Label{std::define_static_string("a")}]],
    KEY__ESCAPE  [[=Label{std::define_static_string("Esc")}]],
    KEY__F1,
};

static_assert(to_label(KEY_CODE::KEY__A) == "a");
// to_label(KEY_CODE::KEY__F1) == "KEY__F1", no label, falls back to the name
```

The name now lives right next to the enumerator it describes. There's no second list to keep in sync. Delete a key and its label goes with it.

## "But what does it cost?"

This is the first question every engine programmer asks, and the answer usually given is "zero cost abstraction," which is a slogan, not a measurement. So I measured.

Test case: an enum with 500 enumerators, converted to a string two ways. One uses a classic X-macro that generates a 500-case switch. The other uses the reflection function from Example 1. Same flags, `-O2`, best of 12 interleaved runs to keep background noise out of it.

| What's being compiled | Compile time |
|---|---|
| `<string_view>` header alone | 190 ms |
| X-macro version, 500 enumerators | 264 ms |
| `<meta>` header alone | 272 ms |
| Reflection version, 500 enumerators | 349 ms |

Look at the deltas, not the totals. The X-macro work costs **74 ms** on top of its header. The reflection work costs **77 ms** on top of its header. For the actual job, they're the same.

The real cost is the `<meta>` header itself, roughly **82 ms** more than `<string_view>`, paid once per translation unit that includes it. If you include it in a header that 400 files pull in, you'll feel that. Put your reflection utilities behind a header that only the files using them include, or put them in a module, and it stops mattering.

Runtime is where it gets good. I disassembled both object files. The reflection version is 500 sequential `if` statements in the source, which sounds slow. GCC compiled it into **the exact same jump table** as the hand-written switch: same bounds check, same indirect jump through a table. And the reflection object file came out about 15% smaller in `.text`, 11,056 bytes against 13,017.

That's what zero cost should mean. Not a promise. A disassembly.

## What reflection still can't do

I'm not going to pretend macros are dead. Some jobs stay with the preprocessor:

- **Conditional compilation.** `#ifdef _WIN32` and friends. Reflection works on code that exists, it can't decide what code exists per platform.
- **Generating new functions with new names.** C++26 reflection can read your code and even define new aggregate types, but it can't inject arbitrary new member functions with names you build from strings. The proposals for that kind of code injection didn't make C++26. If your macro stamps out a `GetHealth()`/`SetHealth()` pair per field, it's staying a macro for now.
- **Include guards.** Use `#pragma once` and move on.

And a couple of practical warnings. It's behind `-freflection` on GCC, which tells you how the compiler team classifies its maturity. Errors from a broken `consteval` chain are better than template errors but they're still dense, as that `reflect_constant failed` message shows. And if your project also builds on MSVC or Clang, you can't ship any of this yet, so check every compiler you target before you rip anything out.

`__FILE__` and `__LINE__` logging macros, by the way, were already replaceable. `std::source_location` has been there since C++20.

## Should you switch now?

If you're GCC-only, yes, start today, on new code. Enum-to-string and struct serialization are the two places where the win is immediate and the risk is nearly zero, since a reflected `enum_to_string` sitting next to an old switch can be checked against it with a single `static_assert` loop before you delete anything.

If you ship on multiple compilers, start writing the reflection versions now behind `#if __cpp_impl_reflection` and keep the old code as the fallback. When your other compilers catch up, delete the fallback. Ironically, that `#if` is a macro, and it's the last one you'll need for this.

C++ spent forty years unable to answer "what's in this struct?" Whole code generators were built to work around that one gap. That's over now. The language can finally describe itself, and the 247-case switch in my engine is the first thing going in the bin.

If you want the bigger picture on why I still bet on this language for engine work, I wrote about [why C++ is still irreplaceable in game development](/blog/why-cpp-is-still-king).
