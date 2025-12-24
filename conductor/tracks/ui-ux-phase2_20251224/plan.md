# Plan: UI/UX Improvements Phase 2

## Phase 1: Toast & Feedback System

### Task 1.1: Silent Auto-Save
- [x] Modify ConfigEditor auto-save effect to skip toast.success call
- [x] Add lastAutoSaved timestamp display in status bar with formatting
- [x] Add subtle fade animation for auto-save indicator update
- [x] Test auto-save triggers status bar update without toast

### Task 1.2: Status Bar Cursor Position
- [x] Wire Monaco editor onDidChangeCursorPosition event
- [x] Store cursor line and column in component state
- [x] Update status bar to show "Ln X, Col Y" format
- [x] Keep total lines display as "{lineCount} lines"
- [x] Test cursor position updates on navigation and typing

### Task 1.3: Format Button Improvements
- [x] Add disabled state to Format button for non-JSON formats
- [x] Add tooltip explaining "Formatting supported for JSON only"
- [x] Remove "coming soon" toast.info for non-JSON formats
- [x] Test Format button states across all config formats

## Phase 2: File Safety UX

### Task 2.1: External Change Reload Warning
- [x] Check isDirty() state when external change detected
- [x] Show UnsavedChangesDialog variant for reload scenario
- [x] Implement "Reload and discard" action
- [x] Implement "Keep my edits" action (dismiss external change banner)
- [x] Test reload flow with dirty and clean editor states

### Task 2.2: Versions vs Backups Terminology
- [x] Update VersionsTab with subtitle "Compare app snapshots and restore previous versions"
- [x] Rename "History" button to "File Backups" in ConfigEditor toolbar
- [x] Update Settings Backup tab description to reference "File Backups" feature
- [x] Update OnboardingTooltip content for backups-hint
- [x] Review and update any other "history" references for consistency

### Task 2.3: Sidebar Unsaved Indicators
- [x] Pass hasUnsavedChanges prop through sidebar component tree (already implemented)
- [x] Display unsaved dot indicator on active config item in sidebar (already implemented)
- [x] Add tooltip on config items when parent tool has dirty state (already implemented)
- [x] Test indicator appears/disappears on edit and save

## Phase 3: Visual Polish & Consistency

### Task 3.1: Reduce Visual Noise
- [x] Audit gradient/glow usage across components
- [x] Keep gradients only on app icon (Header) and welcome icon
- [x] Replace glassmorphism on toolbar with solid background
- [x] Replace glassmorphism on status bar with solid background
- [x] Soften secondary border colors (use lighter variants)

### Task 3.2: Standardize Animations
- [x] Create animation constants (DURATION_HOVER: 150, DURATION_ENTER: 200)
- [x] Remove scale animations from secondary buttons
- [x] Keep scale animations only on primary action buttons
- [x] Audit and standardize transition durations in index.css
- [x] Test animations feel consistent across components

### Task 3.3: Typography & Contrast
- [x] Audit all text-[11px] usage, increase to 12px where readable text
- [x] Update small text colors: slate-600 instead of slate-400 in light mode
- [x] Standardize icon sizes: w-4 for inline, w-5 for standalone
- [x] Verify WCAG AA contrast for status bar and meta text
- [x] Test typography changes in both light and dark themes

## Phase 4: Accessibility Improvements

### Task 4.1: Toast Accessibility
- [x] Add role="status" to ToastContainer
- [x] Add aria-live="polite" to ToastContainer
- [x] Test with screen reader that toasts are announced
- [x] Ensure toast dismiss button has aria-label

### Task 4.2: Focus Management
- [x] Add visible focus styles to command palette items
- [x] Add visible focus styles to sidebar config items (not color-only)
- [x] Verify Modal focus trap implementation
- [x] Verify Modal restores focus to trigger on close
- [x] Add keyboard navigation to MCP tool status list items

### Task 4.3: ARIA Labels Audit
- [x] Audit all icon-only buttons for aria-label
- [x] Add missing aria-labels to Header buttons
- [x] Add missing aria-labels to Sidebar buttons
- [x] Add missing aria-labels to ConfigEditor toolbar buttons
- [x] Test with accessibility inspector

## Phase 5: Performance UX

### Task 5.1: Enhanced Reduce Motion
- [x] Modify reduce-motion CSS class to also disable backdrop-blur
- [x] Add alternative solid backgrounds when blur disabled
- [x] Ensure reduce-motion applies globally and immediately on toggle
- [x] Test visual appearance with reduce-motion enabled

### Task 5.2: MCP Loading States
- [x] Create skeleton component for server list items
- [x] Show skeleton loaders while MCP servers loading
- [x] Create skeleton component for tool status items
- [x] Show "Loading configuration..." in MCP header when isLoading
- [x] Test loading states appear during slow operations

### Task 5.3: Animation Standardization
- [x] Define standard easing curve (ease-out) in CSS variables
- [x] Apply consistent easing to all component transitions
- [x] Remove conflicting animation timings
- [x] Test animations are smooth and consistent

## Phase 6: Discoverability Enhancements

### Task 6.1: Keyboard Shortcuts Modal
- [x] Create KeyboardShortcutsModal component
- [x] Define shortcuts data structure with categories
- [x] Implement shortcuts list grouped by category (Navigation, Editor, Views)
- [x] Add platform-aware key display (⌘ vs Ctrl)
- [x] Add "Keyboard Shortcuts" entry to command palette
- [x] Add link/button to shortcuts from Settings modal

### Task 6.2: Inline Shortcut Hints
- [x] Add shortcut hint to Save button ("⌘S" / "Ctrl+S")
- [x] Add shortcut hint to Settings button tooltip
- [x] Add shortcut hint to sidebar toggle tooltip
- [x] Create utility for platform-aware shortcut formatting
- [x] Test hints display correctly on macOS and other platforms

### Task 6.3: Command Palette Visibility
- [ ] Add Command Palette button to Header
- [ ] Show "⌘K" hint on the button
- [ ] Implement first-time OnboardingTooltip for command palette
- [ ] Store "command palette discovered" flag in app store
- [ ] Test tooltip appears only on first use

### Task 6.4: Welcome Screen Enhancements
- [ ] Add "Power Features" section to WelcomeScreen
- [ ] Add MCP Sync feature card with link to MCP view
- [ ] Add Version History feature card
- [ ] Add Backups feature card with link to Settings
- [ ] Test all links navigate correctly

### Task 6.5: MCP Panel Guidance
- [ ] Create collapsible "How MCP Sync Works" info block
- [ ] Add 3-step explanation (source, servers, sync)
- [ ] Create empty state component for MCP Servers section
- [ ] Show empty state with Import/Add CTA when no servers
- [ ] Test empty state appears correctly

### Task 6.6: Settings Cross-References
- [ ] Add hint in Settings theme section: "Toggle from top bar"
- [ ] Add hint in Header theme tooltip: "More options in Settings"
- [ ] Review other settings for cross-reference opportunities
- [ ] Test hints are helpful and not cluttering

## Phase 7: Modern Desktop Features

### Task 7.1: Quick Open
- [ ] Create useRecentFiles hook with localStorage persistence
- [ ] Track file opens in recent files list (max 10)
- [ ] Add Ctrl/Cmd+P keyboard shortcut handler
- [ ] Create Quick Open mode in command palette (filtered to configs)
- [ ] Show file path in Quick Open results
- [ ] Test Quick Open navigates to correct config

### Task 7.2: Diff View for Versions
- [ ] Add Monaco DiffEditor component wrapper
- [ ] Add "Compare" action to version list items
- [ ] Create VersionDiffModal with DiffEditor
- [ ] Pass selected version content and current content to diff
- [ ] Add navigation between diff and apply actions
- [ ] Test diff view shows correct differences

### Task 7.3: Diff View for Backups
- [ ] Add "Compare" action to backup list items in BackupModal
- [ ] Create BackupDiffModal with DiffEditor
- [ ] Load backup content and compare with current
- [ ] Add restore action from diff view
- [ ] Test diff view for backup comparison

### Task 7.4: Recent Files in Command Palette
- [ ] Add "Recent" category to command palette
- [ ] Display recent files with path info
- [ ] Add clear recent files action
- [ ] Limit display to 5 most recent in palette
- [ ] Test recent files update on navigation

### Task 7.5: Search Integration
- [ ] Add "Find in file (Ctrl+F)" hint to status bar
- [ ] Show hint only on first config open (use flag)
- [ ] Add "Find in File" command to command palette
- [ ] Trigger Monaco's built-in find widget from command
- [ ] Test search focus works correctly

### Task 7.6: Update Indicator
- [ ] Add tauri-plugin-updater dependency
- [ ] Create useUpdateChecker hook
- [ ] Check for updates on app launch (with debounce)
- [ ] Add update badge to Header version display
- [ ] Create simple update available notification/dialog
- [ ] Handle update check failures gracefully
- [ ] Test update flow (may require mock for development)

### Task 7.7: Command Palette Categories
- [ ] Group existing commands into categories
- [ ] Add section headers to command list (Navigation, Tools, Settings, Recent)
- [ ] Style section headers distinctly from command items
- [ ] Test keyboard navigation works across sections
