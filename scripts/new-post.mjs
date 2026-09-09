#!/usr/bin/env node
/**
 * `npm run new -- "Post title" [writing|devlog]`
 *
 * Creates a draft with schema-valid frontmatter already filled in, so Typora is
 * only ever editing a file that builds. Prints the path to open.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { slugify } from './lib/slugify.mjs';

const [titleArg, categoryArg = 'devlog'] = process.argv.slice(2);

if (!titleArg) {
	console.error('Usage: npm run new -- "Post title" [writing|devlog]');
	process.exit(1);
}
if (!['writing', 'devlog'].includes(categoryArg)) {
	console.error(`Unknown category "${categoryArg}". Use "writing" or "devlog".`);
	process.exit(1);
}

const slug = slugify(titleArg);
const dir = join('src', 'content', 'blog');
const file = join(dir, `${slug}.md`);

if (existsSync(file)) {
	console.error(`${file} already exists.`);
	process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const body = `---
title: '${titleArg.replace(/'/g, "''")}'
description: ''
pubDate: ${today}
category: ${categoryArg}
tags: []
draft: true
---

`;

mkdirSync(dir, { recursive: true });
writeFileSync(file, body, 'utf8');

console.log(`Created ${file}`);
console.log(`\nOpen it in Typora:\n  open -a Typora "${file}"`);
console.log(`\nFill in the description, write, then:\n  npm run publish -- ${slug}`);
