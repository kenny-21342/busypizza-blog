---
title: 'Wage Transparency Tool: a hard constraint, and gates before any riders'
description: 'A tool for delivery riders to log trips and see what an hour of their time earned. Self-reported only, by design, with privacy and ethics gates before recruitment.'
pubDate: 2026-10-16
category: devlog
tags: ['nextjs', 'research', 'privacy']
draft: true
project: wage-transparency-tool
---

The Wage Transparency Tool lets delivery riders log their trips and get back their own
income breakdown — the figure no platform app shows them: **what an hour of their time
actually earned, across every platform they work.** The aggregate data is meant to become a
public transparency report, and it feeds the [Delivery Simulator](/blog/delivery-simulator/)
through a CSV export. The README states a deadline of **30 June 2027**.

## The constraint that shapes everything

The first section of the README is a prohibition. All trip data is **rider self-reported**.
The project will never automate login to a delivery platform, scrape one, or read its
account programmatically — not with credentials, session tokens or an unofficial API, "not
just for testing". It gives two reasons, and says the second matters more: it violates the
platforms' terms, and asking a rider for their platform credentials asks them to risk
deactivation — their income — for the builder's convenience.

## What has been built

The repository is a Next.js app with a Supabase schema, an Android directory and a Docker
setup. Its commits from 20 September cover:

- Research into the statutory social-insurance (社保) figures, which found that **every
  hourly minimum used until then was too low**.
- Making the tool installable and offline-capable, and host-agnostic.
- Fixing **two silent data defects in the offline queue** — the kind of bug that loses a
  rider's trips without telling them.
- An end-to-end check that the tool and the simulator agree on take-home pay (到手).

A checkpoint on 10 October covers trip logging, the installable app and the docs.

## The gates

The dated items are mostly gates, in order, before any rider is involved: confirm ethics and
data-protection requirements (10 November), finalise a Chinese privacy policy and consent (20
November), decide hosting and deploy an accessible rider app (15 December), and only then
begin recruitment (5 January 2027), "only after the gate clears". Several earlier tasks have no date:
verify the social-insurance rates and benchmark sources, make +86 SMS signup work end to end,
and apply the trip-correction migration and test offline capture.

*Written on 16 Oct 2026 from the repository's README and commit history. Open items below
come from Reminders.*
