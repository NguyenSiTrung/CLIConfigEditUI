mod commands;
mod config;
mod mcp;
mod versions;

use commands::{
    check_multiple_paths, delete_file, file_exists, get_current_os, get_tools, list_backups, read_backup,
    read_file, read_json_path, read_json_prefix, resolve_path, restore_backup, write_file, write_json_path, write_json_prefix,
};
use mcp::{
    get_mcp_config, save_mcp_config, set_mcp_source_mode, get_mcp_source_servers,
    save_app_mcp_servers, add_mcp_server, update_mcp_server, remove_mcp_server,
    read_claude_mcp_servers, get_tool_mcp_servers, get_mcp_tool_statuses, set_tool_mcp_enabled,
    preview_mcp_sync, preview_mcp_sync_all, sync_mcp_to_tool, sync_mcp_to_all,
    preview_mcp_config_content, import_mcp_config_file,
};
use versions::{
    save_version, list_versions, load_version, delete_version, update_version_metadata,
    duplicate_version, get_default_version, update_version_content,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_tools,
            get_current_os,
            read_file,
            write_file,
            read_json_path,
            read_json_prefix,
            write_json_path,
            write_json_prefix,
            file_exists,
            check_multiple_paths,
            resolve_path,
            delete_file,
            list_backups,
            read_backup,
            restore_backup,
            // Version commands
            save_version,
            list_versions,
            load_version,
            delete_version,
            update_version_metadata,
            update_version_content,
            duplicate_version,
            get_default_version,
            // MCP commands
            get_mcp_config,
            save_mcp_config,
            set_mcp_source_mode,
            get_mcp_source_servers,
            save_app_mcp_servers,
            add_mcp_server,
            update_mcp_server,
            remove_mcp_server,
            read_claude_mcp_servers,
            get_tool_mcp_servers,
            get_mcp_tool_statuses,
            set_tool_mcp_enabled,
            preview_mcp_sync,
            preview_mcp_sync_all,
            sync_mcp_to_tool,
            sync_mcp_to_all,
            preview_mcp_config_content,
            import_mcp_config_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
