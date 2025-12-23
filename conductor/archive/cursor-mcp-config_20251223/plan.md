# Plan: Fix Cursor MCP Config Paths

## Phase 1: Update Cursor CLI Tool Definition

- [x] Task 1.1: Update Cursor CliTool entry in cli_tools.rs
  - [x] Add "MCP Servers" SuggestedConfig with path `~/.cursor/mcp.json`
  - [x] Add "CLI Config" SuggestedConfig with path `~/.cursor/cli-config.json`
  - [x] Update docs_url to `https://cursor.com/docs`
  - [x] Add appropriate icons and descriptions

- [x] Task 1.2: Verify cross-platform path handling
  - [x] Confirm `~` expands correctly on Linux/macOS
  - [x] Confirm `%USERPROFILE%` works for Windows paths if needed

## Phase 2: Verification

- [x] Task 2.1: Build and test
  - [x] Run `cargo clippy` - no warnings
  - [x] Run `cargo test` - all tests pass (28 tests)
  - [x] Run `pnpm typecheck` - no errors

- [x] Task 2.2: Manual verification
  - [x] Launch app with `pnpm tauri dev`
  - [x] Verify Cursor tool shows new config options
  - [x] Verify MCP Servers config can be opened/created

- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)
