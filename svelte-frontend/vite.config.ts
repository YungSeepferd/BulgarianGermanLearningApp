import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./tests/setup.js'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'**/*.d.ts',
				'**/*.config.{js,ts}',
				'**/types/**',
				'**/node_modules/**',
				'**/dist/**',
				'**/build/**'
			]
		},
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});
