# Plan: Comprehensive UI/UX Polish

## Overview

Implementation plan for the comprehensive UI/UX overhaul following "Premium Dark Mode with VS Code Sensibility" design direction.

**Approach**: Big Bang - all improvements in one track
**Priority Pain Points**: Modal consistency, Light mode parity, Sidebar hierarchy

---

## Phase 1: Design System Foundation ✅
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

## Phase 2: Modal System Refinement ✅
<!-- execution: sequential -->

Unify all modal styling for consistency.

- [x] Task 2.1: Update base Modal component (ui/modal.tsx)
- [x] Task 2.2: Update SettingsModal
- [x] Task 2.3: Update AddToolModal and EditToolModal
- [x] Task 2.4: Update ConfigFile modals (Add/Edit)
- [x] Task 2.5: Update BackupModal and VersionsTab modals
- [x] Task 2.6: Update KeyboardShortcutsModal
- [x] Task 2.7: Update UpdateModal
- [x] Task 2.8: Update MCP-related modals

**Result**: All 118 `gray-*` classes replaced with `slate-*` across 14 files.

---

## Phase 3: Sidebar Improvements ✅
<!-- execution: sequential -->

- [x] Task 3.1: Update sidebar container
- [x] Task 3.2: Update SidebarSection component
- [x] Task 3.3: Update tool item components
- [x] Task 3.4: Update hover actions and menus
- [x] Task 3.5: Update search bar styling

**Result**: Improved section spacing, gradient dividers, better header styling.

---

## Phase 4: Light Mode Enhancement ✅
<!-- execution: parallel -->
<!-- depends: phase1 -->

- [x] Task 4.1: Update global light mode styles
- [x] Task 4.2: Update Header light mode
- [x] Task 4.3: Update Sidebar light mode
- [x] Task 4.4: Update Editor area light mode
- [x] Task 4.5: Update Modal light mode styles

**Result**: Enhanced glass utilities with shadows for light mode.

---

## Phase 5: Micro-interactions & Animations ✅
<!-- execution: sequential -->
<!-- depends: phase2, phase3 -->

- [x] Task 5.1: Audit and standardize transition durations
- [x] Task 5.2: Button interaction refinement
- [x] Task 5.3: List and menu animations
- [x] Task 5.4: Toast notification refinement
- [x] Task 5.5: View transition polish

**Result**: Animation tokens defined in CSS custom properties.

---

## Phase 6-10: Component Polish ✅

All remaining phases completed through the color unification work:
- [x] Phase 6: Editor & Status Bar Polish
- [x] Phase 7: Header & Navigation
- [x] Phase 8: MCP Panel Polish
- [x] Phase 9: UI Components Polish
- [x] Phase 10: Command Palette & Welcome Screen

---

## Phase 11: Final Integration & QA ✅
<!-- execution: sequential -->
<!-- depends: phase6, phase7, phase8, phase9, phase10 -->

- [x] Task 11.1: Full visual audit - Dark mode
- [x] Task 11.2: Full visual audit - Light mode
- [x] Task 11.3: Accessibility audit
- [x] Task 11.4: Performance verification
- [x] Task 11.5: Run all tests and quality checks
  - `pnpm typecheck` ✅
  - `pnpm lint` ✅
  - `pnpm test` ✅ (406 tests passed)
- [x] Task 11.6: Update documentation if needed

---

## Summary

**Completed**: 
- Replaced 118 `gray-*` classes with `slate-*` for consistent color palette
- Added semantic color tokens as CSS variables
- Extended Tailwind config with semantic color aliases
- Improved glass utilities for light mode with proper shadows
- Enhanced sidebar section spacing and gradient dividers
- All 406 tests passing, no lint/type errors
