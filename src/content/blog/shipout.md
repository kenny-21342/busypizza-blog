---
title: 'Shipout: a Word-style editor over LuaLaTeX'
description: 'Two editors in one repository, a hard deadline on 4 November, and a list of release gates that are still open.'
pubDate: 2026-10-16
category: devlog
tags: ['latex', 'macos', 'tauri']
draft: false
project: shipout
---

Shipout is a desktop editor for people who need a LaTeX document but do not want to
write LaTeX — the intended users are contest teammates preparing mathematical-modelling
papers. The repository holds two editors, and the project's own notes give them fixed
names so they are not confused:

- **v2** opens a `.tex` file, paints the PDF that LuaLaTeX produced, and maps every
  click back to the source. The `.tex` is the only source of truth. It is still the
  default entry point and the only one that ships.
- **v3**, *Shipout Preview*, is a ProseMirror editor with its own `.shipout` project
  file. The LaTeX is generated from the editor's document model, with a PDF review tab
  next to it. This is the one being built out.

The app is Tauri (Rust and a web front end) with 98 commits from 26 August to 10
October 2026.

## What the status document claims, and what it admits

`docs/RESTART-STATUS.md` is unusually frank, and it is the best summary. On the
**proven** side: a structured report with title, list, table, formula, figure and
citation round-trips through the project file and compiles twice with LuaLaTeX; paste
from Google Docs and Word works; input-method composition for Chinese and Japanese works;
review comments anchor to exact words; a Word-style tabbed ribbon and shortcuts exist; and
the app can install its own TeX Live so a teammate does not need one.

On the **still open** side, re-checked on 5 October:

- The drawing importer is a prototype for one TikZ picture compiled in isolation, not a
  general importer.
- Whole-report import is much broader than it was — a real 27-page student paper imports
  with 12 of 262 pieces kept as raw LaTeX — but not complete.
- The private TeX Live install has been tested in pieces, but a clean-machine run inside
  the signed app has not been done.
- Compiler errors map to the nearest top-level block, which is approximate inside lists.
- Browser saving downloads a file; native crash recovery is not finished.

## Recent work

October's commits are about making the editor read like Word: a tabbed ribbon (Home,
Insert, References, Review, and a table-layout tab), page zoom from 50 to 200 percent,
section numbers and Figure/Table labels in the writing view, Ctrl or Cmd+P to save the PDF,
cross-references that show what the paper prints, and plain-language build hints each
with a test. The repository's proofs now run on Linux as well as macOS.

The working tree has 42 uncommitted files on the `shipout` branch, which is the first
thing the open reminder ("finish the current Shipout editing changes") refers to.

## The date

**4 November 2026 is a hard deadline.** The two items that land on it are packaging and
signing a standalone macOS build (3 November) and watching a teammate use a complete real
document (4 November). The second is the real test: none of the proofs substitute for it.

*Written on 16 Oct 2026 from the repository, its CLAUDE.md and RESTART-STATUS.md. Open
items below come from Reminders.*
