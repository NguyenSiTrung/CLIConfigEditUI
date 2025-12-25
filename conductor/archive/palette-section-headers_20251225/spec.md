# Spec: Command Palette Section Headers UI/UX Improvement

## Overview

Improve the visual design and user experience of section headers (category titles) in the Command Palette and Keyboard Shortcuts Modal. The current implementation has poor visual hierarchy, cramped spacing, and inconsistent styling that makes it difficult to quickly scan and navigate commands.

## Functional Requirements

### FR-1: Command Palette Section Headers
Redesign section headers in `command-palette.tsx` with:
- **Typography**: Increase font size from `text-[10px]` to `text-xs` (12px)
- **Visual hierarchy**: Add icon prefix matching each category (similar to keyboard shortcuts modal)
- **Spacing**: Increase vertical padding and add top margin between sections
- **Sticky behavior**: Maintain sticky positioning with improved background/blur for clarity
- **Color/contrast**: Use stronger text color that differentiates from command items

### FR-2: Visual Style
Apply modern minimal design with VS Code influences:
- Category icons from Lucide (Clock for Recent, Compass for Navigation, Wrench for Tools, Settings for Settings)
- Subtle bottom border or separator line
- Consistent with existing indigo accent theme
- Proper dark/light mode support

### FR-3: Keyboard Shortcuts Modal Consistency
Update `keyboard-shortcuts-modal.tsx` section headers to use the same styling pattern as the improved command palette for visual consistency across the app.

## Non-Functional Requirements

- **NFR-1**: No performance regression - section grouping logic remains unchanged
- **NFR-2**: Maintain keyboard navigation functionality
- **NFR-3**: Support both dark and light themes
- **NFR-4**: Accessible contrast ratios (WCAG AA minimum)

## Acceptance Criteria

- [ ] Section headers are clearly distinguishable from command items
- [ ] Each category displays an appropriate icon prefix
- [ ] Spacing between sections provides clear visual separation
- [ ] Headers remain sticky when scrolling long lists
- [ ] Both command palette and keyboard shortcuts modal share consistent styling
- [ ] No visual regressions in dark or light mode
- [ ] Keyboard navigation (arrow keys, enter, escape) still works correctly

## Out of Scope

- Command palette search/filter functionality changes
- Adding new command categories
- Modifying command item styling (only headers)
- Changes to Quick Open mode layout
