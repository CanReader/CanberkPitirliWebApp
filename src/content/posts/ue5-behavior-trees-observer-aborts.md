---
title: "Behavior Trees in UE5: C++ Tasks, Decorators, and the Observer Abort Nobody Understands"
date: "2025-06-17"
category: "Game Dev"
tags: ["Unreal Engine", "C++", "Game AI", "Tutorials"]
excerpt: "Every UE5 AI tutorial stops right before the part that makes enemies feel alive: observer aborts. I shipped behavior tree AI in a commercial VR game, and this is the explanation I wish someone had given me."
---

Behavior trees are how most Unreal games think. I built enemy AI with them for The Stranger, a shipped VR title, and I keep seeing the same learning curve in every developer who touches them: the basics land in an afternoon, and then observer aborts eat a week. This post is the afternoon and the week, compressed.

![A stealth guard's whole brain. The orange node is executing; the dashed line is the abort that makes it feel alive.](/images/BehaviorTree.webp)

## The mental model in ninety seconds

A behavior tree runs from the root every time it needs a decision. Selectors try children left to right until one succeeds; they're the "or". Sequences run children left to right until one fails; they're the "and". Tasks are leaves that actually do things: move here, play this animation, wait.

The tree above is a whole stealth guard: attack if you can see the player, search if you heard something, otherwise patrol. Priority isn't a number you tune, it's literally the left to right order under the selector. This is why designers can read behavior trees: the layout is the logic.

The blackboard is the tree's memory, a bag of named keys like `TargetActor` or `LastKnownLocation`. Perception writes into it, the tree reads from it. Keep it that way around: senses write, tree reads, and the data flow stays debuggable at 2am.

## C++ tasks, because Blueprint has a ceiling

Blueprint tasks are great until an AI-heavy scene puts thirty of them on screen. A C++ task is faster and, more importantly for a shipped game, versionable and reviewable:

```cpp
UCLASS()
class UBTTask_PickSearchPoint : public UBTTaskNode
{
    GENERATED_BODY()

    virtual EBTNodeResult::Type ExecuteTask(
        UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override
    {
        auto* BB = OwnerComp.GetBlackboardComponent();
        const FVector LastKnown =
            BB->GetValueAsVector(TEXT("LastKnownLocation"));

        FNavLocation Result;
        auto* NavSys = FNavigationSystem::GetCurrent<UNavigationSystemV1>(GetWorld());
        if (!NavSys || !NavSys->GetRandomReachablePointInRadius(LastKnown, 600.f, Result))
        {
            return EBTNodeResult::Failed;
        }

        BB->SetValueAsVector(TEXT("SearchPoint"), Result.Location);
        return EBTNodeResult::Succeeded;
    }
};
```

Return `Succeeded` or `Failed` for instant work. Return `InProgress` for anything that takes time, and then you are obligated to call `FinishLatentTask` later. Forget that and the tree waits politely forever, which in playtest terms is "the guard is staring at a wall again".

## Observer aborts, the part that makes AI feel alive

Here's the problem the basics leave you with. Your guard is deep in the patrol branch, walking between waypoints. The player steps out directly in front of him. A naive tree finishes the current task first, so the guard completes his stroll to the next waypoint, then turns around and notices you. Comedy, not menace.

Decorators fix this, but only if you understand that a decorator is not an if statement. It's a condition that can keep watching after the decision was made. That's the "observer" in observer aborts. On any decorator, like a Blackboard check on `TargetActor`, you set Observer Aborts to one of:

- **None**: checked once on entry, never again. The comedy guard.
- **Self**: if the condition turns false while this branch runs, abort this branch. "Stop attacking when you lose the target."
- **Lower Priority**: if the condition turns true while some branch to the right runs, kill that branch and jump here. "Stop patrolling the instant you see him."
- **Both**: both of the above.

The names confuse everyone because they describe what gets aborted, not what you're reacting to. The dashed red arrow in the diagram is Lower Priority doing its job: perception sets `TargetActor`, the attack branch's decorator is observing, patrol dies mid-step, and the guard snaps to combat in the same frame. That snap is the entire difference between AI that follows a flowchart and AI that feels like it wants something.

One shipped-game warning to close: observer aborts fire on blackboard writes, so a value that flickers, like a target that rapidly enters and leaves perception, will thrash your tree with aborts and restarts. Debounce at the perception layer, give sight a few hundred milliseconds of memory before clearing the key. Your frame time and your guard's dignity will both thank you.
