# Plan: Sidebar Drag-and-Drop Reordering

## Phase 1: Setup & Dependencies

- [ ] Task: Install @dnd-kit packages
  - [ ] Add @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities to dependencies
  - [ ] Verify bundle size impact meets NFR-3 (< 15kb gzipped)

## Phase 2: Extend Store for Custom Tools Ordering

- [ ] Task: Add customToolOrder state to tool-visibility-store
  - [ ] Write test for customToolOrder persistence
  - [ ] Add customToolOrder: string[] state
  - [ ] Add reorderCustomTools(toolIds: string[]) action
  - [ ] Update partialize to persist customToolOrder
  - [ ] Verify tests pass

## Phase 3: Create Draggable Tool Item Component

- [ ] Task: Create DraggableToolItem wrapper component
  - [ ] Write component test for drag handle visibility on hover
  - [ ] Implement useSortable hook integration
  - [ ] Add drag handle (⋮⋮) icon with hover visibility
  - [ ] Style dragged item with scale(1.02) and shadow
  - [ ] Verify tests pass

## Phase 4: Implement CLI Tools Section DnD

- [ ] Task: Wrap CLI Tools list with DndContext and SortableContext
  - [ ] Write integration test for reorder persistence
  - [ ] Add DndContext provider to cli-tools-section
  - [ ] Implement onDragEnd handler to call reorderTools
  - [ ] Add drop indicator styling
  - [ ] Verify smooth animation (SortableContext)
  - [ ] Verify tests pass

## Phase 5: Implement Custom Tools Section DnD

- [ ] Task: Wrap Custom Tools list with DndContext and SortableContext
  - [ ] Write integration test for custom tools reorder
  - [ ] Add DndContext provider to custom-tools-section
  - [ ] Implement onDragEnd handler to call reorderCustomTools
  - [ ] Apply same visual styling as CLI Tools
  - [ ] Verify tests pass

## Phase 6: Polish & Verification

- [ ] Task: Visual polish and edge cases
  - [ ] Test interaction with pinned/hidden tools
  - [ ] Ensure drag handle doesn't interfere with context menu
  - [ ] Verify keyboard accessibility still works
  - [ ] Test persistence across app restart

- [ ] Task: Code quality checks
  - [ ] Run pnpm typecheck
  - [ ] Run pnpm lint
  - [ ] Run pnpm test
  - [ ] Run cargo clippy (if backend changes)

- [ ] Task: Conductor - User Manual Verification 'Phase 6' (Protocol in workflow.md)
