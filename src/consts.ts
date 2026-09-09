// Global site data, imported anywhere via `import { ... } from '../consts'`.

export const SITE_TITLE = 'busypizza';
export const SITE_DESCRIPTION =
	'Writing and dev logs by Kenny — notes on the projects, and everything else.';
export const SITE_URL = 'https://busypizza.xyz';

/** The two halves of the site. Keys must match the `category` field in frontmatter. */
export const CATEGORIES = {
	writing: {
		label: 'Writing',
		blurb: 'Essays and notes that are not about code.',
	},
	devlog: {
		label: 'Dev log',
		blurb: 'Build notes, postmortems, and things that turned out harder than expected.',
	},
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

/** Links out to the tools hub, so the two domains acknowledge each other. */
export const TOOLS = [
	{ name: 'YKPao Study', href: 'https://study.busypizza.bond' },
	{ name: 'Shanghainese TTS', href: 'https://tts.busypizza.bond' },
	{ name: 'TikZ Generator', href: 'https://tikz.busypizza.bond' },
	{ name: 'Graphviz Generator', href: 'https://graphviz.busypizza.bond' },
];
