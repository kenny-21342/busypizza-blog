# www.busypizza.xyz — blog

Astro static site. Posts are markdown written in **Typora** and published by
script. No CMS, no database, no server to patch.

## Publishing by dropping a file

```bash
npm run watch          # leave running; ctrl-c to stop
```

Then save or drag **any** `.md` file into `posts-inbox/` and it goes live on its
own. The watcher waits for the file to stop changing, fills in whatever
frontmatter is missing — `title` from the leading `# heading`, `description` from
the first paragraph, today's date — moves it (and Typora's sibling `.assets/`
folder) into `src/content/blog/` under a slugified name, then runs the same
`publish` pipeline below: build, commit, push.

A subfolder sets the category — `posts-inbox/writing/x.md` gets
`category: writing`; a file at the top level defaults to `devlog`.

Files are **moved** out of the inbox, so nothing is published twice. `posts-inbox/`
is gitignored.

```bash
npm run drain          # process whatever is sitting in the inbox, then exit
npm run watch -- --dry-run    # show what would happen, change nothing
npm run watch -- --no-push    # commit locally, don't push
```

Drafting in Typora directly under `src/content/blog/` still works and is the
better option for a post you want to sit on — the watcher only ever touches the
inbox, so it will not publish a half-finished draft out from under you.

## Projects and their dates

`/projects` lists every project with its status and open items. The items and dates are
not written here — Apple Reminders is the ledger, and the site mirrors it:

```bash
npm run sync:todos     # reads the project lists in Reminders -> src/data/todos.json
```

macOS only; the first run asks permission to control Reminders. Which lists are
published is the `LISTS` map at the top of `scripts/sync-todos.mjs`, and lists left out
(a private project, school homework) say why in a comment there. An item with no due
date is shown as "no date set" rather than given one.

Projects themselves live in `src/data/projects.ts`. Two optional fields cover the places
where Reminders alone is wrong or silent: `target` (a date the project's own README
states, for a project with no list) and `note` (where the list and the repo disagree).

A dev log sets `project: <slug>` in its frontmatter to show that project's open items
under the post. An unknown slug fails the build.

`todos.json` is a snapshot: re-run the sync and commit it to refresh the page.

## Writing a post by hand

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
project: betternotes      # optional; slug from src/data/projects.ts
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
| `posts-inbox/` | drop folder — a `.md` left here is published automatically |
| `scripts/watch-posts.mjs` | the drop-folder watcher |
| `scripts/sync-todos.mjs` | Reminders -> `src/data/todos.json` |
| `src/data/projects.ts` | the project registry behind `/projects` |
| `src/pages/projects.astro` | status, deadlines and open items, across projects |
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
