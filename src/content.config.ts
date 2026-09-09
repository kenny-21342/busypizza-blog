import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts are written in Typora and live in `src/content/blog/`. This schema is the
// guard rail for that workflow: a missing or misspelled frontmatter field fails the
// build here rather than shipping a broken post.
const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			category: z.enum(['writing', 'devlog']),
			tags: z.array(z.string()).default([]),
			// New posts start as drafts; `npm run publish` flips this.
			draft: z.boolean().default(true),
			heroImage: z.optional(image()),
		}),
});

export const collections = { blog };
