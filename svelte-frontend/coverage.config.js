/**
 * Coverage configuration for SvelteKit components
 * This configuration ensures comprehensive test coverage reporting
 * for all components and utilities in the SvelteKit frontend
 */

module.exports = {
  // Coverage collection settings
  collectCoverage: true,
  collectCoverageFrom: [
    // Include all Svelte components
    'src/**/*.svelte',
    // Include all TypeScript files in lib
    'src/lib/**/*.ts',
    // Include all route files
    'src/routes/**/*.svelte',
    'src/routes/**/*.ts',
    // Include API routes
    'src/routes/api/**/*.ts',
    // Include configuration files
    'src/app.html',
    'src/app.d.ts',
    // Exclude test files
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.svelte',
    '!src/**/*.spec.svelte',
    // Exclude story files
    '!src/**/*.stories.ts',
    '!src/**/*.stories.svelte',
    // Exclude type definition files
    '!src/**/*.d.ts',
    // Exclude configuration files
    '!svelte.config.js',
    '!vite.config.js',
    '!playwright.config.ts',
    '!vitest.config.ts'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Higher thresholds for critical components
    'src/components/Flashcard.svelte': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/components/GradeControls.svelte': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/lib/utils/spaced-repetition.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    'src/lib/api/vocabulary.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Coverage reporting
  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Summary in console
    'html',          // HTML report for detailed viewing
    'lcov',          // LCOV format for Codecov
    'json',          // JSON format for programmatic access
    'clover'         // Clover format for CI integration
  ],
  
  // Output directory for coverage reports
  coverageDirectory: 'coverage',
  
  // Exclude files from coverage
  exclude: [
    'node_modules/',
    '.svelte-kit/',
    'build/',
    'dist/',
    'coverage/',
    'test-results/',
    'playwright-report/',
    '.nyc_output/'
  ],
  
  // Coverage collection settings for different environments
  testEnvironment: 'jsdom',
  
  // Setup files for coverage
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/coverage-setup.ts'
  ],
  
  // Transform patterns for Svelte files
  transform: {
    '^.+\\.svelte$': 'svelte-jester',
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Module file extensions
  moduleFileExtensions: [
    'js',
    'ts',
    'svelte',
    'json'
  ],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts',
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts'
  ],
  
  // Ignore patterns for coverage
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.svelte-kit/',
    '/build/',
    '/dist/',
    '/coverage/',
    '/test-results/',
    '/playwright-report/'
  ],
  
  // Global coverage variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // Coverage collection for Playwright tests
  collectCoverageOnlyFrom: {
    // Critical components that must have high coverage
    'src/components/Flashcard.svelte': true,
    'src/components/GradeControls.svelte': true,
    'src/components/ProgressIndicator.svelte': true,
    'src/components/SessionStats.svelte': true,
    'src/components/ErrorBoundary.svelte': true,
    'src/components/LoadingSpinner.svelte': true,
    'src/lib/utils/spaced-repetition.ts': true,
    'src/lib/api/vocabulary.ts': true,
    'src/lib/stores/flashcard.ts': true,
    'src/lib/stores/session.ts': true,
    'src/lib/types/index.ts': true
  }
};