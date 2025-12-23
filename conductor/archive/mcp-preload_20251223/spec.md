# Spec: MCP Config Preload from File

## Overview

Enhance the MCP Settings "App-Managed" mode by allowing users to preload/import MCP server configurations from any existing MCP config file on their system. This enables users who already have MCP servers configured in tools like Claude, Amp, or custom locations to quickly populate their App-Managed list without manual re-entry.

## Functional Requirements

### FR-1: File Selection
- **FR-1.1**: Provide an "Import from File" button in the App-Managed section header (alongside "Add Server")
- **FR-1.2**: Button opens native file picker dialog (via Tauri)
- **FR-1.3**: File picker should filter for JSON files (*.json) by default but allow all files
- **FR-1.4**: Support reading MCP config from any JSON file containing MCP server definitions

### FR-2: Config File Parsing
- **FR-2.1**: Auto-detect MCP config format from file structure:
  | Format | JSON Path | Examples |
  |--------|-----------|----------|
  | Standard | `mcpServers` | Claude, Gemini, Factory Droid, Qwen |
  | Amp | `amp.mcpServers` (literal dotted key) | Amp |
  | Copilot | `servers` | GitHub Copilot CLI |
  | OpenCode | `mcp` | OpenCode |
- **FR-2.2**: Handle invalid/malformed JSON gracefully with error toast
- **FR-2.3**: Handle files with no recognized MCP config structure with informative error

### FR-3: Preview Modal
- **FR-3.1**: Always show preview modal before importing
- **FR-3.2**: Display list of servers found in the file with:
  - Server name
  - Command/URL (truncated if long)
  - Checkbox to select/deselect individual servers
- **FR-3.3**: Show "Select All" / "Deselect All" controls
- **FR-3.4**: Display source file path in modal header

### FR-4: Import Mode Selection
- **FR-4.1**: Provide Replace/Merge mode toggle in preview modal:
  - **Replace**: Clear all existing App-Managed servers, import selected
  - **Merge**: Add selected servers to existing list
- **FR-4.2**: Default to "Merge" mode
- **FR-4.3**: In Merge mode, detect conflicts (same server name exists) and:
  - Highlight conflicting servers in preview
  - Show "Overwrite existing" checkbox per conflict (default: checked)

### FR-5: Import Execution
- **FR-5.1**: Import only selected servers from preview
- **FR-5.2**: Apply Replace or Merge based on user selection
- **FR-5.3**: Show success toast with count of imported servers
- **FR-5.4**: Refresh the App-Managed server list after import

## Non-Functional Requirements

- **NFR-1**: File parsing and preview should complete in < 500ms for typical config files
- **NFR-2**: Handle large config files (100+ servers) without UI freeze
- **NFR-3**: Cross-platform file picker works on Linux, macOS, Windows

## Acceptance Criteria

- [ ] "Import from File" button visible in App-Managed mode
- [ ] File picker opens and filters for JSON files
- [ ] Servers are correctly parsed from all supported formats (standard, Amp, Copilot, OpenCode)
- [ ] Preview modal shows all servers with selection checkboxes
- [ ] Replace mode clears existing servers before import
- [ ] Merge mode adds servers while preserving existing ones
- [ ] Conflicts are detected and highlighted in merge mode
- [ ] Success/error toasts display appropriate messages
- [ ] Works on Linux, macOS, and Windows

## Out of Scope

- Importing from remote URLs (HTTP/HTTPS)
- Saving import source as a "linked" reference (one-time import only)
- Importing project-level MCP configs (`.mcp.json` in project directories)
- Validating that imported MCP servers are actually runnable
