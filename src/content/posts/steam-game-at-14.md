---
title: "I Shipped a Steam Game at 14. Here's What the Code Looked Like."
date: "2026-08-12"
category: "Career"
tags: ["Game Dev", "C++"]
excerpt: "Endless Combat is still on Steam. The store page says co-op zombie survival. What it doesn't say is that the gameplay code was written by a teenager who thought header files were a suggestion."
---

In 2014 I joined Fatalitech Game Studios, a remote team of eight people making a co-op zombie survival game in Unreal Engine. I was fourteen. Two years later, Endless Combat shipped on Steam, where it still lives today. You can go buy it right now, which is either a recommendation or a warning depending on how the rest of this post lands.

People hear "shipped a Steam game at 14" and picture a prodigy. Let me correct the record with evidence.

## The code, honestly

I recently went back through what I remember of that codebase, partly from old files and partly from scars. Highlights:

- There was a class that managed zombies, waves, scoring, sound, and at one point the settings menu. Its name was not GodClass, but it should have been.
- Everything happened in Tick. Zombie needs to check distance to player? Tick. Every frame. For every zombie. The optimization I later did that cut frame time by 18% was, in large part, making things not do that.
- I did not trust the garbage collector, the physics engine, or half of the standard library, mostly because I did not know they existed. I trusted global variables. Global variables were my friends.
- Naming conventions changed roughly every month, which functions as an accidental geological record. You can date any piece of the code by whether things are called `zombieHP`, `ZombieHealth`, or `zmb_hlth`.

None of this is self-deprecation for sport. This is what learning in production looks like when you're a kid with no senior around, and the internet's tutorials in 2014 were a YouTube video of a man breathing into a microphone for forty minutes.

## What shipping taught me that cleanliness couldn't

Here's the uncomfortable part for everyone who sorts their headers alphabetically: the game shipped. People bought it. Friends played it together and had fun in a thing I helped make. The spaghetti served actual dinner.

I learned more from that mess reaching real players than I would have from three years of writing beautiful code nobody ran. Specifically:

Shipping forces a definition of done. Before Steam, "done" meant I got bored. After, done meant a stranger in another country could install it, play it, and not refund it within two hours.

Performance problems are invisible until they aren't. On my PC everything ran fine. On the minimum spec machine of an actual customer, my Tick festival was a slideshow. That 18% frame time win wasn't cleverness, it was the first time I profiled anything, found the obvious crime, and stopped committing it.

And working with seven other people remotely, as a teenager, taught me that the hard part of software is rarely the software. It's writing a message that explains what you changed and why, at an hour when the other person is asleep in a different timezone.

## Would I recommend it

If a fourteen year old asked me whether they should join a real project instead of grinding tutorials: yes, immediately, and don't wait until you feel ready, because that feeling is not scheduled to arrive.

Your code will be terrible. Ship it anyway. The terribleness fades with every project; the shipped thing is permanent. Mine is still on Steam, ten years later, quietly holding the receipts of everything I didn't know. I'm honestly fond of it, the way you're fond of your worst school photo. That's me. That's where it started.
