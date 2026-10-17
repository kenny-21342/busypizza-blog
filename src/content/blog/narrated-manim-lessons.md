---
title: 'Narrated Manim lessons, and a QA gate that decides when a lesson is done'
description: 'IB Maths and Physics animation lessons with spoken narration. A lesson only counts once an automated check passes.'
pubDate: 2026-10-16
category: devlog
tags: ['python', 'education', 'physics']
draft: false
project: manim-lessons
---

Two repositories make animated lessons with Manim. `ib_math_manim` is the real one: narrated
lessons for IB Analysis and Approaches HL, IB Physics HL, IB Computer Science and
mathematical-modelling contests. `manimations` is a scratchpad for physics animations,
with two commits.

## What a lesson is

Each unit is a six-to-ten-minute video with spoken narration, worked examples, a named
common mistake and a recap — and, the README insists, it is **gated by an automated QA
check before it counts as done**. A lesson is a Python class whose steps are *beats*: a
narration line plus a function that draws, receiving the *measured* length of the speech.
Pacing therefore comes from what was written, not from a global speed multiplier.

Rendering has a quality ladder — draft at 480p15, review at 720p30, high at 1080p60, final
at 2160p60 — and the rule is to draft everything and render final once, in a batch.

## How it was built, by phase

The commit history from 10 September is explicit about order. Phase 0 was a **local
text-to-speech service**, proven end to end. Phase 1 was the lesson framework and a QA gate
*calibrated on real frames*. Phase 2 was a pilot, the Rules of Differentiation, passing the
gate. After that: the standard derivatives, then chapters on reciprocal and inverse trig
with double angles (1), exponentials (2) and logarithms (3), and one IB Physics unit on
motion in magnetic fields, in 3D.

The gate earned its place. It caught a **pacing defect** — animation durations are now
clamped and pace is measured — and dead space in chapter 1, and it was itself fixed once
when it turned out to be grading the wrong file. Both of the first two units were re-cut
into many short beats with five worked examples and an exam question.

## What is open

The last content commit is from 13 September. The open items are to download and test a
premium narration voice, to expand the IB AA HL lessons in reviewed waves, and later to
extend the stable lesson system to Physics, Computer Science and modelling. None has a date.

*Written on 16 Oct 2026 from the repositories' READMEs and commit histories. Open items
below come from Reminders.*
