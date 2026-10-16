---
title: 'BetterNotes: nearby sync, and a release that has not happened yet'
description: 'An iPad and Mac notes app on PencilKit. The sync design is settled; the TestFlight and App Store dates have not been met on the evidence in the repo.'
pubDate: 2026-10-16
category: devlog
tags: ['ios', 'macos', 'swift']
draft: true
project: betternotes
---

BetterNotes is an iPadOS and iOS notes app built on PencilKit — handwriting, lasso
selection, imported PDFs and bring-your-own-key AI assistance — with a native Mac
companion for text, screenshots, page layout and AI. It is SwiftUI and SwiftData, and
the Xcode project is generated from `project.yml` with XcodeGen rather than edited by
hand.

The repository has 51 commits, from 24 August to 6 October 2026.

## The sync design

The original custom-server sync was removed. The apps now sync directly between **one
paired iPad and one Mac**, over Multipeer Connectivity with required session
encryption. The first connection has to be approved on both devices; after that they
reconnect on their own while both apps are open.

The interesting part is what happens when the same notebook was edited on both sides.
A Nearby Sync setting decides, and the default is to keep both, sending the copy to
Archive. A winning choice only applies when both devices are set the same way. Moving
something to Trash syncs like any other edit. A permanent delete is sent to the other
device, which asks its user before deleting, and never deletes a notebook that was
edited since the last sync. There is a written design for this in the repo
(`docs/superpowers/specs/2026-10-01-sync-conflict-and-delete-policy-design.md`), and an
editable archive remains as a recovery path.

## Recent work

The last two weeks of commits are mostly polish and correctness: tap-to-reveal for tape
with Apple Pencil, a blank page after undo or redo of a lasso move, a guard around the
rich-text migration with tests that old stores and lost baselines are safe, an Export
Editable Backup action, and two recording-playback fixes (one a freeze). The working
tree has two uncommitted items: a strings catalogue and an `ocr-bench/` folder.

## The dates

The README states two deadlines: **feature-complete on 30 September 2026** and **App
Store on 31 October 2026**. The repository does not show the first one being met as
such — work continued into October — and nothing in it records a TestFlight upload.
The TestFlight preparation reminder, due 12 October, is still open. With the App Store
date fifteen days away, the two items that gate it are confirming the Apple Developer
account and preparing the privacy material and screenshots.

*Written on 16 Oct 2026 from the repository, its CLAUDE.md and commit history. Open
items below come from Reminders.*
