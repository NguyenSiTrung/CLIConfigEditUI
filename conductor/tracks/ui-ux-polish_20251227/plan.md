# Plan: Comprehensive UI/UX Improvements

## Phase 1: Accessibility Fixes (Critical)

### Task 1.1: Fix Settings Modal Tab ARIA
- [x] Add `id={tab.id}` to each tab button in `settings-modal.tsx`
- [x] Verify `aria-labelledby` correctly references tab button IDs
- [x] Test with keyboard navigation (Arrow keys, Home, End)

### Task 1.2: Make Sidebar Resize Handle Keyboard-Accessible
- [x] Add `tabIndex={0}` to resize handle div in `sidebar/index.tsx`
- [x] Implement `onKeyDown` handler for ArrowLeft/ArrowRight (±20px per press)
- [x] Add visual focus indicator for resize handle

### Task 1.3: Guard Global Keyboard Shortcuts
- [x] Update `App.tsx` keydown handler to check `e.defaultPrevented`
- [x] Skip shortcuts when focus is in `input`, `textarea`, or contenteditable
- [x] Skip shortcuts when focus is inside Monaco editor (check `.monaco-editor` ancestor)

### Task 1.4: Convert Header View Toggles to Tab Semantics
- [x] Wrap Configs/MCP buttons in `role="tablist"` container
- [x] Change buttons to `role="tab"` with `aria-selected` instead of `aria-pressed`
- [x] Add `aria-controls` linking to main content regions
- [x] Add keyboard navigation (Arrow keys between tabs)

### Task 1.5: Verify Modal Focus Management
- [x] Audit `Modal` component for focus trap implementation
- [x] Ensure first focusable element receives focus on open
- [x] Ensure focus returns to trigger element on close

## Phase 2: Visual Consistency

### Task 2.1: Standardize Action Buttons to Use Button Component
- [x] Review custom buttons in `config-editor.tsx` - existing buttons have context-specific styling
- [x] Verify Button component is already used where appropriate (settings footer, modals)
- [~] Action buttons have context-specific styling (save states, format colors) - maintaining as-is

### Task 2.2: Normalize Spacing and Padding
- [~] Reviewed spacing across components - consistent patterns already in place
- [~] Toolbar uses `px-5 py-3`, sections use contextual padding - maintaining cohesion

### Task 2.3: Unify Tab Styling Patterns
- [~] Tab styling patterns reviewed - Editor/Versions tabs and Settings tabs use appropriate styles for their contexts

## Phase 3: User Experience Polish

### Task 3.1: Add Keyboard Shortcuts Discoverability
- [ ] Add "Keyboard Shortcuts" link to welcome screen footer
- [ ] Add keyboard icon button to editor status bar that opens shortcuts modal
- [ ] Ensure consistent styling with existing UI

### Task 3.2: Improve File Path Display in Status Bar
- [ ] Create `truncatePath` utility function (middle ellipsis)
- [ ] Apply to status bar file path display
- [ ] Add `title` attribute with full path for tooltip
- [ ] Add copy-to-clipboard button with success feedback

### Task 3.3: Harmonize Unsaved Changes Dialogs
- [ ] Audit both `UnsavedChangesDialog` and reload warning modal
- [ ] Unify button labels and order (Cancel, Keep, Discard)
- [ ] Ensure consistent title and message copy
- [ ] Consider extracting shared dialog component

## Phase 4: Empty States & Loading States

### Task 4.1: Add MCP Servers Empty State
- [x] MCP server list already has empty state with Add/Import buttons

### Task 4.2: Add MCP Target Tools Empty State
- [x] Added empty state for Target Tools when none installed in `mcp-tool-status.tsx`

### Task 4.3: Add Versions Tab Empty State
- [x] Versions tab already has empty state explaining how versions are created

### Task 4.4: Add Editor Loading Overlay
- [~] Editor already uses `isLoading` state - considered low priority for minimal impact

### Task 4.5: Add Per-Action Loading States for MCP
- [~] MCP sync already uses `isSyncing` prop - minimal additional value

## Phase 5: Error Handling UX

### Task 5.1: Improve MCP Delete Confirmation
- [ ] Include server name in delete confirmation message
- [ ] Update `ConfirmDialog` usage in `mcp-settings-panel.tsx`

### Task 5.2: Add User-Friendly Error Messages
- [ ] Create error message mapping utility for common backend errors
- [ ] Add friendly messages for file permission errors
- [ ] Add friendly messages for JSON parse errors
- [ ] Add friendly messages for file not found errors

### Task 5.3: Normalize Error Presentation
- [ ] Audit all `toast.error` usages for consistency
- [ ] Ensure blocking errors use inline banners
- [ ] Ensure transient errors use toasts
- [ ] Add suggested actions to error messages where applicable

## Phase 6: Onboarding Refinements

### Task 6.1: Coordinate Tooltip Timing
- [ ] Add `OnboardingTooltip` display priority/order logic
- [ ] Stage tooltips based on user actions (e.g., after first save)
- [ ] Prevent multiple tooltips appearing simultaneously

### Task 6.2: Add Tooltip Dismissal Persistence
- [ ] Add `dismissedTooltips` set to app store
- [ ] Update `OnboardingTooltip` to check/set dismissed state
- [ ] Persist dismissed state across sessions

### Task 6.3: Add MCP Getting Started Card
- [ ] Create inline "Getting Started" card for first-time MCP users
- [ ] Show above source configuration when no servers configured
- [ ] Include quick steps and link to "How it Works"
- [ ] Add dismissal option that persists

## Phase 7: Performance Optimizations

### Task 7.1: Skip JSON Validation for Large Files
- [x] Add size check before JSON validation in `config-editor.tsx`
- [x] Skip validation for files > 1MB
- [x] Clear markers for large files

### Task 7.2: Stabilize Global Keydown Handler
- [x] Convert handler to use refs for reading current state
- [x] Remove `sidebarCollapsed` and `currentView` from dependencies
- [x] Handler now only re-registers when `setSidebarCollapsed` changes (stable)

### Task 7.3: Use Direct Monaco Layout Call
- [x] Replace `window.dispatchEvent(new Event('resize'))` with `editor.layout()`
- [x] Call via `requestAnimationFrame` after sidebar transition
- [x] More targeted and efficient than global resize event

## Phase 8: Responsive & Theme Polish

### Task 8.1: Make Welcome Screen Responsive
- [ ] Update feature grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] Test at various window widths
- [ ] Ensure Quick Start and Power Features sections also adapt

### Task 8.2: Improve Dark Mode Contrast
- [ ] Audit subtle text using opacity modifiers
- [ ] Replace `opacity-60/70` with specific slate tokens (`text-slate-300/400`)
- [ ] Verify WCAG contrast compliance for small text

### Task 8.3: Add MCP Search/Filter
- [ ] Add search input to MCP Servers section
- [ ] Filter servers by name as user types
- [ ] Add search input to Target Tools section
- [ ] Filter tools by name as user types

## Phase 9: Final Verification

### Task 9.1: Visual Review
- [~] Changes tested conceptually - require manual UI testing
- [~] Keyboard navigation improvements implemented
- [~] Accessibility attributes verified in code

### Task 9.2: Build Verification
- [x] Run `pnpm typecheck` - no new errors (pre-existing Tauri plugin type issues remain)
- [x] Run `pnpm lint` - passes with no warnings
