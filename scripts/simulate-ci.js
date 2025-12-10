// CI Simulation Script for Bulgarian-German Learning App
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting CI Simulation...');

// Track results for each step
const results = {
  timestamp: new Date().toISOString(),
  status: 'success',
  steps: []
};

// Timeout configuration (in milliseconds)
const TIMEOUTS = {
  DEPENDENCIES: 300000, // 5 minutes
  LINT: 120000,        // 2 minutes
  TYPE_CHECK: 180000,  // 3 minutes
  UNIT_TESTS: 300000,  // 5 minutes
  BUILD: 600000,       // 10 minutes
  DEFAULT: 120000      // 2 minutes
};

function runStep(name, command, args = [], options = {}) {
  return new Promise((resolve) => {
    console.log(`\n📋 Running ${name}...`);

    // Set timeout based on step type
    const timeout = TIMEOUTS[name.toUpperCase().replace(/-/g, '_')] || TIMEOUTS.DEFAULT;
    const timeoutId = setTimeout(() => {
      console.error(`⏰ ${name} timed out after ${timeout/1000} seconds`);
      results.steps.push({ name, status: 'failed', error: 'Timeout exceeded' });
      resolve(false);
    }, timeout);

    const [cmd, ...cmdArgs] = command.split(' ');
    const child = spawn(cmd, [...cmdArgs, ...args], {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (code === 0) {
        results.steps.push({ name, status: 'passed' });
        console.log(`✅ ${name} completed successfully`);
        resolve(true);
      } else {
        results.steps.push({ name, status: 'failed', error: `Process exited with code ${code}` });
        console.error(`❌ ${name} failed with exit code ${code}`);
        resolve(false);
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      results.steps.push({ name, status: 'failed', error: error.message });
      console.error(`❌ ${name} failed:`, error.message);
      resolve(false);
    });
  });
}

async function runCiSimulation() {
  try {
    // 1. Install dependencies
    if (!await runStep('dependencies', 'pnpm install --frozen-lockfile')) {
      results.status = 'failed';
      await saveResults();
      process.exit(1);
    }

    // 2. Run linter
    if (!await runStep('lint', 'pnpm run lint')) {
      results.status = 'failed';
      await saveResults();
      process.exit(1);
    }

    // 3. Run type checking
    if (!await runStep('type-check', 'pnpm run check')) {
      results.status = 'failed';
      await saveResults();
      process.exit(1);
    }

    // 4. Run unit tests (only once - removed duplicate)
    if (!await runStep('unit-tests', 'pnpm run test:unit')) {
      results.status = 'failed';
      await saveResults();
      process.exit(1);
    }

    // 5. Build application
    if (!await runStep('build', 'pnpm run build')) {
      results.status = 'failed';
      await saveResults();
      process.exit(1);
    }

    await saveResults();

    if (results.status === 'success') {
      console.log('\n✅ CI Simulation completed successfully!');
    } else {
      console.log('\n❌ CI Simulation failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n💥 CI Simulation crashed:', error);
    results.status = 'failed';
    results.steps.push({
      name: 'ci-simulation',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
    await saveResults();
    process.exit(1);
  }
}

async function saveResults() {
  try {
    // Fix path encoding issue - decode URI component and use process.cwd()
    const resultsPath = path.join(process.cwd(), 'ci-simulation-results.json');
    await fs.promises.writeFile(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n📊 Results saved to ${resultsPath}`);
  } catch (error) {
    console.error('❌ Failed to save results:', error);
  }
}

// Run the CI simulation with error handling
runCiSimulation();