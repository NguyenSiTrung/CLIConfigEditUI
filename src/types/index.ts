export type ConfigFormat = 'json' | 'yaml' | 'toml' | 'ini' | 'md';

// A single config file entry (user-managed)
export interface ConfigFile {
  id: string;
  label: string;        // User-defined label: "Settings", "MCP", "Memory", etc.
  path: string;         // File path (local path or SSH path for remote)
  format: ConfigFormat;
  icon?: string;        // Optional icon/emoji
  jsonPath?: string;    // For partial JSON editing - dot-notation path to extract/edit (e.g., "mcpServers")
  pathType?: PathType;  // 'local' or 'ssh' - defaults to 'local' if undefined
  sshPath?: string;     // Full SSH path: user@host:/path (only set when pathType is 'ssh')
}

// CLI Tool metadata (no config paths - all user-managed)
export interface CliTool {
  id: string;
  name: string;
  icon?: string;
  docsUrl?: string;
  description?: string;
  // Suggested config files for quick setup (not enforced)
  suggestedConfigs?: SuggestedConfig[];
}

// Suggested config for quick setup
export interface SuggestedConfig {
  label: string;
  path: string;         // Path template with ~ or %USERPROFILE%
  format: ConfigFormat;
  icon?: string;
  description?: string;
  jsonPath?: string;    // For partial JSON editing - dot-notation path to extract/edit (e.g., "mcpServers")
}

// User's config files for a tool (persisted)
export interface ToolConfigFiles {
  toolId: string;
  configFiles: ConfigFile[];
}

// Legacy - keep for backward compatibility during migration
export interface CustomTool {
  id: string;
  name: string;
  configPath: string;
  configFormat: ConfigFormat;
  description?: string;
  icon?: string;
}

// Legacy - keep for backward compatibility
export interface PlatformPaths {
  macos: string[];
  linux: string[];
  windows: string[];
}

export interface DetectedTool {
  tool: CliTool;
  resolvedPath: string;
  exists: boolean;
}

export interface ConfigContent {
  path: string;
  content: string;
  format: ConfigFormat;
  lastModified?: number;
}

// IDE Platform definitions (VS Code, Cursor, Windsurf, etc.)
export interface IdePlatform {
  id: string;
  name: string;
  icon?: string;
  docsUrl?: string;
  description?: string;
  // Platform-specific settings.json paths
  settingsPaths: {
    linux: string;
    macos: string;
    windows: string;
  };
  // Extensions that can be installed in this IDE
  extensions?: IdeExtensionConfig[];
}

// Extension configuration within an IDE
export interface IdeExtensionConfig {
  extensionId: string;        // Reference to IdeExtension.id
  label: string;              // Display label for this config
  jsonPathPrefix: string;     // e.g., "amp" for amp.* settings
  icon?: string;
  description?: string;
}

// IDE Extension definition (reusable across IDEs)
export interface IdeExtension {
  id: string;
  name: string;
  icon?: string;
  docsUrl?: string;
  description?: string;
  // The settings prefix used in IDE settings.json (e.g., "amp" for amp.*)
  settingsPrefix: string;
  // Suggested sub-paths within the extension's settings
  suggestedSettings?: ExtensionSetting[];
}

// Individual setting within an extension
export interface ExtensionSetting {
  label: string;
  jsonPath: string;           // Relative to extension prefix (e.g., "mcpServers" -> amp.mcpServers)
  icon?: string;
  description?: string;
}

// Config Version - represents a saved version of a config file
export type VersionSource = 'manual' | 'auto';

export interface ConfigVersion {
  id: string;                 // Unique version ID (UUID)
  configId: string;           // Reference to ConfigFile.id
  name: string;               // User-defined label (e.g., "Work Setup")
  content: string;            // Full config content
  description?: string;       // Optional notes about the version
  timestamp: number;          // Unix timestamp when created/modified
  source: VersionSource;      // Whether manually or auto-saved
  isDefault: boolean;         // If true, this version is the default for the config
}

// Version metadata for list display (excludes content for performance)
export interface VersionMetadata {
  id: string;
  configId: string;
  name: string;
  description?: string;
  timestamp: number;
  source: VersionSource;
  isDefault: boolean;
}

// ============================================
// MCP Settings Sync Types
// ============================================

// MCP Server configuration
export interface McpServer {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  disabled?: boolean;
  url?: string;
  target?: string;
  extra?: Record<string, unknown>;
}

// Source mode for MCP servers
export type McpSourceMode = 'claude' | 'app-managed';

// MCP configuration stored in app
export interface McpConfig {
  sourceMode: McpSourceMode;
  servers: McpServer[];
  enabledTools: string[]; // Tool IDs that are enabled for sync
}

// Tool format type for MCP config
export type McpToolFormat = 'standard' | 'copilot' | 'opencode';

// MCP tool information with format details
export interface McpToolInfo {
  toolId: string;
  configPath: string;
  jsonPath: string;
  format: McpToolFormat;
  name: string;
}

// Sync status for a tool
export type McpSyncStatus = 'synced' | 'out-of-sync' | 'conflicts' | 'not-installed' | 'no-mcp';

// MCP status for a tool
export interface McpToolStatus {
  toolId: string;
  name: string;
  installed: boolean;
  configPath: string;
  syncStatus: McpSyncStatus;
  serverCount: number;
  enabled: boolean;
}

// Conflict between source and target servers
export interface McpServerConflict {
  serverName: string;
  sourceServer: McpServer;
  targetServer: McpServer;
  toolId: string;
}

// Merge result showing what would change
export interface McpMergeResult {
  toolId: string;
  added: McpServer[];     // Servers to add
  kept: McpServer[];      // Servers already present
  conflicts: McpServerConflict[];
}

// Preview of sync changes for a tool
export interface McpSyncPreview {
  toolId: string;
  toolName: string;
  mergeResult: McpMergeResult;
  hasChanges: boolean;
}

// Conflict resolution choice
export type McpConflictResolution = 'use-source' | 'use-target' | 'use-custom';

// Result of sync operation
export interface McpSyncResult {
  toolId: string;
  success: boolean;
  message: string;
  serversWritten: number;
}

// Full config content preview
export interface McpConfigPreview {
  toolId: string;
  toolName: string;
  configPath: string;
  currentContent: string;
  previewContent: string;
}

// Detected MCP config format from file import
export type McpDetectedFormat = 'standard' | 'amp' | 'copilot' | 'opencode';

// Result of importing MCP config from file
export interface McpImportResult {
  servers: McpServer[];
  sourcePath: string;
  detectedFormat: McpDetectedFormat;
}

// Import mode for MCP servers
export type McpImportMode = 'replace' | 'merge';

// ============================================
// Tool Visibility & Favorites Types
// ============================================

// Tool visibility state for pinning, hiding, and custom ordering
export interface ToolVisibilityState {
  pinnedTools: string[];      // Tool IDs that are pinned (appear at top)
  hiddenTools: string[];      // Tool IDs that are hidden from view
  toolOrder: string[];        // Custom order of CLI tool IDs (for reordering)
  customToolOrder: string[];  // Custom order of custom tool IDs (for reordering)
}

// Actions for tool visibility store
export interface ToolVisibilityActions {
  pinTool: (toolId: string) => void;
  unpinTool: (toolId: string) => void;
  togglePinTool: (toolId: string) => void;
  hideTool: (toolId: string) => void;
  showTool: (toolId: string) => void;
  toggleHideTool: (toolId: string) => void;
  reorderTools: (toolIds: string[]) => void;
  reorderCustomTools: (toolIds: string[]) => void;
  moveToolUp: (toolId: string) => void;
  moveToolDown: (toolId: string) => void;
  resetVisibility: () => void;
}

// ============================================
// Backend Error Types
// ============================================

// Error types returned from Rust backend
export type BackendErrorType = 
  | 'ConfigNotFound'
  | 'Io'
  | 'PermissionDenied'
  | 'PathResolution'
  | 'JsonParse'
  | 'JsonPathNotFound';

// Structured error response from backend
export interface BackendError {
  error_type: BackendErrorType;
  message: string;
}

// Helper to parse backend errors from Tauri invoke
export function parseBackendError(error: unknown): BackendError | null {
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.error_type === 'string' && typeof err.message === 'string') {
      return {
        error_type: err.error_type as BackendErrorType,
        message: err.message,
      };
    }
  }
  return null;
}

// Check if error is a "file not found" type (safe to create new file)
export function isFileNotFoundError(error: BackendError | null): boolean {
  return error?.error_type === 'ConfigNotFound';
}

// Check if error is a parse/read error (should show error banner)
export function isFileReadError(error: BackendError | null): boolean {
  if (!error) return false;
  return ['JsonParse', 'PermissionDenied', 'Io'].includes(error.error_type);
}

// ============================================
// Path Safety Types (from Rust backend)
// ============================================

export type PathSafetyLevel = 'safe' | 'warn' | 'block';

export interface PathSafetyResult {
  path: string;
  resolvedPath: string;
  safetyLevel: PathSafetyLevel;
}

// ============================================
// SSH Remote Config Types
// ============================================

// Path type for config files - local or SSH remote
export type PathType = 'local' | 'ssh';

// SSH connection status
export type SshConnectionStatus = 'connected' | 'disconnected' | 'error' | 'checking';

// SSH connection info returned from backend
export interface SshConnectionInfo {
  user?: string;
  host: string;
  port?: number;
  path: string;
}

// SSH status result from backend
export interface SshStatusResult {
  status: 'connected' | 'disconnected' | 'error';
  error?: string;
}

// Extended ConfigFile with SSH support (deprecated - use ConfigFile directly)
export type ConfigFileWithSsh = ConfigFile;

// Remote tool config - combines tool info with SSH config
export interface RemoteToolConfig {
  toolId: string;
  configFileId: string;
  sshPath: string;
  connectionStatus: SshConnectionStatus;
  lastError?: string;
  lastChecked?: number;
}
