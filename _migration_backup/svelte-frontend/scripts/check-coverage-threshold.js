#!/usr/bin/env node

/**
 * Check coverage thresholds for SvelteKit components
 * This script validates that test coverage meets minimum requirements
 * and exits with appropriate error codes for CI/CD integration
 */

const fs = require('node:fs');
const path = require('node:path');

// Configuration
const COVERAGE_DIR = path.join(process.cwd(), 'coverage');
const SUMMARY_FILE = path.join(COVERAGE_DIR, 'coverage-summary.json');

// Coverage thresholds
const THRESHOLDS = {
  global: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
  },
  components: {
    // Higher thresholds for critical components
    'src/components/Flashcard.svelte': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    },
    'src/components/GradeControls.svelte': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    },
    'src/components/ProgressIndicator.svelte': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    },
    'src/components/SessionStats.svelte': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    },
    'src/components/ErrorBoundary.svelte': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    },
    'src/components/LoadingSpinner.svelte': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    }
  },
  utilities: {
    // High thresholds for core utilities
    'src/lib/utils/spaced-repetition.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95
    },
    'src/lib/api/vocabulary.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    },
    'src/lib/stores/flashcard.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    },
    'src/lib/stores/session.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  }
};

/**
 * Read coverage summary
 */
function readCoverageSummary() {
  if (!fs.existsSync(SUMMARY_FILE)) {
    console.error('❌ Coverage summary file not found.');
    console.error('   Run tests with coverage first: npm run test:coverage');
    process.exit(1);
  }

  try {
    return JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading coverage summary:', error.message);
    process.exit(1);
  }
}

/**
 * Check if coverage meets threshold
 */
function meetsThreshold(actual, threshold) {
  return actual >= threshold;
}

/**
 * Get threshold for a specific file
 */
function getThresholdForFile(filePath) {
  // Check component thresholds
  if (THRESHOLDS.components[filePath]) {
    return THRESHOLDS.components[filePath];
  }
  
  // Check utility thresholds
  if (THRESHOLDS.utilities[filePath]) {
    return THRESHOLDS.utilities[filePath];
  }
  
  // Default to global thresholds
  return THRESHOLDS.global;
}

/**
 * Check coverage for a single file
 */
function checkFileCoverage(filePath, coverage, thresholds) {
  const results = {
    file: filePath,
    passed: true,
    metrics: {
      statements: {
        actual: coverage.statements.pct,
        threshold: thresholds.statements,
        passed: meetsThreshold(coverage.statements.pct, thresholds.statements)
      },
      branches: {
        actual: coverage.branches.pct,
        threshold: thresholds.branches,
        passed: meetsThreshold(coverage.branches.pct, thresholds.branches)
      },
      functions: {
        actual: coverage.functions.pct,
        threshold: thresholds.functions,
        passed: meetsThreshold(coverage.functions.pct, thresholds.functions)
      },
      lines: {
        actual: coverage.lines.pct,
        threshold: thresholds.lines,
        passed: meetsThreshold(coverage.lines.pct, thresholds.lines)
      }
    }
  };

  results.passed = Object.values(results.metrics).every(metric => metric.passed);
  return results;
}

/**
 * Check global coverage
 */
function checkGlobalCoverage(summary) {
  const thresholds = THRESHOLDS.global;
  return checkFileCoverage('total', summary.total, thresholds);
}

/**
 * Check all file coverage
 */
function checkAllFileCoverage(summary) {
  const results = [];
  const files = Object.keys(summary).filter(key => key !== 'total');

  for (const filePath of files) {
    const thresholds = getThresholdForFile(filePath);
    const result = checkFileCoverage(filePath, summary[filePath], thresholds);
    results.push(result);
  }

  return results;
}

/**
 * Print coverage results
 */
function printResults(globalResult, fileResults) {
  console.log('\n🧪 Coverage Threshold Check');
  console.log('='.repeat(50));

  // Print global results
  console.log('\n📊 Global Coverage:');
  console.log(`  Statements: ${globalResult.metrics.statements.actual}% (required: ${globalResult.metrics.statements.threshold}%) ${globalResult.metrics.statements.passed ? '✅' : '❌'}`);
  console.log(`  Branches:   ${globalResult.metrics.branches.actual}% (required: ${globalResult.metrics.branches.threshold}%) ${globalResult.metrics.branches.passed ? '✅' : '❌'}`);
  console.log(`  Functions:  ${globalResult.metrics.functions.actual}% (required: ${globalResult.metrics.functions.threshold}%) ${globalResult.metrics.functions.passed ? '✅' : '❌'}`);
  console.log(`  Lines:      ${globalResult.metrics.lines.actual}% (required: ${globalResult.metrics.lines.threshold}%) ${globalResult.metrics.lines.passed ? '✅' : '❌'}`);

  // Print failing files
  const failingFiles = fileResults.filter(result => !result.passed);
  
  if (failingFiles.length > 0) {
    console.log('\n❌ Files not meeting thresholds:');
    for (const result of failingFiles) {
      console.log(`\n  📁 ${result.file}:`);
      
      const failingMetrics = Object.entries(result.metrics)
        .filter(([_, metric]) => !metric.passed);
      
      for (const [metricName, metric] of failingMetrics) {
        console.log(`    ${metricName.charAt(0).toUpperCase() + metricName.slice(1)}: ${metric.actual}% (required: ${metric.threshold}%)`);
      }
    }
  }

  // Print summary
  const totalFiles = fileResults.length;
  const passingFiles = fileResults.filter(result => result.passed).length;
  
  console.log('\n📈 Summary:');
  console.log(`  Global coverage: ${globalResult.passed ? '✅' : '❌'}`);
  console.log(`  Files passing: ${passingFiles}/${totalFiles} (${Math.round(passingFiles / totalFiles * 100)}%)`);
  
  if (globalResult.passed && failingFiles.length === 0) {
    console.log('\n🎉 All coverage thresholds met!');
  } else {
    console.log('\n⚠️  Some coverage thresholds not met.');
  }
}

/**
 * Generate coverage report for CI
 */
function generateCIReport(globalResult, fileResults) {
  const report = {
    timestamp: new Date().toISOString(),
    global: {
      passed: globalResult.passed,
      metrics: globalResult.metrics
    },
    files: fileResults.map(result => ({
      file: result.file,
      passed: result.passed,
      metrics: result.metrics
    })),
    summary: {
      totalFiles: fileResults.length,
      passingFiles: fileResults.filter(result => result.passed).length,
      failingFiles: fileResults.filter(result => !result.passed).length
    }
  };

  const reportPath = path.join(COVERAGE_DIR, 'threshold-check.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * Main execution
 */
function main() {
  try {
    const summary = readCoverageSummary();
    const globalResult = checkGlobalCoverage(summary);
    const fileResults = checkAllFileCoverage(summary);
    
    printResults(globalResult, fileResults);
    
    // Generate CI report
    const ciReport = generateCIReport(globalResult, fileResults);
    console.log(`\n📄 CI report generated: ${path.join(COVERAGE_DIR, 'threshold-check.json')}`);
    
    // Exit with appropriate code
    if (globalResult.passed && fileResults.every(result => result.passed)) {
      process.exit(0); // Success
    } else {
      process.exit(1); // Failure
    }
    
  } catch (error) {
    console.error('❌ Error checking coverage thresholds:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  checkGlobalCoverage,
  checkAllFileCoverage,
  checkFileCoverage,
  getThresholdForFile,
  THRESHOLDS
};