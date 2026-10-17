---
title: 'Lanternfall: a puzzle game generated entirely in code'
description: 'Six monuments, thirty discoveries, no hand-made assets. A bot has played all thirty; a person playing it in a rendered build is still on the list.'
pubDate: 2026-10-16
category: devlog
tags: ['unity', 'games', 'csharp']
draft: false
project: lanternfall
---

Lanternfall is a third-person Unity puzzle journey through six connected, surreal
monuments. The route starts at a main menu and enters a persistent journey scene that
streams in each monument. Characters speak before and after the five discoveries of their
monument, and each discovery is two trials on a shared puzzle rig — which makes thirty
discoveries and sixty trials in all.

It was renamed from its working title on 3 October 2026 (its Reminders list still carries
the old name, "Light & Shadow Game").

## Everything is generated

The README's most distinctive claim is that **all art is procedural**: geometry,
textures, glyphs, sky, water and even the music are generated in code. The scenes
themselves are generated and git-ignored; `BuildAll` rebuilds them after a clone. The
earlier prototypes are kept in `Archive/legacy/`, outside `Assets/` so Unity ignores them.
There are EditMode tests for the solver, content and story, and PlayMode tests for
campaign walks, streaming and screenshots, plus a dated verification log.

## What the last two weeks were

The repository's 78 commits (the first on 26 August) include a long polish loop in early
October:

- A **full-game bot** that plays all thirty discoveries through the real controls, and a
  difficulty audit of all sixty trials, with a frame-time probe.
- A follow camera that sphere-casts so walls never swallow the view, a collision audit, and
  a clear two-shot for conversations so the camera never ends up inside stone.
- A rewritten set of region music pads with a soft timbre and reverb, an app icon, and
  solid colliders for pedestals, pool copings and lantern posts.
- On 10 October: the first lessons now teach with one device, the story is told up front, a
  journal page and a gentle nudge were added, and the village on the horizon lights one
  window per discovery.

## What the bot does not prove

A bot completing the game through its controls shows the puzzles are solvable and the
controls reach them. It does not show the game is good to play. The first open item is to
play the full thirty-encounter journey in a rendered player, and it has no date. The dated
plan is later: fix playtest blockers by 15 March 2027, replace first-pass scenery,
animation and audio by 20 April, playtest with at least five new players by 20 May, run
final performance checks by 15 June, and publish on **30 June 2027**.

*Written on 16 Oct 2026 from the repository's README and commit history. Open items below
come from Reminders.*
