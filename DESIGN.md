# Design Document

## Overview

CLI Config Editor is a Tauri-based desktop application that provides a unified interface for managing AI CLI tool configuration files across macOS, Linux, and Windows.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Sidebar    │  │  Editor View │  │  Settings Panel   │   │
│  │  (Tool List)│  │  (Monaco)    │  │                   │   │
│  └─────────────┘  └──────────────┘  └───────────────────┘   │
│                           │                                  │
│                    React + TypeScript                        │
└───────────────────────────┬─────────────────────────────────┘
                            │ Tauri IPC (Commands)
┌───────────────────────────┴─────────────────────────────────┐
│                        Backend (Rust)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Commands   │  │  Config      │  │  File System      │   │
│  │  (IPC API)  │  │  Registry    │  │  Operations       │   │
│  └─────────────┘  └──────────────┘  └───────────────────┘   │
│                           │                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Validator  │  │  Watcher     │  │  Platform         │   │
│  │  (JSON/YAML)│  │  (notify-rs) │  │  Abstraction      │   │
│  └─────────────┘  └──────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Choices

### Why Tauri over Electron?

| Aspect | Tauri | Electron |
|--------|-------|----------|
| Bundle size | ~3-10 MB | ~150+ MB |
| Memory usage | Low | High |
| Security | Rust + sandboxing | Node.js |
| Native feel | Uses system webview | Chromium |
| Cross-platform | ✅ | ✅ |

### Frontend Stack

- **React 18**: Component-based UI with hooks
- **TypeScript 5.6**: Type safety and better DX
- **Tailwind CSS 3.4**: Utility-first styling with dark/light theme support
- **Monaco Editor**: VS Code's editor for config editing
- **Zustand**: Lightweight state management with persistence
- **Lucide React**: Modern icon library

### Backend Stack

- **Rust**: Memory safety, performance, cross-platform
- **Tauri v2**: IPC, window management, native APIs
- **serde**: JSON/YAML/TOML serialization
- **notify**: File system watching
- **dirs**: Cross-platform directory resolution

## Core Modules

### 1. Config Registry

Manages the database of known CLI tools and their configuration paths.

```rust
pub struct CliToolConfig {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub config_paths: PlatformPaths,
    pub config_format: ConfigFormat,
    pub schema: Option<String>,  // JSON Schema for validation
    pub docs_url: Option<String>,
}

pub struct PlatformPaths {
    pub macos: Vec<String>,      // e.g., ["~/.claude/settings.json"]
    pub linux: Vec<String>,
    pub windows: Vec<String>,    // e.g., ["%USERPROFILE%\\.claude\\settings.json"]
}

pub enum ConfigFormat {
    Json,
    Yaml,
    Toml,
    Ini,
}
```

### 2. File System Operations

Handles reading, writing, and watching configuration files.

```rust
// Commands exposed to frontend
#[tauri::command]
async fn read_config(tool_id: &str) -> Result<ConfigContent, Error>;

#[tauri::command]
async fn write_config(tool_id: &str, content: &str) -> Result<(), Error>;

#[tauri::command]
async fn detect_installed_tools() -> Result<Vec<DetectedTool>, Error>;

#[tauri::command]
async fn watch_config(tool_id: &str) -> Result<(), Error>;
```

### 3. Validation Engine

Validates configuration content before saving.

- JSON Schema validation for structured configs
- Syntax validation for all formats
- Custom validators for specific tools

### 4. Custom Tool Manager

Allows users to add their own CLI tool configurations.

```rust
pub struct CustomTool {
    pub name: String,
    pub config_path: String,      // User provides absolute path
    pub config_format: ConfigFormat,
    pub description: Option<String>,
}
```

## Data Flow

### Reading a Config File

```
User clicks tool → Frontend calls read_config(tool_id)
                         ↓
           Backend resolves platform-specific path
                         ↓
           Backend reads file, detects format
                         ↓
           Returns content to frontend
                         ↓
           Monaco Editor displays with syntax highlighting
```

### Saving a Config File

```
User edits in Monaco → Frontend validates syntax
                         ↓
           Frontend calls write_config(tool_id, content)
                         ↓
           Backend validates content (schema if available)
                         ↓
           Backend creates backup of original
                         ↓
           Backend writes new content atomically
                         ↓
           Returns success/error to frontend
```

## Security Considerations

### File Access

1. **Sandboxed paths**: Only allow access to known config directories
2. **Path validation**: Prevent path traversal attacks
3. **Atomic writes**: Use temp file + rename to prevent corruption
4. **Backup creation**: Auto-backup before every write

### Tauri Security

1. **CSP**: Strict Content Security Policy
2. **IPC allowlist**: Only expose necessary commands
3. **No shell access**: File operations via Rust only
4. **Capabilities**: Tauri v2 uses capability-based permissions defined in `src-tauri/capabilities/`

### Tauri v2 Capabilities

Permissions are defined in `src-tauri/capabilities/main.json`:

```json
{
  "identifier": "main",
  "permissions": [
    "core:default",
    "dialog:default",
    "fs:default",
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    {
      "identifier": "fs:scope",
      "allow": ["$HOME/**", "$CONFIG/**", "$APPDATA/**"]
    }
  ]
}
```

## UI/UX Design

### Main Window Layout

```
┌──────────────────────────────────────────────────────────┐
│  CLI Config Editor                          [─] [□] [×]  │
├──────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌───────────────────────────────────────┐ │
│ │ 🔍 Search  │ │ Claude CLI - settings.json            │ │
│ ├────────────┤ ├───────────────────────────────────────┤ │
│ │            │ │ 1  {                                  │ │
│ │ INSTALLED  │ │ 2    "model": "claude-3-opus",        │ │
│ │ ├─ Claude  │ │ 3    "temperature": 0.7,              │ │
│ │ ├─ Aider   │ │ 4    "maxTokens": 4096                │ │
│ │ └─ Amp     │ │ 5  }                                  │ │
│ │            │ │                                       │ │
│ │ AVAILABLE  │ │                                       │ │
│ │ ├─ Continue│ │                                       │ │
│ │ └─ Cody    │ │                                       │ │
│ │            │ │                                       │ │
│ │ CUSTOM     │ ├───────────────────────────────────────┤ │
│ │ └─ + Add   │ │ [Validate] [Format]      [💾 Save]    │ │
│ └────────────┘ └───────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Key Features

1. **Auto-detection**: Scan for installed tools on startup
2. **Syntax highlighting**: Per-format highlighting in Monaco
3. **Validation**: Real-time syntax + schema validation
4. **Search**: Filter tools by name
5. **Backup indicator**: Show when backups exist
6. **External changes**: Detect and prompt for reload

## State Management

Using Zustand with persistence middleware for state that survives app restarts.

```typescript
interface AppState {
  // Tools
  installedTools: CliTool[];
  customTools: CustomTool[];
  
  // Editor
  activeToolId: string | null;
  editorContent: string;
  originalContent: string;
  currentFilePath: string | null;
  currentFormat: ConfigFormat;
  
  // UI
  searchQuery: string;
  sidebarCollapsed: boolean;
  isLoading: boolean;
  error: string | null;
  theme: 'dark' | 'light';
  
  // Computed
  isDirty: () => boolean;
  getFilteredTools: () => { installed, available, custom };
}

// Persisted state (survives app restart)
// - customTools
// - sidebarCollapsed  
// - theme
```

## Error Handling

| Error Type | User Message | Recovery |
|------------|--------------|----------|
| File not found | "Config file doesn't exist. Create it?" | Offer to create with defaults |
| Permission denied | "Cannot access file. Check permissions." | Show path, suggest fix |
| Invalid syntax | "Syntax error on line X" | Highlight line, don't save |
| Schema violation | "Invalid value for 'model'" | Show specific field error |

## Future Enhancements

1. **Backup system**: Auto-backup before saving with restore capability
2. **File picker**: Native file picker for custom tool paths
3. **Edit/delete custom tools**: Manage existing custom configurations
4. **File watcher**: Detect external changes and prompt for reload
5. **Settings sync**: Export/import configurations
6. **Templates**: Pre-built configurations for common setups
7. **Diff view**: Compare current vs backup
8. **CLI integration**: `cli-config edit <tool>` command
9. **Plugin system**: Community-contributed tool definitions
