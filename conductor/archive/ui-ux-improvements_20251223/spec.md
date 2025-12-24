# Spec: UI/UX Comprehensive Improvement

## Overview

A comprehensive UI/UX overhaul of CLI Config Editor to improve visual consistency, accessibility, user flows, discoverability, and performance. The approach is foundational-first: building a shared component library and design tokens before implementing improvements across the application.

## Functional Requirements

### FR1: Design System Foundation
- **FR1.1**: Create shared UI components: Modal, Button, Card, Toggle, Input, SectionHeader
- **FR1.2**: Establish design tokens (colors, typography scale, spacing, shadows)
- **FR1.3**: Document component usage with inline comments and examples
- **FR1.4**: Migrate existing modals (Settings, AddTool, EditTool, ConfigFile, MCP modals) to shared Modal component

### FR2: Visual Consistency
- **FR2.1**: Unify version string from single source (app metadata)
- **FR2.2**: Normalize typography: minimum 12px for readable text, 11px only for metadata
- **FR2.3**: Standardize accent colors: primary (indigo), secondary (emerald), status (amber/rose)
- **FR2.4**: Consolidate panel/card styles across Settings, MCP, and editor components
- **FR2.5**: Consolidate toast notifications - use global ToastContainer everywhere including MCP panel

### FR3: Accessibility Improvements
- **FR3.1**: Implement accessible Modal pattern (role="dialog", aria-modal, focus trap, ESC close)
- **FR3.2**: Add aria-label to all icon-only buttons
- **FR3.3**: Apply visible focus rings to interactive elements
- **FR3.4**: Improve keyboard navigation (Tab order, arrow keys in tab groups)
- **FR3.5**: Ensure WCAG AA color contrast for all text

### FR4: Interaction Improvements
- **FR4.1**: Increase sidebar resize handle hit area (4-8px)
- **FR4.2**: Display keyboard shortcuts on buttons (Save ⌘S, Format ⌥⇧F)
- **FR4.3**: Add keyboard shortcuts: Ctrl/Cmd+, (Settings), Ctrl/Cmd+B (Toggle sidebar), Ctrl/Cmd+Shift+M (MCP panel)
- **FR4.4**: Replace native confirm() dialogs with styled confirmation modals
- **FR4.5**: Implement custom unsaved-changes dialog with "Save & switch / Discard / Cancel"

### FR5: User Flow Optimization
- **FR5.1**: Redesign welcome screen with clear action paths: "Scan CLIs", "Open config", "Add custom tool"
- **FR5.2**: Replace full-screen "Failed to load" error with inline empty-state for non-existing files
- **FR5.3**: Show unsaved indicator (dot) on sidebar items with pending changes
- **FR5.4**: Improve Monaco error feedback - show parse errors as markers, not just toasts

### FR6: Discoverability
- **FR6.1**: Add first-visit tooltips/cards for Versions tab and Backups feature
- **FR6.2**: Show "Backups disabled" note with link to Settings when applicable
- **FR6.3**: Add contextual "Change in Settings" links near configurable behaviors
- **FR6.4**: Add descriptive tooltip for IDE Extensions section

### FR7: Modern Features
- **FR7.1**: Command Palette (Ctrl/Cmd+K) - search tools, switch views, open settings, toggle theme
- **FR7.2**: System theme sync option ("Follow system appearance")
- **FR7.3**: Reduced motion setting - minimize animations and heavy visual effects
- **FR7.4**: Auto-save option with visual indicator in status bar

### FR8: Performance UX
- **FR8.1**: Memoize/throttle status bar metrics (line count, byte size)
- **FR8.2**: Limit CSS transitions to specific properties (not "all")
- **FR8.3**: Debounce backup checks on file switch
- **FR8.4**: Optimize glassmorphism effects (reduce blur/shadow layers)

## Non-Functional Requirements

- **NFR1**: All new components must be TypeScript strict mode compliant
- **NFR2**: Maintain app startup time < 2 seconds
- **NFR3**: No new runtime dependencies for UI components
- **NFR4**: Components must support both dark and light themes
- **NFR5**: Keyboard shortcuts must not conflict with OS/browser defaults

## Acceptance Criteria

1. All modals use the shared Modal component with consistent styling and accessibility
2. Version string appears consistently throughout the app from a single source
3. All icon-only buttons have aria-label and visible focus states
4. Command palette opens with Ctrl/Cmd+K and supports basic actions
5. Theme can follow system preference when enabled
6. Welcome screen clearly guides new users to primary actions
7. Non-existing config files show inline empty-state, not error screen
8. Sidebar shows unsaved indicator dots on modified files
9. No text smaller than 11px; body text minimum 12px
10. Toast notifications work consistently across all panels

## Out of Scope

- Full Storybook documentation (moderate scope, inline docs only)
- Complete component library extraction to separate package
- E2E testing infrastructure for UI components
- Internationalization/localization
- Major layout restructuring (drawer-based MCP editing deferred)
- File watcher improvements (separate track)
