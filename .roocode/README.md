# Roo Code MCP Configuration

This directory contains the MCP (Model Context Protocol) server configuration for Roo Code.

## Configured MCP Servers

All MCP servers from Continue have been migrated to Roo Code:

### 1. **filesystem**
- **Package**: `@modelcontextprotocol/server-filesystem`
- **Purpose**: File system access for reading/writing files
- **Path**: Scoped to project root directory
- **Status**: ✅ Enabled

### 2. **github**
- **Package**: `@modelcontextprotocol/server-github`
- **Purpose**: GitHub repository operations (issues, PRs, commits, etc.)
- **Environment Variable Required**: `GITHUB_PAT`
- **Status**: ✅ Enabled

### 3. **memory**
- **Package**: `@modelcontextprotocol/server-memory`
- **Purpose**: Knowledge graph for maintaining context across sessions
- **Storage**: `.roo/memory/memory.json`
- **Status**: ✅ Enabled

### 4. **fetch**
- **Package**: `mcp-server-fetch` (Python/uvx)
- **Purpose**: Fetch and process web content
- **Status**: ✅ Enabled

### 5. **git**
- **Package**: `mcp-server-git` (Python/uvx)
- **Purpose**: Git operations (status, diff, commit, branch management)
- **Status**: ✅ Enabled

### 6. **sequential-thinking**
- **Package**: `@modelcontextprotocol/server-sequential-thinking`
- **Purpose**: Enhanced reasoning with chain-of-thought processing
- **Status**: ✅ Enabled

### 7. **playwright**
- **Package**: `@playwright/mcp`
- **Purpose**: Browser automation and testing
- **Status**: ✅ Enabled

### 8. **browser**
- **Package**: `@browsermcp/mcp`
- **Purpose**: Alternative browser control (currently disabled)
- **Status**: ⏸️ Disabled

## Environment Variables Setup

### Required Environment Variables

1. **GITHUB_PAT** (GitHub Personal Access Token)
   - Create at: https://github.com/settings/tokens
   - Required scopes: `repo`, `read:user`, `user:email`

### Setting Environment Variables

Add to your shell configuration file (`~/.zshrc`, `~/.bashrc`, etc.):

```bash
# GitHub Personal Access Token for MCP
export GITHUB_PAT="your_github_token_here"
```

Then reload your shell:
```bash
source ~/.zshrc  # or ~/.bashrc
```

## Prerequisites

### Node.js/npm packages
Most MCP servers use `npx` which automatically installs packages. No manual installation needed.

### Python packages (uvx)
For `fetch` and `git` servers, ensure you have `uvx` installed:

```bash
# Install uv (includes uvx)
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Playwright
If using the Playwright server, ensure browsers are installed:

```bash
npx playwright install
```

## Configuration File Location

- **Project-level**: `.roo/mcp.json` (this file takes precedence)
- **Global**: Access via Roo Code settings interface

## How to Use

1. Open this project in VS Code with Roo Code extension installed
2. Click the settings icon in the Roo Code pane
3. Verify all servers are listed and enabled
4. The servers will automatically start when needed

## Troubleshooting

### Server won't start
- Check that environment variables are set (especially `GITHUB_PAT`)
- Verify `uvx` is installed for Python-based servers
- Check VS Code developer console for errors

### Memory server issues
- Ensure `.roo/memory/` directory exists
- Check file permissions for `memory.json`

### GitHub authentication fails
- Verify `GITHUB_PAT` is set correctly
- Check token has required scopes
- Test token: `curl -H "Authorization: token $GITHUB_PAT" https://api.github.com/user`

## Migration from Continue

This configuration was migrated from Continue (`.continue/mcpServers/`). All servers maintain the same functionality with Roo Code's JSON format instead of Continue's YAML format.

## References

- [Roo Code MCP Documentation](https://docs.roocode.com/features/mcp/using-mcp-in-roo)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP Server Registry](https://github.com/modelcontextprotocol/servers)
