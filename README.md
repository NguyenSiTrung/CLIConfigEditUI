# CLI Config Editor

A cross-platform desktop application for managing configuration files of AI Coding CLI tools.

![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

## Problem

AI coding assistants (Claude Code, Gemini CLI, Amp, Cursor, etc.) each store settings in different locations across your filesystem. Finding and editing these configuration files is tedious, especially when using multiple tools daily.

## Solution

CLI Config Editor provides a unified interface to:
- **Discover** configuration files for popular AI CLI tools automatically
- **Edit** settings with syntax highlighting and validation
- **Manage** custom CLI tool configurations
- **Theme** support with dark and light modes

## Screenshots

| Dark Theme | Light Theme |
|------------|-------------|
| ![Dark](docs/screenshots/dark.png) | ![Light](docs/screenshots/light.png) |

## Features

- ✅ Auto-detection of installed CLI tools
- ✅ Monaco Editor with syntax highlighting (JSON, YAML, TOML, INI)
- ✅ Dark, light, and system theme support
- ✅ Custom tool configurations
- ✅ Unsaved changes indicator (visual dot on sidebar items)
- ✅ Format/prettify code
- ✅ Comprehensive keyboard shortcuts
- ✅ Toast notifications
- ✅ Persistent settings (theme, custom tools)
- ✅ **Config file versioning** - Save, compare, and switch between config snapshots
- ✅ **MCP Settings Sync** - Sync MCP server configurations across all AI coding tools
- ✅ **Command Palette** - Quick access to all actions (Ctrl/Cmd+K)
- ✅ **Auto-save** - Optional automatic saving with configurable delay
- ✅ **Reduced motion** - Accessibility option to minimize animations

## Supported Platforms

| Platform | Status |
|----------|--------|
| macOS | ✅ Tested |
| Ubuntu/Linux | ✅ Tested |
| Windows | ⚠️ Supported (not tested) |

> **Note:** Windows support is implemented but has not been tested. Please report any issues.

## Pre-configured CLI Tools

| Tool | Config Format | Description |
|------|---------------|-------------|
| Claude Code | JSON/Markdown | Anthropic's official Claude Code CLI |
| Gemini CLI | JSON/Markdown | Google's Gemini CLI |
| Amp | JSON/Markdown | Sourcegraph's AI coding agent |
| GitHub Copilot CLI | JSON | GitHub's agentic AI coding assistant |
| Cursor | JSON | AI-first code editor |
| OpenCode | JSON | AI coding agent by SST |
| Factory Droid CLI | JSON | Factory's AI coding agent |
| Qwen Code | JSON/Markdown | Alibaba's AI coding agent CLI |
| Augment Code CLI (Auggie) | JSON | Augment Code's AI coding CLI |
| Kiro CLI | JSON | AWS Kiro agentic coding CLI |
| Rovo Dev CLI | YAML/JSON | Atlassian's Rovo Dev AI coding CLI |
| Qoder CLI | JSON | Qoder's AI coding CLI |
| Letta Code | JSON | Memory-first, model-agnostic coding agent |

### IDE Platforms (Extension Settings)

| Platform | Description |
|----------|-------------|
| VS Code | Visual Studio Code extension settings |
| Cursor | Cursor IDE extension settings |
| Windsurf | Codeium's AI-native IDE |
| Antigravity | Google's agent-first development platform |

## Tech Stack

- **Framework**: [Tauri v2](https://tauri.app/) - Rust backend + web frontend
- **Backend**: Rust - File system operations, security, platform APIs
- **Frontend**: TypeScript + React 18 + Tailwind CSS
- **Editor**: Monaco Editor (VS Code's editor component)
- **State**: Zustand with persistence

## Quick Start

### Prerequisites

- **Node.js 18+** and **pnpm** (or npm/yarn)
- **Rust** (install via [rustup](https://rustup.rs/))

### System Dependencies

#### Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### macOS

```bash
xcode-select --install
```

#### Windows

- Install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with C++ workload
- Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 10/11)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/NguyenSiTrung/CLIConfigEditUI.git
cd CLIConfigEditUI

# Install dependencies
pnpm install

# Development mode (with hot reload)
pnpm tauri dev

# Build for production
pnpm tauri build
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm tauri dev` | Start development with Tauri |
| `pnpm tauri build` | Build production app |
| `pnpm dev` | Frontend only (no Tauri) |
| `pnpm typecheck` | Run TypeScript type checker |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run frontend tests |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save current file |
| `Ctrl/Cmd + K` | Open Command Palette |
| `Ctrl/Cmd + ,` | Open Settings |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Ctrl/Cmd + Shift + M` | Toggle MCP panel |
| `Alt/Option + Shift + F` | Format code |
| `Escape` | Close modal/dialog |

## Project Structure

```
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # UI components
│   │   ├── header.tsx      # App header with theme toggle
│   │   ├── sidebar.tsx     # Tool list sidebar
│   │   ├── config-editor.tsx # Monaco editor wrapper
│   │   ├── welcome-screen.tsx # Initial landing page
│   │   ├── add-tool-modal.tsx # Custom tool dialog
│   │   ├── settings-modal.tsx # Settings dialog
│   │   └── toast.tsx       # Toast notifications
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # CLI tool definitions
├── src-tauri/              # Backend (Rust)
│   ├── src/
│   │   ├── commands/       # Tauri commands (IPC)
│   │   ├── config/         # CLI tool definitions
│   │   └── lib.rs          # App entry point
│   ├── capabilities/       # Tauri v2 permissions
│   ├── icons/              # App icons
│   └── Cargo.toml
├── docs/                   # Documentation
└── public/                 # Static assets
```

## Documentation

- [Design Document](./DESIGN.md) - Architecture and technical decisions
- [Requirements](./REQUIREMENTS.md) - Detailed specifications
- [CLI Configs Reference](./docs/CLI_CONFIGS.md) - Supported tools and paths

## Config Versioning

Save and manage multiple versions of each configuration file:

| Feature | Description |
|---------|-------------|
| **Save Version** | Snapshot current or custom content with name and description |
| **Apply Version** | Load a saved version into the editor |
| **Compare Versions** | Side-by-side diff view using Monaco diff editor |
| **Edit Version** | Modify version content directly without applying |
| **Set Default** | Mark a version as the default for quick access |
| **Duplicate/Rename** | Organize versions with copy and rename operations |

### How to Use

1. Open any config file in the editor
2. Click the **Versions** tab in the toolbar
3. Click **Save Version** to create a snapshot
4. Select versions to compare or click **Edit/Apply** to use them

Versions are stored in the app's data directory and persist across sessions.

## MCP Settings Sync

Manage and synchronize MCP (Model Context Protocol) server configurations across all your AI coding tools with automatic format conversion.

| Feature | Description |
|---------|-------------|
| **Source Modes** | Import from Claude (`~/.claude.json`) or maintain app-managed list |
| **Multi-tool Sync** | Sync to Claude, Gemini CLI, Amp, GitHub Copilot CLI, OpenCode, Factory Droid, Qwen Code |
| **Format Conversion** | Automatic conversion between Standard, Copilot, and OpenCode formats |
| **Preview Changes** | See exactly what will change before applying |
| **Conflict Resolution** | Resolve conflicts when source and target have different configs for the same server |
| **Backups** | Automatic backup before any modification |

### Supported Tools for MCP Sync

| Tool | Config Path | Format |
|------|-------------|--------|
| Claude Code | `~/.claude.json` | Standard (`mcpServers`) |
| Gemini CLI | `~/.gemini/settings.json` | Standard (`mcpServers`) |
| Amp | `~/.config/amp/settings.json` | Standard (`amp.mcpServers`) |
| GitHub Copilot CLI | `~/.copilot/mcp-config.json` | Copilot (`servers`) |
| OpenCode | `~/.config/opencode/opencode.json` | OpenCode (`mcp`) |
| Factory Droid CLI | `~/.factory/mcp.json` | Standard (`mcpServers`) |
| Qwen Code | `~/.qwen/settings.json` | Standard (`mcpServers`) |
| Qoder CLI | `~/.qoder.json` | Standard (`mcpServers`) |

### How to Use

1. Click **MCP Sync** in the header to switch to MCP settings view
2. Choose source: **Claude Import** or **App-Managed**
3. View tool sync status (green = synced, yellow = out-of-sync)
4. Click **Sync** on individual tools or **Sync All** for batch sync
5. Review preview and resolve any conflicts before applying

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, no code change
refactor: code restructure
test: add tests
chore: maintenance
```

## License

MIT
