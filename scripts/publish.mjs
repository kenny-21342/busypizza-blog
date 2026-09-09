#!/usr/bin/env node
/**
 * `npm run publish -- [slug-or-path ...]`   (no args = every current draft)
 *
 * Takes a file Typora just saved and makes it live:
 *   1. Slugify the filename, and move Typora's `<name>.assets/` folder with it,
 *      rewriting the image references inside the post.
 *   2. Flip `draft: true` -> `false`, stamping today's date if pubDate is unset.
 *   3. Build, so a schema violation fails here rather than on Vercel.
 *   4. Stage the post and its assets BY PATH, commit, push. Vercel deploys on push.
 *
 * Flags: --dry-run (show what would happen), --no-push (commit only).
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join } from 'node:path';
import { slugify } from './lib/slugify.mjs';

const BLOG_DIR = join('src', 'content', 'blog');
const SITE = 'https://www.busypizza.xyz';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noPush = args.includes('--no-push');
const targets = args.filter((a) => !a.startsWith('--'));

const run = (cmd, cmdArgs) =>
	execFileSync(cmd, cmdArgs, { stdio: 'pipe', encoding: 'utf8' }).trim();

function fail(msg) {
	console.error(`\n✗ ${msg}\n`);
	process.exit(1);
}

/** Split a markdown file into its frontmatter block and body. */
function splitFrontmatter(raw, file) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) fail(`${file} has no YAML frontmatter. Run \`npm run new\` to scaffold one.`);
	return { fm: match[1], body: raw.slice(match[0].length), rawFm: match[0] };
}

/** Resolve a slug, bare filename, or path into an existing post file. */
function resolvePost(target) {
	const candidates = [
		target,
		join(BLOG_DIR, target),
		join(BLOG_DIR, `${target}.md`),
		join(BLOG_DIR, `${target}.mdx`),
	];
	const hit = candidates.find((c) => existsSync(c));
	if (!hit) fail(`Could not find a post matching "${target}" in ${BLOG_DIR}/`);
	return hit;
}

function findDrafts() {
	if (!existsSync(BLOG_DIR)) return [];
	return readdirSync(BLOG_DIR)
		.filter((f) => f.endsWith('.md') || f.endsWith('.mdx'))
		.map((f) => join(BLOG_DIR, f))
		.filter((f) => /^\s*draft:\s*true\s*$/m.test(readFileSync(f, 'utf8')));
}

/**
 * Rename the post to a slugified filename and bring Typora's sibling asset
 * folder along, rewriting references in the body.
 * Returns { file, assetDir } at their final paths.
 */
function normalizeNames(file, body) {
	const ext = extname(file);
	const oldBase = basename(file, ext);
	const newBase = slugify(oldBase);
	const dir = dirname(file);

	const oldAssets = join(dir, `${oldBase}.assets`);
	const newAssets = join(dir, `${newBase}.assets`);
	const hasAssets = existsSync(oldAssets);

	let newBody = body;
	if (hasAssets && oldBase !== newBase) {
		// Typora writes references as `<name>.assets/img.png`, URL-encoding spaces.
		const encoded = encodeURIComponent(`${oldBase}.assets`).replace(/%2F/g, '/');
		for (const needle of [`${oldBase}.assets`, encoded, `${oldBase}.assets`.replace(/ /g, '%20')]) {
			newBody = newBody.split(needle).join(`${newBase}.assets`);
		}
	}

	if (oldBase === newBase) {
		return { file, assetDir: hasAssets ? oldAssets : null, body: newBody, renamed: false };
	}

	const newFile = join(dir, `${newBase}${ext}`);
	if (existsSync(newFile)) fail(`Cannot rename ${file} -> ${newFile}: target already exists.`);

	if (!dryRun) {
		renameSync(file, newFile);
		if (hasAssets) renameSync(oldAssets, newAssets);
	}
	return {
		file: newFile,
		assetDir: hasAssets ? newAssets : null,
		body: newBody,
		renamed: true,
		from: file,
	};
}

/** Flip draft->false and stamp pubDate if it is missing or empty. */
function markPublished(fm) {
	let out = fm;
	const today = new Date().toISOString().slice(0, 10);

	if (/^\s*draft:\s*true\s*$/m.test(out)) {
		out = out.replace(/^(\s*draft:\s*)true\s*$/m, `$1false`);
	} else if (!/^\s*draft:/m.test(out)) {
		out += `\ndraft: false`;
	}

	if (/^\s*pubDate:\s*$/m.test(out)) {
		out = out.replace(/^(\s*pubDate:\s*)$/m, `$1${today}`);
	} else if (!/^\s*pubDate:/m.test(out)) {
		out += `\npubDate: ${today}`;
	}
	return out;
}

// ── main ────────────────────────────────────────────────────────────────────

const files = targets.length > 0 ? targets.map(resolvePost) : findDrafts();

if (files.length === 0) {
	console.log('No drafts to publish. Nothing to do.');
	process.exit(0);
}

console.log(`Publishing ${files.length} post${files.length === 1 ? '' : 's'}:`);

const staged = [];
for (const original of files) {
	const raw = readFileSync(original, 'utf8');
	const { fm, body } = splitFrontmatter(raw, original);
	const moved = normalizeNames(original, body);
	const newFm = markPublished(fm);
	const output = `---\n${newFm}\n---\n${moved.body}`;

	if (!dryRun) writeFileSync(moved.file, output, 'utf8');

	const slug = basename(moved.file, extname(moved.file));
	console.log(`  • ${slug}`);
	if (moved.renamed) console.log(`      renamed from ${basename(moved.from)}`);
	if (moved.assetDir) console.log(`      assets: ${moved.assetDir}`);
	console.log(`      ${SITE}/blog/${slug}/`);

	staged.push(moved.file);
	if (moved.assetDir) staged.push(moved.assetDir);
}

if (dryRun) {
	console.log('\n(dry run — nothing written, nothing committed)');
	process.exit(0);
}

// Build BEFORE committing: the content-collection schema is the real validator,
// and catching a bad frontmatter field here beats a red deploy on Vercel.
console.log('\nBuilding…');
try {
	execFileSync('npx', ['astro', 'build'], { stdio: 'inherit' });
} catch {
	fail('Build failed — the post was updated on disk but NOT committed. Fix the error above and re-run.');
}

// Stage by path, never `git add -A`: keeps unrelated work-in-progress out of a
// publish commit.
for (const path of staged) run('git', ['add', '--', path]);

const changed = run('git', ['diff', '--cached', '--name-only']);
if (!changed) {
	console.log('\nNothing changed — already published.');
	process.exit(0);
}

const slugs = files.map((f) => slugify(basename(f, extname(f))));
const subject =
	slugs.length === 1 ? `Publish: ${slugs[0]}` : `Publish ${slugs.length} posts`;

run('git', ['commit', '-m', `${subject}\n\n${changed}`]);
console.log(`\n✓ Committed: ${subject}`);

if (noPush) {
	console.log('  (--no-push: not pushed)');
	process.exit(0);
}

console.log('Pushing…');
try {
	execFileSync('git', ['push'], { stdio: 'inherit' });
} catch {
	fail('Push failed. The commit is local — fix the remote and `git push` again.');
}
console.log(`\n✓ Live shortly at ${SITE} — Vercel deploys on push.`);
