/** URL-safe slug from an arbitrary title or filename. */
export function slugify(input) {
	return input
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '') // strip combining diacritics
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}
