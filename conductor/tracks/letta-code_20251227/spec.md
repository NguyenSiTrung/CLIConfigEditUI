# Spec: Add Letta Code CLI Predefined Tool

## Overview

Add Letta Code CLI as a predefined tool in CLI Config Editor, enabling users to discover and edit its configuration file through the unified interface.

Letta Code is a memory-first, model-agnostic coding agent harness that persists across sessions and improves with use.

## Functional Requirements

### FR-1: Tool Definition
- **Tool ID:** `letta-code`
- **Display Name:** Letta Code
- **Category:** Predefined CLI Tool
- **Website:** https://docs.letta.com/letta-code

### FR-2: Configuration Files
| Platform | Path |
|----------|------|
| macOS | `~/.letta/settings.json` |
| Linux | `~/.letta/settings.json` |
| Windows | `%USERPROFILE%\.letta\settings.json` |

### FR-3: File Format
- **Format:** JSON
- **Editor Mode:** JSON with syntax highlighting and validation

## Non-Functional Requirements

- Follow existing predefined tool patterns in codebase
- Cross-platform path resolution

## Acceptance Criteria

1. [ ] Letta Code appears in sidebar under predefined tools when config exists
2. [ ] Clicking opens `~/.letta/settings.json` in Monaco editor with JSON mode
3. [ ] Save functionality works correctly
4. [ ] Website link is accessible from tool context

## Out of Scope

- Project-level config files (`.letta/settings.json`, `.letta/settings.local.json`)
- MCP server configuration (managed via API, not local files)

## References

- Official docs: https://docs.letta.com/letta-code
- Configuration guide: https://docs.letta.com/letta-code/configuration
- GitHub: https://github.com/letta-ai/letta-code
