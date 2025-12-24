# Plan: UI/UX Comprehensive Improvement

## Phase 1: Design System Foundation

### Task 1.1: Create Design Tokens
- [x] Create `src/constants/design-tokens.ts` with color palette (primary, secondary, status colors)
- [x] Add typography scale tokens (font sizes, line heights, font weights)
- [x] Add spacing scale tokens (padding, margin, gap values)
- [x] Add shadow and border-radius tokens
- [x] Create single-source `APP_VERSION` constant

### Task 1.2: Create Shared Button Component
- [x] Create `src/components/ui/button.tsx` with variants (primary, secondary, ghost, danger)
- [x] Add size variants (sm, md, lg)
- [x] Implement keyboard shortcut display prop
- [x] Add aria-label support and focus ring styles
- [x] Write tests for Button component

### Task 1.3: Create Shared Modal Component
- [x] Create `src/components/ui/modal.tsx` with accessible dialog pattern
- [x] Implement focus trap using `useFocusTrap` hook
- [x] Add ESC key to close functionality
- [x] Add `role="dialog"`, `aria-modal`, `aria-labelledby` attributes
- [x] Implement backdrop click handling with optional disable
- [x] Write tests for Modal component

### Task 1.4: Create Additional UI Components
- [x] Create `src/components/ui/card.tsx` with consistent panel styling
- [x] Create `src/components/ui/toggle.tsx` (extracted from SettingsModal)
- [x] Create `src/components/ui/input.tsx` with label and error states
- [x] Create `src/components/ui/section-header.tsx` for panel headers
- [x] Create `src/components/ui/index.ts` barrel export
- [x] Write tests for UI components

### Task 1.5: Migrate Existing Modals
- [x] Migrate `SettingsModal` to use shared Modal component
- [x] Migrate `AddToolModal` to use shared Modal/Button/Input components
- [x] Migrate `EditToolModal` to use shared components
- [x] Migrate `AddConfigFileModal` to use shared components
- [x] Migrate `EditConfigFileModal` to use shared components
- [x] Migrate `BackupModal` to use shared components
- [x] Migrate MCP modals to use shared components
- [x] Verify all modals have consistent styling and accessibility

## Phase 2: Visual Consistency & Typography

### Task 2.1: Fix Version String
- [x] Update `header.tsx` to use `APP_VERSION` constant
- [x] Update `settings-modal.tsx` to use `APP_VERSION` constant
- [x] Verify version displays consistently

### Task 2.2: Normalize Typography
- [x] Audit all text sizes below 12px
- [x] Update status bar in `config-editor.tsx` to minimum 11px
- [x] Update version labels to use typography tokens
- [x] Fix header version label size
- [x] Ensure body text uses minimum 12px

### Task 2.3: Consolidate Visual Styles
- [x] Update `AddToolModal` to use Card component styles
- [x] Update `SettingsModal` panels to use Card component
- [x] Update MCP section panels to use Card component
- [x] Standardize accent color usage across components
- [x] Remove redundant glassmorphism effects

### Task 2.4: Consolidate Toast System
- [x] Remove local toast state from `mcp-settings-panel.tsx`
- [x] Update MCP panel to use global `toast.*` helpers
- [x] Verify toast styling is consistent across app

## Phase 3: Accessibility Improvements

### Task 3.1: Icon Button Accessibility
- [x] Add `aria-label` to theme toggle button in header
- [x] Add `aria-label` to window control buttons (minimize, maximize, close)
- [x] Add `aria-label` to sidebar collapse/expand buttons
- [x] Add `aria-label` to all MCP action buttons
- [x] Add `aria-label` to editor toolbar icon buttons
- [x] Apply `.focus-ring` class to all icon buttons

### Task 3.2: Keyboard Navigation
- [x] Implement Tab order in header toolbar
- [x] Implement Tab order in editor toolbar
- [x] Add arrow key navigation for tab toggles (Editor/Versions)
- [x] Add arrow key navigation for Settings tabs
- [x] Verify focus is restored after modal close

### Task 3.3: Color Contrast Audit
- [x] Audit dark mode text contrast for slate-400/500 text
- [x] Adjust low-contrast text colors to meet WCAG AA
- [x] Test with contrast checker tool
- [x] Update status bar text colors for better contrast

## Phase 4: Interaction Improvements

### Task 4.1: Sidebar Resize Handle
- [x] Increase resize handle hit area to 6px in `sidebar/index.tsx`
- [x] Keep visual indicator narrow (1-2px)
- [x] Add cursor change on hover for better affordance

### Task 4.2: Keyboard Shortcuts Display
- [x] Update Save button to show shortcut (⌘S / Ctrl+S)
- [x] Update Format button to show shortcut
- [x] Create `useKeyboardShortcut` hook for registering shortcuts
- [x] Add Ctrl/Cmd+, shortcut for Settings
- [x] Add Ctrl/Cmd+B shortcut for sidebar toggle
- [x] Add Ctrl/Cmd+Shift+M shortcut for MCP panel

### Task 4.3: Replace Native Dialogs
- [x] Create `ConfirmDialog` component using shared Modal
- [x] Replace `confirm()` in MCP delete server flow
- [x] Create custom unsaved-changes dialog component
- [x] Replace Tauri `ask()` with custom unsaved-changes dialog
- [x] Add "Save & switch / Discard / Cancel" options

## Phase 5: User Flow Optimization

### Task 5.1: Redesign Welcome Screen
- [x] Update welcome screen with 3 primary action buttons
- [x] Add "Scan for CLIs" / "Open config" / "Add custom tool" buttons
- [x] Add quick-start step list (1-2-3 bullets)
- [x] Reduce marketing copy, increase actionable guidance
- [x] Update feature cards to be more concise

### Task 5.2: Improve Error States
- [x] Create inline empty-state component for non-existing files
- [x] Replace full-screen error in `config-editor.tsx` for missing files
- [x] Show "File will be created on save" message inline
- [x] Add "Start editing" button with default content

### Task 5.3: Unsaved Changes Indicator
- [x] Add unsaved dot indicator to sidebar config file items
- [x] Track dirty state per config file in store
- [x] Update `config-file-item.tsx` to show indicator
- [x] Style indicator to be subtle but visible

### Task 5.4: Monaco Error Feedback
- [x] Integrate Monaco markers for JSON parse errors
- [x] Show error location in editor gutter on format failure
- [x] Update format error handling to use markers instead of toast-only
- [x] Clear markers on successful parse

## Phase 6: Discoverability

### Task 6.1: Onboarding Hints
- [x] Create `OnboardingTooltip` component for first-visit hints
- [x] Add hint for Versions tab on first visit
- [x] Add hint for Backups feature when first available
- [x] Store shown hints in localStorage to avoid repetition

### Task 6.2: Contextual Help
- [x] Add "Backups disabled" note with Settings link when backups are off
- [x] Add "Change in Settings" link near delete confirmation behavior
- [x] Add descriptive tooltip for IDE Extensions section in sidebar
- [x] Add tooltip explaining History button functionality

## Phase 7: Modern Features

### Task 7.1: Command Palette
- [x] Create `CommandPalette` component with search input
- [x] Implement fuzzy search for commands
- [x] Add commands: switch tools, open settings, toggle theme, switch view
- [x] Register Ctrl/Cmd+K shortcut to open palette
- [x] Add keyboard navigation (arrow keys, enter to select)
- [x] Style consistently with app design system

### Task 7.2: System Theme Sync
- [x] Add "Follow system" option to theme settings
- [x] Implement `useSystemTheme` hook with media query listener
- [x] Update theme store to support 'light' | 'dark' | 'system'
- [x] Update Settings appearance tab with three-way toggle
- [x] Persist theme preference

### Task 7.3: Reduced Motion Setting
- [x] Add "Reduce motion" toggle in Settings → Behavior
- [x] Create CSS class `.reduce-motion` that disables animations
- [x] Apply reduced motion preference to glassmorphism effects
- [x] Respect `prefers-reduced-motion` media query as default

### Task 7.4: Auto-save Feature
- [x] Add "Auto-save" toggle in Settings → Editor
- [x] Implement debounced auto-save (e.g., 2 second delay after change)
- [x] Add visual indicator in status bar when auto-save is enabled
- [x] Show "Auto-saved" toast/indicator on successful auto-save
- [x] Ensure auto-save respects backup settings

## Phase 8: Performance UX

### Task 8.1: Optimize Status Bar Metrics
- [x] Memoize line count and byte size calculations
- [x] Use `useMemo` with `editorContent` dependency
- [x] Verify no unnecessary recalculations on render

### Task 8.2: Optimize CSS Transitions
- [x] Update `index.css` button transition to specific properties
- [x] Change `transition: all` to `transition: color, background-color, transform, box-shadow`
- [x] Audit other `transition: all` usages and fix

### Task 8.3: Optimize Async Operations
- [x] Debounce backup checks in `config-editor.tsx`
- [x] Only trigger backup check on file path change, not minor updates
- [x] Add loading state for backup check to avoid UI blocking

### Task 8.4: Reduce Visual Complexity
- [x] Audit and reduce blur layers in glassmorphism
- [x] Simplify shadow stacking in cards/panels
- [x] Ensure reduced motion setting disables heavy effects

## Phase 9: Final Polish & Testing

### Task 9.1: Cross-component Testing
- [x] Test all modals for accessibility (focus trap, ESC, aria)
- [x] Test keyboard shortcuts in all contexts
- [x] Test theme switching (light, dark, system)
- [x] Test command palette with various commands

### Task 9.2: Visual Regression Check
- [x] Review all screens in light mode
- [x] Review all screens in dark mode
- [x] Check typography consistency
- [x] Verify color usage matches design tokens

### Task 9.3: Documentation
- [x] Document design tokens usage in code comments
- [x] Document keyboard shortcuts in README or help
- [x] Update component inline documentation
