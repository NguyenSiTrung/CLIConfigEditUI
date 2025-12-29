use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SshStatus {
    Connected,
    Disconnected,
    Error(String),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SshConnection {
    pub user: Option<String>,
    pub host: String,
    pub port: Option<u16>,
    pub path: String,
}

impl SshConnection {
    pub fn new(host: impl Into<String>, path: impl Into<String>) -> Self {
        Self {
            user: None,
            host: host.into(),
            port: None,
            path: path.into(),
        }
    }

    pub fn with_user(mut self, user: impl Into<String>) -> Self {
        self.user = Some(user.into());
        self
    }

    pub fn with_port(mut self, port: u16) -> Self {
        self.port = Some(port);
        self
    }

    pub fn parse(ssh_path: &str) -> Result<Self, super::SshError> {
        let ssh_path = ssh_path.trim();
        if ssh_path.is_empty() {
            return Err(super::SshError::InvalidPath("Empty path".into()));
        }

        let (user, remaining) = if let Some(at_pos) = ssh_path.find('@') {
            let user = &ssh_path[..at_pos];
            if user.is_empty() {
                return Err(super::SshError::InvalidPath("User portion is empty".into()));
            }
            (Some(user.to_string()), &ssh_path[at_pos + 1..])
        } else {
            (None, ssh_path)
        };

        let (host, port, path) = Self::parse_host_port_path(remaining)?;

        if host.is_empty() {
            return Err(super::SshError::InvalidPath("Host is empty".into()));
        }

        if path.is_empty() {
            return Err(super::SshError::InvalidPath("Path portion is empty".into()));
        }

        Ok(Self { user, host, port, path })
    }

    fn parse_host_port_path(s: &str) -> Result<(String, Option<u16>, String), super::SshError> {
        if s.starts_with('[') {
            if let Some(bracket_end) = s.find(']') {
                let ipv6 = s[1..bracket_end].to_string();
                let remaining = &s[bracket_end + 1..];
                
                if !remaining.starts_with(':') {
                    return Err(super::SshError::InvalidPath(
                        "Missing ':' after IPv6 host".into()
                    ));
                }
                
                let after_bracket = &remaining[1..];
                
                if let Some(colon_pos) = after_bracket.find(':') {
                    let port_str = &after_bracket[..colon_pos];
                    let path = after_bracket[colon_pos + 1..].to_string();
                    let port = port_str.parse::<u16>().map_err(|_| {
                        super::SshError::InvalidPath(format!("Invalid port: {}", port_str))
                    })?;
                    return Ok((ipv6, Some(port), path));
                } else {
                    return Ok((ipv6, None, after_bracket.to_string()));
                }
            }
            return Err(super::SshError::InvalidPath(
                "Unclosed IPv6 bracket".into()
            ));
        }

        let colons: Vec<usize> = s.match_indices(':').map(|(i, _)| i).collect();
        
        match colons.len() {
            0 => Err(super::SshError::InvalidPath(
                "Missing ':' separator in SSH path".into()
            )),
            1 => {
                let host = s[..colons[0]].to_string();
                let path = s[colons[0] + 1..].to_string();
                Ok((host, None, path))
            }
            _ => {
                let first_colon = colons[0];
                let second_colon = colons[1];
                let potential_port = &s[first_colon + 1..second_colon];
                
                if let Ok(port) = potential_port.parse::<u16>() {
                    let host = s[..first_colon].to_string();
                    let path = s[second_colon + 1..].to_string();
                    Ok((host, Some(port), path))
                } else {
                    let host = s[..first_colon].to_string();
                    let path = s[first_colon + 1..].to_string();
                    Ok((host, None, path))
                }
            }
        }
    }

    pub fn ssh_target(&self) -> String {
        let mut target = String::new();
        if let Some(ref user) = self.user {
            target.push_str(user);
            target.push('@');
        }
        target.push_str(&self.host);
        target
    }

    pub fn ssh_args(&self) -> Vec<String> {
        let mut args = Vec::new();
        if let Some(port) = self.port {
            args.push("-p".to_string());
            args.push(port.to_string());
        }
        args.push("-o".to_string());
        args.push("BatchMode=yes".to_string());
        args.push("-o".to_string());
        args.push("StrictHostKeyChecking=accept-new".to_string());
        args
    }
}

impl fmt::Display for SshConnection {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if let Some(ref user) = self.user {
            write!(f, "{}@", user)?;
        }
        if let Some(port) = self.port {
            write!(f, "{}:{}:{}", self.host, port, self.path)
        } else {
            write!(f, "{}:{}", self.host, self.path)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_host_path() {
        let conn = SshConnection::parse("myserver:/path/to/config.json").unwrap();
        assert_eq!(conn.host, "myserver");
        assert_eq!(conn.path, "/path/to/config.json");
        assert!(conn.user.is_none());
        assert!(conn.port.is_none());
    }

    #[test]
    fn test_parse_user_host_path() {
        let conn = SshConnection::parse("user@example.com:/home/user/.config/app.json").unwrap();
        assert_eq!(conn.user, Some("user".to_string()));
        assert_eq!(conn.host, "example.com");
        assert_eq!(conn.path, "/home/user/.config/app.json");
        assert!(conn.port.is_none());
    }

    #[test]
    fn test_parse_user_host_port_path() {
        let conn = SshConnection::parse("admin@192.168.1.100:2222:/etc/config.json").unwrap();
        assert_eq!(conn.user, Some("admin".to_string()));
        assert_eq!(conn.host, "192.168.1.100");
        assert_eq!(conn.port, Some(2222));
        assert_eq!(conn.path, "/etc/config.json");
    }

    #[test]
    fn test_parse_ipv6() {
        let conn = SshConnection::parse("[::1]:/path/to/file").unwrap();
        assert_eq!(conn.host, "::1");
        assert_eq!(conn.path, "/path/to/file");
        assert!(conn.user.is_none());
        assert!(conn.port.is_none());
    }

    #[test]
    fn test_parse_ipv6_with_port() {
        let conn = SshConnection::parse("user@[2001:db8::1]:22:/path/file").unwrap();
        assert_eq!(conn.user, Some("user".to_string()));
        assert_eq!(conn.host, "2001:db8::1");
        assert_eq!(conn.port, Some(22));
        assert_eq!(conn.path, "/path/file");
    }

    #[test]
    fn test_parse_ssh_config_alias() {
        let conn = SshConnection::parse("myalias:/remote/path").unwrap();
        assert_eq!(conn.host, "myalias");
        assert_eq!(conn.path, "/remote/path");
        assert!(conn.user.is_none());
        assert!(conn.port.is_none());
    }

    #[test]
    fn test_parse_empty_path_error() {
        let result = SshConnection::parse("host:");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_no_colon_error() {
        let result = SshConnection::parse("host/path");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_empty_user_error() {
        let result = SshConnection::parse("@host:/path");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_empty_host_error() {
        let result = SshConnection::parse("user@:/path");
        assert!(result.is_err());
    }

    #[test]
    fn test_ssh_target() {
        let conn = SshConnection::parse("user@host:/path").unwrap();
        assert_eq!(conn.ssh_target(), "user@host");

        let conn2 = SshConnection::parse("host:/path").unwrap();
        assert_eq!(conn2.ssh_target(), "host");
    }

    #[test]
    fn test_ssh_args_with_port() {
        let conn = SshConnection::parse("user@host:2222:/path").unwrap();
        let args = conn.ssh_args();
        assert!(args.contains(&"-p".to_string()));
        assert!(args.contains(&"2222".to_string()));
    }

    #[test]
    fn test_display() {
        let conn = SshConnection::parse("user@host:2222:/path/to/file").unwrap();
        assert_eq!(conn.to_string(), "user@host:2222:/path/to/file");
    }
}
