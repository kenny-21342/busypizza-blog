#!/usr/bin/env node
/**
 * `npm run watch`   — watch the drop folder and publish anything left in it.
 *
 * Drop (or save, or drag) a `.md` file into `posts-inbox/` and this:
 *   1. Waits for the file to stop changing, so a half-written save is never read.
 *   2. Fills in any missing frontmatter — title from the leading `# heading`,
 *      description from the first paragraph — so a plain markdown file works.
 *   3. Moves it, and Typora's sibling `<name>.assets/` folder, into
 *      `src/content/blog/` under a slugified name.
 *   4. Hands it to `scripts/publish.mjs`, which builds, commits and pushes.
 *
 * A subfolder sets the category: `posts-inbox/writing/x.md` → category: writing.
 * Files are MOVED out of the inbox, so nothing is ever published twice.
 *
 * Flags: --once (drain the inbox and exit — good for a cron or a hook),
 *        --dir <path>, --no-push, --dry-run (both passed through to publish).
 */
import { spawnSync } from 'node:child_process';
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	statSync,
	unlinkSync,
	watch,
	writeFileSync,
} from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import { slugify } from './lib/slugify.mjs';

const BLOG_DIR = join('src', 'content', 'blog');
const CATEGORIES = ['writing', 'devlog'];
const DEFAULT_CATEGORY = 'devlog';

const args = process.argv.slice(2);
const once = args.includes('--once');
const dirFlag = args.indexOf('--dir');
const INBOX = dirFlag !== -1 ? args[dirFlag + 1] : process.env.POSTS_INBOX || 'posts-inbox';
// Everything publish.mjs understands, forwarded untouched.
const passthrough = args.filter((a) => ['--no-push', '--dry-run'].includes(a));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isPost = (f) => /\.mdx?$/i.test(f) && !basename(f).startsWith('.');

/** Wait until size and mtime hold steady — a file still being written is not ready. */
async function settle(file, { interval = 400, stableFor = 2, timeout = 30_000 } = {}) {
	const deadline = Date.now() + timeout;
	let last = null;
	let steady = 0;
	while (Date.now() < deadline) {
		if (!existsSync(file)) return false;
		const { size, mtimeMs } = statSync(file);
		const now = `${size}:${mtimeMs}`;
		steady = now === last ? steady + 1 : 0;
		last = now;
		if (steady >= stableFor) return true;
		await sleep(interval);
	}
	console.warn(`  ! ${basename(file)} kept changing for 30s — publishing it anyway.`);
	return true;
}

const quote = (s) => `'${String(s).replace(/'/g, "''")}'`;

/**
 * First paragraph of prose, skipping headings, images, quotes and code fences.
 * Markdown written in Typora is hard-wrapped, so the paragraph is joined across
 * its lines before trimming — taking a single line would cut mid-sentence.
 */
function firstParagraph(body) {
	const lines = body.split(/\r?\n/);
	let inFence = false;
	const collected = [];
	for (const line of lines) {
		const t = line.trim();
		if (/^(```|~~~)/.test(t)) { inFence = !inFence; continue; }
		if (inFence) continue;
		if (!t) { if (collected.length) break; continue; }
		if (/^(#|>|!\[|\||-{3,}|\*|-\s|\d+\.\s)/.test(t)) {
			if (collected.length) break;
			continue;
		}
		collected.push(t);
	}
	const text = collected.join(' ').replace(/[*_`[\]]/g, '').replace(/\s+/g, ' ').trim();
	if (text.length <= 160) return text;
	// Prefer a whole sentence; fall back to a word boundary rather than mid-word.
	const sentence = text.slice(0, 200).match(/^.*?[.!?](?=\s|$)/);
	if (sentence && sentence[0].length >= 60) return sentence[0];
	return `${text.slice(0, 157).replace(/\s+\S*$/, '')}…`;
}

/**
 * Return the file's content with every schema-required field present.
 * Existing frontmatter is preserved; only missing keys are added.
 */
function ensureFrontmatter(raw, { fallbackTitle, category }) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	let fm = match ? match[1] : '';
	let body = match ? raw.slice(match[0].length) : raw;

	// A leading `# Title` becomes the title — the layout renders it already, so
	// leaving it in the body would print the title twice.
	let heading = null;
	const h1 = body.match(/^\s*#\s+(.+?)\s*$/m);
	if (h1 && body.slice(0, body.indexOf(h1[0])).trim() === '') {
		heading = h1[1];
		body = body.slice(body.indexOf(h1[0]) + h1[0].length).replace(/^\r?\n/, '');
	}

	const has = (key) => new RegExp(`^\\s*${key}\\s*:`, 'm').test(fm);
	const add = (line) => { fm = fm ? `${fm}\n${line}` : line; };

	if (!has('title')) add(`title: ${quote(heading || fallbackTitle)}`);
	if (!has('description')) add(`description: ${quote(firstParagraph(body))}`);
	if (!has('pubDate')) add(`pubDate: ${new Date().toISOString().slice(0, 10)}`);
	if (!has('category')) add(`category: ${category}`);
	if (!has('tags')) add('tags: []');
	// publish.mjs flips this to false; going through draft keeps one code path.
	if (!has('draft')) add('draft: true');

	return `---\n${fm}\n---\n\n${body.replace(/^\r?\n+/, '')}`;
}

/** rename(), falling back to copy+unlink when the inbox is on another volume. */
function move(from, to) {
	try {
		renameSync(from, to);
	} catch (err) {
		if (err.code !== 'EXDEV') throw err;
		if (statSync(from).isDirectory()) {
			mkdirSync(to, { recursive: true });
			for (const entry of readdirSync(from)) move(join(from, entry), join(to, entry));
			rmSync(from, { recursive: true });
		} else {
			copyFileSync(from, to);
			unlinkSync(from);
		}
	}
}

/** Move one dropped file into the blog collection and publish it. */
async function intake(file, category) {
	if (!(await settle(file))) return;

	const ext = extname(file).toLowerCase();
	const stem = basename(file, extname(file));
	const slug = slugify(stem);
	if (!slug) { console.error(`  ✗ ${basename(file)}: filename slugifies to nothing — rename it.`); return; }

	const dest = join(BLOG_DIR, `${slug}${ext}`);
	if (existsSync(dest)) {
		console.error(`  ✗ ${basename(file)}: ${dest} already exists. Rename the drop, or edit the post in place.`);
		return;
	}

	console.log(`\n→ ${basename(file)}  (category: ${category})`);
	const content = ensureFrontmatter(readFileSync(file, 'utf8'), { fallbackTitle: stem, category });

	mkdirSync(BLOG_DIR, { recursive: true });
	writeFileSync(dest, content, 'utf8');
	unlinkSync(file);

	// Typora keeps pasted screenshots in a sibling `<name>.assets/` folder.
	const assets = join(resolve(file, '..'), `${stem}.assets`);
	if (existsSync(assets)) {
		const destAssets = join(BLOG_DIR, `${slug}.assets`);
		if (existsSync(destAssets)) rmSync(destAssets, { recursive: true });
		move(assets, destAssets);
		console.log(`  assets → ${destAssets}`);
	}
	console.log(`  ${file} → ${dest}`);

	const result = spawnSync(process.execPath, [join('scripts', 'publish.mjs'), slug, ...passthrough], {
		stdio: 'inherit',
	});
	if (result.status !== 0) {
		console.error(`\n  ✗ publish failed for ${slug}. The post is in ${BLOG_DIR}/ — fix it and re-run:\n      npm run publish -- ${slug}\n`);
	}
}

/** Every post file sitting in the inbox, with the category its folder implies. */
function pending() {
	if (!existsSync(INBOX)) return [];
	const found = [];
	for (const entry of readdirSync(INBOX, { withFileTypes: true })) {
		const path = join(INBOX, entry.name);
		if (entry.isDirectory()) {
			if (!CATEGORIES.includes(entry.name)) continue;
			for (const inner of readdirSync(path)) {
				if (isPost(inner)) found.push([join(path, inner), entry.name]);
			}
		} else if (isPost(entry.name)) {
			found.push([path, DEFAULT_CATEGORY]);
		}
	}
	return found;
}

// One drain at a time: publish builds, commits and pushes, and two of those
// racing would interleave in the index.
let draining = false;
let queued = false;
async function drain() {
	if (draining) { queued = true; return; }
	draining = true;
	try {
		do {
			queued = false;
			for (const [file, category] of pending()) await intake(file, category);
		} while (queued);
	} finally {
		draining = false;
	}
}

// ── main ────────────────────────────────────────────────────────────────────

mkdirSync(INBOX, { recursive: true });
for (const c of CATEGORIES) mkdirSync(join(INBOX, c), { recursive: true });

if (once) {
	const found = pending();
	if (found.length === 0) console.log(`Nothing in ${INBOX}/. Nothing to do.`);
	await drain();
	process.exit(0);
}

console.log(`Watching ${resolve(INBOX)}`);
console.log(`  drop a .md file here to publish it  (writing/ or devlog/ to set the category)`);
console.log(`  ctrl-c to stop\n`);

await drain();

let debounce = null;
watch(INBOX, { recursive: true }, () => {
	clearTimeout(debounce);
	debounce = setTimeout(() => { drain().catch((e) => console.error(e)); }, 500);
});
