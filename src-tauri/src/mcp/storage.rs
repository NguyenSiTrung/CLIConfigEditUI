use crate::commands::expand_path;
use crate::mcp::types::{McpConfig, McpError, McpServer, McpSourceMode};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn get_mcp_config_path(app: &AppHandle) -> Result<PathBuf, McpError> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|_| McpError::AppDataDir)?;
    Ok(app_data.join("mcp-config.json"))
}

pub fn load_mcp_config_internal(app: &AppHandle) -> Result<McpConfig, McpError> {
    let config_path = get_mcp_config_path(app)?;

    if !config_path.exists() {
        return Ok(McpConfig::default());
    }

    let content = fs::read_to_string(&config_path)?;
    let config: McpConfig = serde_json::from_str(&content)?;
    Ok(config)
}

pub fn save_mcp_config_internal(app: &AppHandle, config: &McpConfig) -> Result<(), McpError> {
    let config_path = get_mcp_config_path(app)?;

    // Ensure parent directory exists
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let json = serde_json::to_string_pretty(config)?;
    fs::write(&config_path, json)?;
    Ok(())
}

pub fn read_claude_mcp_servers_internal() -> Result<Vec<McpServer>, McpError> {
    let claude_path = expand_path("~/.claude.json")
        .ok_or_else(|| McpError::NotFound("Could not expand ~/.claude.json".to_string()))?;

    if !claude_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&claude_path)?;
    let root: Value = serde_json::from_str(&content)?;

    parse_standard_mcp_servers(&root, "mcpServers")
}

pub fn parse_standard_mcp_servers(root: &Value, key: &str) -> Result<Vec<McpServer>, McpError> {
    let mcp_servers = match root.get(key) {
        Some(Value::Object(servers)) => servers,
        Some(_) => return Err(McpError::InvalidFormat(format!("{} is not an object", key))),
        None => return Ok(Vec::new()),
    };

    let mut result = Vec::new();

    // Known fields that we handle explicitly
    let known_fields = ["command", "args", "env", "disabled", "url", "_target"];

    for (name, config) in mcp_servers {
        if let Value::Object(server_config) = config {
            let command = server_config
                .get("command")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();

            let args = server_config.get("args").and_then(|v| {
                v.as_array().map(|arr| {
                    arr.iter()
                        .filter_map(|item| item.as_str().map(|s| s.to_string()))
                        .collect()
                })
            });

            let env = server_config.get("env").and_then(|v| {
                v.as_object().map(|obj| {
                    obj.iter()
                        .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                        .collect::<HashMap<String, String>>()
                })
            });

            let disabled = server_config
                .get("disabled")
                .and_then(|v| v.as_bool());

            let url = server_config
                .get("url")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());

            let target = server_config
                .get("_target")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string());

            // Capture any extra fields we don't explicitly handle
            let extra: HashMap<String, Value> = server_config
                .iter()
                .filter(|(k, _)| !known_fields.contains(&k.as_str()))
                .map(|(k, v)| (k.clone(), v.clone()))
                .collect();

            let extra = if extra.is_empty() { None } else { Some(extra) };

            result.push(McpServer {
                name: name.clone(),
                command,
                args,
                env,
                disabled,
                url,
                target,
                extra,
            });
        }
    }

    Ok(result)
}

pub fn servers_to_standard_format(servers: &[McpServer]) -> Value {
    let mut map = serde_json::Map::new();

    for server in servers {
        let mut server_obj = serde_json::Map::new();
        
        // Only add command if it's not empty (for URL-based servers)
        if !server.command.is_empty() {
            server_obj.insert("command".to_string(), Value::String(server.command.clone()));
        }

        if let Some(args) = &server.args {
            server_obj.insert(
                "args".to_string(),
                Value::Array(args.iter().map(|s| Value::String(s.clone())).collect()),
            );
        }

        if let Some(env) = &server.env {
            let env_obj: serde_json::Map<String, Value> = env
                .iter()
                .map(|(k, v)| (k.clone(), Value::String(v.clone())))
                .collect();
            server_obj.insert("env".to_string(), Value::Object(env_obj));
        }

        if let Some(disabled) = server.disabled {
            if disabled {
                server_obj.insert("disabled".to_string(), Value::Bool(disabled));
            }
        }

        if let Some(url) = &server.url {
            server_obj.insert("url".to_string(), Value::String(url.clone()));
        }

        if let Some(target) = &server.target {
            server_obj.insert("_target".to_string(), Value::String(target.clone()));
        }

        // Write any extra fields we captured
        if let Some(extra) = &server.extra {
            for (k, v) in extra {
                server_obj.insert(k.clone(), v.clone());
            }
        }

        map.insert(server.name.clone(), Value::Object(server_obj));
    }

    Value::Object(map)
}

// Tauri commands

#[tauri::command]
pub fn get_mcp_config(app: AppHandle) -> Result<McpConfig, McpError> {
    load_mcp_config_internal(&app)
}

#[tauri::command]
pub fn save_mcp_config(app: AppHandle, config: McpConfig) -> Result<(), McpError> {
    save_mcp_config_internal(&app, &config)
}

#[tauri::command]
pub fn set_mcp_source_mode(app: AppHandle, mode: McpSourceMode) -> Result<McpConfig, McpError> {
    let mut config = load_mcp_config_internal(&app)?;
    config.source_mode = mode;
    save_mcp_config_internal(&app, &config)?;
    Ok(config)
}

#[tauri::command]
pub fn get_mcp_source_servers(app: AppHandle) -> Result<Vec<McpServer>, McpError> {
    let config = load_mcp_config_internal(&app)?;

    match config.source_mode {
        McpSourceMode::Claude => read_claude_mcp_servers_internal(),
        McpSourceMode::AppManaged => Ok(config.servers),
    }
}

#[tauri::command]
pub fn save_app_mcp_servers(app: AppHandle, servers: Vec<McpServer>) -> Result<(), McpError> {
    let mut config = load_mcp_config_internal(&app)?;
    config.servers = servers;
    save_mcp_config_internal(&app, &config)
}

#[tauri::command]
pub fn add_mcp_server(app: AppHandle, server: McpServer) -> Result<Vec<McpServer>, McpError> {
    let mut config = load_mcp_config_internal(&app)?;
    
    // Check for duplicate name
    if config.servers.iter().any(|s| s.name == server.name) {
        return Err(McpError::InvalidFormat(format!(
            "Server with name '{}' already exists",
            server.name
        )));
    }
    
    config.servers.push(server);
    save_mcp_config_internal(&app, &config)?;
    Ok(config.servers)
}

#[tauri::command]
pub fn update_mcp_server(
    app: AppHandle,
    original_name: String,
    server: McpServer,
) -> Result<Vec<McpServer>, McpError> {
    let mut config = load_mcp_config_internal(&app)?;
    
    if let Some(idx) = config.servers.iter().position(|s| s.name == original_name) {
        // If renaming, check for duplicate name
        if original_name != server.name && config.servers.iter().any(|s| s.name == server.name) {
            return Err(McpError::InvalidFormat(format!(
                "Server with name '{}' already exists",
                server.name
            )));
        }
        config.servers[idx] = server;
        save_mcp_config_internal(&app, &config)?;
        Ok(config.servers)
    } else {
        Err(McpError::NotFound(format!(
            "Server '{}' not found",
            original_name
        )))
    }
}

#[tauri::command]
pub fn remove_mcp_server(app: AppHandle, server_name: String) -> Result<Vec<McpServer>, McpError> {
    let mut config = load_mcp_config_internal(&app)?;
    
    let original_len = config.servers.len();
    config.servers.retain(|s| s.name != server_name);
    
    if config.servers.len() == original_len {
        return Err(McpError::NotFound(format!(
            "Server '{}' not found",
            server_name
        )));
    }
    
    save_mcp_config_internal(&app, &config)?;
    Ok(config.servers)
}

#[tauri::command]
pub fn read_claude_mcp_servers() -> Result<Vec<McpServer>, McpError> {
    read_claude_mcp_servers_internal()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_standard_mcp_servers() {
        let json = serde_json::json!({
            "mcpServers": {
                "filesystem": {
                    "command": "npx",
                    "args": ["-y", "@anthropic/mcp-filesystem-server"],
                    "env": {
                        "HOME": "/home/user"
                    }
                },
                "git": {
                    "command": "git-mcp",
                    "disabled": true
                }
            }
        });

        let servers = parse_standard_mcp_servers(&json, "mcpServers").unwrap();
        assert_eq!(servers.len(), 2);

        let fs_server = servers.iter().find(|s| s.name == "filesystem").unwrap();
        assert_eq!(fs_server.command, "npx");
        assert_eq!(
            fs_server.args,
            Some(vec![
                "-y".to_string(),
                "@anthropic/mcp-filesystem-server".to_string()
            ])
        );
        assert!(fs_server.env.is_some());

        let git_server = servers.iter().find(|s| s.name == "git").unwrap();
        assert_eq!(git_server.command, "git-mcp");
        assert_eq!(git_server.disabled, Some(true));
    }

    #[test]
    fn test_servers_to_standard_format() {
        let servers = vec![
            McpServer {
                name: "test".to_string(),
                command: "test-cmd".to_string(),
                args: Some(vec!["arg1".to_string()]),
                env: None,
                disabled: None,
                url: None,
                target: None,
                extra: None,
            },
        ];

        let result = servers_to_standard_format(&servers);
        assert!(result.is_object());
        
        let obj = result.as_object().unwrap();
        assert!(obj.contains_key("test"));
        
        let test_server = obj.get("test").unwrap().as_object().unwrap();
        assert_eq!(test_server.get("command").unwrap().as_str().unwrap(), "test-cmd");
    }

    #[test]
    fn test_parse_empty_mcp_servers() {
        let json = serde_json::json!({});
        let servers = parse_standard_mcp_servers(&json, "mcpServers").unwrap();
        assert!(servers.is_empty());
    }
}
