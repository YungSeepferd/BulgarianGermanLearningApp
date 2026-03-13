# Global Bun MCP Server Setup Guide

**Date**: January 28, 2026

This guide explains how to configure the Bun MCP server globally for GitHub Copilot, Codex, and Roo Code.

## Automatic Installation Issues

Due to file permission restrictions, automatic configuration updates were not possible. You'll need to manually add the Bun MCP server configuration to each tool.

## Configuration Locations

### 1. GitHub Copilot / Roo Code (VSCode MCP)

Both GitHub Copilot and Roo Code use VSCode's MCP configuration.

**File Location**:
```
/Users/dinz/Library/Application Support/Code/User/mcp.json
```

**Configuration to Add**:
Add this block inside the `"servers"` object:

```json
"bun": {
    "command": "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/local-bun/bun",
    "args": [
        "run",
        "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/mcp-bun/src/mcp-bun.ts"
    ],
    "type": "stdio",
    "env": {
        "DISABLE_NOTIFICATIONS": "true"
    }
}
```

**Complete Example**:
```json
{
	"servers": {
		"svelte": {
			"command": "npx",
			"args": ["-y", "@sveltejs/mcp@latest"],
			"type": "stdio"
		},
		"context7": {
			"command": "npx",
			"args": ["-y", "@upstash/context7-mcp@latest"],
			"type": "stdio"
		},
		"bun": {
			"command": "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/local-bun/bun",
			"args": [
				"run",
				"/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/mcp-bun/src/mcp-bun.ts"
			],
			"type": "stdio",
			"env": {
				"DISABLE_NOTIFICATIONS": "true"
			}
		},
		"sequentialthinking": {
			"command": "npx",
			"args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
			"type": "stdio"
		},
		"io.github.ChromeDevTools/chrome-devtools-mcp": {
			"type": "stdio",
			"command": "npx",
			"args": ["chrome-devtools-mcp@0.12.0"],
			"gallery": "https://api.mcp.github.com",
			"version": "0.12.0"
		},
		"microsoft/playwright-mcp": {
			"type": "stdio",
			"command": "npx",
			"args": ["@playwright/mcp@latest"],
			"gallery": "https://api.mcp.github.com",
			"version": "0.0.1-seed"
		},
		"storybook-mcp": {
			"type": "http",
			"url": "http://localhost:6006/mcp"
		}
	}
}
```

**Installation Steps**:
1. Open VSCode
2. Open the MCP configuration file:
   - Command Palette: `Cmd+Shift+P`
   - Type: `Preferences: Open User Settings (JSON)`
   - Or directly edit: `/Users/dinz/Library/Application Support/Code/User/mcp.json`
3. Add the `bun` server configuration to the `servers` object
4. Save the file
5. Reload VSCode window (`Cmd+Shift+P` → `Developer: Reload Window`)
6. Restart the MCP client if needed

### 2. Codex CLI

**File Location**:
```
/Users/dinz/.codex/config.toml
```

**Configuration to Add**:
Add this block after the `[mcp_servers.svelte]` section:

```toml
# Bun JavaScript runtime - fast, efficient, Node.js compatible
[mcp_servers.bun]
command = "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/local-bun/bun"
args = ["run", "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/mcp-bun/src/mcp-bun.ts"]
env = { DISABLE_NOTIFICATIONS = "true" }
startup_timeout_ms = 60000
```

**Complete Example**:
```toml
[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp@latest"]
startup_timeout_ms = 60000

# Bun JavaScript runtime - fast, efficient, Node.js compatible
[mcp_servers.bun]
command = "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/local-bun/bun"
args = ["run", "/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/mcp-bun/src/mcp-bun.ts"]
env = { DISABLE_NOTIFICATIONS = "true" }
startup_timeout_ms = 60000

[mcp_servers.sequentialthinking]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-sequential-thinking"]
startup_timeout_ms = 60000
```

**Installation Steps**:
1. Open Terminal
2. Edit the Codex config file:
   ```bash
   code ~/.codex/config.toml
   # or
   nano ~/.codex/config.toml
   ```
3. Add the `[mcp_servers.bun]` configuration block
4. Save the file
5. Restart Codex CLI

## Verification

After configuring the Bun MCP server, verify it's working:

### VSCode (Copilot/Roo Code)
1. Open a new VSCode window
2. Open Command Palette (`Cmd+Shift+P`)
3. Type: `MCP: Show Servers` or `MCP: List Servers`
4. Verify `bun` server is listed and connected

### Codex CLI
1. Start a new Codex session
2. Check available MCP servers with a query like: "List all available MCP servers"
3. Verify `bun` server is available

## Available Bun MCP Tools

Once configured, the Bun MCP server provides these tools:

### Core Execution
- `run-bun-script-file` - Execute JS/TS files with Bun
- `run-bun-eval` - Execute code directly

### Package Management
- `run-bun-install` - Install dependencies with Bun
- `run-bun-script` - Run npm scripts with Bun

### Build & Optimization
- `run-bun-build` - Build with Bun's bundler
- `run-bun-test` - Run tests with Bun's test runner

### Performance Analysis
- `analyze-bun-performance` - Analyze project performance
- `benchmark-bun-script` - Benchmark scripts

### Server Management
- `start-bun-server` - Start Bun servers
- `start-node-server` - Start Node.js servers
- `list-servers` - List running servers
- `stop-server` - Stop servers
- `get-server-logs` - Retrieve server logs

### Version Management
- `get-bun-version` - Get Bun version
- `list-bun-versions` - List installations
- `select-bun-version` - Select version

## Troubleshooting

### Server Not Showing Up

1. **Check file permissions**:
   ```bash
   ls -la ~/.codex/config.toml
   ls -la '/Users/dinz/Library/Application Support/Code/User/mcp.json'
   ```

2. **Verify Bun binary is executable**:
   ```bash
   chmod +x '/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/local-bun/bun'
   ```

3. **Test Bun directly**:
   ```bash
   /Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/local-bun/bun --version
   ```

4. **Check configuration syntax**:
   - JSON: Use a JSON validator
   - TOML: Use a TOML validator

### Permission Denied Errors

If you encounter permission errors when editing configuration files:

```bash
# For VSCode MCP config
sudo cp /tmp/vscode_mcp.json.new '/Users/dinz/Library/Application Support/Code/User/mcp.json'

# For Codex config
sudo cp /tmp/codex_config.toml.new ~/.codex/config.toml
```

### Server Connection Timeout

If the Bun MCP server fails to start:

1. Check if Bun is installed correctly:
   ```bash
   /Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/local-bun/bun --version
   ```

2. Verify the mcp-bun source file exists:
   ```bash
   ls -la '/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/mcp-bun/src/mcp-bun.ts'
   ```

3. Increase `startup_timeout_ms` in configuration (e.g., from 60000 to 90000)

## Benefits of Using Bun

- **~20x faster** package installation vs npm
- **~2-4x faster** script execution vs Node.js
- **~10x faster** test execution vs Jest
- **Native TypeScript** support (no compilation needed)
- **Built-in bundler** for production builds
- **Drop-in compatible** with Node.js projects

## Next Steps

1. Manually add the Bun MCP server configuration to each tool
2. Restart all AI coding assistants (VSCode, Codex, etc.)
3. Test the Bun MCP server with a simple command
4. Benchmark performance improvements in your projects
5. Gradually migrate package manager to Bun for faster development

## References

- **Bun Documentation**: https://bun.sh/docs
- **mcp-bun Repository**: https://github.com/carlosedp/mcp-bun
- **MCP Protocol**: https://modelcontextprotocol.io/
- **Project-specific guide**: `docs/mcp/SETUP_BUN_MCP.md`
