# Tech Stack Rules

- **Rule:** Use **Svelte 5 with Runes** syntax exclusively (`$state`, `$derived`, `$effect`, `$props`, `$bindable`).
- **Constraint:** Do NOT use legacy `svelte/store` (`writable`, `readable`) unless working on files explicitly marked as `_legacy`.
- **Constraint:** Do NOT use `export let` for props; use `let { prop } = $props()` for component props.
- **Constraint:** Do NOT use legacy reactive statements (`$:`) in new code; use `$derived` and `$effect` instead.
- **Rule:** Use strict TypeScript with `strict: true` in `tsconfig.json`. No `any` types allowed.
- **Rule:** Follow Svelte 5 file extension conventions:
  - `.svelte` for standard components with markup
  - `.svelte.ts` for reusable reactive logic using runes
  - `.ts` for pure TypeScript utility functions
- **Rule:** Use Tailwind CSS v4 for styling with utility-first approach.
- **Rule:** Use SvelteKit for application structure and routing.