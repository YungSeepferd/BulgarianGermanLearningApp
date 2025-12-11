# Svelte MCP Server Setup (for Svelte 5 Syntax)

This guide integrates the official Svelte MCP server to keep our agents up-to-date with the latest Svelte 5 and SvelteKit syntax and APIs.

## Options
- Local MCP (recommended for offline + full tools): `@sveltejs/mcp`
- Remote MCP: `https://mcp.svelte.dev/mcp`

## Local Setup (GitHub Copilot / Claude Code / Codex CLI)

1. Install and initialize via Svelte CLI:
```bash
npx sv add mcp
```
This scaffolds MCP config and adds prompt guidance (AGENTS.md / CLAUDE.md / GEMINI.md).

2. Configure MCP client (example: GitHub Copilot in VS Code):
- Enable MCP servers in Copilot settings (org or personal):
  - GitHub → Settings → Copilot → Features → "Enable MCP servers"
- Add the local server entry created by `sv add mcp`.

3. Tools available (per Svelte docs):
- list-sections — Use first to discover relevant docs
- get-documentation — Fetch docs content (multiple sections as needed)
- svelte-autofixer — Analyze Svelte code and suggest fixes/best practices
- playground-link — Generate Svelte Playground links (optional)

4. Usage prompt (imported by `sv add mcp`):
- Always start Svelte/SvelteKit tasks with `list-sections`
- Use `get-documentation` on all relevant sections
- Run `svelte-autofixer` before finalizing code
- Offer `playground-link` only if not writing to project files

## Remote Setup
Follow https://svelte.dev/docs/mcp/remote-setup to connect `https://mcp.svelte.dev/mcp` from your MCP client.

## Best Practices
- Prefer "Svelte 5 syntax" (components, runes, and APIs) over narrow "runes-only" thinking
- Validate code with `svelte-autofixer` before merging changes
- Keep docs current by calling `list-sections` + `get-documentation` when unsure

## Troubleshooting
- MCP not detected: verify Copilot MCP settings; restart VS Code
- Tools missing: re-run `npx sv add mcp` to scaffold prompts and config
- Autofixer suggestions: address all issues until none remain

## References
- Overview: https://svelte.dev/docs/mcp/overview
- Local setup: https://svelte.dev/docs/mcp/local-setup
- Remote setup: https://svelte.dev/docs/mcp/remote-setup
