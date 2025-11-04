# Hugo & Go Best Practices Refactoring Plan

**Date**: October 24, 2025
**Status**: PROPOSAL
**Priority**: HIGH

---

## Executive Summary

This document proposes a comprehensive refactoring to align the Bulgarian-German Learning App with Hugo and Go best practices, eliminating mixed patterns, reducing duplication, and establishing clear architectural boundaries.

### Key Issues Identified

1. **Data Duplication**: Vocabulary exists in 3 places (data/vocabulary.json, content/vocabulary/*.md, web/static/data/)
2. **Mixed Content Paradigm**: Unclear when to use JSON vs Markdown
3. **Build Artifacts in Git**: Compiled HTML, CSS, and generated pages committed to repository
4. **Go Tools Underutilized**: Go CLI exists but not integrated into build pipeline
5. **Unclear Data Flow**: Templates pull from both JSON and MD sources

### Recommended Approach

**For Vocabulary**: **JSON as single source of truth** ✅
**For Grammar**: **Markdown with rich frontmatter** ✅
**For Practice/Docs**: **Markdown** ✅

---

## Part 1: JSON vs Markdown for Hugo - The Right Choice

### Hugo Content Philosophy

Hugo distinguishes between **content** and **data**:

| Type | Format | Location | Use Case |
|------|--------|----------|----------|
| **Content** | Markdown | `/content` | Pages meant to be browsed, SEO-indexed, have URLs |
| **Data** | JSON/YAML/TOML | `/data` | Structured data consumed by templates, APIs, JavaScript |

### Decision Matrix for This App

| Content Type | Current Format | Recommended Format | Rationale |
|--------------|----------------|-------------------|-----------|
| **Vocabulary** | JSON + MD (duplicate) | **JSON only** | • 157 entries = data, not prose<br>• Rich structure (etymology, cultural notes, examples)<br>• Consumed by flashcard system<br>• No need for individual browseable pages<br>• Already has bidirectional fields |
| **Grammar** | MD + JSON (mixed) | **MD with frontmatter** | • Prose content with examples<br>• SEO-friendly individual pages<br>• Human-written explanations<br>• Fits Hugo's content model |
| **Practice Pages** | MD | **MD** | • UI pages, not data<br>• Minimal frontmatter |
| **Documentation** | MD | **MD** | • Standard Hugo approach |

### Why JSON for Vocabulary is Correct

✅ **Pro-Hugo Reasons**:
1. **Hugo Data Files Pattern**: `/data` directory is designed for exactly this
2. **Template Access**: Easy to iterate in templates with `range site.Data.vocabulary`
3. **JSON API Generation**: Already generating `/api/vocabulary.json` from same source
4. **No Duplication**: One file instead of 158 files
5. **Schema Validation**: Easier to validate JSON programmatically

❌ **Why NOT Markdown for Vocabulary**:
1. Each entry would need complex frontmatter (etymology, cultural notes, etc.)
2. 158 files harder to maintain than 1 JSON file
3. Frontmatter would be the ONLY content (no prose) - anti-pattern
4. Harder to export/import for external tools
5. JSON better for structured data consumed by JavaScript

### Hugo Official Guidance

From Hugo docs ([Data Templates](https://gohugo.io/templates/data-templates/)):

> "In addition to the built-in front matter, you can specify your own custom metadata in front matter for any content file or in data templates (JSON, YAML, or TOML files located in the data folder)."

**Use data templates when:**
- Data is structured and machine-generated
- Data is consumed by multiple templates/pages
- Data doesn't need individual URLs
- Data is frequently updated programmatically

**Use content (markdown) when:**
- Content is prose-heavy
- Each item deserves its own URL
- Content is SEO-focused
- Content is manually authored

**Verdict**: Vocabulary fits **data template** pattern perfectly.

---

## Part 2: Refactoring Phases

### Phase 1: Vocabulary Data Consolidation 🔴 HIGH PRIORITY

**Goal**: Single source of truth for vocabulary data

**Current State**:
```
data/vocabulary.json (3,328 lines, 157 entries) ← PRIMARY
content/vocabulary/*.md (158 files, minimal content) ← REDUNDANT
web/static/data/vocabulary.json ← DUPLICATE
data/vocabulary.backup-*.json (3 backup files) ← CLEANUP
data/vocabulary-enhanced.json ← TO MERGE
data/vocabulary-sample-*.json (7 files) ← CLEANUP
```

**Actions**:

1. **Execute Vocabulary Merge** (script already exists)
   ```bash
   # Dry run first
   node scripts/merge-vocabulary.mjs --dry-run

   # Review output, then execute
   node scripts/merge-vocabulary.mjs
   ```

2. **Remove Duplicate MD Files**
   ```bash
   # Archive first
   mkdir -p archive/old-vocab-md
   mv content/vocabulary/*.md archive/old-vocab-md/
   # Keep only _index.md
   mv archive/old-vocab-md/_index.md content/vocabulary/
   ```

3. **Update Templates to Use JSON Only**
   - Ensure `layouts/vocabulary/list.html` loads from `site.Data.vocabulary`
   - Remove any references to individual vocabulary MD files
   - Generate vocabulary cards purely from JSON

4. **Remove Redundant web/static/data**
   - Templates should reference `/api/vocabulary.json` (Hugo-generated)
   - Delete `web/static/data/vocabulary.json` duplicate

5. **Archive Old Backups**
   ```bash
   mkdir -p data/archive
   mv data/vocabulary.backup-*.json data/archive/
   mv data/vocabulary-sample-*.json data/archive/
   mv data/vocabulary-enhanced.json data/archive/  # after merge
   ```

**Expected Outcome**:
- ✅ Single `data/vocabulary.json` as source of truth
- ✅ Hugo generates `/api/vocabulary.json` via template
- ✅ JavaScript loads from Hugo-generated API endpoint
- ✅ 158 redundant MD files removed
- ✅ ~500KB of duplicate data eliminated

---

### Phase 2: Grammar Content Enhancement 🟡 MEDIUM PRIORITY

**Goal**: Enrich grammar pages with proper Hugo content structure

**Current State**:
- 11 grammar MD files with minimal content
- Some content in `data/grammar.json`
- Unclear which is authoritative

**Hugo Best Practice**: Grammar should be **content-driven** (Markdown), not data-driven

**Actions**:

1. **Migrate Grammar Data to Frontmatter**
   ```markdown
   ---
   title: "Gender of Nouns"
   level: "A1"
   difficulty: 2
   category: "grammar"
   weight: 10
   tags: ["nouns", "gender", "A1"]
   cultural_notes: |
     Bulgarian has three genders (masculine, feminine, neuter)...
   examples:
     - word: "мъж"
       translation: "man"
       gender: "masculine"
     - word: "жена"
       translation: "woman"
       gender: "feminine"
   ---

   # Gender of Nouns in Bulgarian

   [Rich prose content explaining the grammar topic...]
   ```

2. **Deprecate data/grammar.json**
   - Move any valuable data to MD frontmatter
   - Archive `data/grammar.json` after migration

3. **Create Grammar Shortcodes**
   ```go-html-template
   {{/* layouts/shortcodes/grammar-example.html */}}
   <div class="grammar-example">
     <div class="example-word">{{ .Get "word" }}</div>
     <div class="example-translation">{{ .Get "translation" }}</div>
   </div>
   ```

4. **Enrich Content**
   - Add detailed explanations (currently very minimal)
   - Add more examples
   - Add cultural context
   - Add comparative notes (Bulgarian vs German)

**Expected Outcome**:
- ✅ Self-contained grammar pages
- ✅ No dependency on external JSON
- ✅ SEO-friendly content
- ✅ Easier to edit and maintain

---

### Phase 3: Go Tools Integration 🟢 LOW PRIORITY (Already Correct)

**Current State**: Go tools in `/tools/` subdirectory

**Assessment**: ✅ **This is correct for this project**

**Why Separate Go Module is Fine**:
1. Hugo doesn't require Go for building (it's written in Go but distributed as binary)
2. Go tools are supplementary utilities, not core dependencies
3. Separation of concerns: Hugo = static site, Go = data processing
4. Aligns with Hugo's philosophy of being a standalone SSG

**Recommended Go Tool Enhancements**:

1. **Vocabulary Validation** (expand existing tool)
   ```go
   // tools/internal/validator/vocabulary.go
   func ValidateEntry(entry VocabEntry) []error {
       var errs []error

       // Require bidirectional notes
       if entry.NotesBgToDe == "" || entry.NotesDeToBg == "" {
           errs = append(errs, fmt.Errorf("missing directional notes for %s", entry.ID))
       }

       // Validate CEFR level
       if !isValidCEFRLevel(entry.Level) {
           errs = append(errs, fmt.Errorf("invalid CEFR level: %s", entry.Level))
       }

       // Validate examples
       if len(entry.Examples) == 0 {
           errs = append(errs, fmt.Errorf("no examples for %s", entry.ID))
       }

       return errs
   }
   ```

2. **Hugo Integration** (via npm scripts)
   ```json
   {
     "scripts": {
       "validate": "cd tools && go run ./cmd/hugo-bg-de validate",
       "process-data": "cd tools && go run ./cmd/hugo-bg-de process-data",
       "prebuild": "npm run validate",
       "build": "npm run prebuild && hugo --gc --minify"
     }
   }
   ```

3. **Pre-commit Hook** (optional but recommended)
   ```bash
   # .git/hooks/pre-commit
   #!/bin/sh
   echo "Validating vocabulary data..."
   cd tools && go run ./cmd/hugo-bg-de validate
   if [ $? -ne 0 ]; then
       echo "Validation failed. Commit aborted."
       exit 1
   fi
   ```

**Expected Outcome**:
- ✅ Go tools ensure data quality
- ✅ Automated validation in CI/CD
- ✅ Clear separation: Hugo = build, Go = validate/process

---

### Phase 4: Build Artifact Cleanup 🔴 HIGH PRIORITY

**Goal**: Remove all build artifacts from Git, generate at build time

**Current State**:
```
scss/main.min.*.css (3 fingerprinted versions) ← BUILD ARTIFACT
vocabulary/ (158 HTML directories) ← BUILD ARTIFACT
grammar/ (12 HTML directories) ← BUILD ARTIFACT
public/ (entire built site) ← SHOULD BE IN .gitignore
```

**Actions**:

1. **Update .gitignore**
   ```gitignore
   # Hugo build outputs
   /public/
   /resources/_gen/
   /scss/main.min*.css

   # Build artifacts
   /vocabulary/**/index.html
   /grammar/**/index.html

   # Hugo cache
   /.hugo_build.lock

   # Go build artifacts
   /tools/hugo-bg-de
   /hugo-bg-de

   # Node
   node_modules/

   # Backups (keep in data/archive, ignore in root)
   /*.backup*.json
   ```

2. **Remove from Git**
   ```bash
   git rm -r public/
   git rm -r scss/main.min*.css
   git rm -r vocabulary/*/index.html
   git rm -r grammar/*/index.html
   git commit -m "Remove build artifacts from Git"
   ```

3. **Update CI/CD** (already correct in `.github/workflows/deploy.yml`)
   ```yaml
   - name: Build
     run: |
       hugo --gc --minify
       # Artifacts generated fresh on each build
   ```

**Expected Outcome**:
- ✅ Smaller repository (remove ~1MB+ of build artifacts)
- ✅ No merge conflicts on generated files
- ✅ Cleaner git history
- ✅ True source-of-truth in repo

---

### Phase 5: Template Optimization 🟡 MEDIUM PRIORITY

**Goal**: Optimize Hugo templates to follow best practices

**Current Issues**:
1. Some inline CSS/JS in templates (already documented in roadmap)
2. Multiple similar templates (could use Hugo's template inheritance better)
3. Potential template duplication

**Actions**:

1. **Extract Inline Assets** (deferred in Phase 3 of roadmap)
   ```go-html-template
   {{/* layouts/practice/single.html - BEFORE */}}
   <style>
     .practice-card { ... }
   </style>

   {{/* layouts/practice/single.html - AFTER */}}
   {{ $practiceCSS := resources.Get "scss/pages/practice.scss" }}
   {{ $practiceCSS = $practiceCSS | resources.ToCSS | resources.Minify | resources.Fingerprint }}
   <link rel="stylesheet" href="{{ $practiceCSS.Permalink }}">
   ```

2. **Leverage Hugo's Lookup Order**
   ```
   layouts/
   ├── _default/
   │   ├── baseof.html (base template)
   │   ├── list.html (default list)
   │   └── single.html (default single)
   ├── vocabulary/
   │   └── list.html (overrides _default/list.html)
   ├── grammar/
   │   ├── list.html
   │   └── single.html
   └── practice/
       └── single.html
   ```

3. **Use Partials Effectively**
   ```go-html-template
   {{/* Reusable components */}}
   {{ partial "vocab-card.html" . }}
   {{ partial "flashcard-container.html" . }}
   {{ partial "difficulty-badge.html" . }}
   ```

4. **Create Data-Driven Templates**
   ```go-html-template
   {{/* layouts/vocabulary/list.html */}}
   {{ range site.Data.vocabulary }}
     {{ partial "vocab-card.html" . }}
   {{ end }}
   ```

**Expected Outcome**:
- ✅ No CSP violations (remove 'unsafe-inline')
- ✅ Better cache efficiency (fingerprinted assets)
- ✅ More maintainable templates
- ✅ Follows Hugo idioms

---

### Phase 6: JavaScript Module Cleanup 🟡 MEDIUM PRIORITY

**Goal**: Complete migration to unified modules (partially done)

**Current State** (from roadmap):
- ✅ `unified-spaced-repetition.js` created (SM-2 v2)
- ✅ `unified-practice-session.js` created
- ⏸️ Old modules (`enhanced-*.js`, `practice.js`) still exist
- ⏸️ Templates not yet updated to use unified modules

**Actions**:

1. **Update Practice Template**
   ```go-html-template
   {{/* layouts/practice/single.html - BEFORE */}}
   {{ $practice := resources.Get "js/enhanced-practice-session.js" }}

   {{/* layouts/practice/single.html - AFTER */}}
   {{ $practice := resources.Get "js/unified-practice-session.js" }}
   {{ $spaced := resources.Get "js/unified-spaced-repetition.js" }}
   ```

2. **Remove Deprecated Modules**
   ```bash
   mkdir -p assets/js/archive
   mv assets/js/enhanced-*.js assets/js/archive/
   mv assets/js/practice.js assets/js/archive/
   mv assets/js/spaced-repetition.js assets/js/archive/
   ```

3. **Update Documentation**
   - Update `assets/js/README.md` to mark migration complete
   - Remove references to old modules

**Expected Outcome**:
- ✅ Single practice implementation
- ✅ No confusing duplicate modules
- ✅ Cleaner codebase

---

## Part 3: Proposed Final Architecture

### Directory Structure

```
BulgarianGermanLearningApp/
├── content/                    # MARKDOWN CONTENT (prose, pages)
│   ├── _index.md              # Home page
│   ├── grammar/               # Grammar lessons (MD with frontmatter)
│   │   ├── _index.md
│   │   ├── gender-of-nouns.md
│   │   └── word-order.md
│   ├── practice/              # Practice pages
│   │   └── _index.md
│   └── offline.md
│
├── data/                       # STRUCTURED DATA (JSON)
│   ├── vocabulary.json        # ← SINGLE SOURCE OF TRUTH
│   └── archive/               # Old backups
│
├── layouts/                    # HUGO TEMPLATES
│   ├── _default/
│   │   ├── baseof.html        # Base template
│   │   ├── list.html
│   │   ├── single.html
│   │   └── vocabulary-api.json # Generates /api/vocabulary.json
│   ├── vocabulary/
│   │   └── list.html          # Renders cards from data/vocabulary.json
│   ├── grammar/
│   │   ├── list.html
│   │   └── single.html        # Renders MD content
│   ├── practice/
│   │   └── single.html
│   ├── shortcodes/            # Reusable components
│   │   ├── vocab-card.html
│   │   └── flashcards.html
│   └── partials/              # Template fragments
│
├── assets/                     # ASSETS (processed by Hugo Pipes)
│   ├── js/
│   │   ├── unified-spaced-repetition.js
│   │   ├── unified-practice-session.js
│   │   ├── modules/
│   │   └── archive/           # Old deprecated modules
│   └── scss/
│       ├── main.scss
│       └── pages/
│
├── static/                     # STATIC FILES (copied as-is)
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── images/
│
├── tools/                      # GO CLI UTILITIES
│   ├── cmd/
│   │   └── hugo-bg-de/        # Main CLI
│   ├── internal/
│   │   ├── validator/         # Data validation
│   │   ├── processor/         # Data processing
│   │   └── models/            # Data models
│   ├── go.mod
│   └── go.sum
│
├── scripts/                    # NODE.JS SCRIPTS
│   ├── merge-vocabulary.mjs
│   ├── validate-data.mjs
│   └── enhance-vocabulary.mjs
│
├── tests/                      # TESTS
│   └── playwright/
│
├── docs/                       # DOCUMENTATION
│
├── hugo.toml                   # Hugo config
├── package.json                # npm scripts
└── .gitignore                  # Exclude build artifacts
```

### Data Flow

```
┌─────────────────────┐
│ data/vocabulary.json│ ← SINGLE SOURCE OF TRUTH
└──────────┬──────────┘
           │
           ├──────────────────────────────────────┐
           │                                      │
           v                                      v
┌──────────────────────────┐          ┌─────────────────────┐
│ Hugo Template Generation │          │ Go Validation       │
│ (vocabulary/list.html)   │          │ (pre-build hook)    │
└──────────┬───────────────┘          └─────────────────────┘
           │
           ├─────────────────┬─────────────────┐
           v                 v                 v
┌─────────────────┐  ┌─────────────┐  ┌────────────────┐
│ HTML Pages      │  │ JSON API    │  │ Search Index   │
│ (vocabulary/)   │  │ (/api/...)  │  │ (search.json)  │
└─────────────────┘  └─────────────┘  └────────────────┘
                             │
                             v
                     ┌─────────────────┐
                     │ JavaScript      │
                     │ Flashcard App   │
                     └─────────────────┘
```

### Responsibilities

| Component | Responsibility | Technology |
|-----------|---------------|------------|
| **Hugo** | Static site generation, templating, asset processing | Go (binary) |
| **Go Tools** | Data validation, vocabulary processing, dev CLI | Go 1.23 |
| **npm Scripts** | Build orchestration, data migration | Node.js |
| **JSON Data** | Vocabulary source of truth | JSON |
| **Markdown** | Grammar content, prose, documentation | Markdown + YAML frontmatter |
| **JavaScript** | Client-side interactivity, flashcards, spaced repetition | ES Modules |
| **Playwright** | E2E testing | TypeScript |

---

## Part 4: Implementation Roadmap

### Week 1: Data Consolidation 🔴

- [ ] Execute vocabulary merge (`node scripts/merge-vocabulary.mjs`)
- [ ] Validate merged data (`npm run validate`)
- [ ] Remove duplicate MD files from `content/vocabulary/`
- [ ] Update `.gitignore` to exclude build artifacts
- [ ] Remove build artifacts from Git
- [ ] Test Hugo build (`hugo --gc --minify`)

**Success Criteria**:
- Single `data/vocabulary.json` file
- No vocabulary MD files except `_index.md`
- Clean git history (artifacts removed)
- Hugo builds without errors

### Week 2: Grammar Enhancement 🟡

- [ ] Audit grammar content quality
- [ ] Migrate `data/grammar.json` to MD frontmatter
- [ ] Enrich grammar pages with detailed content
- [ ] Create grammar shortcodes
- [ ] Update grammar templates
- [ ] Archive old `data/grammar.json`

**Success Criteria**:
- Rich grammar pages with examples
- No dependency on `data/grammar.json`
- SEO-optimized content

### Week 3: Template & JS Cleanup 🟡

- [ ] Update practice template to use unified modules
- [ ] Remove deprecated JS modules
- [ ] Extract inline CSS/JS from templates
- [ ] Create reusable partials for common components
- [ ] Update CSP to remove `'unsafe-inline'`
- [ ] Run Playwright tests (`npm test`)

**Success Criteria**:
- No deprecated modules referenced
- All tests passing
- Tighter CSP policy

### Week 4: Go Tools & CI/CD 🟢

- [ ] Enhance Go validator with stricter rules
- [ ] Add pre-commit hook for validation
- [ ] Update CI/CD to run Go validation
- [ ] Add automated tests for Go tools
- [ ] Document Go CLI usage

**Success Criteria**:
- Validation runs on every commit
- CI fails on invalid data
- Clear documentation for contributors

---

## Part 5: Migration Checklist

### Pre-Migration

- [ ] Backup entire repository (`git archive`)
- [ ] Document current state
- [ ] Run full test suite
- [ ] Tag current version (`git tag v1.0-pre-refactor`)

### During Migration

- [ ] Work on feature branch (`git checkout -b refactor/hugo-go-best-practices`)
- [ ] Commit frequently with clear messages
- [ ] Test after each major change
- [ ] Keep production branch stable

### Post-Migration

- [ ] Full regression testing (Playwright + manual)
- [ ] Performance comparison (Lighthouse)
- [ ] Documentation updates
- [ ] Deployment to staging
- [ ] User acceptance testing
- [ ] Merge to main
- [ ] Tag new version (`git tag v2.0-refactored`)

---

## Part 6: Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during merge | High | Low | Automatic backups, dry-run mode |
| Breaking vocabulary display | High | Medium | Comprehensive tests, staging deploy |
| Grammar content regression | Medium | Low | Content audit, version control |
| Build pipeline failure | High | Low | CI validation, rollback plan |
| User data loss (localStorage) | High | Low | Auto-migration in unified modules |
| SEO impact | Medium | Low | Redirect map, sitemap validation |

---

## Part 7: Success Metrics

### Before Refactoring

- Repository size: ~50MB (with build artifacts)
- Vocabulary files: 158 MD + 1 JSON + duplicates = ~1MB duplicated data
- Build time: ~5-7 seconds
- Tests: 17 Playwright specs (passing)
- Data validation: Manual
- Template complexity: Medium (some duplication)

### After Refactoring (Target)

- Repository size: ~20MB (artifacts removed)
- Vocabulary files: 1 JSON only
- Build time: <5 seconds (fewer files to process)
- Tests: 17+ specs (including new validation tests)
- Data validation: Automated (pre-commit + CI)
- Template complexity: Low (clear patterns)

### Quality Metrics

- [ ] Zero duplication in vocabulary data
- [ ] 100% of grammar pages have rich content
- [ ] Zero inline styles/scripts (or explicitly allowed)
- [ ] All templates follow Hugo lookup order
- [ ] All data validated on commit
- [ ] All tests passing
- [ ] Lighthouse score: 95+ (all categories)

---

## Part 8: Recommended Resources

### Hugo Best Practices

- [Hugo Content Organization](https://gohugo.io/content-management/organization/)
- [Hugo Data Templates](https://gohugo.io/templates/data-templates/)
- [Hugo Lookup Order](https://gohugo.io/templates/lookup-order/)
- [Hugo Asset Processing](https://gohugo.io/hugo-pipes/)

### Go CLI Best Practices

- [Cobra CLI Framework](https://github.com/spf13/cobra)
- [CLI Guidelines](https://clig.dev/)
- [Go Project Layout](https://github.com/golang-standards/project-layout)

### Hugo + Go Integration

- [Hugo Modules](https://gohugo.io/hugo-modules/)
- [Content Adapters](https://gohugo.io/content-management/content-adapters/)
- [Build Hooks](https://gohugo.io/hugo-pipes/introduction/)

---

## Part 9: FAQ

### Q: Why not use Hugo Data Files for grammar too?

A: Grammar is **content** (prose, explanations, teaching material) while vocabulary is **data** (structured entries consumed by templates/JS). Grammar benefits from Markdown's readability, versioning, and SEO. Each grammar topic deserves its own URL and rich content.

### Q: Won't removing vocabulary MD files hurt SEO?

A: No - the vocabulary list page still exists and is SEO-optimized. Individual vocabulary items don't need their own URLs since they're primarily used in the flashcard system. If needed, Hugo can generate individual pages from the JSON data using templates.

### Q: Should Go tools be in the same repo?

A: Yes - monorepo approach is fine for this use case. The tools are tightly coupled to the Hugo site (validate its data). Separate Go module (`tools/go.mod`) maintains clear boundaries. Alternative: separate repo with npm dependency, but adds complexity.

### Q: What about i18n (multilingual)?

A: Current setup has `[languages]` config for bg/de/en. After refactoring:
- Vocabulary JSON can have language-specific fields (already does: `notes_bg_to_de`, `notes_de_to_bg`)
- Grammar can use Hugo's `content/bg/`, `content/de/` structure if needed
- Current approach (bidirectional notes in single entry) works well for this app

### Q: How to handle vocabulary additions going forward?

A:
1. Edit `data/vocabulary.json` directly
2. Run `npm run validate` (Go tool validates schema)
3. Hugo automatically regenerates pages on next build
4. No need to create separate MD files

---

## Conclusion

This refactoring proposal aligns the Bulgarian-German Learning App with Hugo and Go best practices while respecting the unique needs of a language learning application.

**Key Takeaways**:

1. ✅ **JSON for vocabulary is the right choice** - it's structured data consumed by templates/JS
2. ✅ **Markdown for grammar is the right choice** - it's prose content meant to be read
3. ✅ **Go tools in subdirectory is fine** - supplementary utilities, not core dependencies
4. ✅ **Single source of truth** - eliminate all duplication
5. ✅ **Build artifacts must not be in Git** - generate at build time

**Priority Order**:
1. 🔴 **Week 1**: Data consolidation (immediate impact, prevents future confusion)
2. 🟡 **Week 2-3**: Template/JS cleanup (improves maintainability)
3. 🟢 **Week 4**: Go tools enhancement (nice-to-have, improves DX)

**Estimated Effort**: 2-3 weeks (part-time), 1 week (full-time)

**Risk Level**: LOW (good test coverage, automatic backups, incremental approach)

---

**Next Steps**:
1. Review and approve this plan
2. Create feature branch
3. Start with Week 1 tasks
4. Iterate based on feedback

**Questions? Concerns?** Please discuss before proceeding with implementation.
