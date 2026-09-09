// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.busypizza.xyz',
	integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/draft') })],
	markdown: {
		// Shiki is built in and runs at build time, so dev-log posts carry no
		// client-side highlighter cost. `defaultColor: 'light'` emits the light
		// colours inline and the dark ones as `--shiki-dark`, which global.css
		// swaps in under the dark palette.
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: 'light',
			wrap: false,
		},
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
