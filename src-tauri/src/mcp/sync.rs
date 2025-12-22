use crate::commands::expand_path;
use crate::mcp::converters::{read_tool_mcp_servers, servers_to_tool_format};
use crate::mcp::storage::{load_mcp_config_internal, read_claude_mcp_servers_internal, servers_to_standard_format};
use crate::mcp::types::{
    get_mcp_tool_definitions, get_mcp_tool_info, McpConfig, McpConfigPreview, McpError, McpMergeResult, McpServer,
    McpServerConflict, McpSourceMode, McpSyncPreview, McpSyncResult, McpSyncStatus,
    McpToolFormat, McpToolInfo, McpToolStatus,
};
use serde_json::Value;
use std::fs;
use tauri::AppHandle;

fn get_source_servers(app: &AppHandle) -> Result<Vec<McpServer>, McpError> {
    let config = load_mcp_config_internal(app)?;

    match config.source_mode {
        McpSourceMode::Claude => read_claude_mcp_servers_internal(),
        McpSourceMode::AppManaged => Ok(config.servers),
    }
}

pub fn compute_merge_result(
    source_servers: &[McpServer],
    target_servers: &[McpServer],
    tool_id: &str,
) -> McpMergeResult {
    let mut added = Vec::new();
    let mut kept = Vec::new();
    let mut conflicts = Vec::new();

    for source in source_servers {
        match target_servers.iter().find(|t| t.name == source.name) {
            Some(target) => {
                if servers_equal(source, target) {
                    kept.push(source.clone());
                } else {
                    conflicts.push(McpServerConflict {
                        server_name: source.name.clone(),
                        source_server: source.clone(),
                        target_server: target.clone(),
                        tool_id: tool_id.to_string(),
                    });
                }
            }
            None => {
                added.push(source.clone());
            }
        }
    }

    // Keep servers that exist in target but not in source
    for target in target_servers {
        if !source_servers.iter().any(|s| s.name == target.name) {
            kept.push(target.clone());
        }
    }

    McpMergeResult {
        tool_id: tool_id.to_string(),
        added,
        kept,
        conflicts,
    }
}

fn servers_equal(a: &McpServer, b: &McpServer) -> bool {
    a.command == b.command && a.args == b.args && a.env == b.env && a.url == b.url
}

fn get_sync_status(source: &[McpServer], target: &[McpServer], tool_id: &str) -> McpSyncStatus {
    let merge = compute_merge_result(source, target, tool_id);
    
    if !merge.conflicts.is_empty() {
        McpSyncStatus::Conflicts
    } else if !merge.added.is_empty() {
        McpSyncStatus::OutOfSync
    } else {
        McpSyncStatus::Synced
    }
}

#[tauri::command]
pub fn get_mcp_tool_statuses(app: AppHandle) -> Result<Vec<McpToolStatus>, McpError> {
    let config = load_mcp_config_internal(&app)?;
    let source_servers = get_source_servers(&app)?;
    let tool_definitions = get_mcp_tool_definitions();

    let mut statuses = Vec::new();

    for tool_info in tool_definitions {
        let path = expand_path(&tool_info.config_path);
        let installed = path.as_ref().map(|p| p.exists()).unwrap_or(false);
        
        let (sync_status, server_count) = if installed {
            match read_tool_mcp_servers(&tool_info) {
                Ok(tool_servers) => {
                    let status = get_sync_status(&source_servers, &tool_servers, &tool_info.tool_id);
                    (status, tool_servers.len() as u32)
                }
                Err(_) => (McpSyncStatus::NoMcp, 0),
            }
        } else {
            (McpSyncStatus::NotInstalled, 0)
        };

        let enabled = config.enabled_tools.contains(&tool_info.tool_id);

        statuses.push(McpToolStatus {
            tool_id: tool_info.tool_id,
            name: tool_info.name,
            installed,
            config_path: tool_info.config_path,
            sync_status,
            server_count,
            enabled,
        });
    }

    Ok(statuses)
}

#[tauri::command]
pub fn set_tool_mcp_enabled(
    app: AppHandle,
    tool_id: String,
    enabled: bool,
) -> Result<McpConfig, McpError> {
    let mut config = load_mcp_config_internal(&app)?;

    if enabled {
        if !config.enabled_tools.contains(&tool_id) {
            config.enabled_tools.push(tool_id);
        }
    } else {
        config.enabled_tools.retain(|t| *t != tool_id);
    }

    crate::mcp::storage::save_mcp_config_internal(&app, &config)?;
    Ok(config)
}

#[tauri::command]
pub fn preview_mcp_sync(app: AppHandle, tool_id: String) -> Result<McpSyncPreview, McpError> {
    let tool_info =
        get_mcp_tool_info(&tool_id).ok_or_else(|| McpError::ToolNotSupported(tool_id.clone()))?;

    let source_servers = get_source_servers(&app)?;
    let target_servers = read_tool_mcp_servers(&tool_info)?;

    let merge_result = compute_merge_result(&source_servers, &target_servers, &tool_id);
    let has_changes = !merge_result.added.is_empty() || !merge_result.conflicts.is_empty();

    Ok(McpSyncPreview {
        tool_id: tool_info.tool_id,
        tool_name: tool_info.name,
        merge_result,
        has_changes,
    })
}

#[tauri::command]
pub fn preview_mcp_sync_all(app: AppHandle) -> Result<Vec<McpSyncPreview>, McpError> {
    let config = load_mcp_config_internal(&app)?;
    let source_servers = get_source_servers(&app)?;

    let mut previews = Vec::new();

    for tool_id in &config.enabled_tools {
        if let Some(tool_info) = get_mcp_tool_info(tool_id) {
            let path = expand_path(&tool_info.config_path);
            if path.map(|p| p.exists()).unwrap_or(false) {
                let target_servers = read_tool_mcp_servers(&tool_info)?;
                let merge_result = compute_merge_result(&source_servers, &target_servers, tool_id);
                let has_changes = !merge_result.added.is_empty() || !merge_result.conflicts.is_empty();

                previews.push(McpSyncPreview {
                    tool_id: tool_info.tool_id,
                    tool_name: tool_info.name,
                    merge_result,
                    has_changes,
                });
            }
        }
    }

    Ok(previews)
}

#[tauri::command]
pub fn sync_mcp_to_tool(
    app: AppHandle,
    tool_id: String,
    resolved_conflicts: Option<Vec<McpServer>>,
) -> Result<McpSyncResult, McpError> {
    let tool_info =
        get_mcp_tool_info(&tool_id).ok_or_else(|| McpError::ToolNotSupported(tool_id.clone()))?;

    let source_servers = get_source_servers(&app)?;
    let target_servers = read_tool_mcp_servers(&tool_info)?;
    let merge_result = compute_merge_result(&source_servers, &target_servers, &tool_id);

    // Check for unresolved conflicts
    if !merge_result.conflicts.is_empty() && resolved_conflicts.is_none() {
        return Ok(McpSyncResult {
            tool_id,
            success: false,
            message: format!(
                "Conflicts detected: {}. Please resolve conflicts first.",
                merge_result
                    .conflicts
                    .iter()
                    .map(|c| c.server_name.clone())
                    .collect::<Vec<_>>()
                    .join(", ")
            ),
            servers_written: 0,
        });
    }

    // Build final server list
    let mut final_servers: Vec<McpServer> = merge_result.kept.clone();
    final_servers.extend(merge_result.added.clone());

    // Add resolved conflicts
    if let Some(resolved) = resolved_conflicts {
        final_servers.extend(resolved);
    } else {
        // Add source servers for conflicts (default resolution)
        for conflict in &merge_result.conflicts {
            final_servers.push(conflict.source_server.clone());
        }
    }

    // Write to tool config
    write_mcp_to_tool(&tool_info, &final_servers)?;

    Ok(McpSyncResult {
        tool_id,
        success: true,
        message: format!(
            "Synced {} servers ({} added, {} kept)",
            final_servers.len(),
            merge_result.added.len(),
            merge_result.kept.len()
        ),
        servers_written: final_servers.len() as u32,
    })
}

#[tauri::command]
pub fn sync_mcp_to_all(app: AppHandle) -> Result<Vec<McpSyncResult>, McpError> {
    let config = load_mcp_config_internal(&app)?;
    let mut results = Vec::new();

    for tool_id in &config.enabled_tools {
        if let Some(tool_info) = get_mcp_tool_info(tool_id) {
            let path = expand_path(&tool_info.config_path);
            if path.map(|p| p.exists()).unwrap_or(false) {
                match sync_mcp_to_tool(app.clone(), tool_id.clone(), None) {
                    Ok(result) => results.push(result),
                    Err(e) => results.push(McpSyncResult {
                        tool_id: tool_id.clone(),
                        success: false,
                        message: e.to_string(),
                        servers_written: 0,
                    }),
                }
            }
        }
    }

    Ok(results)
}

fn write_mcp_to_tool(tool_info: &McpToolInfo, servers: &[McpServer]) -> Result<(), McpError> {
    let path = expand_path(&tool_info.config_path)
        .ok_or_else(|| McpError::NotFound(format!("Could not expand {}", tool_info.config_path)))?;

    // Create parent directories if needed
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    // Read existing file or create empty object
    let mut root: Value = if path.exists() {
        let content = fs::read_to_string(&path)?;
        serde_json::from_str(&content)?
    } else {
        serde_json::json!({})
    };

    // Create backup before writing
    if path.exists() {
        let backup_path = path.with_extension("bak");
        fs::copy(&path, &backup_path)?;
    }

    // Update the appropriate key based on format
    match tool_info.format {
        McpToolFormat::Standard => {
            let json_path = &tool_info.json_path;
            let servers_value = servers_to_standard_format(servers);
            
            // First check if the path exists as a literal key (e.g., "amp.mcpServers")
            // This handles keys that contain dots but aren't nested paths
            if root.get(json_path).is_some() {
                if let Value::Object(ref mut map) = root {
                    map.insert(json_path.clone(), servers_value);
                }
            } else if json_path.contains('.') {
                // Check if it should be a literal key by looking at existing keys
                // For Amp, "amp.mcpServers" is a literal key, not amp -> mcpServers
                let prefix = json_path.split('.').next().unwrap_or("");
                let has_dotted_keys = if let Value::Object(ref map) = root {
                    map.keys().any(|k| k.contains('.') && k.starts_with(prefix))
                } else {
                    false
                };
                
                if has_dotted_keys {
                    // Use as literal key
                    if let Value::Object(ref mut map) = root {
                        map.insert(json_path.clone(), servers_value);
                    }
                } else {
                    // Handle as nested path
                    let parts: Vec<&str> = json_path.split('.').collect();
                    set_nested_value(&mut root, &parts, servers_value);
                }
            } else if let Value::Object(ref mut map) = root {
                map.insert(json_path.clone(), servers_value);
            }
        }
        McpToolFormat::Copilot => {
            let servers_value = servers_to_tool_format(servers, &McpToolFormat::Copilot);
            if let Value::Object(ref mut map) = root {
                map.insert("servers".to_string(), servers_value);
            }
        }
        McpToolFormat::Opencode => {
            let mcp_value = servers_to_tool_format(servers, &McpToolFormat::Opencode);
            if let Value::Object(ref mut map) = root {
                map.insert("mcp".to_string(), mcp_value);
            }
        }
    }

    // Write atomically via temp file
    let temp_path = path.with_extension("tmp");
    let content = serde_json::to_string_pretty(&root)?;
    fs::write(&temp_path, &content)?;
    fs::rename(&temp_path, &path)?;

    Ok(())
}

fn set_nested_value(root: &mut Value, parts: &[&str], value: Value) {
    if parts.is_empty() {
        return;
    }

    let mut current = root;
    for (i, part) in parts.iter().enumerate() {
        if i == parts.len() - 1 {
            if let Value::Object(ref mut map) = current {
                map.insert((*part).to_string(), value);
            }
            return;
        }

        if current.get(*part).is_none() {
            if let Value::Object(ref mut map) = current {
                map.insert((*part).to_string(), serde_json::json!({}));
            }
        }
        current = current.get_mut(*part).unwrap();
    }
}

/// Preview what the final config file will look like after sync
#[tauri::command]
pub fn preview_mcp_config_content(
    app: AppHandle,
    tool_id: String,
    resolved_conflicts: Option<Vec<McpServer>>,
) -> Result<McpConfigPreview, McpError> {
    let tool_info =
        get_mcp_tool_info(&tool_id).ok_or_else(|| McpError::ToolNotSupported(tool_id.clone()))?;

    let source_servers = get_source_servers(&app)?;
    let target_servers = read_tool_mcp_servers(&tool_info)?;
    let merge_result = compute_merge_result(&source_servers, &target_servers, &tool_id);

    // Build final server list
    let mut final_servers: Vec<McpServer> = merge_result.kept.clone();
    final_servers.extend(merge_result.added.clone());

    // Add resolved conflicts or use source by default
    if let Some(resolved) = resolved_conflicts {
        final_servers.extend(resolved);
    } else {
        for conflict in &merge_result.conflicts {
            final_servers.push(conflict.source_server.clone());
        }
    }

    // Generate preview content without writing
    let preview_content = generate_config_preview(&tool_info, &final_servers)?;

    // Get current content for comparison
    let path = expand_path(&tool_info.config_path);
    let current_content = path
        .as_ref()
        .and_then(|p| if p.exists() { fs::read_to_string(p).ok() } else { None })
        .unwrap_or_else(|| "{}".to_string());

    Ok(McpConfigPreview {
        tool_id,
        tool_name: tool_info.name,
        config_path: tool_info.config_path,
        current_content,
        preview_content,
    })
}

fn generate_config_preview(tool_info: &McpToolInfo, servers: &[McpServer]) -> Result<String, McpError> {
    let path = expand_path(&tool_info.config_path);
    
    // Read existing file or create empty object
    let mut root: Value = if let Some(ref p) = path {
        if p.exists() {
            let content = fs::read_to_string(p)?;
            serde_json::from_str(&content)?
        } else {
            serde_json::json!({})
        }
    } else {
        serde_json::json!({})
    };

    // Update the appropriate key based on format (same logic as write_mcp_to_tool)
    match tool_info.format {
        McpToolFormat::Standard => {
            let json_path = &tool_info.json_path;
            let servers_value = servers_to_standard_format(servers);
            
            if root.get(json_path).is_some() {
                if let Value::Object(ref mut map) = root {
                    map.insert(json_path.clone(), servers_value);
                }
            } else if json_path.contains('.') {
                let prefix = json_path.split('.').next().unwrap_or("");
                let has_dotted_keys = if let Value::Object(ref map) = root {
                    map.keys().any(|k| k.contains('.') && k.starts_with(prefix))
                } else {
                    false
                };
                
                if has_dotted_keys {
                    if let Value::Object(ref mut map) = root {
                        map.insert(json_path.clone(), servers_value);
                    }
                } else {
                    let parts: Vec<&str> = json_path.split('.').collect();
                    set_nested_value(&mut root, &parts, servers_value);
                }
            } else if let Value::Object(ref mut map) = root {
                map.insert(json_path.clone(), servers_value);
            }
        }
        McpToolFormat::Copilot => {
            let servers_value = servers_to_tool_format(servers, &McpToolFormat::Copilot);
            if let Value::Object(ref mut map) = root {
                map.insert("servers".to_string(), servers_value);
            }
        }
        McpToolFormat::Opencode => {
            let mcp_value = servers_to_tool_format(servers, &McpToolFormat::Opencode);
            if let Value::Object(ref mut map) = root {
                map.insert("mcp".to_string(), mcp_value);
            }
        }
    }

    Ok(serde_json::to_string_pretty(&root)?)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_merge_result_no_conflicts() {
        let source = vec![
            McpServer {
                name: "server1".to_string(),
                command: "cmd1".to_string(),
                args: None,
                env: None,
                disabled: None,
                url: None,
                target: None,
                extra: None,
            },
        ];
        let target = vec![];

        let result = compute_merge_result(&source, &target, "test");
        assert_eq!(result.added.len(), 1);
        assert_eq!(result.kept.len(), 0);
        assert_eq!(result.conflicts.len(), 0);
    }

    #[test]
    fn test_compute_merge_result_with_conflict() {
        let source = vec![McpServer {
            name: "server1".to_string(),
            command: "cmd1".to_string(),
            args: None,
            env: None,
            disabled: None,
            url: None,
            target: None,
            extra: None,
        }];
        let target = vec![McpServer {
            name: "server1".to_string(),
            command: "cmd2".to_string(), // Different command
            args: None,
            env: None,
            disabled: None,
            url: None,
            target: None,
            extra: None,
        }];

        let result = compute_merge_result(&source, &target, "test");
        assert_eq!(result.added.len(), 0);
        assert_eq!(result.kept.len(), 0);
        assert_eq!(result.conflicts.len(), 1);
    }

    #[test]
    fn test_compute_merge_result_keep_target_only() {
        let source = vec![];
        let target = vec![McpServer {
            name: "server1".to_string(),
            command: "cmd1".to_string(),
            args: None,
            env: None,
            disabled: None,
            url: None,
            target: None,
            extra: None,
        }];

        let result = compute_merge_result(&source, &target, "test");
        assert_eq!(result.added.len(), 0);
        assert_eq!(result.kept.len(), 1);
        assert_eq!(result.conflicts.len(), 0);
    }

    #[test]
    fn test_servers_equal() {
        let a = McpServer {
            name: "test".to_string(),
            command: "cmd".to_string(),
            args: Some(vec!["arg".to_string()]),
            env: None,
            disabled: None,
            url: None,
            target: None,
            extra: None,
        };
        let b = a.clone();
        assert!(servers_equal(&a, &b));

        let c = McpServer {
            name: "test".to_string(),
            command: "different".to_string(),
            args: None,
            env: None,
            disabled: None,
            url: None,
            target: None,
            extra: None,
        };
        assert!(!servers_equal(&a, &c));
    }
}
