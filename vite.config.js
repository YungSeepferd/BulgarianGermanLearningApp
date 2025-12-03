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

  test: {
    include: ['tests/unit/**/*.{test,spec}.{js,ts}'],
    // Use jsdom for component testing compatibility
    environment: 'jsdom',
    environmentOptions: {
        jsdom: {
            url: 'http://localhost/'
        }
    },
    globals: true,
    // Ensure the testing environment is correctly set up
    setupFiles: ['tests/unit/setup.ts'],
    // Coverage configuration
    coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
            'coverage/**',
            'dist/**',
            '**/[.]**',
            'packages/*/test?(s)/**',
            '**/*.d.ts',
            '**/virtual:*',
            '**/__x00__*',
            '**/\x00*',
            'cypress/**',
            'test?(s)/**',
            'test?(-*).?(c|m)js?(x)',
            '**/*{.,-}{test,spec}.?(c|m)js?(x)',
            '**/__tests__/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
            '**/vitest.{workspace,projects}.[jt]s?(on)',
            '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}'
        ]
    },
    // Server-side rendering compatibility for Svelte 5
    server: {
      deps: {
        inline: ['@sveltejs/kit']
      }
    }
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['svelte', '@sveltejs/kit']
  }
});