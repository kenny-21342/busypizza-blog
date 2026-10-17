---
title: 'YKPao Study, October: tagging the question bank, and a worksheet export'
description: 'Fifteen commits since the development log: skill tags, difficulty reasons, search, and printable worksheets.'
pubDate: 2026-10-16
category: devlog
tags: ['nextjs', 'education', 'ai']
draft: false
project: ykpao-study
---

The main [development log](/blog/ykpao-study-development-log/) was written when the
repository stood at 405 commits. It is at 420 now, and the work since has a clear theme: making
the question bank easier to search, trust and take away.

## Seeing what the bank knows

- **Mark-scheme strips for IB.** On 12 October, mark-scheme images that IB students could not
  see were added to the bank.
- **A Peek on every Practice row.** It shows a question's skill tags and *why* it sits at its
  difficulty level, so the level is explained rather than asserted.
- **Search by question number or keyword**, and Practice now remembers its filters.
- **Sub-part tagging**, with filters for paper variant, time zone and level (16 October).

## Getting tags into the database

An `apply-tags.mjs` script pushes skill tags and difficulty reasons to the database. It was
first written on 15 October and reworked the next day to **batch the inserts, commit per
batch, and log every stage** — the difference between a long import that can be resumed and
one that cannot.

A neighbouring fix on 12 October stopped the app from holding the database open while it
checks thousands of images.

## Taking questions away

On 16 October, selected questions can be exported as a **printable PDF worksheet**. A small
detail in the history: the export bar had to drop a drop-shadow because the project's design
test forbids it, which says something about how the interface is held to its own rules.

Earlier, on 30 September, image uploads of up to 20 MB were accepted by shrinking them in the
browser, and the upload prompts stopped promising 25 MB when the real limit was 4.

This project has no Reminders list; its tracked-work page shows none.

*Written on 16 Oct 2026 from the repository's commit history.*
