/**
 * Vite Configuration for Svelte 5 Component Testing
 * @file vite.component-test.config.ts
 * @description Dedicated Vite config for Playwright component testing with Svelte 5
 * @version 2.0.0
 * @updated December 2025
 */

import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  // Component testing specific configuration
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    
    // Coverage configuration for component tests
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
    
    // Exclude non-component test files
    exclude: [
      '**/*.playwright.{test,spec}.{js,ts}',
      '**/e2e/**/*.{test,spec}.{js,ts}'
    ],
  },
  
  // Server configuration for component testing
  server: {
    fs: {
      allow: ['..']
    },
    middlewareMode: false
  },
  
  // Build configuration optimized for component testing
  build: {
    ssr: false,
    minify: false,
    sourcemap: true
  },
  
  // Define global constants for Svelte 5 component testing
  define: {
    'import.meta.env.VITE_SVELTE_VERSION': JSON.stringify('5'),
    'import.meta.env.VITE_TEST_MODE': JSON.stringify('component'),
    'import.meta.env.SSR': JSON.stringify('false'),
    'import.meta.env.BROWSER': JSON.stringify('true'),
    'import.meta.env.VITE_COMPONENT_TEST': JSON.stringify('true')
  },
  
  // Optimize dependencies for component testing
  optimizeDeps: {
    include: ['svelte', '@sveltejs/kit', '@testing-library/svelte'],
    exclude: ['@sveltejs/adapter-auto']
  },
  
  // Resolve configuration for component testing
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
      },
      // Additional aliases for component testing
      {
        find: '$lib',
        replacement: '/src/lib'
      }
    ]
  },
  
  // CSS configuration for component testing
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/scss/variables.scss" as *;'
      }
    }
  }
});