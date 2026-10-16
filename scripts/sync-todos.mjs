#!/usr/bin/env node
/**
 * `npm run sync:todos`
 *
 * Reads the open items (and their due dates) from the project lists in Apple
 * Reminders and writes `src/data/todos.json`, which `/projects` renders.
 *
 * Reminders is the task ledger; this site only mirrors it, so there is exactly one
 * place to change a date. macOS only — it drives Reminders through `osascript`, and
 * the first run asks for permission to control it.
 *
 * Only lists named in LISTS are published. A list is left out on purpose when it is
 * not something to put on a public site; see the comments on each omission.
 *
 * Flags: --dry-run (print the JSON, write nothing).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const OUT = 'src/data/todos.json';
const dryRun = process.argv.includes('--dry-run');

/**
 * Reminders list name -> project slug (matches `slug` in src/data/projects.ts).
 *
 * Deliberately NOT here:
 *   "Project Ara"        the repo's CLAUDE.md says "Private only".
 *   "任务" / "Tasks"      school homework, not projects.
 *   "20 BusyPizza Blog"  this site's own list; its open items are about posts that
 *                        were withdrawn, and it is housekeeping, not a project.
 */
export const LISTS = {
	'06 BetterNotes': 'betternotes',
	'07 LaTeX Visual Editor': 'shipout',
	'08 D7000 Control': 'd7000-control',
	'10 Light & Shadow Game': 'lanternfall',
	'12 Smart Notebook': 'smart-notebook',
	'13 Wage Transparency Tool': 'wage-transparency-tool',
	'14 Delivery Simulator': 'delivery-simulator',
	'17 InkWatch': 'inkwatch',
	'18 MacBook Cooling Case': 'mba-cooling-case',
	'21 Manim Animations': 'manim-lessons',
	'Swift Student Challenge': 'swift-student-challenge',
};

// Bulk property reads on the specifier: ~3 s a list, against minutes reading
// reminder by reminder.
const SCRIPT = `
on run argv
	set targetName to item 1 of argv
	tell application "Reminders"
		set l to first list whose name is targetName
		set ns to name of (reminders of l whose completed is false)
		set ds to due date of (reminders of l whose completed is false)
		set out to ""
		repeat with i from 1 to count of ns
			set d to item i of ds
			if d is missing value then
				set dd to "none"
			else
				set dd to (year of d as string) & "-" & text -2 thru -1 of ("0" & ((month of d) as integer)) & "-" & text -2 thru -1 of ("0" & (day of d))
			end if
			set out to out & dd & tab & (item i of ns) & linefeed
		end repeat
		return out
	end tell
end run
`;

function readList(name) {
	const raw = execFileSync('osascript', ['-e', SCRIPT, name], {
		encoding: 'utf8',
		timeout: 120_000,
	});
	return raw
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const [due, ...rest] = line.split('\t');
			const title = rest.join('\t').trim();
			// "P1 · Finish the thing" -> priority 1, title "Finish the thing".
			const m = title.match(/^P(\d)\s*·\s*(.*)$/);
			return {
				title: m ? m[2] : title,
				priority: m ? Number(m[1]) : null,
				due: due === 'none' ? null : due,
			};
		});
}

const lists = [];
for (const [name, project] of Object.entries(LISTS)) {
	process.stderr.write(`  ${name}… `);
	try {
		const items = readList(name);
		lists.push({ list: name, project, items });
		process.stderr.write(`${items.length} open\n`);
	} catch (err) {
		// A missing list means the project finished and the list was retired on
		// purpose. Say so and carry on rather than failing the whole sync.
		process.stderr.write(`skipped (${String(err.message).split('\n')[0]})\n`);
	}
}

const data = { generatedAt: new Date().toISOString(), lists };
const json = `${JSON.stringify(data, null, '\t')}\n`;

if (dryRun) {
	process.stdout.write(json);
} else {
	mkdirSync(dirname(OUT), { recursive: true });
	writeFileSync(OUT, json, 'utf8');
	const total = lists.reduce((n, l) => n + l.items.length, 0);
	const dated = lists.reduce((n, l) => n + l.items.filter((i) => i.due).length, 0);
	console.log(`\n✓ ${OUT}: ${lists.length} lists, ${total} open items (${dated} dated, ${total - dated} undated)`);
}
