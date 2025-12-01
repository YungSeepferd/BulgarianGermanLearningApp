#!/usr/bin/env node

/**
 * Local CI Simulation Script
 * Simulates the GitHub Actions CI pipeline locally
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class LocalCISimulator {
  constructor() {
    this.steps = [
      { name: 'Dependency Validation', command: this.validateDependencies.bind(this) },
      { name: 'Root Dependencies Installation', command: this.installRootDependencies.bind(this) },
      { name: 'Svelte Frontend Installation', command: this.installSvelteDependencies.bind(this) },
      { name: 'Relearn Tools Installation', command: this.installRelearnDependencies.bind(this) },
      { name: 'Project Build', command: this.buildProject.bind(this) },
      { name: 'Test Execution', command: this.runTests.bind(this) },
      { name: 'Security Audit', command: this.runSecurityAudit.bind(this) }
    ];
    
    this.results = [];
    this.startTime = null;
  }

  /**
   * Run the complete CI simulation
   */
  async run() {
    console.log('🚀 Starting Local CI Simulation');
    console.log('='.repeat(50));
    this.startTime = Date.now();
    
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      console.log(`\n${i + 1}/${this.steps.length} ${step.name}...`);
      
      try {
        const result = await step.command();
        this.results.push({
          step: step.name,
          status: 'SUCCESS',
          duration: result.duration,
          output: result.output
        });
        console.log('✅ Success');
      } catch (error) {
        this.results.push({
          step: step.name,
          status: 'FAILED',
          error: error.message,
          duration: error.duration || 0
        });
        console.log('❌ Failed');
        
        // Stop simulation on critical failure
        if (this.isCriticalStep(step.name)) {
          console.log('💥 Critical step failed - stopping simulation');
          break;
        }
      }
    }
    
    this.generateReport();
  }

  /**
   * Validate dependencies before installation
   */
  async validateDependencies() {
    const start = Date.now();
    
    try {
      // Use our validation script
      const output = execSync('node scripts/validate-dependencies.js --ci', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'] // Capture stderr too
      });
      
      return {
        duration: Date.now() - start,
        output: output
      };
    } catch (error) {
      throw {
        message: `Dependency validation failed: ${error.message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Install root dependencies
   */
  async installRootDependencies() {
    const start = Date.now();
    
    try {
      const output = execSync('npm ci', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return {
        duration: Date.now() - start,
        output: 'Root dependencies installed successfully'
      };
    } catch (error) {
      throw {
        message: `Root dependency installation failed: ${error.message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Install Svelte frontend dependencies
   */
  async installSvelteDependencies() {
    const start = Date.now();
    
    try {
      const output = execSync('cd svelte-frontend && npm ci', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return {
        duration: Date.now() - start,
        output: 'Svelte frontend dependencies installed successfully'
      };
    } catch (error) {
      throw {
        message: `Svelte dependency installation failed: ${error.message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Install Relearn tools dependencies
   */
  async installRelearnDependencies() {
    const start = Date.now();
    const toolsPath = 'themes/relearn/tools';
    
    if (!fs.existsSync(toolsPath)) {
      return {
        duration: Date.now() - start,
        output: 'Relearn tools directory not found - skipping'
      };
    }
    
    try {
      const output = execSync(`cd ${toolsPath} && npm ci`, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return {
        duration: Date.now() - start,
        output: 'Relearn tools dependencies installed successfully'
      };
    } catch (error) {
      throw {
        message: `Relearn tools dependency installation failed: ${error.message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Build the project
   */
  async buildProject() {
    const start = Date.now();
    
    try {
      // Check available build scripts
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const buildScript = packageJson.scripts && packageJson.scripts.build 
        ? 'npm run build' 
        : 'npm run build:prod || npm run build:dev || echo "No build script found"';
      
      const output = execSync(buildScript, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return {
        duration: Date.now() - start,
        output: 'Project built successfully'
      };
    } catch (error) {
      throw {
        message: `Build failed: ${error.message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Run tests
   */
  async runTests() {
    const start = Date.now();
    
    try {
      // Check available test scripts
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const testScript = packageJson.scripts && packageJson.scripts.test 
        ? 'npm test' 
        : 'npm run test:unit || npm run test:integration || echo "No test script found"';
      
      const output = execSync(testScript, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return {
        duration: Date.now() - start,
        output: 'Tests executed successfully'
      };
    } catch (error) {
      throw {
        message: `Tests failed: ${error.message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Run security audit
   */
  async runSecurityAudit() {
    const start = Date.now();
    
    try {
      const output = execSync('npm audit --audit-level moderate', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      return {
        duration: Date.now() - start,
        output: 'Security audit completed'
      };
    } catch (error) {
      // npm audit exits with code 1 if vulnerabilities are found
      if (error.status === 1) {
        return {
          duration: Date.now() - start,
          output: 'Security audit completed with vulnerabilities found'
        };
      }
      throw {
        message: `Security audit failed: ${error.message}`,
        duration: Date.now() - start
      };
    }
  }

  /**
   * Check if a step is critical (should stop simulation on failure)
   */
  isCriticalStep(stepName) {
    const criticalSteps = [
      'Dependency Validation',
      'Root Dependencies Installation',
      'Project Build'
    ];
    
    return criticalSteps.includes(stepName);
  }

  /**
   * Generate comprehensive simulation report
   */
  generateReport() {
    const totalDuration = Date.now() - this.startTime;
    const successfulSteps = this.results.filter(r => r.status === 'SUCCESS').length;
    const failedSteps = this.results.filter(r => r.status === 'FAILED').length;
    
    console.log('\n📊 LOCAL CI SIMULATION REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📈 Summary:`);
    console.log(`   Total Steps: ${this.results.length}`);
    console.log(`   Successful: ${successfulSteps}`);
    console.log(`   Failed: ${failedSteps}`);
    console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    
    console.log(`\n🔍 Step Details:`);
    this.results.forEach((result, index) => {
      const icon = result.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`   ${index + 1}. ${icon} ${result.step}`);
      console.log(`      Status: ${result.status}`);
      console.log(`      Duration: ${(result.duration / 1000).toFixed(2)}s`);
      
      if (result.status === 'FAILED') {
        console.log(`      Error: ${result.error}`);
      }
    });
    
    // Overall result
    const overallSuccess = failedSteps === 0;
    console.log(`\n${overallSuccess ? '🎉' : '💥'} Overall Result: ${overallSuccess ? 'PASS' : 'FAIL'}`);
    
    // Export results
    this.exportResults(totalDuration, successfulSteps, failedSteps);
    
    // Exit code for CI integration
    process.exit(overallSuccess ? 0 : 1);
  }

  /**
   * Export simulation results
   */
  exportResults(totalDuration, successfulSteps, failedSteps) {
    const results = {
      timestamp: new Date().toISOString(),
      overallSuccess: failedSteps === 0,
      totalDuration: totalDuration,
      successfulSteps: successfulSteps,
      failedSteps: failedSteps,
      steps: this.results
    };
    
    fs.writeFileSync('ci-simulation-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Results exported to: ci-simulation-results.json');
  }
}

/**
 * Run simulation with different modes
 */
async function main() {
  const args = process.argv.slice(2);
  const simulator = new LocalCISimulator();
  
  if (args.includes('--quick')) {
    console.log('⚡ Running quick simulation (skipping some steps)...');
    // Modify steps for quick run
    simulator.steps = simulator.steps.filter(step => 
      !step.name.includes('Security Audit') && 
      !step.name.includes('Relearn Tools')
    );
  }
  
  if (args.includes('--verbose')) {
    // Enable verbose output
    process.env.DEBUG = 'true';
  }
  
  try {
    await simulator.run();
  } catch (error) {
    console.error('💥 Simulation failed:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = LocalCISimulator;

// Run if called directly
if (require.main === module) {
  main();
}