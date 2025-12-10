# Workflow Rules

- **Rule:** When running tests, check `package.json` scripts first (usually `pnpm test:unit` or `pnpm test:e2e`).
- **Rule:** Keep `vite.config.ts` and `playwright.config.ts` distinct (Unit vs E2E).