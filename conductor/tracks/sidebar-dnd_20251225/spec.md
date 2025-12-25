# Spec: Sidebar Drag-and-Drop Reordering

## Overview

Enable users to reorder CLI Tools and Custom Tools in the sidebar via drag-and-drop, providing an intuitive way to organize their frequently used configurations.

## Functional Requirements

### FR-1: Drag-and-Drop Interaction
- Users can drag items within the **CLI Tools** section to reorder them
- Users can drag items within the **Custom Tools** section to reorder them
- Dragging between sections is NOT supported (items stay within their section)
- Drag is initiated via a dedicated drag handle icon (⋮⋮), not the entire row

### FR-2: Visual Feedback
- **Drag handle**: Visible on hover, grip icon (⋮⋮) on the left side of each item
- **Dragged item**: Slight scale-up (1.02x) with drop shadow for elevation effect
- **Drop indicator**: Horizontal line showing exact insertion position
- **Reorder animation**: Smooth transition as items slide to make room

### FR-3: Persistence
- Reordered positions persist across app restarts
- Uses existing `toolOrder` state in `tool-visibility-store` (Zustand + localStorage)
- Order is preserved per-section (CLI Tools order separate from Custom Tools order)

### FR-4: Accessibility
- Keyboard support for reordering (already exists via move up/down in context menu)
- Screen reader announcements for drag operations

## Non-Functional Requirements

- **NFR-1**: Drag animation must be smooth (60fps)
- **NFR-2**: Use @dnd-kit/core library for implementation
- **NFR-3**: Bundle size impact < 15kb gzipped

## Acceptance Criteria

- [ ] Drag handle appears on hover for each tool item
- [ ] Dragging an item shows scale/shadow effect
- [ ] Drop indicator line shows insertion point while dragging
- [ ] Releasing item places it at the indicated position
- [ ] Items animate smoothly during reorder
- [ ] New order persists after app restart
- [ ] CLI Tools and Custom Tools maintain separate ordering
- [ ] Existing pin/hide functionality continues to work alongside drag-drop

## Out of Scope

- Drag-and-drop between CLI Tools and Custom Tools sections
- Drag-and-drop to reorder config files within a tool
- Touch/mobile gestures (desktop-first, but @dnd-kit provides this free)
- Undo/redo for reordering
