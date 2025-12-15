import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			
			// Disable automatic layout wrapper for Svelte 5 compatibility
			layout: false,
			
			// Preserve frontmatter from Hugo
			highlight: {
				highlighter: (code, lang) => {
					// Basic syntax highlighting - can be enhanced later
					return `<pre><code class="language-${lang}">${code}</code></pre>`;
				}
			}
		})
	],

	// File extensions - enable markdown support
	extensions: ['.svelte', '.md'],
	
	// compilerOptions removed to allow auto-detection of runes vs legacy mode
	// This fixes compatibility with libraries like lucide-svelte that use legacy syntax

	kit: {
		// adapter-static for GitHub Pages deployment
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html', // Critical: GitHub Pages needs 404.html for SPA routing
			precompress: false,
			strict: false
		}),
		
		// Configure paths for GitHub Pages
		paths: {
			// Use repository name in production so links work on GitHub Pages
			// Keep empty in development for local dev server
			base: process.env.NODE_ENV === 'production' ? '/BulgarianGermanLearningApp' : ''
		}
	}
};

export default config;