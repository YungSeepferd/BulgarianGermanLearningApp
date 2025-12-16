/**
 * Playwright configuration for E2E and Accessibility testing
 *
 * This configuration enables full-page testing of the SvelteKit application
 * including accessibility compliance testing.
 */
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // Look for test files in the "tests" directory
  testDir: './tests',

  // Use test files with .spec.ts extension for E2E and .test.ts for accessibility
  testMatch: ['**/*.spec.ts', 'accessibility/**/*.test.ts'],

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
    // Base URL for navigation
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Take screenshots on failure
    screenshot: 'only-on-failure',

    // Video recording
    video: 'retain-on-failure'
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Enable accessibility testing
        contextOptions: {
          reducedMotion: 'reduce',
          colorScheme: 'light'
        }
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        contextOptions: {
          reducedMotion: 'reduce',
          colorScheme: 'light'
        }
      }
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        contextOptions: {
          reducedMotion: 'reduce',
          colorScheme: 'light'
        }
      }
    }
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: process.env.CI ? 'pnpm build && pnpm preview' : 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    // Wait for the server to be ready
    timeout: 120 * 1000
  },

  // Global timeout for tests
  timeout: 60 * 1000,

  // Expect timeout
  expect: {
    timeout: 10 * 1000
  }
});