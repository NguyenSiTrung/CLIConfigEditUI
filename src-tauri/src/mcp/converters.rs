use crate::commands::expand_path;
use crate::mcp::storage::{parse_standard_mcp_servers, servers_to_standard_format};
use crate::mcp::types::{McpError, McpServer, McpToolFormat, McpToolInfo, get_mcp_tool_info};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;

pub fn read_tool_mcp_servers(tool_info: &McpToolInfo) -> Result<Vec<McpServer>, McpError> {
    let path = expand_path(&tool_info.config_path)
        .ok_or_else(|| McpError::NotFound(format!("Could not expand {}", tool_info.config_path)))?;

    if !path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&path)?;
    let root: Value = serde_json::from_str(&content)?;

    match tool_info.format {
        McpToolFormat::Standard => {
            let json_path = &tool_info.json_path;
            
            // First try as literal key (e.g., "amp.mcpServers" is a literal key in Amp settings)
            if let Some(servers_value) = root.get(json_path) {
                if servers_value.is_object() {
                    return parse_standard_mcp_servers(&root, json_path);
                }
            }
            
            // Then try as nested path
            if json_path.contains('.') {
                let parts: Vec<&str> = json_path.split('.').collect();
                let mut current = &root;
                for (i, part) in parts.iter().enumerate() {
                    if i == parts.len() - 1 {
                        return parse_standard_mcp_servers_from_value(current, part);
                    }
                    match current.get(part) {
                        Some(v) => current = v,
                        None => return Ok(Vec::new()),
                    }
                }
                Ok(Vec::new())
            } else {
                parse_standard_mcp_servers(&root, json_path)
            }
        }
        McpToolFormat::Copilot => parse_copilot_mcp_servers(&root),
        McpToolFormat::Opencode => parse_opencode_mcp_servers(&root),
    }
}

fn parse_standard_mcp_servers_from_value(root: &Value, key: &str) -> Result<Vec<McpServer>, McpError> {
    parse_standard_mcp_servers(root, key)
}

fn parse_copilot_mcp_servers(root: &Value) -> Result<Vec<McpServer>, McpError> {
    let servers = match root.get("servers") {
        Some(Value::Object(servers)) => servers,
        Some(_) => return Err(McpError::InvalidFormat("servers is not an object".to_string())),
        None => return Ok(Vec::new()),
    };

    let mut result = Vec::new();

    for (name, config) in servers {
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

            result.push(McpServer {
                name: name.clone(),
                command,
                args,
                env,
                disabled: None,
                url: None,
                target: None,
                extra: None,
            });
        }
    }

    Ok(result)
}

fn parse_opencode_mcp_servers(root: &Value) -> Result<Vec<McpServer>, McpError> {
    let mcp = match root.get("mcp") {
        Some(Value::Object(mcp)) => mcp,
        Some(_) => return Err(McpError::InvalidFormat("mcp is not an object".to_string())),
        None => return Ok(Vec::new()),
    };

    let servers = match mcp.get("servers") {
        Some(Value::Object(servers)) => servers,
        Some(_) => return Err(McpError::InvalidFormat("mcp.servers is not an object".to_string())),
        None => return Ok(Vec::new()),
    };

    let mut result = Vec::new();

    for (name, config) in servers {
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

            result.push(McpServer {
                name: name.clone(),
                command,
                args,
                env,
                disabled: None,
                url: None,
                target: None,
                extra: None,
            });
        }
    }

    Ok(result)
}

pub fn servers_to_tool_format(servers: &[McpServer], format: &McpToolFormat) -> Value {
    match format {
        McpToolFormat::Standard => servers_to_standard_format(servers),
        McpToolFormat::Copilot => servers_to_copilot_format(servers),
        McpToolFormat::Opencode => servers_to_opencode_format(servers),
    }
}

fn servers_to_copilot_format(servers: &[McpServer]) -> Value {
    let mut map = serde_json::Map::new();

    for server in servers {
        let mut server_obj = serde_json::Map::new();
        server_obj.insert("command".to_string(), Value::String(server.command.clone()));

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

        map.insert(server.name.clone(), Value::Object(server_obj));
    }

    Value::Object(map)
}

fn servers_to_opencode_format(servers: &[McpServer]) -> Value {
    let mut servers_map = serde_json::Map::new();

    for server in servers {
        let mut server_obj = serde_json::Map::new();
        server_obj.insert("command".to_string(), Value::String(server.command.clone()));

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

        servers_map.insert(server.name.clone(), Value::Object(server_obj));
    }

    let mut mcp_obj = serde_json::Map::new();
    mcp_obj.insert("servers".to_string(), Value::Object(servers_map));

    Value::Object(mcp_obj)
}

// Tauri command

#[tauri::command]
pub fn get_tool_mcp_servers(tool_id: String) -> Result<Vec<McpServer>, McpError> {
    let tool_info = get_mcp_tool_info(&tool_id)
        .ok_or_else(|| McpError::ToolNotSupported(tool_id.clone()))?;
    
    read_tool_mcp_servers(&tool_info)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_copilot_format() {
        let json = serde_json::json!({
            "servers": {
                "test-server": {
                    "command": "test-cmd",
                    "args": ["arg1"]
                }
            }
        });

        let servers = parse_copilot_mcp_servers(&json).unwrap();
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].name, "test-server");
        assert_eq!(servers[0].command, "test-cmd");
    }

    #[test]
    fn test_parse_opencode_format() {
        let json = serde_json::json!({
            "mcp": {
                "servers": {
                    "test-server": {
                        "command": "test-cmd"
                    }
                }
            }
        });

        let servers = parse_opencode_mcp_servers(&json).unwrap();
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].name, "test-server");
    }

    #[test]
    fn test_servers_to_copilot_format() {
        let servers = vec![McpServer {
            name: "test".to_string(),
            command: "cmd".to_string(),
            args: None,
            env: None,
            disabled: None,
            url: None,
            target: None,
            extra: None,
        }];

        let result = servers_to_copilot_format(&servers);
        assert!(result.is_object());
        assert!(result.get("test").is_some());
    }

    #[test]
    fn test_servers_to_opencode_format() {
        let servers = vec![McpServer {
            name: "test".to_string(),
            command: "cmd".to_string(),
            args: None,
            env: None,
            disabled: None,
            url: None,
            target: None,
            extra: None,
        }];

        let result = servers_to_opencode_format(&servers);
        assert!(result.get("servers").is_some());
    }
}
