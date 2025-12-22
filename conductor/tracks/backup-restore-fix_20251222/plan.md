# Plan: Fix Backup Restore Logic (Reversed File Operations)

## Phase 1: Bug Investigation and Root Cause Analysis

- [x] Task 1.1: Trace the restore flow from UI to backend
  - [x] Sub-task 1.1.1: Review `backup-modal.tsx` handleRestore function
  - [x] Sub-task 1.1.2: Review Rust `restore_backup` command in mod.rs
  - [x] Sub-task 1.1.3: Verify argument order (originalPath vs backupPath)
  - [x] Sub-task 1.1.4: Add debug logging to identify which paths are received

- [x] Task 1.2: Identify the bug location
  - [x] Sub-task 1.2.1: Test with console logs to confirm path values
  - [x] Sub-task 1.2.2: Document the exact code line causing reversed behavior
  
**Root Cause Found:** In `restore_backup()`, the code was:
1. Creating a pre-restore backup (`.bak`) of the current config
2. THEN reading the backup file to restore

When restoring from `.bak`, step 1 overwrites the `.bak` file with current content BEFORE step 2 reads it.

## Phase 2: Fix Implementation

- [x] Task 2.1: Fix the restore logic
  - [x] Sub-task 2.1.1: Correct the file read/write operation order in Rust
  - Now reads backup content FIRST, then creates pre-restore backup, then writes

- [x] Task 2.2: Ensure editor updates after restore
  - [x] Sub-task 2.2.1: Verify onRestored callback reloads file content (already working)
  - [x] Sub-task 2.2.2: Confirm editorContent updates to restored content (already working)

## Phase 3: Testing and Verification

- [ ] Task 3.1: Manual testing
  - [ ] Sub-task 3.1.1: Create a config file and make changes (generate backup)
  - [ ] Sub-task 3.1.2: Open History, select backup, click Restore
  - [ ] Sub-task 3.1.3: Verify config file now has backup content
  - [ ] Sub-task 3.1.4: Verify backup file is unchanged

- [x] Task 3.2: Code quality checks
  - [x] Sub-task 3.2.1: Run `pnpm typecheck` ✓
  - [x] Sub-task 3.2.2: Run `pnpm lint` ✓
  - [x] Sub-task 3.2.3: Run `cargo clippy` in src-tauri ✓
