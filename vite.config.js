import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  // Enable Svelte 5 runes support
  svelte: {
    compilerOptions: {
      runes: true
    }
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: false
  },
  
  // Build configuration
  build: {
    target: 'es2020',
    outDir: 'build',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser'
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['svelte', '@sveltejs/kit']
  }
});