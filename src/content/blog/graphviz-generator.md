---
title: 'Graphviz Generator: getting dot to run on serverless'
description: 'A visual Graphviz editor that had to move from the dot binary to WebAssembly before it could be deployed at all.'
pubDate: 2026-10-16
category: devlog
tags: ['web', 'nextjs']
draft: true
project: graphviz-generator
---

Graphviz Generator is a visual editor for Graphviz diagrams: place nodes and edges on a
canvas, pick a layout engine, and get DOT out. It is live, and its history is short —
six commits over 16 and 17 August 2026.

## The editor

The README lists what is in it: sixteen node shapes, full edge styling (arrowheads, line
styles), six layout engines (`dot`, `neato`, `fdp`, `sfdp`, `circo`, `twopi`), a graph
attributes panel, labelled clusters, and live DOT output that can be copied or downloaded.
Auto-layout sends the current graph to the chosen engine, parses the positions it returns
(`-Tplain` format) and snaps every node into place. There is 30-level undo and redo,
project save and load, and autosave every thirty seconds with restore on reload.

## The one hard problem

The first version shelled out to the `dot` binary. That works on a laptop and cannot work
on a serverless host, where there is no such binary to run. On 16 August the work was a
port from the binary to **WebAssembly**, which is what made it deployable. A day later the
Graphviz endpoints gained shared rate limits, and Vercel's web analytics were added.

There have been no commits since 17 August, and the project has no open items.

*Written on 16 Oct 2026 from the repository's README and commit history.*
