#!/usr/bin/env node

/**
 * Dependency Validation Script
 * Validates dependency consistency across all package-lock.json files
 */

const fs = require('fs');
const path = require('path');

class DependencyValidator {
  constructor() {
    this.packageFiles = [
      { path: 'package-lock.json', name: 'root' },
      { path: 'svelte-frontend/package-lock.json', name: 'svelte-frontend' },
      { path: 'themes/relearn/tools/package-lock.json', name: 'relearn-tools' }
    ];
    
    // Expected versions for critical dependencies
    this.expectedVersions = {
      'cookie': '0.6.0',
      'tar-fs': '2.1.1'
    };
    
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate all package-lock.json files
   */
  validate() {
    console.log('🔍 Validating dependency consistency...\n');
    
    this.packageFiles.forEach(pkgFile => {
      const fullPath = path.resolve(pkgFile.path);
      if (fs.existsSync(fullPath)) {
        console.log(`📁 Validating ${pkgFile.name} (${pkgFile.path})`);
        this.validateFile(fullPath, pkgFile);
      } else {
        this.errors.push({
          file: pkgFile.path,
          message: 'File not found',
          type: 'MISSING_FILE'
        });
      }
    });
    
    return this.generateReport();
  }

  /**
   * Validate a single package-lock.json file
   */
  validateFile(filePath, pkgFile) {
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Check critical dependencies
      this.checkCriticalDependencies(content, pkgFile);
      
      // Check dependency structure
      this.checkDependencyStructure(content, pkgFile);
      
      // Check for potential conflicts
      this.checkPotentialConflicts(content, pkgFile);
      
    } catch (error) {
      this.errors.push({
        file: filePath,
        message: `Error parsing JSON: ${error.message}`,
        type: 'PARSE_ERROR'
      });
    }
  }

  /**
   * Check critical dependencies against expected versions
   */
  checkCriticalDependencies(content, pkgFile) {
    Object.keys(this.expectedVersions).forEach(dep => {
      const expectedVersion = this.expectedVersions[dep];
      let foundVersion = null;
      
      // Check dependencies section
      if (content.dependencies && content.dependencies[dep]) {
        foundVersion = content.dependencies[dep].version;
      }
      
      // Check packages section (npm v7+)
      if (!foundVersion && content.packages) {
        Object.keys(content.packages).forEach(pkgPath => {
          const pkg = content.packages[pkgPath];
          if (pkg.name === dep) {
            foundVersion = pkg.version;
          }
        });
      }
      
      if (foundVersion) {
        if (foundVersion !== expectedVersion) {
          this.errors.push({
            file: pkgFile.path,
            message: `${dep} version mismatch: expected ${expectedVersion}, found ${foundVersion}`,
            type: 'VERSION_MISMATCH',
            package: dep,
            expected: expectedVersion,
            actual: foundVersion
          });
        }
      } else {
        this.warnings.push({
          file: pkgFile.path,
          message: `${dep} not found in dependencies`,
          type: 'MISSING_DEPENDENCY',
          package: dep
        });
      }
    });
  }

  /**
   * Check dependency structure for common issues
   */
  checkDependencyStructure(content, pkgFile) {
    // Check for empty dependencies
    if (content.dependencies && Object.keys(content.dependencies).length === 0) {
      this.warnings.push({
        file: pkgFile.path,
        message: 'Dependencies section is empty',
        type: 'EMPTY_DEPENDENCIES'
      });
    }
    
    // Check for packages section (npm v7+ compatibility)
    if (!content.packages) {
      this.warnings.push({
        file: pkgFile.path,
        message: 'No packages section found (may be using older npm format)',
        type: 'OLD_NPM_FORMAT'
      });
    }
    
    // Check lockfile version
    if (content.lockfileVersion && content.lockfileVersion < 2) {
      this.warnings.push({
        file: pkgFile.path,
        message: `Using older lockfile version: ${content.lockfileVersion}`,
        type: 'OLD_LOCKFILE_VERSION'
      });
    }
  }

  /**
   * Check for potential dependency conflicts
   */
  checkPotentialConflicts(content, pkgFile) {
    const conflictIndicators = [
      'node_modules/.bin',
      'node_modules/.cache',
      'resolved',
      'integrity'
    ];
    
    conflictIndicators.forEach(indicator => {
      if (content.dependencies) {
        Object.keys(content.dependencies).forEach(dep => {
          const depInfo = content.dependencies[dep];
          if (depInfo && !depInfo[indicator]) {
            this.warnings.push({
              file: pkgFile.path,
              message: `${dep} missing ${indicator} information`,
              type: 'INCOMPLETE_DEPENDENCY_INFO',
              package: dep
            });
          }
        });
      }
    });
  }

  /**
   * Generate comprehensive validation report
   */
  generateReport() {
    console.log('\n📊 VALIDATION REPORT');
    console.log('='.repeat(50));
    
    // Summary
    console.log(`\n📈 Summary:`);
    console.log(`   Files checked: ${this.packageFiles.length}`);
    console.log(`   Errors: ${this.errors.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    
    // Errors
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => {
        console.log(`   ${error.file}: ${error.message}`);
      });
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`   ${warning.file}: ${warning.message}`);
      });
    }
    
    // Expected versions
    console.log('\n🎯 Expected Versions:');
    Object.keys(this.expectedVersions).forEach(dep => {
      console.log(`   ${dep}: ${this.expectedVersions[dep]}`);
    });
    
    // Validation result
    const isValid = this.errors.length === 0;
    console.log(`\n${isValid ? '✅' : '❌'} Validation Result: ${isValid ? 'PASS' : 'FAIL'}`);
    
    return {
      isValid,
      errors: this.errors,
      warnings: this.warnings,
      filesChecked: this.packageFiles.length
    };
  }

  /**
   * Export validation results for CI integration
   */
  exportResults() {
    const results = {
      timestamp: new Date().toISOString(),
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      filesChecked: this.packageFiles.length,
      expectedVersions: this.expectedVersions
    };
    
    fs.writeFileSync('dependency-validation-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results exported to: dependency-validation-results.json');
    
    return results;
  }
}

/**
 * CI-friendly validation function
 */
function validateForCI() {
  const validator = new DependencyValidator();
  const results = validator.validate();
  
  if (!results.isValid) {
    console.error('\n❌ Dependency validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ Dependency validation passed!');
    process.exit(0);
  }
}

/**
 * Interactive validation function
 */
function validateInteractive() {
  const validator = new DependencyValidator();
  const results = validator.validate();
  validator.exportResults();
  
  if (!results.isValid) {
    console.log('\n💡 Recommendation: Run scripts/local-dependency-sync.js to fix issues');
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--ci')) {
    validateForCI();
  } else {
    validateInteractive();
  }
}

// Export for testing
module.exports = {
  DependencyValidator,
  validateForCI,
  validateInteractive
};

// Run if called directly
if (require.main === module) {
  main();
}