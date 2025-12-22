# Spec: Add Qwen Code CLI Predefined Configuration

## Overview

Add Qwen Code CLI (Alibaba's AI coding agent) as a predefined tool in CLI Config Editor, allowing users to easily discover and edit Qwen Code configuration files.

## Functional Requirements

### FR-1: Add Qwen Code CLI Tool Definition
- Add `qwen-code` as a new predefined CLI tool
- Tool metadata:
  - **ID:** `qwen-code`
  - **Name:** Qwen Code
  - **Icon:** 🐦
  - **Docs URL:** https://qwenlm.github.io/qwen-code-docs/en/users/overview
  - **Description:** Alibaba's AI coding agent CLI

### FR-2: Supported Configuration Files
| Label | Path | Format | Icon | Description | jsonPath |
|-------|------|--------|------|-------------|----------|
| Settings (User) | `~/.qwen/settings.json` | json | ⚙️ | Main user configuration | - |
| Settings (Project) | `.qwen/settings.json` | json | 📁 | Project-level configuration | - |
| MCP Servers | `~/.qwen/settings.json` | json | 🔌 | MCP server configuration | `mcpServers` |
| Memory | `~/.qwen/QWEN.md` | md | 📝 | Global context/memory file | - |

### FR-3: Implementation Locations
- **Rust backend:** `src-tauri/src/config/cli_tools.rs` - Add to `get_cli_tools()` 
- **TypeScript frontend:** `src/utils/cli-tools.ts` - Add to `CLI_TOOLS` array

## Non-Functional Requirements

- Follow existing code patterns for CLI tool definitions
- Maintain consistency with other predefined tools (Claude, Gemini, Amp)

## Acceptance Criteria

- [ ] Qwen Code appears in the sidebar under predefined tools
- [ ] All 4 config files are listed when Qwen Code is selected
- [ ] User can open/edit/save each configuration file
- [ ] Tool icon (🐦) displays correctly
- [ ] Documentation link works

## Out of Scope

- OAuth/API key special handling
- Model configuration highlighting
- Auto-detection of Qwen Code installation
