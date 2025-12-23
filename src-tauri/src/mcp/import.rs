use crate::mcp::storage::parse_standard_mcp_servers;
use crate::mcp::types::{McpError, McpServer};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum DetectedFormat {
    Standard,     // mcpServers key
    Amp,          // amp.mcpServers literal key
    Copilot,      // servers key
    Opencode,     // mcp.servers key
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    pub servers: Vec<McpServer>,
    pub source_path: String,
    pub detected_format: DetectedFormat,
}

pub fn parse_mcp_config_from_content(content: &str) -> Result<(Vec<McpServer>, DetectedFormat), McpError> {
    let root: Value = serde_json::from_str(content)?;
    
    // Try each format in order of specificity
    
    // 1. Try Amp format (amp.mcpServers literal key)
    if let Some(servers_value) = root.get("amp.mcpServers") {
        if servers_value.is_object() {
            let servers = parse_standard_mcp_servers(&root, "amp.mcpServers")?;
            if !servers.is_empty() {
                return Ok((servers, DetectedFormat::Amp));
            }
        }
    }
    
    // 2. Try OpenCode format (mcp.servers)
    if let Some(mcp_value) = root.get("mcp") {
        if let Some(servers_value) = mcp_value.get("servers") {
            if servers_value.is_object() {
                let servers = parse_opencode_mcp_servers(&root)?;
                if !servers.is_empty() {
                    return Ok((servers, DetectedFormat::Opencode));
                }
            }
        }
    }
    
    // 3. Try Copilot format (servers key, but NOT mcp.servers)
    if root.get("mcp").is_none() {
        if let Some(servers_value) = root.get("servers") {
            if servers_value.is_object() {
                let servers = parse_copilot_mcp_servers(&root)?;
                if !servers.is_empty() {
                    return Ok((servers, DetectedFormat::Copilot));
                }
            }
        }
    }
    
    // 4. Try Standard format (mcpServers key)
    if let Some(servers_value) = root.get("mcpServers") {
        if servers_value.is_object() {
            let servers = parse_standard_mcp_servers(&root, "mcpServers")?;
            if !servers.is_empty() {
                return Ok((servers, DetectedFormat::Standard));
            }
        }
    }
    
    // No recognized format found
    Err(McpError::InvalidFormat(
        "No recognized MCP config format found. Expected one of: mcpServers, amp.mcpServers, servers, mcp.servers".to_string()
    ))
}

pub fn parse_mcp_config_file(path: &Path) -> Result<ImportResult, McpError> {
    if !path.exists() {
        return Err(McpError::NotFound(format!("File not found: {}", path.display())));
    }
    
    let content = fs::read_to_string(path)?;
    let (servers, detected_format) = parse_mcp_config_from_content(&content)?;
    
    Ok(ImportResult {
        servers,
        source_path: path.to_string_lossy().to_string(),
        detected_format,
    })
}

fn parse_copilot_mcp_servers(root: &Value) -> Result<Vec<McpServer>, McpError> {
    let servers = match root.get("servers") {
        Some(Value::Object(servers)) => servers,
        Some(_) => return Err(McpError::InvalidFormat("servers is not an object".to_string())),
        None => return Ok(Vec::new()),
    };

    Ok(parse_servers_from_object(servers))
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

    Ok(parse_servers_from_object(servers))
}

fn parse_servers_from_object(servers: &serde_json::Map<String, Value>) -> Vec<McpServer> {
    let mut result = Vec::new();

    for (name, config) in servers {
        if let Value::Object(server_config) = config {
            result.push(parse_single_server_config(name, server_config));
        }
    }

    result
}

fn parse_single_server_config(name: &str, server_config: &serde_json::Map<String, Value>) -> McpServer {
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
                .filter_map(|(k, v)| value_to_string(v).map(|s| (k.clone(), s)))
                .collect::<HashMap<String, String>>()
        })
    });

    let url = server_config
        .get("url")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    McpServer {
        name: name.to_string(),
        command,
        args,
        env,
        disabled: None,
        url,
        target: None,
        extra: None,
    }
}

fn value_to_string(v: &Value) -> Option<String> {
    match v {
        Value::String(s) => Some(s.clone()),
        Value::Number(n) => Some(n.to_string()),
        Value::Bool(b) => Some(b.to_string()),
        Value::Null => None,
        Value::Array(_) | Value::Object(_) => None,
    }
}

// Tauri command
#[tauri::command]
pub fn import_mcp_config_file(file_path: String) -> Result<ImportResult, McpError> {
    let path = std::path::Path::new(&file_path);
    parse_mcp_config_file(path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_standard_format() {
        let json = r#"{
            "mcpServers": {
                "filesystem": {
                    "command": "npx",
                    "args": ["-y", "@anthropic/mcp-filesystem-server"]
                }
            }
        }"#;

        let (servers, format) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(format, DetectedFormat::Standard);
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].name, "filesystem");
        assert_eq!(servers[0].command, "npx");
    }

    #[test]
    fn test_parse_amp_format() {
        let json = r#"{
            "amp.mcpServers": {
                "my-server": {
                    "command": "amp-mcp",
                    "args": ["--port", "3000"]
                }
            }
        }"#;

        let (servers, format) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(format, DetectedFormat::Amp);
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].name, "my-server");
    }

    #[test]
    fn test_parse_copilot_format() {
        let json = r#"{
            "servers": {
                "copilot-server": {
                    "command": "copilot-mcp",
                    "args": ["serve"]
                }
            }
        }"#;

        let (servers, format) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(format, DetectedFormat::Copilot);
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].name, "copilot-server");
    }

    #[test]
    fn test_parse_opencode_format() {
        let json = r#"{
            "mcp": {
                "servers": {
                    "opencode-server": {
                        "command": "opencode-mcp"
                    }
                }
            }
        }"#;

        let (servers, format) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(format, DetectedFormat::Opencode);
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].name, "opencode-server");
    }

    #[test]
    fn test_parse_invalid_json() {
        let json = "not valid json";
        let result = parse_mcp_config_from_content(json);
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_no_mcp_config() {
        let json = r#"{"someOtherKey": "value"}"#;
        let result = parse_mcp_config_from_content(json);
        assert!(result.is_err());
        let err = result.unwrap_err().to_string();
        assert!(err.contains("No recognized MCP config format found"));
    }

    #[test]
    fn test_parse_empty_servers() {
        let json = r#"{"mcpServers": {}}"#;
        let result = parse_mcp_config_from_content(json);
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_with_env() {
        let json = r#"{
            "mcpServers": {
                "test-server": {
                    "command": "test-cmd",
                    "env": {
                        "API_KEY": "secret",
                        "DEBUG": "true"
                    }
                }
            }
        }"#;

        let (servers, _) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(servers.len(), 1);
        let env = servers[0].env.as_ref().unwrap();
        assert_eq!(env.get("API_KEY"), Some(&"secret".to_string()));
        assert_eq!(env.get("DEBUG"), Some(&"true".to_string()));
    }

    #[test]
    fn test_parse_env_with_non_string_values() {
        let json = r#"{
            "servers": {
                "test-server": {
                    "command": "test-cmd",
                    "env": {
                        "PORT": 3000,
                        "DEBUG": true,
                        "TIMEOUT": 30.5,
                        "NAME": "test"
                    }
                }
            }
        }"#;

        let (servers, format) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(format, DetectedFormat::Copilot);
        assert_eq!(servers.len(), 1);
        let env = servers[0].env.as_ref().unwrap();
        assert_eq!(env.get("PORT"), Some(&"3000".to_string()));
        assert_eq!(env.get("DEBUG"), Some(&"true".to_string()));
        assert_eq!(env.get("TIMEOUT"), Some(&"30.5".to_string()));
        assert_eq!(env.get("NAME"), Some(&"test".to_string()));
    }

    #[test]
    fn test_parse_multiple_servers() {
        let json = r#"{
            "mcpServers": {
                "server1": {"command": "cmd1"},
                "server2": {"command": "cmd2"},
                "server3": {"command": "cmd3"}
            }
        }"#;

        let (servers, _) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(servers.len(), 3);
    }

    #[test]
    fn test_parse_with_url_sse() {
        let json = r#"{
            "servers": {
                "remote-mcp": {
                    "url": "http://localhost:3000/sse"
                }
            }
        }"#;

        let (servers, format) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(format, DetectedFormat::Copilot);
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].url, Some("http://localhost:3000/sse".to_string()));
        assert_eq!(servers[0].command, "");
    }

    #[test]
    fn test_parse_opencode_with_url() {
        let json = r#"{
            "mcp": {
                "servers": {
                    "sse-server": {
                        "url": "https://api.example.com/mcp"
                    }
                }
            }
        }"#;

        let (servers, format) = parse_mcp_config_from_content(json).unwrap();
        assert_eq!(format, DetectedFormat::Opencode);
        assert_eq!(servers.len(), 1);
        assert_eq!(servers[0].url, Some("https://api.example.com/mcp".to_string()));
    }
}
