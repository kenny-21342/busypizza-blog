---
title: 'TexFast: a native LaTeX editor that is finished on purpose'
description: 'A macOS editor and build driver written for one set of notes. It has no deadline and no task list, deliberately.'
pubDate: 2026-10-16
category: devlog
tags: ['latex', 'macos', 'swift']
draft: true
project: texfast
---

TexFast is a native macOS LaTeX editor — AppKit and PDFKit, no Electron and no Tauri —
paired with `fastex`, a build driver. It was written for a specific document, the IB
Physics notes, and is used daily on them.

The project's own CLAUDE.md is explicit about its status, and it is worth repeating
because it is easy to misread a repo with recent commits as unfinished work:

> It is built, installed, and used daily. There is no release, no user base, and no
> support burden.

So it is on no schedule and has no Reminders list, by decision. It gets touched when the
writing it serves is slowed down by something, and left alone otherwise.

## What changed in October anyway

Recent work happened because something upstream became useful. On 9 October the renderer
switched to LuaLaTeX and stale previews started being cancelled. From 11 October it
gained an alternative build that embeds the [real-time LaTeX engine](/blog/realtime-latex-engine-and-its-satellites/)
over its persistent `rtex serve` API.

In that build, edits go from the unsaved editor buffer straight to the engine. Eligible
paragraphs are drawn immediately with native overlays; the full PDF catches up in the
background. The README reports, for this Mac, a warm 95th-percentile latency from
insertion to native draw **below 50 ms** on 10-, 100- and 300-page fixtures, and points to
`docs/realtime-latency.md` for the method. A follow-cursor mode, a startup cache keyed by
source hash, and early whole-page previews for long documents (engine v0.0.10) came in
over the following days.

Autosave persists the buffer without requesting a full PDF; an explicit Save or Recompile
does the full pass.

*Written on 16 Oct 2026 from the repository, its README and CLAUDE.md. There are no open
items to list.*
