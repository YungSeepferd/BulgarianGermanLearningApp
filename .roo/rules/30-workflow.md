# Workflow Rules

- **Rule:** When running tests, check `package.json` scripts first (usually `pnpm test:unit` or `pnpm test:e2e`).
- **Rule:** Keep `vite.config.ts` and `playwright.config.ts` distinct (Unit vs E2E).
- **Rule:** Use `pnpm run simulate-ci` to run CI checks locally before pushing changes.
- **Rule:** The CI simulation script (`scripts/simulate-ci.js`) replaces the pre-push hook and should be run manually to ensure all checks pass.
- **Rule:** Always run the CI simulation before creating a pull request to catch issues early.
- **Rule:** If the CI simulation fails, fix the issues before pushing changes to remote.
- **Rule:** Server management: Always check for running servers before starting new ones to avoid port conflicts.
- **Rule:** Use `pkill -f "pnpm dev"` to stop existing development servers if needed.