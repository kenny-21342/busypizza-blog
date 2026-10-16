---
title: 'Delivery Simulator: a game built against a frozen data contract'
description: 'A driving game about delivery-rider economics that cannot tell real data from synthetic, because the interface was frozen before either side existed.'
pubDate: 2026-10-16
category: devlog
tags: ['unity', 'games', 'research']
draft: true
project: delivery-simulator
---

The Delivery Simulator is a driving game about the economics of 外卖, food delivery in
China. It is the second half of a pair: the [Wage Transparency
Tool](/blog/wage-transparency-tool/) collects what riders actually earn, and the game makes
those numbers playable.

## One frozen interface

The two halves meet at a single documented interface, the trip CSV contract, which lives in
the tool's repository. The game reads the tool's aggregate export and, by design, **cannot
tell it apart from synthetic data** — which the README gives as the reason the contract was
frozen before either side was built.

## What the commits show

The economy layer was brought to contract version 3, with Chinese units — 分, kilometres,
fines — and the difference between *grabbing* an order and having one *dispatched* (抢单
against 派单). A later part added electric scooters, a late-delivery countdown that "bites",
and residential compounds (小区) that cost minutes. A check compares the CSV contract against
the file actually shipped, and an end-to-end fixture prints the take-home figure so the two
projects can be compared. The most recent commit, on 10 October, covers the economy, scene
and router.

It is a Unity 6000.0.83f1 project. The scene is built in code by an editor script rather
than committed as a hand-assembled asset, so it can be regenerated and reviewed as a diff,
and `scripts/check.sh` rebuilds it and runs every check. A script produces a Windows
release package.

## The dates

The HUD should look like a gig-work app (25 April 2027). Windows build support and a
playable package come by 25 June, a playtest of the shift loop with riders by 20 May, and a
clearly labelled playable build is published by **30 June 2027**. One undated item is to
verify the game's economy numbers against the wage tool's fixture.

*Written on 16 Oct 2026 from the repository's README and commit history. Open items below
come from Reminders.*
