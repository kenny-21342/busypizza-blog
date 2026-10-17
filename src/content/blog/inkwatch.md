---
title: 'InkWatch: generating a PCB from code, and what it caught'
description: 'A square e-paper calendar watch with no radio. The board is generated, routed and checked by scripts; two electrical questions block ordering it.'
pubDate: 2026-10-16
category: devlog
tags: ['hardware', 'pcb', 'esp32']
draft: false
project: inkwatch
---

InkWatch is a square e-paper watch: 24-hour time, today's Microsoft 365 calendar, a crown at
3 o'clock, a week or more per charge, and USB-C. It is sized against the iPod nano sixth
generation — 36.0 × 41.5 × 9.0 mm, where the nano is 37.5 × 39.6 × 8.8.

## No radio, on purpose

The watch has an ESP32-S3 with no radio, a 200×200 e-paper panel and an RTC. The calendar
reaches it over the same USB-C cable that charges it, when `inkwatchctl update` is run on a
Mac. A Mac-side daemon talks to Microsoft Graph and keeps the OAuth refresh token in the
Keychain. The README is blunt about the consequence: nothing happens on its own, and an
event added on a phone will not appear until the next plug-in and update.

## The board is code

Most of the commit history is hardware generated from scripts. On 7 September the PCB
generation was automated: two-sided placement that avoids collisions, an autorouter whose
output is DRC-clean, fab outputs, component heights modelled in the case (a 6.05 mm
connector was swapped for a 2.0 mm one to fit), and a JLCPCB bill of materials, not just a
placement file.

The checks earned their keep. They found that a charger chip was on the wrong footprint and
that 29 parts had no code, and on 10 September **five netlist bugs** along with the check
that found them. The routing tools were also changed to report the real best board instead of
a flattering one. On 9 September the design settled on a bare ESP32-S3 with no antenna.

## What blocks ordering

The latest commit, on 10 October, checkpoints the netlist fixes, routing, CAD and docs on a
branch (`hardware/netlist-fixes-and-routing`) that has not yet been merged. The open items
are specific: the **display panel's flex-connector pinout and a diode's orientation** are
unresolved, the bill of materials and the crown daughterboard are unfinished, and the
firmware has not been compiled for the target. The plan is to order only after those clear.

There is no deadline. One of the open items is, in effect, to give it one.

*Written on 16 Oct 2026 from the repository's README and commit history. Open items below
come from Reminders.*
