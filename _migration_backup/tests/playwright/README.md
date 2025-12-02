# Playwright End-to-End Tests

This directory contains end-to-end tests for the Bulgarian-German Learning App using [Playwright](https://playwright.dev/).

## Prerequisites

- Node.js 16 or later
- npm or yarn

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

- Run all tests in headless mode:
  ```bash
  npm test
  ```

- Run tests with UI mode (for debugging):
  ```bash
  npm run test:ui
  ```

- Run tests in debug mode (slower, with debugger attached):
  ```bash
  npm run test:debug
  ```

- Update visual snapshots (if using visual testing):
  ```bash
  npm run test:update-snapshots
  ```

## Test Structure

- `smoke.spec.js` - Basic smoke tests for critical paths
- (Future) `vocabulary.spec.js` - Tests for vocabulary features
- (Future) `spaced-repetition.spec.js` - Tests for SM-2 algorithm implementation

## Writing Tests

1. Use `test.describe` to group related tests
2. Use `test` to define individual test cases
3. Use Playwright's [expect assertions](https://playwright.dev/docs/test-assertions) for validations
4. Prefer [locators](https://playwright.dev/docs/locators) over raw selectors when possible

## CI Integration

These tests are designed to run in CI environments. The GitHub Actions workflow will automatically:

1. Install dependencies
2. Start the development server
3. Run tests against the running server
4. Generate and upload test results and artifacts

## Debugging

- Use `test.only` to run a single test
- Use `test.slow()` to mark slow tests
- Use `test.fixme()` to temporarily skip failing tests
- Use `test.fail()` to mark tests that are expected to fail

## Best Practices

- Keep tests independent and isolated
- Use test fixtures for common setup/teardown
- Prefer role-based selectors for better maintainability
- Add accessibility checks where appropriate
- Include visual regression tests for critical UI components
