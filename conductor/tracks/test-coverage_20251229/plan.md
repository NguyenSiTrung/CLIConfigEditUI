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

- [ ] Task 2.1: Test skeleton.tsx
  - [ ] Write tests for default rendering
  - [ ] Test size variants (if applicable)
  - [ ] Test animation/pulse classes
  - [ ] Test custom className prop

- [ ] Task 2.2: Test section-header.tsx
  - [ ] Write tests for title rendering
  - [ ] Test actions slot rendering
  - [ ] Test styling variants
  - [ ] Test accessibility (heading levels)

- [ ] Task 2.3: Test confirm-dialog.tsx
  - [ ] Write tests for open/closed states
  - [ ] Test title, description, button text props
  - [ ] Test confirm/cancel callbacks
  - [ ] Test keyboard interactions (ESC, Enter)
  - [ ] Test accessibility (focus trap, ARIA)

- [ ] Task 2.4: Test unsaved-changes-dialog.tsx
  - [ ] Write tests for rendering with props
  - [ ] Test save/discard/cancel callbacks
  - [ ] Test conditional button visibility
  - [ ] Test accessibility

- [ ] Task 2.5: Test onboarding-tooltip.tsx
  - [ ] Write tests for visibility states
  - [ ] Test positioning props
  - [ ] Test dismiss behavior
  - [ ] Test content rendering

- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Utility Function Tests

- [ ] Task 3.1: Test path.ts
  - [ ] Analyze existing functions in path.ts
  - [ ] Write tests for path normalization
  - [ ] Test path validation functions
  - [ ] Test edge cases (empty, special chars, Windows paths)

- [ ] Task 3.2: Test error-messages.ts
  - [ ] Analyze existing functions
  - [ ] Write tests for error message generation
  - [ ] Test formatting functions
  - [ ] Test with various error types

- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: Store Tests - versions-store

- [ ] Task 4.1: Test state management
  - [ ] Test initial state values
  - [ ] Test setCurrentConfigId (triggers fetchVersions)
  - [ ] Test toggleVersionSelection (max 2 limit)
  - [ ] Test clearSelection, clearVersions

- [ ] Task 4.2: Test async operations with mocked Tauri
  - [ ] Test fetchVersions success/error
  - [ ] Test saveVersion success/error
  - [ ] Test loadVersion success/error
  - [ ] Test deleteVersion (removes from selection)
  - [ ] Test updateVersion, updateVersionContent
  - [ ] Test duplicateVersion
  - [ ] Test setDefault

- [ ] Task 4.3: Test loading and error states
  - [ ] Verify isLoading set/unset during operations
  - [ ] Verify error state on failures
  - [ ] Test error clearing behavior

- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

## Phase 5: Store Tests - mcp-store

- [ ] Task 5.1: Test state management
  - [ ] Test initial state values
  - [ ] Test setActiveConflicts, clearActiveConflicts
  - [ ] Test setError, clearError

- [ ] Task 5.2: Test config loading operations
  - [ ] Test loadConfig success/error
  - [ ] Test setSourceMode success/error
  - [ ] Test loadSourceServers success/error
  - [ ] Test loadToolStatuses success/error

- [ ] Task 5.3: Test server CRUD operations
  - [ ] Test addServer success/error
  - [ ] Test updateServer success/error
  - [ ] Test removeServer success/error
  - [ ] Test saveServers success/error

- [ ] Task 5.4: Test import operations
  - [ ] Test importFromFile success/error
  - [ ] Test executeImport with 'replace' mode
  - [ ] Test executeImport with 'merge' mode (no conflicts)
  - [ ] Test executeImport with 'merge' mode (with overwrites)
  - [ ] Test executeImport with 'merge' mode (skip existing)

- [ ] Task 5.5: Test sync operations
  - [ ] Test setToolEnabled success/error
  - [ ] Test previewSync success/error
  - [ ] Test previewSyncAll success/error
  - [ ] Test previewConfigContent success/error
  - [ ] Test syncToTool success/error
  - [ ] Test syncToAll success/error

- [ ] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)

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
