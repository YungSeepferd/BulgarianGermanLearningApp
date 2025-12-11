import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  };
  const color = {
    info: colors.blue,
    success: colors.green,
    error: colors.red,
    warning: colors.yellow
  };
  console.log(`${color[type]} [${new Date().toLocaleTimeString()}] ${icons[type]} ${message}${colors.reset}`);
}

function runCommand(command: string, description: string): boolean {
  try {
    log(`Starting: ${description}...`, 'info');
    log(`Executing command: ${command}`, 'info');
    
    // Execute command and inherit stdio so we see the output in real-time
    execSync(command, { stdio: 'inherit' });
    
    log(`Completed: ${description}`, 'success');
    return true;
  } catch (error) {
    log(`Failed: ${description}`, 'error');
    console.error(error);
    return false;
  }
}

async function runDemoTests() {
  console.log(`${colors.bold}🚀 Starting Comprehensive Demo Testing & Deployment Verification${colors.reset}\n`);

  const startTime = Date.now();
  const report = {
    linting: false,
    typeCheck: false,
    build: false,
    fileVerification: false
  };

  // 1. Code Quality Verification
  console.log(`${colors.bold}\n1. 🔍 Code Quality Verification${colors.reset}`);
  
  log('Running lint check...', 'info');
  // Use --max-warnings=0 to fail on warnings if needed, but for now just run it
  if (runCommand('pnpm lint', 'Linting Check')) {
    report.linting = true;
  } else {
    log('Linting failed, continuing to next step...', 'warning');
  }
  
  log('Running type check...', 'info');
  // Note: We're using svelte-check via the check script
  if (runCommand('pnpm check', 'Type Checking')) {
    report.typeCheck = true;
  } else {
    log('Type check failed, continuing to next step...', 'warning');
  }

  // 2. Production Build Verification
  console.log(`${colors.bold}\n2. 🏗️ Production Build Verification${colors.reset}`);
  
  // Clean previous build
  if (fs.existsSync('build')) {
    log('Cleaning previous build directory...', 'info');
    fs.rmSync('build', { recursive: true, force: true });
  }

  // Run GitHub Pages build
  log('Starting production build for GitHub Pages...', 'info');
  if (runCommand('pnpm build:gh-pages', 'Production Build (GitHub Pages)')) {
    report.build = true;
  } else {
    log('Build failed! Aborting further checks.', 'error');
    process.exit(1);
  }

  // 3. Deployment Artifact Verification
  console.log(`${colors.bold}\n3. 📦 Deployment Artifact Verification${colors.reset}`);
  
  const buildDir = path.resolve('build');
  const requiredFiles = [
    'index.html',
    '404.html',
    '_app/immutable'
  ];

  let allFilesExist = true;
  if (fs.existsSync(buildDir)) {
    log(`Build directory found at: ${buildDir}`, 'success');
    for (const file of requiredFiles) {
      const filePath = path.join(buildDir, file);
      if (fs.existsSync(filePath)) {
        log(`Verified existence of: ${file}`, 'success');
      } else {
        log(`Missing required file: ${file}`, 'error');
        allFilesExist = false;
      }
    }
  } else {
    log('Build directory not found!', 'error');
    allFilesExist = false;
  }
  
  report.fileVerification = allFilesExist;

  // 4. Report Generation
  console.log(`${colors.bold}\n4. 📊 Final Verification Report${colors.reset}`);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Duration: ${duration}s`);
  console.log('----------------------------------------');
  console.log(`Linting:           ${report.linting ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Type Check:        ${report.typeCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Build:             ${report.build ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Artifact Check:    ${report.fileVerification ? '✅ PASS' : '❌ FAIL'}`);
  console.log('----------------------------------------');

  if (report.build && report.fileVerification) {
    log('🎉 Core verification (Build & Artifacts) passed! Application is ready for deployment.', 'success');
    if (!report.linting || !report.typeCheck) {
      log('⚠️ Note: There were Code Quality issues, but the build succeeded.', 'warning');
    }
    process.exit(0);
  } else {
    log('⚠️ Verification failed. Check logs for details.', 'error');
    process.exit(1);
  }
}

runDemoTests();