import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./tests/setup.ts'],
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
		// Exclude Playwright test files
		exclude: [
			'**/*.playwright.{test,spec}.{js,ts}',
			'**/e2e/**/*.{test,spec}.{js,ts}'
		]
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});