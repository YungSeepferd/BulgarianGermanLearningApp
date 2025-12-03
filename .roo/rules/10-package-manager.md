# Package Manager Rules

- **Rule:** ALWAYS use `pnpm`.
- **Constraint:** NEVER use `npm` or `yarn`. If a user asks to "install X", translate it to `pnpm add X`.
- **Constraint:** Do not generate `package-lock.json` or `yarn.lock`. Only maintain `pnpm-lock.yaml`.