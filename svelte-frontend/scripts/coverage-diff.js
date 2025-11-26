#!/usr/bin/env node

/**
 * Coverage diff checker for SvelteKit components
 * This script compares current coverage with baseline coverage
 * and detects regressions in test coverage
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COVERAGE_DIR = path.join(process.cwd(), 'coverage');
const BASELINE_FILE = path.join(COVERAGE_DIR, 'baseline-coverage.json');
const CURRENT_FILE = path.join(COVERAGE_DIR, 'coverage-summary.json');
const DIFF_FILE = path.join(COVERAGE_DIR, 'coverage-diff.json');

// Diff thresholds
const THRESHOLDS = {
  // Maximum allowed decrease in coverage percentage
  maxDecrease: {
    statements: 5,
    branches: 5,
    functions: 5,
    lines: 5
  },
  // Minimum coverage for new files
  newFileMinCoverage: {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70
  }
};

/**
 * Read coverage summary file
 */
function readCoverageSummary(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Coverage file not found: ${filePath}`);
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`❌ Error reading coverage file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Create baseline coverage file
 */
function createBaseline() {
  const currentCoverage = readCoverageSummary(CURRENT_FILE);
  
  if (!currentCoverage) {
    console.error('❌ Cannot create baseline: current coverage not found');
    process.exit(1);
  }

  // Add metadata to baseline
  const baseline = {
    ...currentCoverage,
    metadata: {
      timestamp: new Date().toISOString(),
      gitCommit: getGitCommit(),
      gitBranch: getGitBranch(),
      version: getPackageVersion()
    }
  };

  fs.writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, 2));
  console.log(`✅ Baseline coverage created: ${BASELINE_FILE}`);
  console.log(`   Commit: ${baseline.metadata.gitCommit}`);
  console.log(`   Branch: ${baseline.metadata.gitBranch}`);
}

/**
 * Get current git commit hash
 */
function getGitCommit() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get current git branch
 */
function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get package version
 */
function getPackageVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Calculate coverage difference
 */
function calculateCoverageDiff(baseline, current) {
  const diff = {
    added: [],
    removed: [],
    modified: [],
    unchanged: [],
    summary: {
      statements: { baseline: 0, current: 0, diff: 0 },
      branches: { baseline: 0, current: 0, diff: 0 },
      functions: { baseline: 0, current: 0, diff: 0 },
      lines: { baseline: 0, current: 0, diff: 0 }
    }
  };

  // Find all unique files
  const allFiles = new Set([
    ...Object.keys(baseline).filter(key => key !== 'total' && key !== 'metadata'),
    ...Object.keys(current).filter(key => key !== 'total')
  ]);

  for (const file of allFiles) {
    const baselineCoverage = baseline[file];
    const currentCoverage = current[file];

    if (!baselineCoverage && currentCoverage) {
      // New file
      diff.added.push({
        file,
        coverage: currentCoverage,
        meetsThreshold: checkNewFileThresholds(currentCoverage)
      });
    } else if (baselineCoverage && !currentCoverage) {
      // Removed file
      diff.removed.push({
        file,
        coverage: baselineCoverage
      });
    } else if (baselineCoverage && currentCoverage) {
      // Modified file
      const fileDiff = calculateFileDiff(baselineCoverage, currentCoverage);
      diff.modified.push({
        file,
        baseline: baselineCoverage,
        current: currentCoverage,
        diff: fileDiff,
        hasRegression: hasRegression(fileDiff)
      });
    }
  }

  // Calculate summary diff
  diff.summary = calculateSummaryDiff(baseline.total, current.total);

  return diff;
}

/**
 * Check if new file meets minimum coverage thresholds
 */
function checkNewFileThresholds(coverage) {
  const thresholds = THRESHOLDS.newFileMinCoverage;
  return {
    statements: coverage.statements.pct >= thresholds.statements,
    branches: coverage.branches.pct >= thresholds.branches,
    functions: coverage.functions.pct >= thresholds.functions,
    lines: coverage.lines.pct >= thresholds.lines,
    overall: Object.values({
      statements: coverage.statements.pct >= thresholds.statements,
      branches: coverage.branches.pct >= thresholds.branches,
      functions: coverage.functions.pct >= thresholds.functions,
      lines: coverage.lines.pct >= thresholds.lines
    }).every(Boolean)
  };
}

/**
 * Calculate coverage difference for a single file
 */
function calculateFileDiff(baseline, current) {
  return {
    statements: {
      baseline: baseline.statements.pct,
      current: current.statements.pct,
      diff: current.statements.pct - baseline.statements.pct
    },
    branches: {
      baseline: baseline.branches.pct,
      current: current.branches.pct,
      diff: current.branches.pct - baseline.branches.pct
    },
    functions: {
      baseline: baseline.functions.pct,
      current: current.functions.pct,
      diff: current.functions.pct - baseline.functions.pct
    },
    lines: {
      baseline: baseline.lines.pct,
      current: current.lines.pct,
      diff: current.lines.pct - baseline.lines.pct
    }
  };
}

/**
 * Check if file diff shows regression
 */
function hasRegression(diff) {
  const thresholds = THRESHOLDS.maxDecrease;
  return {
    statements: diff.statements.diff < -thresholds.statements,
    branches: diff.branches.diff < -thresholds.branches,
    functions: diff.functions.diff < -thresholds.functions,
    lines: diff.lines.diff < -thresholds.lines,
    overall: Object.values({
      statements: diff.statements.diff < -thresholds.statements,
      branches: diff.branches.diff < -thresholds.branches,
      functions: diff.functions.diff < -thresholds.functions,
      lines: diff.lines.diff < -thresholds.lines
    }).some(Boolean)
  };
}

/**
 * Calculate summary coverage difference
 */
function calculateSummaryDiff(baseline, current) {
  return {
    statements: {
      baseline: baseline.statements.pct,
      current: current.statements.pct,
      diff: current.statements.pct - baseline.statements.pct
    },
    branches: {
      baseline: baseline.branches.pct,
      current: current.branches.pct,
      diff: current.branches.pct - baseline.branches.pct
    },
    functions: {
      baseline: baseline.functions.pct,
      current: current.functions.pct,
      diff: current.functions.pct - baseline.functions.pct
    },
    lines: {
      baseline: baseline.lines.pct,
      current: current.lines.pct,
      diff: current.lines.pct - baseline.lines.pct
    }
  };
}

/**
 * Print coverage diff results
 */
function printDiffResults(diff) {
  console.log('\n📊 Coverage Diff Analysis');
  console.log('='.repeat(50));

  // Print summary
  console.log('\n📈 Summary Changes:');
  console.log(`  Statements: ${diff.summary.statements.current}% (${diff.summary.statements.diff >= 0 ? '+' : ''}${diff.summary.statements.diff.toFixed(1)}%)`);
  console.log(`  Branches:   ${diff.summary.branches.current}% (${diff.summary.branches.diff >= 0 ? '+' : ''}${diff.summary.branches.diff.toFixed(1)}%)`);
  console.log(`  Functions:  ${diff.summary.functions.current}% (${diff.summary.functions.diff >= 0 ? '+' : ''}${diff.summary.functions.diff.toFixed(1)}%)`);
  console.log(`  Lines:      ${diff.summary.lines.current}% (${diff.summary.lines.diff >= 0 ? '+' : ''}${diff.summary.lines.diff.toFixed(1)}%)`);

  // Print new files
  if (diff.added.length > 0) {
    console.log('\n✅ New Files:');
    for (const file of diff.added) {
      const status = file.coverage.meetsThreshold.overall ? '✅' : '⚠️';
      console.log(`  ${status} ${file.file} (${file.coverage.statements.pct}% statements)`);
    }
  }

  // Print removed files
  if (diff.removed.length > 0) {
    console.log('\n🗑️  Removed Files:');
    for (const file of diff.removed) {
      console.log(`  ${file.file} (${file.coverage.statements.pct}% statements)`);
    }
  }

  // Print modified files with regressions
  const regressions = diff.modified.filter(file => file.diff.hasRegression.overall);
  if (regressions.length > 0) {
    console.log('\n❌ Coverage Regressions:');
    for (const file of regressions) {
      console.log(`  📁 ${file.file}:`);
      const metrics = ['statements', 'branches', 'functions', 'lines'];
      for (const metric of metrics) {
        const diff = file.diff[metric];
        if (diff.diff < 0) {
          console.log(`    ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${diff.current}% (${diff.diff >= 0 ? '+' : ''}${diff.diff.toFixed(1)}%)`);
        }
      }
    }
  }

  // Print improved files
  const improvements = diff.modified.filter(file => 
    !file.diff.hasRegression.overall && 
    (file.diff.statements.diff > 0 || file.diff.branches.diff > 0 || 
     file.diff.functions.diff > 0 || file.diff.lines.diff > 0)
  );
  if (improvements.length > 0) {
    console.log('\n🎉 Coverage Improvements:');
    for (const file of improvements) {
      console.log(`  📁 ${file.file}:`);
      const metrics = ['statements', 'branches', 'functions', 'lines'];
      for (const metric of metrics) {
        const diff = file.diff[metric];
        if (diff.diff > 0) {
          console.log(`    ${metric.charAt(0).toUpperCase() + metric.slice(1)}: ${diff.current}% (+${diff.diff.toFixed(1)}%)`);
        }
      }
    }
  }

  // Overall status
  const hasRegressions = regressions.length > 0;
  const hasNewFilesBelowThreshold = diff.added.some(file => !file.coverage.meetsThreshold.overall);
  
  console.log('\n📋 Overall Status:');
  if (hasRegressions || hasNewFilesBelowThreshold) {
    console.log('  ❌ Coverage issues detected');
    if (hasRegressions) console.log(`     - ${regressions.length} files with regressions`);
    if (hasNewFilesBelowThreshold) console.log(`     - ${diff.added.filter(f => !f.coverage.meetsThreshold.overall).length} new files below threshold`);
  } else {
    console.log('  ✅ No coverage issues detected');
  }
}

/**
 * Save diff report
 */
function saveDiffReport(diff) {
  const report = {
    timestamp: new Date().toISOString(),
    gitCommit: getGitCommit(),
    gitBranch: getGitBranch(),
    thresholds: THRESHOLDS,
    diff,
    summary: {
      hasRegressions: diff.modified.some(file => file.diff.hasRegression.overall),
      hasNewFilesBelowThreshold: diff.added.some(file => !file.coverage.meetsThreshold.overall),
      totalFiles: diff.added.length + diff.removed.length + diff.modified.length,
      regressionsCount: diff.modified.filter(file => file.diff.hasRegression.overall).length,
      newFilesCount: diff.added.length,
      removedFilesCount: diff.removed.length
    }
  };

  fs.writeFileSync(DIFF_FILE, JSON.stringify(report, null, 2));
  console.log(`\n📄 Diff report saved: ${DIFF_FILE}`);
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  // Handle command line arguments
  if (args.includes('--create-baseline')) {
    createBaseline();
    return;
  }

  if (args.includes('--help')) {
    console.log('Usage: node coverage-diff.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --create-baseline  Create baseline coverage file');
    console.log('  --help            Show this help message');
    console.log('');
    console.log('Environment Variables:');
    console.log('  COVERAGE_DIR      Coverage directory (default: ./coverage)');
    return;
  }

  // Check if baseline exists
  if (!fs.existsSync(BASELINE_FILE)) {
    console.log('ℹ️  No baseline coverage found. Creating baseline...');
    createBaseline();
    console.log('   Run this script again after making changes to see diff.');
    return;
  }

  // Read baseline and current coverage
  const baseline = readCoverageSummary(BASELINE_FILE);
  const current = readCoverageSummary(CURRENT_FILE);

  if (!baseline || !current) {
    console.error('❌ Failed to read coverage files');
    process.exit(1);
  }

  // Calculate and display diff
  const diff = calculateCoverageDiff(baseline, current);
  printDiffResults(diff);
  saveDiffReport(diff);

  // Exit with appropriate code
  const hasRegressions = diff.modified.some(file => file.diff.hasRegression.overall);
  const hasNewFilesBelowThreshold = diff.added.some(file => !file.coverage.meetsThreshold.overall);
  
  if (hasRegressions || hasNewFilesBelowThreshold) {
    process.exit(1); // Failure
  } else {
    process.exit(0); // Success
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  calculateCoverageDiff,
  createBaseline,
  checkNewFileThresholds,
  hasRegression,
  THRESHOLDS
};