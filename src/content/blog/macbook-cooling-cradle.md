---
title: 'A cooling cradle for a fanless MacBook Air, powered by its own USB-C port'
description: 'The constraint is that a Mac offers only 5 V downstream. Every design choice in the 3D-printed cradle follows from that. Whether it works is not yet measured.'
pubDate: 2026-10-16
category: devlog
tags: ['hardware', '3d-printing']
draft: true
project: mba-cooling-case
---

The MacBook Air M3 has no fan. This project is a 3D-printed drop-in stand that holds the
laptop over a sealed 12 mm plenum and pushes about 100 CFM across its underside. It is
powered and controlled entirely by the laptop's own USB-C port: no wall adapter, no
soldering, and every port still usable.

## The constraint

The README opens with the one fact that determines the rest: a Mac's Thunderbolt port,
acting as a power *source*, offers **5 V only**. It does not advertise 9, 12 or 20 V
downstream, so a USB-PD trigger board receives 5 V no matter what it asks for. Every fan in
the build is therefore a native 5 V PWM fan, and the whole thing draws 0.55 A (2.75 W)
against a 1.5–3 A budget.

## What is in the repository

A parametric OpenSCAD model (`cad/case.scad`, with a switch for the 13- or 15-inch model
and parameters for where the printed seams fall and where the port opening sits), and a
`build.py` that works out seam positions for a given printer bed, exports every STL and
renders the guide images. The build guide is a PDF. The repository has two commits: the
cradle itself on 7 September, and an update to the CAD, STLs and guide on 10 October.

## What has not happened

None of the claims about cooling have been measured. The open items are, in order: finalise
and print the cradle, measure thermals and power on the actual MacBook Air, and only then
commit the tested build package. The numbers above are design figures, not results.

There are no dates on these items.

*Written on 16 Oct 2026 from the repository's README and commit history. Open items below
come from Reminders.*
