---
title: "Welcome to Computer Science"
date: "2026-10-03"
category: "Systems"
tags: ["Computer Science", "Foundations"]
excerpt: "What computer science actually is, what it isn't, the big ideas that hold it together, and the many fields that grew out of it. The first post of a new series, written for anyone who wants to understand what's really going on under their code."
visible: false
---

Hi, and welcome.

This is the first post of a new series, and before we get into bits, memory and algorithms, I want to answer a question that sounds simple and isn't: what *is* computer science?

Most people, including a lot of people who write code for a living, would say it's programming. That's understandable, and it's also a bit like saying music is the piano. Programming is the instrument we use most. The field itself is about something bigger.

## A science of what can be computed, and how

At its heart, computer science asks three questions.

**What can be computed at all?** Some problems have no solution, not because we haven't found it yet, but because one provably cannot exist. That's a strange and beautiful idea, and it sits at the very foundation of the field.

**How efficiently can it be computed?** Two programs can give exactly the same answer while one finishes in a second and the other wouldn't finish before the sun burns out. Understanding why is a big part of what computer scientists do.

**How do we build systems that compute reliably?** Real machines have limited memory, fail in odd ways, run thousands of things at once and talk to other machines across the planet. Turning ideas into something that actually works on that hardware is its own deep problem.

The computer is the tool. Computation, the step by step transformation of information, is the subject. There's a line often credited to Edsger Dijkstra that computer science is no more about computers than astronomy is about telescopes. It overstates things a little (computer scientists care a lot about their telescopes), but it points in the right direction.

## Where it came from

The field is younger than you might expect. In the 1840s, Ada Lovelace wrote notes on Charles Babbage's Analytical Engine, a mechanical computer that was never finished, and described a step by step procedure for it to calculate a sequence of numbers. It's often called the first published program, written for a machine that didn't exist.

Almost a century later, in 1936, Alan Turing and Alonzo Church each answered the question "what does it mean to compute something?" Turing described an imaginary machine that reads and writes symbols on an endless tape, one step at a time. Church described a system built entirely from functions. They turned out to be equally powerful, and that gave us a precise definition of what a computation is. Turing also used his machine to prove that some questions can never be answered by any program, which is where the "what can be computed at all?" question comes from.

Real electronic computers followed in the 1940s, and with them the idea that the program could be stored in memory right next to the data, so a machine could be told to do something new without being rewired. Nearly every computer you've ever used still works that way. By the 1960s, universities had started opening computer science departments, and the field had a name.

## The big ideas

If you strip away the languages, frameworks and tools, a few ideas show up again and again. I find it helps to know them by name, because once you spot them you'll see them everywhere.

**Representation.** Everything a computer handles, numbers, text, images, sound, your bank balance, is stored as patterns of bits. Choosing how to represent something often matters more than any clever code you write afterwards.

**Abstraction.** No one can hold a whole computer in their head. So we build layers: transistors become logic gates, gates become a processor, the processor runs an operating system, the operating system runs your program. Each layer hides the details of the one below. Most of computer science is learning to work comfortably on one layer while knowing roughly what's happening underneath.

**Algorithms.** An algorithm is a precise, finite recipe for solving a problem. Precise enough that a machine with no common sense can follow it. Designing them, and proving they're correct and fast, is the core craft.

**Complexity.** How does the work grow as the input grows? An approach that's fine for a hundred items can fall apart at a million. Learning to ask this question before writing the code is one of the most useful habits in the field.

**Trade-offs.** Speed against memory. Simplicity against flexibility. Consistency against availability. Almost every real decision is a trade, and a big part of experience is knowing which side to pick for this problem.

## One field, many fields

Computer science has grown into a family of fields, and it helps to see the map:

- **Theory of computation** studies what can be computed and how hard problems really are.
- **Algorithms and data structures** design the methods and the ways of organizing data that everything else is built on.
- **Computer architecture** is about how processors and memory are actually built.
- **Operating systems** manage the hardware and let many programs share it safely.
- **Networking and distributed systems** deal with machines talking to each other, and with keeping things working when some of them fail.
- **Programming languages and compilers** design the languages we write in and translate them into something a processor understands.
- **Databases** store and find enormous amounts of data quickly and safely.
- **Security and cryptography** protect systems and information from people trying to break them.
- **Artificial intelligence and machine learning** build systems that learn from data instead of following hand-written rules.
- **Computer graphics** turns data into images, which is where I spend most of my working life.
- **Human computer interaction** studies how people actually use all of this.

They overlap constantly. A game engine, for example, touches almost every item on that list.

## What it isn't

A few common misunderstandings are worth clearing up early.

It isn't the same as software engineering. They're close cousins. Computer science is more about the ideas and what's possible. Software engineering is more about building and maintaining real software with real teams, deadlines and users. Most of us do both.

It isn't mostly math, though it uses math, especially logic and discrete math. Plenty of excellent programmers aren't math people, and the parts you need can be learned along the way.

And it isn't only for people who started coding at age ten. The ideas are learnable at any point. Many of them are surprisingly intuitive once someone explains them in the right order, with a real example in front of you.

## Why it's worth learning

You can write useful software without any of this, and lots of people do. But sooner or later you hit something you can't explain. A program that slows to a crawl as data grows. A bug that only appears when two things happen at once. A feature that works on your machine and nowhere else. The answer is almost never in the line of code you're staring at. It's one layer below.

That's been true for me again and again, building games and engines. One of those moments turned into the [occlusion culling post](/blog/occlusion-culling-20-percent-vr), where understanding what the machine was really doing got a shipped VR game 20% of its frame back. Computer science is what lets you see that layer below, and once you can, a lot of "magic" stops being magic.

## What this series will cover

The series follows the path I think makes the most sense, from the bottom up:

**The Data & Data Structures** starts with how everything becomes bits, then the shapes we arrange those bits in. **Memory & Data Storage** is about where data lives, from caches to disks, and why that matters so much. **Operating Systems** explains the program that runs your programs. **Networking** shows how machines talk, one layer at a time. **Algorithms** brings it together: how to think about problems and judge a solution before you write it.

Each post explains the idea, then ties it to what actually happens on a real machine, with small interactive demos where they help. You don't need a degree or any background to follow along. If something feels like you're supposed to already know it, that's my mistake, and I'd like to hear about it through the reactions at the bottom or the [contact form](/#contact).

Next up is a short history of computing, and after that, a walk through everything that happens between writing a line of code and seeing it run. I'm really glad you're here.
