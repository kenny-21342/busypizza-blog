---
title: 'How busypizza.bond and this blog fit together'
description: 'A one-file landing page with a subdomain per tool, and a blog whose publishing path is a schema, a build and a script.'
pubDate: 2026-10-16
category: devlog
tags: ['web', 'astro', 'meta']
draft: false
---

There are two sites. `busypizza.bond` is the tools hub; this blog lives on
`www.busypizza.xyz`. They are deliberately separate projects that point at each other.

## The tools hub

`busypizza-home` is a static, single-file site: `index.html` is the whole thing, with no
build step and no dependencies. The plan it documents is one Vercel project per tool, each on
its own subdomain:

| Host | What |
|---|---|
| `busypizza.bond`, `www.` | the landing page |
| `study.busypizza.bond` | [YKPao Study](/blog/ykpao-study-development-log/) |
| `tts.busypizza.bond` | [Shanghainese TTS](/blog/shanghainese-tts-site/) |
| `tikz.busypizza.bond` | [TikZ Generator](/blog/tikz-generator/) |
| `graphviz.busypizza.bond` | [Graphviz Generator](/blog/graphviz-generator/) |

YKPao Study is the featured item. Its link goes to the site root, which is a login wall for
anyone not signed in, so student work stays behind that login and listing the product exposes
nothing beyond its name. A `speech.` subdomain was planned for the TTS tool and never used;
the tool shipped on `tts.` and the old host returns 404.

## This blog

It is an Astro static site, deployed from `main` on every push. Posts are Markdown written in
Typora. A content-collection schema is the guard rail: a missing or misspelled frontmatter
field fails the build instead of shipping a broken post, and `draft` defaults to true so a
half-written file cannot go out.

Publishing is a script. `npm run publish` slugifies the filename, moves Typora's image
folder along with it, flips the draft flag, builds to validate, and only then commits and
pushes — so a bad field fails locally, not as a red deploy. A watcher (`npm run watch`) adds a
drop folder, `posts-inbox/`: a Markdown file left there has its missing frontmatter filled in
and is handed to the same pipeline.

## What changed on 16 October

The [Projects](/projects) page and `npm run sync:todos` were added. The page lists every
project, its status and its open items with dates; the script reads those from Apple
Reminders into a data file, so a date is changed in one place and the site follows. Dev logs
can set `project:` in their frontmatter to show that project's open items under the post.

*Written on 16 Oct 2026 from the READMEs of both repositories.*
