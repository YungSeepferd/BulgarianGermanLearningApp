---
description: Official Docs Sweep + Links Sync (source-of-truth refresh)
auto_execution_mode: 1
---

Goal: Refresh and validate our official references and ensure code aligns with current docs.

Context:
- @file:docs/PROGRAMMING_LINKS.md (or docs/programming_links.md)
- @file:docs/DEVELOPMENT.md @file:docs/PROJECT_PLAN.md

Constraints:
- Prefer official docs (Hugo, Go) and Windsurf best-practice pages.
- Keep PROGRAMMING_LINKS.md concise: headings + canonical links only.

Tasks:
1) Open PROGRAMMING_LINKS.md; verify/update sections for:
   - Hugo (Pipes/SCSS, templates, GitHub Pages)
   - Go (Effective Go, testing, modules)
   - Windsurf (prompt engineering, memories/workflows)
2) Add a “How to Consult Docs in Windsurf” snippet (with @-mentions, /docs usage).
3) File a TODO list in docs/notes/NEXT.md for gaps found; propose small tasks.

Deliverables:
- Updated PROGRAMMING_LINKS.md and NEXT.md with 3–5 concrete follow-ups.
