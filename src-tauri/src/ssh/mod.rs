#[allow(dead_code)]
mod commands;
#[allow(dead_code)]
mod connection;
#[allow(dead_code)]
mod error;
#[allow(dead_code)]
mod operations;

pub use commands::{
    backup_remote_config, check_remote_connection, check_remote_file_exists, parse_ssh_path,
    read_remote_config, test_ssh_host, write_remote_config,
};
pub use connection::{SshConnection, SshStatus};
pub use error::SshError;

#[cfg(test)]
mod tests;
