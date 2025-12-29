use thiserror::Error;

#[derive(Debug, Error)]
pub enum SshError {
    #[error("Invalid SSH path format: {0}")]
    InvalidPath(String),

    #[error("Connection failed: {0}")]
    ConnectionFailed(String),

    #[error("Authentication failed: {0}")]
    AuthenticationFailed(String),

    #[error("Command execution failed: {0}")]
    CommandFailed(String),

    #[error("File not found: {0}")]
    FileNotFound(String),

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error("Timeout: operation exceeded {0} seconds")]
    Timeout(u64),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),
}

impl SshError {
    pub fn is_retryable(&self) -> bool {
        matches!(
            self,
            SshError::ConnectionFailed(_) | SshError::Timeout(_)
        )
    }
}
