---
title: 'D7000 robotic camera: the software ran before the hardware existed'
description: 'A pan-tilt rig that scans a scene, scores frames and triggers a Nikon D7000. The control stack has run on a real Pi and camera; the parts are not yet ordered.'
pubDate: 2026-10-16
category: devlog
tags: ['hardware', 'python', 'photography']
draft: false
project: d7000-control
---

This is a build package for a robotic camera head: a pan-tilt rig that holds a Nikon
D7000, scans a scene, scores what it sees and fires the shutter on the frames worth
keeping. The target is to be trip-ready on **20 April 2027**.

## What the package contains

The README is a file map, and it shows how much of the system is already code:

- A Raspberry Pi service in Python — a libgphoto2 wrapper for live view and RAW+JPEG
  download, an optocoupler shutter release with a persisted actuation budget, exposure
  convergence toward the brightest histogram that does not clip, the autonomous
  scan-score-trigger loop with JSONL logging of every decision, and a FastAPI backend.
- **A fake rig that speaks the same API**, so everything can be developed with no
  hardware attached.
- A React Native phone app, and a scoring stack: a gate, an aesthetics model (NIMA), composition
  heuristics, a blend, de-duplication, and an optional CLIP-plus-logistic head trained on
  the owner's own library.
- Firmware for the motion controller, CAD for the pan column, and a `BUILD_MANUAL.md`
  holding the torque arithmetic, bills of materials, milestones and a risk register.

## What running it for real found

The commits from 19 September are the useful part, because that is when the stack first ran
on the actual Pi and camera, and it did not behave as the simulator did:

- The loop **could never fire**; that was found by running it on the Pi.
- The composition scorer, on inspection, **was really a horizon detector**.
- The D7000's live-view histogram turned out to be useless for exposure.
- The lens was corrected to 18–270 mm and the planner was changed to read it live.
- NIMA was rewired as a **veto** rather than a nominator.
- The composition heuristics were made 1.9 times faster without changing a single score.

## The motion controller changed

On 1 October the motion controller moved from an ESP32 to an **Arduino Uno R4 WiFi**.
The next day brought bench measurements of the MPU-6050 motion sensor, a fix to the
settle logic so that it counts new IMU samples rather than main-loop passes, and the
discovery that the Uno R4 does not fit the electronics box — a separate box is drafted.

## What is left

Everything physical. The reminders run in order: finalise the bill of materials (20
November), order the parts (30 November), send the five STLs, which are already exported,
to a printer (5 December), then the Pi and camera over USB, the shutter release, torque
validation under load, assembly, field tests and a full rehearsal on 18 April. One caution,
also stated on the project page: one open item still names the old ESP32 firmware path.

*Written on 16 Oct 2026 from the repository's README and commit history. Open items below
come from Reminders.*
