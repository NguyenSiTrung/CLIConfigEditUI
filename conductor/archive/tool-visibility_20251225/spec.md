# Spec: Tool Visibility & Favorites

## Overview

Add the ability to pin, hide, and reorder CLI tools in the sidebar for a personalized, clutter-free experience. Users with many tools (10+) can focus on their frequently used tools while hiding rarely used ones.

## Functional Requirements

### FR-1: Pin/Unpin Tools
- Users can pin tools to mark them as favorites
- Pinned tools always appear at the **top** of the sidebar list
- Pinned tools are separated from unpinned tools with a visual divider
- Pinned tools maintain their relative custom order among themselves

### FR-2: Hide/Show Tools
- Users can hide tools they don't use
- Hidden tools are completely removed from the sidebar by default
- A **toggle button** in the sidebar header reveals/hides hidden tools
- When revealed, hidden tools appear greyed out at the bottom
- Hidden tools can be unhidden via hover controls

### FR-3: Custom Ordering (Drag-and-Drop)
- Users can drag-and-drop tools to reorder them within their section
- Pinned tools can be reordered among pinned tools
- Unpinned (visible) tools can be reordered among themselves
- Order persists across app restarts

### FR-4: Hover Controls
- Hovering over a tool item reveals action icons:
  - **Pin/Unpin** icon (e.g., pin/star icon)
  - **Hide/Show** icon (e.g., eye/eye-off icon)
- Icons appear on the right side of the tool item
- Clicking an icon triggers the action immediately

### FR-5: Persistence
- Pin state, visibility state, and custom order are saved to Zustand persisted store
- Settings apply to both predefined and custom tools
- New tools added later appear unpinned and visible at the end of the list

## Non-Functional Requirements

### NFR-1: Performance
- Drag-and-drop must feel responsive (<16ms frame time)
- State changes should not cause full sidebar re-render

### NFR-2: Accessibility
- Hover controls should have appropriate aria labels
- Drag-and-drop should have keyboard alternative (future consideration)

## Acceptance Criteria

1. **AC-1:** User can hover over a tool and see pin/hide icons
2. **AC-2:** Clicking pin icon moves the tool to the "Pinned" section at the top
3. **AC-3:** Clicking hide icon removes the tool from the visible list
4. **AC-4:** Header toggle button shows/hides the hidden tools section
5. **AC-5:** User can drag a tool to reorder it within its section
6. **AC-6:** All preferences (pinned, hidden, order) persist after app restart
7. **AC-7:** Visual separator exists between pinned and unpinned sections

## Out of Scope

- Keyboard-only drag-and-drop reordering
- Import/export of tool visibility settings
- Per-config-file visibility (settings are global)
- Search/filter tools by name
