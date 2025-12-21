# Plan: Update GitHub Copilot CLI Predefined Configuration

## Phase 1: Update Rust Backend
**Status**: `[x]`

### Task 1.1: Update CLI tool definition in cli_tools.rs
- [x] Replace `gh-copilot` entry with updated paths
- [x] Change settings path from `~/.config/gh-copilot/config.yml` to `~/.copilot/config.json`
- [x] Add MCP config entry for `~/.copilot/mcp-config.json`
- [x] Update docs URL to new documentation
- [x] Update description to reflect new standalone CLI

**File**: `src-tauri/src/config/cli_tools.rs`

**Changes**:
```rust
CliTool {
    id: "gh-copilot".to_string(),
    name: "GitHub Copilot CLI".to_string(),
    icon: Some("🐙".to_string()),
    docs_url: Some("https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli".to_string()),
    description: Some("GitHub's agentic AI coding assistant for the terminal".to_string()),
    suggested_configs: Some(vec![
        SuggestedConfig {
            label: "Settings".to_string(),
            path: "~/.copilot/config.json".to_string(),
            format: ConfigFormat::Json,
            icon: Some("⚙️".to_string()),
            description: Some("Main configuration (trusted folders, preferences)".to_string()),
            json_path: None,
        },
        SuggestedConfig {
            label: "MCP Servers".to_string(),
            path: "~/.copilot/mcp-config.json".to_string(),
            format: ConfigFormat::Json,
            icon: Some("🔌".to_string()),
            description: Some("MCP server configuration".to_string()),
            json_path: Some("servers".to_string()),
        },
    ]),
},
```

---

## Phase 2: Update TypeScript Frontend
**Status**: `[x]`

### Task 2.1: Update CLI_TOOLS constant in cli-tools.ts
- [x] Update `gh-copilot` entry to match Rust backend
- [x] Change settings path and format
- [x] Add MCP config entry

**File**: `src/utils/cli-tools.ts`

**Changes**:
```typescript
{
  id: 'gh-copilot',
  name: 'GitHub Copilot CLI',
  icon: '🐙',
  docsUrl: 'https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli',
  description: "GitHub's agentic AI coding assistant for the terminal",
  suggestedConfigs: [
    {
      label: 'Settings',
      path: '~/.copilot/config.json',
      format: 'json',
      icon: '⚙️',
      description: 'Main configuration (trusted folders, preferences)',
    },
    {
      label: 'MCP Servers',
      path: '~/.copilot/mcp-config.json',
      format: 'json',
      icon: '🔌',
      description: 'MCP server configuration',
      jsonPath: 'servers',
    },
  ],
},
```

---

## Phase 3: Verify & Test
**Status**: `[x]`

### Task 3.1: Run typecheck
- [x] `pnpm typecheck`

### Task 3.2: Run Rust check
- [x] `cd src-tauri && cargo clippy`

### Task 3.3: Manual verification
- [ ] Confirm the tool appears correctly in sidebar
- [ ] Verify config paths resolve correctly

---

## Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Update Rust Backend | `[x]` |
| 2 | Update TypeScript Frontend | `[x]` |
| 3 | Verify & Test | `[x]` |
