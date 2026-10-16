---
title: 'Smart Notebook: moving the sensor from the notebook to the pen'
description: 'A redesign on 24 September, a decoder bake-off that picked ArUco tiles over De Bruijn dots, and a Reminders list that still describes the old design.'
pubDate: 2026-10-16
category: devlog
tags: ['hardware', 'python', 'research']
draft: true
project: smart-notebook
---

Smart Notebook records handwriting from ordinary paper. The current design is a
**clip-on sleeve near the pen's nib** with a small camera that reads a printed dot or
fiducial pattern and decodes an absolute position and page identity on every frame — in the
style of the Anoto and Livescribe pens — then streams it over BLE to a laptop. There is no
sensor board in the notebook, no clipboard backing and no dock.

## The pivot

On 24 September the repository archived its earlier design — a fixed sensor panel with
disc binding, and a clipboard dock — and started the pen-camera build. The old plan is
kept whole under `old-plan/`, with a survey of what carried forward, rather than deleted.
One practical gain is that page identity comes free from the position decode itself.

## Phase 1: choosing a pattern by measuring

The decoders are pure Python with no hardware, and all of Phase 1 was committed on 24
September. The commits tell it in order:

1. Shared geometry and two pattern generators.
2. A **De Bruijn** dot-grid decoder: 100 percent on clean crops, after two real bugs.
3. An **ArUco** tile decoder: 100 percent on clean crops, with no rotation ambiguity.
4. A camera-degradation simulator, then the bake-off. **ArUco won**, and the commit says
   De Bruijn's failure is *structural*, not a tuning problem.
5. ArUco's tilt-tolerance gap closed by majority vote instead of unanimity.

Phase 2, the hardware-independent firmware pieces, is scaffolded. The firmware itself, the
laptop app and the enclosure are marked not started in the README.

## A mismatch worth knowing about

The Reminders list for this project was written for the **earlier** design: it talks about
a disc-binding chassis, sheet-removal detection and a deferred dock. The repository has
moved past that. The most recent commit, on 10 October, adds an IMU backup plan, a print
test sheet and a project plan. Until the list is rewritten, treat its hardware tasks as
stale — the project page says the same.

*Written on 16 Oct 2026 from the repository's README and commit history. Open items below
come from Reminders and predate the pivot.*
