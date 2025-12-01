import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess()
		// Temporarily disable mdsvex to isolate the build issue
		// mdsvex({
		// 	extensions: ['.svelte', '.md', '.svx'],
		// 	
		// 	// Layout for markdown files
		// 	layout: './src/lib/components/MarkdownLayout.svelte',
		// 	
		// 	// Preserve frontmatter from Hugo
		// 	highlight: {
		// 		highlighter: (code, lang) => {
		// 			// Basic syntax highlighting - can be enhanced later
		// 			return `<pre><code class="language-${lang}">${code}</code></pre>`;
		// 		}
		// 	}
		// })
	],

	// File extensions - temporarily remove mdsvex extensions
	// extensions: ['.svelte', '.md', '.svx'],
	
	// Enable Svelte 5 runes mode for full Svelte 5 compatibility
	compilerOptions: {
	  runes: true, // Enable Svelte 5 runes now that TypeScript errors are fixed
	  enableSourcemap: true
	},

	kit: {
		// adapter-static for GitHub Pages deployment
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically — see below
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: false
		}),
		
		// Configure paths for GitHub Pages
		paths: {
			// This will be overridden by build flags when needed
			base: ''
		}
	}
};

export default config;