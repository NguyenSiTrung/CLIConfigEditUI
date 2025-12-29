mod commands;
mod connection;
mod error;
mod operations;

pub use commands::{
    backup_remote_config, check_remote_connection, check_remote_file_exists, parse_ssh_path,
    read_remote_config, test_ssh_host, write_remote_config,
};
pub use connection::{SshConnection, SshStatus};
pub use error::SshError;

#[cfg(test)]
mod tests;
