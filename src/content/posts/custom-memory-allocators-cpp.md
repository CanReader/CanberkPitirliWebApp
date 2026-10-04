---
title: "Custom Memory Allocators in C++: Pool, Arena, and When to Use Each"
date: "2025-04-08"
category: "Performance"
tags: ["C++", "Memory", "Tutorials"]
excerpt: "Arena, pool, or stack allocator? One table tells you which fits your problem, then the full C++ code for all three, as I wrote them for SleakEngine."
---

Short answer first, since that's probably what you came for:

| Your allocation pattern | Use this | What an allocation costs |
|---|---|---|
| Scratch data that all dies at the end of the frame | Linear arena | Two integer operations and a bounds check |
| Lots of same-size objects, created and destroyed at random times | Pool allocator | A few pointer operations, for both alloc and free |
| Temporary data inside one function or call tree, freed in reverse order | Stack allocator | Same as an arena, plus a rewind |
| Anything else | malloc, or mimalloc | Nothing new to maintain |

I've written all three for SleakEngine. The complete code for each is below, and none of them is longer than a screen.

One honest caveat before the code: malloc is excellent, and most code should never replace it. These patterns pay off when you allocate thousands of times per frame, which is exactly what a game engine, a trading system, or a physics step does. At that rate, the gap between a few cycles and a few hundred cycles per allocation stops being small.

## What's Actually Wrong with malloc for Games

malloc has to handle everything. Tiny allocations, huge allocations, threaded allocations, allocations that live forever, allocations that die in microseconds. To do this it maintains complex internal data structures, locks for thread safety, and free lists for various size classes.

In a game engine you usually know more about your allocation patterns than malloc does. You know that all transient frame data can be freed at the end of the frame. You know that all entities in a level have similar sizes and lifetimes. You know that physics broadphase data is allocated and freed in lockstep with the simulation tick.

When you know your patterns, you can build allocators that are dramatically faster because they don't have to handle the general case. Order of magnitude faster, in some cases.

## The Linear Arena

Use case: anything allocated during a frame and freed all at once at the frame's end.

The implementation is almost embarrassingly simple. A block of memory and a pointer to the next free byte:

```cpp
class LinearArena {
public:
    LinearArena(size_t size)
        : buffer_(static_cast<uint8_t*>(std::malloc(size)))
        , offset_(0)
        , capacity_(size)
    {}

    ~LinearArena() { std::free(buffer_); }

    void* allocate(size_t bytes, size_t align = alignof(std::max_align_t)) {
        size_t aligned = (offset_ + align - 1) & ~(align - 1);
        if (aligned + bytes > capacity_) return nullptr;
        offset_ = aligned + bytes;
        return buffer_ + aligned;
    }

    void reset() { offset_ = 0; }

private:
    uint8_t* buffer_;
    size_t   offset_;
    size_t   capacity_;
};
```

That's the entire allocator. Allocation is two integer operations and a bounds check. There's no free function for individual allocations because you don't free individual things. You reset the whole arena at the end of the frame.

In SleakEngine I have a per-frame arena that gets reset after the render thread finishes. Anything that needs scratch memory during the frame allocates from it. The cost per allocation is a few CPU cycles. Compared to malloc, which can be hundreds of cycles for a small allocation, this is a meaningful win when you're allocating thousands of times per frame.

The cost is that you give up granular freeing. If something allocated from an arena escapes its lifetime, you have a use-after-free. Arenas work because their lifetime is well-defined.

## The Pool Allocator

Use case: many objects of the same size with unpredictable lifetimes.

If your game has 5000 entities, all 256 bytes each, and they get created and destroyed throughout the level's lifetime, a pool is what you want.

The pool pre-allocates a fixed array of slots, all the same size. A free list points to the next available slot. Allocation pops from the free list. Deallocation pushes back onto it.

```cpp
template <typename T>
class PoolAllocator {
public:
    PoolAllocator(size_t count)
        : storage_(static_cast<Slot*>(std::malloc(sizeof(Slot) * count)))
        , freeList_(storage_)
    {
        for (size_t i = 0; i < count - 1; ++i) {
            storage_[i].next = &storage_[i + 1];
        }
        storage_[count - 1].next = nullptr;
    }

    T* allocate() {
        if (!freeList_) return nullptr;
        Slot* slot = freeList_;
        freeList_  = freeList_->next;
        return reinterpret_cast<T*>(slot);
    }

    void deallocate(T* obj) {
        Slot* slot = reinterpret_cast<Slot*>(obj);
        slot->next = freeList_;
        freeList_  = slot;
    }

private:
    union Slot {
        T    data;
        Slot* next;
    };

    Slot* storage_;
    Slot* freeList_;
};
```

Allocation and deallocation are constant time, both are a handful of pointer operations. There's no fragmentation because every slot is the same size. Cache performance is excellent because objects sit contiguously in memory.

The cost is that the pool size is fixed at construction. You can grow it (add a new block when the free list is empty) but that complicates the implementation. You can't easily allocate variable-sized things from a pool either, so if your entity sizes vary you need either multiple pools (one per size class) or a different allocator.

## The Stack Allocator

Use case: scoped allocations within a function or system, freed in reverse order.

A stack allocator is a linear arena with the ability to mark a position and "rewind" to it. Useful for recursive algorithms where each level allocates scratch data and you want to free it on the way back up.

```cpp
class StackAllocator {
public:
    StackAllocator(size_t size)
        : buffer_(static_cast<uint8_t*>(std::malloc(size)))
        , offset_(0)
        , capacity_(size)
    {}

    using Marker = size_t;
    Marker mark() const { return offset_; }
    void rewind(Marker m) { offset_ = m; }

    void* allocate(size_t bytes, size_t align = alignof(std::max_align_t)) {
        size_t aligned = (offset_ + align - 1) & ~(align - 1);
        if (aligned + bytes > capacity_) return nullptr;
        offset_ = aligned + bytes;
        return buffer_ + aligned;
    }

private:
    uint8_t* buffer_;
    size_t   offset_;
    size_t   capacity_;
};
```

You take a marker before doing your allocations, then rewind to it when you're done. The pattern is similar to a function call stack: push, work, pop.

I use this in SleakEngine for things like physics broadphase queries. The query allocates scratch data, fills it, hands the result back, and the caller rewinds when done. No malloc calls during the query, no individual deallocations.

## Which One to Reach For

Frame-scoped scratch data: linear arena.

Many objects of one size with mixed lifetimes: pool allocator.

Scoped scratch within a function or call hierarchy: stack allocator.

Anything else: malloc, until you've profiled and shown malloc is the bottleneck.

The ordering matters. The single biggest mistake I see in custom allocator code is reaching for these patterns before they're justified. Custom allocators add complexity, fragmentation if you mix patterns wrong, and bugs that are particularly nasty to debug because you've stepped outside the standard library's safety nets.

## What I Don't Roll Myself

I don't write my own general-purpose allocator. mimalloc and tcmalloc exist and they're the work of teams of specialists. If I need a general allocator faster than the system one, I link against one of those.

I don't write my own thread-local allocator from scratch either. The interaction between thread-local storage, lock-free data structures, and memory fences is a research area, not a "I'll bang this out in a weekend" area.

The custom allocators I write are the ones above. Simple patterns for known workloads, where the entire implementation fits on a screen and the failure modes are obvious. Anything more complex than that, I use a battle-tested library.
