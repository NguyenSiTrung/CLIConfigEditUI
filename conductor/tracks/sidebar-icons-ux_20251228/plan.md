# Plan: Sidebar Icon UX Improvements

## Phase 1: Icon Container Foundation

### Task 1.1: Create IconContainer Component
- [x] Create `src/components/ui/icon-container.tsx` component
- [x] Implement props: `size`, `active`, `accent`, `children`
- [x] Add default styling: `w-6 h-6 rounded-lg flex items-center justify-center`
- [x] Add theme-aware backgrounds: `bg-slate-100 dark:bg-slate-800`
- [x] Add active state styling using accent colors
- [x] Add hover scale transform animation

### Task 1.2: Unit Tests for IconContainer
- [x] Write tests for default rendering
- [x] Write tests for active state styling
- [x] Write tests for different accent colors
- [x] Write tests for dark mode class application

### Task 1.3: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Brand Icons Creation

### Task 2.1: Create Brand Icon Components
- [x] Create `src/constants/brand-icons.tsx` for complex SVG icons
- [x] Implement Claude Code icon (Anthropic sunburst)
- [x] Implement Gemini CLI icon (4-pointed star gradient)
- [x] Implement Amp icon (lightning bolt)
- [x] Implement GitHub Copilot icon (glasses)
- [x] Implement Cursor icon (Cursor IDE logo)
- [x] Implement Droid icon (robot)
- [x] Implement Auggie icon (AI assistant)
- [x] Implement Rovo Dev icon (Atlassian style)
- [x] Implement Kilo Code CLI icon (terminal style)
- [x] Implement OpenCode icon (improved symbol)

### Task 2.2: Create Platform Icon Components
- [x] Update VS Code icon with official colors
- [x] Create Windsurf icon (Codeium style)
- [x] Update Antigravity icon

### Task 2.3: Update TOOL_ICONS Mapping
- [x] Replace generic Lucide icons with brand icons in `tool-icons.tsx`
- [x] Update PLATFORM_ICONS with new platform icons
- [x] Ensure all icons render at consistent `w-4 h-4` size

### Task 2.4: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Sidebar Component Integration

### Task 3.1: Update CollapsibleTreeItem
- [x] Wrap icon prop with IconContainer component
- [x] Pass active state and accent to container
- [x] Adjust spacing/gap if needed for new container size

### Task 3.2: Update SidebarToolItem
- [x] Integrate IconContainer for CLI tool icons
- [x] Verify active/hover states work correctly

### Task 3.3: Update CustomToolsSection
- [x] Integrate IconContainer for custom tool icons
- [x] Handle emoji icons within container
- [x] Verify drag-and-drop still works

### Task 3.4: Update IdeExtensionsSection
- [x] Integrate IconContainer for platform icons
- [x] Integrate IconContainer for extension icons
- [x] Maintain existing color coding

### Task 3.5: Visual Testing
- [x] Verify all sections display correctly in light mode
- [x] Verify all sections display correctly in dark mode
- [x] Test active states across all tool types
- [x] Test hover animations

### Task 3.6: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase 4: Enhanced IconPicker

### Task 4.1: Create AI Presets Data
- [x] Create `src/constants/icon-presets.tsx`
- [x] Define preset icons for: Aider, Continue, Cody, Tabnine, Codeium, Amazon Q, Sourcery, Sweep, Mentat
- [x] Include icon component and label for each

### Task 4.2: Create Lucide Icons Selection
- [x] Define curated list of ~40 relevant Lucide icons
- [x] Categories: Terminal, Code, Server, Database, Cloud, Cog, etc.
- [x] Create icon name to component mapping

### Task 4.3: Expand Emoji Set
- [x] Expand emoji options from 18 to 50+
- [x] Organize into categories: Tools, Tech, Symbols, Objects, Nature
- [x] Create category data structure

### Task 4.4: Redesign IconPicker Component
- [x] Add tab navigation (AI Presets | Icons | Emojis)
- [x] Implement AI Presets tab with grid layout
- [x] Implement Lucide Icons tab with search and grid
- [x] Implement Emojis tab with category sections
- [x] Add search/filter functionality for icons
- [x] Maintain popover positioning logic

### Task 4.5: Update CustomTool Type and Storage
- [x] Extend CustomTool type to support icon type (emoji | lucide | preset)
- [x] Update Zustand store serialization if needed
- [x] Ensure backward compatibility with existing emoji icons

### Task 4.6: IconPicker Tests
- [ ] Write tests for tab navigation
- [ ] Write tests for icon selection callback
- [ ] Write tests for search functionality
- [ ] Write tests for backward compatibility

### Task 4.7: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

---

## Phase 5: Polish and Quality Assurance

### Task 5.1: Cross-Section Consistency Review
- [x] Verify icon sizes consistent across all sections
- [x] Verify container styles match across components
- [x] Verify accent colors applied correctly

### Task 5.2: Accessibility Audit
- [x] Check color contrast ratios
- [x] Verify focus states on IconPicker
- [x] Test keyboard navigation in IconPicker

### Task 5.3: Performance Check
- [x] Verify no jank in sidebar scrolling
- [x] Check IconPicker render performance
- [x] Profile component re-renders

### Task 5.4: Final Testing
- [x] Run `pnpm typecheck` - no errors
- [x] Run `pnpm lint` - no warnings
- [x] Run `pnpm test` - IconContainer tests pass (15 tests)
- [x] Manual testing in Tauri dev mode

### Task 5.5: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)
