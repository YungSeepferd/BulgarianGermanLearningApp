# 📦 Documentation Archive

**Purpose**: Legacy and temporary documentation  
**Status**: Reference only  
**Last Organized**: December 17, 2025

---

## 📂 Archive Structure

### 1. `historic-analysis/` - Analysis & Research
Historical analysis and research documents from project planning phases.

**Contents** (9 files):
- ANALYSIS_SUMMARY.md - Project analysis overview
- BULGARO_ANALYSIS_COMPREHENSIVE.md - Bulgaro.io platform analysis
- ARCHITECTURAL_REDESIGN_VOCABULARY_LEARNING_MERGE.md - Architecture planning
- COMPLETE_REDESIGN_SUMMARY.md - Comprehensive redesign overview
- QUICK_START_REDESIGN_REFERENCE.md - Quick reference guide (superseded)
- REDESIGN_CHECKLIST_VISUAL_SUMMARY.md - Visual checklist (superseded)
- REDESIGN_GETTING_STARTED.md - Getting started (superseded by GETTING_STARTED.md)
- QUICK_REFERENCE_NEXT_STEPS.md - Action items (superseded)
- NEXT_STEPS_SUMMARY.md - Next steps summary (superseded)
- SESSION_COMPLETION_SUMMARY.md - Session notes

**Use Case**: Understanding historical project decisions and planning process

---

### 2. `deprecated-phases/` - Old Phase Plans
Deprecated or superseded phase planning documents.

**Contents** (8 files):
- PHASE_7_10_EXECUTION_PLAN.md - Old phases 7-10 (no longer planned)
- CRITICAL_ISSUES_ANALYSIS.md - Issues from earlier phases (resolved)
- CRITICAL_ISSUES_DETAILS.md - Detailed issue analysis (resolved)
- IMMEDIATE_ACTION_PLAN.md - Action items from earlier phase (completed)
- LERNEN_TAB_MALFORMATION_ANALYSIS.md - Tab issue analysis (fixed)
- LERNEN_TAB_REFINED_ROADMAP.md - Tab roadmap (superseded)
- NAVIGATION_FIX_OPTIONS.md - Navigation fixes (completed)
- PHASE_1_PROGRESS.md - Phase 1 progress tracking (completed)

**Use Case**: Understanding what issues were fixed and how

---

### 3. `temporary-reports/` - Status Reports & Temporary Docs
Status reports, CI/CD configurations, and temporary analysis documents.

**Contents** (25 files):
- CI/CD Status Reports (CICD_FINAL_STATUS.md, CICD_QUICK_REFERENCE.md, etc.)
- Data Quality Reports (DATA_QUALITY_SUMMARY.md, etc.)
- Enrichment Workflows & Documentation
- Vocabulary Enhancement Guides (all variants)
- Temporary Analysis Files
- Feature Fixes Documentation
- Supporting Analysis Files

**Use Case**: Historical status tracking and reference for past decisions

---

## 🎯 How to Use the Archive

### If you need to...

**Understand a historical decision**:
- Check `historic-analysis/` for the original planning documents
- Search for file mentioning the decision or area

**Debug a past issue**:
- Check `deprecated-phases/` for analysis of issues
- Look for files mentioning the bug or problem

**Understand old configurations**:
- Check `temporary-reports/` for CI/CD or data files
- Find relevant infrastructure documents

**See a previous roadmap version**:
- All archived in `deprecated-phases/`
- Compare with current [ROADMAP_5_PHASES.md](../ROADMAP_5_PHASES.md)

---

## 📊 Statistics

| Category | Files | Status |
|----------|-------|--------|
| Historic Analysis | 9 | Reference |
| Deprecated Phases | 8 | Reference |
| Temporary Reports | 25 | Reference |
| **Total Archived** | **42** | Reference |

---

## 🗂️ Root-Level Active Docs

These are the **current reference documents** kept at `/docs/` root:

| Document | Purpose | Status |
|----------|---------|--------|
| **INDEX.md** | Documentation hub & navigation | ✅ Active |
| **README.md** | General project overview | ✅ Active |
| **PROJECT_OVERVIEW.md** | Project description & features | ✅ Active |
| **GETTING_STARTED.md** | New developer onboarding | ✅ Active |
| **ROADMAP_5_PHASES.md** | Complete 5-phase roadmap | ✅ Active |
| **PHASE_1_IMPLEMENTATION_SPRINT.md** | Phase 1 reference | ✅ Reference |
| **PHASE_2_EXERCISE_SYSTEM.md** | Phase 2 ready-to-execute | ✅ Active |
| **GERMAN_BULGARIAN_GRAMMAR_GUIDE.md** | Grammar rules reference | ✅ Active |

---

## 🚀 Navigation Tips

### To find something...

1. **Check active docs first** at `/docs/` root
2. **Check INDEX.md** for documentation hub with search links
3. **If not found**, search archive folders:
   - `_archive/historic-analysis/` - for research/decisions
   - `_archive/deprecated-phases/` - for old issues/plans
   - `_archive/temporary-reports/` - for status/config files

### Example Search Pattern
```bash
# Search archive for a specific term
grep -r "search-term" docs/_archive/

# Find all files in an archive category
ls docs/_archive/historic-analysis/
```

---

## 📝 Archive Maintenance

**Last Organized**: December 17, 2025  
**Organization Method**: By purpose (analysis, deprecated phases, temporary reports)  
**Retention Policy**: Keep indefinitely for historical reference

**Future Updates**:
- Monthly: Move new temporary reports to `temporary-reports/`
- Per Phase: Archive old phase plans when phase completes
- Quarterly: Review and consolidate archive structure

---

## ❓ FAQ

**Q: Why are these files archived?**
A: To keep the root `/docs/` folder clean and focused on active reference documents. Archive preserves historical context without clutter.

**Q: Can I delete these files?**
A: Generally no - they contain historical context. If you need to remove something, ask the tech lead first.

**Q: Should I add new docs here?**
A: No - new docs should go to root level or appropriate subfolder (architecture/, development/, etc.). Only move to archive when superseded.

**Q: How do I search the archive?**
A: Use `grep -r` or IDE search to find files, or browse directories in `_archive/`.

**Q: Will these be used again?**
A: Unlikely, but keep for historical reference and understanding design decisions.

---

## 📚 Related Links

- **Active Documentation Hub**: [docs/INDEX.md](../INDEX.md)
- **Current Roadmap**: [docs/ROADMAP_5_PHASES.md](../ROADMAP_5_PHASES.md)
- **Getting Started**: [docs/GETTING_STARTED.md](../GETTING_STARTED.md)

---

**Archive Created**: December 17, 2025  
**Last Updated**: December 17, 2025  
**Status**: Organized & Maintained
