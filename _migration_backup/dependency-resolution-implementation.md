# Dependency Resolution Implementation Plan

## Technical Implementation Details

### Immediate Resolution Strategy

#### 1.1 Dependency Version Alignment
Create `scripts/align-dependencies.js`:
```javascript
const fs = require('fs');
const path = require('path');

const alignDependencies = () => {
  const packageFiles = [
    { path: 'package-lock.json', name: 'root' },
    { path: 'svelte-frontend/package-lock.json', name: 'svelte-frontend' },
    { path: 'themes/relearn/tools/package-lock.json', name: 'relearn-tools' }
  ];

  // Target versions for alignment
  const targetVersions = {
    'cookie': '0.6.0',  // Intermediate compatible version
    'tar-fs': '2.1.1'   // Stable legacy version
  };

  packageFiles.forEach(pkgFile => {
    const fullPath = path.resolve(pkgFile.path);
    if (fs.existsSync(fullPath)) {
      const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      
      // Update dependencies in packages section
      if (content.packages) {
        Object.keys(content.packages).forEach(pkgPath => {
          const pkg = content.packages[pkgPath];
          if (pkg.name && targetVersions[pkg.name]) {
            pkg.version = targetVersions[pkg.name];
          }
        });
      }
      
      // Update dependencies in dependencies section
      if (content.dependencies) {
        Object.keys(targetVersions).forEach(dep => {
          if (content.dependencies[dep]) {
            content.dependencies[dep].version = targetVersions[dep];
          }
        });
      }
      
      fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
      console.log(`Updated ${pkgFile.name} dependencies`);
    }
  });
};

alignDependencies();
```

#### 1.2 Dependency Validation Script
Create `scripts/validate-dependencies.js`:
```javascript
const fs = require('fs');
const path = require('path');

const validateDependencies = () => {
  const packageFiles = [
    'package-lock.json',
    'svelte-frontend/package-lock.json', 
    'themes/relearn/tools/package-lock.json'
  ];

  const conflicts = [];
  
  packageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = JSON.parse(fs.readFileSync(file, 'utf8'));
      
      // Check for cookie version conflicts
      if (content.dependencies && content.dependencies.cookie) {
        const version = content.dependencies.cookie.version;
        if (version !== '0.6.0') {
          conflicts.push({ file, package: 'cookie', version });
        }
      }
      
      // Check for tar-fs version conflicts  
      if (content.dependencies && content.dependencies['tar-fs']) {
        const version = content.dependencies['tar-fs'].version;
        if (version !== '2.1.1') {
          conflicts.push({ file, package: 'tar-fs', version });
        }
      }
    }
  });
  
  if (conflicts.length > 0) {
    console.error('Dependency conflicts found:');
    conflicts.forEach(conflict => {
      console.error(`- ${conflict.file}: ${conflict.package}@${conflict.version}`);
    });
    process.exit(1);
  } else {
    console.log('All dependencies are aligned correctly');
    process.exit(0);
  }
};

validateDependencies();
```

### CI/CD Integration

#### 2.1 Enhanced GitHub Actions Workflow
Update `.github/workflows/ci.yml`:
```yaml
name: CI Pipeline with Dependency Validation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  dependency-validation:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Validate Dependencies
      run: |
        node scripts/validate-dependencies.js
        if [ $? -ne 0 ]; then
          echo "Dependency validation failed"
          exit 1
        fi

  build:
    needs: dependency-validation
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Build project
      run: npm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
```

#### 2.2 Pre-merge Dependency Check
Create `.github/workflows/pre-merge-deps.yml`:
```yaml
name: Pre-Merge Dependency Check

on:
  pull_request:
    paths:
      - 'package.json'
      - 'package-lock.json'
      - 'svelte-frontend/package.json'
      - 'svelte-frontend/package-lock.json'
      - 'themes/relearn/tools/package.json'
      - 'themes/relearn/tools/package-lock.json'

jobs:
  check-dependencies:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Check dependency changes
      run: |
        # Compare dependency versions between base and head
        git fetch origin ${{ github.base_ref }}
        git checkout origin/${{ github.base_ref }}
        BASE_VERSIONS=$(node scripts/get-dependency-versions.js)
        git checkout ${{ github.head_ref }}
        HEAD_VERSIONS=$(node scripts/get-dependency-versions.js)
        
        # Validate no breaking changes
        node scripts/validate-dependency-changes.js "$BASE_VERSIONS" "$HEAD_VERSIONS"
```

### Dependency Update Governance

#### 3.1 Update Approval Process
Create `.github/dependency-update-policy.md`:
```markdown
# Dependency Update Policy

## Update Categories

### Category A: Security Patches
- **Approval:** Automatic
- **Testing:** Basic smoke tests
- **Rollback:** Immediate if issues

### Category B: Minor Version Updates  
- **Approval:** Team lead review
- **Testing:** Full test suite
- **Rollback:** 24-hour window

### Category C: Major Version Updates
- **Approval:** Architecture review board
- **Testing:** Extended testing period (1 week)
- **Rollback:** Comprehensive rollback plan required

## Update Checklist

- [ ] Dependency compatibility matrix updated
- [ ] Breaking changes documented
- [ ] Migration guide created
- [ ] Rollback procedure defined
- [ ] Team communication sent
```

#### 3.2 Automated Update Testing
Create `scripts/test-dependency-update.js`:
```javascript
const { execSync } = require('child_process');

const testDependencyUpdate = (packageName, targetVersion) => {
  console.log(`Testing update: ${packageName}@${targetVersion}`);
  
  try {
    // Create temporary package.json with updated dependency
    const tempPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    tempPackage.dependencies[packageName] = targetVersion;
    fs.writeFileSync('package.json.temp', JSON.stringify(tempPackage, null, 2));
    
    // Test installation
    execSync('npm install', { stdio: 'inherit' });
    
    // Test build
    execSync('npm run build', { stdio: 'inherit' });
    
    // Run tests
    execSync('npm test', { stdio: 'inherit' });
    
    console.log(`✅ ${packageName}@${targetVersion} update test passed`);
    return true;
  } catch (error) {
    console.error(`❌ ${packageName}@${targetVersion} update test failed`);
    return false;
  }
};
```

### Monitoring and Alerting

#### 4.1 Dependency Health Dashboard
Create `scripts/dependency-health.js`:
```javascript
const fs = require('fs');
const path = require('path');

class DependencyHealthMonitor {
  constructor() {
    this.packageFiles = [
      'package-lock.json',
      'svelte-frontend/package-lock.json',
      'themes/relearn/tools/package-lock.json'
    ];
  }
  
  checkHealth() {
    const healthReport = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      issues: [],
      metrics: {}
    };
    
    this.packageFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        const issues = this.analyzeDependencies(content, file);
        healthReport.issues.push(...issues);
      }
    });
    
    if (healthReport.issues.length > 0) {
      healthReport.status = 'unhealthy';
    }
    
    return healthReport;
  }
  
  analyzeDependencies(packageLock, filePath) {
    const issues = [];
    
    // Check for version conflicts
    if (packageLock.dependencies) {
      Object.keys(packageLock.dependencies).forEach(dep => {
        const version = packageLock.dependencies[dep].version;
        // Add conflict detection logic
      });
    }
    
    return issues;
  }
}

module.exports = DependencyHealthMonitor;
```

## Implementation Timeline

### Day 1: Foundation
- [ ] Create dependency alignment scripts
- [ ] Implement basic validation
- [ ] Update CI pipeline with dependency checks

### Day 2-3: Integration  
- [ ] Add pre-merge dependency validation
- [ ] Implement dependency health monitoring
- [ ] Create update testing framework

### Week 1: Governance
- [ ] Establish update approval process
- [ ] Create dependency policy documentation
- [ ] Train team on new processes

### Week 2: Optimization
- [ ] Implement automated update testing
- [ ] Create dependency health dashboard
- [ ] Set up alerting for dependency issues

## Rollback Procedures

### Immediate Rollback Script
Create `scripts/rollback-dependencies.js`:
```javascript
const fs = require('fs');
const { execSync } = require('child_process');

const rollbackDependencies = () => {
  console.log('Initiating dependency rollback...');
  
  // Restore from backup if available
  if (fs.existsSync('package-lock.json.backup')) {
    fs.copyFileSync('package-lock.json.backup', 'package-lock.json');
  }
  
  if (fs.existsSync('svelte-frontend/package-lock.json.backup')) {
    fs.copyFileSync('svelte-frontend/package-lock.json.backup', 'svelte-frontend/package-lock.json');
  }
  
  // Reinstall dependencies
  execSync('npm ci', { stdio: 'inherit' });
  execSync('cd svelte-frontend && npm ci', { stdio: 'inherit' });
  
  console.log('Dependency rollback completed');
};

rollbackDependencies();
```

## Success Metrics

### Technical Metrics
- **Dependency Alignment Rate:** 100%
- **Build Success Rate:** > 95%
- **Update Failure Rate:** < 5%

### Process Metrics
- **Update Approval Time:** < 4 hours
- **Issue Resolution Time:** < 8 hours
- **Team Satisfaction Score:** > 4/5

**Implementation Plan Created:** 2025-11-27T14:44:27Z
**Next Review:** 2025-11-28T14:44:27Z