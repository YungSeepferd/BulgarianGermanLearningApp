/**
 * Playwright configuration for component testing
 *
 * This configuration enables Svelte component testing with Playwright
 * including accessibility testing capabilities.
 */
import { defineConfig, devices } from '@playwright/test';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // Look for test files in the "tests" directory, in the "components" subdirectory
  testDir: './tests/components',

  // Use the Svelte component testing environment
  testMatch: '**/*.accessibility.test.ts',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],

  // Shared settings for all projects
  use: {
    // Base URL for component mounting
    baseURL: 'http://localhost:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshots on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'retain-on-failure',

    // Custom mount function for Svelte components
    ctViteConfig: {
      plugins: [
        sveltekit(),
        svelte({
          compilerOptions: {
            runes: true
          }
        })
      ],
      resolve: {
        alias: {
          $lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
          $components: fileURLToPath(new URL('./src/lib/components', import.meta.url))
        }
      }
    }
  },

  // Configure projects for major browsers
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
    }
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: process.env.CI ? 'pnpm build && pnpm preview' : 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe'
  }
});