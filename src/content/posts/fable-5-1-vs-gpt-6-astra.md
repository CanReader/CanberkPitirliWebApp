---
title: "Fable 5.1 vs GPT-6 Astra: An Engineer Reads the Fine Print"
date: "2026-09-26"
category: "AI & ML"
tags: ["LLM", "Opinion"]
excerpt: "Anthropic's Fable 5.1 and OpenAI's GPT-6 Astra landed weeks apart, both claiming the frontier. I build inference code for a living, so I skipped the launch posts and read the API changelogs and the benchmark harnesses instead. That's where the real story is."
---

September gave us two frontier model launches within weeks of each other: Anthropic's Claude Fable 5.1 and OpenAI's GPT-6 Astra. Both priced identically at \$10 per million input tokens and \$50 per million output. Both with 1M token context windows. Both "the most capable model in the world," according to their own launch posts.

I've written a deep learning framework from scratch and I benchmark GPU kernels for fun, so let me tell you where I actually look when a new model ships: not the announcement, not the demo video. The API changelog and the benchmark harness. Both are more honest than any press release, because breaking changes and harness configs are testable claims. Everything below comes from three places: the public API documentation, the harness configurations published next to the scores, and my own logs from running both models inside the same agent loop. No leaks, no vibes, no "sources familiar with the matter."

## What Fable 5.1's API changes actually mean

The interesting thing about Fable 5.1 isn't a benchmark number, it's three API decisions that reveal architecture.

First, thinking can no longer be turned off. The old `budget_tokens` knob is gone entirely, replaced by an `effort` parameter that runs from low to max, and on Fable-class models passing a token budget gets you a 400. Read that as an engineering statement about test-time compute. Everything published on inference-time scaling since 2024 says the same thing: for a fixed set of weights, accuracy on hard reasoning tasks climbs roughly log-linearly with the number of serial chain-of-thought tokens, then plateaus at a task-dependent ceiling. A hard token cap is the wrong control surface for that curve; you either truncate a derivation mid-lemma or you pay for padding. A scheduler with a priority hint is the right control surface. The model now allocates its own reasoning tokens per request and `effort` just sets the envelope. As someone who spent a career distributing milliseconds across subsystems, I recognize this pattern instantly. It's a frame budget for cognition, the API stopped letting you micromanage the scheduler, and I think it's the correct abstraction.

Second, and this is the big one: thinking blocks are now cryptographically bound to the model and the conversation. Edit earlier history and the reasoning state is invalidated; new accounts get hard errors on edited histories. Your conversation is now an append-only event log, and the model's reasoning rides along as opaque internal state. There are two solid systems reasons to do this, and both are about the KV cache. A transformer's per-token key/value state costs

$$
\text{KV bytes per token} = 2 \cdot n_{\text{layers}} \cdot n_{\text{kv}} \cdot d_{\text{head}} \cdot b
$$

where the 2 covers keys and values, $n_{\text{kv}}$ is the number of KV heads after grouped-query attention has done its compression, and $b$ is bytes per element, 2 for bf16, 1 if they serve fp8. Multiply by a million tokens of context and a frontier model is holding tens of gigabytes of KV state per conversation. Prefix caching only works on byte-identical prefixes, so an append-only history means every turn is a cache extension and an edited history is a full prefill rebuild, which at 1M tokens is quadratic-ish attention compute you really don't want to repeat. Bind the reasoning state to the log and the model also resumes its own plan across turns instead of re-deriving it from the summary. The event-sourcing engineer in me nods along. The debugging engineer in me winces, because the raw chain of thought is never returned anymore, only summaries, and when an agent goes sideways at step 40 the trace you'd want is exactly the thing you can't see. And there's a lock-in angle nobody says out loud: reasoning state that only one vendor's model can deserialize is the stickiest dependency in the stack. Stickier than the SDK, stickier than the fine-tune.

Third, forced tool choice returns a 400 now. `tool_choice: any` and `tool_choice: tool`, gone. You can still guarantee the shape of a call, because strict JSON schemas are enforced by constrained decoding at sampling time, token masks and all. What you can no longer guarantee is that a call happens; you ask in the prompt and trust the policy. That's Anthropic saying their RL'd tool-selection policy is now more reliable than your harness heuristics. Bold, probably correct, and mildly insulting to everyone who built elaborate tool-forcing state machines. I had one. Rest in peace.

## The bill is a systems problem

With identical sticker prices, the real cost difference moved to the corners of the pricing page, and the corner that matters is cache reads. Here's why. An agent loop resends its entire history every turn, so total input tokens over $N$ turns are

$$
T_{\text{in}}(N) = \sum_{t=1}^{N} \Big( P + \sum_{i=1}^{t-1} (a_i + o_i) \Big) \approx NP + \frac{N^2}{2}\,\bar{c}
$$

where $P$ is your system prompt plus tool definitions, $a_i$ and $o_i$ are each turn's actions and observations, and $\bar{c}$ is the average turn size. That's quadratic in turns. A 60-turn coding session with a 20K prefix and a modest 2K tokens per turn resends on the order of five million input tokens, and all but a sliver of them are bytes the model has already prefilled. Cache reads exist precisely because re-reading a cached prefix skips the attention prefill FLOPs; you're paying for KV storage and memory bandwidth instead of compute, which is why vendors can discount it 40x below fresh input.

Fable 5.1 charges \$0.25 per million cached tokens. Astra charges \$1. Both are discounts, but they're 4x apart, and in the quadratic regime the cache line item dominates the bill. Astra claws some back elsewhere: batch inference at half price, and a fast mode at 2x if you want your tokens now. But if your workload is agentic, and in 2026 whose isn't, price the loop, not the token.

## What Astra's benchmarks actually show

Astra's launch numbers are spectacular: 98% on FrontierMath Tier 4, 99.9% on ARC-AGI-3, state of the art on computer use and software engineering. Then you read the fine print, and the fine print is fascinating.

ARC-AGI-3 is not a static puzzle set; it's a suite of interactive environments where the model acts over many turns, which makes the harness part of the measured system by construction. That 99.9% was recorded on OpenAI's own Provider Adapter harness, which preserves the model's private reasoning state between turns and compacts long histories so the context never overflows. The ARC Prize's standard harness does neither. Same weights on the standard harness: 62.7%. Strip the scaffold and 37 points evaporate. For calibration, the jump between successive frontier model generations on this class of eval has historically been 15 to 25 points. The scaffold is now worth more than a model generation, and the scaffold never makes the headline.

Then hold the "saturated" FrontierMath score next to the eval OpenAI mentioned much more quietly: unsolved Erdős problems, where Astra managed 2 of 68 officially and climbed to 5 after retry campaigns that reportedly burned over \$220,000 in compute. That last detail matters, because pass@k with an enormous k and a verifier is a fundamentally different capability claim than pass@1, and retry-laundered numbers keep sneaking into headlines without the k attached. There's no contradiction between 98% on a dead benchmark and 3% on a living one. Benchmarks age out through targeted RL post-training on similar problem distributions and through plain contamination pressure, and once one ages out it stops measuring capability and starts measuring curriculum. The living benchmark is the capability. The dead one is the training target.

None of this makes Astra weak. Independent aggregates put it at 61.2 on the Artificial Analysis Intelligence Index against Fable 5.1's 65.7, and a few points behind on coding-agent evals, 67 to Fable's 70, while its computer-use latency genuinely leads the field. It's a strong model wearing a misleading scoreboard.

## Reading the metal through the pricing page

Neither vendor discloses architecture, so file this section under informed inference from the outside. At \$10/\$50 with a 1M context, both models are almost certainly sparse mixture-of-experts; dense frontier models at this scale don't pencil out against these prices, because MoE decouples parameter count from per-token FLOPs and per-token FLOPs are what you're actually selling. Astra's fast mode, same weights at 2x the price for roughly 2x the tokens per second, smells like a dedicated low-batch-size deployment with more aggressive speculative decoding; you don't conjure 2x decode latency out of the same batch-packed cluster by asking nicely, you trade batch occupancy for it, and that trade costs exactly the kind of money a 2x multiplier recovers. Fable's 40x cache discount only pencils out if cached prefixes skip prefill entirely and the KV state ages out of HBM into something cheaper between turns, which is to say tiered KV storage with reload. I can't prove any of that from the outside. But nobody prices below marginal cost at this volume, so a pricing page is a shadow cast by the serving architecture, and this is what the shadow looks like.

## The opinions, concentrated

One: the harness wars have replaced the benchmark wars. A score without a harness spec is now as meaningless as an FPS number without a resolution. Both vendors know it; both quietly ship reasoning-state preservation and context compaction because that's where the wins live. When someone quotes you a benchmark, demand the harness config the way you'd demand the test hardware.

Two: the economics of frontier models are now a systems engineering problem, not a procurement problem. Identical token prices, wildly different loop prices. Do the arithmetic on your own workload's turn structure before believing anyone's cost comparison, including mine.

Three: my actual usage, since opinions should have skin in them. Fable 5.1 runs my long coding sessions; always-on reasoning plus the append-only discipline makes it the most steerable model I've used for multi-hour work, and I stopped fighting the harness. Astra is what I reach for on computer-use automation, where it's simply faster. Neither one is the "AGI era." Both are excellent tools whose vendors are now competing on schedulers, caches, and serving topology, which, as a systems engineer, I find deeply funny and completely correct.

The model stopped being the product. The loop around it is.
