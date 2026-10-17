---
title: 'Real-time LaTeX: one dropped project, one adopted engine'
description: 'A TypeScript engine measured on real documents and archived, then a switch to an existing MIT-licensed engine, with a fork, a VS Code plugin and a private test set around it.'
pubDate: 2026-10-16
category: devlog
tags: ['latex', 'research', 'rust']
draft: false
project: realtime-tex
---

Five repositories on this machine belong to one thread: getting a LaTeX preview that keeps
up with typing. The thread is short and has a clear turning point.

## Starting from scratch, and measuring it

On 7 October a project called `live-lualatex` set out to build a paragraph-level
real-time LuaLaTeX engine in TypeScript. Before building it, a feasibility plan measured
the hard parts on four real documents. The go/no-go report is candid:

- Replaying a recorded paragraph context in a fresh process reproduced the paragraph's
  lines exactly — but only for the paragraphs the eligibility rules admitted, which was
  **9–17 percent** of real source paragraphs on three of the four documents (54 percent on
  the contest paper).
- The strict criterion, that the whole box be identical, **failed on all four**.
- The recommendation was "go for the next experiment, not yet for the engine."

On 8 October the project was archived, with a tag, a written reason, and the spec marked
superseded. The reason was not the numbers alone: an existing project already covered far
more ground.

## Adopting the existing engine

That project is **realtime-tex**, an MIT-licensed Rust engine by a friend. At the time it
already covered lists, footnote marks, headings, display math, references, figures, tables,
multi-file projects, a scaled-point-exact `rtex verify`, and a VS Code plugin — more than
the TypeScript engine could reach cheaply, so the archive note says building on it was the
better use of time. It keeps an unmodified LuaTeX process alive, recompiles only the
paragraph being edited (about a millisecond), reads the display list out of LuaTeX's node
lists instead of generating a PDF, and reconciles pagination, floats and references in a
background full compile. It follows Clemens Lode's TUG 2026 paper on recompiling large
documents in 1 ms, and exported PDFs match a normal LuaLaTeX build.

The first thing measured after switching was whether the fork holds up on the four real
documents and on macOS with TeX Live 2025 (the `yardstick` branch).

The repositories around it:

- **A fork of the engine.** Of the 184 commits in the local clone, 93 are the original
  author's, 44 are Kenny's, and 47 were made in Claude Code sessions. The fork's releases
  0.0.8 to 0.0.10 landed on 12–13 October; recent themes are keeping newly typed
  paragraphs live across heading and environment boundaries, showing complete early page
  previews, and caching TeX Live setup.
- **A fork of the VS Code plugin.** Plugin releases 0.0.2 and 0.0.3 on 12–13 October, with
  live feedback for new paragraphs while layout catches up.
- **A private fixtures repository.** Four real LaTeX documents with their images, plus
  evaluation notes: a stress-test replay recording latency, correctness bugs found and
  fixed, error locations against a deliberately broken suite, and validation of an
  upstream MiKTeX merge on 11 October.
- **TexFast**, which embeds the engine in a [native editor](/blog/texfast/).

The engine and the original plugin are the friend's work. These repositories are a fork,
its releases, and the test material used to evaluate it.

*Written on 16 Oct 2026 from the repositories' READMEs, ARCHIVED.md and commit histories.*
