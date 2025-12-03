# Workflow Rules

- **Rule:** Before editing code, always check `CURRENT_WORK_PLAN.md` or the active roadmap.
- **Rule:** When running tests, check `package.json` scripts first (usually `pnpm test:unit` or `pnpm test:e2e`).
- **Rule:** Keep `vite.config.ts` and `playwright.config.ts` distinct (Unit vs E2E).