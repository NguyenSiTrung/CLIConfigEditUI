use crate::config::{get_cli_tools, CliTool};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::UNIX_EPOCH;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CommandError {
    #[error("Config file not found: {0}")]
    ConfigNotFound(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    #[error("Failed to resolve path: {0}")]
    PathResolution(String),
    #[error("JSON parse error: {0}")]
    JsonParse(String),
    #[error("JSON path not found: {0}")]
    JsonPathNotFound(String),
}

#[derive(Serialize)]
struct ErrorResponse {
    error_type: String,
    message: String,
}

impl Serialize for CommandError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let (error_type, message) = match self {
            CommandError::ConfigNotFound(msg) => ("ConfigNotFound", msg.clone()),
            CommandError::Io(e) => {
                if e.kind() == std::io::ErrorKind::PermissionDenied {
                    ("PermissionDenied", e.to_string())
                } else {
                    ("Io", e.to_string())
                }
            }
            CommandError::PermissionDenied(msg) => ("PermissionDenied", msg.clone()),
            CommandError::PathResolution(msg) => ("PathResolution", msg.clone()),
            CommandError::JsonParse(msg) => ("JsonParse", msg.clone()),
            CommandError::JsonPathNotFound(msg) => ("JsonPathNotFound", msg.clone()),
        };
        
        let response = ErrorResponse {
            error_type: error_type.to_string(),
            message,
        };
        response.serialize(serializer)
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileExistsResult {
    pub path: String,
    pub exists: bool,
    pub resolved_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupSettings {
    pub enabled: bool,
    pub max_backups: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BackupInfo {
    pub path: String,
    pub name: String,
    pub modified_at: u64,
    pub size: u64,
}

pub fn expand_path(path: &str) -> Option<PathBuf> {
    let path = if let Some(stripped) = path.strip_prefix("~/") {
        dirs::home_dir()?.join(stripped)
    } else if let Some(stripped) = path.strip_prefix('~') {
        dirs::home_dir()?.join(stripped)
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
pub fn get_current_os() -> String {
    #[cfg(target_os = "linux")]
    return "linux".to_string();
    #[cfg(target_os = "macos")]
    return "macos".to_string();
    #[cfg(target_os = "windows")]
    return "windows".to_string();
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    return "unknown".to_string();
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
pub fn write_file(path: String, content: String, backup_settings: Option<BackupSettings>) -> Result<(), CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;

    // Create parent directories if needed
    if let Some(parent) = expanded.parent() {
        fs::create_dir_all(parent)?;
    }

    // Create backup if enabled and file exists
    let settings = backup_settings.unwrap_or(BackupSettings { enabled: true, max_backups: 1 });
    if settings.enabled && expanded.exists() && settings.max_backups > 0 {
        do_create_backup(&expanded, settings.max_backups)?;
    }

    // Write atomically via temp file
    let temp_path = expanded.with_extension("tmp");
    fs::write(&temp_path, &content)?;
    fs::rename(&temp_path, &expanded)?;

    Ok(())
}

fn do_create_backup(file_path: &PathBuf, max_backups: u32) -> Result<(), std::io::Error> {
    // Cap max_backups at 20 to match listing limit
    let max_backups = max_backups.min(20);
    
    let parent = file_path.parent().unwrap_or(file_path);
    let file_name = file_path.file_name().unwrap_or_default().to_string_lossy();
    
    if max_backups == 1 {
        // Simple case: single .bak file
        let backup_path = file_path.with_extension("bak");
        fs::copy(file_path, &backup_path)?;
    } else {
        // Rotate existing backups: .bak.2 -> .bak.3, .bak.1 -> .bak.2, .bak -> .bak.1
        for i in (1..max_backups).rev() {
            let old_backup = parent.join(format!("{}.bak.{}", file_name, i));
            let new_backup = parent.join(format!("{}.bak.{}", file_name, i + 1));
            if old_backup.exists() {
                fs::rename(&old_backup, &new_backup)?;
            }
        }
        
        // Rotate .bak -> .bak.1
        let first_backup = file_path.with_extension("bak");
        if first_backup.exists() {
            let second_backup = parent.join(format!("{}.bak.1", file_name));
            fs::rename(&first_backup, &second_backup)?;
        }
        
        // Create new .bak from current file
        fs::copy(file_path, &first_backup)?;
    }
    
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

#[tauri::command]
pub fn list_backups(path: String) -> Result<Vec<BackupInfo>, CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;
    
    let parent = expanded.parent().unwrap_or(&expanded);
    let file_name = expanded.file_name().unwrap_or_default().to_string_lossy();
    
    let mut backups = Vec::new();
    
    // Check for .bak file
    let bak_path = expanded.with_extension("bak");
    if bak_path.exists() {
        if let Some(info) = get_backup_info(&bak_path, "Latest backup (.bak)") {
            backups.push(info);
        }
    }
    
    // Check for numbered backups .bak.1, .bak.2, etc.
    for i in 1..=20 {
        let numbered_bak = parent.join(format!("{}.bak.{}", file_name, i));
        if numbered_bak.exists() {
            let name = format!("Backup #{} (.bak.{})", i, i);
            if let Some(info) = get_backup_info(&numbered_bak, &name) {
                backups.push(info);
            }
        } else {
            break;
        }
    }
    
    Ok(backups)
}

fn get_backup_info(path: &PathBuf, name: &str) -> Option<BackupInfo> {
    let metadata = fs::metadata(path).ok()?;
    let modified = metadata
        .modified()
        .ok()?
        .duration_since(UNIX_EPOCH)
        .ok()?
        .as_secs();
    
    Some(BackupInfo {
        path: path.to_string_lossy().to_string(),
        name: name.to_string(),
        modified_at: modified,
        size: metadata.len(),
    })
}

#[tauri::command]
pub fn read_backup(backup_path: String) -> Result<String, CommandError> {
    let path = PathBuf::from(&backup_path);
    
    if !path.exists() {
        return Err(CommandError::ConfigNotFound(backup_path));
    }
    
    Ok(fs::read_to_string(&path)?)
}

#[tauri::command]
pub fn restore_backup(original_path: String, backup_path: String, create_backup: bool) -> Result<(), CommandError> {
    let original = expand_path(&original_path)
        .ok_or_else(|| CommandError::PathResolution(original_path.clone()))?;
    let backup = PathBuf::from(&backup_path);
    
    if !backup.exists() {
        return Err(CommandError::ConfigNotFound(backup_path));
    }
    
    // Read backup content FIRST (before creating pre-restore backup which might overwrite it)
    let content = fs::read_to_string(&backup)?;
    
    // Optionally create a backup of current file before restoring
    if create_backup && original.exists() {
        do_create_backup(&original, 1)?;
    }
    
    // Write the backup content to original
    fs::write(&original, content)?;
    
    Ok(())
}

#[tauri::command]
pub fn read_json_path(path: String, json_path: String) -> Result<String, CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;

    if !expanded.exists() {
        return Err(CommandError::ConfigNotFound(
            expanded.to_string_lossy().to_string(),
        ));
    }

    let content = fs::read_to_string(&expanded)?;
    let root: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| CommandError::JsonParse(e.to_string()))?;

    let value = get_json_value(&root, &json_path)
        .ok_or_else(|| CommandError::JsonPathNotFound(json_path.clone()))?;

    serde_json::to_string_pretty(value)
        .map_err(|e| CommandError::JsonParse(e.to_string()))
}

#[tauri::command]
pub fn read_json_prefix(path: String, prefix: String) -> Result<String, CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;

    if !expanded.exists() {
        return Err(CommandError::ConfigNotFound(
            expanded.to_string_lossy().to_string(),
        ));
    }

    let content = fs::read_to_string(&expanded)?;
    let root: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| CommandError::JsonParse(e.to_string()))?;

    // Extract all keys that start with the prefix
    let mut result = serde_json::Map::new();
    
    if let serde_json::Value::Object(map) = &root {
        for (key, value) in map {
            if key.starts_with(&prefix) || key == &prefix {
                result.insert(key.clone(), value.clone());
            }
        }
    }

    serde_json::to_string_pretty(&serde_json::Value::Object(result))
        .map_err(|e| CommandError::JsonParse(e.to_string()))
}

#[tauri::command]
pub fn write_json_path(
    path: String,
    json_path: String,
    content: String,
    backup_settings: Option<BackupSettings>,
) -> Result<(), CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;

    // Create parent directories if needed
    if let Some(parent) = expanded.parent() {
        fs::create_dir_all(parent)?;
    }

    // Parse the new content to validate it's valid JSON
    let new_value: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| CommandError::JsonParse(e.to_string()))?;

    // Read existing file or create empty object
    let mut root: serde_json::Value = if expanded.exists() {
        let existing = fs::read_to_string(&expanded)?;
        serde_json::from_str(&existing)
            .map_err(|e| CommandError::JsonParse(e.to_string()))?
    } else {
        serde_json::json!({})
    };

    // Set the value at the specified path
    set_json_value(&mut root, &json_path, new_value)
        .ok_or_else(|| CommandError::JsonPathNotFound(json_path.clone()))?;

    // Serialize the updated root
    let final_content = serde_json::to_string_pretty(&root)
        .map_err(|e| CommandError::JsonParse(e.to_string()))?;

    // Create backup if enabled and file exists
    let settings = backup_settings.unwrap_or(BackupSettings { enabled: true, max_backups: 1 });
    if settings.enabled && expanded.exists() && settings.max_backups > 0 {
        do_create_backup(&expanded, settings.max_backups)?;
    }

    // Write atomically via temp file
    let temp_path = expanded.with_extension("tmp");
    fs::write(&temp_path, &final_content)?;
    fs::rename(&temp_path, &expanded)?;

    Ok(())
}

#[tauri::command]
pub fn write_json_prefix(
    path: String,
    prefix: String,
    content: String,
    backup_settings: Option<BackupSettings>,
) -> Result<(), CommandError> {
    let expanded = expand_path(&path)
        .ok_or_else(|| CommandError::PathResolution(path.clone()))?;

    // Create parent directories if needed
    if let Some(parent) = expanded.parent() {
        fs::create_dir_all(parent)?;
    }

    // Parse the new content (should be an object with prefix keys)
    let new_values: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| CommandError::JsonParse(e.to_string()))?;

    // Read existing file or create empty object
    let mut root: serde_json::Value = if expanded.exists() {
        let existing = fs::read_to_string(&expanded)?;
        serde_json::from_str(&existing)
            .map_err(|e| CommandError::JsonParse(e.to_string()))?
    } else {
        serde_json::json!({})
    };

    // Remove all existing keys with the prefix
    if let serde_json::Value::Object(ref mut map) = root {
        let keys_to_remove: Vec<String> = map
            .keys()
            .filter(|k| k.starts_with(&prefix) || *k == &prefix)
            .cloned()
            .collect();
        for key in keys_to_remove {
            map.remove(&key);
        }

        // Add the new values
        if let serde_json::Value::Object(new_map) = new_values {
            for (key, value) in new_map {
                map.insert(key, value);
            }
        }
    }

    // Serialize the updated root
    let final_content = serde_json::to_string_pretty(&root)
        .map_err(|e| CommandError::JsonParse(e.to_string()))?;

    // Create backup if enabled and file exists
    let settings = backup_settings.unwrap_or(BackupSettings { enabled: true, max_backups: 1 });
    if settings.enabled && expanded.exists() && settings.max_backups > 0 {
        do_create_backup(&expanded, settings.max_backups)?;
    }

    // Write atomically via temp file
    let temp_path = expanded.with_extension("tmp");
    fs::write(&temp_path, &final_content)?;
    fs::rename(&temp_path, &expanded)?;

    Ok(())
}

fn get_json_value<'a>(root: &'a serde_json::Value, path: &str) -> Option<&'a serde_json::Value> {
    // First try the path as a literal key (for keys like "amp.mcpServers")
    if let Some(value) = root.get(path) {
        return Some(value);
    }
    
    // Fall back to nested path traversal (for paths like "foo.bar.baz")
    let parts: Vec<&str> = path.split('.').collect();
    let mut current = root;
    
    for part in parts {
        current = current.get(part)?;
    }
    
    Some(current)
}

fn set_json_value(root: &mut serde_json::Value, path: &str, value: serde_json::Value) -> Option<()> {
    // First check if the path exists as a literal key (for keys like "amp.mcpServers")
    if root.get(path).is_some() {
        if let serde_json::Value::Object(map) = root {
            map.insert(path.to_string(), value);
            return Some(());
        }
    }
    
    // Fall back to nested path traversal
    let parts: Vec<&str> = path.split('.').collect();
    let mut current = root;
    
    for (i, part) in parts.iter().enumerate() {
        if i == parts.len() - 1 {
            // Last part - set the value
            if let serde_json::Value::Object(map) = current {
                map.insert(part.to_string(), value);
                return Some(());
            }
            return None;
        } else {
            // Traverse or create intermediate objects
            if current.get(part).is_none() {
                if let serde_json::Value::Object(map) = current {
                    map.insert(part.to_string(), serde_json::json!({}));
                }
            }
            current = current.get_mut(part)?;
        }
    }
    
    Some(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SidebarState {
    pub expanded_tools: Vec<String>,
}

fn get_sidebar_state_path() -> Option<PathBuf> {
    dirs::data_local_dir().map(|d| d.join("cli-config-editor").join("sidebar-state.json"))
}

#[tauri::command]
pub fn save_sidebar_state(expanded_tools: Vec<String>) -> Result<(), CommandError> {
    let state_path = get_sidebar_state_path()
        .ok_or_else(|| CommandError::PathResolution("Could not determine app data directory".to_string()))?;
    
    if let Some(parent) = state_path.parent() {
        fs::create_dir_all(parent)?;
    }
    
    let state = SidebarState { expanded_tools };
    let content = serde_json::to_string_pretty(&state)
        .map_err(|e| CommandError::JsonParse(e.to_string()))?;
    
    fs::write(&state_path, content)?;
    Ok(())
}

#[tauri::command]
pub fn load_sidebar_state() -> Result<SidebarState, CommandError> {
    let state_path = get_sidebar_state_path()
        .ok_or_else(|| CommandError::PathResolution("Could not determine app data directory".to_string()))?;
    
    if !state_path.exists() {
        return Ok(SidebarState { expanded_tools: vec![] });
    }
    
    let content = fs::read_to_string(&state_path)?;
    let state: SidebarState = serde_json::from_str(&content)
        .map_err(|e| CommandError::JsonParse(e.to_string()))?;
    
    Ok(state)
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PathSafetyResult {
    pub path: String,
    pub resolved_path: String,
    pub safety_level: crate::path_safety::PathSafetyLevel,
}

#[tauri::command]
pub fn check_path_safety(path: String) -> PathSafetyResult {
    let resolved = expand_path(&path);
    let resolved_path = resolved
        .as_ref()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|| path.clone());
    
    let safety_level = resolved
        .as_ref()
        .map(|p| crate::path_safety::get_path_safety_level(p))
        .unwrap_or(crate::path_safety::PathSafetyLevel::Warn);
    
    PathSafetyResult {
        path,
        resolved_path,
        safety_level,
    }
}
