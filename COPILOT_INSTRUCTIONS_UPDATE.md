# Copilot Instructions Update Summary

**Date**: 12 December 2025  
**File Updated**: `.github/copilot-instructions.md`  
**Line Count**: 267 lines (reduced from 273, cleaner structure)  
**Status**: ✅ Complete and actionable

---

## What Changed

### ✂️ Removed
1. **Outdated Critical Issues Section** - All 3 issues were resolved by Dec 12
   - Vocabulary data incomplete → FIXED with enrichment system
   - Practice/Learn routes blank → FIXED (cascade resolved)
   - Grammar text in Latin → FIXED
   - Removed "Critical Issues Found (December 11, 2025)" table

2. **Confusing/Redundant Content**
   - Removed duplicate sections (Quick Start was split awkwardly)
   - Removed "Critical: No Pre-Push Hook" (now part of testing section)
   - Removed duplicate documentation links at end
   - Consolidated ~50 lines of scattered gotchas into organized table

### ✨ Added
1. **Vocabulary Enrichment System** (NEW - Dec 12)
   - Complete production workflow for enrichment pipeline
   - All 5 enrichment commands with clear purposes
   - How it works: scrape → validate → merge → report

2. **Concise Architecture Section**
   - Clear service boundaries (UI, State, Data Flow, etc.)
   - Why each decision matters (not just what)
   - Bilingual Core pattern explained

3. **Organized Gotchas Table**
   - 8 common problems with specific fixes
   - Links to resolution strategies
   - Practical debugging steps

4. **Improved Code Discovery Workflow**
   - 5-step process for exploring unfamiliar code
   - Emphasizes semantic search + context reading
   - Specific guidance on tracing state flows

### 📝 Reorganized
1. **Testing Section** - Consolidated test commands + file structure
2. **Error Handling** - Moved to own section with clear pattern
3. **Cross-Service Communication** - EventBus pattern isolated
4. **Documentation Links** - All condensed into one "Key Documentation" section

---

## Key Sections (For AI Agents)

### Quick Reference Commands
```bash
# Development
pnpm install          # Setup
pnpm run dev          # Local dev
pnpm run check        # Type check
pnpm run simulate-ci  # Full CI suite

# Vocabulary (NEW)
pnpm run enrich:vocabulary              # Full enrichment
pnpm run enrich:vocabulary:validate     # Validation only
pnpm run enrich:vocabulary:cache        # Use cached data
pnpm run enrich:vocabulary:dry          # Preview

# Testing
pnpm run test:unit             # Unit tests
pnpm run test:components       # Component tests
pnpm run test:e2e              # E2E tests

# Build
pnpm run build                 # Local build
pnpm run build:gh-pages        # GitHub Pages build
```

### Critical Patterns
1. **State Management**: Always use singleton `appState` from `src/lib/state/app-state.ts`
2. **Svelte 5 Runes Only**: Never use `export let` or `$:` in NEW code
3. **Bilingual Mode**: `DE_BG` or `BG_DE` determines question/answer language
4. **Data Validation**: Always use Zod schemas in `src/lib/schemas/`
5. **Error Handling**: Use `ErrorHandler.handleError(error, 'context', details)`
6. **Service Communication**: Use EventBus, not direct imports

### Common Gotchas (Now in Table)
| Problem | Fix |
|---------|-----|
| Circular dependencies | Use EventBus |
| Page not rendering | Check SSR hydration with `if (browser)` |
| Vocabulary not loading | Verify `build/data/unified-vocabulary.json` |
| Language not persisting | Update both appState AND localStorage |
| Cascade failures | Validate data early |
| Silent Zod errors | Check browser console |
| Multiple dev servers | Kill existing with `pkill -f "pnpm dev"` |
| Test failures | Update test fixtures to match schema |

---

## What's Covered Now

✅ **Architecture & Design**
- Service boundaries clearly defined
- Data flow pipeline explained
- Why bilingual core is separate from UI language

✅ **Immediate Productivity**
- One-line quick start for new devs
- All essential npm scripts listed
- Clear file organization

✅ **Svelte 5 Standards**
- Runes-only patterns with examples
- No legacy store patterns
- Component file conventions

✅ **State Management**
- Two-layer state pattern explained
- Language mode patterns with examples
- localStorage persistence strategy

✅ **Enrichment System** (NEW)
- Full workflow with all commands
- How it works (scrape → validate → merge)
- Output locations

✅ **Testing Strategy**
- All 5 test types covered
- Before-push checklist with `simulate-ci`
- Test file organization

✅ **Error Handling**
- Custom error classes
- ErrorHandler usage pattern
- EventBus for decoupled communication

✅ **Debugging Workflow**
- 8-entry gotchas table with solutions
- Code discovery process
- When-stuck troubleshooting guide

✅ **Documentation Links**
- 8 key docs with brief descriptions
- Direct links to all major guides
- Full index reference

---

## For AI Agents - Key Takeaways

1. **Start with state**: Use `appState` singleton for all state access
2. **Validate early**: Run `pnpm run verify:vocabulary` before making data changes
3. **Use Svelte 5 syntax**: Only `$state`, `$derived`, `$effect`, `$props()` — no legacy patterns
4. **Test before push**: Run `pnpm run simulate-ci` (replaces pre-push hook)
5. **Follow patterns**: All business logic uses EventBus, never direct service imports
6. **Check schemas**: Understand data contracts in `src/lib/schemas/` before modifying
7. **Test fixtures**: Update test vocabulary to match schema when adding fields
8. **Read context**: Always read 20+ lines before/after code you're modifying

---

## Completeness Checklist

- ✅ Big picture architecture clearly explained
- ✅ Service boundaries documented
- ✅ Data flow pipeline described
- ✅ Critical state patterns with examples
- ✅ All major npm scripts documented
- ✅ File organization conventions clear
- ✅ Svelte 5 patterns (not legacy)
- ✅ Testing strategy complete
- ✅ Error handling patterns
- ✅ Cross-service communication (EventBus)
- ✅ Build & deployment covered
- ✅ Common gotchas & solutions in table format
- ✅ Code discovery workflow
- ✅ Enrichment system (NEW)
- ✅ Links to comprehensive docs
- ✅ Troubleshooting guide

---

## Sections Ready for Iteration

> **Please review and provide feedback on:**

1. **Is the "Big Picture" section clear enough?** Does it explain why the architecture matters?
   - Do the service boundaries make sense?
   - Is the bilingual pattern clear vs. UI language?

2. **Are there critical patterns I missed?**
   - Any project-specific conventions not covered?
   - Any gotchas that aren't in the table?

3. **Is the Enrichment System explanation adequate?**
   - Clear enough for running enrichment workflows?
   - Missing details on report outputs?

4. **Testing section - sufficient detail?**
   - Are all 5 test types clearly explained?
   - Should I add more on test fixtures?

5. **Documentation links still accurate?**
   - All paths correct relative to `.github/`?
   - Missing any critical docs?

6. **For AI agents specifically:**
   - What else would make them immediately productive?
   - Any patterns or workflows not obvious from this guide?

---

## Usage

**For AI Coding Agents:**
- Reference this file when beginning work on any feature
- Use "Common Gotchas & Solutions" table for debugging
- Follow "Code Discovery Workflow" when exploring unfamiliar code
- Always check "Critical Patterns" before writing state code

**For Humans:**
- Share this with new contributors as a quick reference
- Link from PRs when discussing patterns
- Use as onboarding guide for new developers
- Update when new patterns emerge

**For Future Updates:**
- Add new patterns to appropriate sections as they emerge
- Update gotchas table when new issues are discovered
- Add new documentation links as docs expand
- Keep line count under 300 for readability

---

**Status**: Ready for iteration  
**Next Step**: User feedback on clarity and completeness
