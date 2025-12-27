# Spec: Comprehensive UI/UX Improvements

## Overview

A comprehensive UI/UX improvement pass for CLI Config Editor addressing accessibility, visual consistency, user experience polish, empty/loading states, error handling, onboarding refinements, and performance optimizations identified through deep analysis of the codebase.

## Functional Requirements

### 1. Accessibility Improvements

- **FR-1.1**: Fix Settings modal tab ARIA - Add `id={tab.id}` to tab buttons so `aria-labelledby` references are valid
- **FR-1.2**: Make sidebar resize handle keyboard-accessible with `tabIndex={0}` and arrow key support
- **FR-1.3**: Guard global keyboard shortcuts to skip when focus is in inputs, textareas, or Monaco editor
- **FR-1.4**: Convert Header view toggles (Configs/MCP) to proper tab semantics with `role="tablist"` and `role="tab"`
- **FR-1.5**: Ensure all modals trap focus and return focus to trigger on close

### 2. Visual Consistency

- **FR-2.1**: Standardize action buttons to use shared `Button` component (Save, Format, File Backups, MCP actions)
- **FR-2.2**: Normalize spacing/padding across components (toolbar: `px-4 py-2.5`, sections: `p-6`)
- **FR-2.3**: Unify tab styling patterns - use pill-style for 2-3 option switches consistently

### 3. User Experience Polish

- **FR-3.1**: Add keyboard shortcuts link to welcome screen footer and editor status bar
- **FR-3.2**: Truncate long file paths in status bar with middle ellipsis, show full path in tooltip
- **FR-3.3**: Add copy-to-clipboard button for file path in status bar
- **FR-3.4**: Harmonize unsaved changes dialogs - consistent copy, button labels, and action order

### 4. Empty States & Loading States

- **FR-4.1**: Add empty state for MCP Servers section ("No MCP servers yet" with Add/Import buttons)
- **FR-4.2**: Add empty state for MCP Target Tools when none installed
- **FR-4.3**: Add empty state for Versions tab explaining how versions are created
- **FR-4.4**: Add loading overlay/spinner for editor during file switching
- **FR-4.5**: Add per-action loading states for MCP Sync/Import buttons

### 5. Error Handling UX

- **FR-5.1**: Include server name in MCP delete confirmation dialog
- **FR-5.2**: Add user-friendly error descriptions for common backend errors (file permissions, parse errors)
- **FR-5.3**: Normalize error presentation - toasts for transient, banners for blocking errors

### 6. Onboarding Refinements

- **FR-6.1**: Coordinate tooltip timing - stage them based on user actions, not all at once
- **FR-6.2**: Add "Don't show again" behavior for onboarding tooltips (persist in store)
- **FR-6.3**: Add "Getting started with MCP Sync" inline card for first-time MCP panel users

### 7. Performance Optimizations

- **FR-7.1**: Skip JSON validation for files larger than 1MB to prevent lag
- **FR-7.2**: Stabilize global keydown handler to avoid re-registering on state changes
- **FR-7.3**: Use `editor.layout()` directly instead of global resize event for Monaco

### 8. Responsive & Theme Polish

- **FR-8.1**: Make welcome screen feature grid responsive (1→2→3 columns based on width)
- **FR-8.2**: Improve contrast for subtle text in dark mode - use specific tokens instead of opacity
- **FR-8.3**: Add search/filter for MCP Servers and Target Tools lists

## Non-Functional Requirements

- All changes must maintain existing functionality
- No breaking changes to component APIs
- Maintain TypeScript strict mode compliance
- Follow existing code patterns and conventions

## Acceptance Criteria

- [ ] All accessibility fixes verified with keyboard navigation testing
- [ ] Visual consistency verified across light and dark themes
- [ ] Empty states display correctly when lists are empty
- [ ] Loading states show during async operations
- [ ] Error messages are user-friendly and actionable
- [ ] Onboarding tooltips appear at appropriate times and can be dismissed
- [ ] No performance regressions on large config files
- [ ] Application builds without TypeScript errors
- [ ] ESLint passes with no new warnings

## Out of Scope

- New major features beyond polish/refinement
- Backend/Rust changes
- Automated E2E testing
- Mobile/touch support
- Internationalization/localization
