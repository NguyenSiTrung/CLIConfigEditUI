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
- [ ] Write tests for Button component

### Task 1.3: Create Shared Modal Component
- [x] Create `src/components/ui/modal.tsx` with accessible dialog pattern
- [x] Implement focus trap using `useFocusTrap` hook
- [x] Add ESC key to close functionality
- [x] Add `role="dialog"`, `aria-modal`, `aria-labelledby` attributes
- [x] Implement backdrop click handling with optional disable
- [ ] Write tests for Modal component

### Task 1.4: Create Additional UI Components
- [x] Create `src/components/ui/card.tsx` with consistent panel styling
- [x] Create `src/components/ui/toggle.tsx` (extracted from SettingsModal)
- [x] Create `src/components/ui/input.tsx` with label and error states
- [x] Create `src/components/ui/section-header.tsx` for panel headers
- [x] Create `src/components/ui/index.ts` barrel export
- [ ] Write tests for UI components

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
- [ ] Add `aria-label` to theme toggle button in header
- [ ] Add `aria-label` to window control buttons (minimize, maximize, close)
- [ ] Add `aria-label` to sidebar collapse/expand buttons
- [ ] Add `aria-label` to all MCP action buttons
- [ ] Add `aria-label` to editor toolbar icon buttons
- [ ] Apply `.focus-ring` class to all icon buttons

### Task 3.2: Keyboard Navigation
- [ ] Implement Tab order in header toolbar
- [ ] Implement Tab order in editor toolbar
- [ ] Add arrow key navigation for tab toggles (Editor/Versions)
- [ ] Add arrow key navigation for Settings tabs
- [ ] Verify focus is restored after modal close

### Task 3.3: Color Contrast Audit
- [ ] Audit dark mode text contrast for slate-400/500 text
- [ ] Adjust low-contrast text colors to meet WCAG AA
- [ ] Test with contrast checker tool
- [ ] Update status bar text colors for better contrast

## Phase 4: Interaction Improvements

### Task 4.1: Sidebar Resize Handle
- [ ] Increase resize handle hit area to 6px in `sidebar/index.tsx`
- [ ] Keep visual indicator narrow (1-2px)
- [ ] Add cursor change on hover for better affordance

### Task 4.2: Keyboard Shortcuts Display
- [ ] Update Save button to show shortcut (⌘S / Ctrl+S)
- [ ] Update Format button to show shortcut
- [ ] Create `useKeyboardShortcut` hook for registering shortcuts
- [ ] Add Ctrl/Cmd+, shortcut for Settings
- [ ] Add Ctrl/Cmd+B shortcut for sidebar toggle
- [ ] Add Ctrl/Cmd+Shift+M shortcut for MCP panel

### Task 4.3: Replace Native Dialogs
- [ ] Create `ConfirmDialog` component using shared Modal
- [ ] Replace `confirm()` in MCP delete server flow
- [ ] Create custom unsaved-changes dialog component
- [ ] Replace Tauri `ask()` with custom unsaved-changes dialog
- [ ] Add "Save & switch / Discard / Cancel" options

## Phase 5: User Flow Optimization

### Task 5.1: Redesign Welcome Screen
- [ ] Update welcome screen with 3 primary action buttons
- [ ] Add "Scan for CLIs" / "Open config" / "Add custom tool" buttons
- [ ] Add quick-start step list (1-2-3 bullets)
- [ ] Reduce marketing copy, increase actionable guidance
- [ ] Update feature cards to be more concise

### Task 5.2: Improve Error States
- [ ] Create inline empty-state component for non-existing files
- [ ] Replace full-screen error in `config-editor.tsx` for missing files
- [ ] Show "File will be created on save" message inline
- [ ] Add "Start editing" button with default content

### Task 5.3: Unsaved Changes Indicator
- [ ] Add unsaved dot indicator to sidebar config file items
- [ ] Track dirty state per config file in store
- [ ] Update `config-file-item.tsx` to show indicator
- [ ] Style indicator to be subtle but visible

### Task 5.4: Monaco Error Feedback
- [ ] Integrate Monaco markers for JSON parse errors
- [ ] Show error location in editor gutter on format failure
- [ ] Update format error handling to use markers instead of toast-only
- [ ] Clear markers on successful parse

## Phase 6: Discoverability

### Task 6.1: Onboarding Hints
- [ ] Create `OnboardingTooltip` component for first-visit hints
- [ ] Add hint for Versions tab on first visit
- [ ] Add hint for Backups feature when first available
- [ ] Store shown hints in localStorage to avoid repetition

### Task 6.2: Contextual Help
- [ ] Add "Backups disabled" note with Settings link when backups are off
- [ ] Add "Change in Settings" link near delete confirmation behavior
- [ ] Add descriptive tooltip for IDE Extensions section in sidebar
- [ ] Add tooltip explaining History button functionality

## Phase 7: Modern Features

### Task 7.1: Command Palette
- [ ] Create `CommandPalette` component with search input
- [ ] Implement fuzzy search for commands
- [ ] Add commands: switch tools, open settings, toggle theme, switch view
- [ ] Register Ctrl/Cmd+K shortcut to open palette
- [ ] Add keyboard navigation (arrow keys, enter to select)
- [ ] Style consistently with app design system

### Task 7.2: System Theme Sync
- [ ] Add "Follow system" option to theme settings
- [ ] Implement `useSystemTheme` hook with media query listener
- [ ] Update theme store to support 'light' | 'dark' | 'system'
- [ ] Update Settings appearance tab with three-way toggle
- [ ] Persist theme preference

### Task 7.3: Reduced Motion Setting
- [ ] Add "Reduce motion" toggle in Settings → Behavior
- [ ] Create CSS class `.reduce-motion` that disables animations
- [ ] Apply reduced motion preference to glassmorphism effects
- [ ] Respect `prefers-reduced-motion` media query as default

### Task 7.4: Auto-save Feature
- [ ] Add "Auto-save" toggle in Settings → Editor
- [ ] Implement debounced auto-save (e.g., 2 second delay after change)
- [ ] Add visual indicator in status bar when auto-save is enabled
- [ ] Show "Auto-saved" toast/indicator on successful auto-save
- [ ] Ensure auto-save respects backup settings

## Phase 8: Performance UX

### Task 8.1: Optimize Status Bar Metrics
- [ ] Memoize line count and byte size calculations
- [ ] Use `useMemo` with `editorContent` dependency
- [ ] Verify no unnecessary recalculations on render

### Task 8.2: Optimize CSS Transitions
- [ ] Update `index.css` button transition to specific properties
- [ ] Change `transition: all` to `transition: color, background-color, transform, box-shadow`
- [ ] Audit other `transition: all` usages and fix

### Task 8.3: Optimize Async Operations
- [ ] Debounce backup checks in `config-editor.tsx`
- [ ] Only trigger backup check on file path change, not minor updates
- [ ] Add loading state for backup check to avoid UI blocking

### Task 8.4: Reduce Visual Complexity
- [ ] Audit and reduce blur layers in glassmorphism
- [ ] Simplify shadow stacking in cards/panels
- [ ] Ensure reduced motion setting disables heavy effects

## Phase 9: Final Polish & Testing

### Task 9.1: Cross-component Testing
- [ ] Test all modals for accessibility (focus trap, ESC, aria)
- [ ] Test keyboard shortcuts in all contexts
- [ ] Test theme switching (light, dark, system)
- [ ] Test command palette with various commands

### Task 9.2: Visual Regression Check
- [ ] Review all screens in light mode
- [ ] Review all screens in dark mode
- [ ] Check typography consistency
- [ ] Verify color usage matches design tokens

### Task 9.3: Documentation
- [ ] Document design tokens usage in code comments
- [ ] Document keyboard shortcuts in README or help
- [ ] Update component inline documentation
