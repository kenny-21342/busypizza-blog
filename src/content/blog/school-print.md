---
title: 'School Print: from a phone to the campus printer'
description: 'Printing from the normal Share menu to the school printers, with jobs released at the printer by school login. The deployment moved from a Pi to an iMac, and may move again.'
pubDate: 2026-10-16
category: devlog
tags: ['ios', 'python', 'infrastructure']
draft: false
project: school-printer
---

School Print lets a phone or iPad print from its ordinary Share → Print menu to the
school's campus printers, and release the job at the printer with the student's own
school login.

## How it got here

The repository has 16 commits from 16 August to 7 October 2026, and the architecture
changed twice.

- **August.** An iOS client and a server relay, with a large batch of fixes on both sides:
  crashes, session handling, memory, keychain use, and a spool leak.
- **September.** The relay moved off a Raspberry Pi and onto an iMac, which now runs the
  whole pipeline and prints Office files locally. By late September the iMac's printer
  queue was exposed over native IPP so iOS sees an ordinary AirPrint printer, and the
  pilot was scoped to iPhone.
- **October.** Per-student printers, so each student's jobs are attributed to their own
  account, along with the registration step and a signed iOS Shortcut route.

## Where it stands

The README now opens with a different problem: the iMac is being moved to Arch Linux with
Hyprland, and the repository has a setup and migration guide for it, including a
live-state backup command, headless LibreOffice conversion, systemd services and Avahi
for AirPrint. The open question there is stated plainly — a Linux-compatible driver for
the campus printer is required, and the existing macOS filter cannot be reused.

The working tree has 17 uncommitted files. This project has no Reminders list and no
stated deadline.

This write-up deliberately stays at this level. How the identity of a print job is
decided is a security property of a school system, and it does not belong on a public
blog.

*Written on 16 Oct 2026 from the repository's README and commit history.*
