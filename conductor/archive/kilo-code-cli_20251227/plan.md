# Plan: Add Kilo Code CLI Predefined Tool

## Phase 1: Backend Implementation

- [x] Task 1.1: Add Kilo Code CLI tool definition to `cli_tools.rs`
  - [x] Add new `CliTool` entry with id `kilo-code-cli`
  - [x] Add `SuggestedConfig` for main config (`~/.kilocode/config.json`)
  - [x] Add `SuggestedConfig` for MCP settings (`~/.kilocode/mcp_settings.json`)
  - [x] Set `json_path: Some("mcpServers")` for MCP config to enable sync

- [x] Task 1.2: Run backend checks
  - [x] Run `cargo clippy` to verify no warnings
  - [x] Run `cargo test` to ensure no regressions

## Phase 2: Frontend Implementation

- [x] Task 2.1: Add Kilo Code CLI icon to `tool-icons.tsx`
  - [x] Add icon mapping for `kilo-code-cli` tool ID
  - [x] Use appropriate Lucide icon (e.g., Terminal or similar)

- [x] Task 2.2: Run frontend checks
  - [x] Run `pnpm typecheck` to verify no TypeScript errors
  - [x] Run `pnpm lint` to ensure code style compliance

## Phase 3: Integration Testing

- [x] Task 3.1: Manual verification
  - [x] Start app with `pnpm tauri dev`
  - [x] Verify Kilo Code CLI appears in sidebar (if config exists)
  - [x] Verify both config files are editable with syntax highlighting
  - [x] Test MCP sync functionality with mcp_settings.json

- [x] Task 3.2: Cross-platform path verification
  - [x] Confirm `~/.kilocode/` expands correctly on current platform
