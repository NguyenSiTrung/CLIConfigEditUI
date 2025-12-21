# Spec: Config File Dropdown Menu UI Bugs

## Overview

Two related UI bugs in the config file dropdown menu (3-dot menu) within the sidebar affect usability:

1. **Delete button hidden/cut off**: The dropdown menu's Delete button is visually obscured or outside the visible area
2. **Sidebar scroll blocked**: When the dropdown is open, the sidebar becomes completely unscrollable

These bugs occur in both CLI Tools and Custom Tools sections when clicking the menu button (⋮) on any config file item.

## Functional Requirements

### FR-1: Delete Button Visibility
- The dropdown menu MUST display both "Edit" and "Delete" buttons fully visible
- The menu MUST not be clipped by parent container overflow settings
- The menu MUST render above all other elements with proper z-index

### FR-2: Sidebar Scroll While Menu Open
- Users MUST be able to scroll the sidebar while the dropdown menu is open
- Scrolling outside the menu area SHOULD close the menu (expected behavior)
- The backdrop overlay MUST NOT block scroll events on the sidebar content

## Non-Functional Requirements

- Fix must apply consistently across CLI Tools and Custom Tools sections
- No visual regressions to existing dropdown styling
- Menu should close when clicking outside or pressing Escape (preserve existing behavior)

## Acceptance Criteria

- [ ] Open any config file's 3-dot menu → Both "Edit" and "Delete" buttons are fully visible
- [ ] Open menu → Attempt to scroll sidebar → Scroll works (menu may close, which is acceptable)
- [ ] Menu positioning works correctly regardless of where the config file is in the list
- [ ] Verify in both light and dark themes

## Out of Scope

- Adding new menu actions
- Changing menu styling/design
- Touch device interactions
