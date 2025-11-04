# MCP Server Migration: Continue → Roo Code

## Migration Summary

Successfully migrated **8 MCP servers** from Continue to Roo Code configuration.

## Configuration Format Differences

### Continue Format (YAML)
```yaml
name: Filesystem MCP Server
version: 0.0.1
schema: v1
mcpServers:
  - name: filesystem
    command: npx
    args:
      - -y
      - "@modelcontextprotocol/server-filesystem"
      - "/path/to/project"
    disabled: false
```

### Roo Code Format (JSON)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/path/to/project"
      ],
      "disabled": false
    }
  }
}
```

## Key Differences

1. **Format**: Continue uses YAML (`.yaml` files), Roo Code uses JSON (`.json` file)
2. **Structure**: Continue stores each server in separate files, Roo Code uses single `mcp.json`
3. **Location**:
   - Continue: `.continue/mcpServers/`
   - Roo Code: `.roo/mcp.json`
4. **Environment Variables**: Both support `${env:VAR_NAME}` syntax

## Migrated Servers

| Server | Package | Transport | Status |
|--------|---------|-----------|--------|
| filesystem | `@modelcontextprotocol/server-filesystem` | STDIO (npx) | ✅ Active |
| github | `@modelcontextprotocol/server-github` | STDIO (npx) | ✅ Active |
| memory | `@modelcontextprotocol/server-memory` | STDIO (npx) | ✅ Active |
| fetch | `mcp-server-fetch` | STDIO (uvx) | ✅ Active |
| git | `mcp-server-git` | STDIO (uvx) | ✅ Active |
| sequential-thinking | `@modelcontextprotocol/server-sequential-thinking` | STDIO (npx) | ✅ Active |
| playwright | `@playwright/mcp` | STDIO (npx) | ✅ Active |
| browser | `@browsermcp/mcp` | STDIO (npx) | ⏸️ Disabled |

## Configuration Changes

### 1. Memory Server Path
- **Continue**: `/Users/dinz/Applications/Portfolio UX VG/UX Portfolio with Github/Portfolio/.windsurf/memory/memory.json`
- **Roo Code**: `/Users/dinz/Coding Projects/BulgariaLearn/BulgarianApp-Fresh/.roo/memory/memory.json`
- **Reason**: Project-specific memory storage

### 2. GitHub Authentication
- **Continue**: `${GITHUB_PAT}` (from environment)
- **Roo Code**: `${env:GITHUB_PAT}` (explicit environment reference)
- **Status**: Uses same token, just different syntax

### 3. Disabled Tools (GitHub)
Continue had these tools disabled in GitHub server:
- `fork_repository`
- `list_commits`
- `search_users`

Roo Code doesn't currently support the `disabledTools` property in the same way. You can manage tool permissions through the Roo Code UI after the servers are loaded.

## Next Steps

1. **Set Environment Variables**
   ```bash
   export GITHUB_PAT="your_github_token_here"
   ```

2. **Reload Roo Code Configuration**
   - Click settings icon in Roo Code pane
   - Verify all 8 servers are listed
   - Check server status indicators

3. **Test Each Server**
   - Try filesystem operations
   - Test GitHub integration
   - Verify memory persistence
   - Check web fetch capabilities

4. **Optional: Remove Continue Configuration**
   ```bash
   # After verifying Roo Code works correctly
   rm -rf .continue/
   ```

## Troubleshooting

### If a server fails to start:

1. **Check logs**: VS Code Developer Tools → Console
2. **Verify installation**:
   ```bash
   # For npx servers
   npx -y <package-name> --version

   # For uvx servers
   uvx <package-name> --version
   ```
3. **Environment variables**:
   ```bash
   echo $GITHUB_PAT  # Should show your token
   ```

### Common Issues

- **"uvx: command not found"**: Install uv/uvx with `curl -LsSf https://astral.sh/uv/install.sh | sh`
- **GitHub auth fails**: Verify token at https://github.com/settings/tokens
- **Memory server can't write**: Check `.roo/memory/` directory exists and is writable

## Benefits of Roo Code

1. **Unified Configuration**: Single JSON file vs. multiple YAML files
2. **UI Management**: Built-in settings interface for managing servers
3. **Better Error Messages**: More detailed startup and runtime errors
4. **Auto-approval**: Can configure automatic tool approval per server
5. **Network Timeout Control**: Configurable timeouts (30s - 5min)

## Rollback Instructions

If you need to go back to Continue:

1. Keep `.continue/` directory (don't delete it)
2. Switch back to Continue extension
3. Configuration remains intact in `.continue/mcpServers/`

Both can coexist, but use different config locations.
