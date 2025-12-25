# Spec: Sidebar Expand/Collapse State Persistence

## Overview

Improve the CLI Tools sidebar UX by persisting the expand/collapse state of each tool item. Currently, all items auto-expand on app load, which clutters the UI. The app should remember which items were expanded/collapsed and restore that state on next launch.

## Functional Requirements

### FR-1: Persist Expand/Collapse State
- Store the expand/collapse state for each CLI tool item
- Use localStorage as primary storage for quick access
- Use Tauri file-based storage as backup for robustness
- Sync both storage mechanisms on state change

### FR-2: Restore State on App Load
- On app startup, read persisted state from localStorage (or Tauri backup if unavailable)
- Apply saved expand/collapse state to each sidebar tool item
- New/unknown tools default to **collapsed** state

### FR-3: Expand All / Collapse All Buttons
- Add "Expand All" and "Collapse All" buttons in the sidebar header area
- Clicking "Expand All" expands all tool items
- Clicking "Collapse All" collapses all tool items
- Both actions persist the new state

## Non-Functional Requirements

- State restoration should be instant (no visible delay on startup)
- Storage format should handle tool additions/removals gracefully

## Acceptance Criteria

1. ✅ When user collapses a tool and restarts app, that tool remains collapsed
2. ✅ When user expands a tool and restarts app, that tool remains expanded
3. ✅ Newly detected tools appear collapsed by default
4. ✅ "Expand All" button expands all tools and persists state
5. ✅ "Collapse All" button collapses all tools and persists state
6. ✅ State persists even if localStorage is cleared (Tauri backup)

## Out of Scope

- Persisting scroll position in sidebar
- Persisting selected config file across restarts
- Animating expand/collapse transitions (unless already implemented)
