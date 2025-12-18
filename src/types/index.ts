export type ConfigFormat = 'json' | 'yaml' | 'toml' | 'ini' | 'md';

// A single config file entry (user-managed)
export interface ConfigFile {
  id: string;
  label: string;        // User-defined label: "Settings", "MCP", "Memory", etc.
  path: string;         // File path
  format: ConfigFormat;
  icon?: string;        // Optional icon/emoji
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
