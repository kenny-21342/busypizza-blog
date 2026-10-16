---
title: 'Shanghainese TTS: a text box that talks'
description: 'Type Chinese text, hear it in Shanghainese. How a ten-commit prototype ended up with rate limiting, chunking and a rewrite step.'
pubDate: 2026-10-16
category: devlog
tags: ['audio', 'web', 'nextjs']
draft: true
project: tts-site
---

The TTS site does one thing: you type Chinese text and it plays the text back in
Shanghainese. The README describes it as a prototype of the first MVP — text in, audio
out, played inline — and the landing-page repository lists it as live.

## Why one provider

The README's argument is that Shanghainese eliminates almost every text-to-speech
provider. Of the three that remain, Qwen3-TTS is the only hosted one with independently
published Wu-dialect quality figures, and it holds up best on hard input — which is what
a public text box produces. The longer reasoning is linked from the README.

## What the ten commits added

The repository started from a Create Next App commit on 23 August 2026 and had the core
flow the same day. Over the next few days it gained the things a public endpoint needs:

- Long text is **split into parts**, synthesised separately and joined back into one clip.
- A playback-speed control and a WAV download.
- An origin check and rate limiting on the synthesis endpoint, later changed to count in a
  **shared store** when one is configured, so the limit holds across serverless instances.
- An accessibility and mobile pass.
- On 27 September, a Shanghainese rewrite step and the production deployment config.

The project has no open items and no Reminders list; it is shipped. A related but separate
project is the [Shanghainese learning app](/blog/shanghainese-learning-app/).

*Written on 16 Oct 2026 from the repository's README and commit history.*
