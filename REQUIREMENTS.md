# Requirements Specification

## Functional Requirements

### FR1: Tool Discovery & Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR1.1 | App shall auto-detect installed CLI tools on startup | P0 |
| FR1.2 | App shall display list of installed tools with status indicators | P0 |
| FR1.3 | App shall show available (not installed) tools separately | P1 |
| FR1.4 | User shall be able to add custom CLI tool configurations | P0 |
| FR1.5 | User shall be able to edit custom tool configurations | P1 |
| FR1.6 | User shall be able to delete custom tool configurations | P1 |
| FR1.7 | App shall persist custom tool configurations across sessions | P0 |

### FR2: Configuration Editing

| ID | Requirement | Priority |
|----|-------------|----------|
| FR2.1 | App shall display config file content in a code editor | P0 |
| FR2.2 | Editor shall provide syntax highlighting for JSON, YAML, TOML, INI | P0 |
| FR2.3 | Editor shall show line numbers | P0 |
| FR2.4 | Editor shall support undo/redo operations | P0 |
| FR2.5 | Editor shall support find/replace | P1 |
| FR2.6 | App shall indicate unsaved changes (dirty state) | P0 |
| FR2.7 | App shall warn before closing with unsaved changes | P0 |

### FR3: File Operations

| ID | Requirement | Priority |
|----|-------------|----------|
| FR3.1 | App shall read config files from platform-specific locations | P0 |
| FR3.2 | App shall save config files to their original locations | P0 |
| FR3.3 | App shall create backup before overwriting files | P0 |
| FR3.4 | App shall create config files if they don't exist (with user confirmation) | P1 |
| FR3.5 | App shall detect external file changes and prompt for reload | P1 |
| FR3.6 | App shall handle file permission errors gracefully | P0 |

### FR4: Validation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR4.1 | App shall validate syntax before saving | P0 |
| FR4.2 | App shall show syntax errors with line numbers | P0 |
| FR4.3 | App shall validate against JSON Schema when available | P1 |
| FR4.4 | App shall provide a manual "Validate" button | P1 |
| FR4.5 | App shall provide a "Format/Prettify" button | P1 |

### FR5: User Interface

| ID | Requirement | Priority |
|----|-------------|----------|
| FR5.1 | App shall have a sidebar with tool list | P0 |
| FR5.2 | App shall support searching/filtering tools by name | P1 |
| FR5.3 | App shall support light and dark themes | P1 |
| FR5.4 | App shall remember window size and position | P2 |
| FR5.5 | App shall show tool icons/logos when available | P2 |
| FR5.6 | App shall provide keyboard shortcuts for common actions | P1 |

### FR6: Custom Tools

| ID | Requirement | Priority |
|----|-------------|----------|
| FR6.1 | User shall specify tool name | P0 |
| FR6.2 | User shall specify config file path (with file picker) | P0 |
| FR6.3 | User shall specify config format (JSON/YAML/TOML/INI) | P0 |
| FR6.4 | User shall optionally add description | P2 |
| FR6.5 | App shall validate that the specified path exists or can be created | P1 |

---

## Non-Functional Requirements

### NFR1: Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR1.1 | App startup time | < 2 seconds |
| NFR1.2 | Tool detection time | < 1 second |
| NFR1.3 | File load time | < 500ms for files < 1MB |
| NFR1.4 | Memory usage (idle) | < 100MB |

### NFR2: Compatibility

| ID | Requirement |
|----|-------------|
| NFR2.1 | Support macOS 11+ (Big Sur and later) |
| NFR2.2 | Support Ubuntu 20.04+ and other major Linux distros |
| NFR2.3 | Support Windows 10/11 |
| NFR2.4 | Support both x64 and ARM64 architectures |

### System Dependencies

#### Ubuntu/Debian
```bash
sudo apt-get install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### macOS
```bash
xcode-select --install
```

#### Windows
- Visual Studio Build Tools with C++ workload
- WebView2 Runtime

### NFR3: Security

| ID | Requirement |
|----|-------------|
| NFR3.1 | App shall only access config directories, not arbitrary paths |
| NFR3.2 | App shall not store or transmit config file contents externally |
| NFR3.3 | App shall use atomic file writes to prevent corruption |
| NFR3.4 | App shall validate all file paths to prevent traversal attacks |

### NFR4: Reliability

| ID | Requirement |
|----|-------------|
| NFR4.1 | App shall not crash on malformed config files |
| NFR4.2 | App shall preserve file encoding when saving |
| NFR4.3 | App shall preserve comments in YAML/TOML files when possible |
| NFR4.4 | Backups shall be retained for at least the last 5 saves |

### NFR5: Usability

| ID | Requirement |
|----|-------------|
| NFR5.1 | App shall be usable without documentation for basic tasks |
| NFR5.2 | Error messages shall be actionable (tell user what to do) |
| NFR5.3 | App shall provide tooltips for all buttons |

---

## User Stories

### US1: First-time User
> As a developer using multiple AI CLI tools, I want to open the app and immediately see which tools I have installed, so I can quickly edit their settings.

**Acceptance Criteria:**
- App detects Claude CLI, Aider, Amp on my machine
- Shows them in "Installed" section
- I can click one and see its config

### US2: Edit Configuration
> As a user, I want to edit a JSON config file with syntax highlighting, so I can easily see the structure and avoid syntax errors.

**Acceptance Criteria:**
- Monaco editor with JSON highlighting
- Syntax errors shown before save
- Save button disabled if syntax invalid

### US3: Add Custom Tool
> As a power user, I want to add my own CLI tool that isn't in the pre-configured list, so I can manage all my configs in one place.

**Acceptance Criteria:**
- "Add Custom" button in sidebar
- Form to enter name, path, format
- File picker for path selection
- Tool appears in Custom section after adding

### US4: Recover from Mistake
> As a user who accidentally broke my config, I want to restore the previous version, so I can quickly recover.

**Acceptance Criteria:**
- Backup created before each save
- "Restore Backup" option available
- Shows backup timestamp

### US5: External Changes
> As a user who also edits configs via terminal, I want the app to detect when a file changed externally, so I don't lose those changes.

**Acceptance Criteria:**
- File watcher detects changes
- Prompt: "File changed externally. Reload?"
- Options: Reload / Keep Current

---

## Pre-configured Tools (MVP)

| Tool | Config Path Pattern | Format |
|------|---------------------|--------|
| Claude CLI | `~/.claude/settings.json` | JSON |
| Aider | `~/.aider.conf.yml` | YAML |
| Continue | `~/.continue/config.json` | JSON |
| Amp | `~/.config/amp/settings.toml` | TOML |
| GitHub Copilot CLI | `~/.config/gh-copilot/config.yml` | YAML |
| Cursor | `~/.cursor/settings.json` | JSON |
| Cody CLI | `~/.cody/config.json` | JSON |

---

## Milestones

### M1: Core MVP (Week 1-2)
- [x] Tauri project setup
- [x] Basic UI layout (sidebar + editor)
- [x] Read/write JSON config files
- [x] 3 pre-configured tools (Claude, Aider, Amp)
- [x] Basic syntax highlighting

### M2: Full Editor (Week 3)
- [x] Monaco Editor integration
- [x] YAML/TOML support
- [x] Syntax validation
- [x] Unsaved changes warning
- [x] Backup system

### M3: Custom Tools (Week 4)
- [x] Add custom tool UI
- [x] Persist custom tools
- [x] File picker integration
- [x] Edit/delete custom tools

### M4: Polish (Week 5)
- [x] Auto-detection of installed tools
- [x] File watcher for external changes
- [x] Dark/light theme
- [x] All 7 pre-configured tools
- [x] Keyboard shortcuts (Ctrl+S)

### M5: Release (Week 6)
- [ ] Cross-platform testing
- [ ] Installer builds (dmg, deb, msi)
- [x] Documentation
- [ ] GitHub release
