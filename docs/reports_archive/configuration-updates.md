# Configuration Updates for SvelteKit Optimization

## Overview

This document details the necessary configuration updates required for the optimized SvelteKit structure, including SvelteKit, Vite, TypeScript, and build process configurations.

## Root Level Configuration Files

### 1. Package.json Updates

Create a unified `package.json` at the root level that combines the current root and `svelte-frontend` configurations:

```json
{
  "name": "bulgarian-german-learning-app",
  "version": "1.0.0",
  "description": "Learn Bulgarian and German with spaced repetition",
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint . --ext .js,.ts,.svelte --fix",
    "lint:check": "eslint . --ext .js,.ts,.svelte",
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "test:ui": "playwright test --ui",
    "test:components": "playwright test --config=playwright-ct.config.ts tests/components/",
    "test:components:ct": "playwright test --config=playwright-ct.config.ts",
    "test:integration": "playwright test tests/integration/",
    "test:e2e": "playwright test tests/e2e/",
    "test:accessibility": "playwright test tests/accessibility/",
    "test:visual": "playwright test tests/visual/",
    "test:coverage": "playwright test --coverage && npm run test:coverage:report",
    "test:coverage:report": "node scripts/generate-coverage-report.js",
    "test:coverage:threshold": "node scripts/check-coverage-threshold.js",
    "test:coverage:diff": "node scripts/coverage-diff.js",
    "test:unit": "vitest run --coverage",
    "test:unit:watch": "vitest --coverage",
    "test:report": "playwright show-report",
    "test:install": "playwright install",
    "test:all": "npm run test:unit && npm run test:components && npm run test:accessibility && npm run test:visual && npm run test:integration",
    "test:ci": "npm run test:unit && npm run test:components && npm run test:accessibility && npm run test:coverage:threshold",
    "coverage:serve": "npx http-server coverage -p 8080",
    "coverage:clean": "rm -rf coverage .nyc_output",
    "coverage:merge": "node scripts/merge-coverage-reports.js",
    "lint:data": "node scripts/validate-data.mjs",
    "lint:esm": "node scripts/check-esm.mjs",
    "lint:scss": "stylelint 'src/**/*.{css,scss}'",
    "format": "prettier --write 'src/**/*.{js,ts,svelte,scss,css}' 'tests/**/*.{js,ts}' '*.{md,json}'",
    "tsc": "tsc",
    "tsc:watch": "tsc --watch",
    "tsc:check": "tsc --noEmit",
    "type-check": "npm run tsc:check && npm run lint:check",
    "lighthouse": "lhci autorun",
    "vocab:fetch": "node scripts/fetch-vocabulary.js",
    "vocab:analyze": "node scripts/analyze-vocabulary.js",
    "grammar:fetch": "node scripts/fetch-grammar.mjs",
    "grammar:enhance": "node scripts/enhance-grammar.mjs",
    "grammar:migrate": "node scripts/migrate-grammar.mjs",
    "workbox:build": "workbox generateSW workbox-config.js",
    "workbox:inject": "workbox injectManifest workbox-config.js"
  },
  "keywords": ["sveltekit", "language-learning", "spaced-repetition", "bulgarian", "german"],
  "author": "Bulgarian-German Learning App",
  "license": "MIT",
  "devDependencies": {
    "@axe-core/playwright": "^4.11.0",
    "@lhci/cli": "^0.15.1",
    "@playwright/experimental-ct-core": "^1.57.0",
    "@playwright/experimental-ct-svelte": "^1.57.0",
    "@playwright/test": "^1.57.0",
    "@sveltejs/adapter-auto": "^7.0.0",
    "@sveltejs/adapter-static": "^3.0.10",
    "@sveltejs/kit": "^2.48.5",
    "@sveltejs/vite-plugin-svelte": "^6.2.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/svelte": "^5.2.9",
    "@testing-library/user-event": "^14.6.1",
    "@types/jest": "^30.0.0",
    "@types/node": "^24.10.1",
    "@typescript-eslint/eslint-plugin": "^8.48.0",
    "@typescript-eslint/parser": "^8.48.0",
    "@vitest/coverage-v8": "^4.0.14",
    "axe-core": "^4.11.0",
    "c8": "^10.1.3",
    "eslint": "^8.57.1",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-jsx-a11y": "^6.10.0",
    "eslint-plugin-svelte": "^3.13.0",
    "eslint-plugin-unicorn": "^48.0.1",
    "husky": "^9.1.7",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jsdom": "^27.2.0",
    "lint-staged": "^15.2.2",
    "prettier": "^3.7.3",
    "sass": "^1.93.3",
    "stylelint": "^16.26.1",
    "stylelint-config-standard-scss": "^13.0.0",
    "svelte": "^5.43.8",
    "svelte-check": "^4.3.4",
    "ts-jest": "^29.4.5",
    "typescript": "^5.9.3",
    "vite": "^7.2.2",
    "vitest": "^4.0.14",
    "vitest-browser-svelte": "^2.0.1",
    "workbox-build": "^7.4.0",
    "workbox-cli": "^7.4.0"
  },
  "dependencies": {
    "axe-playwright": "^2.2.2",
    "marked": "^17.0.1",
    "mdsvex": "^0.12.6"
  }
}
```

### 2. SvelteKit Configuration Updates

The existing `svelte.config.js` from `svelte-frontend` should be moved to root with minor updates:

```javascript
// svelte.config.js (root level)
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      layout: false,
      highlight: {
        highlighter: (code, lang) => {
          return `<pre><code class="language-${lang}">${code}</code></pre>`;
        }
      }
    })
  ],

  extensions: ['.svelte', '.md'],
  
  compilerOptions: {
    runes: true
  },

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: false
    }),
    
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/BulgarianGermanLearningApp' : ''
    },
    
    // Optimize for GitHub Pages
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        if (path.startsWith('/api/')) {
          return; // Ignore API route errors during prerendering
        }
        console.warn(`${path} (${referrer}): ${message}`);
      }
    }
  }
};

export default config;
```

### 3. Vite Configuration Updates

Move and enhance the Vite configuration:

```javascript
// vite.config.ts (root level)
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
        '**/build/**',
        '**/.svelte-kit/**'
      ]
    },
    exclude: [
      '**/*.playwright.{test,spec}.{js,ts}',
      '**/e2e/**/*.{test,spec}.{js,ts}'
    ],
    alias: [
      { find: '$app/environment', replacement: '$app/environment/browser' },
      { find: '$app/navigation', replacement: '$app/navigation/browser' },
      { find: '$app/stores', replacement: '$app/stores/browser' }
    ]
  },
  
  server: {
    fs: {
      allow: ['..']
    },
    port: 5173,
    host: true
  },
  
  resolve: {
    alias: [
      { find: '$app/environment', replacement: '$app/environment/browser' },
      { find: '$app/navigation', replacement: '$app/navigation/browser' },
      { find: '$app/stores', replacement: '$app/stores/browser' }
    ]
  },
  
  define: {
    'import.meta.env.VITE_TEST_CLIENT': JSON.stringify('true'),
    'process.env.VITE_TEST_CLIENT': JSON.stringify('true'),
    'process.env.NODE_ENV': JSON.stringify('test'),
    'import.meta.env.TEST': JSON.stringify('true'),
    'import.meta.env.SSR': JSON.stringify('false'),
    'import.meta.env.BROWSER': JSON.stringify('true')
  },
  
  build: {
    ssr: false,
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  optimizeDeps: {
    include: ['svelte', 'marked', 'mdsvex']
  },
  
  // Enhanced for production
  esbuild: {
    legalComments: 'external'
  }
});
```

### 4. TypeScript Configuration Updates

Enhanced TypeScript configuration for the new structure:

```json
// tsconfig.json (root level)
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "rewriteRelativeImportExtensions": true,
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "noEmitOnError": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": ".",
    "paths": {
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"],
      "$app/*": ["./node_modules/@sveltejs/kit/src/runtime/app/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.js",
    "src/**/*.svelte",
    "tests/**/*.ts",
    "tests/**/*.js",
    "*.config.js",
    "*.config.ts",
    "ambient.d.ts",
    "./.svelte-kit/ambient.d.ts",
    "./.svelte-kit/types/**/$types.d.ts"
  ],
  "exclude": [
    "node_modules/**",
    "dist/**",
    "build/**",
    ".svelte-kit/**",
    "coverage/**"
  ]
}
```

### 5. ESLint Configuration Updates

Enhanced ESLint configuration for the new structure:

```json
// .eslintrc.json (root level)
{
  "root": true,
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:unicorn/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "jsx-a11y", "unicorn"],
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": 2020,
    "extraFileExtensions": [".svelte"]
  },
  "env": {
    "browser": true,
    "es2017": true,
    "node": true
  },
  "overrides": [
    {
      "files": ["*.svelte"],
      "parser": "svelte-eslint-parser",
      "parserOptions": {
        "parser": "@typescript-eslint/parser"
      }
    },
    {
      "files": ["tests/**/*.{js,ts}"],
      "env": {
        "jest": true
      }
    }
  ],
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "svelte/no-at-debug-tags": "error",
    "jsx-a11y/anchor-is-valid": "off",
    "unicorn/prefer-module": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-node-protocol": "off"
  },
  "ignorePatterns": [
    "dist/",
    "build/",
    ".svelte-kit/",
    "coverage/",
    "node_modules/",
    "*.config.js",
    "*.config.ts"
  ]
}
```

### 6. Prettier Configuration Updates

```json
// .prettierrc.json (root level)
{
  "useTabs": true,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "plugins": ["prettier-plugin-svelte"],
  "overrides": [
    {
      "files": "*.svelte",
      "options": {
        "parser": "svelte"
      }
    },
    {
      "files": "*.md",
      "options": {
        "printWidth": 80
      }
    }
  ]
}
```

### 7. Playwright Configuration Updates

Enhanced Playwright configuration for comprehensive testing:

```javascript
// playwright.config.ts (root level)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});
```

## Build Process Configuration

### 1. GitHub Pages Deployment Configuration

```javascript
// build-config.cjs
module.exports = {
  // GitHub Pages configuration
  githubPages: {
    domain: 'your-username.github.io',
    repository: 'BulgarianGermanLearningApp',
    branch: 'gh-pages',
    cname: 'your-custom-domain.com' // Optional
  },
  
  // Build optimization
  optimization: {
    minify: true,
    gzip: true,
    brotli: true,
    purgeCSS: true,
    imageOptimization: true
  },
  
  // PWA configuration
  pwa: {
    enabled: true,
    workbox: {
      swDest: 'build/sw.js',
      globDirectory: 'build/',
      globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
      globIgnores: ['**/node_modules/**/*', 'sw.js']
    }
  }
};
```

### 2. Workbox Configuration Updates

```javascript
// workbox-config.js
module.exports = {
  globDirectory: 'build/',
  globPatterns: ['**/*.{html,js,css,png,svg,jpg,jpeg,woff2,json}'],
  swDest: 'build/sw.js',
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 86400 // 24 hours
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets'
      }
    }
  ]
};
```

## Environment Configuration

### 1. Environment Variables Template

```bash
# .env.example
# Application Settings
NODE_ENV=development
PUBLIC_BASE_URL=http://localhost:5173

# API Configuration
API_BASE_URL=https://api.example.com
API_KEY=your-api-key

# Analytics (Optional)
GA_TRACKING_ID=GA-XXXXXXXXX

# Feature Flags
ENABLE_PWA=true
ENABLE_ANALYTICS=false
ENABLE_OFFLINE_MODE=true

# Build Configuration
BUILD_TARGET=static
PRERENDER_PAGES=true
```

### 2. TypeScript Environment Types

```typescript
// src/app.d.ts
/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    
    interface Locals {
      user?: {
        id: string;
        name: string;
      };
    }
    
    interface PageData {
      title?: string;
      description?: string;
    }
    
    interface Platform {
      env: {
        API_KEY: string;
        API_BASE_URL: string;
      };
    }
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PUBLIC_BASE_URL: string;
      API_BASE_URL: string;
      API_KEY: string;
      GA_TRACKING_ID?: string;
      ENABLE_PWA: 'true' | 'false';
      ENABLE_ANALYTICS: 'true' | 'false';
      ENABLE_OFFLINE_MODE: 'true' | 'false';
      BUILD_TARGET: 'static' | 'server';
      PRERENDER_PAGES: 'true' | 'false';
    }
  }
}

export {};
```

## Migration Checklist

### Pre-Migration
- [ ] Backup current configurations
- [ ] Document current build process
- [ ] Test current deployment pipeline
- [ ] Validate all environment variables

### During Migration
- [ ] Move configuration files to root
- [ ] Update import paths in configs
- [ ] Merge package.json dependencies
- [ ] Update script commands
- [ ] Test build process locally

### Post-Migration
- [ ] Verify all configurations work
- [ ] Test deployment pipeline
- [ ] Validate environment variables
- [ ] Run comprehensive test suite
- [ ] Update CI/CD pipelines
- [ ] Document new configuration structure

This configuration update strategy ensures a smooth transition to the optimized SvelteKit structure while maintaining all existing functionality and improving the development experience.