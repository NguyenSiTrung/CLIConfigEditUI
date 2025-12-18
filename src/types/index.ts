export type ConfigFormat = 'json' | 'yaml' | 'toml' | 'ini';

export interface PlatformPaths {
  macos: string[];
  linux: string[];
  windows: string[];
}

export interface CliTool {
  id: string;
  name: string;
  icon?: string;
  configPaths: PlatformPaths;
  configFormat: ConfigFormat;
  schemaUrl?: string;
  docsUrl?: string;
  description?: string;
}

export interface CustomTool {
  id: string;
  name: string;
  configPath: string;
  configFormat: ConfigFormat;
  description?: string;
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
