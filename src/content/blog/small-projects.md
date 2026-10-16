---
title: 'Small projects: a notification bridge, two physics explainers, and a few one-offs'
description: 'The repositories and folders too small for a post of their own, each with what it actually is and what state it is in.'
pubDate: 2026-10-16
category: devlog
tags: ['python', 'physics', 'tools']
draft: true
project: small-projects
---

Several things on this machine are real but small. None has a Reminders list, and most are
finished or one-off by nature, so they share a post.

## Mac notifications on an iPhone — finished

macOS has no public API that hands over notifications as they arrive. What it has is a
SQLite database that Notification Center writes every notification into, so the bridge
**tails that database** and posts each new row to a phone on the same network. Each record's
payload is a binary plist inside a blob, which is why the script parses rather than just
reads. It runs as a LaunchAgent and has been live since 10 September 2026.

The project's own notes say it is shipped and should not be re-opened as unfinished work.
Where the phone listens is deliberately kept out of the repository, so the repo alone cannot
say what the phone subscribes to. It has four commits.

## Bottle flip physics, and foosball mechanics

Two Chinese-language explainers with simulations, both created on 10 October.

- **Bottle flip** is an article with an interactive model. The reader chooses a bottle
  standing on its base or inverted on its cap, then adjusts release height and starting
  angle. The model slices the bottle into 72 axial pieces to approximate the mass of bottle
  and water, lets the water spread from the base along the bottle during flight, and updates
  the spin by conserving angular momentum. `node model.test.js` runs checks on the model.
- **Foosball mechanics** is an article with two physics videos — a bank shot that passes
  under a defender, and a split shot that is blocked or goes through depending on the
  defenders' stance. A Pymunk 7.3.0 simulation computes the collisions and Manim renders
  the animation; an English draft is kept.

## Orbit, an operating-systems lab

A single 69 KB HTML file, created on 15 October, that is an interactive lab for scheduling,
device handling, multitasking and resource allocation, using a spaceport workshop as the
analogy. It is not in a git repository.

## Teams channel downloader

A macOS script that scans the Files folder of the Teams channels a signed-in account can
see, through Microsoft Graph, walks folders recursively, and saves files into a local
folder tree organised by school subject. One commit, 10 October.

## Kaggle

`kaggle-medals` is a working folder, not a repository. Its notes set the goal as picking an
open, medal-eligible, tabular-first competition, building a fully commented notebook, and
resubmitting until the score plateaus — with a medal as the target and never a guarantee.
The one score logged in the README I read is a first submission to the CASMI 2026
mass-spectra competition, which scored 0.126 on the public leaderboard (around rank 2230 of
2561) against a bronze line of about 0.413 on 6 October. That competition's final deadline
is 14 December 2026.

*Written on 16 Oct 2026 from the READMEs, CLAUDE.md files and commit histories of each.*
