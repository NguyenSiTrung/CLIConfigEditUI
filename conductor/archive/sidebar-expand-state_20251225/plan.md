# Plan: Sidebar Expand/Collapse State Persistence

## Phase 1: Fix Default Collapse Behavior for New Tools

### Overview
Currently the state is persisted via Zustand's localStorage persist, but new tools may not respect the "collapsed by default" behavior correctly.

- [x] Task 1.1: Review and fix `expandToolsByDefault` behavior in sidebar (commit: 626f9ea)
  - [x] Ensure new tools (not in `expandedTools` set) remain collapsed on load
  - [x] Only expand tools that were previously explicitly expanded by user

- [x] Task 1.2: Add unit tests for expand state persistence (commit: 5725857)
  - [x] Test: persisted expanded tools restore correctly
  - [x] Test: new tools default to collapsed

## Phase 2: Add Tauri Backup Storage

### Overview
Add file-based persistence via Tauri as a backup when localStorage is unavailable.

- [x] Task 2.1: Create Rust command for sidebar state persistence (commit: 5859b92)
  - [x] Add `save_sidebar_state` Tauri command
  - [x] Add `load_sidebar_state` Tauri command
  - [x] Store in app data directory as JSON

- [x] Task 2.2: Integrate Tauri storage with Zustand store (commit: 5859b92)
  - [x] On state change, sync to Tauri storage
  - [x] On app load, fallback to Tauri storage if localStorage empty
  - [x] Handle errors gracefully

## Phase 3: Add Expand All / Collapse All Buttons

### Overview
Add convenience buttons in the sidebar header for bulk expand/collapse.

- [x] Task 3.1: Add expandAll and collapseAll actions to app-store (commit: 55ea32b)
  - [x] `expandAllTools()` - adds all tool IDs to expandedTools set
  - [x] `collapseAllTools()` - clears expandedTools set

- [x] Task 3.2: Add UI buttons in sidebar section header (commit: 55ea32b)
  - [x] Add Expand All / Collapse All icon buttons near CLI Tools section
  - [x] Use appropriate icons (ChevronsDownUp/ChevronsUpDown)
  - [x] Add tooltip hints

- [x] Task 3.3: Test expand/collapse all functionality (commit: 55ea32b)
  - [x] Verify all tools expand/collapse
  - [x] Verify state persists after bulk action

## Phase 4: Final Verification

- [ ] Task 4.1: Manual end-to-end testing
  - [ ] Collapse some tools, restart app, verify state restored
  - [ ] Test Expand All / Collapse All buttons
  - [ ] Clear localStorage, verify Tauri backup restores state
  - [ ] Add new tool, verify it appears collapsed

- [x] Task 4.2: Run all quality checks
  - [x] `pnpm typecheck` ✓
  - [x] `pnpm lint` ✓ (0 errors, 4 pre-existing warnings)
  - [x] `pnpm test` ✓ (108 tests pass)
  - [x] `cargo clippy` ✓
  - [x] `cargo test` ✓ (28 tests pass)
