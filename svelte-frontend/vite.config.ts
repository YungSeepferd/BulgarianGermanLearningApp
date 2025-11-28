import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

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
    ],
    // Force client-side resolution for SvelteKit app modules during testing
    alias: [
      {
        find: '$app/environment',
        replacement: '$app/environment/browser'
      },
      {
        find: '$app/navigation',
        replacement: '$app/navigation/browser'
      },
      {
        find: '$app/stores',
        replacement: '$app/stores/browser'
      }
    ],
    // Force DOM environment for Svelte components
    server: {
      // middlewareMode is not needed for SvelteKit
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  },
  // Configure aliases for client-side testing
  resolve: {
    alias: [
      {
        find: '$app/environment',
        replacement: '$app/environment/browser'
      },
      {
        find: '$app/navigation',
        replacement: '$app/navigation/browser'
      },
      {
        find: '$app/stores',
        replacement: '$app/stores/browser'
      }
    ]
  },
  // Force client-side Svelte compilation
  define: {
    'import.meta.env.VITE_TEST_CLIENT': JSON.stringify('true'),
    'process.env.VITE_TEST_CLIENT': JSON.stringify('true'),
    'process.env.NODE_ENV': JSON.stringify('test'),
    'import.meta.env.TEST': JSON.stringify('true'),
    'import.meta.env.SSR': JSON.stringify('false'),
    'import.meta.env.BROWSER': JSON.stringify('true')
  },
  // Force client-side Svelte compilation
  build: {
    ssr: false
  },
  // Configure Svelte to use client-side compilation
  optimizeDeps: {
    include: ['svelte']
  }
});
