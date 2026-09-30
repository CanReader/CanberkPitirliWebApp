---
title: "I Implemented Raft From Scratch. Here's What the Paper Doesn't Tell You."
date: "2026-08-15"
category: "Systems"
tags: ["Rust", "Distributed", "Backend"]
excerpt: "Raft is famous for being the understandable consensus algorithm. Then you implement it, and you discover where the understanding was hiding. Notes from building raft-kv, a distributed key-value store in Rust with a core so pure it can be tested without a network."
---

Raft's paper is titled "In Search of an Understandable Consensus Algorithm," and it delivers: you can read it in an afternoon and honestly follow every section. This creates a dangerous illusion. Thousands of engineers have read that paper, nodded along, and now believe they understand distributed consensus. I was one of them, for years.

Then I built raft-kv, a distributed key-value store in Rust with Raft implemented from scratch, and learned the difference between following an algorithm and knowing one. The paper is excellent. It's also a map drawn at a scale where the swamps look like lawns.

## The ninety second version, for context

A cluster of servers elects a leader. Time is divided into terms, each with at most one leader. The leader takes writes, appends them to its log, replicates the log to followers, and an entry is committed once a majority stores it. If followers stop hearing heartbeats, one of them times out, increments the term, and calls an election. A candidate needs a majority of votes, and here's the load-bearing safety rule: a server refuses to vote for a candidate whose log is less up to date than its own. That one refusal is what keeps committed data from ever being rolled back.

![A leader crash, an election, and the log repair afterward. Replayed from my test suite.](/images/RaftElection.webp)

Elegant. Comprehensible. Now here's where the swamps were.

## Where the weeks actually went

**Log repair gets one paragraph and deserves a chapter.** When a new leader takes over, follower logs can disagree with its own in creative ways: missing entries, extra uncommitted entries, entries from dead terms. The paper's answer is a tidy mechanism, walk nextIndex backward until logs agree, then overwrite. Implementing that mechanism means confronting every off-by-one you have ever feared. Conflicts exactly at a snapshot boundary. A follower so far behind that the entries it needs no longer exist. The optimization for skipping whole conflicting terms, which the paper mentions in passing and which every real implementation needs. My commit history for this section is a war journal.

**Snapshotting is not a feature, it's a second protocol.** Logs grow forever, so you compact them into snapshots. Section 7 covers this briefly and calmly. In practice snapshotting touches everything: replication now has a mode where the leader ships a whole snapshot instead of entries, restarts must reconcile the snapshot with whatever log suffix survived, and every index calculation in the codebase suddenly has two coordinate systems, absolute and snapshot-relative. Nothing here is intellectually hard. All of it is where bugs live.

**The client half lives in the dissertation.** The paper gets your servers agreeing on a log. It says very little about the part users actually touch: what happens when a client's request times out and it retries against a new leader? Without session tracking and deduplication, your linearizable store happily applies the same increment twice. The answers exist in Ongaro's PhD dissertation, which is the real implementation manual, and almost nobody reads it.

## The decision that saved the project

Early on I made the only architectural choice I'd defend in court: the consensus core has no I/O. No sockets, no threads, no clocks, no RocksDB. It's a pure state machine across a 5-crate workspace: messages and timer ticks go in, state transitions and effects come out.

```rust
pub enum Effect {
    Send(NodeId, Message),      // outer layer does the networking
    Persist(HardState),         // outer layer does the fsync
    Apply(Vec<Entry>),          // outer layer feeds the state machine
    ResetElectionTimer,
}

pub fn step(&mut self, msg: Message, now: Tick) -> Vec<Effect>
```

The network is a plugin. The disk is a plugin. Which means the tests need neither: a test is just a script of messages delivered in some order, and the suite replays thousands of orderings, partitions, duplicated packets, reordered votes, leaders crashing mid-replication, deterministically, in milliseconds, with no mocks. When a scenario fails, it fails identically every single run, and you step through consensus logic in a debugger like it's a sorting function.

Every distributed systems war story ends with "we couldn't reproduce it." This design makes that sentence impossible for the entire consensus layer. If I ever build another distributed anything, this structure comes with me before any other line of code.

## What implementing it actually taught me

That the understanding was never in the algorithm. Raft's rules fit on an index card. The knowledge is in the edge cases the rules quietly generate, and you cannot download those; you have to hit them. Reading the paper taught me what Raft does. Implementing it taught me why every rule exists, because I got to watch what breaks when you get one slightly wrong.

The repo is on my GitHub, RocksDB persistence and all. If you work anywhere near distributed systems, I genuinely recommend the exercise. Budget a month. Bring snacks. The paper is the easy part.
