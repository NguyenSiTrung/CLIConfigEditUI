export type ConfigFormat = 'json' | 'yaml' | 'toml' | 'ini' | 'md';

// A single config file entry (user-managed)
export interface ConfigFile {
  id: string;
  label: string;        // User-defined label: "Settings", "MCP", "Memory", etc.
  path: string;         // File path
  format: ConfigFormat;
  icon?: string;        // Optional icon/emoji
  jsonPath?: string;    // For partial JSON editing - dot-notation path to extract/edit (e.g., "mcpServers")
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
