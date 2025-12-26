# Spec: Codebase Quality & Safety Improvements

## Overview

Comprehensive improvement track addressing 10 identified issues across security, data integrity, performance, and code quality in the CLI Config Editor application. This "full sweep" ensures the app is robust before further feature development.

## Functional Requirements

### FR1: Error Handling Improvements (High Priority)
- **FR1.1**: Distinguish between error types from Rust backend: `ConfigNotFound`, `Io`, `JsonParse`, `JsonPathNotFound`
- **FR1.2**: Only treat `ConfigNotFound` as "new file" scenario
- **FR1.3**: Display inline error banner in editor for parse/permission/IO errors
- **FR1.4**: Block save functionality until user explicitly acknowledges the error
- **FR1.5**: Provide clear error messages explaining what went wrong

### FR2: File System Safety (Medium-High Priority)
- **FR2.1**: Implement hybrid path safety system
- **FR2.2**: Allowlist predefined config directories for known CLI tools (no warnings)
- **FR2.3**: Show confirmation dialog when custom tools target unusual locations
- **FR2.4**: Define "safe" directories: user config dirs, app data dir, known tool paths
- **FR2.5**: Log file operations for debugging purposes

### FR3: Performance Optimizations (Medium Priority)
- **FR3.1**: Debounce JSON validation to 500ms after user stops typing
- **FR3.2**: Enforce minimum auto-save delay of 3000ms
- **FR3.3**: Refactor Zustand selectors to be more granular (reduce re-renders)
- **FR3.4**: Throttle cursor position updates to reduce state churn
- **FR3.5**: Properly dispose Monaco editor event listeners on cleanup

### FR4: Backup System Consistency (Medium Priority)
- **FR4.1**: Cap `max_backups` setting at 20 (matching listing limit)
- **FR4.2**: Update settings UI to reflect max value of 20
- **FR4.3**: Ensure backup rotation and listing logic are consistent

### FR5: Code Quality Fixes (Low-Medium Priority)
- **FR5.1**: Extract shared backup + atomic write helper in Rust
- **FR5.2**: Fix Windows path handling in unsaved changes dialog
- **FR5.3**: Remove unused `sidebarRef` from Sidebar component
- **FR5.4**: Fix React Refresh lint warnings (move non-component exports)

## Non-Functional Requirements

- **NFR1**: No breaking changes to existing user data or settings
- **NFR2**: Maintain app startup time < 2 seconds
- **NFR3**: Editor typing latency should not exceed 50ms
- **NFR4**: All changes must pass existing tests + new tests for fixed issues

## Acceptance Criteria

- [ ] File read errors (parse/permission) show inline banner, not "new file" behavior
- [ ] Saving is blocked when error banner is displayed until acknowledged
- [ ] Custom tools targeting unusual paths trigger confirmation dialog
- [ ] JSON validation does not fire more than once per 500ms during typing
- [ ] Auto-save delay cannot be set below 3000ms
- [ ] Backup settings max value is 20
- [ ] No lint warnings from `pnpm lint`
- [ ] `pnpm typecheck` passes
- [ ] `cargo clippy` passes with no warnings
- [ ] Windows path separators handled correctly in UI

## Out of Scope

- Adding new features beyond fixing identified issues
- Refactoring entire state management architecture (only targeted selector fixes)
- Adding new CLI tool definitions
- Cross-platform release builds
