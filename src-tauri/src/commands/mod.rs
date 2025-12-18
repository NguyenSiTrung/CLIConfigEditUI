use crate::config::{get_cli_tools, CliTool};
use serde::Serialize;
use std::fs;
use std::path::PathBuf;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CommandError {
    #[error("Tool not found: {0}")]
    ToolNotFound(String),
    #[error("Config file not found: {0}")]
    ConfigNotFound(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Failed to resolve path: {0}")]
    PathResolution(String),
}

impl Serialize for CommandError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

#[derive(Debug, Serialize)]
pub struct ConfigReadResult {
    pub path: String,
    pub content: String,
}

fn expand_path(path: &str) -> Option<PathBuf> {
    let path = if path.starts_with('~') {
        dirs::home_dir()?.join(path.strip_prefix("~/").unwrap_or(&path[1..]))
    } else if path.starts_with("%USERPROFILE%") {
        dirs::home_dir()?.join(path.strip_prefix("%USERPROFILE%\\").unwrap_or(""))
    } else if path.starts_with("%APPDATA%") {
        dirs::config_dir()?.join(path.strip_prefix("%APPDATA%\\").unwrap_or(""))
    } else {
        PathBuf::from(path)
    };
    Some(path)
}

fn get_platform_paths(tool: &CliTool) -> &Vec<String> {
    #[cfg(target_os = "macos")]
    {
        &tool.config_paths.macos
    }
    #[cfg(target_os = "linux")]
    {
        &tool.config_paths.linux
    }
    #[cfg(target_os = "windows")]
    {
        &tool.config_paths.windows
    }
}

fn find_config_path(tool: &CliTool) -> Option<PathBuf> {
    let paths = get_platform_paths(tool);
    for path_str in paths {
        if let Some(path) = expand_path(path_str) {
            if path.exists() {
                return Some(path);
            }
        }
    }
    // Return first path even if doesn't exist (for creation)
    paths.first().and_then(|p| expand_path(p))
}

#[tauri::command]
pub fn get_tools() -> Vec<CliTool> {
    get_cli_tools()
}

#[tauri::command]
pub fn detect_installed_tools() -> Vec<CliTool> {
    get_cli_tools()
        .into_iter()
        .filter(|tool| {
            let paths = get_platform_paths(tool);
            paths.iter().any(|p| {
                expand_path(p).map(|path| path.exists()).unwrap_or(false)
            })
        })
        .collect()
}

#[tauri::command]
pub fn read_config(tool_id: String) -> Result<ConfigReadResult, CommandError> {
    let tools = get_cli_tools();
    let tool = tools
        .iter()
        .find(|t| t.id == tool_id)
        .ok_or_else(|| CommandError::ToolNotFound(tool_id.clone()))?;

    let path = find_config_path(tool)
        .ok_or_else(|| CommandError::PathResolution("Could not resolve config path".to_string()))?;

    if !path.exists() {
        return Err(CommandError::ConfigNotFound(
            path.to_string_lossy().to_string(),
        ));
    }

    let content = fs::read_to_string(&path)?;

    Ok(ConfigReadResult {
        path: path.to_string_lossy().to_string(),
        content,
    })
}

#[tauri::command]
pub fn read_file(path: String) -> Result<String, CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;

    if !expanded.exists() {
        return Err(CommandError::ConfigNotFound(
            expanded.to_string_lossy().to_string(),
        ));
    }

    Ok(fs::read_to_string(&expanded)?)
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;

    // Create parent directories if needed
    if let Some(parent) = expanded.parent() {
        fs::create_dir_all(parent)?;
    }

    // Create backup if file exists
    if expanded.exists() {
        let backup_path = expanded.with_extension("bak");
        fs::copy(&expanded, &backup_path)?;
    }

    // Write atomically via temp file
    let temp_path = expanded.with_extension("tmp");
    fs::write(&temp_path, &content)?;
    fs::rename(&temp_path, &expanded)?;

    Ok(())
}

#[tauri::command]
pub fn file_exists(path: String) -> bool {
    expand_path(&path).map(|p| p.exists()).unwrap_or(false)
}
