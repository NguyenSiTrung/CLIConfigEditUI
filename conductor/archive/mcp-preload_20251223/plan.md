# Plan: MCP Config Preload from File

## Phase 1: Backend - File Parsing & Format Detection

- [x] Task 1.1: Create MCP config file parser module
  - [x] Sub-task 1.1.1: Write tests for parsing standard `mcpServers` format
  - [x] Sub-task 1.1.2: Write tests for parsing Amp `amp.mcpServers` literal key format
  - [x] Sub-task 1.1.3: Write tests for parsing Copilot `servers` format
  - [x] Sub-task 1.1.4: Write tests for parsing OpenCode `mcp` format
  - [x] Sub-task 1.1.5: Implement auto-detect parser that tries all formats
  - [x] Sub-task 1.1.6: Add error handling for invalid JSON and unrecognized formats

- [x] Task 1.2: Create Tauri command for file import
  - [x] Sub-task 1.2.1: Write test for `parse_mcp_config_file` command
  - [x] Sub-task 1.2.2: Implement command that reads file and returns parsed servers
  - [x] Sub-task 1.2.3: Return structured result with servers list and source file path

## Phase 2: Frontend - Preview Modal Component

- [x] Task 2.1: Create McpImportPreviewModal component
  - [x] Sub-task 2.1.1: Create modal shell with header showing source file path
  - [x] Sub-task 2.1.2: Add server list with checkboxes for selection
  - [x] Sub-task 2.1.3: Implement Select All / Deselect All controls
  - [x] Sub-task 2.1.4: Add Replace/Merge mode toggle (default: Merge)
  - [x] Sub-task 2.1.5: Highlight conflicting servers in Merge mode
  - [x] Sub-task 2.1.6: Add "Overwrite existing" checkbox for each conflict

- [x] Task 2.2: Style modal for dark/light themes
  - [x] Sub-task 2.2.1: Apply consistent styling with existing MCP modals
  - [x] Sub-task 2.2.2: Ensure responsive layout for long server lists

## Phase 3: Frontend - Import Button & File Picker Integration

- [x] Task 3.1: Add "Import from File" button to App-Managed section
  - [x] Sub-task 3.1.1: Add button next to "Add Server" in mcp-settings-panel.tsx
  - [x] Sub-task 3.1.2: Style button consistently with existing UI
  - [x] Sub-task 3.1.3: Only show button when in App-Managed mode

- [x] Task 3.2: Integrate Tauri file picker dialog
  - [x] Sub-task 3.2.1: Implement file picker with JSON filter
  - [x] Sub-task 3.2.2: Handle file selection and trigger backend parse
  - [x] Sub-task 3.2.3: Handle cancel/error states gracefully

## Phase 4: Frontend - Import Logic & State Updates

- [x] Task 4.1: Implement import logic in mcp-store
  - [x] Sub-task 4.1.1: Add `importServersFromFile` action
  - [x] Sub-task 4.1.2: Implement Replace mode (clear + add selected)
  - [x] Sub-task 4.1.3: Implement Merge mode (add selected, handle overwrites)
  - [x] Sub-task 4.1.4: Detect conflicts (matching server names)

- [x] Task 4.2: Connect modal to store actions
  - [x] Sub-task 4.2.1: Wire up Import button to execute import
  - [x] Sub-task 4.2.2: Show success toast with import count
  - [x] Sub-task 4.2.3: Show error toast on failure
  - [x] Sub-task 4.2.4: Close modal and refresh server list on success

## Phase 5: Testing & Polish

- [x] Task 5.1: Integration testing
  - [x] Sub-task 5.1.1: Test end-to-end flow with sample config files
  - [x] Sub-task 5.1.2: Test all format variations (Claude, Amp, Copilot, OpenCode)
  - [x] Sub-task 5.1.3: Test Replace and Merge modes with conflicts

- [x] Task 5.2: Edge cases and error handling
  - [x] Sub-task 5.2.1: Test with empty config file
  - [x] Sub-task 5.2.2: Test with malformed JSON
  - [x] Sub-task 5.2.3: Test with file containing no MCP servers
  - [x] Sub-task 5.2.4: Test with large config file (100+ servers)

- [x] Task 5.3: Cross-platform verification
  - [x] Sub-task 5.3.1: Verify file picker works on Linux
  - [x] Sub-task 5.3.2: Verify path handling on different platforms
