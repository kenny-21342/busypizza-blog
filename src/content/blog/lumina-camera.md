---
title: 'Lumina: a camera app that has never been run on a camera'
description: 'A native iPhone camera with a composition coach and an editor. The README separates what is tested from what has only compiled, and the learned model lost to the baseline first.'
pubDate: 2026-10-16
category: devlog
tags: ['ios', 'swift', 'machine-learning']
draft: false
project: lumina-camera
---

Lumina is a native SwiftUI iPhone camera: manual controls, an on-device composition
coach, automatic cloud-AI angle and focal-length hints, a night mode, and a
Lightroom-style non-destructive editor. The repository has 37 commits, all from 9 and 10
October 2026.

## A README that says what it does not know

The most useful thing in the repository is its status table, which has an "Evidence"
column. It is honest in both directions.

- **Implemented, with tests:** the whole edit pipeline (basic adjustments, curves, HSL,
  grading, detail, effects, crop and keystone, masks, presets), the editor session, the
  camera model and its limits, and the core of night mode, whose noise reduction is tested
  against synthetic bursts.
- **Implemented, not run on a phone:** the composition coach's rules (horizon, exposure,
  shake, faces).
- **Written, compiles, never run on a device:** the real camera through AVFoundation and
  saving to Photos. The README's own words are "NEVER RUN". The in-app gallery grid and
  viewer are in the same position, because the Simulator's photo-permission prompt could
  not be dismissed from a script.
- **Not built:** spot removal, brush and AI masks, video, iPad support, App Store assets.

In the Simulator the app runs against a clearly labelled demo camera.

## The learned crop scorer lost, then was rebuilt

On 9 October a commit turns the reframe hint **off by default** with the message that the
shipped scorer lost to the unmodified frame — that is, suggesting a crop was worse than
doing nothing. The same day a replacement was trained on the GAICD composition dataset,
exported to Core ML, ported to Swift, and graded against the baselines. The README reports
a test rank correlation of 0.759 for the new scorer against 0.338 for the old one. It is
bundled but remains **experimental and off by default**, stays silent when Vision finds no
subject, and ships with a coach log that can be exported for measuring real-phone latency.

## What is next

The device checklist (`docs/device-checklist.md`) is the real to-do list: run the camera and
the gallery on an actual iPhone. The project has no Reminders list and no deadline, and the
working tree has 32 uncommitted files on the `coach-learned` branch.

*Written on 16 Oct 2026 from the repository's README and commit history.*
