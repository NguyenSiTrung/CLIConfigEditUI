use super::{SshConnection, SshError, SshStatus};
use std::process::{Command, Stdio};
use std::time::Duration;

const DEFAULT_TIMEOUT_SECS: u64 = 10;

pub fn ssh_test_connection(conn: &SshConnection) -> SshStatus {
    let result = run_ssh_command(conn, "echo ok", DEFAULT_TIMEOUT_SECS);
    match result {
        Ok(output) if output.trim() == "ok" => SshStatus::Connected,
        Ok(output) => SshStatus::Error(format!("Unexpected response: {}", output)),
        Err(e) => SshStatus::Error(e.to_string()),
    }
}

pub fn ssh_file_exists(conn: &SshConnection) -> Result<bool, SshError> {
    let cmd = format!(
        "test -f {} && echo 'exists' || echo 'not_exists'",
        shell_escape(&conn.path)
    );
    let output = run_ssh_command(conn, &cmd, DEFAULT_TIMEOUT_SECS)?;
    Ok(output.trim() == "exists")
}

pub fn ssh_read_file(conn: &SshConnection) -> Result<String, SshError> {
    let cmd = format!("cat {}", shell_escape(&conn.path));
    run_ssh_command(conn, &cmd, DEFAULT_TIMEOUT_SECS)
}

pub fn ssh_write_file(conn: &SshConnection, content: &str) -> Result<(), SshError> {
    let target = conn.ssh_target();
    let mut args = conn.ssh_args();
    args.push(target);

    let cmd = format!(
        "cat > {}",
        shell_escape(&conn.path)
    );
    args.push(cmd);

    let mut child = Command::new("ssh")
        .args(&args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    if let Some(ref mut stdin) = child.stdin {
        use std::io::Write;
        stdin.write_all(content.as_bytes())?;
    }

    let output = child.wait_with_output()?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(parse_ssh_error(&stderr))
    }
}

pub fn ssh_backup_file(conn: &SshConnection) -> Result<String, SshError> {
    let backup_path = format!("{}.bak", conn.path);
    let cmd = format!(
        "cp {} {}",
        shell_escape(&conn.path),
        shell_escape(&backup_path)
    );
    run_ssh_command(conn, &cmd, DEFAULT_TIMEOUT_SECS)?;
    Ok(backup_path)
}

fn run_ssh_command(conn: &SshConnection, remote_cmd: &str, timeout_secs: u64) -> Result<String, SshError> {
    let target = conn.ssh_target();
    let mut args = conn.ssh_args();
    args.push("-o".to_string());
    args.push(format!("ConnectTimeout={}", timeout_secs));
    args.push(target);
    args.push(remote_cmd.to_string());

    let output = Command::new("ssh")
        .args(&args)
        .output()?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(parse_ssh_error(&stderr))
    }
}

fn parse_ssh_error(stderr: &str) -> SshError {
    let stderr_lower = stderr.to_lowercase();
    
    if stderr_lower.contains("permission denied") || stderr_lower.contains("publickey") {
        SshError::AuthenticationFailed(stderr.to_string())
    } else if stderr_lower.contains("no such file") || stderr_lower.contains("not found") {
        SshError::FileNotFound(stderr.to_string())
    } else if stderr_lower.contains("connection refused") 
        || stderr_lower.contains("could not resolve") 
        || stderr_lower.contains("connection timed out")
        || stderr_lower.contains("network is unreachable")
    {
        SshError::ConnectionFailed(stderr.to_string())
    } else if stderr_lower.contains("timed out") {
        SshError::Timeout(DEFAULT_TIMEOUT_SECS)
    } else {
        SshError::CommandFailed(stderr.to_string())
    }
}

fn shell_escape(s: &str) -> String {
    format!("'{}'", s.replace('\'', "'\"'\"'"))
}

pub fn ssh_read_file_with_retry(
    conn: &SshConnection,
    max_attempts: u32,
) -> Result<String, SshError> {
    let mut last_error = None;
    let mut delay = Duration::from_millis(500);

    for attempt in 0..max_attempts {
        match ssh_read_file(conn) {
            Ok(content) => return Ok(content),
            Err(e) => {
                if e.is_retryable() && attempt < max_attempts - 1 {
                    std::thread::sleep(delay);
                    delay *= 2;
                    last_error = Some(e);
                } else {
                    return Err(e);
                }
            }
        }
    }

    Err(last_error.unwrap_or_else(|| SshError::CommandFailed("Unknown error".into())))
}

pub fn ssh_write_file_with_retry(
    conn: &SshConnection,
    content: &str,
    max_attempts: u32,
) -> Result<(), SshError> {
    let mut last_error = None;
    let mut delay = Duration::from_millis(500);

    for attempt in 0..max_attempts {
        match ssh_write_file(conn, content) {
            Ok(()) => return Ok(()),
            Err(e) => {
                if e.is_retryable() && attempt < max_attempts - 1 {
                    std::thread::sleep(delay);
                    delay *= 2;
                    last_error = Some(e);
                } else {
                    return Err(e);
                }
            }
        }
    }

    Err(last_error.unwrap_or_else(|| SshError::CommandFailed("Unknown error".into())))
}
