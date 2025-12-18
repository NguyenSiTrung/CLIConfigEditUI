# CLI Tool Configuration Reference

This document details the configuration file locations for supported AI CLI tools.

## New: Multi-Config File Support

Each CLI tool can now have **multiple configuration files**. Users can add, edit, and delete config files per tool.

### How It Works

1. **Tools have no hardcoded config paths** - everything is user-managed
2. **Suggested configs** are provided for quick setup
3. **All config files** (Settings, MCP, Memory, etc.) are fully editable/deletable
4. **Data persists** in local storage

### Example: Claude Code

| Label | Path | Format | Description |
|-------|------|--------|-------------|
| Settings | `~/.claude/settings.json` | JSON | Main settings file |
| MCP Servers | `.mcp.json` | JSON | Project-level MCP configuration |
| Memory | `~/.claude/CLAUDE.md` | Markdown | Global instructions/memory |

---

## Path Variables

| Variable | macOS | Linux | Windows |
|----------|-------|-------|---------|
| `~` | `/Users/<username>` | `/home/<username>` | `C:\Users\<username>` |
| `$XDG_CONFIG_HOME` | N/A | `~/.config` (default) | N/A |
| `%APPDATA%` | N/A | N/A | `C:\Users\<username>\AppData\Roaming` |
| `%LOCALAPPDATA%` | N/A | N/A | `C:\Users\<username>\AppData\Local` |

---

## Supported Tools

### Claude Code

Anthropic's official Claude Code CLI for terminal-based AI assistance.

**Suggested Config Files:**

| Label | Path | Format |
|-------|------|--------|
| Settings | `~/.claude/settings.json` | JSON |
| MCP Servers | `.mcp.json` | JSON |
| Memory | `~/.claude/CLAUDE.md` | Markdown |

**Example Settings:**
```json
{
  "permissions": {
    "allow": ["Bash(npm run *)"],
    "deny": ["Read(.env*)"]
  },
  "model": "claude-sonnet-4-20250514"
}
```

**Example MCP Config:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/dir"]
    }
  }
}
```

**Documentation:** https://docs.anthropic.com/claude-code

---

### Gemini CLI

Google's Gemini CLI for terminal-based AI assistance.

**Suggested Config Files:**

| Label | Path | Format |
|-------|------|--------|
| Settings | `~/.gemini/settings.json` | JSON |
| Memory | `~/.gemini/GEMINI.md` | Markdown |

**Example Settings:**
```json
{
  "theme": "Default",
  "mcpServers": {
    "github": {
      "httpUrl": "https://api.githubcopilot.com/mcp/",
      "timeout": 5000
    }
  }
}
```

**Documentation:** https://geminicli.com/docs/

---

### Aider

AI pair programming in your terminal.

**Suggested Config Files:**

| Label | Path | Format |
|-------|------|--------|
| Settings | `~/.aider.conf.yml` | YAML |

**Example:**
```yaml
model: gpt-4
auto-commits: true
dark-mode: true
show-diffs: true
```

**Documentation:** https://aider.chat/docs/config.html

---

### Continue

Open-source AI code assistant.

**Suggested Config Files:**

| Label | Path | Format |
|-------|------|--------|
| Settings | `~/.continue/config.json` | JSON |

**Example:**
```json
{
  "models": [
    {
      "title": "Claude Sonnet 4",
      "provider": "anthropic",
      "model": "claude-sonnet-4-20250514"
    }
  ]
}
```

**Documentation:** https://docs.continue.dev/

---

### Amp

Sourcegraph's AI coding agent.

**Suggested Config Files:**

| Label | Path | Format |
|-------|------|--------|
| Settings | `~/.config/amp/settings.toml` | TOML |

**Example:**
```toml
[general]
theme = "dark"

[editor]
font_size = 14
```

**Documentation:** https://ampcode.com/manual

---

### GitHub Copilot CLI

GitHub's AI-powered CLI assistant.

**Suggested Config Files:**

| Label | Path | Format |
|-------|------|--------|
| Settings | `~/.config/gh-copilot/config.yml` | YAML |

**Example:**
```yaml
optional_analytics: false
```

**Documentation:** https://docs.github.com/en/copilot/github-copilot-in-the-cli

---

### Cursor

AI-first code editor.

**Suggested Config Files:**

| Label | Path | Format |
|-------|------|--------|
| Settings | `~/.config/Cursor/User/settings.json` | JSON |

**Example:**
```json
{
  "cursor.ai.model": "gpt-4",
  "editor.fontSize": 14
}
```

**Documentation:** https://cursor.sh/docs

---

### Cody CLI

Sourcegraph's AI coding assistant.

**Suggested Config Files:**

| Label | Path | Format |
|-------|------|--------|
| Settings | `~/.cody/config.json` | JSON |

**Example:**
```json
{
  "endpoint": "https://sourcegraph.com",
  "accessToken": "..."
}
```

**Documentation:** https://sourcegraph.com/docs/cody

---

## Adding Config Files

To add a config file for any tool:

1. Click the tool name in the sidebar to expand it
2. Click **"Add config file"**
3. Either select a **suggested config** or enter custom details:
   - **Label**: Display name (e.g., "MCP", "Memory")
   - **Path**: File path (supports `~` for home directory)
   - **Format**: JSON, YAML, TOML, INI, or Markdown
   - **Icon**: Optional emoji icon

### Managing Config Files

- **Edit**: Click the menu (⋮) and select "Edit"
- **Delete**: Click the menu (⋮) and select "Delete"
- **Select**: Click on any config file to open it in the editor

---

## Custom Tools

Users can still add completely custom CLI tools by:

1. Clicking **"Add Custom Tool"** in the sidebar
2. Providing:
   - **Name**: Display name
   - **Config Path**: Full path to configuration file
   - **Format**: JSON, YAML, TOML, INI, or Markdown
   - **Description** (optional)

---

## Format Support

| Format | Extension | Features |
|--------|-----------|----------|
| JSON | `.json` | Syntax highlighting, formatting, validation |
| YAML | `.yml`, `.yaml` | Syntax highlighting |
| TOML | `.toml` | Syntax highlighting |
| INI | `.ini` | Syntax highlighting |
| Markdown | `.md` | Syntax highlighting (for memory/instruction files) |
