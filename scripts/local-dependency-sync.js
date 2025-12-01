#!/usr/bin/env node

/**
 * Local Dependency Synchronization Script
 * Analyzes and resolves dependency conflicts across multiple package-lock.json files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class LocalDependencyManager {
  constructor() {
    this.packageFiles = [
      { path: 'package-lock.json', name: 'root' },
      { path: 'svelte-frontend/package-lock.json', name: 'svelte-frontend' },
      { path: 'themes/relearn/tools/package-lock.json', name: 'relearn-tools' }
    ];
    
    // Target versions for alignment (based on compatibility analysis)
    this.targetVersions = {
      'cookie': '0.6.0',  // Intermediate compatible version
      'tar-fs': '2.1.1'   // Stable legacy version
    };
    
    this.conflicts = [];
    this.alignmentPlan = [];
  }

  /**
   * Analyze all package-lock.json files for conflicts
   */
  analyzeConflicts() {
    console.log('🔍 Analyzing dependency conflicts...\n');
    
    this.packageFiles.forEach(pkgFile => {
      const fullPath = path.resolve(pkgFile.path);
      if (fs.existsSync(fullPath)) {
        console.log(`📁 Analyzing ${pkgFile.name} (${pkgFile.path})`);
        
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          const fileConflicts = this.checkFileConflicts(content, pkgFile);
          this.conflicts.push(...fileConflicts);
        } catch (error) {
          console.error(`❌ Error reading ${pkgFile.path}: ${error.message}`);
        }
      } else {
        console.log(`⚠️  File not found: ${pkgFile.path}`);
      }
    });
    
    return this.conflicts;
  }

  /**
   * Check for conflicts in a single package-lock.json file
   */
  checkFileConflicts(content, pkgFile) {
    const conflicts = [];
    
    // Check dependencies section
    if (content.dependencies) {
      Object.keys(this.targetVersions).forEach(dep => {
        if (content.dependencies[dep]) {
          const currentVersion = content.dependencies[dep].version;
          const targetVersion = this.targetVersions[dep];
          
          if (currentVersion !== targetVersion) {
            conflicts.push({
              file: pkgFile.path,
              package: dep,
              currentVersion,
              targetVersion,
              type: 'dependency',
              severity: this.getSeverity(dep, currentVersion, targetVersion)
            });
          }
        }
      });
    }
    
    // Check packages section (npm v7+ format)
    if (content.packages) {
      Object.keys(content.packages).forEach(pkgPath => {
        const pkg = content.packages[pkgPath];
        if (pkg.name && this.targetVersions[pkg.name]) {
          const currentVersion = pkg.version;
          const targetVersion = this.targetVersions[pkg.name];
          
          if (currentVersion !== targetVersion) {
            conflicts.push({
              file: pkgFile.path,
              package: pkg.name,
              currentVersion,
              targetVersion,
              type: 'package',
              severity: this.getSeverity(pkg.name, currentVersion, targetVersion)
            });
          }
        }
      });
    }
    
    return conflicts;
  }

  /**
   * Determine conflict severity based on version differences
   */
  getSeverity(packageName, currentVersion, targetVersion) {
    const currentMajor = parseInt(currentVersion.split('.')[0]);
    const targetMajor = parseInt(targetVersion.split('.')[0]);
    
    if (currentMajor !== targetMajor) {
      return 'HIGH'; // Major version mismatch
    }
    
    const currentMinor = parseInt(currentVersion.split('.')[1]);
    const targetMinor = parseInt(targetVersion.split('.')[1]);
    
    if (Math.abs(currentMinor - targetMinor) > 1) {
      return 'MEDIUM'; // Significant minor version difference
    }
    
    return 'LOW'; // Minor version difference
  }

  /**
   * Generate alignment plan with specific steps
   */
  generateAlignmentPlan() {
    console.log('\n📋 Generating alignment plan...\n');
    
    this.alignmentPlan = this.conflicts.map(conflict => ({
      action: 'update',
      package: conflict.package,
      file: conflict.file,
      from: conflict.currentVersion,
      to: conflict.targetVersion,
      command: this.generateUpdateCommand(conflict),
      risk: conflict.severity
    }));
    
    return this.alignmentPlan;
  }

  /**
   * Generate specific update command for a conflict
   */
  generateUpdateCommand(conflict) {
    const dir = path.dirname(conflict.file);
    const packageJsonPath = path.join(dir, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      return `cd ${dir} && npm install ${conflict.package}@${conflict.targetVersion}`;
    }
    
    return `# Manual update required for ${conflict.file}`;
  }

  /**
   * Execute the alignment plan
   */
  async executeAlignment() {
    console.log('🚀 Executing alignment plan...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const step of this.alignmentPlan) {
      console.log(`📝 ${step.package}: ${step.from} → ${step.targetVersion} (${step.file})`);
      
      try {
        if (step.command.startsWith('cd')) {
          execSync(step.command, { stdio: 'inherit' });
          successCount++;
          console.log('✅ Success\n');
        } else {
          console.log('ℹ️  Manual step required\n');
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed: ${error.message}\n`);
      }
    }
    
    console.log(`📊 Alignment completed: ${successCount} successful, ${errorCount} failed`);
    return { successCount, errorCount };
  }

  /**
   * Validate alignment results
   */
  validateAlignment() {
    console.log('\n🔍 Validating alignment results...\n');
    
    const remainingConflicts = this.analyzeConflicts();
    
    if (remainingConflicts.length === 0) {
      console.log('✅ All dependencies are now aligned correctly!');
      return true;
    } else {
      console.log('❌ Some conflicts remain:');
      remainingConflicts.forEach(conflict => {
        console.log(`   - ${conflict.file}: ${conflict.package}@${conflict.currentVersion}`);
      });
      return false;
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 DEPENDENCY CONFLICT REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📁 Files Analyzed: ${this.packageFiles.length}`);
    this.packageFiles.forEach(pkgFile => {
      const exists = fs.existsSync(pkgFile.path) ? '✅' : '❌';
      console.log(`   ${exists} ${pkgFile.name} (${pkgFile.path})`);
    });
    
    console.log(`\n⚡ Conflicts Found: ${this.conflicts.length}`);
    this.conflicts.forEach(conflict => {
      console.log(`   ${conflict.severity} ${conflict.file}: ${conflict.package}@${conflict.currentVersion} → ${conflict.targetVersion}`);
    });
    
    console.log(`\n🔄 Alignment Steps: ${this.alignmentPlan.length}`);
    this.alignmentPlan.forEach(step => {
      console.log(`   ${step.package}: ${step.from} → ${step.to} (${step.risk} risk)`);
    });
    
    console.log('\n🎯 Target Versions:');
    Object.keys(this.targetVersions).forEach(dep => {
      console.log(`   ${dep}: ${this.targetVersions[dep]}`);
    });
  }
}

// Main execution
async function main() {
  const manager = new LocalDependencyManager();
  
  try {
    // Step 1: Analyze conflicts
    const conflicts = manager.analyzeConflicts();
    
    if (conflicts.length === 0) {
      console.log('✅ No dependency conflicts found!');
      process.exit(0);
    }
    
    // Step 2: Generate alignment plan
    const plan = manager.generateAlignmentPlan();
    
    // Step 3: Ask for confirmation before execution
    console.log('\n⚠️  WARNING: This will modify package-lock.json files');
    console.log('Do you want to proceed with the alignment? (y/N)');
    
    // For automation, you can remove this confirmation prompt
    // For now, we'll just generate the report
    manager.generateReport();
    
    // Step 4: Generate alignment script for manual execution
    generateManualScript(plan);
    
  } catch (error) {
    console.error('❌ Error during dependency analysis:', error);
    process.exit(1);
  }
}

/**
 * Generate a manual execution script
 */
function generateManualScript(plan) {
  const scriptContent = `#!/bin/bash
# Manual Dependency Alignment Script
# Generated: ${new Date().toISOString()}

echo "🔧 Manual Dependency Alignment"
echo "================================"

${plan.map(step => `
echo ""
echo "📝 ${step.package}: ${step.from} → ${step.targetVersion}"
echo "File: ${step.file}"
${step.command.startsWith('cd') ? step.command : `echo "${step.command}"`}
`).join('\n')}

echo ""
echo "✅ Alignment script generated"
echo "Run: bash manual-alignment.sh"
`;

  fs.writeFileSync('manual-alignment.sh', scriptContent);
  fs.chmodSync('manual-alignment.sh', '755');
  console.log('\n📜 Manual alignment script generated: manual-alignment.sh');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = LocalDependencyManager;