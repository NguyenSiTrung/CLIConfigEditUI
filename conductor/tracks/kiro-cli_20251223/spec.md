# Spec: Add Kiro CLI Support

> **Last Revised:** 2025-12-23 - Added FR-4 for frontend CLI_TOOLS update

## Overview

Add predefined configuration support for Kiro CLI (AWS's agentic coding service) to the CLI Config Editor. Kiro is an AI coding assistant that supports MCP servers and extensive customization through settings.

## Functional Requirements

### FR-1: Add Kiro CLI Tool Definition (Backend)
- Add new `CliTool` entry with id `kiro-cli` in `src-tauri/src/config/cli_tools.rs`
- Display name: "Kiro CLI"
- Icon: "🪁" (kite emoji, representing Kiro)
- Docs URL: `https://kiro.dev/docs/cli/reference/settings/`
- Description: "AWS Kiro agentic coding CLI"

### FR-2: Settings Configuration
Add suggested config for main settings:
- Label: "Settings"
- Paths:
  - macOS: `~/.kiro/settings.json`
  - Linux: `~/.config/kiro/settings.json`
- Format: JSON
- Icon: "⚙️"
- Description: "Main configuration (chat, telemetry, knowledge, API)"
- No json_path (full file editing)

### FR-3: MCP Server Configuration (User-level)
Add suggested config for MCP servers:
- Label: "MCP Servers"
- Path: `~/.config/kiro/settings/mcp.json`
- Format: JSON
- Icon: "🔌"
- Description: "User-level MCP server configuration"
- No json_path (full file editing)

### FR-4: Frontend CLI_TOOLS Update
- Add matching `CliTool` entry in `src/utils/cli-tools.ts`
- Must mirror backend definition for sidebar display
- Required for tool to appear in UI

## Non-Functional Requirements

- Follow existing code patterns in `cli_tools.rs` and `cli-tools.ts`
- Maintain alphabetical or logical ordering of tools
- Keep frontend and backend definitions in sync

## Acceptance Criteria

1. Kiro CLI appears in the tool list when config files exist
2. Settings file can be opened and edited with syntax highlighting
3. MCP config file can be opened and edited
4. Both Linux and macOS paths are correctly resolved

## Out of Scope

- Workspace-level MCP config (`.kiro/settings/mcp.json`)
- Kiro IDE configuration
- json_path navigation for settings subsections
- Windows support (Kiro CLI not yet available on Windows)
