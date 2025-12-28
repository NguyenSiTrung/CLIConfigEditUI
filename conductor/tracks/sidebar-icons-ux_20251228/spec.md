# Spec: Sidebar Icon UX Improvements

## Overview

Enhance the CLI tool icons in the left sidebar to improve visual hierarchy, brand recognition, and user customization. This includes adding rounded-square icon containers, official brand SVG logos for all detected tools, improved platform icons, and an expanded IconPicker for custom tools.

## Functional Requirements

### FR-1: Icon Containers
- Wrap all sidebar tool icons in a consistent rounded-square container
- Container size: `w-6 h-6` (24x24px) with `rounded-lg` corners
- Icon size: `w-4 h-4` (16x16px) centered within container
- Default background: `bg-slate-100 dark:bg-slate-800`
- Active state: Use accent color background (e.g., `bg-indigo-100 dark:bg-indigo-500/10`)
- Apply to: CLI Tools, Custom Tools, IDE Platforms, IDE Extensions

### FR-2: Brand Icons for CLI Tools
Create/integrate recognizable brand SVG icons for all detected CLI tools:
- **Claude Code** - Anthropic sunburst logo (coral/orange)
- **Gemini CLI** - Google 4-pointed star gradient
- **Amp** - Sourcegraph lightning bolt (red/coral)
- **GitHub Copilot** - Copilot glasses icon
- **Cursor** - Cursor IDE logo
- **OpenCode** - Existing symbol or improved icon
- **Droid** - Android-style robot icon
- **Qwen Code** - Keep existing custom SVG
- **Auggie** - AI assistant icon
- **Kiro CLI** - Keep existing custom SVG
- **Rovo Dev** - Atlassian-style icon
- **Kilo Code CLI** - Terminal-based icon

### FR-3: Platform Icons Enhancement
Improve IDE platform icons with recognizable brand styling:
- **VS Code** - Official VS Code logo colors
- **Cursor** - Cursor IDE brand icon
- **Windsurf** - Codeium Windsurf icon
- **Antigravity** - Appropriate brand representation

### FR-4: Enhanced IconPicker for Custom Tools
Redesign IconPicker with three selection modes:

#### FR-4.1: AI Tool Presets Tab
- Pre-built icons for common unlisted AI tools
- Include: Aider, Continue, Cody, Tabnine, Codeium, Amazon Q, etc.
- Display as grid with tool names

#### FR-4.2: Lucide Icons Tab
- Searchable grid of relevant Lucide icons
- Categories: Terminal, Code, Server, Database, Cloud, Settings, etc.
- Show ~30-50 most relevant icons for CLI tools

#### FR-4.3: Emoji Tab
- Expand from 18 to 50+ emojis
- Organize by category: Tools, Tech, Symbols, Objects
- Keep existing emoji options plus new additions

### FR-5: Visual Consistency
- All icon containers use same dimensions and border-radius
- Consistent hover states with subtle scale transform
- Active indicators work with new container design
- Maintain existing accent color system (indigo, violet, emerald, amber)

## Non-Functional Requirements

### NFR-1: Performance
- SVG icons should be inline React components (no external fetches)
- IconPicker should render efficiently with virtualization if needed
- No visible jank when expanding/collapsing sidebar sections

### NFR-2: Accessibility
- Icon containers must have sufficient color contrast (4.5:1 ratio)
- Focus states visible on all interactive elements
- Icons paired with text labels (already in place)

### NFR-3: Dark Mode
- All icons must be visible in both light and dark themes
- Brand colors should adapt or use theme-appropriate variants
- Container backgrounds use theme-aware colors

## Acceptance Criteria

1. [ ] All CLI tool icons display within rounded-square containers
2. [ ] Each detected CLI tool shows a recognizable brand icon
3. [ ] IDE platform icons are visually improved
4. [ ] IconPicker has three tabs: AI Presets, Lucide, Emojis
5. [ ] IconPicker emoji selection expanded to 50+ options
6. [ ] Lucide icon selection includes 30+ relevant icons
7. [ ] Active/hover states work correctly with new containers
8. [ ] Dark mode displays all icons correctly
9. [ ] No TypeScript errors or ESLint warnings
10. [ ] Visual consistency across all sidebar sections

## Out of Scope

- Custom image upload for icons
- Icon color customization per-tool
- Animated icons
- Icon caching/persistence beyond existing custom tool storage
- Changes to sidebar layout or section structure
