import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

const byNewest = (a: Post, b: Post) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf();

/**
 * Every post that should be publicly visible, newest first.
 * Drafts are always excluded from production builds; `npm run dev` keeps them so
 * a post can be previewed before `npm run publish` flips the flag.
 */
export async function getPublishedPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
	return posts.sort(byNewest);
}

export async function getPostsByCategory(category: 'writing' | 'devlog'): Promise<Post[]> {
	return (await getPublishedPosts()).filter((p) => p.data.category === category);
}

/** Every tag in use, with its post count, most-used first then alphabetical. */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
	const counts = new Map<string, number>();
	for (const post of await getPublishedPosts()) {
		for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
	return (await getPublishedPosts()).filter((p) => p.data.tags.includes(tag));
}
