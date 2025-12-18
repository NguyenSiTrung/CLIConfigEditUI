# CLI Config Editor

A cross-platform desktop application for managing configuration files of AI Coding CLI tools.

![Tauri](https://img.shields.io/badge/Tauri-v2-blue?logo=tauri)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)

## Problem

AI coding assistants (Claude CLI, Aider, Continue, Amp, etc.) each store settings in different locations across your filesystem. Finding and editing these configuration files is tedious, especially when using multiple tools daily.

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
- ✅ Dark and light theme support
- ✅ Custom tool configurations
- ✅ Unsaved changes indicator
- ✅ Format/prettify code
- ✅ Keyboard shortcuts (Ctrl+S to save)
- ✅ Toast notifications
- ✅ Persistent settings (theme, custom tools)

## Supported Platforms

| Platform | Status |
|----------|--------|
| macOS    | ✅     |
| Ubuntu/Linux | ✅ |
| Windows  | ✅     |

## Pre-configured CLI Tools

| Tool | Config Format | Auto-detect |
|------|---------------|-------------|
| Claude CLI | JSON | ✅ |
| Aider | YAML | ✅ |
| Continue | JSON | ✅ |
| Amp | TOML/JSON | ✅ |
| GitHub Copilot CLI | YAML | ✅ |
| Cursor | JSON | ✅ |
| Cody CLI | JSON | ✅ |

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
git clone https://github.com/your-username/cli-config-editor.git
cd cli-config-editor

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
