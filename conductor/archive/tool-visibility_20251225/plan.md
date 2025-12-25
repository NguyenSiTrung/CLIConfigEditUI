# Plan: Tool Visibility & Favorites

## Phase 1: State Management & Persistence

- [x] Task 1.1: Define TypeScript types for tool visibility state
  - [x] Add `ToolVisibilityState` interface (pinned, hidden, order arrays)
  - [x] Add action types for pin/unpin, hide/show, reorder

- [x] Task 1.2: Create Zustand store for tool visibility
  - [x] Write tests for store actions (pin, unpin, hide, show, reorder)
  - [x] Implement `useToolVisibilityStore` with persistence
  - [x] Test persistence across page reload

- [x] Task 1.3: Integrate visibility store with existing tool list
  - [x] Write tests for sorted/filtered tool list selector
  - [x] Implement selector that returns tools in correct order (pinned first, then visible, hidden last)
  - [x] Filter out hidden tools by default

## Phase 2: Hover Controls UI

- [x] Task 2.1: Create hover action icons component
  - [x] Write tests for `ToolHoverActions` component
  - [x] Implement pin/unpin icon button (toggle state)
  - [x] Implement hide/show icon button (toggle state)
  - [x] Style with Tailwind (opacity transitions, positioning)

- [x] Task 2.2: Integrate hover controls into sidebar tool items
  - [x] Modify existing tool item component to show hover actions
  - [x] Test hover state triggers visibility of action icons
  - [x] Connect icon clicks to store actions

## Phase 3: Sidebar Layout & Visual Sections

- [x] Task 3.1: Add visual separator between pinned and unpinned sections
  - [x] Create `SectionDivider` component with subtle styling
  - [x] Render divider only when pinned tools exist

- [x] Task 3.2: Implement hidden tools toggle in sidebar header
  - [x] Add eye icon toggle button to sidebar header
  - [x] Write tests for toggle state behavior
  - [x] When enabled, show hidden tools section (greyed out)

- [x] Task 3.3: Style hidden tools appearance
  - [x] Apply reduced opacity to hidden tool items
  - [x] Show "eye-off" indicator on hidden items
  - [x] Hover controls on hidden items show "unhide" action

## Phase 4: Drag-and-Drop Reordering

- [x] Task 4.1: Add drag-and-drop library or native implementation
  - [x] Evaluate: native HTML5 DnD vs lightweight library (dnd-kit)
  - [x] Install and configure chosen solution

- [x] Task 4.2: Implement drag-and-drop for tool items
  - [x] Add drag handle or make entire item draggable
  - [x] Implement drop zones within sections (pinned, unpinned)
  - [x] Prevent dragging across sections (pinned ↔ unpinned)

- [x] Task 4.3: Connect drag-and-drop to store
  - [x] Write tests for reorder action
  - [x] Update order array on drop
  - [x] Verify persistence of new order

## Phase 5: Testing & Polish

- [x] Task 5.1: Integration testing
  - [x] Test full flow: pin → reorder → hide → persist → reload
  - [x] Test with 10+ tools to verify performance

- [x] Task 5.2: Edge cases
  - [x] Handle new tools added after custom order exists
  - [x] Handle deleted custom tools in order array
  - [x] Ensure predefined and custom tools work identically

- [x] Task 5.3: Final polish
  - [x] Verify hover icons don't conflict with existing click behavior
  - [x] Test keyboard navigation still works
  - [x] Run typecheck, lint, and all tests

- [x] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
