# Tech Stack

## Overview

CLI Config Editor is a Tauri v2 desktop application with a Rust backend and React TypeScript frontend.

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3 | UI component framework |
| TypeScript | 5.6 | Type-safe JavaScript |
| Vite | 6.0 | Build tool and dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Monaco Editor | 4.6 | Code editor (VS Code engine) |
| Zustand | 5.0 | State management with persistence |
| Lucide React | 0.561 | Icon library |

### Key Patterns

- Functional components with hooks
- TypeScript strict mode enabled
- File naming: `kebab-case.tsx` for components
- Component naming: PascalCase
- Named exports preferred

### State Management

```typescript
// Zustand store pattern
interface AppState {
  // State
  theme: 'dark' | 'light';
  selectedTool: Tool | null;
  
  // Actions
  setTheme: (theme: 'dark' | 'light') => void;
  selectTool: (tool: Tool) => void;
}
```

## Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Rust | 2021 Edition | Memory-safe systems language |
| Tauri | 2.x | Desktop app framework |
| serde | 1.x | Serialization (JSON/YAML/TOML) |
| serde_json | 1.x | JSON parsing |
| thiserror | 1.x | Error handling |
| dirs | 5.x | Cross-platform directory resolution |

### Tauri Plugins

- `tauri-plugin-dialog` - Native file picker dialogs
- `tauri-plugin-fs` - File system operations

### Key Patterns

- Commands exposed via `#[tauri::command]`
- Error types with `thiserror`
- `Result<T, E>` over panics
- Module naming: snake_case

## Development Tools

| Tool | Purpose |
|------|---------|
| pnpm | Package manager |
| ESLint | JavaScript/TypeScript linting |
| Prettier | Code formatting |
| Vitest | Frontend testing |
| Cargo | Rust package manager |
| Clippy | Rust linting |

## Build & Run Commands

```bash
# Development
pnpm tauri dev          # Full app with hot reload
pnpm dev                # Frontend only

# Build
pnpm tauri build        # Production build

# Quality
pnpm typecheck          # TypeScript check
pnpm lint               # ESLint
pnpm format             # Prettier
pnpm test               # Vitest

# Rust
cd src-tauri && cargo clippy   # Rust linting
cd src-tauri && cargo test     # Rust tests
```

## Project Structure

```
src/                    # Frontend (TypeScript + React)
├── components/         # UI components
├── stores/             # Zustand stores
├── types/              # TypeScript types
└── utils/              # Utilities and CLI tool definitions

src-tauri/              # Backend (Rust)
├── src/
│   ├── commands/       # Tauri IPC commands
│   ├── config/         # CLI tool definitions
│   └── lib.rs          # App entry point
├── capabilities/       # Tauri v2 permissions
└── Cargo.toml
```

## Platform Requirements

### Ubuntu/Debian
```bash
sudo apt-get install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  libjavascriptcoregtk-4.1-dev \
  libsoup-3.0-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### macOS
```bash
xcode-select --install
```

### Windows
- Visual Studio Build Tools with C++ workload
- WebView2 Runtime

## Constraints

1. **Bundle Size**: Target < 10MB (Tauri advantage)
2. **Memory**: Idle < 100MB
3. **Startup**: < 2 seconds
4. **No Network**: All operations local, no telemetry
5. **Cross-Platform**: Support macOS 11+, Ubuntu 20.04+, Windows 10+
