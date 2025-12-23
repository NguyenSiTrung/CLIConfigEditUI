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

    let mut result = Vec::new();

    for (name, config) in mcp {
        if let Value::Object(server_config) = config {
            let (command, args) = if let Some(cmd_array) = server_config.get("command").and_then(|v| v.as_array()) {
                let cmd_parts: Vec<String> = cmd_array
                    .iter()
                    .filter_map(|item| item.as_str().map(|s| s.to_string()))
                    .collect();
                if cmd_parts.is_empty() {
                    (String::new(), None)
                } else {
                    let command = cmd_parts[0].clone();
                    let args = if cmd_parts.len() > 1 {
                        Some(cmd_parts[1..].to_vec())
                    } else {
                        None
                    };
                    (command, args)
                }
            } else {
                (String::new(), None)
            };

            let env = server_config.get("environment").and_then(|v| {
                v.as_object().map(|obj| {
                    obj.iter()
                        .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                        .collect::<HashMap<String, String>>()
                })
            });

            let url = server_config.get("url").and_then(|v| v.as_str()).map(|s| s.to_string());

            let disabled = server_config.get("enabled").and_then(|v| v.as_bool()).map(|enabled| !enabled);

            result.push(McpServer {
                name: name.clone(),
                command,
                args,
                env,
                disabled,
                url,
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
    let mut mcp_map = serde_json::Map::new();

    for server in servers {
        let mut server_obj = serde_json::Map::new();

        let mut cmd_array: Vec<Value> = vec![Value::String(server.command.clone())];
        if let Some(args) = &server.args {
            cmd_array.extend(args.iter().map(|s| Value::String(s.clone())));
        }
        server_obj.insert("command".to_string(), Value::Array(cmd_array));

        if let Some(env) = &server.env {
            let env_obj: serde_json::Map<String, Value> = env
                .iter()
                .map(|(k, v)| (k.clone(), Value::String(v.clone())))
                .collect();
            server_obj.insert("environment".to_string(), Value::Object(env_obj));
        }

        if let Some(url) = &server.url {
            server_obj.insert("url".to_string(), Value::String(url.clone()));
            server_obj.insert("type".to_string(), Value::String("remote".to_string()));
        } else {
            server_obj.insert("type".to_string(), Value::String("local".to_string()));
        }

        let enabled = !server.disabled.unwrap_or(false);
        server_obj.insert("enabled".to_string(), Value::Bool(enabled));

        mcp_map.insert(server.name.clone(), Value::Object(server_obj));
    }

    Value::Object(mcp_map)
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
                "test-server": {
                    "command": ["test-cmd", "arg1", "arg2"],
                    "environment": {
                        "API_KEY": "secret"
                    },
                    "type": "local",
                    "enabled": true
                }
            }
        });

        let servers = parse_opencode_mcp_servers(&json).unwrap();
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].name, "test-server");
        assert_eq!(servers[0].command, "test-cmd");
        assert_eq!(servers[0].args, Some(vec!["arg1".to_string(), "arg2".to_string()]));
        assert!(servers[0].env.as_ref().unwrap().contains_key("API_KEY"));
        assert_eq!(servers[0].disabled, Some(false));
    }

    #[test]
    fn test_parse_opencode_disabled_server() {
        let json = serde_json::json!({
            "mcp": {
                "disabled-server": {
                    "command": ["cmd"],
                    "enabled": false
                }
            }
        });

        let servers = parse_opencode_mcp_servers(&json).unwrap();
        assert_eq!(servers[0].disabled, Some(true));
    }

    #[test]
    fn test_parse_opencode_remote_server() {
        let json = serde_json::json!({
            "mcp": {
                "remote-server": {
                    "command": [],
                    "url": "https://api.example.com/mcp",
                    "type": "remote",
                    "enabled": true
                }
            }
        });

        let servers = parse_opencode_mcp_servers(&json).unwrap();
        assert_eq!(servers[0].url, Some("https://api.example.com/mcp".to_string()));
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
            args: Some(vec!["arg1".to_string()]),
            env: Some([("KEY".to_string(), "value".to_string())].into_iter().collect()),
            disabled: None,
            url: None,
            target: None,
            extra: None,
        }];

        let result = servers_to_opencode_format(&servers);
        let server = result.get("test").unwrap();
        
        let cmd = server.get("command").unwrap().as_array().unwrap();
        assert_eq!(cmd[0].as_str().unwrap(), "cmd");
        assert_eq!(cmd[1].as_str().unwrap(), "arg1");
        
        assert!(server.get("environment").unwrap().get("KEY").is_some());
        assert_eq!(server.get("type").unwrap().as_str().unwrap(), "local");
        assert_eq!(server.get("enabled").unwrap().as_bool().unwrap(), true);
    }

    #[test]
    fn test_servers_to_opencode_format_disabled() {
        let servers = vec![McpServer {
            name: "disabled".to_string(),
            command: "cmd".to_string(),
            args: None,
            env: None,
            disabled: Some(true),
            url: None,
            target: None,
            extra: None,
        }];

        let result = servers_to_opencode_format(&servers);
        let server = result.get("disabled").unwrap();
        assert_eq!(server.get("enabled").unwrap().as_bool().unwrap(), false);
    }

    #[test]
    fn test_servers_to_opencode_format_remote() {
        let servers = vec![McpServer {
            name: "remote".to_string(),
            command: "".to_string(),
            args: None,
            env: None,
            disabled: None,
            url: Some("https://api.example.com/mcp".to_string()),
            target: None,
            extra: None,
        }];

        let result = servers_to_opencode_format(&servers);
        let server = result.get("remote").unwrap();
        assert_eq!(server.get("type").unwrap().as_str().unwrap(), "remote");
        assert_eq!(server.get("url").unwrap().as_str().unwrap(), "https://api.example.com/mcp");
    }

    #[test]
    fn test_opencode_roundtrip() {
        let original = vec![McpServer {
            name: "roundtrip-test".to_string(),
            command: "npx".to_string(),
            args: Some(vec!["-y".to_string(), "@modelcontextprotocol/server".to_string()]),
            env: Some([("TOKEN".to_string(), "abc123".to_string())].into_iter().collect()),
            disabled: Some(false),
            url: None,
            target: None,
            extra: None,
        }];

        let serialized = servers_to_opencode_format(&original);
        let wrapped = serde_json::json!({ "mcp": serialized });
        let parsed = parse_opencode_mcp_servers(&wrapped).unwrap();

        assert_eq!(parsed.len(), 1);
        assert_eq!(parsed[0].name, "roundtrip-test");
        assert_eq!(parsed[0].command, "npx");
        assert_eq!(parsed[0].args, Some(vec!["-y".to_string(), "@modelcontextprotocol/server".to_string()]));
        assert!(parsed[0].env.as_ref().unwrap().contains_key("TOKEN"));
    }
}
