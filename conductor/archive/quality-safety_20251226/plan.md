# Plan: Codebase Quality & Safety Improvements

## Phase 1: Error Handling & Data Integrity (High Priority)

### 1.1 Backend Error Type Improvements
- [x] Task: Enhance CommandError enum with distinct error variants
  - [x] Add `JsonParse` error variant with details (already exists)
  - [x] Add `PermissionDenied` error variant
  - [x] Update error serialization to include error_type
  - [x] Update `read_file` to return specific error types (already handles)
  - [x] Update `read_json_path` to return specific error types (already handles)

### 1.2 Frontend Error Discrimination
- [x] Task: Update App.tsx to handle error types distinctly
  - [x] Add BackendError types to types/index.ts
  - [x] Add parseBackendError helper function
  - [x] Parse error response to identify error type
  - [x] Only set `fileNotFound=true` for `ConfigNotFound` errors
  - [x] Store error details in state for other error types (fileReadError)

### 1.3 Inline Error Banner Component
- [x] Task: Create error banner UI component
  - [x] Create `editor-error-banner.tsx` component
  - [x] Display error type and message clearly
  - [x] Add "Acknowledge" button to dismiss
  - [x] Style for visibility (warning colors)
- [x] Task: Integrate error banner into ConfigEditor
  - [x] Add fileReadError state to editor store
  - [x] Block save button when error is active
  - [x] Clear error on acknowledgment

## Phase 2: File System Safety (Medium-High Priority)

### 2.1 Path Safety Infrastructure
- [x] Task: Implement path validation in Rust backend
  - [x] Create `path_safety.rs` module
  - [x] Define allowlisted config directories per platform
  - [x] Implement `is_safe_path()` function
  - [x] Implement `get_path_safety_level()` (safe/warn/block)
  - [x] Add unit tests for path validation

### 2.2 Frontend Warning Integration
- [x] Task: Add path safety check command
  - [x] Create `check_path_safety` Tauri command
  - [x] Return safety level for given path
- [x] Task: Integrate warning dialog for custom tools
  - [x] Check path safety when selecting custom tool configs
  - [x] Show confirmation dialog for unusual locations
  - [x] Allow user to proceed or cancel

## Phase 3: Performance Optimizations (Medium Priority)

### 3.1 JSON Validation Debouncing
- [x] Task: Implement debounced validation
  - [x] Add `useDebouncedValue` hook or use existing utility
  - [x] Wrap JSON validation effect with 500ms debounce
  - [x] Verify validation still triggers correctly
  - [x] Add performance test/benchmark

### 3.2 Auto-Save Constraints
- [x] Task: Enforce minimum auto-save delay
  - [x] Update settings store to clamp `autoSaveDelay` minimum to 3000ms
  - [x] Update default value from 2000 to 3000
  - [x] Existing settings automatically clamped on update

### 3.3 Zustand Selector Optimization
- [x] Task: Refactor ConfigEditor selectors
  - [x] Split broad `useAppStore()` into granular selectors
  - [x] Use `useShallow` where appropriate
  - [x] Verify re-render reduction with React DevTools
- [x] Task: Refactor App.tsx selectors
  - [x] Apply same granular selector pattern
  - [x] Test for regressions

### 3.4 Event Listener Cleanup
- [x] Task: Fix Monaco cursor listener disposal
  - [x] Store disposable ref from `onDidChangeCursorPosition`
  - [x] Add cleanup in useEffect return
  - [x] Throttle cursor position updates (100ms)

## Phase 4: Backup System Consistency (Medium Priority)

### 4.1 Backup Limits
- [x] Task: Cap max_backups at 20
  - [x] Update Rust `create_backup` to cap at 20
  - [x] Update Rust `create_backup_fn` to cap at 20  
  - [x] Update frontend settings validation (updateBackupSettings clamps 1-20)

## Phase 5: Code Quality Fixes (Low-Medium Priority)

### 5.1 Rust Code Refactoring
- [x] Task: Extract atomic write helper
  - [x] Create `do_create_backup()` function (consolidate duplicates)
  - [x] Refactor `write_file` to use helper
  - [x] Refactor `write_json_path` to use helper
  - [x] Refactor `write_json_prefix` to use helper
  - [x] Ensure all tests still pass

### 5.2 Cross-Platform Path Handling
- [x] Task: Fix Windows path display
  - [x] Create `getFileName()` utility in utils/path.ts
  - [x] Update App.tsx to use getFileName for unsaved changes dialog
  - [x] Update config-editor.tsx to use getFileName
  - [x] Update mcp-import-preview-modal.tsx to use getFileName

### 5.3 Code Cleanup
- [x] Task: Fix React Refresh warnings
  - [x] Add eslint-disable comment to tool-icons.tsx
  - [x] Move onboarding hint helpers to utils/onboarding-hints.ts
  - [x] Update imports in onboarding-tooltip.tsx
  - [x] Verify `pnpm lint` passes with no warnings

## Phase 6: Final Validation

### 6.1 Quality Assurance
- [x] Task: Run full test suite
  - [x] `pnpm typecheck` passes
  - [x] `pnpm lint` passes (0 warnings)
  - [x] `pnpm test` passes
  - [x] `cargo clippy` passes
  - [x] `cargo test` passes
- [ ] Task: Manual testing checklist
  - [ ] Test file read error scenarios (parse error, permission denied)
  - [ ] Test custom tool with unusual path (triggers warning)
  - [ ] Test typing performance in large JSON file
  - [ ] Test auto-save behavior with minimum delay
  - [ ] Test backup creation and listing consistency
  - [ ] Test on Windows paths (if available)
