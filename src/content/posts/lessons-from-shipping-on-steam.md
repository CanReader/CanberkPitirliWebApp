---
title: "What Shipping Two Steam Games Taught Me"
date: "2026-03-22"
category: "Career"
tags: ["Game Dev", "Steam"]
excerpt: "I shipped my first Steam title at 16. By the time the second one launched, I had a completely different understanding of what 'done' means and what players actually care about."
---

I shipped Endless Combat on Steam when I was 16, built with a small team at FataliTech Game Studios. The second shipped title was The Stranger, a VR experience that went on to win Best Game at the WN Unreal European Developer Contest. Two very different games, two very different lessons.

Here's what actually stayed with me.

## Version 1.0 Is a Lie

Nobody ships a finished game. You ship the version you can no longer improve before running out of time or money. The Endless Combat launch build had bugs I knew about and chose to ship with because fixing them would have taken two more months and the scope would have kept expanding.

That's not laziness, that's the reality of game development. The question is which bugs you can live with and which ones will destroy your review score overnight.

For Endless Combat: a memory leak that surfaced after 90+ minutes of continuous play. We shipped it. Most sessions were under 30 minutes. It never appeared in a review.

## Players Don't Care About Your Architecture

I spent weeks on a clean ECS-adjacent component system for the combat entities in Endless Combat. Zero players ever noticed. What they noticed: the hit feedback felt weak. Two days of polish on camera shake, screen flash, and audio had more impact on review sentiment than the entire architecture effort.

The architecture matters to you, for maintainability and iteration speed. But it's invisible to the player. Spend your polish time on what players feel.

## Performance Trumps Features

For The Stranger (VR), hitting a stable 90fps was not optional. It was the whole product. A dropped frame in VR doesn't just hurt performance metrics, it causes physical discomfort. I rewrote the occlusion culling system twice chasing that 20% render time reduction that finally got us there.

In flat games you can often negotiate with performance. In VR you cannot. But the lesson generalizes: a fast, stable game with fewer features will always outscore a feature-rich game that hitches on loading.

## Steam Wishlists Are Your Real Metric

Before launch, the number that matters is wishlists, not follows, not Discord members, not trailer views. Wishlists convert to purchases at a predictable rate (~10-20% on launch day sales). If you don't have enough wishlists, no amount of launch day marketing compensates.

For a small indie game, getting to ~1000 wishlists before launch is the threshold where the Steam algorithm starts doing any meaningful work for you.

## Ship Earlier Than You're Comfortable With

The single biggest mistake first-time developers make is waiting until the game feels "ready." It never feels ready. The feedback you get from 100 real players in the first week of Early Access is worth more than another 3 months of internal iteration.

Ship something real. Fix it publicly. That loop, if you stay honest and responsive, builds more goodwill than a polished-looking trailer with no substance behind it.
