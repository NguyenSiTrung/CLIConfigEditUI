# Spec: Update GitHub Copilot CLI Predefined Configuration

## Overview

Update the predefined configuration for **GitHub Copilot CLI** (`copilot` command) - the new standalone agentic AI assistant from GitHub that runs in the terminal.

**Note**: This replaces the outdated `gh-copilot` entry which was for the older `gh copilot` extension.

## Tool Information

- **Name**: GitHub Copilot CLI
- **Command**: `copilot`
- **Website**: https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli
- **Documentation**: `copilot help config`

## Configuration Files

### 1. Settings Configuration (`config.json`)

| OS | Path |
|----|------|
| macOS/Linux | `~/.copilot/config.json` |
| Windows | `%USERPROFILE%\.copilot\config.json` |

**Note**: Path can be changed by setting `XDG_CONFIG_HOME` environment variable.

**Format**: JSON

**Key Settings**:
- `trusted_folders`: Array of directories trusted for Copilot operations
- Model preferences
- Logging and debugging settings

### 2. MCP Configuration (`mcp-config.json`)

| OS | Path |
|----|------|
| macOS/Linux | `~/.copilot/mcp-config.json` |
| Windows | `%USERPROFILE%\.copilot\mcp-config.json` |

**Format**: JSON

**Example Content**:
```json
{
  "servers": {
    "github": {
      "url": "https://api.githubcopilot.com/mcp/"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

**MCP Server Types**:
- **HTTP/Streamable HTTP**: Remote MCP endpoints
  - `url`: HTTP/HTTPS endpoint URL
  
- **Stdio**: Local process servers
  - `command`: Executable to run
  - `args`: Command-line arguments array
  - `env`: Environment variables object

**Adding MCP servers**: Use `/mcp add` command in interactive mode

### 3. Custom Agents (Optional)

| Level | Path |
|-------|------|
| User | `~/.copilot/agents/` |
| Repository | `.github/agents/` |

**Format**: Markdown files defining agent profiles

### 4. Repository Custom Instructions (Optional)

| Path | Description |
|------|-------------|
| `.github/copilot-instructions.md` | Repository-wide instructions |
| `.github/copilot-instructions/**/*.instructions.md` | Path-specific instructions |
| `AGENTS.md` | Agent files (supported) |

## Acceptance Criteria

1. [ ] Update `gh-copilot` entry in Rust backend to use correct paths
2. [ ] Update `gh-copilot` entry in TypeScript frontend to match
3. [ ] Support `config.json` with correct path `~/.copilot/config.json`
4. [ ] Support `mcp-config.json` with correct path `~/.copilot/mcp-config.json`
5. [ ] Update docs URL to new documentation
6. [ ] Keep icon as 🐙 (GitHub's octicon)

## Technical Notes

- Copilot CLI creates `~/.copilot/` directory on first run
- The old `gh copilot` extension is being replaced by standalone `copilot` command
- OAuth tokens are handled separately (not stored in config files)
- User agents in `~/.copilot/agents/` override repository-level agents

## References

- [Using GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-copilot-cli)
- [About GitHub Copilot CLI](https://docs.github.com/copilot/concepts/agents/about-copilot-cli)
- [Extending Copilot with MCP](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/extend-coding-agent-with-mcp)
