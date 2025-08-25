---
description: Refactoring and Unit Testing
auto_execution_mode: 1
---

Goal: Refactor a small unit (Go or JS) to improve clarity without changing behavior, and add/expand tests.

Context:
- Go: @dir:tools/internal @dir:tools/cmd
- JS: @dir:assets/js
- Docs: @file:docs/PROGRAMMING_LINKS.md

Constraints:
- Preserve public APIs; ensure behavior identical (add tests first when possible).
- Go: idiomatic style per Effective Go; subtests for table-driven cases.
- JS: no frameworks; ES modules only.

Tasks:
1) Identify 1 target file (max ~200 LOC).
2) Write/extend tests:
   - Go: create/update *_test.go with table-driven tests and subtests; consider fuzz tests if inputs are free-form.
   - JS: add simple deterministic test file or a self-check harness (if no test runner).
3) Refactor: small, reversible steps; explain each change in the PR description.
4) Run: `go test -run . -v` (and fuzz if added), `hugo server -D` sanity.
5) Document: add a “Refactor Notes” section to docs/development-notes.md with before/after summary.

Deliverables:
- Test diffs, refactor diffs, and green test run output.
