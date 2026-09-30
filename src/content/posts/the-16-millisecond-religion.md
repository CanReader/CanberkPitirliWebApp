---
title: "The 16.6 Millisecond Religion"
date: "2026-08-17"
category: "Performance"
tags: ["Game Dev", "Frame Budget"]
excerpt: "Game developers live under a law most of the software industry has never felt: 16.6 milliseconds, every frame, forever. Here's what that discipline looks like from inside, and what happened to the software that never had it."
---

There's a number tattooed on the brain of every game developer: 16.6. That's how many milliseconds you get to simulate and draw an entire world if you want 60 frames per second. Physics, AI, animation, audio, rendering, everything, inside a budget shorter than a camera flash. Miss it and a human being feels the stutter in their hands. There is no spinner to show. There is no "loading" state for a frame. You make the deadline or you are, measurably, worse.

I've lived under that number my whole career, and stepping into other kinds of software lately gave me a strange case of culture shock. This post is about what the 16.6 religion actually teaches, because I think the rest of the industry accidentally threw it away.

![The whole sermon in one picture.](/images/FrameBudget.webp)

## A budget is not a metric

Here's the core difference, and it's philosophical, not technical. Most software treats performance as a metric: something you measure after building, feel vaguely guilty about, and fix when a dashboard turns red. Games treat performance as a budget: a hard constraint distributed before the work begins. The animation team gets 1.5 milliseconds. Not "animation should be fast." One point five. If your new cloth system needs 3, you go negotiate with physics like it's a family inheritance dispute.

That changes behavior in a way no amount of profiling-after-the-fact ever does. When cost is negotiated up front, expensive designs die in the meeting instead of in production. The question stops being "can we build this feature" and becomes "what is this feature worth in milliseconds," which is a question with an honest answer.

Meanwhile a typical login page in 2026 downloads more data than my first shipped game and takes longer to become interactive than that game took to load a level. Not because web engineers are worse than game engineers. They're not. It's because nobody handed them a number. No budget, no negotiation, no meeting where the tracking script has to justify its four megabytes to the room. Every layer assumes the layer below has slack, and hardware absorbs the sum until one day it doesn't.

## The worst frame is the only frame

Second commandment: averages are lies. A game running at an average of 60fps that drops to 20 during explosions is a bad game, because players don't experience your average, they experience your worst moment at the worst time. Game developers profile the spike, the garbage collection pause, the one frame where forty things happened at once.

Most software measures the opposite thing. Median response times look great in the report while the 99th percentile, the click that took four seconds during checkout, is where users actually decide your product is broken. Whatever you build, your reputation is your frame spikes. The percentile you ignore is the experience your users remember.

## Milliseconds are a human rights issue, sort of

The 16.6 number isn't arbitrary, it comes from the refresh rate of a display racing human perception. Games learned decades ago that people feel latency long before they can name it: 100 milliseconds of input lag makes a game feel like pushing a shopping cart with a broken wheel, even for players who couldn't tell you why. The research outside games agrees, and yet we normalized interfaces where a keystroke takes visible time to appear in a text field. On hardware that executes billions of instructions per second. Typing was solved on machines with less memory than this paragraph.

The religion's actual teaching isn't "optimize everything." Plenty of things genuinely don't need to be fast. It's that responsiveness is a feature users feel in their bodies, decided at design time by what you choose to build, not discovered at the end by what you happen to measure.

## Confession time

My own website ships a JavaScript framework to render text. My blog, the one you're reading, loads React so you can see words. I know. The religion has sinners in every pew, and pragmatism is a real force: I traded some kilobytes for development speed with my eyes open, measured what it cost, and clawed back what I could through code splitting and lazy loading. That's the honest version of the practice available to everyone: not purity, but knowing the price of what you ship.

Because that's all the 16.6 religion really is. A number that forces you to know the price. Pick your own number for whatever you build, a response time, a bundle size, a time-to-interactive, and make it a wall instead of a wish. Walls are wonderful for creativity. Ask any game developer what they got done in 16.6 milliseconds.
