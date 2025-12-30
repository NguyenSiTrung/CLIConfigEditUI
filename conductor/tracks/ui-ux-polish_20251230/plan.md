# Plan: Comprehensive UI/UX Polish

## Overview

Implementation plan for the comprehensive UI/UX overhaul following "Premium Dark Mode with VS Code Sensibility" design direction.

**Approach**: Big Bang - all improvements in one track
**Priority Pain Points**: Modal consistency, Light mode parity, Sidebar hierarchy

---

## Phase 1: Design System Foundation
<!-- execution: sequential -->

Establish the foundational design tokens and utilities before component changes.

- [x] Task 1.1: Audit and document current color usage (118 gray-* occurrences found)
  - Grep for `gray-` classes across codebase
  - Document all color inconsistencies
  - Create migration checklist

- [x] Task 1.2: Update CSS custom properties in index.css
  - Add semantic color tokens as CSS variables
  - Define surface, border, and text token scales
  - Ensure dark/light mode variants

- [x] Task 1.3: Create/update Tailwind theme extensions
  - Add semantic color aliases if needed
  - Verify glass utilities work in both themes
  - Test reduced motion support

---

## Phase 2: Modal System Refinement
<!-- execution: sequential -->

Unify all modal styling for consistency.

- [x] Task 2.1: Update base Modal component (ui/modal.tsx)
  - Standardize on `slate-*` colors
  - Refine backdrop and animation
  - Ensure consistent padding/spacing

- [x] Task 2.2: Update SettingsModal
  - Replace `gray-*` with `slate-*`
  - Align tab styling with design system
  - Fix footer alignment

- [x] Task 2.3: Update AddToolModal and EditToolModal
  - Ensure consistent form styling
  - Unify button placement
  - Apply refined focus states

- [x] Task 2.4: Update ConfigFile modals (Add/Edit)
  - Match styling to other modals
  - Consistent icon picker styling
  - Unified input styling

- [x] Task 2.5: Update BackupModal and VersionsTab modals
  - Consistent list item styling
  - Refined action buttons
  - Proper loading states

- [x] Task 2.6: Update KeyboardShortcutsModal
  - Consistent section styling
  - Refined kbd element styling
  - Proper scrolling behavior

- [x] Task 2.7: Update UpdateModal
  - Match design system
  - Progress indicator styling
  - Action button consistency

- [x] Task 2.8: Update MCP-related modals
  - McpServerEditorModal
  - McpSyncPreviewModal
  - McpConflictResolutionModal
  - McpConfigPreviewModal
  - McpImportPreviewModal

---

## Phase 3: Sidebar Improvements
<!-- execution: sequential -->

Improve visual hierarchy and reduce density.

- [ ] Task 3.1: Update sidebar container (sidebar/index.tsx)
  - Refine background gradient
  - Improve section spacing
  - Better resize handle visibility

- [ ] Task 3.2: Update SidebarSection component
  - Better header styling
  - Improved expand/collapse animation
  - Clearer section boundaries

- [ ] Task 3.3: Update tool item components
  - SidebarToolItem styling
  - ConfigFileItem refinement
  - Better active/selected states

- [ ] Task 3.4: Update hover actions and menus
  - ToolHoverActions timing
  - ToolActionsMenu styling
  - Consistent dropdown appearance

- [ ] Task 3.5: Update search bar styling
  - Refined focus state
  - Better placeholder styling
  - Clear button visibility

---

## Phase 4: Light Mode Enhancement
<!-- execution: parallel -->
<!-- depends: phase1 -->

Elevate light mode to match dark mode quality.

- [ ] Task 4.1: Update global light mode styles
  <!-- files: src/index.css -->
  - Add subtle shadows for elevation
  - Define light mode gradients
  - Adjust glass effect opacity

- [ ] Task 4.2: Update Header light mode
  <!-- files: src/components/header.tsx -->
  - Proper contrast for all elements
  - Refined hover states
  - Vibrant but not harsh accents

- [ ] Task 4.3: Update Sidebar light mode
  <!-- files: src/components/sidebar/index.tsx, src/components/sidebar/*.tsx -->
  - Surface depth with shadows
  - Better section separation
  - Readable text hierarchy

- [ ] Task 4.4: Update Editor area light mode
  <!-- files: src/components/config-editor.tsx -->
  - Status bar refinement
  - Tab styling adjustment
  - Banner styling (file not found, external change)

- [ ] Task 4.5: Update Modal light mode styles
  <!-- files: src/components/ui/modal.tsx -->
  - Proper elevation shadows
  - Border refinement
  - Footer background

---

## Phase 5: Micro-interactions & Animations
<!-- execution: sequential -->
<!-- depends: phase2, phase3 -->

Standardize transitions and add purposeful feedback.

- [ ] Task 5.1: Audit and standardize transition durations
  - Replace arbitrary durations with CSS variables
  - Ensure all hover states use `--duration-hover`
  - Verify easing functions

- [ ] Task 5.2: Button interaction refinement
  - Add subtle scale on active (btn-primary)
  - Consistent loading spinner
  - Focus ring animation

- [ ] Task 5.3: List and menu animations
  - Dropdown menu enter/exit
  - List item hover transitions
  - Expand/collapse smoothness

- [ ] Task 5.4: Toast notification refinement
  - Entry animation (slide + fade)
  - Exit animation timing
  - Stacking behavior

- [ ] Task 5.5: View transition polish
  - Editor ↔ MCP view switch
  - Tab content transitions
  - Modal backdrop sync

---

## Phase 6: Editor & Status Bar Polish
<!-- execution: sequential -->
<!-- depends: phase4 -->

Refine the main editing experience.

- [ ] Task 6.1: Update ConfigEditor toolbar
  - Button group styling
  - Save button prominence
  - Format button states

- [ ] Task 6.2: Update status bar
  - Visual grouping with separators
  - Hover states for interactive items
  - Auto-save indicator refinement

- [ ] Task 6.3: Update Editor/Versions tabs
  - Active indicator prominence
  - Hover preview effect
  - Smooth content transition

- [ ] Task 6.4: Update error and info banners
  - File not found banner
  - External change notification
  - Error banner styling

---

## Phase 7: Header & Navigation
<!-- execution: parallel -->
<!-- depends: phase4 -->

Polish the top-level navigation.

- [ ] Task 7.1: Update view tabs (Configs/MCP Sync)
  <!-- files: src/components/header.tsx -->
  - More prominent active indicator
  - Refined hover states
  - Better focus visibility

- [ ] Task 7.2: Update action button group
  <!-- files: src/components/header.tsx -->
  - Consistent sizing
  - Unified hover/focus
  - Better visual grouping

- [ ] Task 7.3: Update command palette button
  <!-- files: src/components/header.tsx -->
  - Refined styling
  - Keyboard hint visibility
  - Hover feedback

- [ ] Task 7.4: Update window controls
  <!-- files: src/components/header.tsx -->
  - Consistent with platform
  - Hover state refinement
  - Close button danger state

---

## Phase 8: MCP Panel Polish
<!-- execution: sequential -->
<!-- depends: phase2, phase4 -->

Refine the MCP settings experience.

- [ ] Task 8.1: Update panel header and actions
  - Sync All button prominence
  - Refresh button styling
  - Loading state indicator

- [ ] Task 8.2: Update "How it works" collapsible
  - Better expand/collapse animation
  - Icon rotation smoothness
  - Content fade in

- [ ] Task 8.3: Update section cards
  - Consistent elevation
  - Border refinement
  - Header styling

- [ ] Task 8.4: Update McpServerList
  - Item hover states
  - Action button visibility
  - Empty state styling

- [ ] Task 8.5: Update McpToolStatusList
  - Toggle switch styling
  - Sync button states
  - Status indicators

---

## Phase 9: UI Components Polish
<!-- execution: parallel -->
<!-- depends: phase1 -->

Refine base UI components.

- [ ] Task 9.1: Update Button component
  <!-- files: src/components/ui/button.tsx -->
  - Verify all variants
  - Consistent focus rings
  - Loading state refinement

- [ ] Task 9.2: Update Input component
  <!-- files: src/components/ui/input.tsx -->
  - Focus state enhancement
  - Error state styling
  - Label/helper text

- [ ] Task 9.3: Update Toggle component
  <!-- files: src/components/ui/toggle.tsx -->
  - Animation smoothness
  - Focus visibility
  - Disabled state

- [ ] Task 9.4: Update Card component
  <!-- files: src/components/ui/card.tsx -->
  - Elevation consistency
  - Border refinement
  - Hover states (if interactive)

- [ ] Task 9.5: Update ConfirmDialog
  <!-- files: src/components/ui/confirm-dialog.tsx -->
  - Match modal styling
  - Danger variant prominence
  - Button placement

- [ ] Task 9.6: Update Skeleton components
  <!-- files: src/components/ui/skeleton.tsx -->
  - Animation refinement
  - Color consistency
  - Reduced motion support

---

## Phase 10: Command Palette & Welcome Screen
<!-- execution: parallel -->
<!-- depends: phase2, phase5 -->

Final high-visibility components.

- [ ] Task 10.1: Update CommandPalette
  <!-- files: src/components/command-palette.tsx -->
  - Section header styling
  - Item hover refinement
  - Keyboard hints styling

- [ ] Task 10.2: Update WelcomeScreen
  <!-- files: src/components/welcome-screen.tsx -->
  - Card styling consistency
  - Feature item refinement
  - Action button prominence

---

## Phase 11: Final Integration & QA
<!-- execution: sequential -->
<!-- depends: phase6, phase7, phase8, phase9, phase10 -->

Final verification and cleanup.

- [ ] Task 11.1: Full visual audit - Dark mode
  - Screenshot all major views
  - Check consistency across components
  - Verify animations work

- [ ] Task 11.2: Full visual audit - Light mode
  - Screenshot all major views
  - Check contrast ratios
  - Verify shadows and depth

- [ ] Task 11.3: Accessibility audit
  - Keyboard navigation test
  - Focus visibility check
  - Screen reader spot check

- [ ] Task 11.4: Performance verification
  - Check animation performance
  - Verify no layout thrashing
  - Test reduced motion mode

- [ ] Task 11.5: Run all tests and quality checks
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `cargo clippy` (if any Rust changes)

- [ ] Task 11.6: Update documentation if needed
  - DESIGN.md updates
  - Any new patterns documented

---

## Parallel Execution Summary

**Phase-Level Parallelism:**
- Phase 4 (Light Mode) and Phase 9 (UI Components) can start after Phase 1
- Phase 6 (Editor) and Phase 7 (Header) can run in parallel after Phase 4
- Phase 10 can run after Phase 2 and Phase 5

**Dependency Graph:**
```
Phase 1 ──┬──> Phase 2 ──┬──> Phase 5 ──┬──> Phase 10
          │              │              │
          ├──> Phase 3 ──┘              └──> Phase 11
          │                                    ▲
          ├──> Phase 4 ──┬──> Phase 6 ─────────┤
          │              │                     │
          │              └──> Phase 7 ─────────┤
          │                                    │
          ├──> Phase 9 ────────────────────────┤
          │                                    │
          └──> Phase 8 (after Phase 2 & 4) ────┘
```
