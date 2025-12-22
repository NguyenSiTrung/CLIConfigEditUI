# Spec: MCP Settings Sync

**Last Revised**: 2025-12-22 (Revision 1)

## Overview

Add a feature to CLI Config Editor that allows users to manage and synchronize MCP (Model Context Protocol) server configurations across all supported AI coding tools. Users can define a master list of MCP servers (from Claude's config or app-managed) and sync them to multiple tools with automatic format conversion.

## Functional Requirements

### FR-1: MCP Source Management
- **FR-1.1**: Support two source modes:
  - **Claude Import**: Read MCP servers from `~/.claude.json` (`mcpServers` key)
  - **App-Managed List**: Maintain a centralized MCP server list within the app
- **FR-1.2**: Allow users to switch between source modes
- **FR-1.3**: Provide UI to add, edit, and remove MCP servers in app-managed mode
- **FR-1.4**: Store app-managed MCP list persistently (app data directory)
- **FR-1.5**: Support `url` field for HTTP/SSE-based MCP servers (e.g., Amp) *(Added in Revision 1)*

### FR-2: Target Tool Configuration
- **FR-2.1**: Support MCP sync for all predefined CLI tools:
  | Tool | Config Path | JSON Path | Format |
  |------|-------------|-----------|--------|
  | Claude Code | `~/.claude.json` | `mcpServers` | Standard |
  | Gemini CLI | `~/.gemini/settings.json` | `mcpServers` | Standard |
  | Amp | `~/.config/amp/settings.json` | `amp.mcpServers` | Standard |
  | GitHub Copilot CLI | `~/.copilot/mcp-config.json` | `servers` | Custom key |
  | OpenCode | `~/.config/opencode/opencode.json` | `mcp` | Custom structure |
  | Factory Droid CLI | `~/.factory/mcp.json` | `mcpServers` | Standard |
  | Qwen Code | `~/.qwen/settings.json` | `mcpServers` | Standard |
- **FR-2.2**: Display which tools are installed/detected vs not found
- **FR-2.3**: Allow per-tool enable/disable for sync targets
- **FR-2.4**: Preserve tool-specific metadata fields during sync (e.g., `_target`, unknown keys) *(Added in Revision 1)*
- **FR-2.5**: Handle literal dotted-key JSON formats for Amp compatibility *(Added in Revision 1)*

### FR-3: Sync Operations
- **FR-3.1**: Provide "Sync All" button to sync to all enabled tools at once
- **FR-3.2**: Provide individual "Sync" action per tool
- **FR-3.3**: Automatic format conversion between different MCP config structures
- **FR-3.4**: Create backup before modifying any config file

### FR-4: Preview & Conflict Resolution
- **FR-4.1**: Optional preview mode showing diff of changes before applying
- **FR-4.2**: Smart merge behavior:
  - Add missing servers from source to target
  - Keep existing servers in target that aren't in source
  - Detect conflicts (same server name, different config)
- **FR-4.3**: Conflict resolution UI:
  - Show conflicting server configurations side-by-side
  - Allow user to choose per-server: Use Source, Keep Current, or merge manually *(Expanded in Revision 1)*
- **FR-4.4**: Preview final config JSON after resolution choices before applying *(Added in Revision 1)*
- **FR-4.5**: Individual tool sync triggers preview modal first *(Added in Revision 1)*

### FR-5: UI Integration
- **FR-5.1**: New "MCP Settings" section/tab in the app
- **FR-5.2**: Visual indicators for sync status per tool (synced, out-of-sync, conflicts)
- **FR-5.3**: Toast notifications for sync success/failure

## Non-Functional Requirements

- **NFR-1**: Sync operation should complete in < 2 seconds for all tools
- **NFR-2**: Backup files before any modification (existing backup system)
- **NFR-3**: Handle missing config files gracefully (create if needed)
- **NFR-4**: Cross-platform path resolution (Linux, macOS, Windows)

## Acceptance Criteria

- [ ] User can view MCP servers from Claude config or app-managed list
- [ ] User can add/edit/remove MCP servers in app-managed mode
- [ ] User can see which tools support MCP and their sync status
- [ ] User can sync MCP config to individual tools
- [ ] User can sync MCP config to all tools at once
- [ ] Format conversion works correctly for all tool-specific formats
- [ ] Preview shows accurate diff before applying changes
- [ ] Conflicts are detected and presented for resolution
- [ ] Backups are created before any config modification
- [ ] Works on Linux, macOS, and Windows

## Out of Scope

- MCP server validation (checking if servers are running/valid)
- OAuth/authentication flow for MCP servers
- Real-time sync (file watching for external changes)
- Project-level MCP configs (`.mcp.json`) - user-level only for MVP
- Cursor IDE MCP sync (no documented MCP config format yet)
