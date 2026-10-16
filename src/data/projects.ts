/**
 * The project registry behind /projects.
 *
 * Only facts that can be checked on disk live here. Dates do NOT: they come from
 * Reminders via `npm run sync:todos` (src/data/todos.json), so a deadline is changed
 * in exactly one place. `slug` ties a project to its Reminders list (see LISTS in
 * scripts/sync-todos.mjs) and to posts that set `project: <slug>` in frontmatter.
 */
export type Status = 'live' | 'building' | 'hardware' | 'finished' | 'research' | 'planned';

export const STATUS_LABEL: Record<Status, string> = {
	live: 'Live',
	building: 'In development',
	hardware: 'Hardware',
	finished: 'Finished',
	research: 'Research',
	planned: 'Planned',
};

/** Order the groups appear in on /projects. */
export const STATUS_ORDER: Status[] = ['live', 'building', 'hardware', 'research', 'planned', 'finished'];

export interface Project {
	slug: string;
	name: string;
	blurb: string;
	status: Status;
	/** Public URL when the project is deployed. */
	live?: string;
	/**
	 * A date the project itself states (README / CLAUDE.md) for a project that has no
	 * Reminders list. `source` says where it was read, so it can be checked.
	 */
	target?: { date: string; label: string; source: string };
	/** Where the Reminders list and the repository disagree, stated rather than smoothed over. */
	note?: string;
}

export const PROJECTS: Project[] = [
	{
		slug: 'ykpao-study',
		name: 'YKPao Study',
		blurb: 'Past-paper practice, AI tutoring and mock exams for a school cohort.',
		status: 'live',
		live: 'https://study.busypizza.bond',
	},
	{
		slug: 'tts-site',
		name: 'Shanghainese TTS',
		blurb: 'Type Chinese text, hear it in Shanghainese.',
		status: 'live',
		live: 'https://tts.busypizza.bond',
	},
	{
		slug: 'tikz-generator',
		name: 'TikZ Generator',
		blurb: 'Draw on a canvas, get compile-ready TikZ and CircuiTikZ.',
		status: 'live',
		live: 'https://tikz.busypizza.bond',
	},
	{
		slug: 'graphviz-generator',
		name: 'Graphviz Generator',
		blurb: 'A visual editor for Graphviz diagrams with auto-layout.',
		status: 'live',
		live: 'https://graphviz.busypizza.bond',
	},
	{
		slug: 'betternotes',
		name: 'BetterNotes',
		blurb: 'An iPad and Mac notes app built on PencilKit, with nearby sync between the two.',
		status: 'building',
	},
	{
		slug: 'shipout',
		name: 'Shipout',
		blurb: 'A Word-style visual editor over LuaLaTeX, for contest teammates who do not write TeX.',
		status: 'building',
	},
	{
		slug: 'shanghai-dialect',
		name: 'Shanghainese learning app',
		blurb: 'An offline, audio-first course for Mandarin speakers.',
		status: 'building',
		target: { date: '2027-06-30', label: 'Public iOS and Android release', source: 'README' },
	},
	{
		slug: 'lanternfall',
		name: 'Lanternfall',
		blurb: 'A third-person Unity puzzle journey through six surreal monuments.',
		status: 'building',
		note: 'Tracked in Reminders under its old name, "Light & Shadow Game"; the repo renamed it Lanternfall on 3 Oct 2026.',
	},
	{
		slug: 'lumina-camera',
		name: 'Lumina',
		blurb: 'A native iPhone camera with manual controls, a composition coach and an editor.',
		status: 'building',
	},
	{
		slug: 'manim-lessons',
		name: 'Narrated Manim lessons',
		blurb: 'Narrated animations for IB Maths and Physics, and contest modelling.',
		status: 'building',
	},
	{
		slug: 'wage-transparency-tool',
		name: 'Wage Transparency Tool',
		blurb: 'Delivery riders log trips and get back what an hour of their time actually earned.',
		status: 'building',
	},
	{
		slug: 'delivery-simulator',
		name: 'Delivery Simulator',
		blurb: 'A driving game about delivery-rider economics, fed by the wage tool.',
		status: 'building',
	},
	{
		slug: 'school-printer',
		name: 'School Print',
		blurb: 'Print from a phone or iPad to the campus printers, released with a school login.',
		status: 'building',
	},
	{
		slug: 'd7000-control',
		name: 'D7000 robotic camera',
		blurb: 'A pan-tilt rig that scans a scene, scores the frames and fires a Nikon D7000.',
		status: 'hardware',
		note: 'One open item still says to flash esp32/pantilt.ino; the repo moved the motion controller to an Arduino Uno R4 WiFi on 1 Oct 2026.',
	},
	{
		slug: 'smart-notebook',
		name: 'Smart Notebook',
		blurb: 'A pen-mounted camera that reads a printed dot pattern and records handwriting.',
		status: 'hardware',
		note: 'The open items below were written for the earlier fixed-panel design, which the repo archived on 24 Sep 2026 in favour of a pen-mounted camera. Treat its hardware tasks as stale until the list is rewritten.',
	},
	{
		slug: 'inkwatch',
		name: 'InkWatch',
		blurb: 'A square e-paper calendar watch on a custom PCB.',
		status: 'hardware',
	},
	{
		slug: 'mba-cooling-case',
		name: 'MacBook Air cooling cradle',
		blurb: 'A 3D-printed stand that pushes air across a fanless laptop, powered over USB-C.',
		status: 'hardware',
	},
	{
		slug: 'realtime-tex',
		name: 'Real-time LaTeX',
		blurb: 'A live-preview engine for LuaLaTeX, its VS Code plugin and the test documents.',
		status: 'research',
	},
	{
		slug: 'badminton-tracker',
		name: 'Badminton shuttle tracker',
		blurb: 'Tracks the shuttlecock on screen during a livestream.',
		status: 'research',
	},
	{
		slug: 'swift-student-challenge',
		name: 'Swift Student Challenge',
		blurb: 'A six-phase plan to learn enough Swift and SwiftUI to enter.',
		status: 'planned',
	},
	{
		slug: 'texfast',
		name: 'TexFast',
		blurb: 'A native macOS LaTeX editor and fast build driver, in daily use.',
		status: 'finished',
	},
	{
		slug: 'small-projects',
		name: 'Small projects',
		blurb: 'A notification bridge, two physics explainers, and a few one-off tools.',
		status: 'finished',
	},
];

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);
