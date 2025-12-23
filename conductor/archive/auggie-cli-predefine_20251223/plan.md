# Plan: Add Augment Code CLI (Auggie) Predefined Configuration

## Phase 1: Backend - Add Auggie Tool Definition

### Task 1.1: Add Auggie to Rust CLI Tools
- [x] Sub-task: Add Auggie tool definition in `src-tauri/src/config/cli_tools.rs`
  - Name: "Augment Code CLI (Auggie)"
  - Config path: `~/.augment/settings.json`
  - Format: JSON
  - Include platform-specific path resolution (Linux, macOS, Windows)

### Task 1.2: Verify Rust Changes
- [x] Sub-task: Run `cargo clippy` to check for warnings
- [x] Sub-task: Run `cargo test` to ensure no regressions (28 tests passed)

- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Frontend - Add Auggie Tool Definition

### Task 2.1: Add Auggie to TypeScript CLI Tools
- [x] Sub-task: Add Auggie tool definition in `src/utils/cli-tools.ts` under `CLI_TOOLS` array
  - Match the structure of existing tools (Claude Code, Aider, etc.)
  - Name: "Augment Code CLI (Auggie)"
  - Config file: `settings.json`
  - Config path with platform support

### Task 2.2: Verify Frontend Changes
- [x] Sub-task: Run `pnpm typecheck` to check TypeScript
- [x] Sub-task: Run `pnpm lint` to check linting (0 errors, 3 pre-existing warnings)

- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Integration Testing

### Task 3.1: End-to-End Verification
- [x] Sub-task: Run `pnpm tauri dev` and verify Auggie appears in tools list
- [x] Sub-task: Verify config file path resolves correctly
- [x] Sub-task: Verify JSON syntax highlighting works in editor

- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
