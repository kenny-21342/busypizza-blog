---
title: 'Badminton tracker: measuring three detectors, then choosing the one that needs no labels'
description: 'Tracks a shuttlecock on screen during a livestream. The deciding step was comparing three detectors on contiguous clips.'
pubDate: 2026-10-16
category: devlog
tags: ['python', 'computer-vision', 'research']
draft: true
project: badminton-tracker
---

The tracker follows a shuttlecock on your screen in real time while you watch a badminton
livestream — in a browser, a media player, anything — marks it, and counts hits. A key
shows a colour-coded trail of the rally instead. It has 21 commits, from 25 August to 18
September 2026, and no tracked open items.

## Three detectors

The README offers three modes, and the history is the story of choosing between them:

- **TrackNet** — a temporal heatmap model (TrackNetV2) pre-trained on professional
  footage, which needs **no manual labelling**.
- **Classic CV** — motion and brightness heuristics, with no setup.
- **YOLO** — a single-frame detector fine-tuned on custom labelled footage.

On 6 September the three were measured on contiguous clips and **TrackNet was made the
default**. Detector speed had already been measured separately from accuracy on 26 August,
so the two questions were not mixed up.

## Cutting the labelling work

For the YOLO path, a 13 September commit reports cutting two thirds of the labelling work
"without inventing observations". On 17 September the train and validation split was made
by group, with contiguity decided from the pixels. A split that mixes neighbouring frames of
one rally between train and validation would flatter the model.

## Making it usable

Smoothing is spent only where it does not cost accuracy. The tool is packaged as a
double-clickable `.app` and refuses to run on a blank capture — the symptom of a missing
screen-recording permission. Demo clips are rendered from a video file instead of recording
the screen. The latest commit, on 18 September, makes the point overlay the default: just
the shuttle, no trail.

*Written on 16 Oct 2026 from the repository's README and commit history.*
