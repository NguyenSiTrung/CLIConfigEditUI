# Spec: Comprehensive UI/UX Polish

## Overview

A comprehensive UI/UX overhaul for CLI Config Editor following a "Premium Dark Mode with VS Code Sensibility" design direction. This track addresses visual inconsistencies, improves light mode parity, refines micro-interactions, and establishes a cohesive design language across all components.

### Design Direction
- **Premium Dark Mode**: Rich dark theme with subtle gradients, depth through shadows, vibrant indigo/purple accents
- **VS Code Inspired**: Native-feeling, developer-familiar patterns, refined but purposeful (not flashy)
- **Glassmorphism**: Consistent application of existing glass utilities for depth and hierarchy

### Priority Pain Points
1. **Modal Inconsistency**: Unify color system (eliminate `gray-*` vs `slate-*` mixing)
2. **Light Mode Parity**: Elevate light mode to match dark mode quality
3. **Sidebar Hierarchy**: Improve visual separation and reduce density

---

## Functional Requirements

### FR-1: Design System Unification

#### FR-1.1: Color Palette Standardization
- Standardize on `slate-*` color scale throughout (remove `gray-*` usage)
- Define semantic color tokens for consistent application:
  - `surface-primary`: Main backgrounds
  - `surface-elevated`: Cards, modals, dropdowns
  - `surface-overlay`: Backdrop overlays
  - `border-subtle`, `border-default`, `border-strong`
  - `text-primary`, `text-secondary`, `text-muted`

#### FR-1.2: Component Consistency
- Unify Button component usage across all modals and panels
- Standardize Input styling (some use custom styles, others use Input component)
- Ensure all modals use the base Modal component with consistent footer alignment

### FR-2: Modal System Refinement

#### FR-2.1: Visual Consistency
- All modals use `dark:bg-slate-800` (not `gray-800`)
- Consistent border styling: `border-slate-200 dark:border-slate-700`
- Unified header/footer padding and spacing
- Consistent close button positioning and styling

#### FR-2.2: Animation Polish
- Smooth enter/exit transitions using defined animation constants
- Backdrop fade synchronized with modal scale
- Focus trap with visible focus ring on first focusable element

### FR-3: Sidebar Improvements

#### FR-3.1: Visual Hierarchy
- Increase spacing between tool sections
- Add subtle dividers with proper opacity
- Improve active/selected state visibility
- Better differentiation between tool items and config file items

#### FR-3.2: Hover States
- Refined hover backgrounds with subtle transitions
- Clear affordance for interactive elements
- Hover reveal for action buttons (already exists, refine timing)

### FR-4: Light Mode Enhancement

#### FR-4.1: Surface Depth
- Add subtle shadows for elevation in light mode
- Use gradient backgrounds for visual interest (not flat white)
- Proper contrast ratios for all text elements

#### FR-4.2: Accent Colors
- Ensure indigo accents are vibrant but not harsh in light mode
- Adjust hover/active states for light mode legibility
- Light mode glass effects (subtle, not washed out)

### FR-5: Micro-interactions & Animations

#### FR-5.1: Standardized Transitions
- Apply `--duration-hover` (150ms) consistently to all interactive elements
- Use `--easing-default` for standard transitions
- Use `--easing-smooth` for emphasis animations

#### FR-5.2: Feedback Improvements
- Button press feedback (subtle scale on active)
- Loading states with consistent spinner styling
- Toast animations refined (enter from bottom-right, exit smoothly)

### FR-6: Editor Area Polish

#### FR-6.1: Status Bar Refinement
- Improve visual grouping of status bar items
- Add subtle separators between info groups
- Better hover states for interactive elements (keyboard shortcuts button, copy path)

#### FR-6.2: Tab System
- Refine Editor/Versions tab styling
- Active tab indicator more prominent
- Smooth transition between tabs

### FR-7: Header & Navigation

#### FR-7.1: View Tabs Polish
- More prominent active state indicator
- Subtle hover preview effect
- Keyboard navigation focus visibility

#### FR-7.2: Action Buttons
- Consistent icon button sizing
- Unified hover/focus states
- Better visual grouping of related actions

### FR-8: MCP Settings Panel

#### FR-8.1: Section Cards
- Consistent card styling with proper elevation
- Better visual separation between sections
- Refined "How it works" collapsible styling

#### FR-8.2: Server List & Tool Status
- Improve list item hover states
- Better action button visibility
- Consistent badge/tag styling

---

## Non-Functional Requirements

### NFR-1: Performance
- No increase in initial load time
- Animations must not cause jank (use `transform` and `opacity` only)
- Respect `prefers-reduced-motion` setting

### NFR-2: Accessibility
- All interactive elements have visible focus states
- Focus rings use `ring-2 ring-indigo-500/50` consistently
- Color contrast meets WCAG AA standards
- Keyboard navigation works for all new interactions

### NFR-3: Maintainability
- Use Tailwind utility classes (avoid custom CSS where possible)
- Document any new CSS custom properties
- Component changes should not break existing tests

---

## Acceptance Criteria

### Visual Consistency
- [ ] No `gray-*` color classes remain in codebase (all converted to `slate-*`)
- [ ] All modals have identical header/footer styling
- [ ] All buttons use the Button component or match its styling

### Light Mode
- [ ] Light mode has visible depth (shadows, gradients)
- [ ] All text meets contrast requirements in light mode
- [ ] Glass effects work appropriately in light mode

### Sidebar
- [ ] Clear visual hierarchy between sections, tools, and config files
- [ ] Active/selected states are immediately visible
- [ ] Spacing feels balanced, not cramped

### Animations
- [ ] All hover transitions use consistent timing (150ms)
- [ ] Modal open/close is smooth
- [ ] No animation jank on any component

### Accessibility
- [ ] Tab navigation works through all interactive elements
- [ ] Focus states are visible on all focusable elements
- [ ] Reduced motion preference is respected

---

## Out of Scope

- **New features**: This track is polish-only, no new functionality
- **Major layout changes**: Keep existing layout structure
- **Icon changes**: Keep Lucide icon set as-is
- **Font changes**: Keep Inter as primary font
- **Breaking API changes**: Component props remain compatible
- **Mobile responsiveness**: Desktop-first application, mobile not in scope
