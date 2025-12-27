# Plan: Add Qoder CLI Predefined Tool

## Phase 1: Frontend Tool Definition

- [x] Task: Add Qoder CLI to CLI_TOOLS array in `src/utils/cli-tools.ts` (commit: pending)
  - [x] Add tool entry with id, name, icon, docsUrl, description
  - [x] Add Settings config (`~/.qoder/settings.json`)
  - [x] Add Global Config (`~/.qoder.json`)
  - [x] Add MCP Servers config with jsonPath `mcpServers`

## Phase 2: Backend Tool Definition

- [x] Task: Add Qoder CLI to backend in `src-tauri/src/config/cli_tools.rs` (commit: pending)
  - [x] Mirror frontend tool definition for backend path resolution
  
- [x] Task: Add Qoder CLI MCP entry in `src-tauri/src/mcp/types.rs` (commit: pending)
  - [x] Add MCP tool config path for MCP sync feature

## Phase 3: Verification

- [x] Task: Run quality checks
  - [x] Run `pnpm typecheck` - no errors
  - [x] Run `pnpm lint` - no warnings
  - [x] Run `cd src-tauri && cargo clippy` - no warnings

- [ ] Task: Manual verification
  - [ ] Start app with `pnpm tauri dev`
  - [ ] Verify Qoder CLI appears in sidebar (if config exists)
  - [ ] Verify all three config entries are accessible
  - [ ] Verify MCP Servers shows only mcpServers section
