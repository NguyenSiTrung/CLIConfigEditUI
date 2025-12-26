# Product: CLI Config Editor

> **Last Refreshed:** 2025-12-26 - Context synced with codebase

## Vision

A unified desktop application that simplifies managing configuration files for AI coding CLI tools across all major operating systems.

## Problem Statement

Developers using multiple AI coding assistants (Claude CLI, Aider, Continue, Amp, GitHub Copilot CLI, Cursor, Cody) struggle with:
- Scattered configuration files in different locations across the filesystem
- Different config formats (JSON, YAML, TOML, INI)
- Tedious manual editing without syntax highlighting or validation
- No unified interface to manage settings across tools

## Solution

CLI Config Editor provides a single, intuitive interface to:
1. **Discover** - Auto-detect installed AI CLI tools and their config files
2. **Edit** - Edit configurations with Monaco Editor (VS Code's editor)
3. **Validate** - Syntax highlighting and validation before saving
4. **Manage** - Add custom CLI tool configurations

## Target Users

### Primary: AI-Assisted Developers
- Use 2+ AI coding CLI tools daily
- Comfortable with configuration files
- Value efficiency and unified tooling

### Secondary: Power Users
- Manage custom CLI tools
- Need cross-platform consistency
- Want backup/restore capabilities

## Key Features (MVP)

| Feature | Description | Status |
|---------|-------------|--------|
| Auto-detection | Scan for installed CLI tools on startup | ✅ |
| Monaco Editor | Syntax highlighting for JSON/YAML/TOML/INI | ✅ |
| Validation | Real-time syntax validation | ✅ |
| Custom tools | Add user-defined CLI configurations | ✅ |
| Dark/Light themes | User preference for UI theme | ✅ |
| Keyboard shortcuts | Ctrl+S to save, etc. | ✅ |
| Backup system | Auto-backup before overwriting | ✅ |
| Config versioning | Save/restore named versions of configs | ✅ |
| MCP sync | Sync MCP server configs across tools | ✅ |
| Update indicator | In-app update availability check | ✅ |
| Keyboard shortcuts modal | Discoverable shortcuts with categories | ✅ |
| Tool visibility | Pin, hide, and reorder tools in sidebar | ✅ |
| Sidebar drag-and-drop | Reorder custom tools via drag-and-drop | ✅ |

## Future Roadmap

- [ ] Cross-platform testing and release builds
- [ ] File watcher for external changes
- [ ] Diff view (current vs backup)
- [ ] Settings sync (export/import)
- [ ] Templates for common configurations
- [ ] CLI integration (`cli-config edit <tool>`)

## Success Metrics

- App startup < 2 seconds
- Tool detection < 1 second
- Zero data loss (backup before every save)
- Support macOS, Linux, and Windows

## Non-Goals

- Not a general-purpose text editor
- Not a file manager
- No cloud sync (local-only for privacy)
- No telemetry or analytics
