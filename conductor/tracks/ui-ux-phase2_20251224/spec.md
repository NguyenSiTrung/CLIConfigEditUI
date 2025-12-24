# Spec: UI/UX Improvements Phase 2

## Overview

A comprehensive UI/UX enhancement track for CLI Config Editor, building upon the foundation established in Phase 1. This track focuses on reducing visual noise, improving feedback clarity, enhancing discoverability of power features, adding modern desktop app patterns, and strengthening accessibility. The goal is a more polished, professional, and user-friendly experience.

## Functional Requirements

### FR1: Toast Noise & Feedback Clarity

- **FR1.1**: Silent auto-save - bypass toast notifications for auto-save, update status bar only with "Auto-saved at HH:MM:SS"
- **FR1.2**: Reserve success toasts for explicit user saves (Ctrl+S or Save button click)
- **FR1.3**: Fix status bar line display - change "Ln {total}" to "{total} lines" or show cursor position "Ln X, Col Y" via Monaco API
- **FR1.4**: Disable Format button for non-JSON formats with tooltip "Formatting supported for JSON only"
- **FR1.5**: Add cursor position tracking from Monaco editor to status bar

### FR2: File Safety UX

- **FR2.1**: Show warning dialog when reloading externally changed file with unsaved local edits
- **FR2.2**: Reuse UnsavedChangesDialog variant for reload confirmation: "Reload and discard" / "Keep my edits" / "Cancel"
- **FR2.3**: Clarify Versions vs Backups terminology across UI:
  - Versions tab subtitle: "Compare app snapshots and restore previous versions"
  - History button label: "File Backups" instead of "History"
  - Settings Backup tab: explain connection to "File Backups" feature
- **FR2.4**: Add unsaved indicator dot on sidebar config items (mirroring toolbar pill)
- **FR2.5**: Tooltip on sidebar items when dirty: "Switching will ask you to save or discard changes"

### FR3: Discoverability Enhancements

- **FR3.1**: Create dedicated Keyboard Shortcuts modal accessible from:
  - Command palette ("View Keyboard Shortcuts")
  - Settings modal (new tab or link)
- **FR3.2**: Add inline shortcut hints on key buttons:
  - Save button: "Save ⌘S" / "Save Ctrl+S"
  - Format button: show shortcut if applicable
  - Settings button tooltip: include "⌘," / "Ctrl+,"
- **FR3.3**: Add visible Command Palette trigger in header with "⌘K" hint
- **FR3.4**: First-time tooltip on header: "Press ⌘K to open command palette"
- **FR3.5**: Expand Welcome Screen with "Power Features" section:
  - MCP Sync description with link to MCP tab
  - Version History description
  - Backups description with link to Settings
- **FR3.6**: Add "How MCP Sync Works" collapsible info block in MCP panel
- **FR3.7**: Empty state for MCP Servers with call-to-action (Import/Add)
- **FR3.8**: Cross-reference hints: Settings theme → "Toggle from top bar", Header toggle → "More options in Settings"

### FR4: Visual Polish & Consistency

- **FR4.1**: Reduce gradient/glow usage - limit to 1-2 hero areas (app icon, welcome icon)
- **FR4.2**: Make toolbar and status bar solid backgrounds (reduce glassmorphism noise)
- **FR4.3**: Standardize icon sizes: 16px (w-4) for inline, 20px (w-5) for standalone actions
- **FR4.4**: Reduce scale animations - keep for primary actions only, remove from secondary buttons
- **FR4.5**: Standardize animation durations: 150ms for hover, 200ms for entry/exit
- **FR4.6**: Improve typography scale: minimum 12px for readable text (reduce 11px usage)
- **FR4.7**: Improve color contrast for small text (slate-600 instead of slate-400 in light mode)
- **FR4.8**: Soften secondary borders - lighter colors for inner sections

### FR5: Modern Desktop Features

- **FR5.1**: Quick Open (Ctrl/Cmd+P) - dedicated mode for jumping to configs by name/path
- **FR5.2**: Diff View for Versions - Monaco diff editor comparing version with current content
- **FR5.3**: Diff View for Backups - Monaco diff editor comparing backup with current content
- **FR5.4**: Recent Files tracking - store last 10 opened configs
- **FR5.5**: Recent Files display in command palette under "Recent" category
- **FR5.6**: Search hints - "Find in file (Ctrl+F)" hint in status bar on first open
- **FR5.7**: Command palette entry for "Find in File" that focuses Monaco search
- **FR5.8**: Update indicator - badge in header when app update available (requires Tauri updater plugin)
- **FR5.9**: Group command palette commands by category with section headers

### FR6: Accessibility Improvements

- **FR6.1**: Add ARIA live region to toast container (role="status", aria-live="polite")
- **FR6.2**: Ensure all command palette items have visible focus styles
- **FR6.3**: Ensure all sidebar config items have visible focus styles not relying on color alone
- **FR6.4**: Verify Modal focus trap and restore on close
- **FR6.5**: Apply reduce-motion class globally and immediately when toggled
- **FR6.6**: Add aria-label to all remaining icon-only buttons
- **FR6.7**: Ensure MCP tool list items have keyboard navigation support

### FR7: Performance UX

- **FR7.1**: Enhance "Reduce Motion" setting to also disable blur effects (combined performance mode)
- **FR7.2**: Add skeleton loaders for MCP server list while loading
- **FR7.3**: Add skeleton loaders for MCP tool status list while loading
- **FR7.4**: Show "Loading configuration..." label in MCP header when isLoading
- **FR7.5**: Standardize easing curves across all animations (ease-out, consistent durations)
- **FR7.6**: Reduce/remove backdrop-blur when reduce-motion is enabled

## Non-Functional Requirements

- **NFR1**: All changes must maintain app startup time < 2 seconds
- **NFR2**: No new runtime dependencies (use existing libraries)
- **NFR3**: TypeScript strict mode compliance for all new code
- **NFR4**: Support both dark and light themes for all new components
- **NFR5**: Keyboard shortcuts must not conflict with OS/Monaco defaults
- **NFR6**: WCAG AA contrast compliance for all text elements
- **NFR7**: Tauri updater integration should be optional/graceful degradation

## Acceptance Criteria

1. Auto-save no longer shows toast notifications; status bar displays last auto-save time
2. Status bar shows cursor position (Ln X, Col Y) and total lines separately
3. Format button is disabled with explanatory tooltip for non-JSON formats
4. External file reload shows confirmation when local changes exist
5. Versions tab and backup modal both offer "Compare" action with diff view
6. Keyboard shortcuts modal lists all available shortcuts organized by category
7. Key buttons show inline shortcut hints (Save, Settings, etc.)
8. Command palette has visible trigger button in header
9. Quick Open (Ctrl+P) opens config-filtered search mode
10. Recent files appear in command palette under "Recent" section
11. Welcome screen includes Power Features section with MCP, Versions, Backups
12. MCP panel has empty state with clear call-to-action when no servers
13. Toast container announces messages to screen readers
14. Reduce Motion setting also disables blur effects throughout app
15. All text meets minimum 12px size (except non-essential meta labels)
16. Visual hierarchy is cleaner with reduced gradients/glows on secondary elements

## Out of Scope

- Multi-tab editor interface (significant architectural change)
- Full Storybook documentation
- E2E testing infrastructure
- Internationalization/localization
- Cloud sync or telemetry features
- Major layout restructuring
- File watcher improvements (separate track)
