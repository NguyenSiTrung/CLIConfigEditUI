# Spec: Add Rovo Dev CLI Predefined Tool Support

## Overview

Add Atlassian Rovo Dev CLI as a predefined tool in CLI Config Editor, enabling auto-detection and editing of its configuration files. This brings Rovo Dev CLI on par with other supported AI coding CLI tools like Claude CLI, Amp, and Aider.

## Functional Requirements

### FR1: Tool Definition
- Add Rovo Dev CLI to the predefined tools list with:
  - **Name**: "Rovo Dev CLI"
  - **Detection**: Check if `~/.rovodev/` directory exists
  - **Icon**: Atlassian-style icon or generic CLI icon

### FR2: Config Files Support
Support two configuration files as sub-items:

| File | Path | Format | Description |
|------|------|--------|-------------|
| Config | `~/.rovodev/config.yml` | YAML | Main settings (agent behavior, console, logging, Atlassian connections) |
| MCP Servers | `~/.rovodev/mcp.json` | JSON | Model Context Protocol server configurations |

### FR3: Sidebar Display
- Display as single expandable entry "Rovo Dev CLI" in sidebar
- Show config.yml and mcp.json as sub-items when expanded
- Follow existing multi-config tool pattern (similar to tools with multiple config files)

### FR4: Editor Integration
- Use Monaco Editor with YAML syntax highlighting for config.yml
- Use Monaco Editor with JSON syntax highlighting for mcp.json
- Apply existing validation and backup mechanisms

## Non-Functional Requirements

- Cross-platform path resolution (macOS, Linux, Windows)
- Windows path: `%USERPROFILE%\.rovodev\`
- Consistent with existing tool detection patterns

## Acceptance Criteria

1. [ ] Rovo Dev CLI appears in sidebar when `~/.rovodev/` directory exists
2. [ ] Both config.yml and mcp.json are editable with correct syntax highlighting
3. [ ] Changes save correctly with backup creation
4. [ ] Tool detection works on macOS, Linux, and Windows
5. [ ] Follows existing UI patterns for multi-config tools

## Out of Scope

- Schema validation for Rovo Dev config structure
- Creating default config files if they don't exist
- Integration with `acli` command

## Research Notes

From official Atlassian documentation:
- Config path: `~/.rovodev/config.yml`
- MCP path: `~/.rovodev/mcp.json`
- Docs: https://support.atlassian.com/rovo/docs/manage-rovo-dev-cli-settings/
