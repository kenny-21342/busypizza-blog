# www.busypizza.xyz — blog

Astro static site. Posts are markdown written in **Typora** and published by
script. No CMS, no database, no server to patch.

## Writing a post

```bash
npm run new -- "Post title" devlog     # or: writing
open -a Typora src/content/blog/post-title.md
```

`npm run new` writes frontmatter that already satisfies the schema, so Typora is
only ever editing a file that builds.

Preview while writing — drafts are visible in dev, invisible in production:

```bash
npm run dev
```

Publish:

```bash
npm run publish -- post-title          # or bare: publishes every draft
npm run publish -- --dry-run           # show what would happen
npm run publish -- post-title --no-push
```

`publish` slugifies the filename, moves Typora's sibling `.assets/` folder with it
and rewrites the image references, flips `draft: true` → `false`, **builds to
validate**, then stages by path, commits, and pushes. Vercel deploys on push.

The build runs before the commit deliberately: a bad frontmatter field fails
locally rather than becoming a red deploy.

## Typora setup (once)

**Preferences → Image**

- *When insert local image*: **Copy image to custom folder** → `./${filename}.assets`
- Tick **Use relative path if possible**

Astro's markdown pipeline optimizes relative image references natively, so pasted
screenshots need no extra step.

Also turn on YAML front matter display so the schema fields are editable as a form.

## Frontmatter

```yaml
---
title: 'Post title'
description: 'One sentence. Used on listings, RSS, and og:description.'
pubDate: 2026-09-09
updatedDate: 2026-09-20   # optional
category: devlog          # devlog | writing
tags: ['dns', 'security'] # free-form; each gets a /tags/<tag>/ page
draft: true               # publish script flips this
heroImage: ./cover.png    # optional, relative path
---
```

The schema lives in `src/content.config.ts` and is the single source of truth —
anything it rejects will not build.

## Layout

| Path | What |
|---|---|
| `src/content/blog/` | posts, one markdown file each |
| `src/content.config.ts` | frontmatter schema |
| `src/lib/posts.ts` | shared queries; draft filtering lives here |
| `src/pages/writing.astro`, `devlog.astro` | category indexes |
| `src/pages/archive.astro` | everything, grouped by year |
| `src/pages/tags/[tag].astro` | per-tag pages |
| `src/styles/global.css` | palette, taken from the busypizza.bond landing page |
| `scripts/publish.mjs` | the publish pipeline |

Code blocks use Astro's built-in Shiki with a light/dark theme pair, highlighted at
build time — no client-side highlighter.

## Deploying

Live at **https://www.busypizza.xyz**, deployed from `main` on every push.

The canonical host is `www`; the apex 308-redirects to it, which is how Vercel
configured the pair. `astro.config.mjs` `site`, `SITE_URL` in `src/consts.ts`, and
`SITE` in `scripts/publish.mjs` must all agree with whichever host is canonical —
if the redirect is ever flipped to make the apex primary, change all three.

- Repo: `github.com/kenny-21342/busypizza-blog` (private)
- Vercel project: `busypizza-blog` under the `YKPao Study` team
- DNS: Cloudflare (`collins`/`harvey.ns.cloudflare.com`), records DNS-only, proxy off
