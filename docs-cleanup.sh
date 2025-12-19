#!/bin/bash
# docs-cleanup.sh - Organize documentation folder
# Moves legacy/redundant docs to _archive/ for cleanup

# Create archive folder if it doesn't exist
mkdir -p docs/_archive/historic-analysis
mkdir -p docs/_archive/deprecated-phases
mkdir -p docs/_archive/temporary-reports

# Define files to keep at root level (active reference docs)
KEEP_AT_ROOT=(
  "INDEX.md"                                    # Documentation hub
  "README.md"                                   # General overview
  "PROJECT_OVERVIEW.md"                         # Project description
  "GETTING_STARTED.md"                          # New dev onboarding
  "ROADMAP_5_PHASES.md"                         # Complete roadmap
  "PHASE_1_IMPLEMENTATION_SPRINT.md"            # Phase 1 reference
  "PHASE_2_EXERCISE_SYSTEM.md"                  # Phase 2 ready to execute
  "GERMAN_BULGARIAN_GRAMMAR_GUIDE.md"           # Grammar reference
)

# Function to check if file should be kept
should_keep() {
  local file=$1
  for keep_file in "${KEEP_AT_ROOT[@]}"; do
    if [[ "$file" == "$keep_file" ]]; then
      return 0
    fi
  done
  return 1
}

# Move files to archive
echo "Archiving legacy documentation..."
cd docs

# Historic analysis & temporary reports
for file in ANALYSIS_SUMMARY.md BULGARO_ANALYSIS_COMPREHENSIVE.md \
            ARCHITECTURAL_REDESIGN_VOCABULARY_LEARNING_MERGE.md \
            COMPLETE_REDESIGN_SUMMARY.md QUICK_START_REDESIGN_REFERENCE.md \
            REDESIGN_CHECKLIST_VISUAL_SUMMARY.md REDESIGN_GETTING_STARTED.md \
            QUICK_REFERENCE_NEXT_STEPS.md NEXT_STEPS_SUMMARY.md \
            SESSION_COMPLETION_SUMMARY.md; do
  if [ -f "$file" ]; then
    mv "$file" "_archive/historic-analysis/$file"
    echo "  ✓ Moved $file to _archive/historic-analysis/"
  fi
done

# Deprecated phases & issues
for file in PHASE_7_10_EXECUTION_PLAN.md CRITICAL_ISSUES_ANALYSIS.md \
            CRITICAL_ISSUES_DETAILS.md IMMEDIATE_ACTION_PLAN.md \
            LERNEN_TAB_MALFORMATION_ANALYSIS.md LERNEN_TAB_REFINED_ROADMAP.md \
            NAVIGATION_FIX_OPTIONS.md PHASE_1_PROGRESS.md; do
  if [ -f "$file" ]; then
    mv "$file" "_archive/deprecated-phases/$file"
    echo "  ✓ Moved $file to _archive/deprecated-phases/"
  fi
done

# Temporary reports & CI/CD status
for file in CI_CD_FIXES_SUMMARY.md CICD_FINAL_STATUS.md CICD_QUICK_REFERENCE.md \
            CLEANUP_COMPLETION_REPORT.md DATA_QUALITY_SUMMARY.md \
            DATA_VALIDATION_WORKFLOW.md DOCUMENTATION_REORGANIZATION.md \
            ENRICHMENT_WORKFLOW.md PROJECT_STATUS_DEC15.md PROJECT_STATUS.md \
            SIMPLIFICATION.md USER_FLOWS_AND_FUNCTIONALITY.md \
            WORD_TYPE_FIX_ANALYSIS.md MANUAL_CLASSIFICATION_REPORT.md \
            BILINGUAL_SUPPORT.md CHANGELOG.md DESIGN_SYSTEM_AUDIT.md \
            GITHUB_COPILOT_INSTRUCTION_PATTERNS.md GITHUB_COPILOT_QUICK_REFERENCE.md \
            MCP_SVELTE_SETUP.md VOCABULARY_ENRICHMENT_GUIDE.md \
            VOCABULARY_ENRICHMENT_IMPLEMENTATION_CHECKLIST.md \
            VOCABULARY_ENRICHMENT_QUICKSTART.md VOCABULARY_ENRICHMENT_TECHNICAL.md; do
  if [ -f "$file" ]; then
    mv "$file" "_archive/temporary-reports/$file"
    echo "  ✓ Moved $file to _archive/temporary-reports/"
  fi
done

echo ""
echo "✅ Documentation cleanup complete!"
echo ""
echo "Active docs at root level:"
ls -1 *.md 2>/dev/null | sed 's/^/  - /'
echo ""
echo "Archive structure:"
find _archive -type d | sed 's/^/  /' | sort
