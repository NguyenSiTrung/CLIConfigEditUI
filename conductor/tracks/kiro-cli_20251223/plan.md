# Plan: Add Kiro CLI Support

> **Last Revised:** 2025-12-23 - Added Task 1.4 for frontend CLI_TOOLS update

## Phase 1: Add Kiro CLI Tool Definition

### Task 1.1: Add Kiro CLI to cli_tools.rs (Backend)
- [x] Add new `CliTool` entry for Kiro CLI in `get_cli_tools()` function
- [x] Configure with:
  - id: `kiro-cli`
  - name: "Kiro CLI"
  - icon: "🪁"
  - docs_url: `https://kiro.dev/docs/cli/reference/settings/`
  - description: "AWS Kiro agentic coding CLI"

### Task 1.2: Add Settings Configuration
- [x] Add `SuggestedConfig` for main settings file
- [x] Path: `~/.config/kiro/settings.json` (Linux standard path)
- [x] Format: JSON
- [x] Icon: "⚙️"
- [x] Description: "Main configuration (chat, telemetry, knowledge, API)"

### Task 1.3: Add MCP Server Configuration
- [x] Add `SuggestedConfig` for MCP servers
- [x] Path: `~/.config/kiro/settings/mcp.json`
- [x] Format: JSON
- [x] Icon: "🔌"
- [x] Description: "User-level MCP server configuration"

### Task 1.4: Update Frontend CLI_TOOLS (Added via Revision 1)
- [x] Add matching `CliTool` entry in `src/utils/cli-tools.ts`
- [x] Mirror backend definition (id, name, icon, docsUrl, description, suggestedConfigs)
- [x] Required for tool to appear in sidebar UI

## Phase 2: Platform-Specific Path Handling

### Task 2.1: Verify Linux Path Resolution
- [x] Using `~/.config/kiro/` which follows Linux XDG standard
- [x] Path expands correctly via existing `expand_path` function

## Phase 3: Verification

### Task 3.1: Build and Test
- [x] Run `cargo clippy` - no warnings
- [x] Run `cargo test` - all 28 tests pass
- [x] Run `pnpm typecheck` - no errors

### Task 3.2: Manual Verification
- [x] Kiro CLI added to tool list (implementation verified)
- [x] Settings file path: `~/.config/kiro/settings.json`
- [x] MCP config path: `~/.config/kiro/settings/mcp.json`
