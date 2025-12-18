use crate::config::{get_cli_tools, CliTool};
use serde::{Deserialize, Serialize};
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

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileExistsResult {
    pub path: String,
    pub exists: bool,
    pub resolved_path: String,
}

pub fn expand_path(path: &str) -> Option<PathBuf> {
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

#[tauri::command]
pub fn get_tools() -> Vec<CliTool> {
    get_cli_tools()
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
pub fn file_exists(path: String) -> FileExistsResult {
    let resolved = expand_path(&path);
    let exists = resolved.as_ref().map(|p| p.exists()).unwrap_or(false);
    let resolved_path = resolved
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| path.clone());
    
    FileExistsResult {
        path,
        exists,
        resolved_path,
    }
}

#[tauri::command]
pub fn check_multiple_paths(paths: Vec<String>) -> Vec<FileExistsResult> {
    paths.into_iter().map(|path| {
        let resolved = expand_path(&path);
        let exists = resolved.as_ref().map(|p| p.exists()).unwrap_or(false);
        let resolved_path = resolved
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|| path.clone());
        
        FileExistsResult {
            path,
            exists,
            resolved_path,
        }
    }).collect()
}

#[tauri::command]
pub fn resolve_path(path: String) -> Result<String, CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;
    Ok(expanded.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_file(path: String) -> Result<(), CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;

    if !expanded.exists() {
        return Err(CommandError::ConfigNotFound(
            expanded.to_string_lossy().to_string(),
        ));
    }

    fs::remove_file(&expanded)?;
    Ok(())
}
