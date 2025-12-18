# CLI Tool Configuration Reference

This document details the configuration file locations for supported AI CLI tools across all platforms.

## Path Variables

| Variable | macOS | Linux | Windows |
|----------|-------|-------|---------|
| `~` | `/Users/<username>` | `/home/<username>` | `C:\Users\<username>` |
| `$XDG_CONFIG_HOME` | N/A | `~/.config` (default) | N/A |
| `%APPDATA%` | N/A | N/A | `C:\Users\<username>\AppData\Roaming` |
| `%LOCALAPPDATA%` | N/A | N/A | `C:\Users\<username>\AppData\Local` |

---

## Pre-configured Tools

### Claude CLI

Anthropic's official Claude CLI for terminal-based AI assistance.

| Platform | Config Path |
|----------|-------------|
| macOS | `~/.claude/settings.json` |
| Linux | `~/.claude/settings.json` |
| Windows | `%USERPROFILE%\.claude\settings.json` |

**Format:** JSON

**Example:**
```json
{
  "permissions": {
    "allow_file_access": true,
    "allow_web_access": false
  },
  "model": "claude-sonnet-4-20250514",
  "theme": "dark"
}
```

**Documentation:** https://docs.anthropic.com/claude-cli

---

### Aider

AI pair programming in your terminal.

| Platform | Config Path |
|----------|-------------|
| macOS | `~/.aider.conf.yml` |
| Linux | `~/.aider.conf.yml` |
| Windows | `%USERPROFILE%\.aider.conf.yml` |

**Alternative locations:**
- `.aider.conf.yml` in current project directory
- `~/.config/aider/aider.conf.yml`

**Format:** YAML

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

Open-source AI code assistant (VS Code / JetBrains extension with CLI).

| Platform | Config Path |
|----------|-------------|
| macOS | `~/.continue/config.json` |
| Linux | `~/.continue/config.json` |
| Windows | `%USERPROFILE%\.continue\config.json` |

**Format:** JSON

**Example:**
```json
{
  "models": [
    {
      "title": "Claude 3.5 Sonnet",
      "provider": "anthropic",
      "model": "claude-sonnet-4-20250514",
      "apiKey": "..."
    }
  ],
  "tabAutocompleteModel": {
    "title": "Codestral",
    "provider": "mistral",
    "model": "codestral-latest"
  }
}
```

**Documentation:** https://docs.continue.dev/

---

### Amp

Anthropic's AI coding agent.

| Platform | Config Path |
|----------|-------------|
| macOS | `~/.config/amp/settings.toml` |
| Linux | `~/.config/amp/settings.toml` |
| Windows | `%APPDATA%\amp\settings.toml` |

**Alternative:** `~/.amprc`

**Format:** TOML

**Example:**
```toml
[general]
theme = "dark"

[editor]
font_size = 14
line_numbers = true
```

**Documentation:** https://ampcode.com/manual

---

### GitHub Copilot CLI

GitHub's AI-powered CLI assistant.

| Platform | Config Path |
|----------|-------------|
| macOS | `~/.config/gh-copilot/config.yml` |
| Linux | `~/.config/gh-copilot/config.yml` |
| Windows | `%APPDATA%\gh-copilot\config.yml` |

**Format:** YAML

**Example:**
```yaml
optional_analytics: false
```

**Documentation:** https://docs.github.com/en/copilot/github-copilot-in-the-cli

---

### Cursor

AI-first code editor (settings file).

| Platform | Config Path |
|----------|-------------|
| macOS | `~/Library/Application Support/Cursor/User/settings.json` |
| Linux | `~/.config/Cursor/User/settings.json` |
| Windows | `%APPDATA%\Cursor\User\settings.json` |

**Format:** JSON (VS Code settings format)

**Example:**
```json
{
  "cursor.ai.model": "gpt-4",
  "cursor.ai.enableAutoComplete": true,
  "editor.fontSize": 14
}
```

**Documentation:** https://cursor.sh/docs

---

### Cody CLI

Sourcegraph's AI coding assistant.

| Platform | Config Path |
|----------|-------------|
| macOS | `~/.cody/config.json` |
| Linux | `~/.cody/config.json` |
| Windows | `%USERPROFILE%\.cody\config.json` |

**Format:** JSON

**Example:**
```json
{
  "endpoint": "https://sourcegraph.com",
  "accessToken": "...",
  "customHeaders": {}
}
```

**Documentation:** https://sourcegraph.com/docs/cody

---

## Adding Custom Tools

Users can add custom CLI tools by providing:

1. **Name**: Display name for the tool
2. **Config Path**: Absolute path to the configuration file
3. **Format**: JSON, YAML, TOML, or INI
4. **Description** (optional): Brief description

### Example Custom Tool

```json
{
  "name": "My Custom CLI",
  "configPath": "/home/user/.mycli/config.yaml",
  "format": "yaml",
  "description": "Internal team CLI tool"
}
```

---

## Detection Logic

The app detects installed tools by:

1. Checking if the config file exists at known paths
2. Checking if the CLI binary is in PATH (optional enhancement)
3. Checking for tool-specific markers (e.g., lock files)

### Priority Order

When multiple config paths exist (e.g., project-local vs global):

1. **Project-local** (if in a project context)
2. **User home** (`~/.toolname/`)
3. **XDG config** (`~/.config/toolname/`)
4. **System-wide** (`/etc/toolname/` - read-only display)

---

## Format Specifications

### JSON
- Standard JSON with optional comments (JSONC) support
- Validated with JSON Schema when available

### YAML
- YAML 1.2 specification
- Comments preserved during editing

### TOML
- TOML v1.0 specification
- Comments preserved during editing

### INI
- Standard INI format
- Section headers in `[brackets]`
- Key-value pairs with `=`
