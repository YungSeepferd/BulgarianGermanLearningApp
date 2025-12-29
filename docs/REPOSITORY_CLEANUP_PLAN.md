# Repository Cleanup Plan for Bulgarian-German Learning App

## 🎯 Cleanup Objectives

1. **Restore clean repository structure**
2. **Organize documentation properly**
3. **Remove redundant or outdated files**
4. **Preserve essential configuration and documentation**
5. **Create clear directory structure**

## 📁 Current Issues

- Too many files in root directory
- Mixed documentation, logs, and configuration files
- Redundant or outdated documentation
- Lack of clear organization structure

## 🗂️ Proposed Directory Structure

```bash
/
├── .uvx/                      # UVX Fetch MCP Configuration (KEEP)
├── .vscode/                   # VS Code Configuration (KEEP)
├── vibe-mcp-config/          # Vibe MCP Configuration (KEEP)
├── docs/                      # Organized Documentation
│   ├── mcp/                   # MCP-related documentation
│   ├── development/           # Development guides
│   ├── deployment/            # Deployment documentation
│   └── architecture/          # Architecture documents
├── scripts/                   # Utility scripts
├── data/                     # Data files (KEEP)
├── src/                      # Source code (KEEP)
├── tests/                    # Tests (KEEP)
├── README.md                 # Main README (KEEP)
└── .gitignore                # Git ignore (KEEP)
```

## 🧹 Cleanup Strategy

### Phase 1: Identify Files to Keep

**Essential Files (KEEP):**
- `.uvx/` - MCP configuration
- `.vscode/` - VS Code configuration  
- `vibe-mcp-config/` - Vibe MCP configuration
- `data/` - Project data
- `src/` - Source code
- `tests/` - Test files
- `README.md` - Main documentation
- `package.json` - Project configuration
- `.gitignore` - Git ignore rules

### Phase 2: Categorize Documentation

**Documentation Categories:**

1. **MCP Configuration** (KEEP in new structure)
   - `MCP_CONFIGURATION_MASTER_SUMMARY.md`
   - `MCP_SERVER_SETUP_SUMMARY.md`
   - `VIBE_MCP_CONFIGURATION_SUMMARY.md`

2. **Development Documentation** (REVIEW)
   - `START_HERE.md`
   - `QUICK_START.md`
   - `GETTING_STARTED.md`
   - `DEVELOPMENT_GUIDE.md`

3. **Deployment Documentation** (REVIEW)
   - `DEPLOYMENT.md`
   - `DEPLOYMENT_READINESS_CHECKLIST.md`
   - `END_TO_END_DEPLOYMENT_GUIDE.md`

4. **Testing Documentation** (REVIEW)
   - `TESTING.md`
   - `COMPREHENSIVE_TESTING_PLAN.md`
   - `TESTING_EXECUTIVE_SUMMARY.md`

5. **Enrichment Documentation** (REVIEW)
   - `ENRICHMENT_ACTION_PLAN.md`
   - `VOCABULARY_ENRICHMENT_COMPLETE.md`
   - `ENRICHMENT_SESSION_SUMMARY.md`

### Phase 3: Files to Remove

**Redundant/Outdated Files (REMOVE):**
- `*.log` files (extract-wikivoyage.log, etc.)
- Temporary scripts (`fix-final-36-items.ts`, etc.)
- Duplicate documentation
- Old test results and simulations

### Phase 4: Files to Organize

**Files to Move to `docs/` directory:**
- All `.md` documentation files
- Organized by category
- Preserve essential information

## 🚀 Cleanup Commands

### Step 1: Create Documentation Directory

```bash
mkdir -p docs/{mcp,development,deployment,architecture,testing,enrichment}
```

### Step 2: Move MCP Documentation

```bash
mv MCP_CONFIGURATION_MASTER_SUMMARY.md docs/mcp/
mv MCP_SERVER_SETUP_SUMMARY.md docs/mcp/
mv VIBE_MCP_CONFIGURATION_SUMMARY.md docs/mcp/
```

### Step 3: Move Development Documentation

```bash
mv START_HERE.md QUICK_START.md GETTING_STARTED.md DEVELOPMENT_GUIDE.md docs/development/
```

### Step 4: Move Deployment Documentation

```bash
mv DEPLOYMENT.md DEPLOYMENT_READINESS_CHECKLIST.md END_TO_END_DEPLOYMENT_GUIDE.md docs/deployment/
```

### Step 5: Move Testing Documentation

```bash
mv TESTING.md COMPREHENSIVE_TESTING_PLAN.md TESTING_EXECUTIVE_SUMMARY.md docs/testing/
```

### Step 6: Move Enrichment Documentation

```bash
mv ENRICHMENT_ACTION_PLAN.md VOCABULARY_ENRICHMENT_COMPLETE.md ENRICHMENT_SESSION_SUMMARY.md docs/enrichment/
```

### Step 7: Remove Temporary Files

```bash
# Remove log files
rm -f *.log

# Remove temporary scripts
rm -f fix-final-36-items.ts

# Remove old test results
rm -f ci-simulation-results.json
```

### Step 8: Clean Up Root Directory

```bash
# Move remaining documentation to docs/
mv *.md docs/ 2>/dev/null || true

# Remove empty files
find . -maxdepth 1 -type f -size 0 -delete
```

## ✅ Verification

### Check Directory Structure

```bash
# Verify new structure
tree -L 2 -I 'node_modules|.git|build|coverage|test-results'
```

### Test Essential Configurations

```bash
# Test MCP configurations
cd .uvx && node test-config.js
cd .vscode && node test-mcp-config.js
```

## 📝 Preservation Strategy

### Essential Files to Preserve

1. **MCP Configurations**
   - `.uvx/config.json`
   - `.vscode/mcp-config.json`
   - `vibe-mcp-config/vibe-mcp-config.toml`

2. **Project Structure**
   - `src/` - Source code
   - `data/` - Project data
   - `tests/` - Test files

3. **Configuration Files**
   - `package.json`
   - `.gitignore`
   - `README.md`

### Documentation to Preserve

- MCP configuration guides
- Essential development documentation
- Deployment instructions
- Testing strategies

## 🎯 Expected Results

### After Cleanup

```bash
/
├── .uvx/                      # ✅ MCP Configuration
├── .vscode/                   # ✅ VS Code Configuration
├── vibe-mcp-config/          # ✅ Vibe Configuration
├── docs/                      # ✅ Organized Documentation
│   ├── mcp/                   # MCP guides
│   ├── development/           # Dev guides
│   ├── deployment/            # Deployment docs
│   └── ...                    # Other categories
├── data/                     # ✅ Project Data
├── src/                      # ✅ Source Code
├── tests/                    # ✅ Tests
├── README.md                 # ✅ Main Documentation
└── package.json              # ✅ Project Config
```

### Benefits

1. **Clean root directory** - Only essential files
2. **Organized documentation** - Easy to find information
3. **Preserved configurations** - All MCP setups intact
4. **Improved navigation** - Clear directory structure
5. **Better maintainability** - Easier to update and manage

## 🚀 Next Steps

1. **Review the cleanup plan**
2. **Backup important files** (optional)
3. **Execute cleanup commands**
4. **Verify new structure**
5. **Update documentation references**

## 📞 Support

For issues during cleanup:
1. Check file backups
2. Verify essential configurations
3. Test MCP servers after cleanup
4. Review documentation organization

The cleanup will restore the repository to a well-organized state while preserving all the essential MCP configurations and documentation.