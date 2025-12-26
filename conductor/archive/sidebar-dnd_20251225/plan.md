# Plan: Sidebar Drag-and-Drop Reordering

## Phase 1: Setup & Dependencies

- [x] Task: Install @dnd-kit packages
  - [x] Add @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities to dependencies
  - [x] Verify bundle size impact meets NFR-3 (< 15kb gzipped)

## Phase 2: Extend Store for Custom Tools Ordering

- [x] Task: Add customToolOrder state to tool-visibility-store
  - [x] Write test for customToolOrder persistence
  - [x] Add customToolOrder: string[] state
  - [x] Add reorderCustomTools(toolIds: string[]) action
  - [x] Update partialize to persist customToolOrder
  - [x] Verify tests pass

## Phase 3: Create Draggable Tool Item Component

- [x] Task: Create DraggableToolItem wrapper component (already exists as SortableToolItem)
  - [x] Write component test for drag handle visibility on hover
  - [x] Implement useSortable hook integration
  - [x] Add drag handle (⋮⋮) icon with hover visibility
  - [x] Style dragged item with scale(1.02) and shadow
  - [x] Verify tests pass

## Phase 4: Implement CLI Tools Section DnD

- [x] Task: Wrap CLI Tools list with DndContext and SortableContext (already implemented)
  - [x] Write integration test for reorder persistence
  - [x] Add DndContext provider to cli-tools-section
  - [x] Implement onDragEnd handler to call reorderTools
  - [x] Add drop indicator styling
  - [x] Verify smooth animation (SortableContext)
  - [x] Verify tests pass

## Phase 5: Implement Custom Tools Section DnD

- [x] Task: Wrap Custom Tools list with DndContext and SortableContext
  - [x] Write integration test for custom tools reorder
  - [x] Add DndContext provider to custom-tools-section
  - [x] Implement onDragEnd handler to call reorderCustomTools
  - [x] Apply same visual styling as CLI Tools
  - [x] Verify tests pass

## Phase 6: Polish & Verification

- [x] Task: Visual polish and edge cases
  - [x] Test interaction with pinned/hidden tools
  - [x] Ensure drag handle doesn't interfere with context menu
  - [x] Verify keyboard accessibility still works
  - [x] Test persistence across app restart

- [x] Task: Code quality checks
  - [x] Run pnpm typecheck
  - [x] Run pnpm lint
  - [x] Run pnpm test
  - [x] Run cargo clippy (if backend changes)

- [x] Task: Conductor - User Manual Verification 'Phase 6' (Protocol in workflow.md)
