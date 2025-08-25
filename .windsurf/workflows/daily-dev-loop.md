---
description: Daily Dev Loop
auto_execution_mode: 1
---

Goal: Implement a small feature or fix in the Bulgarian–German app, end-to-end, today.

Context:
- Repo: this workspace
- Code: @dir:assets/js @dir:assets/scss @dir:layouts @dir:content @dir:data @dir:tools
- Docs: @file:docs/DEVELOPMENT.md @file:docs/PROJECT_PLAN.md @file:docs/PROGRAMMING_LINKS.md (or docs/programming_links.md)

Constraints:
- Hugo Extended + Go only; vanilla JS modules; SCSS via Hugo Pipes; no new external deps.
- Keep edits minimal and localized; do not rewrite unrelated files.

Tasks:
1) Plan: Read docs/PROJECT_PLAN.md and PROGRAMMING_LINKS.md to confirm tech refs; write a 5-bullet task plan in docs/notes/TODAY.md (create if missing).
2) Implement: Make targeted changes with explicit file diffs.
3) Test: 
   - Run `hugo server -D` cleanly; no console errors.
   - Run `go test ./...` for tools; if none, add a minimal test for any changed Go code.
   - JS: basic syntax check (e.g., `node -c` or lint if present).
4) Verify UX: Mobile viewport ~360px, keyboard access for any new controls.
5) Update docs: Append a short “What changed / Next steps” to docs/notes/TODAY.md.

Deliverables:
- Code diffs, TODAY.md plan+notes, and a short acceptance checklist.
