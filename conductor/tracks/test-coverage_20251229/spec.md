# Spec: Expand Test Coverage

## Overview

Add comprehensive test coverage (~80%+) for untested areas of the codebase: core UI components, critical stores with Tauri mocking, and utility functions. This improves code quality, catches regressions, and follows TDD practices.

## Functional Requirements

### FR-1: Core UI Component Tests
Tests for the following untested UI components:
- **skeleton.tsx** - Loading state rendering, size variants, animation classes
- **confirm-dialog.tsx** - Rendering, button interactions, callbacks, accessibility
- **unsaved-changes-dialog.tsx** - Props handling, action callbacks, conditional rendering
- **section-header.tsx** - Title rendering, actions slot, styling variants
- **onboarding-tooltip.tsx** - Positioning, visibility, dismiss behavior

### FR-2: Store Tests with Tauri Mocking
Create shared Tauri mock utilities and test:

**mcp-store.ts:**
- loadConfig, setSourceMode, loadSourceServers, loadToolStatuses
- addServer, updateServer, removeServer, saveServers
- importFromFile, executeImport (merge/replace modes)
- setToolEnabled, previewSync, previewSyncAll, syncToTool, syncToAll
- Error handling for all async operations
- Conflict management (setActiveConflicts, clearActiveConflicts)

**versions-store.ts:**
- setCurrentConfigId, fetchVersions
- saveVersion, loadVersion, deleteVersion, updateVersion
- updateVersionContent, duplicateVersion, setDefault
- toggleVersionSelection (max 2 selection limit)
- clearSelection, clearVersions
- Error handling for all async operations

### FR-3: Utility Function Tests
- **path.ts** - Path manipulation, normalization, validation
- **error-messages.ts** - Error message generation, formatting
- **cli-tools.ts** - Tool definitions, lookups (if applicable)
- **onboarding-hints.ts** - Hint content, conditions (if applicable)

## Non-Functional Requirements

### NFR-1: Test Infrastructure
- Create `src/test/tauri-mocks.ts` with reusable invoke mocking utilities
- Mock responses should match actual Tauri command return types
- Tests must run without Tauri runtime (pure Vitest)

### NFR-2: Code Quality
- All tests must pass `pnpm test`
- No TypeScript errors in test files
- Follow existing test patterns (describe/it blocks, RTL queries)

### NFR-3: Coverage Target
- Aim for ≥80% coverage on new test files
- Cover happy paths, error states, edge cases, and accessibility

## Acceptance Criteria

- [ ] All 5 core UI components have comprehensive tests
- [ ] Both mcp-store and versions-store have tests with mocked Tauri commands
- [ ] Utility functions in path.ts and error-messages.ts are tested
- [ ] Shared Tauri mock utility exists in src/test/tauri-mocks.ts
- [ ] All new tests pass: `pnpm test`
- [ ] No TypeScript errors: `pnpm typecheck`

## Out of Scope

- Testing modal components (settings-modal, backup-modal, etc.)
- Testing MCP components (mcp-server-editor, mcp-sync-preview-modal, etc.)
- Testing sidebar components
- E2E/integration tests with actual Tauri runtime
- Rust backend tests (already have 33 tests)
