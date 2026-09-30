---
title: "The Magic Behind loss.backward() Is 1,451 Lines"
date: "2026-08-16"
category: "AI & ML"
tags: ["Rust", "Math", "CUDA"]
excerpt: "Most people using deep learning treat backpropagation as a sealed black box. I implemented it from scratch for FastNN and counted: the entire autograd engine is 1,451 lines. Here is what's actually inside, math included."
---

Ask ten ML engineers what happens when they call `loss.backward()` and most will say some version of "the framework computes the gradients." Which is true in the way that "the kitchen makes the food" is true. I wanted the recipe, so when I built FastNN, my Rust deep learning library, I wrote the whole thing by hand.

The number that surprised me: the complete autograd engine, the thing that felt like the deepest magic in all of machine learning, is 1,451 lines. Smaller than most codebases' user settings page. Here's what those lines do.

## The math is one idea applied ruthlessly

Training a network means computing how the loss changes with respect to every parameter. The loss is a huge composition of functions, and derivatives of compositions come from the chain rule:

$$
\frac{\partial L}{\partial \theta} = \frac{\partial L}{\partial z_n} \cdot \frac{\partial z_n}{\partial z_{n-1}} \cdots \frac{\partial z_1}{\partial \theta}
$$

The entire trick of backpropagation is the order of evaluation. Multiply that chain right to left, starting from the loss, and every step is a vector times a matrix, cheap, and each intermediate result is exactly the gradient of the loss with respect to some layer, reusable for every parameter feeding into it. One backward sweep computes every gradient in the network for roughly the cost of the forward pass. That single ordering decision is why training deep networks is affordable at all. Reverse-mode automatic differentiation is a scheduling insight wearing a calculus costume.

## The graph is the tensors

To walk backward you need to remember what happened forward. PyTorch popularized calling this record a "tape." FastNN doesn't have one, and this is the design decision I'm most fond of: there is no tape and no global state. Every tensor produced by an operation simply carries a reference to the op that made it and the tensors it consumed. The computation graph isn't stored anywhere. It IS the tensors.

![The whole mechanism: forward builds the structure, backward walks it with the chain rule.](/images/AutodiffGraph.webp)

Calling `backward()` on the loss just walks that structure in reverse topological order. And because this is Rust, the memory management problem solves itself: drop the loss tensor and the whole graph deallocates through ownership. No retain_graph flags, no leak-by-accident. The borrow checker does the bookkeeping PyTorch does with reference counting and prayer.

Each operation contributes exactly one small piece: its local derivative. Matrix multiply is the workhorse, and its backward rule is two lines of math:

$$
C = AB \qquad \Rightarrow \qquad \frac{\partial L}{\partial A} = \frac{\partial L}{\partial C}\, B^{\top}, \qquad \frac{\partial L}{\partial B} = A^{\top} \frac{\partial L}{\partial C}
$$

In the codebase that's a file called `matmul.rs` that knows nothing about neural networks, layers, or losses. It knows one thing: given the gradient flowing into a matmul's output, produce the gradients for its two inputs. ReLU's file is even smaller: pass the gradient through where the input was positive, kill it where it wasn't. Stack thirty such files, each ignorant of all the others, and the chain rule composes them into a system that can differentiate any program you can write with those ops. Nobody planned the full derivative. It emerges.

## Where the real 20% of the effort went

The rules are the easy 80%. The engineering lives in the corners: broadcasting (when a [128] bias adds into a [B,128] matrix, its gradient must sum back down over the batch dimension, and getting reductions right is where every from-scratch autodiff spends its debugging budget), views and reshapes that must route gradients without copying, and diagnostics. FastNN ships an anomaly mode, and its panic message is my favorite line in the library: "anomaly: Log produced inf in the gradient for input 0." NaN hunting in training runs taught me exactly which error message I always wished I had, so I built it.

## Why you should care even if you never write one

Because the abstraction leaks precisely when things go wrong. Exploding gradients, mysterious VRAM growth from a graph you didn't know you were retaining, a detach in the wrong place silently freezing half your model: every one of these is obvious if you can see the graph in your head and voodoo if you can't.

You don't need to write 1,451 lines of Rust to get there. But knowing that the magic would fit in a single code review changes how you debug the frameworks that do it for you. The full source is in FastNN on my GitHub, small enough to read end to end with your morning coffee. The chain rule doesn't mind being watched.
