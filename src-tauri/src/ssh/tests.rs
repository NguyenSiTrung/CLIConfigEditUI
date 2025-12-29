use super::*;

#[test]
fn test_ssh_error_retryable() {
    assert!(SshError::ConnectionFailed("test".into()).is_retryable());
    assert!(SshError::Timeout(10).is_retryable());
    assert!(!SshError::AuthenticationFailed("test".into()).is_retryable());
    assert!(!SshError::FileNotFound("test".into()).is_retryable());
}
