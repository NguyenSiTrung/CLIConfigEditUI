# Spec: Add Kilo Code CLI Predefined Tool

## Overview

Add Kilo Code CLI as a predefined tool in CLI Config Editor, enabling users to edit and manage Kilo Code CLI configuration files through the unified interface.

## Functional Requirements

### FR-1: Predefined Tool Definition
- Add "Kilo Code CLI" to the predefined tools list
- Tool ID: `kilo-code-cli`
- Display name: "Kilo Code CLI"
- Icon: Use appropriate icon from Lucide React library

### FR-2: Configuration Files
Support two configuration files:

| File | Path | Format | Description |
|------|------|--------|-------------|
| Main Config | `~/.kilocode/config.json` | JSON | CLI settings, auto-approval, providers |
| MCP Settings | `~/.kilocode/mcp_settings.json` | JSON | Global MCP server configurations |

### FR-3: Cross-Platform Path Resolution
- **macOS/Linux**: `~/.kilocode/`
- **Windows**: `%USERPROFILE%\.kilocode\`

### FR-4: MCP Sync Support
- Enable MCP sync for `mcp_settings.json` (uses standard `mcpServers` format)
- MCP path pattern: `mcpServers` root key

## Non-Functional Requirements

- Detection should complete within existing startup time budget (<1 second)
- Follow existing predefined tool patterns in codebase

## Acceptance Criteria

- [ ] Kilo Code CLI appears in sidebar when config files exist
- [ ] Both config.json and mcp_settings.json are editable
- [ ] Syntax highlighting works for JSON format
- [ ] MCP sync can read/write to mcp_settings.json
- [ ] Works on macOS, Linux, and Windows

## Out of Scope

- Project-level MCP config (`.kilocode/mcp.json` in project root)
- Kilo Code VS Code extension settings
- CLI installation or update management
