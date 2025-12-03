// CI Simulation Script for Bulgarian-German Learning App
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting CI Simulation...');

// Track results for each step
const results = {
  timestamp: new Date().toISOString(),
  status: 'success',
  steps: []
};

function runStep(name, command, options = { stdio: 'inherit' }) {
  console.log(`\n📋 Running ${name}...`);
  try {
    execSync(command, options);
    results.steps.push({ name, status: 'passed' });
    console.log(`✅ ${name} completed successfully`);
    return true;
  } catch (error) {
    results.steps.push({ name, status: 'failed', error: error.message });
    console.error(`❌ ${name} failed:`, error.message);
    return false;
  }
}

// 1. Install dependencies
if (!runStep('dependencies', 'pnpm install --frozen-lockfile')) {
  results.status = 'failed';
  saveResults();
  process.exit(1);
}

// 2. Run linter
if (!runStep('lint', 'pnpm run lint')) {
  results.status = 'failed';
  saveResults();
  process.exit(1);
}

// 3. Run type checking
if (!runStep('type-check', 'pnpm run check')) {
  results.status = 'failed';
  saveResults();
  process.exit(1);
}

// 4. Run unit tests
if (!runStep('unit-tests', 'pnpm run test:unit')) {
  results.status = 'failed';
  saveResults();
  process.exit(1);
}

// 5. Build application
if (!runStep('build', 'pnpm run build')) {
  results.status = 'failed';
  saveResults();
  process.exit(1);
}

// 6. Run Playwright tests with server management
// Disabled for local pre-push to improve velocity. Runs on CI.
console.log('\n⏩ Skipping local E2E tests (Running on GitHub Actions)...');
results.steps.push({ name: 'e2e-tests', status: 'skipped' });

// 7. Run accessibility tests
if (!runStep('accessibility-tests', 'pnpm run test:accessibility')) {
  results.status = 'failed';
  saveResults();
  process.exit(1);
}

function saveResults() {
  // Fix path encoding issue - decode URI component and use process.cwd()
  const resultsPath = path.join(process.cwd(), 'ci-simulation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📊 Results saved to ${resultsPath}`);
}

saveResults();

if (results.status === 'success') {
  console.log('\n✅ CI Simulation completed successfully!');
} else {
  console.log('\n❌ CI Simulation failed!');
  process.exit(1);
}