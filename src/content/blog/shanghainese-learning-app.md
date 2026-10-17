---
title: 'The Shanghainese app: all the lessons are drafts'
description: 'An offline, audio-first course for Mandarin speakers. The app and recording pipeline work; the course content is not yet cleared to ship.'
pubDate: 2026-10-16
category: devlog
tags: ['audio', 'education', 'react-native']
draft: false
project: shanghai-dialect
---

The Shanghainese learning app is an offline, audio-first course for Mandarin speakers.
It is a React Native app with unit lessons, spaced review and self-judged pronunciation
practice: a learner hears the recording, says the phrase, hears themselves against the
recording and decides whether it was close enough.

## Where it stands

The README is direct about the gap between the software and the course:

- The app and the recording pipeline work, with a **partial** authoring corpus.
- **All nine lesson units are drafts.** All 180 current phrases have draft Simplified
  Chinese meanings; a native speaker still has to review them.
- **Public builds are blocked** until the roughly 500-phrase course has confirmed Wugniu
  readings and approved recordings.
- A pilot corpus is kept for the maintainer but excluded from the app bundle.

The decisions behind the audio, the romanisation and the practice screen are written down
in `docs/audio-strategy.md`, `docs/romanisation.md` and `docs/pronunciation.md`, and the
README asks that they be read before those areas are edited. `npm run course:status`
prints the current counts.

## What the commit history shows

There are 39 commits from 6 September to 10 October. The early ones are about the
content pipeline: verifying generated files against what the app expects, recording each
sentence once rather than once per phrase that uses it, reporting repeated phrase text,
and reading the notes (備註) column of the source data to take the open pronunciation
readings from 35 down to 7.

The later ones are about making it a real app: prebuilding and signing for iOS, adopting
UIScene so it launches on iOS 26 and later, setting the audio session so tapped phrases
are actually audible, trimming recordings on speech instead of on the click before it,
and keeping a unit's review inside that unit.

## The date

The README targets a public iOS and Android release on **30 June 2027**. This project has
no Reminders list, so there are no dated sub-tasks for it; the date below is the one
stated in its README.

*Written on 16 Oct 2026 from the repository's README and commit history.*
