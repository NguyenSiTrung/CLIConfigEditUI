# Spec: Add Qoder CLI Predefined Tool

## Overview

Add Qoder CLI as a predefined tool in CLI Config Editor, enabling users to manage Qoder CLI configuration files through the unified interface.

## Functional Requirements

### FR-1: Add Qoder CLI Tool Definition

Add Qoder CLI to the predefined tools list with the following configuration:

| Property | Value |
|----------|-------|
| ID | `qoder-cli` |
| Name | Qoder CLI |
| Icon | 🤖 (or appropriate emoji) |
| Docs URL | https://qoder.com |
| Description | Qoder's AI coding CLI |

### FR-2: Suggested Config Files

Support the following user-level configuration files:

1. **Settings** (`~/.qoder/settings.json`)
   - Format: JSON
   - Icon: ⚙️
   - Description: User settings (permissions, hooks, tool configuration)

2. **Global Config** (`~/.qoder.json`)
   - Format: JSON
   - Icon: 📋
   - Description: Global configuration (auto-updates, preferences)

3. **MCP Servers** (`~/.qoder.json`)
   - Format: JSON
   - Icon: 🔌
   - Description: MCP server configuration
   - jsonPath: `mcpServers` (to focus on MCP section)

### FR-3: Update Both Frontend and Backend

- Add tool definition to `src/utils/cli-tools.ts` (CLI_TOOLS array)
- Add tool definition to `src-tauri/src/config/cli_tools.rs` (backend mirror)
- Add MCP tool entry to `src-tauri/src/mcp/types.rs` if needed for MCP sync

## Non-Functional Requirements

- Follow existing code patterns for tool definitions
- Maintain cross-platform path resolution (macOS, Linux, Windows)

## Acceptance Criteria

- [ ] Qoder CLI appears in the tool sidebar when detected
- [ ] All three config files can be opened and edited
- [ ] MCP Servers view shows only the mcpServers section
- [ ] Settings path correctly resolves on all platforms
- [ ] Typecheck and lint pass with no errors

## Out of Scope

- Project-level configs (`${project}/.qoder/settings.json`, `${project}/.mcp.json`)
- Memory file (`~/.qoder/AGENTS.md`)
