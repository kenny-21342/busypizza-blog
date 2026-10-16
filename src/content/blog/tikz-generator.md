---
title: 'TikZ Generator: removing the AI to make it better'
description: 'A canvas that writes TikZ and CircuiTikZ, entirely in the browser. The notable decision was taking out the model.'
pubDate: 2026-10-16
category: devlog
tags: ['latex', 'web', 'testing']
draft: true
project: tikz-generator
---

TikZ Generator is a web app for drawing diagrams on a canvas and getting back clean,
compile-ready TikZ and CircuiTikZ. It is live, and it has been finished since early
September: the last commit is from 6 September 2026.

## Deterministic on purpose

The README states the design in one paragraph. Code generation is **local and
deterministic**: the TikZ is derived from the relative positions of the elements on the
canvas, so it is instant, works offline, and always round-trips to exactly what was drawn.
Previews compile in the browser through TikZJax, which is TeX compiled to WebAssembly.
There is no backend, no model provider and no API key.

That was not where it started. On 16 August there was an AI-generation feature, and a
commit that day adds durable rate and spend limits for it. Two days later, on 18 August,
the feature was removed. The same week the preview moved from a server-side `pdflatex`
run to TikZJax.

## Hardening

The rest of the history is the kind of work that follows a launch:

- Pencil pressure is preserved across strokes, and the toolbar was fixed on iPad.
- TikZJax assets are cached immutably and the worker's init timeout raised; text that
  rendered as tofu boxes was fixed.
- On 4 September, graph export was fixed and **project names were stopped from injecting
  LaTeX** into the output.
- The parser, emitter and geometry were extracted and tested; the hit testing is tested
  and the three rotation centres have one definition.

On 6 September the two documents describing a project that no longer existed were
deleted, which is a small act worth recording: the docs now describe the code that is
there.

*Written on 16 Oct 2026 from the repository's README and commit history.*
