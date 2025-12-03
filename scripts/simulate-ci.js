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
console.log('\n🎭 Running Playwright tests...');
try {
  // Start the dev server in the background
  const server = spawn('pnpm', ['run', 'dev'], {
    stdio: 'pipe',
    detached: true
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Run Playwright tests with environment variable to disable animations
  const env = { ...process.env, PLAYWRIGHT_TEST_MODE: 'ci' };
  execSync('pnpm run test:e2e', { stdio: 'inherit', env });
  results.steps.push({ name: 'e2e-tests', status: 'passed' });
  console.log('✅ E2E tests completed successfully');

  // Kill the server
  process.kill(-server.pid);
} catch (error) {
  results.steps.push({ name: 'e2e-tests', status: 'failed', error: error.message });
  console.error('❌ E2E tests failed:', error.message);
  results.status = 'failed';
  saveResults();
  process.exit(1);
}

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