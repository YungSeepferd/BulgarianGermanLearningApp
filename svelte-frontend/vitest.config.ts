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
			'**/e2e/**/*.{test,spec}.{js,ts}',
			'tests/integration/**',
			'tests/visual/**'
		],
		// Browser testing configuration for Svelte 5 - disabled for unit tests with coverage
		browser: {
			enabled: false, // Disable browser testing for unit tests with coverage
		},
		// Global test timeout
		testTimeout: 30000,
		// Hook timeout
		hookTimeout: 30000,
		// Environment variables for Svelte 5 testing
		env: {
			VITE_SVELTE_VERSION: '5',
			VITE_TEST_MODE: 'unit'
		}
	},
	server: {
		fs: {
			allow: ['..']
		}
	},
	// Define global constants for Svelte 5 testing
	define: {
		'import.meta.env.VITE_SVELTE_VERSION': JSON.stringify('5'),
		'import.meta.env.VITE_TEST_MODE': JSON.stringify('unit'),
		'import.meta.env.SSR': JSON.stringify('false'),
		'import.meta.env.BROWSER': JSON.stringify('true'),
		'globalThis.SSR': JSON.stringify('false'),
		'globalThis.BROWSER': JSON.stringify('true')
	},
	// Force browser environment for Svelte 5
	optimizeDeps: {
		include: ['svelte']
	},
	// Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});