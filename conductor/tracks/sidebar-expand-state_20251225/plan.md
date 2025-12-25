# Plan: Sidebar Expand/Collapse State Persistence

## Phase 1: Fix Default Collapse Behavior for New Tools

### Overview
Currently the state is persisted via Zustand's localStorage persist, but new tools may not respect the "collapsed by default" behavior correctly.

- [ ] Task 1.1: Review and fix `expandToolsByDefault` behavior in sidebar
  - [ ] Ensure new tools (not in `expandedTools` set) remain collapsed on load
  - [ ] Only expand tools that were previously explicitly expanded by user

- [ ] Task 1.2: Add unit tests for expand state persistence
  - [ ] Test: persisted expanded tools restore correctly
  - [ ] Test: new tools default to collapsed

## Phase 2: Add Tauri Backup Storage

### Overview
Add file-based persistence via Tauri as a backup when localStorage is unavailable.

- [ ] Task 2.1: Create Rust command for sidebar state persistence
  - [ ] Add `save_sidebar_state` Tauri command
  - [ ] Add `load_sidebar_state` Tauri command
  - [ ] Store in app data directory as JSON

- [ ] Task 2.2: Integrate Tauri storage with Zustand store
  - [ ] On state change, sync to Tauri storage
  - [ ] On app load, fallback to Tauri storage if localStorage empty
  - [ ] Handle errors gracefully

## Phase 3: Add Expand All / Collapse All Buttons

### Overview
Add convenience buttons in the sidebar header for bulk expand/collapse.

- [ ] Task 3.1: Add expandAll and collapseAll actions to app-store
  - [ ] `expandAllTools()` - adds all tool IDs to expandedTools set
  - [ ] `collapseAllTools()` - clears expandedTools set

- [ ] Task 3.2: Add UI buttons in sidebar section header
  - [ ] Add Expand All / Collapse All icon buttons near CLI Tools section
  - [ ] Use appropriate icons (ChevronDown/ChevronUp or similar)
  - [ ] Add tooltip hints

- [ ] Task 3.3: Test expand/collapse all functionality
  - [ ] Verify all tools expand/collapse
  - [ ] Verify state persists after bulk action

## Phase 4: Final Verification

- [ ] Task 4.1: Manual end-to-end testing
  - [ ] Collapse some tools, restart app, verify state restored
  - [ ] Test Expand All / Collapse All buttons
  - [ ] Clear localStorage, verify Tauri backup restores state
  - [ ] Add new tool, verify it appears collapsed

- [ ] Task 4.2: Run all quality checks
  - [ ] `pnpm typecheck`
  - [ ] `pnpm lint`
  - [ ] `pnpm test`
  - [ ] `cargo clippy` and `cargo test`
