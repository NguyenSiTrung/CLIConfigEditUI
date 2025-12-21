# Plan: Config File Dropdown Menu UI Bugs

## Phase 1: Investigation & Root Cause Analysis

- [x] Task: Analyze config-file-item.tsx dropdown implementation
  - [x] Identify overflow/clipping issue causing Delete button to be hidden
    - Root cause: `absolute right-0 top-full` menu inside parent with overflow-y-auto
  - [x] Identify the fixed overlay blocking sidebar scroll
    - Root cause: `fixed inset-0 z-10` overlay blocks all page interactions
  
- [x] Task: Check if same issue exists in tool-actions-menu.tsx
  - [x] Compare implementations between the two menu components
    - Same issues in both files (line 94-97 overlay, absolute positioning)

## Phase 2: Fix Delete Button Visibility

- [x] Task: Fix dropdown menu clipping issue
  - [x] Ensure menu container has proper overflow-visible settings
    - Used React Portal to render menu at document.body level
  - [x] Verify z-index stacking allows menu to render above parent containers
    - Changed to fixed positioning with z-50
  - [x] Test menu positioning at various scroll positions
    - Menu position calculated from button's getBoundingClientRect()

## Phase 3: Fix Sidebar Scroll Blocking

- [x] Task: Refactor backdrop overlay approach
  - [x] Replace `fixed inset-0` overlay with click-outside detection
    - Removed blocking overlay, using mousedown event listener
  - [x] Use event listener approach instead of blocking overlay
    - Added handleClickOutside with proper ref checks
  - [x] Preserve Escape key to close functionality
    - Kept existing Escape key handler

- [x] Task: Verify scroll behavior
  - [x] Sidebar scrolls while menu is open
    - No blocking overlay, scroll works
  - [x] Scrolling closes the menu gracefully
    - Added scroll event listener that closes menu

## Phase 4: Testing & Verification

- [x] Task: Manual verification
  - [x] Test in CLI Tools section - both Edit and Delete visible
  - [x] Test in Custom Tools section - both Edit and Delete visible
  - [x] Test sidebar scroll with menu open
  - [x] Test in light and dark themes
  
- [x] Task: Code quality checks
  - [x] Run `pnpm typecheck`
  - [x] Run `pnpm lint`
  - [x] Verify no regressions in menu close behavior (click outside, Escape key)
