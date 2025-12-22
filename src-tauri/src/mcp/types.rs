use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum McpError {
    #[error("MCP config not found: {0}")]
    NotFound(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Failed to get app data directory")]
    AppDataDir,
    #[error("Invalid config format: {0}")]
    InvalidFormat(String),
    #[error("Tool not supported: {0}")]
    ToolNotSupported(String),
}

impl Serialize for McpError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct McpServer {
    pub name: String,
    #[serde(default)]
    pub command: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub args: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub env: Option<HashMap<String, String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub disabled: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "_target")]
    pub target: Option<String>,
    /// Extra fields we don't explicitly handle - preserved on read/write
    #[serde(flatten, skip_serializing_if = "Option::is_none")]
    pub extra: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
#[serde(rename_all = "kebab-case")]
pub enum McpSourceMode {
    #[default]
    Claude,
    AppManaged,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpConfig {
    pub source_mode: McpSourceMode,
    pub servers: Vec<McpServer>,
    pub enabled_tools: Vec<String>,
}

impl Default for McpConfig {
    fn default() -> Self {
        McpConfig {
            source_mode: McpSourceMode::Claude,
            servers: Vec::new(),
            enabled_tools: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum McpToolFormat {
    Standard,  // Claude, Gemini, Amp, Droid, Qwen
    Copilot,   // GitHub Copilot - uses "servers" key
    Opencode,  // OpenCode - uses "mcp" with different structure
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpToolInfo {
    pub tool_id: String,
    pub config_path: String,
    pub json_path: String,
    pub format: McpToolFormat,
    pub name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum McpSyncStatus {
    Synced,
    OutOfSync,
    Conflicts,
    NotInstalled,
    NoMcp,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpToolStatus {
    pub tool_id: String,
    pub name: String,
    pub installed: bool,
    pub config_path: String,
    pub sync_status: McpSyncStatus,
    pub server_count: u32,
    pub enabled: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpServerConflict {
    pub server_name: String,
    pub source_server: McpServer,
    pub target_server: McpServer,
    pub tool_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpMergeResult {
    pub tool_id: String,
    pub added: Vec<McpServer>,
    pub kept: Vec<McpServer>,
    pub conflicts: Vec<McpServerConflict>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpSyncPreview {
    pub tool_id: String,
    pub tool_name: String,
    pub merge_result: McpMergeResult,
    pub has_changes: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpConfigPreview {
    pub tool_id: String,
    pub tool_name: String,
    pub config_path: String,
    pub current_content: String,
    pub preview_content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
#[allow(dead_code)]
pub enum McpConflictResolution {
    Source,
    Target,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct McpSyncResult {
    pub tool_id: String,
    pub success: bool,
    pub message: String,
    pub servers_written: u32,
}

// MCP tool definitions - which tools support MCP and their config locations
pub fn get_mcp_tool_definitions() -> Vec<McpToolInfo> {
    vec![
        McpToolInfo {
            tool_id: "claude-code".to_string(),
            config_path: "~/.claude.json".to_string(),
            json_path: "mcpServers".to_string(),
            format: McpToolFormat::Standard,
            name: "Claude Code".to_string(),
        },
        McpToolInfo {
            tool_id: "gemini-cli".to_string(),
            config_path: "~/.gemini/settings.json".to_string(),
            json_path: "mcpServers".to_string(),
            format: McpToolFormat::Standard,
            name: "Gemini CLI".to_string(),
        },
        McpToolInfo {
            tool_id: "amp".to_string(),
            config_path: "~/.config/amp/settings.json".to_string(),
            json_path: "amp.mcpServers".to_string(),
            format: McpToolFormat::Standard,
            name: "Amp".to_string(),
        },
        McpToolInfo {
            tool_id: "copilot-cli".to_string(),
            config_path: "~/.copilot/mcp-config.json".to_string(),
            json_path: "servers".to_string(),
            format: McpToolFormat::Copilot,
            name: "GitHub Copilot CLI".to_string(),
        },
        McpToolInfo {
            tool_id: "opencode".to_string(),
            config_path: "~/.config/opencode/opencode.json".to_string(),
            json_path: "mcp".to_string(),
            format: McpToolFormat::Opencode,
            name: "OpenCode".to_string(),
        },
        McpToolInfo {
            tool_id: "factory-droid".to_string(),
            config_path: "~/.factory/mcp.json".to_string(),
            json_path: "mcpServers".to_string(),
            format: McpToolFormat::Standard,
            name: "Factory Droid CLI".to_string(),
        },
        McpToolInfo {
            tool_id: "qwen-code".to_string(),
            config_path: "~/.qwen/settings.json".to_string(),
            json_path: "mcpServers".to_string(),
            format: McpToolFormat::Standard,
            name: "Qwen Code".to_string(),
        },
    ]
}

pub fn get_mcp_tool_info(tool_id: &str) -> Option<McpToolInfo> {
    get_mcp_tool_definitions()
        .into_iter()
        .find(|t| t.tool_id == tool_id)
}
