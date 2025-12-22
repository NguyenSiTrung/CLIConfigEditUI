# Plan: MCP Settings Sync

**Last Revised**: 2025-12-22 (Revision 1)

## Phase 1: Backend - MCP Data Structures & Storage

- [x] Task 1.1: Define MCP types and data structures (commit: manual impl)
  - [x] Create `McpServer` interface (name, command, args, env, etc.)
  - [x] Add `url` field for HTTP/SSE servers *(Added in Revision 1)*
  - [x] Add `target` field for `_target` metadata *(Added in Revision 1)*
  - [x] Add `extra` HashMap for preserving unknown fields *(Added in Revision 1)*
  - [x] Create `McpSyncConfig` interface (source mode, enabled tools, server list)
  - [x] Create `McpToolFormat` enum for different tool formats
  - [x] Add types to `src/types/index.ts`

- [x] Task 1.2: Implement MCP storage in Rust backend (commit: manual impl)
  - [x] Create `src-tauri/src/mcp/` module
  - [x] Implement `load_mcp_config()` - load app-managed MCP list
  - [x] Implement `save_mcp_config()` - persist MCP list
  - [x] Implement `get_mcp_storage_path()` - cross-platform path
  - [x] Add unit tests for storage operations

- [x] Task 1.3: Implement Claude MCP import (commit: manual impl)
  - [x] Implement `read_claude_mcp_servers()` - parse `~/.claude.json`
  - [x] Handle missing file gracefully
  - [x] Add unit tests for Claude format parsing

- [-] Task 1.4: [REMOVED: Phases 1-3 implemented together, verification consolidated to Phase 3]

## Phase 2: Backend - Format Conversion & Tool Detection

- [x] Task 2.1: Implement MCP format converters (commit: manual impl)
  - [x] Create `McpFormatConverter` trait
  - [x] Implement converter for standard format (Claude, Gemini, Amp, Droid, Qwen)
  - [x] Implement converter for Copilot format (`servers` key)
  - [x] Implement converter for OpenCode format (`mcp` structure)
  - [x] Handle Amp literal dotted-key format (`"amp.mcpServers"`) *(Added in Revision 1)*
  - [x] Add unit tests for each converter

- [x] Task 2.2: Implement tool MCP detection (commit: manual impl)
  - [x] Implement `detect_tool_mcp_config()` - check if tool has MCP configured
  - [x] Implement `read_tool_mcp_servers()` - read existing MCP from tool
  - [x] Return normalized `McpServer[]` regardless of source format
  - [x] Add unit tests

- [x] Task 2.3: Expose Tauri commands for MCP operations (commit: manual impl)
  - [x] `get_mcp_source_config` - get current source mode & servers
  - [x] `set_mcp_source_mode` - switch between Claude/app-managed
  - [x] `save_app_mcp_servers` - save app-managed list
  - [x] `get_tool_mcp_status` - get MCP status for each tool
  - [x] Add commands to `lib.rs`

- [-] Task 2.4: [REMOVED: Phases 1-3 implemented together, verification consolidated to Phase 3]

## Phase 3: Backend - Sync & Merge Logic

- [x] Task 3.1: Implement merge algorithm (commit: manual impl)
  - [x] Implement `merge_mcp_servers()` - smart merge with conflict detection
  - [x] Return `MergeResult` with added, kept, conflicts
  - [x] Add unit tests for merge scenarios

- [x] Task 3.2: Implement sync operations (commit: manual impl)
  - [x] Implement `sync_mcp_to_tool()` - sync to single tool with backup
  - [x] Implement `sync_mcp_to_all_tools()` - sync to all enabled tools
  - [x] Implement `preview_sync_changes()` - return diff without applying
  - [x] Integrate with existing backup system
  - [x] Add unit tests

- [x] Task 3.3: Implement conflict resolution (commit: manual impl)
  - [x] Implement `resolve_conflict()` - apply user's choice
  - [x] Support: use_source, use_target, use_custom
  - [x] Add unit tests

- [x] Task 3.4: Expose sync Tauri commands (commit: manual impl)
  - [x] `preview_mcp_sync` - get preview of changes
  - [x] `preview_mcp_config_content` - get full JSON preview *(Added in Revision 1)*
  - [x] `sync_mcp_to_tool` - sync to single tool
  - [x] `sync_mcp_to_all` - sync to all enabled tools
  - [x] `resolve_mcp_conflict` - resolve a conflict

- [ ] Task 3.5: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Frontend - MCP Settings UI

- [x] Task 4.1: Create MCP store (commit: manual impl)
  - [x] Create `src/stores/mcp-store.ts` with Zustand
  - [x] State: sourceMode, servers, toolStatuses, conflicts
  - [x] Actions: loadConfig, setSourceMode, addServer, removeServer, updateServer
  - [x] Add unit tests

- [x] Task 4.2: Create MCP server editor component (commit: manual impl)
  - [x] Create `src/components/mcp/mcp-server-editor.tsx`
  - [x] Form for: name, command, args[], env{}
  - [x] Add/Edit mode support
  - [x] Validation for required fields

- [x] Task 4.3: Create MCP server list component (commit: manual impl)
  - [x] Create `src/components/mcp/mcp-server-list.tsx`
  - [x] Display list of MCP servers with edit/delete actions
  - [x] Empty state for no servers

- [x] Task 4.4: Create MCP source selector component (commit: manual impl)
  - [x] Create `src/components/mcp/mcp-source-selector.tsx`
  - [x] Toggle between Claude import / App-managed
  - [x] Show source status (e.g., "5 servers from ~/.claude.json")

- [ ] Task 4.5: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Frontend - Sync UI & Tool Status

- [x] Task 5.1: Create tool sync status component (commit: manual impl)
  - [x] Create `src/components/mcp/mcp-tool-status.tsx`
  - [x] Show each tool with: icon, name, status badge, sync button
  - [x] Status: synced (green), out-of-sync (yellow), conflicts (red), not installed (gray)
  - [x] Enable/disable toggle per tool
  - [x] Individual sync button triggers preview modal first *(Added in Revision 1)*

- [x] Task 5.2: Create sync preview modal (commit: manual impl)
  - [x] Create `src/components/mcp/mcp-sync-preview-modal.tsx`
  - [x] Show diff of changes per tool (added, removed, modified)
  - [x] Confirm/Cancel buttons

- [x] Task 5.3: Create conflict resolution modal *(Expanded in Revision 1)*
  - [x] Create `src/components/mcp/mcp-conflict-resolution-modal.tsx`
  - [x] Per-server resolution choices: Use Source, Keep Current
  - [x] Side-by-side view: source vs target config
  - [x] Actions: Use Source, Use Target, Edit Manually
  - [x] Integrate "Preview Config" button to show final JSON result

- [x] Task 5.3b: Create config preview modal *(Added in Revision 1)*
  - [x] Create `src/components/mcp/mcp-config-preview-modal.tsx`
  - [x] Show current vs after-sync JSON side-by-side
  - [x] Independent scrolling for each panel

- [x] Task 5.4: Create MCP settings panel (commit: manual impl)
  - [x] Create `src/components/mcp/mcp-settings-panel.tsx`
  - [x] Integrate: source selector, server list, tool status grid
  - [x] "Sync All" button with preview option
  - [x] Toast notifications for results

- [ ] Task 5.5: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)

## Phase 6: Integration & Polish

- [x] Task 6.1: Add MCP settings to app navigation (commit: manual impl)
  - [x] Add "MCP Settings" tab/section to sidebar or header
  - [x] Route to MCP settings panel
  - [x] Icon and label

- [ ] Task 6.2: End-to-end testing
  - [ ] Test full sync flow: source → preview → sync → verify
  - [ ] Test conflict detection and resolution
  - [ ] Test with missing/empty config files
  - [ ] Test on multiple platforms (if available)

- [ ] Task 6.3: Documentation
  - [ ] Update README with MCP sync feature
  - [ ] Add tooltips/help text in UI

- [ ] Task 6.4: Conductor - User Manual Verification 'Phase 6' (Protocol in workflow.md)
