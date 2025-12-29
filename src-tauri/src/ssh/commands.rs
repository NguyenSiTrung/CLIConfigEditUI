use serde::{Deserialize, Serialize};
use super::{SshConnection, SshError, SshStatus};
use super::operations::{
    ssh_backup_file, ssh_file_exists, ssh_read_file, ssh_test_connection, ssh_write_file,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SshConnectionInfo {
    pub user: Option<String>,
    pub host: String,
    pub port: Option<u16>,
    pub path: String,
}

impl From<SshConnectionInfo> for SshConnection {
    fn from(info: SshConnectionInfo) -> Self {
        SshConnection {
            user: info.user,
            host: info.host,
            port: info.port,
            path: info.path,
        }
    }
}

impl From<&SshConnection> for SshConnectionInfo {
    fn from(conn: &SshConnection) -> Self {
        SshConnectionInfo {
            user: conn.user.clone(),
            host: conn.host.clone(),
            port: conn.port,
            path: conn.path.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SshStatusResult {
    pub status: String,
    pub error: Option<String>,
}

impl From<SshStatus> for SshStatusResult {
    fn from(status: SshStatus) -> Self {
        match status {
            SshStatus::Connected => SshStatusResult {
                status: "connected".to_string(),
                error: None,
            },
            SshStatus::Disconnected => SshStatusResult {
                status: "disconnected".to_string(),
                error: None,
            },
            SshStatus::Error(e) => SshStatusResult {
                status: "error".to_string(),
                error: Some(e),
            },
        }
    }
}

fn ssh_error_to_string(e: SshError) -> String {
    e.to_string()
}

#[tauri::command]
pub fn test_ssh_host(ssh_path: String) -> Result<SshStatusResult, String> {
    let conn = SshConnection::parse(&ssh_path).map_err(|e| e.to_string())?;
    let status = ssh_test_connection(&conn);
    Ok(status.into())
}

#[tauri::command]
pub fn check_remote_connection(connection: SshConnectionInfo) -> SshStatusResult {
    let conn: SshConnection = connection.into();
    let status = ssh_test_connection(&conn);
    status.into()
}

#[tauri::command]
pub fn read_remote_config(ssh_path: String) -> Result<String, String> {
    let conn = SshConnection::parse(&ssh_path).map_err(|e| e.to_string())?;
    ssh_read_file(&conn).map_err(ssh_error_to_string)
}

#[tauri::command]
pub fn write_remote_config(ssh_path: String, content: String) -> Result<(), String> {
    let conn = SshConnection::parse(&ssh_path).map_err(|e| e.to_string())?;
    ssh_write_file(&conn, &content).map_err(ssh_error_to_string)
}

#[tauri::command]
pub fn check_remote_file_exists(ssh_path: String) -> Result<bool, String> {
    let conn = SshConnection::parse(&ssh_path).map_err(|e| e.to_string())?;
    ssh_file_exists(&conn).map_err(ssh_error_to_string)
}

#[tauri::command]
pub fn backup_remote_config(ssh_path: String) -> Result<String, String> {
    let conn = SshConnection::parse(&ssh_path).map_err(|e| e.to_string())?;
    ssh_backup_file(&conn).map_err(ssh_error_to_string)
}

#[tauri::command]
pub fn parse_ssh_path(ssh_path: String) -> Result<SshConnectionInfo, String> {
    let conn = SshConnection::parse(&ssh_path).map_err(|e| e.to_string())?;
    Ok((&conn).into())
}
