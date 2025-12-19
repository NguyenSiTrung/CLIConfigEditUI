# Spec: Add Factory Droid CLI Predefined Configuration

## Overview

Add predefined configuration support for **Factory Droid CLI** (`droid` command) - an enterprise-grade AI coding agent that lives in the terminal.

## Tool Information

- **Name**: Factory Droid CLI (Droid)
- **Command**: `droid`
- **Website**: https://docs.factory.ai

## Configuration Files

### 1. Settings Configuration (`settings.json`)

| OS | Path |
|----|------|
| macOS/Linux | `~/.factory/settings.json` |
| Windows | `%USERPROFILE%\.factory\settings.json` |

**Format**: JSON

**Example Content**:
```json
{
  "model": "sonnet",
  "reasoningEffort": "low",
  "autonomyLevel": "normal",
  "cloudSessionSync": true,
  "diffMode": "github",
  "completionSound": "off",
  "commandAllowlist": ["ls", "pwd", "dir"],
  "commandDenylist": ["rm -rf /", "mkfs", "shutdown"],
  "includeCoAuthoredByDroid": true,
  "enableDroidShield": true,
  "specSaveEnabled": false,
  "specSaveDir": ".factory/docs",
  "enableCustomDroids": false
}
```

**Key Settings**:
- `model`: Default AI model (`sonnet`, `opus`, `GPT-5`, `gpt-5-codex`, `haiku`, `droid-core`, `custom-model`)
- `reasoningEffort`: Structured thinking level (`off`, `none`, `low`, `medium`, `high`)
- `autonomyLevel`: Default autonomy mode (`normal`, `spec`, `auto-low`, `auto-medium`, `auto-high`)
- `cloudSessionSync`: Mirror CLI sessions to Factory web (`true`/`false`)
- `diffMode`: Code diff display style (`github`, `unified`)
- `completionSound`: Audio cue on response finish (`off`, `bell`)
- `commandAllowlist`: Commands that run without confirmation
- `commandDenylist`: Commands that always require confirmation
- `includeCoAuthoredByDroid`: Add co-author trailer to commits (`true`/`false`)
- `enableDroidShield`: Enable secret scanning and git guardrails (`true`/`false`)

### 2. MCP Configuration (`mcp.json`)

| Level | Path |
|-------|------|
| User (macOS/Linux) | `~/.factory/mcp.json` |
| User (Windows) | `%USERPROFILE%\.factory\mcp.json` |
| Project | `.factory/mcp.json` |

**Format**: JSON

**Example Content**:
```json
{
  "mcpServers": {
    "linear": {
      "type": "http",
      "url": "https://mcp.linear.app/mcp",
      "disabled": false
    },
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "disabled": false
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {
        "CONTEXT7_API_KEY": "your_api_key"
      }
    }
  }
}
```

**MCP Server Types**:
- **HTTP**: Remote MCP endpoints (cloud services)
  - `type`: `"http"`
  - `url`: HTTP/HTTPS endpoint URL
  - `headers`: Optional HTTP headers for auth
  - `disabled`: Boolean to temporarily disable

- **Stdio**: Local process servers
  - `type`: `"stdio"`
  - `command`: Executable to run
  - `args`: Command-line arguments array
  - `env`: Environment variables object
  - `disabled`: Boolean to temporarily disable

## Acceptance Criteria

1. [ ] Add Droid CLI to predefined tools list
2. [ ] Support `settings.json` with correct paths for all OS
3. [ ] Support `mcp.json` (user-level) with correct paths for all OS
4. [ ] Auto-detect if `~/.factory/` directory exists
5. [ ] Proper JSON syntax highlighting and validation
6. [ ] Display tool icon/branding if available

## Technical Notes

- Droid CLI creates `~/.factory/` directory on first run
- User config takes priority over project config for MCP
- OAuth tokens are stored in system keyring, not in config files
- Settings file is created with defaults on first run if it doesn't exist

## References

- [Factory Droid MCP Documentation](https://docs.factory.ai/cli/configuration/mcp)
- [Factory Droid Settings Documentation](https://docs.factory.ai/cli/configuration/settings)
- [Factory Droid CLI Reference](https://docs.factory.ai/reference/cli-reference)
