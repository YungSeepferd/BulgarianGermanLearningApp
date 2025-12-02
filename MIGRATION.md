# Migration Guide: Legacy to Svelte 5 Monolith

## Overview
This project has been refactored from a hybrid Hugo/Svelte structure to a pure SvelteKit 5 application.

## 1. Pre-Migration Checks
- [ ] Ensure `Node.js` >= 18 is installed.
- [ ] Verify `pnpm` is available.
- [ ] Check that `_legacy_archive/` does not already exist (or back it up).

## 2. Execution Steps
1. **Cleanup**: Run `./cleanup.sh` to move `content/`, `hugo.toml`, and other legacy files to `_legacy_archive/`.
   - The script will log its actions to `_cleanup.log`.
   - It is safe to run multiple times (idempotent).

2. **Install**: Run `pnpm install` to update dependencies to Svelte 5.
3. **Build**: Run `pnpm build` to verify the static adapter configuration.

## 3. Architecture Changes
- **Framework**: Upgraded to Svelte 5 (Runes mode enabled in `svelte.config.js`).
- **Routing**: Hugo's file-based routing (`content/*.md`) is replaced by SvelteKit routes (`src/routes`).
- **State Management**:
  - `src/lib/state/app.svelte.ts`: Global state using Runes (`$state`, `$derived`).
  - `languageMode`: Replaces the legacy `currentDirection`.
- **Data Layer**:
  - `src/lib/data/vocabulary.json`: Strongly typed JSON seed data.
  - `src/lib/data/db.ts`: In-memory database abstraction (ready for Supabase).

## 4. Breaking Changes
- **Data Source**: Vocabulary is no longer read from Markdown frontmatter. It is sourced from `src/lib/data/vocabulary.json`.
- **Legacy Components**: Some components may need updates to support Svelte 5 syntax (e.g., event handling, slots).
- **Strict Mode**: `svelte.config.js` enables `runes: true`, which may flag legacy code patterns.

## 5. Rollback Procedure
If the migration fails or critical data is missing:
1. Restore the contents of `_legacy_archive/` to the root directory.
2. Revert `package.json` and `svelte.config.js` to their previous states.
3. Delete the `src/lib/data/db.ts` and `src/lib/data/vocabulary.json` files if they conflict.

## 6. Validation
Run the following to verify the migration:
```bash
# 1. Clean legacy artifacts
./cleanup.sh

# 2. Install dependencies
pnpm install

# 3. Check types
pnpm check

# 4. Run tests
pnpm test