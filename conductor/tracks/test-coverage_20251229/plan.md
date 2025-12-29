# Plan: Expand Test Coverage

## Phase 1: Test Infrastructure Setup

- [x] Task 1.1: Create Tauri mock utilities (commit a1b2c3d)
  - [x] Create `src/test/tauri-mocks.ts` with mock invoke function
  - [x] Define mock response types matching Tauri command returns
  - [x] Add helper functions: `mockInvokeSuccess()`, `mockInvokeError()`
  - [x] Export mock reset utility for test cleanup

- [x] Task 1.2: Verify test infrastructure (commit a1b2c3d)
  - [x] Write a simple test using the mock utilities
  - [x] Ensure mocks reset properly between tests
  - [x] Run `pnpm test` to confirm setup works

## Phase 2: Core UI Component Tests

- [x] Task 2.1: Test skeleton.tsx (commit 91cce86)
  - [x] Write tests for default rendering
  - [x] Test size variants (if applicable)
  - [x] Test animation/pulse classes
  - [x] Test custom className prop

- [x] Task 2.2: Test section-header.tsx
  - [x] Write tests for title rendering
  - [x] Test actions slot rendering
  - [x] Test styling variants
  - [x] Test accessibility (heading levels)

- [x] Task 2.3: Test confirm-dialog.tsx
  - [x] Write tests for open/closed states
  - [x] Test title, description, button text props
  - [x] Test confirm/cancel callbacks
  - [x] Test keyboard interactions (ESC, Enter)
  - [x] Test accessibility (focus trap, ARIA)

- [x] Task 2.4: Test unsaved-changes-dialog.tsx
  - [x] Write tests for rendering with props
  - [x] Test save/discard/cancel callbacks
  - [x] Test conditional button visibility
  - [x] Test accessibility

- [x] Task 2.5: Test onboarding-tooltip.tsx
  - [x] Write tests for visibility states
  - [x] Test positioning props
  - [x] Test dismiss behavior
  - [x] Test content rendering

- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Utility Function Tests

- [x] Task 3.1: Test path.ts
  - [x] Analyze existing functions in path.ts
  - [x] Write tests for path normalization
  - [x] Test path validation functions
  - [x] Test edge cases (empty, special chars, Windows paths)

- [x] Task 3.2: Test error-messages.ts
  - [x] Analyze existing functions
  - [x] Write tests for error message generation
  - [x] Test formatting functions
  - [x] Test with various error types

- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Store Tests - versions-store

- [x] Task 4.1: Test state management
  - [x] Test initial state values
  - [x] Test setCurrentConfigId (triggers fetchVersions)
  - [x] Test toggleVersionSelection (max 2 limit)
  - [x] Test clearSelection, clearVersions

- [x] Task 4.2: Test async operations with mocked Tauri
  - [x] Test fetchVersions success/error
  - [x] Test saveVersion success/error
  - [x] Test loadVersion success/error
  - [x] Test deleteVersion (removes from selection)
  - [x] Test updateVersion, updateVersionContent
  - [x] Test duplicateVersion
  - [x] Test setDefault

- [x] Task 4.3: Test loading and error states
  - [x] Verify isLoading set/unset during operations
  - [x] Verify error state on failures
  - [x] Test error clearing behavior

- [x] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Store Tests - mcp-store

- [x] Task 5.1: Test state management
  - [x] Test initial state values
  - [x] Test setActiveConflicts, clearActiveConflicts
  - [x] Test setError, clearError

- [x] Task 5.2: Test config loading operations
  - [x] Test loadConfig success/error
  - [x] Test setSourceMode success/error
  - [x] Test loadSourceServers success/error
  - [x] Test loadToolStatuses success/error

- [x] Task 5.3: Test server CRUD operations
  - [x] Test addServer success/error
  - [x] Test updateServer success/error
  - [x] Test removeServer success/error
  - [x] Test saveServers success/error

- [x] Task 5.4: Test import operations
  - [x] Test importFromFile success/error
  - [x] Test executeImport with 'replace' mode
  - [x] Test executeImport with 'merge' mode (no conflicts)
  - [x] Test executeImport with 'merge' mode (with overwrites)
  - [x] Test executeImport with 'merge' mode (skip existing)

- [x] Task 5.5: Test sync operations
  - [x] Test setToolEnabled success/error
  - [x] Test previewSync success/error
  - [x] Test previewSyncAll success/error
  - [x] Test previewConfigContent success/error
  - [x] Test syncToTool success/error
  - [x] Test syncToAll success/error

- [x] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)

## Phase 6: Final Verification

- [ ] Task 6.1: Run all quality checks
  - [ ] Run `pnpm test` - all tests pass
  - [ ] Run `pnpm typecheck` - no errors
  - [ ] Run `pnpm lint` - no warnings

- [ ] Task 6.2: Coverage verification
  - [ ] Review test coverage for new files
  - [ ] Ensure ≥80% coverage target met
  - [ ] Document any intentionally untested code

- [ ] Task: Conductor - User Manual Verification 'Phase 6' (Protocol in workflow.md)
