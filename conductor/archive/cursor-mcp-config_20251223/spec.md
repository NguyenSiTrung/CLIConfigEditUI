# Spec: Fix Cursor MCP Config Paths

## Overview

Update the Cursor CLI tool definition to include the official MCP server configuration and CLI config paths as documented in the latest Cursor documentation (https://cursor.com/docs/context/mcp and https://cursor.com/docs/cli/reference/configuration).

## Problem

The current Cursor tool definition only includes `settings.json` but is missing critical MCP-related configuration files:
- `~/.cursor/mcp.json` - Global MCP server configuration
- `~/.cursor/cli-config.json` - CLI Agent configuration

Users cannot manage Cursor's MCP servers or CLI settings through CLI Config Editor.

## Functional Requirements

### FR-1: Add Global MCP Config
Add `~/.cursor/mcp.json` as a suggested config with:
- Label: "MCP Servers"
- Format: JSON
- Cross-platform paths:
  - Linux: `~/.cursor/mcp.json`
  - macOS: `~/.cursor/mcp.json`
  - Windows: `%USERPROFILE%\.cursor\mcp.json`
- json_path: `mcpServers` (for the servers object)

### FR-2: Add CLI Config
Add `~/.cursor/cli-config.json` as a suggested config with:
- Label: "CLI Config"
- Format: JSON
- Cross-platform paths:
  - Linux: `~/.cursor/cli-config.json`
  - macOS: `~/.cursor/cli-config.json`
  - Windows: `%USERPROFILE%\.cursor\cli-config.json`

### FR-3: Update Docs URL
Update `docs_url` from `https://cursor.sh/docs` to `https://cursor.com/docs` (current official URL).

## Acceptance Criteria

- [ ] Cursor tool shows "MCP Servers" config option
- [ ] Cursor tool shows "CLI Config" config option
- [ ] All paths resolve correctly on Linux, macOS, and Windows
- [ ] Docs URL points to current Cursor documentation
- [ ] Rust code compiles without errors
- [ ] Existing Settings config remains functional

## Out of Scope

- Project-level MCP config (`.cursor/mcp.json`) - requires workspace context
- Legacy `cursor_desktop_config.json` path
- MCP server validation or schema enforcement
