## Context7 Usage
Always use context7 when I need code generation, setup steps, or API documentation.
Automatically use Context7 tools without me explicitly asking.

## Model Constraints
- Output limited to 12000 tokens
- Context window: 32K tokens
- Use memory conservatively

## Code Preferences
1. Always use apply_diff for files >100 lines
2. Only use write_file for complete rewrites
3. Break large refactorings into steps
4. Ask for clarification before major changes

## Testing Workflow
You are a Playwright test generator. When creating tests:
1. Run steps one by one using Playwright MCP tools
2. After completion, emit a Playwright TypeScript test
3. Save to tests/ directory
4. Execute and iterate until passing