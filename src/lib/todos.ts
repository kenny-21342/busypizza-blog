import snapshot from '../data/todos.json';

/** One open reminder, as written by `npm run sync:todos`. `due` is `YYYY-MM-DD` or null. */
export interface Todo {
	title: string;
	priority: number | null;
	due: string | null;
}

export type DueState = 'overdue' | 'soon' | 'later' | 'undated';

/** How many days ahead still counts as "soon". */
export const SOON_DAYS = 30;

const DAY = 86_400_000;
const utc = (ymd: string) => {
	const [y, m, d] = ymd.split('-').map(Number);
	return Date.UTC(y, m - 1, d);
};

/** Today as a UTC `YYYY-MM-DD`, so a build on Vercel and one on a laptop agree. */
export const today = () => new Date().toISOString().slice(0, 10);

/** Whole days from `from` until `due`; negative once it has passed. */
export function daysUntil(due: string, from = today()): number {
	return Math.round((utc(due) - utc(from)) / DAY);
}

export function dueState(due: string | null, from = today()): DueState {
	if (!due) return 'undated';
	const n = daysUntil(due, from);
	if (n < 0) return 'overdue';
	return n <= SOON_DAYS ? 'soon' : 'later';
}

/** "3 days overdue", "today", "in 12 days". */
export function relative(due: string, from = today()): string {
	const n = daysUntil(due, from);
	if (n === 0) return 'today';
	if (n === 1) return 'tomorrow';
	if (n === -1) return '1 day overdue';
	return n < 0 ? `${-n} days overdue` : `in ${n} days`;
}

export function formatDue(due: string): string {
	return new Date(utc(due)).toLocaleDateString('en-us', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	});
}

/** Dated items first, soonest first; then undated, most urgent priority first. */
const byUrgency = (a: Todo, b: Todo) => {
	if (a.due && b.due) return a.due.localeCompare(b.due) || (a.priority ?? 9) - (b.priority ?? 9);
	if (a.due) return -1;
	if (b.due) return 1;
	return (a.priority ?? 9) - (b.priority ?? 9);
};

export const snapshotDate = snapshot.generatedAt.slice(0, 10);

export function todosFor(project: string): Todo[] {
	const hit = snapshot.lists.find((l) => l.project === project);
	return hit ? [...(hit.items as Todo[])].sort(byUrgency) : [];
}

/** Every dated item across projects, soonest first, tagged with its project. */
export function allDated(): (Todo & { project: string; due: string })[] {
	return snapshot.lists
		.flatMap((l) => (l.items as Todo[]).map((t) => ({ ...t, project: l.project })))
		.filter((t): t is Todo & { project: string; due: string } => t.due !== null)
		.sort(byUrgency);
}

export function undatedCount(): number {
	return snapshot.lists.reduce((n, l) => n + l.items.filter((i) => !i.due).length, 0);
}
