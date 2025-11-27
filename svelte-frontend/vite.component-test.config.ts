import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

/**
 * Dedicated Vite configuration for Playwright component testing
 * This config properly handles Svelte 5 with runes enabled
 */
export default defineConfig({
  plugins: [
    svelte({
      // Enable Svelte 5 runes mode
      compilerOptions: {
        runes: true
      },
      // Hot reload for component testing
      hot: false,
      // Enable Svelte 5 features
      extensions: ['.svelte'],
      // Preprocess Svelte files
      preprocess: []
    })
  ],
  resolve: {
    alias: {
      '$lib': resolve('./src/lib')
    },
    extensions: ['.svelte', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    target: 'esnext',
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: []
    }
  },
  // Test environment configuration
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
  },
  // Server configuration for component testing
  server: {
    port: 3100,
    strictPort: true,
    fs: {
      allow: ['..']
    }
  },
  // Define environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify('test')
  },
  // Optimize dependencies for testing
  optimizeDeps: {
    include: ['svelte']
  }
});