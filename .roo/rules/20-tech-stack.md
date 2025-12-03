# Tech Stack Rules

- **Rule:** Use **Svelte 5 Runes** syntax exclusively (`$state`, `$derived`, `$effect`, `$props`).
- **Constraint:** Do NOT use legacy `svelte/store` (`writable`, `readable`) unless working on files explicitly marked as `_legacy`.
- **Constraint:** Do NOT use `export let` for props; use `let { prop } = $props()`.
- **Rule:** Use strict TypeScript. No `any` types allowed.