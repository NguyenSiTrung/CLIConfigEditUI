# Plan: Add Qwen Code CLI Predefined Configuration

## Phase 1: Backend Implementation

- [x] Task: Add Qwen Code CLI tool definition to Rust backend (923b2d9)
  - [x] Edit `src-tauri/src/config/cli_tools.rs`
  - [x] Add `CliTool` entry with id `qwen-code`
  - [x] Add 4 `SuggestedConfig` entries (Settings User, Settings Project, MCP Servers, Memory)
  - [x] Run `cargo clippy` to verify no warnings

## Phase 2: Frontend Implementation

- [x] Task: Add Qwen Code CLI tool definition to TypeScript frontend (923b2d9)
  - [x] Edit `src/utils/cli-tools.ts`
  - [x] Add matching `CliTool` entry to `CLI_TOOLS` array
  - [x] Run `pnpm typecheck` to verify no type errors
  - [x] Run `pnpm lint` to verify no lint warnings

## Phase 3: Verification

- [ ] Task: Build and manual testing
  - [ ] Run `pnpm tauri dev` to start the app
  - [ ] Verify Qwen Code appears in sidebar
  - [ ] Verify all 4 config files are listed
  - [ ] Verify icon (🐦) displays correctly
  - [ ] Test opening/editing a config file
