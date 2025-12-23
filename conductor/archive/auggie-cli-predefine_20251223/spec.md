# Spec: Add Augment Code CLI (Auggie) Predefined Configuration

## Overview

Add predefined configuration support for Augment Code CLI (Auggie), enabling users to discover and edit Auggie's settings file through CLI Config Editor's unified interface.

## Functional Requirements

### FR-1: Predefined Tool Definition
- Add "Augment Code CLI (Auggie)" to the predefined CLI tools list
- Tool metadata:
  - **Name:** Augment Code CLI (Auggie)
  - **Config Format:** JSON
  - **Config Path:** `~/.augment/settings.json` (cross-platform home directory expansion)

### FR-2: Platform Support
- Resolve `~/.augment/settings.json` path correctly on:
  - Linux: `$HOME/.augment/settings.json`
  - macOS: `$HOME/.augment/settings.json`
  - Windows: `%USERPROFILE%\.augment\settings.json`

### FR-3: Auto-Detection
- Include Auggie in the auto-detection scan on app startup
- Detect if `~/.augment/settings.json` exists

## Non-Functional Requirements

- Follow existing predefined tool patterns in the codebase
- No additional dependencies required

## Acceptance Criteria

- [ ] Auggie appears in the predefined tools dropdown
- [ ] Config file path resolves correctly on all platforms
- [ ] Settings file opens in Monaco editor with JSON syntax highlighting
- [ ] Users can edit and save the settings.json file
- [ ] Auto-detection correctly identifies if Auggie config exists

## Out of Scope

- MCP server templates/presets
- Custom commands directory (`~/.augment/commands/`) editing
- Project-level `.augment/` configurations
